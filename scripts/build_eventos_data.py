#!/usr/bin/env python3
"""Genera JSON de mazos de eventos para la app (robo ascendente)."""

from __future__ import annotations

import json
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


def slim_card(card: dict, expansion_id: str | None = None) -> dict:
    expansion = card.get("expansion")
    if expansion is None and expansion_id:
        expansion = EXPANSIONS[expansion_id]
    return {
        "position": card["position"],
        "card_id": card["card_id"],
        "image": card["image"],
        "structured": card.get("structured", {}),
        "expansion": expansion,
    }


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
    print(f"Guardado: {TARGET} ({len(output_decks)} mazos de eventos)")


if __name__ == "__main__":
    main()
