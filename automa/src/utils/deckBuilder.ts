import {
  ACTION_CARDS,
  CHALLENGE_CARDS,
  LEVEL_3_CHALLENGE_RESERVE,
} from "../data/cards";
import { ActionCard, ChallengeCard } from "../types";
import { shuffleArray } from "./shuffle";

export type BuiltDecks = {
  actionDeck: ActionCard[];
  challengeDeck: ChallengeCard[];
  level3Reserve: ChallengeCard[];
};

/**
 * Construye los mazos con las cartas catalogadas hasta el momento.
 * La selección por dificultad se aplicará cuando el catálogo esté completo.
 */
export function buildDecksFromCatalog(): BuiltDecks {
  const activeChallengeIds = new Set(CHALLENGE_CARDS.map((c) => c.id));
  const reserve = LEVEL_3_CHALLENGE_RESERVE.filter((c) => !activeChallengeIds.has(c.id));

  return {
    actionDeck: shuffleArray([...ACTION_CARDS]),
    challengeDeck: shuffleArray([...CHALLENGE_CARDS]),
    level3Reserve: reserve,
  };
}
