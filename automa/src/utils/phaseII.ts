import { ActionCard, AutomaState } from "../types";

export type PhaseIIAction = "meditate" | "combat" | "explore";

export function canMeditate(automa: AutomaState): boolean {
  return Object.values(automa.attributes).some((v) => v === 5) && automa.trophies < 4;
}

export function inferPhaseIIAction(card: ActionCard, automa: AutomaState): PhaseIIAction {
  const req = card.combatRequirement.toLowerCase();

  if (canMeditate(automa) && req.includes("meditar")) {
    return "meditate";
  }

  if (req.includes("combate") || req.includes("brujo") || req.includes("monstruo")) {
    return "combat";
  }

  if (canMeditate(automa)) {
    return "meditate";
  }

  return "explore";
}

export function getPhaseIIHint(card: ActionCard): string {
  const req = card.combatRequirement;
  if (req.toLowerCase().includes("meditar")) {
    return "La carta prioriza Meditar si hay un atributo en nivel 5 y trofeo disponible.";
  }
  if (req.toLowerCase().includes("combate")) {
    return `Condición de combate: ${req}. Si no aplica, explora.`;
  }
  return "Si no puede meditar ni combatir, el Automa explora (sin robar eventos).";
}
