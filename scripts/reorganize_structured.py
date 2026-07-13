#!/usr/bin/env python3
"""Reorganiza cartas-estructuradas.json sin volver a ejecutar OCR."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data" / "output" / "cartas-estructuradas.json"

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


def deck_sort_key(deck: dict, order: list[str]) -> tuple[int, str]:
    try:
        return (order.index(deck["id"]), deck["name"])
    except ValueError:
        return (len(order), deck["name"])


def sort_cards(cards: list[dict]) -> list[dict]:
    ordered = sorted(cards, key=lambda card: (card.get("position", 0), card.get("card_id", 0)))
    for index, card in enumerate(ordered, start=1):
        card["position"] = index
    return ordered


def main() -> None:
    data = json.loads(SOURCE.read_text(encoding="utf-8"))
    decks = data.get("decks", [])

    event_decks = []
    exploration_decks = []

    for deck in decks:
        cards = sort_cards(deck["cards"])
        normalized = {**deck, "cards": cards}
        if deck["type"] == "event":
            event_decks.append(normalized)
        elif deck["type"] == "exploration":
            exploration_decks.append(normalized)

    event_decks.sort(key=lambda deck: deck_sort_key(deck, EVENT_DECK_ORDER))
    exploration_decks.sort(key=lambda deck: deck_sort_key(deck, EXPLORATION_DECK_ORDER))

    data["event_decks"] = event_decks
    data["exploration_decks"] = exploration_decks
    data["decks"] = event_decks + exploration_decks
    data["deck_count"] = len(data["decks"])
    data["event_deck_count"] = len(event_decks)
    data["exploration_deck_count"] = len(exploration_decks)

    SOURCE.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(
        f"Reorganizado: {len(event_decks)} mazos de eventos, "
        f"{len(exploration_decks)} mazos de exploración"
    )


if __name__ == "__main__":
    main()
