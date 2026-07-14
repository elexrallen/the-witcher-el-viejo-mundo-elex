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
  mutagens: ['red'],
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

// ==========================================
// CARTA #5 — Genérica nivel I
// ==========================================

const ACT_5: ActionCard = {
  id: 'act-5',
  level: 'generic',
  cardNumber: 5,
  movement: 3,
  destination: 'Casilla 5',
  destinationSlot: 5,
  tieBreakDirection: 'up',
  attributeBonus: 'attack_special',
  potionBonus: false,
  bombBonus: false,
  trailBonus: false,
  combatRequirement: 'Combatir monstruo en la localización si tienes < 1 trofeo',
  combatCondition: { type: 'trophies_lt', value: 1 },
  marketDiscards: [2],
  imagePath: '/cards/act-5.png',
};

const CHA_5: ChallengeCard = {
  id: 'cha-5',
  level: 'generic',
  cardNumber: 5,
  damage: 2,
  shields: 1,
  shieldRequiresDefense: true,
  consumableSlot: false,
  schoolSymbol: false,
  reaction: {
    type: 'damage',
    value: 2,
    description: 'Si esta carta es descartada por efecto de un ataque de un oponente, el oponente sufre 2 daños.',
  },
  pokerKeepValues: [6, 6, 3, 3, 3],
  pokerPattern: 'Conservar 6, 6, 3, 3 y 3.',
  greenMutagen: true,
  playerMonsterAttack: 'embestida',
  imagePath: '/cards/cha-5.png',
};

// ==========================================
// CARTA #16 — Genérica nivel I
// ==========================================

const ACT_16: ActionCard = {
  id: 'act-16',
  level: 'generic',
  cardNumber: 16,
  movement: 4,
  destination: 'Casilla 16',
  destinationSlot: 16,
  tieBreakDirection: 'down',
  attributeBonus: 'attack',
  potionBonus: true,
  bombBonus: false,
  trailBonus: false,
  combatRequirement: 'Combatir monstruo en la localización si tienes < 1 trofeo',
  combatCondition: { type: 'trophies_lt', value: 1 },
  marketDiscards: [1],
  imagePath: '/cards/act-16.png',
};

const CHA_16: ChallengeCard = {
  id: 'cha-16',
  level: 'generic',
  cardNumber: 16,
  damage: 3,
  shields: 0,
  consumableSlot: false,
  schoolSymbol: false,
  reaction: null,
  mutagens: ['blue'],
  pokerKeepValues: [1, 3, 4, 4, 4],
  pokerPattern: 'Conservar 1, 3, 4, 4 y 4.',
  playerMonsterAttack: 'mordisco',
  imagePath: '/cards/cha-16.png',
};

// ==========================================
// CARTA #18 — Nivel II
// ==========================================

const ACT_18: ActionCard = {
  id: 'act-18',
  level: 2,
  cardNumber: 18,
  movement: 3,
  destination: 'Casilla 18',
  destinationSlot: 18,
  tieBreakDirection: 'up',
  attributeBonus: 'alchemy',
  potionBonus: true,
  bombBonus: false,
  trailBonus: false,
  combatRequirement: 'Combatir monstruo en la localización si tienes < 2 trofeos',
  combatCondition: { type: 'trophies_lt', value: 2 },
  marketDiscards: [4],
  imagePath: '/cards/act-18.png',
};

const CHA_18: ChallengeCard = {
  id: 'cha-18',
  level: 2,
  cardNumber: 18,
  damage: 2,
  shields: 0,
  consumableSlot: false,
  attackPotionForDamage: 2,
  schoolSymbol: false,
  reaction: null,
  mutagens: ['blue', 'green'],
  pokerKeepValues: [1, 2, 3, 4, 5],
  pokerPattern: 'Conservar 1, 2, 3, 4 y 5.',
  playerMonsterAttack: 'mordisco',
  imagePath: '/cards/cha-18.png',
};

// ==========================================
// CARTA #10 — Nivel II
// ==========================================

const ACT_10: ActionCard = {
  id: 'act-10',
  level: 2,
  cardNumber: 10,
  movement: 3,
  destination: 'Casilla 10',
  destinationSlot: 10,
  tieBreakDirection: 'down',
  attributeBonus: 'lowest_defense',
  defenseBonusRaisesShield: true,
  potionBonus: false,
  bombBonus: false,
  trailBonus: false,
  combatPriority: 'witcher_then_monster',
  combatRequirement: 'Prioridad brujo/automa; si no, monstruo si tienes < 2 trofeos',
  combatCondition: { type: 'trophies_lt', value: 2 },
  marketDiscards: [4, 5],
  imagePath: '/cards/act-10.png',
};

const CHA_10: ChallengeCard = {
  id: 'cha-10',
  level: 2,
  cardNumber: 10,
  damage: 2,
  shields: 2,
  consumableSlot: false,
  schoolSymbol: false,
  reaction: null,
  mutagens: ['red', 'green'],
  pokerKeepValues: [4, 3, 1, 2, 2],
  pokerPattern: 'Conservar 4, 3, 1, 2 y 2.',
  playerMonsterAttack: 'embestida',
  imagePath: '/cards/cha-10.png',
};

// ==========================================
// CARTA #1 — Nivel II
// ==========================================

const ACT_1: ActionCard = {
  id: 'act-1',
  level: 2,
  cardNumber: 1,
  movement: 3,
  destination: 'Casilla 1',
  destinationSlot: 1,
  tieBreakDirection: 'up',
  attributeBonus: 'highest_special',
  potionBonus: false,
  bombBonus: false,
  trailBonus: false,
  combatRequirement: 'Combatir monstruo en la localización si tienes < 2 trofeos',
  combatCondition: { type: 'trophies_lt', value: 2 },
  marketDiscards: [6],
  imagePath: '/cards/act-1.png',
};

const CHA_1: ChallengeCard = {
  id: 'cha-1',
  level: 2,
  cardNumber: 1,
  damage: 5,
  shields: 0,
  consumableSlot: false,
  attackDiscardTopCard: true,
  schoolSymbol: false,
  reaction: null,
  pokerKeepValues: [5, 3, 3, 3, 3],
  pokerPattern: 'Conservar 5, 3, 3, 3 y 3.',
  playerMonsterAttack: 'mordisco',
  imagePath: '/cards/cha-1.png',
};

/** Todas las cartas de Acción catalogadas (orden de inserción). */
export const ACTION_CARDS: ActionCard[] = [
  ACT_1, ACT_2, ACT_5, ACT_8, ACT_10, ACT_11, ACT_15, ACT_16, ACT_18,
];

/** Todas las cartas de Desafío catalogadas (orden de inserción). */
export const CHALLENGE_CARDS: ChallengeCard[] = [
  CHA_1, CHA_2, CHA_5, CHA_8, CHA_10, CHA_11, CHA_15, CHA_16, CHA_18,
];

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
