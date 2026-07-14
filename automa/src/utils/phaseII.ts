import { ActionCard, AutomaState } from "../types";
import { meetsCombatRequirement, formatCombatCondition } from "./combatCondition";

export type PhaseIIAction = "meditate" | "combat" | "explore";

export function canMeditate(automa: AutomaState): boolean {
  return Object.values(automa.attributes).some((v) => v === 5) && automa.trophies < 4;
}

export function inferPhaseIIAction(card: ActionCard, automa: AutomaState): PhaseIIAction {
  if (canMeditate(automa)) {
    return "meditate";
  }

  if (meetsCombatRequirement(card, automa)) {
    return "combat";
  }

  return "explore";
}

export function getPhaseIIHint(card: ActionCard, automa: AutomaState): string {
  if (canMeditate(automa)) {
    return "Prioridad: Meditar (atributo en nivel 5 y trofeo disponible).";
  }

  if (meetsCombatRequirement(card, automa)) {
    return `Condición de combate cumplida: ${formatCombatCondition(card)}. Si hay monstruo o brujo en la localización, combatir.`;
  }

  return `No cumple combate (${formatCombatCondition(card)}). El Automa explora (sin robar eventos).`;
}
