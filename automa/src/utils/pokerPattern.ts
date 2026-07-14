import { ChallengeCard } from "../types";

export function applyPokerPattern(
  dice: number[],
  card: ChallengeCard
): { kept: boolean[]; explanation: string } {
  const kept = [false, false, false, false, false];

  if (card.pokerKeepValues && card.pokerKeepValues.length > 0) {
    const targets = [...card.pokerKeepValues];
    const used = new Set<number>();

    dice.forEach((value, index) => {
      const targetIndex = targets.findIndex(
        (target, idx) => target === value && !used.has(idx)
      );
      if (targetIndex !== -1) {
        used.add(targetIndex);
        kept[index] = true;
      }
    });

    const label = card.pokerKeepValues.join(", ");
    return {
      kept,
      explanation: `La IA conserva dados que coincidan con: ${label}.`,
    };
  }

  const pattern = card.pokerPattern.toLowerCase();
  const counts = Array(7).fill(0);
  dice.forEach((d) => {
    counts[d] += 1;
  });

  if (pattern.includes("parejas") || pattern.includes("pareja")) {
    const pairs: number[] = [];
    for (let i = 1; i <= 6; i += 1) {
      if (counts[i] >= 2) {
        pairs.push(i);
      }
    }
    dice.forEach((value, index) => {
      if (pairs.includes(value)) {
        kept[index] = true;
      }
    });
    return { kept, explanation: "La IA mantiene parejas o valores duplicados." };
  }

  if (pattern.includes("valores altos") || pattern.includes("4+")) {
    dice.forEach((value, index) => {
      if (value >= 4) {
        kept[index] = true;
      }
    });
    return { kept, explanation: "La IA mantiene dados con valores altos (4, 5 o 6)." };
  }

  if (pattern.includes("tríos") || pattern.includes("trío")) {
    let bestValue = -1;
    let hasTrioOrBetter = false;

    for (let i = 6; i >= 1; i -= 1) {
      if (counts[i] >= 3) {
        bestValue = i;
        hasTrioOrBetter = true;
        break;
      }
    }

    if (!hasTrioOrBetter) {
      for (let i = 6; i >= 1; i -= 1) {
        if (counts[i] >= 2) {
          bestValue = i;
          break;
        }
      }
    }

    if (bestValue !== -1) {
      dice.forEach((value, index) => {
        if (value === bestValue) {
          kept[index] = true;
        }
      });
    }

    return {
      kept,
      explanation: "La IA mantiene tríos, o la pareja más alta si no hay trío.",
    };
  }

  if (pattern.includes("consecutivos") || pattern.includes("escalera")) {
    const seen = new Set<number>();
    dice.forEach((value, index) => {
      if (!seen.has(value)) {
        seen.add(value);
        kept[index] = true;
      }
    });
    return {
      kept,
      explanation: "La IA mantiene valores consecutivos únicos para intentar Escalera.",
    };
  }

  const maxVal = Math.max(...dice);
  let markedMax = false;
  dice.forEach((value, index) => {
    if (value === maxVal && !markedMax) {
      kept[index] = true;
      markedMax = true;
    }
  });

  return {
    kept,
    explanation: "La IA relanza todo excepto el dado con el valor más alto.",
  };
}
