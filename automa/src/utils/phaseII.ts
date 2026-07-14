import { ActionCard, AutomaState } from "../types";
import { canMeditate } from "./meditation";
import { meetsCombatRequirement, formatCombatCondition } from "./combatCondition";

export type PhaseIIAction = "meditate" | "combat" | "explore";

export type PhaseIIPresence = {
  witcherPresent: boolean;
  monsterPresent: boolean;
};

export type PhaseIICombatOption = {
  opponentType: "monster" | "witcher";
};

const DEFAULT_PRESENCE: PhaseIIPresence = {
  witcherPresent: false,
  monsterPresent: true,
};

/**
 * Resuelve combate en Fase II según prioridad exclusiva de la carta (manual p. 7–8).
 * Opciones con barra ( / ): intentar la izquierda primero; si no aplica, la derecha.
 */
export function resolvePhaseIICombat(
  card: ActionCard,
  automa: AutomaState,
  presence: PhaseIIPresence = DEFAULT_PRESENCE
): PhaseIICombatOption | null {
  if (card.legendaryMonsterCombat) {
    return presence.monsterPresent ? { opponentType: "monster" } : null;
  }

  if (card.combatPriority === "witcher_then_monster") {
    if (presence.witcherPresent) {
      return { opponentType: "witcher" };
    }
    if (presence.monsterPresent && meetsCombatRequirement(card, automa)) {
      return { opponentType: "monster" };
    }
    return null;
  }

  if (presence.monsterPresent && meetsCombatRequirement(card, automa)) {
    return { opponentType: "monster" };
  }

  if (presence.witcherPresent && meetsCombatRequirement(card, automa)) {
    return { opponentType: "witcher" };
  }

  return null;
}

export function canPhaseIICombat(
  card: ActionCard,
  automa: AutomaState,
  presence: PhaseIIPresence = DEFAULT_PRESENCE
): boolean {
  return resolvePhaseIICombat(card, automa, presence) !== null;
}

export function inferPhaseIIAction(
  card: ActionCard,
  automa: AutomaState,
  presence: PhaseIIPresence = DEFAULT_PRESENCE
): PhaseIIAction {
  if (card.phaseIIPriority === "meditate_or_monster") {
    if (canMeditate(automa)) return "meditate";
    if (canPhaseIICombat(card, automa, presence)) return "combat";
    return "explore";
  }

  if (canMeditate(automa)) {
    return "meditate";
  }

  if (canPhaseIICombat(card, automa, presence)) {
    return "combat";
  }

  return "explore";
}

export function getPhaseIIHint(
  card: ActionCard,
  automa: AutomaState,
  presence: PhaseIIPresence = DEFAULT_PRESENCE
): string {
  if (card.legendaryMonsterCombat) {
    return presence.monsterPresent
      ? "Combate con Monstruo Legendario (mismo espacio)."
      : "Sin monstruo legendario en la localización — explorar.";
  }

  if (card.phaseIIPriority === "meditate_or_monster") {
    if (canMeditate(automa)) {
      return "Prioridad: Meditar (atributo en nivel 5 y trofeo de meditación disponible).";
    }
    const combat = resolvePhaseIICombat(card, automa, presence);
    if (combat) {
      return `Si no puede meditar: combate ${combat.opponentType === "witcher" ? "brujo" : "monstruo"} (${formatCombatCondition(card).toLowerCase()}).`;
    }
    return `No medita ni combate (${formatCombatCondition(card)}). El Automa explora.`;
  }

  if (canMeditate(automa)) {
    return "Prioridad: Meditar (atributo en nivel 5 y trofeo de meditación disponible).";
  }

  const combat = resolvePhaseIICombat(card, automa, presence);
  if (combat) {
    if (card.combatPriority === "witcher_then_monster") {
      if (combat.opponentType === "witcher") {
        return "Prioridad: combatir brujo en la localización.";
      }
      return `Sin brujo: combate monstruo si ${formatCombatCondition(card).toLowerCase()}.`;
    }
    return `Condición cumplida: ${formatCombatCondition(card)}. Combate ${combat.opponentType === "witcher" ? "brujo" : "monstruo"}.`;
  }

  return `No cumple combate (${formatCombatCondition(card)}). El Automa explora (sin robar eventos).`;
}
