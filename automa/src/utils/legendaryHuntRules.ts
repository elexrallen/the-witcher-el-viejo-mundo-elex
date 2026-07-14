import { AutomaState } from "../types";

/** Vida base por defecto del Monstruo Legendario (ajustable según el jefe en mesa). */
export const DEFAULT_LEGENDARY_MONSTER_BASE_LIFE = 10;

/** Fichas de Destrucción en la reserva general de la expansión (mesa). */
export const DEFAULT_DESTRUCTION_RESERVE = 8;

export function isLegendaryMonsterOpponent(name: string): boolean {
  return /legendario/i.test(name);
}

/** Cada ficha de Destrucción del Automa resta 1 carta de vida del jefe (manual p. 14). */
export function getEffectiveLegendaryMonsterLife(
  baseLife: number,
  destructionTokens: number
): number {
  return Math.max(0, baseLife - Math.max(0, destructionTokens));
}

export function formatLegendaryLifeSummary(automa: AutomaState): string {
  const effective = getEffectiveLegendaryMonsterLife(
    automa.legendaryMonsterBaseLife,
    automa.destructionTokens
  );
  return `${automa.legendaryMonsterBaseLife} − ${automa.destructionTokens} fichas = ${effective} cartas en reserva del jefe`;
}

/** Penalización al perder vs Monstruo Legendario: +1 ficha de la reserva (manual p. 14). */
export function applyLegendaryMonsterLossPenalty(
  automa: AutomaState
): { next: AutomaState; drewFromReserve: boolean } {
  const drewFromReserve = automa.destructionReserveRemaining > 0;
  return {
    drewFromReserve,
    next: {
      ...automa,
      destructionTokens: automa.destructionTokens + 1,
      destructionReserveRemaining: drewFromReserve
        ? automa.destructionReserveRemaining - 1
        : automa.destructionReserveRemaining,
    },
  };
}
