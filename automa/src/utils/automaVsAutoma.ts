/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Combate Automa vs Automa: co-ubicación y helpers de combate dual.
 */

import type { AutomaPlayerState, ChallengeCard } from "../types";
import { getMaxShieldLevel } from "./combat";

export function normalizeLocationKey(location: string): string {
  return location.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Índices de Automas en la misma localización que el activo (excluye al activo). */
export function getCoLocatedAutomaIndices(
  players: AutomaPlayerState[],
  activeIndex: number
): number[] {
  const active = players[activeIndex];
  if (!active) return [];
  const key = normalizeLocationKey(active.automa.location);
  if (!key) return [];

  return players
    .map((player, index) => ({ player, index }))
    .filter(
      ({ player, index }) =>
        index !== activeIndex &&
        normalizeLocationKey(player.automa.location) === key
    )
    .map(({ index }) => index);
}

export function formatAutomaOpponentLabel(player: AutomaPlayerState): string {
  return player.label;
}

export type CombatDeckDamageResult = {
  deck: ChallengeCard[];
  discard: ChallengeCard[];
  shieldsAfterHit: number;
  pendingCounterattack: number;
  defeated: boolean;
  logs: string[];
};

/**
 * Aplica daño a un mazo de combate (descarta cartas = vida), con reacciones básicas.
 */
export function applyDamageToCombatDeck(
  deck: ChallengeCard[],
  discard: ChallengeCard[],
  shields: number,
  rawDamage: number,
  defenseAttribute: number,
  logPrefix = "Rival"
): CombatDeckDamageResult {
  const effectiveDamage = Math.max(0, rawDamage - shields);
  let remaining = effectiveDamage;
  let tempDeck = [...deck];
  let tempDiscard = [...discard];
  let shieldsAfterHit =
    effectiveDamage === 0 ? Math.max(0, shields - rawDamage) : 0;
  let pendingCounterattack = 0;
  const logs: string[] = [
    `${logPrefix}: recibe ${rawDamage} (neto ${effectiveDamage} tras ${shields} escudo).`,
  ];

  while (remaining > 0 && tempDeck.length > 0) {
    const discardedCard = tempDeck[0];
    tempDeck = tempDeck.slice(1);
    tempDiscard.push(discardedCard);
    remaining -= 1;

    const reaction = discardedCard.reaction;
    if (!reaction) continue;

    if (reaction.raiseShieldToMax) {
      shieldsAfterHit = getMaxShieldLevel(defenseAttribute);
      remaining = 0;
      logs.push(
        `⚡ Reacción rival (${discardedCard.id}): escudo al máximo (${shieldsAfterHit}).`
      );
    } else if (reaction.type === "shield" || reaction.type === "shield_damage") {
      const absorbed = Math.min(reaction.value, remaining);
      remaining -= absorbed;
      logs.push(
        `⚡ Reacción rival (${discardedCard.id}): cancela ${absorbed} de daño restante.`
      );
    } else if (reaction.type === "damage" && reaction.value > 0) {
      pendingCounterattack += reaction.value;
      logs.push(
        `⚡ Reacción rival (${discardedCard.id}): +${reaction.value} contraataque.`
      );
    }
  }

  return {
    deck: tempDeck,
    discard: tempDiscard,
    shieldsAfterHit,
    pendingCounterattack,
    defeated: tempDeck.length === 0,
    logs,
  };
}
