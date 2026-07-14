import { ActionCard } from "../types";
import { shuffleArray } from "./shuffle";

export function normalizeActionLevel(level: ActionCard["level"]): 1 | 2 | 3 {
  return level === "generic" ? 1 : level;
}

export function isActionLevel3(card: ActionCard): boolean {
  return normalizeActionLevel(card.level) === 3;
}

/**
 * Manual V1.4 p. 8: si el mazo de Acción se vacía, forma un nuevo mazo
 * solo con las cartas de nivel III del descarte (barajadas).
 * Las cartas de nivel I y II permanecen en el descarte.
 */
export function recycleActionDeckFromLevel3Discard(discard: ActionCard[]): {
  recycledDeck: ActionCard[];
  remainingDiscard: ActionCard[];
} {
  const level3 = discard.filter(isActionLevel3);
  const remainingDiscard = discard.filter((card) => !isActionLevel3(card));

  return {
    recycledDeck: shuffleArray(level3),
    remainingDiscard,
  };
}
