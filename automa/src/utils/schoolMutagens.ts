import { ChallengeCard, SchoolMutagenCombatBonus, WitcherSchool } from "../types";
import { shuffleArray } from "./shuffle";

type ShuffleContext = {
  deck: ChallengeCard[];
  discard: ChallengeCard[];
  fightLogs: string[];
};

export function shuffleTopDiscardIntoDeck(
  ctx: ShuffleContext,
  label: string
): void {
  if (ctx.discard.length === 0) {
    ctx.fightLogs.push(`${label}: descarte vacío, sin carta que barajar.`);
    return;
  }
  const topDiscard = ctx.discard[ctx.discard.length - 1];
  ctx.deck = shuffleArray([...ctx.deck, topDiscard]);
  ctx.discard = ctx.discard.slice(0, -1);
  ctx.fightLogs.push(`${label}: ${topDiscard.id} barajada al mazo de combate.`);
}

export function applyMutagenCombatBonus(
  bonus: SchoolMutagenCombatBonus,
  label: string,
  ctx: ShuffleContext,
  stats: { damage: number; shields: number },
  consumables?: { potions: number }
): { damage: number; shields: number } {
  let { damage, shields } = stats;
  if (bonus.damage) {
    damage += bonus.damage;
    ctx.fightLogs.push(`${label}: +${bonus.damage} daño.`);
  }
  if (bonus.shields) {
    shields += bonus.shields;
    ctx.fightLogs.push(`${label}: +${bonus.shields} escudo.`);
  }
  if (bonus.gainPotions && consumables) {
    consumables.potions = Math.min(4, consumables.potions + bonus.gainPotions);
    ctx.fightLogs.push(`${label}: +${bonus.gainPotions} poción(es).`);
  }
  const shuffleCount =
    bonus.shuffleDiscardTopCount ?? (bonus.shuffleDiscardTop ? 1 : 0);
  for (let i = 0; i < shuffleCount; i++) {
    shuffleTopDiscardIntoDeck(
      ctx,
      shuffleCount > 1 ? `${label} (${i + 1}/${shuffleCount})` : label
    );
  }
  return { damage, shields };
}

export function applySchoolMutagenCombatBonuses(
  school: WitcherSchool,
  activeMutagens: ("red" | "blue" | "green")[],
  ctx: ShuffleContext,
  stats: { damage: number; shields: number },
  consumables?: { potions: number }
): { damage: number; shields: number } {
  const combat = school.specialCard?.mutagenCombat;
  if (!combat) return stats;

  const labels: Record<string, string> = {
    blue: "Mutágeno azul",
    red: "Mutágeno rojo",
    green: "Mutágeno verde",
  };

  let result = stats;
  for (const color of activeMutagens) {
    const bonus = combat[color];
    if (bonus) {
      result = applyMutagenCombatBonus(bonus, labels[color], ctx, result, consumables);
    }
  }
  return result;
}
