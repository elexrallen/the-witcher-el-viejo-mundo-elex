#!/usr/bin/env python3
"""Genera JSON de mazos de eventos para la app (robo ascendente)."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data" / "output" / "cartas-estructuradas.json"
FALLBACK_SOURCE = ROOT / "data" / "output" / "cartas.json"
TARGET = ROOT / "app" / "data" / "eventos.json"

EXPANSIONS = {
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

DECK_EXPANSION_MAP = {
    "eventos": "base",
    "eventos-del-conjunto-de-aventuras": "adventure-pack",
    "eventos-cacer-a-salvaje": "wild-hunt",
    "eventos-skellige": "skellige",
}

EVENT_DECKS = [
    {
        "id": "eventos",
        "name": "Mazo de eventos",
        "description": "Cartas de evento del juego base. Se roban en orden ascendente.",
        "deck_id": "eventos",
        "expansion_id": "base",
        "draw_mode": "ascending",
        "addons": [
            {
                "expansion_id": "adventure-pack",
                "deck_id": "eventos-del-conjunto-de-aventuras",
            }
        ],
    },
    {
        "id": "eventos-skellige",
        "name": "Eventos Skellige",
        "description": "Eventos de la expansión Skellige.",
        "deck_id": "eventos-skellige",
        "expansion_id": "skellige",
        "draw_mode": "ascending",
        "addons": [],
    },
    {
        "id": "eventos-caceria",
        "name": "Eventos Cacería Salvaje",
        "description": "Eventos de la campaña Cacería Salvaje.",
        "deck_id": "eventos-cacer-a-salvaje",
        "expansion_id": "wild-hunt",
        "draw_mode": "ascending",
        "addons": [],
    },
]


def sort_cards(cards: list[dict]) -> list[dict]:
    ordered = sorted(cards, key=lambda card: (card.get("position", 0), card.get("card_id", 0)))
    for index, card in enumerate(ordered, start=1):
        card["position"] = index
    return ordered


EQUIPMENT_RE = re.compile(r"equipamiento", re.IGNORECASE)
COMPANION_RE = re.compile(r"compa[nñ]ero", re.IGNORECASE)
KEEP_RE = re.compile(
    r"deja\s+esta\s+carta\s+(?:frente\s+a\s+ti|delante\s+de\s+ti)",
    re.IGNORECASE,
)
OCR_PREFIX_RE = re.compile(r"^[89]0[89]\s*", re.IGNORECASE)
LABEL_CLEAN_RE = re.compile(r"[^A-Za-zÁÉÍÓÚáéíóúÑñÜü0-9\s\-']+")


def collect_card_text(structured: dict) -> list[str]:
    texts: list[str] = []
    for paragraph in structured.get("paragraphs") or []:
        if isinstance(paragraph, str) and paragraph.strip():
            texts.append(paragraph.strip())
    for option in structured.get("options") or []:
        if isinstance(option, dict):
            for key in ("text", "label"):
                value = option.get(key)
                if isinstance(value, str) and value.strip():
                    texts.append(value.strip())
    for effect in structured.get("effects") or []:
        if isinstance(effect, str) and effect.strip():
            texts.append(effect.strip())
    return texts


def clean_label(raw: str) -> str:
    text = OCR_PREFIX_RE.sub("", raw.strip())
    text = LABEL_CLEAN_RE.sub(" ", text)
    text = re.sub(r"\s+", " ", text).strip()
    if not text:
        return ""
    if text.isupper() and len(text) > 3:
        return text.title()
    return text


def extract_label_from_keep_line(text: str) -> str:
    match = KEEP_RE.search(text)
    if not match:
        return ""
    remainder = text[match.end() :].strip()
    if not remainder:
        return ""
    first_chunk = re.split(r"[.:;]\s+", remainder, maxsplit=1)[0]
    return clean_label(first_chunk)


def extract_persistent_label(texts: list[str], persistent_type: str, position: int) -> str:
    for text in texts:
        if persistent_type == "equipment" and EQUIPMENT_RE.search(text):
            for other in texts:
                if other is text:
                    continue
                label = extract_label_from_keep_line(other)
                if label:
                    return label
                cleaned = clean_label(other)
                if cleaned and not EQUIPMENT_RE.search(cleaned) and not KEEP_RE.search(cleaned):
                    return cleaned
        if persistent_type == "companion" and COMPANION_RE.search(text):
            for other in texts:
                if other is text:
                    continue
                label = extract_label_from_keep_line(other)
                if label:
                    return label
                cleaned = clean_label(other)
                if cleaned and not COMPANION_RE.search(cleaned) and not KEEP_RE.search(cleaned):
                    return cleaned

    for text in texts:
        label = extract_label_from_keep_line(text)
        if label:
            return label

    for text in texts:
        if KEEP_RE.search(text):
            continue
        cleaned = clean_label(text)
        if cleaned and len(cleaned) <= 48:
            return cleaned

    return f"Evento #{position}"


def detect_persistent(card: dict) -> dict | None:
    structured = card.get("structured") or {}
    texts = collect_card_text(structured)
    if not texts:
        return None

    persistent_type = None
    for text in texts:
        if EQUIPMENT_RE.search(text):
            persistent_type = "equipment"
            break
        if COMPANION_RE.search(text):
            persistent_type = "companion"
            break

    if persistent_type is None:
        for text in texts:
            if KEEP_RE.search(text):
                persistent_type = "keep"
                break

    if persistent_type is None:
        return None

    label = extract_persistent_label(texts, persistent_type, card.get("position", 0))
    return {
        "type": persistent_type,
        "label": label,
    }


def slim_card(card: dict, expansion_id: str | None = None) -> dict:
    expansion = card.get("expansion")
    if expansion is None and expansion_id:
        expansion = EXPANSIONS[expansion_id]
    payload = {
        "position": card["position"],
        "card_id": card["card_id"],
        "image": card["image"],
        "structured": card.get("structured", {}),
        "expansion": expansion,
    }
    persistent = detect_persistent(card)
    if persistent:
        payload["persistent"] = persistent
    return payload


def load_event_decks() -> dict[str, dict]:
    decks_by_id: dict[str, dict] = {}

    if SOURCE.exists():
        data = json.loads(SOURCE.read_text(encoding="utf-8"))
        source_decks = data.get("event_decks") or [d for d in data.get("decks", []) if d["type"] == "event"]
        for deck in source_decks:
            cards = sort_cards([dict(card) for card in deck["cards"]])
            decks_by_id[deck["id"]] = {**deck, "cards": cards}

    if FALLBACK_SOURCE.exists():
        fallback = json.loads(FALLBACK_SOURCE.read_text(encoding="utf-8"))
        for deck in fallback["decks"]:
            if deck["type"] != "event":
                continue
            if deck["id"] in decks_by_id:
                continue
            expansion_id = DECK_EXPANSION_MAP.get(deck["id"], "base")
            cards = sort_cards([dict(card) for card in deck["cards"]])
            decks_by_id[deck["id"]] = {
                **deck,
                "expansion": EXPANSIONS[expansion_id],
                "cards": [
                    {
                        **slim_card(card, expansion_id),
                    }
                    for card in cards
                ],
            }

    return decks_by_id


def build_event_deck(config: dict, decks_by_id: dict[str, dict]) -> dict | None:
    deck = decks_by_id.get(config["deck_id"])
    if deck is None:
        return None

    addons_output = []
    for addon in config.get("addons", []):
        addon_deck = decks_by_id.get(addon["deck_id"])
        if addon_deck is None:
            continue
        addons_output.append(
            {
                "expansion_id": addon["expansion_id"],
                "deck_id": addon["deck_id"],
                "deck_name": addon_deck["name"],
                "card_count": addon_deck["card_count"],
                "cards": [slim_card(card) for card in addon_deck["cards"]],
            }
        )

    return {
        "id": config["id"],
        "name": config["name"],
        "description": config["description"],
        "deck_id": config["deck_id"],
        "deck_name": deck["name"],
        "expansion_id": config["expansion_id"],
        "expansion": deck["expansion"],
        "draw_mode": config.get("draw_mode", "ascending"),
        "card_count": deck["card_count"],
        "cards": [slim_card(card) for card in deck["cards"]],
        "addons": addons_output,
    }


def main() -> None:
    decks_by_id = load_event_decks()
    structured = json.loads(SOURCE.read_text(encoding="utf-8")) if SOURCE.exists() else {}

    output_decks = []
    for config in EVENT_DECKS:
        built = build_event_deck(config, decks_by_id)
        if built is not None:
            output_decks.append(built)

    payload = {
        "game": structured.get("game", "The Witcher: El Viejo Mundo"),
        "language": structured.get("language", "es"),
        "expansions": structured.get("expansions", list(EXPANSIONS.values())),
        "decks": output_decks,
    }

    TARGET.parent.mkdir(parents=True, exist_ok=True)
    TARGET.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    persistent_count = sum(
        1
        for deck in output_decks
        for card in deck["cards"] + [c for addon in deck.get("addons", []) for c in addon["cards"]]
        if card.get("persistent")
    )
    print(f"Guardado: {TARGET} ({len(output_decks)} mazos, {persistent_count} cartas persistentes)")


if __name__ == "__main__":
    main()
