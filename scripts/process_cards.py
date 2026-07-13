#!/usr/bin/env python3
"""Corrige OCR, re-extrae cartas mal recortadas y estructura el JSON final."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys
from dataclasses import dataclass
from io import BytesIO
from pathlib import Path
from typing import Any

import requests
from PIL import Image

os.environ.setdefault("PYTHONUTF8", "1")
os.environ.setdefault("PYTHONIOENCODING", "utf-8")

ROOT = Path(__file__).resolve().parents[1]
MOD_PATH = ROOT / "data" / "source" / "tts-mod.json"
INPUT_PATH = ROOT / "data" / "output" / "cartas.json"
OUTPUT_PATH = ROOT / "data" / "output" / "cartas-estructuradas.json"
IMAGES_DIR = ROOT / "data" / "images" / "cards"

CARD_KEYWORDS = re.compile(r"evento|exploraci[oó]n", re.IGNORECASE)
SKIP_KEYWORDS = re.compile(
    r"monstruo|monster|lucha|fight|accion|action|investigaci[oó]n|quest|misi[oó]n|"
    r"personaje|character|equipo|equipment|trofeo|trophy|token|ficha",
    re.IGNORECASE,
)

EXPANSIONS: dict[str, dict[str, str]] = {
    "base": {
        "id": "base",
        "name": "El Viejo Mundo",
        "name_en": "The Witcher: Old World",
        "kind": "base",
    },
    "adventure-pack": {
        "id": "adventure-pack",
        "name": "Pack de Aventuras",
        "name_en": "Adventure Pack",
        "kind": "expansion",
    },
    "wild-hunt": {
        "id": "wild-hunt",
        "name": "Cacería Salvaje",
        "name_en": "Wild Hunt",
        "kind": "expansion",
    },
    "skellige": {
        "id": "skellige",
        "name": "Skellige",
        "name_en": "Skellige",
        "kind": "expansion",
    },
}

DECK_EXPANSION_MAP: dict[str, str] = {
    "eventos": "base",
    "exploraci-n-ciudad": "base",
    "exploraci-n-naturaleza": "base",
    "eventos-del-conjunto-de-aventuras": "adventure-pack",
    "ciudad-del-conjunto-de-aventuras": "adventure-pack",
    "naturaleza-del-conjunto-de-aventuras": "adventure-pack",
    "eventos-cacer-a-salvaje": "wild-hunt",
    "exploraci-n-fase-i-cacer-a-salvaje": "wild-hunt",
    "exploraci-n-fase-ii-cacer-a-salvaje": "wild-hunt",
    "eventos-skellige": "skellige",
    "exploraci-n-skellige": "skellige",
}

EFFECT_PATTERNS = [
    r"Obtén\s+\d+\s+de\s+Oro",
    r"Pierdes\s+\d+\s+de\s+Oro",
    r"Gana[n]?\s+\d+\s+Rastro",
    r"Obtén\s+\d+\s+Rastro",
    r"aumenta(?:s)?\s+(?:tu\s+)?nivel\s+de\s+\w+",
    r"aumenta\s+el\s+nivel\s+de\s+cualquier\s+Atributo",
    r"reduce(?:s)?\s+tu\s+nivel\s+de\s+\w+",
    r"Durante\s+la\s+Fase\s+III[^.]*",
    r"roba\s+\d+\s+carta[s]?[^.]*",
    r"La\s+Cacería\s+Salvaje\s+pierde\s+\d+\s+Escudos?",
    r"Cada\s+Jugador[^.]*",
    r"Deja\s+esta\s+carta\s+delante\s+de\s+ti[^.]*",
    r"Quema\s+\d+\s+carta[^.]*",
    r"inflige\s+\d+\s+de\s+Daño",
]


@dataclass
class SheetInfo:
    face_url: str
    num_width: int
    num_height: int


@dataclass
class CardContext:
    collection: str
    collection_id: str
    card_id: int
    deck_key: str
    index: int
    card_type: str
    sheet: SheetInfo


def get_expansion(deck_slug: str) -> dict[str, str]:
    expansion_id = DECK_EXPANSION_MAP.get(deck_slug, "base")
    return EXPANSIONS[expansion_id]


def slugify(value: str) -> str:
    value = value.lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


def classify_type(name: str) -> str:
    lowered = name.lower()
    if "explor" in lowered:
        return "exploration"
    if "conjunto de aventuras" in lowered and ("ciudad" in lowered or "naturaleza" in lowered):
        return "exploration"
    return "event"


def should_include_deck(name: str) -> bool:
    if not name or SKIP_KEYWORDS.search(name):
        return False
    if CARD_KEYWORDS.search(name):
        return True
    if re.search(r"conjunto de aventuras", name, re.I):
        return bool(re.search(r"ciudad|naturaleza", name, re.I))
    return False


def parse_card_id(card_id: int) -> tuple[str, int]:
    deck_key = str(card_id)[:-2]
    index = int(str(card_id)[-2:])
    return deck_key, index


def walk_collections(obj: dict[str, Any], out: list[dict[str, Any]]) -> None:
    if obj.get("Name") == "DeckCustom":
        name = obj.get("Nickname", "")
        if should_include_deck(name):
            out.append(
                {
                    "name": name,
                    "id": slugify(name),
                    "type": classify_type(name),
                    "custom_deck": obj.get("CustomDeck", {}),
                    "card_ids": [int(x) for x in obj.get("DeckIDs", [])],
                }
            )
    for child in obj.get("ContainedObjects", []) or []:
        walk_collections(child, out)


def load_collections(mod_path: Path) -> list[dict[str, Any]]:
    data = json.loads(mod_path.read_text(encoding="utf-8"))
    collections: list[dict[str, Any]] = []
    for obj in data.get("ObjectStates", []):
        walk_collections(obj, collections)
    return collections


def sheet_cache_path(url: str) -> Path:
    digest = hashlib.md5(url.encode("utf-8")).hexdigest()[:12]
    suffix = Path(url.split("?")[0]).suffix or ".jpg"
    return ROOT / "data" / "images" / "sheets" / f"{digest}{suffix}"


def download_sheet(url: str, session: requests.Session) -> Image.Image:
    cache = sheet_cache_path(url)
    cache.parent.mkdir(parents=True, exist_ok=True)
    if cache.exists():
        return Image.open(cache).convert("RGB")
    response = session.get(url, timeout=60)
    response.raise_for_status()
    cache.write_bytes(response.content)
    return Image.open(BytesIO(response.content)).convert("RGB")


def crop_card(sheet: Image.Image, info: SheetInfo, index: int) -> Image.Image:
    width, height = sheet.size
    col = index % info.num_width
    row = index // info.num_width
    cell_w = width / info.num_width
    cell_h = height / info.num_height
    left = int(col * cell_w)
    top = int(row * cell_h)
    right = int((col + 1) * cell_w)
    bottom = int((row + 1) * cell_h)
    return sheet.crop((left, top, right, bottom))


def image_path(ctx: CardContext) -> Path:
    return IMAGES_DIR / ctx.collection_id / f"{ctx.card_id}.jpg"


def build_contexts(collections: list[dict[str, Any]]) -> list[CardContext]:
    contexts: list[CardContext] = []
    for collection in collections:
        sheets: dict[str, SheetInfo] = {}
        for deck_key, info in collection["custom_deck"].items():
            sheets[deck_key] = SheetInfo(
                face_url=info["FaceURL"],
                num_width=int(info["NumWidth"]),
                num_height=int(info["NumHeight"]),
            )
        for card_id in collection["card_ids"]:
            deck_key, index = parse_card_id(card_id)
            sheet = sheets.get(deck_key)
            if sheet is None:
                continue
            contexts.append(
                CardContext(
                    collection=collection["name"],
                    collection_id=collection["id"],
                    card_id=card_id,
                    deck_key=deck_key,
                    index=index,
                    card_type=collection["type"],
                    sheet=sheet,
                )
            )
    return contexts


def ensure_image(ctx: CardContext, session: requests.Session, force: bool = False) -> Path:
    path = image_path(ctx)
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists() and not force:
        return path
    sheet = download_sheet(ctx.sheet.face_url, session)
    crop_card(sheet, ctx.sheet, ctx.index).save(path, quality=92)
    return path


def run_ocr(path: Path, reader: Any) -> str:
    results = reader.readtext(str(path), detail=0, paragraph=True)
    return "\n".join(part.strip() for part in results if part.strip())


def fix_hyphenation(text: str) -> str:
    return re.sub(r"(\w)-\s+(\w)", r"\1\2", text)


def clean_ocr_text(text: str) -> str:
    if not text:
        return ""
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = fix_hyphenation(text)

    replacements = [
        (r"\bIll\b", "III"),
        (r"\bIlI\b", "III"),
        (r"\bFase Ill\b", "Fase III"),
        (r"\bFase IlI\b", "Fase III"),
        (r"\bFase Il\b", "Fase II"),
        (r"\bIleva\b", "lleva"),
        (r"\bIlega\b", "llega"),
        (r"\bIlegan\b", "llegan"),
        (r"\bIlevar\b", "llevar"),
        (r"\bIlegó\b", "llegó"),
        (r"\bIlegas\b", "llegas"),
        (r"\bIlegar\b", "llegar"),
        (r"\bIlegarían\b", "llegarían"),
        (r"\bIlegarán\b", "llegarán"),
        (r"\bIlevan\b", "llevan"),
        (r"\b¡dentifican\b", "identifican"),
        (r"\b¡nterior\b", "interior"),
        (r"\b¡nflige\b", "inflige"),
        (r"\b¡nmediatamente\b", "inmediatamente"),
        (r"\bIas\b", "las"),
        (r"\bIos\b", "los"),
        (r"\bIloran\b", "lloran"),
        (r"\bIle\b", "lle"),
        (r"\bIleva\b", "lleva"),
        (r"\bIlevar\b", "llevar"),
        (r"\bIlegó\b", "llegó"),
        (r"\bIlegas\b", "llegas"),
        (r"\bIlegar\b", "llegar"),
        (r"\bIlegarían\b", "llegarían"),
        (r"\bIlegarán\b", "llegarán"),
        (r"\bmura-\s*Ilas\b", "murallas"),
        (r"\béI\b", "él"),
        (r"\bVOz\b", "voz"),
        (r"\bQQué\b", "¿Qué"),
        (r"\bceh\?\b", "¿eh?"),
        (r"\bceh,\b", "¿eh,"),
        (r"\bañosy\b", "años y"),
        (r"\bmuraIlas\b", "murallas"),
        (r"\b808A\b", "A"),
        (r"\b0\s+(Propusiste|Algunas)\b", r"A \1"),
        (r"\bYespero\b", "Y espero"),
        (r"\bJugadore\b", "Jugador"),
        (r"\bSólo\b", "Solo"),
        (r"\bsólo\b", "solo"),
        (r"\bEquipaMIENTO\b", "EQUIPAMIENTO"),
        (r"\bBallESTA\b", "BALLESTA"),
        (r"\b808-?\b", ""),
        (r"\b08\b", ""),
        (r"\s+_\s*", ". "),
        (r"_\s*$", "."),
        (r"-\s*$", ""),
        (r";\s*", "; "),
        (r"\s{2,}", " "),
        (r"\n{3,}", "\n\n"),
    ]
    for pattern, repl in replacements:
        text = re.sub(pattern, repl, text)

    interjection_patterns = [
        r'\bi([Ss]igo\b)',
        r'\bi([Nn]o\s+sabes)',
        r'\bi([Nn]o\s+)',
        r'\bi([Vv]en\s)',
        r'\bi([Bb]uen\s)',
        r'\bi([Hh]abla)',
        r'\bi([Yy]\s+cuando)',
        r'\bi([Yy]\s+)',
        r'\bi([Ss]i\s+sois)',
        r'"i([Bb]uen)',
        r'"i([Ss]i\s)',
    ]
    for pattern in interjection_patterns:
        text = re.sub(pattern, r"¡\1", text)

    text = re.sub(r'\?"', '?"', text)
    text = re.sub(r'\?\s*i', "¿", text)
    text = re.sub(r'([A-Za-záéíóúñ])\?\s*([A-ZÁÉÍÓÚÑ])', r"\1? \2", text)
    text = re.sub(r"(\d+)\s+0\s+(menos|más|ahuyentas)", r"\1 o \2", text)
    text = re.sub(r"(\w)\s+0\s+(\w)", r"\1 o \2", text)
    text = re.sub(r"material 0 sustancia", "material o sustancia", text)
    text = re.sub(r"2 'Jugadores", "2 Jugadores", text)
    text = re.sub(r"Rastro cualquiera-", "Rastro cualquiera.", text)
    text = re.sub(r"petición-", "petición.", text)
    text = re.sub(r"Combate-", "Combate,", text)
    text = re.sub(r"Turno de Combate-", "Turno de Combate,", text)
    text = re.sub(r"Escu-\s*dos", "Escudos", text)
    text = re.sub(r"Mons-\s*truo", "Monstruo", text)
    text = re.sub(r"com-\s*parten", "comparten", text)
    text = re.sub(r"de-\s*saparece", "desaparece", text)
    text = re.sub(r"es-\s* fuerzos", "esfuerzos", text)
    text = re.sub(r"cos-\s*tado", "costado", text)
    text = re.sub(r"me-\s*nos", "menos", text)
    text = re.sub(r"in-\s*forma", "informa", text)
    text = re.sub(r"sa-\s*cerdotes", "sacerdotes", text)
    text = re.sub(r"ex-\s*presión", "expresión", text)
    text = re.sub(r"mien-\s*tras", "mientras", text)
    text = re.sub(r"acu-\s*den", "acuden", text)
    text = re.sub(r"com-\s*promiso", "compromiso", text)
    text = re.sub(r"resul-\s*tado", "resultado", text)
    text = re.sub(r"sema-\s*nas", "semanas", text)
    text = re.sub(r"descono-\s*cidas", "desconocidas", text)
    text = re.sub(r"Aban-\s*donáis", "Abandonáis", text)
    text = re.sub(r"con-\s*flictos", "conflictos", text)
    text = re.sub(r"im-\s*plica", "implica", text)
    text = re.sub(r"lo-\s*grado", "logrado", text)
    text = re.sub(r"Escudo-\s*", "Escudo.", text)
    text = re.sub(r"quedartel", "quedarte!", text)
    text = re.sub(r"cualquiera(\d)", r"cualquiera.\n\1", text)
    text = re.sub(r"Combateinflige", "Combate, inflige", text)

    return text.strip()


def extract_effects(text: str) -> list[str]:
    effects: list[str] = []
    for pattern in EFFECT_PATTERNS:
        for match in re.finditer(pattern, text, flags=re.IGNORECASE):
            snippet = match.group(0).strip()
            if snippet not in effects:
                effects.append(snippet)
    return effects


def normalize_exploration_markers(text: str) -> str:
    text = re.sub(r"\sA\s+(?=Antes|Al |La |El |Los |Las |Poco|Ningún|Después|Cuando|Si )", "\nA ", text)
    text = re.sub(r"\sB\s+(?=Poco|La |El |Los |Las |Ningún|Después|Cuando|Si |\"Tengo)", "\nB ", text)
    return text


def split_choices(intro: str) -> tuple[str, str | None, str | None]:
    intro = intro.strip()
    if not intro:
        return "", None, None

    match = re.search(r"(.+?)\s*B\)\s*(.+)$", intro, flags=re.DOTALL)
    if match:
        left = match.group(1).strip()
        choice_b = match.group(2).strip()
        left_lines = [line.strip() for line in left.split("\n") if line.strip()]
        if len(left_lines) >= 2:
            return "\n".join(left_lines[:-1]).strip(), left_lines[-1], choice_b
        sentences = re.split(r"(?<=[.!?])\s+", left)
        sentences = [s.strip() for s in sentences if s.strip()]
        if len(sentences) >= 2:
            return " ".join(sentences[:-1]).strip(), sentences[-1], choice_b
        return left, None, choice_b

    underscore = re.search(r"(.+?)_\s+([A-ZÁÉÍÓÚ¡¿\"].+)$", intro, flags=re.DOTALL)
    if underscore:
        left = underscore.group(1).strip()
        choice_b = underscore.group(2).strip()
        sentences = re.split(r"(?<=[.!?])\s+", left)
        sentences = [s.strip() for s in sentences if s.strip()]
        if len(sentences) >= 2:
            return " ".join(sentences[:-1]).strip(), sentences[-1], choice_b
        lines = [line.strip() for line in left.split("\n") if line.strip()]
        if len(lines) >= 2:
            return "\n".join(lines[:-1]).strip(), lines[-1], choice_b

    lines = [line.strip() for line in intro.split("\n") if line.strip()]
    if len(lines) >= 3:
        return "\n".join(lines[:-2]).strip(), lines[-2], lines[-1]
    if len(lines) == 2:
        return "", lines[0], lines[1]

    sentences = re.split(r"(?<=[.!?])\s+", intro)
    sentences = [s.strip() for s in sentences if s.strip()]
    if len(sentences) >= 4:
        return " ".join(sentences[:-2]).strip(), sentences[-2], sentences[-1]
    if len(sentences) >= 3:
        return " ".join(sentences[:-2]).strip(), sentences[-2], sentences[-1]
    if len(sentences) == 2:
        return "", sentences[0], sentences[1]

    return intro, None, None


def parse_exploration(text: str) -> dict[str, Any]:
    cleaned = normalize_exploration_markers(clean_ocr_text(text))

    outcome_b_match = re.search(r"(?:^|\n)B\s+(?=[A-ZÁÉÍÓÚ¿¡\"'])", cleaned)
    if outcome_b_match:
        before_b = cleaned[: outcome_b_match.start()].strip()
        outcome_b = re.sub(r"^B\s+", "", cleaned[outcome_b_match.start() :].strip())
    else:
        before_b = cleaned
        outcome_b = ""

    outcome_a_match = re.search(
        r'(?:\n|^)(?:"|A\s)(?=[A-ZÁÉÍÓÚ¿¡"])',
        before_b,
    )
    if not outcome_a_match:
        outcome_a_match = re.search(r"(?:^|\n)A\s+(?=[A-ZÁÉÍÓÚ¿¡\"'])", before_b)

    if outcome_a_match:
        intro_block = before_b[: outcome_a_match.start()].strip()
        outcome_a = before_b[outcome_a_match.start() :].strip()
        outcome_a = re.sub(r"^A\s+", "", outcome_a)
        outcome_a = outcome_a.lstrip('"')
    else:
        split_choices_outcomes = re.search(
            r"(.+?)\s*B\)\s*(.+?)(?=\s*\"|\s*A\s|\nB\s)",
            before_b,
            flags=re.DOTALL,
        )
        if split_choices_outcomes:
            intro_block = split_choices_outcomes.group(0).strip()
            remaining = before_b[split_choices_outcomes.end() :].strip()
            quote_match = re.search(r'^"([^"]*)"?\s*(.*)$', remaining, flags=re.DOTALL)
            if quote_match:
                outcome_a = (quote_match.group(1) + quote_match.group(2)).strip()
            else:
                outcome_a = remaining
        else:
            intro_block = before_b
            outcome_a = ""

    intro, choice_a, choice_b = split_choices(intro_block)

    result = {
        "format": "choices",
        "intro": intro,
        "choice_a": choice_a,
        "choice_b": choice_b,
        "outcome_a": outcome_a or None,
        "outcome_b": outcome_b or None,
        "effects_a": extract_effects(outcome_a),
        "effects_b": extract_effects(outcome_b),
    }

    if choice_a and choice_b and outcome_a and outcome_b:
        result["parse_status"] = "ok"
        return result

    paragraphs = [p.strip() for p in re.split(r"\n+", cleaned) if p.strip()]
    result.update(
        {
            "format": "narrative",
            "body": cleaned,
            "paragraphs": paragraphs,
            "effects": extract_effects(cleaned),
            "parse_status": "narrative",
        }
    )
    return result


def parse_event(text: str) -> dict[str, Any]:
    cleaned = clean_ocr_text(text)
    paragraphs = [p.strip() for p in re.split(r"\n+", cleaned) if p.strip()]

    options: list[dict[str, str]] = []
    for match in re.finditer(r"(?:^|\n)([AB])\)\s*(.+?)(?=(?:\n[AB]\)|$))", cleaned, flags=re.DOTALL):
        options.append({"id": match.group(1), "text": match.group(2).strip()})

    if not options:
        for match in re.finditer(r"(?:^|\n)([AB])\s+(?=[A-ZÁÉÍÓÚ¿¡\"'])", cleaned):
            start = match.end() - 1
            next_match = re.search(r"(?:^|\n)[AB]\s+(?=[A-ZÁÉÍÓÚ¿¡\"'])", cleaned[start + 1 :])
            end = start + 1 + next_match.start() if next_match else len(cleaned)
            options.append({"id": match.group(1), "text": cleaned[start:end].strip()})

    return {
        "format": "event",
        "paragraphs": paragraphs,
        "options": options,
        "effects": extract_effects(cleaned),
        "parse_status": "ok",
    }


def structure_card(card_type: str, text: str) -> dict[str, Any]:
    text = text or ""
    if not text.strip():
        return {"parse_status": "empty"}
    if card_type == "exploration":
        return parse_exploration(text)
    return parse_event(text)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, default=INPUT_PATH)
    parser.add_argument("--output", type=Path, default=OUTPUT_PATH)
    parser.add_argument("--reocr-empty", action="store_true", default=True,
                        help="Re-OCR solo cartas sin texto")
    parser.add_argument("--reocr-all", action="store_true", default=False,
                        help="Re-OCR todas las cartas")
    parser.add_argument("--force-recrop", action="store_true", default=False)
    parser.add_argument("--skip-images", action="store_true", default=False,
                        help="No recortar ni OCR; solo corregir y estructurar")
    args = parser.parse_args()

    if not args.input.exists():
        print(f"No existe {args.input}", file=sys.stderr)
        return 1

    collections = load_collections(MOD_PATH)
    contexts = build_contexts(collections)
    source = json.loads(args.input.read_text(encoding="utf-8"))
    structured_cache: dict[str, str] = {}
    if OUTPUT_PATH.exists() and not args.skip_images:
        cached = json.loads(OUTPUT_PATH.read_text(encoding="utf-8"))
        for deck in cached.get("decks", []):
            deck_slug = deck.get("id") or slugify(deck["name"])
            for card in deck.get("cards", []):
                key = f"{deck_slug}:{card['card_id']}"
                text = card.get("text_raw") or card.get("text") or ""
                if text.strip():
                    structured_cache[key] = text

    session = requests.Session()
    session.headers.update({"User-Agent": "witcher-card-processor/1.0"})

    text_by_key: dict[str, str] = {}
    reader = None

    print("Re-extraendo imágenes por mazo...")
    if args.skip_images:
        print("  Omitido (--skip-images)")
    for idx, ctx in enumerate(contexts, start=1):
        if not args.skip_images:
            path = ensure_image(ctx, session, force=args.force_recrop)
        key = f"{ctx.collection_id}:{ctx.card_id}"
        existing = text_by_key.get(key, "").strip()

        if existing:
            continue

        if args.skip_images and key in structured_cache:
            text_by_key[key] = structured_cache[key]
            continue

        old_global = structured_cache.get(key, "")
        for deck in source["decks"]:
            for card in deck["cards"]:
                if card["card_id"] == ctx.card_id and slugify(deck["name"]) == ctx.collection_id:
                    old_global = card.get("text", "").strip()
                    break
            if old_global:
                break
        if not old_global:
            for deck in source["decks"]:
                for card in deck["cards"]:
                    if card["card_id"] == ctx.card_id:
                        old_global = card.get("text", "").strip()
                        break
                if old_global:
                    break

        needs_ocr = not args.skip_images and (args.reocr_all or not old_global)
        if needs_ocr:
            if reader is None:
                print("Cargando OCR...")
                import easyocr

                reader = easyocr.Reader(["es"], gpu=False, verbose=False)
            text_by_key[key] = run_ocr(path, reader)
        else:
            text_by_key[key] = old_global

        if not args.skip_images and idx % 25 == 0:
            print(f"  {idx}/{len(contexts)} procesadas")

    print("Corrigiendo y estructurando...")
    output_decks = []
    stats = {"corrected": 0, "structured_ok": 0, "structured_partial": 0, "structured_narrative": 0, "empty": 0}

    EVENT_DECK_ORDER = [
        "eventos",
        "eventos-del-conjunto-de-aventuras",
        "eventos-skellige",
        "eventos-cacer-a-salvaje",
    ]
    EXPLORATION_DECK_ORDER = [
        "exploraci-n-ciudad",
        "ciudad-del-conjunto-de-aventuras",
        "exploraci-n-naturaleza",
        "naturaleza-del-conjunto-de-aventuras",
        "exploraci-n-skellige",
        "exploraci-n-fase-i-cacer-a-salvaje",
        "exploraci-n-fase-ii-cacer-a-salvaje",
    ]

    def deck_sort_key(deck: dict[str, Any], order: list[str]) -> tuple[int, str]:
        try:
            return (order.index(deck["id"]), deck["name"])
        except ValueError:
            return (len(order), deck["name"])

    def sort_cards(cards: list[dict[str, Any]]) -> list[dict[str, Any]]:
        ordered = sorted(cards, key=lambda card: (card.get("position", 0), card.get("card_id", 0)))
        for index, card in enumerate(ordered, start=1):
            card["position"] = index
        return ordered

    for deck in source["decks"]:
        deck_slug = slugify(deck["name"])
        expansion = get_expansion(deck_slug)
        cards_out = []
        for card in deck["cards"]:
            key = f"{deck_slug}:{card['card_id']}"
            raw = text_by_key.get(key, card.get("text", "")) or ""
            corrected = clean_ocr_text(raw)
            structured = structure_card(deck["type"], corrected)

            if corrected:
                stats["corrected"] += 1
            else:
                stats["empty"] += 1

            status = structured.get("parse_status", "partial")
            if status == "ok":
                stats["structured_ok"] += 1
            elif status == "narrative":
                stats["structured_narrative"] = stats.get("structured_narrative", 0) + 1
            elif status == "empty":
                pass
            else:
                stats["structured_partial"] += 1

            ctx_match = next(
                (c for c in contexts if c.collection_id == deck_slug and c.card_id == card["card_id"]),
                None,
            )
            image = (
                str(image_path(ctx_match).relative_to(ROOT)).replace("\\", "/")
                if ctx_match
                else card.get("image", "")
            )

            cards_out.append(
                {
                    "position": card["position"],
                    "card_id": card["card_id"],
                    "index": card["index"],
                    "deck_key": card["deck_key"],
                    "expansion": expansion,
                    "image": image,
                    "text_raw": raw,
                    "text": corrected,
                    "structured": structured,
                }
            )

        cards_out = sort_cards(cards_out)

        output_decks.append(
            {
                "id": deck_slug,
                "name": deck["name"],
                "type": deck["type"],
                "expansion": expansion,
                "card_count": len(cards_out),
                "cards": cards_out,
            }
        )

    event_decks = [deck for deck in output_decks if deck["type"] == "event"]
    exploration_decks = [deck for deck in output_decks if deck["type"] == "exploration"]
    event_decks.sort(key=lambda deck: deck_sort_key(deck, EVENT_DECK_ORDER))
    exploration_decks.sort(key=lambda deck: deck_sort_key(deck, EXPLORATION_DECK_ORDER))
    output_decks = event_decks + exploration_decks

    payload = {
        "game": source.get("game", "The Witcher: El Viejo Mundo"),
        "source": source.get("source", ""),
        "language": "es",
        "deck_count": len(output_decks),
        "event_deck_count": len(event_decks),
        "exploration_deck_count": len(exploration_decks),
        "expansions": list(EXPANSIONS.values()),
        "stats": stats,
        "event_decks": event_decks,
        "exploration_decks": exploration_decks,
        "decks": output_decks,
    }

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Guardado: {args.output}")
    print(
        f"Texto corregido: {stats['corrected']} | "
        f"Con opciones A/B: {stats['structured_ok']} | "
        f"Narrativas: {stats.get('structured_narrative', 0)} | "
        f"Parcial: {stats['structured_partial']} | "
        f"Vacías: {stats['empty']}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
