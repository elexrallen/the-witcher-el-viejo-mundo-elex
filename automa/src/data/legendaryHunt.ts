/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Cartas de Acción — expansión Cacería Legendaria (Legendary Hunt).
 */

import { ActionCard } from "../types";
import { MOVEMENT_UNLIMITED } from "../utils/actionCard";

const LH_COMMON = {
  level: 3 as const,
  movement: MOVEMENT_UNLIMITED,
  destination: "Monstruo Legendario",
  cardSet: "legendary_hunt" as const,
  trailBonus: false,
  legendaryMonsterCombat: true,
  returnToDeckBottomIfLegendaryAlive: true,
  combatRequirement:
    "Combate con Monstruo Legendario si el Automa está en el mismo espacio",
  combatCondition: { type: "always" as const },
  potionBonus: true,
  bombBonus: true,
};

/** LH1 — Prioridad ↓, mercado 3 y 6 */
export const ACT_LH1: ActionCard = {
  ...LH_COMMON,
  id: "act-lh1",
  cardNumber: 1,
  tieBreakDirection: "down",
  attributeBonus: "attack",
  marketDiscards: [3, 6],
  imagePath: "/cards/act-lh1.png",
};

/** LH2 — Prioridad ↑, mercado 2 y 4, +2 pociones */
export const ACT_LH2: ActionCard = {
  ...LH_COMMON,
  id: "act-lh2",
  cardNumber: 2,
  tieBreakDirection: "up",
  attributeBonus: "alchemy",
  potionBonusCount: 2,
  marketDiscards: [2, 4],
  imagePath: "/cards/act-lh2.png",
};

/** LH3 — Prioridad ↑, mercado 1 y 5 */
export const ACT_LH3: ActionCard = {
  ...LH_COMMON,
  id: "act-lh3",
  cardNumber: 3,
  tieBreakDirection: "up",
  attributeBonus: "defense",
  defenseBonusRaisesShield: true,
  potionBonusCount: 1,
  marketDiscards: [1, 5],
  imagePath: "/cards/act-lh3.png",
};

export const LEGENDARY_HUNT_ACTION_CARDS: ActionCard[] = [ACT_LH1, ACT_LH2, ACT_LH3];
