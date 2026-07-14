/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Catálogo de cartas del Automa — se construye carta a carta desde las físicas.
 * Cada entrada corresponde a una carta real verificada (imagen + reglas).
 */

import { ActionCard, ChallengeCard } from '../types';

// ==========================================
// CARTA #2 — Genérica nivel I (primera del catálogo)
// ==========================================

const ACT_2: ActionCard = {
  id: 'act-2',
  level: 'generic',
  cardNumber: 2,
  movement: 4,
  destination: 'Casilla 2',
  destinationSlot: 2,
  tieBreakDirection: 'up',
  attributeBonus: 'special',
  potionBonus: true,
  bombBonus: false,
  trailBonus: true,
  trailType: 'terrain',
  combatRequirement: 'Combatir monstruo en la localización si tienes < 1 trofeo',
  combatCondition: { type: 'trophies_lt', value: 1 },
  marketDiscards: [6],
  imagePath: '/cards/act-2.png',
};

const CHA_2: ChallengeCard = {
  id: 'cha-2',
  level: 'generic',
  cardNumber: 2,
  damage: 2,
  shields: 0,
  consumableSlot: false,
  schoolSymbol: false,
  reaction: null,
  pokerKeepValues: [1, 2, 3, 4, 4],
  pokerPattern: 'Conservar 1, 2, 3, 4 y 4.',
  redMutagen: true,
  playerMonsterAttack: 'mordisco',
  imagePath: '/cards/cha-2.png',
};

// ==========================================
// CARTA #15 — Genérica nivel I
// ==========================================

const ACT_15: ActionCard = {
  id: 'act-15',
  level: 'generic',
  cardNumber: 15,
  movement: 2,
  destination: 'Casilla 15',
  destinationSlot: 15,
  tieBreakDirection: 'down',
  attributeBonus: 'lowest',
  potionBonus: false,
  bombBonus: true,
  bombRequiresModule: true,
  trailBonus: false,
  combatRequirement: 'Combatir monstruo en la localización si tienes < 1 trofeo',
  combatCondition: { type: 'trophies_lt', value: 1 },
  marketDiscards: [1, 5],
  imagePath: '/cards/act-15.png',
};

const CHA_15: ChallengeCard = {
  id: 'cha-15',
  level: 'generic',
  cardNumber: 15,
  damage: 2,
  shields: 0,
  consumableSlot: true,
  potionDamageBonus: 1,
  schoolSymbol: false,
  reaction: null,
  pokerKeepValues: [5, 3, 3, 4, 4],
  pokerPattern: 'Conservar 5, 3, 3, 4 y 4.',
  playerMonsterAttack: 'embestida',
  imagePath: '/cards/cha-15.png',
};

// ==========================================
// CARTA #8 — Genérica nivel I
// ==========================================

const ACT_8: ActionCard = {
  id: 'act-8',
  level: 'generic',
  cardNumber: 8,
  movement: 1,
  destination: 'Casilla 8',
  destinationSlot: 8,
  tieBreakDirection: 'up',
  attributeBonus: 'lowest_defense',
  defenseBonusRaisesShield: true,
  potionBonus: false,
  bombBonus: false,
  trailBonus: false,
  combatRequirement: 'Combatir monstruo en la localización si tienes < 1 trofeo',
  combatCondition: { type: 'trophies_lt', value: 1 },
  marketDiscards: [4, 6],
  imagePath: '/cards/act-8.png',
};

const CHA_8: ChallengeCard = {
  id: 'cha-8',
  level: 'generic',
  cardNumber: 8,
  damage: 1,
  shields: 2,
  consumableSlot: false,
  schoolSymbol: false,
  reaction: {
    type: 'shield',
    value: 0,
    raiseShieldToMax: true,
    description: 'Si esta carta es descartada por un ataque enemigo, sube el nivel de escudo hasta tu Defensa actual.',
  },
  pokerKeepValues: [1, 5, 2, 2, 2],
  pokerPattern: 'Conservar 1, 5, 2, 2 y 2.',
  playerMonsterAttack: 'mordisco',
  imagePath: '/cards/cha-8.png',
};

// ==========================================
// CARTA #11 — Genérica nivel I
// ==========================================

const ACT_11: ActionCard = {
  id: 'act-11',
  level: 'generic',
  cardNumber: 11,
  movement: 3,
  destination: 'Casilla 11',
  destinationSlot: 11,
  tieBreakDirection: 'down',
  attributeBonus: 'lowest_alchemy',
  potionBonus: true,
  bombBonus: false,
  trailBonus: false,
  combatRequirement: 'Combatir monstruo en la localización si tienes < 1 trofeo',
  combatCondition: { type: 'trophies_lt', value: 1 },
  marketDiscards: [3],
  imagePath: '/cards/act-11.png',
};

const CHA_11: ChallengeCard = {
  id: 'cha-11',
  level: 'generic',
  cardNumber: 11,
  damage: 3,
  shields: 0,
  consumableSlot: false,
  schoolSymbol: false,
  reaction: null,
  pokerKeepValues: [1, 2, 3, 4, 6],
  pokerPattern: 'Conservar 1, 2, 3, 4 y 6.',
  playerMonsterAttack: 'embestida',
  imagePath: '/cards/cha-11.png',
};

/** Todas las cartas de Acción catalogadas (orden de inserción). */
export const ACTION_CARDS: ActionCard[] = [ACT_2, ACT_8, ACT_11, ACT_15];

/** Todas las cartas de Desafío catalogadas (orden de inserción). */
export const CHALLENGE_CARDS: ChallengeCard[] = [CHA_2, CHA_8, CHA_11, CHA_15];

/**
 * Cartas de Desafío nivel 3 apartadas del mazo inicial.
 * Se añaden al mazo cuando el Automa medita o gana trofeos.
 */
export const LEVEL_3_CHALLENGE_RESERVE: ChallengeCard[] = [];

export function getCatalogStats() {
  return {
    actionCount: ACTION_CARDS.length,
    challengeCount: CHALLENGE_CARDS.length,
    reserveCount: LEVEL_3_CHALLENGE_RESERVE.length,
  };
}
