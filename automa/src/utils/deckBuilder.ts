import {
  ACTION_CARDS,
  CHALLENGE_CARDS,
  LEVEL_3_CHALLENGE_RESERVE,
  SCHOOL_ACTION_CARDS,
  SCHOOL_CHALLENGE_CARDS,
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
  const schoolChallengeActive = SCHOOL_CHALLENGE_CARDS.filter((c) => c.level !== 3);
  const schoolChallengeReserve = SCHOOL_CHALLENGE_CARDS.filter((c) => c.level === 3);
  const allAction = [...ACTION_CARDS, ...SCHOOL_ACTION_CARDS];
  const allChallenge = [...CHALLENGE_CARDS, ...schoolChallengeActive];
  const activeChallengeIds = new Set(allChallenge.map((c) => c.id));
  const reserve = [...LEVEL_3_CHALLENGE_RESERVE, ...schoolChallengeReserve].filter(
    (c) => !activeChallengeIds.has(c.id)
  );

  return {
    actionDeck: shuffleArray(allAction),
    challengeDeck: shuffleArray(allChallenge),
    level3Reserve: reserve,
  };
}
