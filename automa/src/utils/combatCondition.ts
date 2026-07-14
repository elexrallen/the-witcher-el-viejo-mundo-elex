import { ActionCard, AutomaState } from "../types";

export type CombatCondition =
  | { type: "always" }
  | { type: "trophies_gte"; value: number }
  | { type: "trophies_lte"; value: number }
  | { type: "trophies_lt"; value: number };

export function resolveCombatCondition(card: ActionCard): CombatCondition {
  if (card.combatCondition) {
    return card.combatCondition;
  }

  const req = card.combatRequirement.toLowerCase();

  if (req.includes("siempre") || req.includes("trofeos ≥ 0")) {
    return { type: "always" };
  }
  if (req.includes("< 1") || req.includes("0 trofeos")) {
    return { type: "trophies_lt", value: 1 };
  }
  if (req.includes("≤ 2")) {
    return { type: "trophies_lte", value: 2 };
  }
  if (req.includes("≥ 2")) {
    return { type: "trophies_gte", value: 2 };
  }
  if (req.includes("≥ 1")) {
    return { type: "trophies_gte", value: 1 };
  }

  return { type: "always" };
}

export function meetsCombatRequirement(card: ActionCard, automa: AutomaState): boolean {
  if (card.combatPriority === "witcher_then_monster") {
    return true;
  }

  const condition = resolveCombatCondition(card);

  switch (condition.type) {
    case "always":
      return true;
    case "trophies_gte":
      return automa.trophies >= condition.value;
    case "trophies_lte":
      return automa.trophies <= condition.value;
    case "trophies_lt":
      return automa.trophies < condition.value;
    default:
      return false;
  }
}

export function formatCombatCondition(card: ActionCard): string {
  if (card.combatRequirement) {
    return card.combatRequirement;
  }

  const condition = resolveCombatCondition(card);
  switch (condition.type) {
    case "always":
      return "Combatir si hay oponente en la localización";
    case "trophies_gte":
      return `Combatir si tienes ≥ ${condition.value} trofeo${condition.value === 1 ? "" : "s"}`;
    case "trophies_lte":
      return `Combatir si tienes ≤ ${condition.value} trofeo${condition.value === 1 ? "" : "s"}`;
    case "trophies_lt":
      return `Combatir si tienes < ${condition.value} trofeo${condition.value === 1 ? "" : "s"}`;
    default:
      return "Combatir según carta";
  }
}
