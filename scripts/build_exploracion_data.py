#!/usr/bin/env python3
"""Genera un JSON ligero solo con mazos de exploración para la app."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data" / "output" / "cartas-estructuradas.json"
FALLBACK_SOURCE = ROOT / "data" / "output" / "cartas.json"
TARGET = ROOT / "app" / "data" / "exploracion.json"

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
    "exploraci-n-ciudad": "base",
    "exploraci-n-naturaleza": "base",
    "ciudad-del-conjunto-de-aventuras": "adventure-pack",
    "naturaleza-del-conjunto-de-aventuras": "adventure-pack",
    "exploraci-n-skellige": "skellige",
    "exploraci-n-fase-i-cacer-a-salvaje": "wild-hunt",
    "exploraci-n-fase-ii-cacer-a-salvaje": "wild-hunt",
}

LOCATIONS = [
    {
        "id": "ciudad",
        "name": "La Ciudad",
        "description": "Explora calles, tabernas y edificios.",
        "deck_id": "exploraci-n-ciudad",
        "expansion_id": "base",
        "addons": [
            {
                "expansion_id": "adventure-pack",
                "deck_id": "ciudad-del-conjunto-de-aventuras",
            }
        ],
    },
    {
        "id": "naturaleza",
        "name": "Tierras Salvajes",
        "description": "Explora aldeas, caminos y la naturaleza.",
        "deck_id": "exploraci-n-naturaleza",
        "expansion_id": "base",
        "addons": [
            {
                "expansion_id": "adventure-pack",
                "deck_id": "naturaleza-del-conjunto-de-aventuras",
            }
        ],
    },
    {
        "id": "skellige",
        "name": "Skellige",
        "description": "Exploración en las islas del archipiélago.",
        "deck_id": "exploraci-n-skellige",
        "expansion_id": "skellige",
        "addons": [],
    },
    {
        "id": "caceria-fase-1",
        "name": "Cacería Salvaje — Fase I",
        "description": "Exploración de la campaña Cacería Salvaje.",
        "deck_id": "exploraci-n-fase-i-cacer-a-salvaje",
        "expansion_id": "wild-hunt",
        "addons": [],
    },
    {
        "id": "caceria-fase-2",
        "name": "Cacería Salvaje — Fase II",
        "description": "Exploración avanzada de la campaña.",
        "deck_id": "exploraci-n-fase-ii-cacer-a-salvaje",
        "expansion_id": "wild-hunt",
        "addons": [],
    },
]


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


def load_decks_by_id() -> dict[str, dict]:
    decks_by_id: dict[str, dict] = {}

    if SOURCE.exists():
        data = json.loads(SOURCE.read_text(encoding="utf-8"))
        source_decks = data.get("exploration_decks") or [
            deck for deck in data.get("decks", []) if deck["type"] == "exploration"
        ]
        for deck in source_decks:
            decks_by_id[deck["id"]] = deck

    if FALLBACK_SOURCE.exists():
        fallback = json.loads(FALLBACK_SOURCE.read_text(encoding="utf-8"))
        for deck in fallback["decks"]:
            if deck["type"] != "exploration":
                continue
            if deck["id"] in decks_by_id:
                continue
            expansion_id = DECK_EXPANSION_MAP.get(deck["id"], "base")
            decks_by_id[deck["id"]] = {
                **deck,
                "expansion": EXPANSIONS[expansion_id],
                "cards": [
                    {
                        **card,
                        "expansion": EXPANSIONS[expansion_id],
                        "structured": card.get("structured", {}),
                    }
                    for card in deck["cards"]
                ],
            }

    return decks_by_id


def build_location(location: dict, decks_by_id: dict[str, dict]) -> dict | None:
    deck = decks_by_id.get(location["deck_id"])
    if deck is None:
        return None

    addons_output = []
    for addon in location.get("addons", []):
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
        "id": location["id"],
        "name": location["name"],
        "description": location["description"],
        "deck_id": location["deck_id"],
        "deck_name": deck["name"],
        "expansion_id": location["expansion_id"],
        "expansion": deck["expansion"],
        "card_count": deck["card_count"],
        "cards": [slim_card(card) for card in deck["cards"]],
        "addons": addons_output,
    }


def main() -> None:
    decks_by_id = load_decks_by_id()
    structured = json.loads(SOURCE.read_text(encoding="utf-8")) if SOURCE.exists() else {}

    output_locations = []
    for location in LOCATIONS:
        built = build_location(location, decks_by_id)
        if built is not None:
            output_locations.append(built)

    payload = {
        "game": structured.get("game", "The Witcher: El Viejo Mundo"),
        "language": structured.get("language", "es"),
        "expansions": structured.get("expansions", list(EXPANSIONS.values())),
        "locations": output_locations,
    }

    TARGET.parent.mkdir(parents=True, exist_ok=True)
    TARGET.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Guardado: {TARGET} ({len(output_locations)} ubicaciones)")


if __name__ == "__main__":
    main()
