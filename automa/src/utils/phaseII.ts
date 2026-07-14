import { ActionCard, AutomaState } from "../types";
import { meetsCombatRequirement, formatCombatCondition } from "./combatCondition";

export type PhaseIIAction = "meditate" | "combat" | "explore";

export function canMeditate(automa: AutomaState): boolean {
  return Object.values(automa.attributes).some((v) => v === 5) && automa.trophies < 4;
}

export function inferPhaseIIAction(card: ActionCard, automa: AutomaState): PhaseIIAction {
  if (card.phaseIIPriority === "meditate_or_monster") {
    if (canMeditate(automa)) return "meditate";
    if (meetsCombatRequirement(card, automa)) return "combat";
    return "explore";
  }

  if (canMeditate(automa)) {
    return "meditate";
  }

  if (meetsCombatRequirement(card, automa)) {
    return "combat";
  }

  return "explore";
}

export function getPhaseIIHint(card: ActionCard, automa: AutomaState): string {
  if (card.phaseIIPriority === "meditate_or_monster") {
    if (canMeditate(automa)) {
      return "Prioridad: Meditar (atributo en nivel 5 y trofeo disponible).";
    }
    if (meetsCombatRequirement(card, automa)) {
      return `Si no puede meditar: combate monstruo si ${formatCombatCondition(card).toLowerCase()}.`;
    }
    return `No medita ni combate (${formatCombatCondition(card)}). El Automa explora.`;
  }

  if (canMeditate(automa)) {
    return "Prioridad: Meditar (atributo en nivel 5 y trofeo disponible).";
  }

  if (meetsCombatRequirement(card, automa)) {
    if (card.combatPriority === "witcher_then_monster") {
      return `Prioridad: combatir brujo/automa en la localización; si no hay, monstruo si ${formatCombatCondition(card).toLowerCase()}.`;
    }
    return `Condición de combate cumplida: ${formatCombatCondition(card)}. Si hay monstruo o brujo en la localización, combatir.`;
  }

  return `No cumple combate (${formatCombatCondition(card)}). El Automa explora (sin robar eventos).`;
}
