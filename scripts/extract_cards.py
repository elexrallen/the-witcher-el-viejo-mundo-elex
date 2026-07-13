#!/usr/bin/env python3
"""Extrae cartas de exploración y eventos del mod de Tabletop Simulator."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys
from dataclasses import dataclass, field
from io import BytesIO
from pathlib import Path
from typing import Any

import requests
from PIL import Image

os.environ.setdefault("PYTHONUTF8", "1")
os.environ.setdefault("PYTHONIOENCODING", "utf-8")

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_MOD = ROOT / "data" / "source" / "tts-mod.json"
IMAGES_DIR = ROOT / "data" / "images"
OUTPUT_DIR = ROOT / "data" / "output"

CARD_KEYWORDS = re.compile(r"evento|exploraci[oó]n", re.IGNORECASE)
SKIP_KEYWORDS = re.compile(
    r"monstruo|monster|lucha|fight|accion|action|investigaci[oó]n|quest|misi[oó]n|"
    r"personaje|character|equipo|equipment|trofeo|trophy|token|ficha",
    re.IGNORECASE,
)


@dataclass
class DeckInfo:
    deck_id: str
    face_url: str
    back_url: str
    num_width: int
    num_height: int


@dataclass
class CardRef:
    card_id: int
    deck_id: str
    index: int
    deck_name: str
    deck_type: str
    nickname: str = ""
    guid: str = ""


@dataclass
class DeckCollection:
    name: str
    deck_type: str
    card_ids: list[int] = field(default_factory=list)


@dataclass
class ExtractionState:
    decks: dict[str, DeckInfo] = field(default_factory=dict)
    collections: list[DeckCollection] = field(default_factory=list)
    cards: dict[int, CardRef] = field(default_factory=dict)


def classify_deck_type(name: str) -> str:
    lowered = name.lower()
    if "explor" in lowered:
        return "exploration"
    if "conjunto de aventuras" in lowered and ("ciudad" in lowered or "naturaleza" in lowered):
        return "exploration"
    if "evento" in lowered:
        return "event"
    return "unknown"


def should_include_deck(name: str) -> bool:
    if not name or SKIP_KEYWORDS.search(name):
        return False
    if CARD_KEYWORDS.search(name):
        return True
    if re.search(r"conjunto de aventuras", name, re.I):
        return bool(re.search(r"ciudad|naturaleza", name, re.I))
    return False


def parse_card_id(card_id: int) -> tuple[str, int]:
    deck_id = str(card_id)[:-2]
    index = int(str(card_id)[-2:])
    return deck_id, index


def merge_custom_deck(state: ExtractionState, custom_deck: dict[str, Any]) -> None:
    for deck_id, info in custom_deck.items():
        if deck_id not in state.decks:
            state.decks[deck_id] = DeckInfo(
                deck_id=deck_id,
                face_url=info["FaceURL"],
                back_url=info.get("BackURL", ""),
                num_width=int(info["NumWidth"]),
                num_height=int(info["NumHeight"]),
            )


def register_card(state: ExtractionState, card_id: int, deck_name: str) -> CardRef:
    deck_id, index = parse_card_id(card_id)
    deck_type = classify_deck_type(deck_name)
    ref = CardRef(
        card_id=card_id,
        deck_id=deck_id,
        index=index,
        deck_name=deck_name,
        deck_type=deck_type,
    )
    state.cards.setdefault(card_id, ref)
    return ref


def walk_object(state: ExtractionState, obj: dict[str, Any]) -> None:
    obj_type = obj.get("Name", "")

    if obj_type == "DeckCustom":
        deck_name = obj.get("Nickname", "")
        if should_include_deck(deck_name):
            merge_custom_deck(state, obj.get("CustomDeck", {}))
            card_ids = [int(card_id) for card_id in obj.get("DeckIDs", [])]
            collection = DeckCollection(
                name=deck_name,
                deck_type=classify_deck_type(deck_name),
                card_ids=card_ids,
            )
            state.collections.append(collection)
            for card_id in card_ids:
                register_card(state, card_id, deck_name)

    for child in obj.get("ContainedObjects", []) or []:
        walk_object(state, child)


def parse_mod(mod_path: Path) -> ExtractionState:
    with mod_path.open("r", encoding="utf-8") as handle:
        data = json.load(handle)

    state = ExtractionState()
    for obj in data.get("ObjectStates", []):
        walk_object(state, obj)
    return state


def sheet_cache_path(url: str) -> Path:
    digest = hashlib.md5(url.encode("utf-8")).hexdigest()[:12]
    suffix = Path(url.split("?")[0]).suffix or ".jpg"
    return IMAGES_DIR / "sheets" / f"{digest}{suffix}"


def card_image_path(card: CardRef) -> Path:
    return IMAGES_DIR / "cards" / card.deck_type / f"{card.card_id}.jpg"


def download_sheet(url: str, session: requests.Session) -> Image.Image:
    cache = sheet_cache_path(url)
    cache.parent.mkdir(parents=True, exist_ok=True)
    if cache.exists():
        return Image.open(cache).convert("RGB")

    response = session.get(url, timeout=60)
    response.raise_for_status()
    cache.write_bytes(response.content)
    return Image.open(BytesIO(response.content)).convert("RGB")


def crop_card(sheet: Image.Image, deck: DeckInfo, index: int) -> Image.Image:
    width, height = sheet.size
    col = index % deck.num_width
    row = index // deck.num_width
    cell_w = width / deck.num_width
    cell_h = height / deck.num_height
    left = int(col * cell_w)
    top = int(row * cell_h)
    right = int((col + 1) * cell_w)
    bottom = int((row + 1) * cell_h)
    return sheet.crop((left, top, right, bottom))


def ensure_card_image(
    card: CardRef,
    decks: dict[str, DeckInfo],
    session: requests.Session,
) -> Path:
    output = card_image_path(card)
    output.parent.mkdir(parents=True, exist_ok=True)
    if output.exists():
        return output

    deck = decks.get(card.deck_id)
    if deck is None:
        raise KeyError(f"No se encontró definición del mazo {card.deck_id} para la carta {card.card_id}")

    sheet = download_sheet(deck.face_url, session)
    cropped = crop_card(sheet, deck, card.index)
    cropped.save(output, quality=92)
    return output


def run_ocr(image_path: Path, reader: Any) -> str:
    results = reader.readtext(str(image_path), detail=0, paragraph=True)
    return "\n".join(part.strip() for part in results if part.strip())


def slugify(value: str) -> str:
    value = value.lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


def build_output(state: ExtractionState, ocr_results: dict[int, str]) -> dict[str, Any]:
    decks_output = []

    for collection in state.collections:
        cards_output = []
        for position, card_id in enumerate(collection.card_ids):
            card = state.cards[card_id]
            cards_output.append(
                {
                    "position": position + 1,
                    "card_id": card.card_id,
                    "index": card.index,
                    "deck_key": card.deck_id,
                    "image": str(card_image_path(card).relative_to(ROOT)).replace("\\", "/"),
                    "text": ocr_results.get(card.card_id, ""),
                }
            )

        decks_output.append(
            {
                "id": slugify(collection.name),
                "name": collection.name,
                "type": collection.deck_type,
                "card_count": len(cards_output),
                "cards": cards_output,
            }
        )

    return {
        "game": "The Witcher: El Viejo Mundo",
        "source": "Tabletop Simulator mod 3135706374",
        "language": "es",
        "deck_count": len(decks_output),
        "unique_cards": len(state.cards),
        "decks": decks_output,
    }


def print_summary(state: ExtractionState) -> None:
    print(f"Mazos detectados: {len(state.collections)}")
    print(f"Cartas únicas (imágenes): {len(state.cards)}")
    for collection in state.collections:
        print(f"  - {collection.name}: {len(collection.card_ids)}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--mod", type=Path, default=DEFAULT_MOD)
    parser.add_argument("--skip-ocr", action="store_true", help="Solo extrae imágenes y metadatos")
    parser.add_argument("--limit", type=int, default=0, help="Limitar cartas para pruebas")
    parser.add_argument("--output", type=Path, default=OUTPUT_DIR / "cartas.json")
    args = parser.parse_args()

    if not args.mod.exists():
        print(f"No se encontró el mod: {args.mod}", file=sys.stderr)
        return 1

    print(f"Parseando {args.mod}...")
    state = parse_mod(args.mod)
    print_summary(state)

    cards = list(state.cards.values())
    if args.limit > 0:
        cards = cards[: args.limit]

    session = requests.Session()
    session.headers.update({"User-Agent": "witcher-card-extractor/1.0"})

    print("Descargando y recortando cartas...")
    for idx, card in enumerate(cards, start=1):
        ensure_card_image(card, state.decks, session)
        if idx % 25 == 0 or idx == len(cards):
            print(f"  {idx}/{len(cards)} imágenes listas")

    ocr_results: dict[int, str] = {}
    if args.output.exists() and not args.skip_ocr:
        try:
            existing = json.loads(args.output.read_text(encoding="utf-8"))
            for deck in existing.get("decks", []):
                for card in deck.get("cards", []):
                    text = card.get("text", "").strip()
                    if text:
                        ocr_results[int(card["card_id"])] = text
            if ocr_results:
                print(f"Reutilizando OCR previo de {len(ocr_results)} cartas")
        except (json.JSONDecodeError, KeyError, TypeError, ValueError):
            pass

    if not args.skip_ocr:
        print("Ejecutando OCR (esto puede tardar varios minutos)...")
        import easyocr

        reader = easyocr.Reader(["es"], gpu=False, verbose=False)
        pending = [card for card in cards if not ocr_results.get(card.card_id)]
        for idx, card in enumerate(pending, start=1):
            image_path = card_image_path(card)
            ocr_results[card.card_id] = run_ocr(image_path, reader)
            if idx % 10 == 0 or idx == len(pending):
                print(f"  OCR {idx}/{len(pending)}")
                payload = build_output(state, ocr_results)
                args.output.write_text(
                    json.dumps(payload, ensure_ascii=False, indent=2),
                    encoding="utf-8",
                )

    payload = build_output(state, ocr_results)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2)

    metadata_path = args.output.with_name("cartas-metadata.json")
    with metadata_path.open("w", encoding="utf-8") as handle:
        json.dump(
            {
                "decks": {
                    deck_id: {
                        "face_url": deck.face_url,
                        "back_url": deck.back_url,
                        "num_width": deck.num_width,
                        "num_height": deck.num_height,
                    }
                    for deck_id, deck in state.decks.items()
                },
                "collections": [
                    {
                        "name": collection.name,
                        "type": collection.deck_type,
                        "card_ids": collection.card_ids,
                    }
                    for collection in state.collections
                ],
            },
            handle,
            ensure_ascii=False,
            indent=2,
        )

    print(f"JSON generado: {args.output}")
    print(f"Metadatos: {metadata_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
