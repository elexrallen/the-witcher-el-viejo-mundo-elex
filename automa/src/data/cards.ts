/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Catálogo de cartas del Automa — se construye carta a carta desde las físicas.
 * Cada entrada corresponde a una carta real verificada (imagen + reglas).
 */

import { ActionCard, ChallengeCard } from '../types';
import { MOVEMENT_UNLIMITED } from '../utils/actionCard';
import { LEGENDARY_HUNT_ACTION_CARDS } from './legendaryHunt';

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

// ==========================================
// CARTA #6 — Nivel II
// ==========================================

const ACT_6: ActionCard = {
  id: 'act-6',
  level: 2,
  cardNumber: 6,
  movement: 3,
  destination: 'Casilla 6',
  destinationSlot: 6,
  tieBreakDirection: 'down',
  attributeBonus: 'attack_defense',
  potionBonus: false,
  bombBonus: false,
  trailBonus: false,
  combatPriority: 'witcher_then_monster',
  combatRequirement: 'Prioridad brujo/automa; si no, monstruo si tienes ≤ 2 trofeos',
  combatCondition: { type: 'trophies_lte', value: 2 },
  marketDiscards: [3],
  imagePath: '/cards/act-6.png',
};

const CHA_6: ChallengeCard = {
  id: 'cha-6',
  level: 2,
  cardNumber: 6,
  damage: 2,
  shields: 2,
  consumableSlot: false,
  schoolSymbol: false,
  reaction: null,
  mutagens: ['blue', 'red'],
  pokerKeepValues: [1, 1, 1, 2, 2],
  pokerPattern: 'Conservar 1, 1, 1, 2 y 2.',
  playerMonsterAttack: 'mordisco',
  imagePath: '/cards/cha-6.png',
};

// ==========================================
// CARTA #12 — Nivel II
// ==========================================

const ACT_12: ActionCard = {
  id: 'act-12',
  level: 2,
  cardNumber: 12,
  movement: 4,
  destination: 'Casilla 12',
  destinationSlot: 12,
  tieBreakDirection: 'up',
  attributeBonus: null,
  potionBonus: true,
  potionBonusCount: 2,
  bombBonus: false,
  trailBonus: false,
  combatRequirement: 'Combatir monstruo en la localización si tienes ≤ 2 trofeos',
  combatCondition: { type: 'trophies_lte', value: 2 },
  marketDiscards: [1, 2],
  imagePath: '/cards/act-12.png',
};

const CHA_12: ChallengeCard = {
  id: 'cha-12',
  level: 2,
  cardNumber: 12,
  damage: 3,
  shields: 0,
  consumableSlot: false,
  attackBombExtraCombo: true,
  schoolSymbol: false,
  reaction: null,
  pokerKeepValues: [1, 6, 3, 5, 5],
  pokerPattern: 'Conservar 1, 6, 3, 5 y 5.',
  playerMonsterAttack: 'embestida',
  imagePath: '/cards/cha-12.png',
};

// ==========================================
// CARTA #13 — Nivel II
// ==========================================

const ACT_13: ActionCard = {
  id: 'act-13',
  level: 2,
  cardNumber: 13,
  movement: 2,
  destination: 'Casilla 13',
  destinationSlot: 13,
  tieBreakDirection: 'down',
  attributeBonus: 'defense',
  potionBonus: true,
  bombBonus: false,
  trailBonus: false,
  combatRequirement: 'Combatir monstruo en la localización si tienes ≤ 2 trofeos',
  combatCondition: { type: 'trophies_lte', value: 2 },
  marketDiscards: [2],
  imagePath: '/cards/act-13.png',
};

const CHA_13: ChallengeCard = {
  id: 'cha-13',
  level: 2,
  cardNumber: 13,
  damage: 3,
  shields: 0,
  consumableSlot: false,
  attackBombDiscardTopDamage: 2,
  schoolSymbol: false,
  reaction: null,
  pokerKeepValues: [4, 2, 2, 5, 5],
  pokerPattern: 'Conservar 4, 2, 2, 5 y 5.',
  playerMonsterAttack: 'embestida',
  imagePath: '/cards/cha-13.png',
};

// ==========================================
// CARTA #3 — Nivel III
// ==========================================

const ACT_3: ActionCard = {
  id: 'act-3',
  level: 3,
  cardNumber: 3,
  movement: 3,
  destination: 'Casilla 3',
  destinationSlot: 3,
  tieBreakDirection: 'up',
  attributeBonus: 'attack',
  potionBonus: false,
  bombBonus: false,
  trailBonus: true,
  trailType: 'terrain',
  combatPriority: 'witcher_then_monster',
  combatRequirement: 'Prioridad brujo/automa; si no, monstruo si tienes ≤ 3 trofeos',
  combatCondition: { type: 'trophies_lte', value: 3 },
  marketDiscards: [3],
  imagePath: '/cards/act-3.png',
};

const CHA_3: ChallengeCard = {
  id: 'cha-3',
  level: 3,
  cardNumber: 3,
  damage: 3,
  shields: 2,
  consumableSlot: false,
  attackPotionShuffleDiscardTop: true,
  schoolSymbol: false,
  reaction: null,
  pokerKeepValues: [2, 3, 4, 5, 6],
  pokerPattern: 'Conservar 2, 3, 4, 5 y 6.',
  playerMonsterAttack: 'embestida',
  imagePath: '/cards/cha-3.png',
};

// ==========================================
// CARTA #14 — Nivel III (destino casilla 7)
// ==========================================

const ACT_14: ActionCard = {
  id: 'act-14',
  level: 3,
  cardNumber: 14,
  movement: 3,
  destination: 'Casilla 7',
  destinationSlot: 7,
  tieBreakDirection: 'down',
  attributeBonus: 'special',
  potionBonus: false,
  bombBonus: true,
  bombRequiresModule: true,
  trailBonus: false,
  combatRequirement: 'Combatir monstruo en la localización si tienes ≤ 3 trofeos',
  combatCondition: { type: 'trophies_lte', value: 3 },
  marketDiscards: [2],
  imagePath: '/cards/act-14.png',
};

const CHA_14: ChallengeCard = {
  id: 'cha-14',
  level: 3,
  cardNumber: 14,
  damage: 6,
  shields: 0,
  consumableSlot: false,
  attackDiscardTopCard: true,
  schoolSymbol: false,
  reaction: null,
  pokerKeepValues: [1, 1, 1, 1, 1],
  pokerPattern: 'Conservar 1, 1, 1, 1 y 1.',
  playerMonsterAttack: 'embestida',
  imagePath: '/cards/cha-14.png',
};

// ==========================================
// CARTA #9 — Nivel III
// ==========================================

const ACT_9: ActionCard = {
  id: 'act-9',
  level: 3,
  cardNumber: 9,
  movement: 1,
  destination: 'Casilla 9',
  destinationSlot: 9,
  tieBreakDirection: 'up',
  attributeBonus: 'defense_highest',
  defenseBonusRaisesShield: true,
  potionBonus: false,
  bombBonus: false,
  trailBonus: false,
  phaseIIPriority: 'meditate_or_monster',
  combatRequirement: 'Meditar si puede; si no, monstruo si tienes < 3 trofeos',
  combatCondition: { type: 'trophies_lt', value: 3 },
  marketDiscards: [3, 5],
  imagePath: '/cards/act-9.png',
};

const CHA_9: ChallengeCard = {
  id: 'cha-9',
  level: 3,
  cardNumber: 9,
  damage: 3,
  shields: 1,
  consumableSlot: false,
  schoolSymbol: false,
  reaction: null,
  mutagens: ['blue', 'red', 'green'],
  pokerKeepValues: [3, 1, 1, 6, 6],
  pokerPattern: 'Conservar 3, 1, 1, 6 y 6.',
  playerMonsterAttack: 'mordisco',
  imagePath: '/cards/cha-9.png',
};

// ==========================================
// CARTA #17 — Nivel III
// ==========================================

const ACT_17: ActionCard = {
  id: 'act-17',
  level: 3,
  cardNumber: 17,
  movement: 4,
  destination: 'Casilla 17',
  destinationSlot: 17,
  tieBreakDirection: 'down',
  attributeBonus: 'attack_highest',
  potionBonus: false,
  bombBonus: false,
  trailBonus: false,
  phaseIIPriority: 'meditate_or_monster',
  combatRequirement: 'Meditar si puede; si no, monstruo si tienes < 3 trofeos',
  combatCondition: { type: 'trophies_lt', value: 3 },
  marketDiscards: [1],
  imagePath: '/cards/act-17.png',
};

const CHA_17: ChallengeCard = {
  id: 'cha-17',
  level: 3,
  cardNumber: 17,
  damage: 4,
  shields: 0,
  consumableSlot: false,
  attackBombExtraCombo: true,
  schoolSymbol: false,
  reaction: null,
  greenMutagen: true,
  pokerKeepValues: [2, 2, 5, 5, 5],
  pokerPattern: 'Conservar 2, 2, 5, 5 y 5.',
  playerMonsterAttack: 'mordisco',
  imagePath: '/cards/cha-17.png',
};

// ==========================================
// CARTA #7 — Nivel III (impreso 17, destino casilla 14)
// ==========================================

const ACT_7: ActionCard = {
  id: 'act-7',
  level: 3,
  cardNumber: 17,
  movement: 4,
  destination: 'Casilla 14',
  destinationSlot: 14,
  tieBreakDirection: 'up',
  attributeBonus: 'alchemy',
  potionBonus: false,
  bombBonus: false,
  trailBonus: true,
  trailType: 'terrain',
  phaseIIPriority: 'meditate_or_monster',
  combatRequirement: 'Meditar si puede; si no, monstruo si tienes < 3 trofeos',
  combatCondition: { type: 'trophies_lt', value: 3 },
  marketDiscards: [6],
  imagePath: '/cards/act-7.png',
};

const CHA_7: ChallengeCard = {
  id: 'cha-7',
  level: 3,
  cardNumber: 17,
  damage: 3,
  shields: 0,
  consumableSlot: false,
  schoolSymbol: false,
  reaction: null,
  mutagens: ['blue', 'red', 'green'],
  pokerKeepValues: [1, 2, 3, 3, 3],
  pokerPattern: 'Conservar 1, 2, 3, 3 y 3.',
  playerMonsterAttack: 'embestida',
  imagePath: '/cards/cha-7.png',
};

// ==========================================
// CARTA #4 — Nivel III
// ==========================================

const ACT_4: ActionCard = {
  id: 'act-4',
  level: 3,
  cardNumber: 4,
  movement: 4,
  destination: 'Casilla 4',
  destinationSlot: 4,
  tieBreakDirection: 'down',
  attributeBonus: 'special_highest',
  potionBonus: false,
  bombBonus: false,
  trailBonus: false,
  phaseIIPriority: 'meditate_or_monster',
  combatRequirement: 'Meditar si puede; si no, monstruo si tienes < 3 trofeos',
  combatCondition: { type: 'trophies_lt', value: 3 },
  marketDiscards: [4, 5],
  imagePath: '/cards/act-4.png',
};

const CHA_4: ChallengeCard = {
  id: 'cha-4',
  level: 3,
  cardNumber: 4,
  damage: 0,
  shields: 3,
  consumableSlot: false,
  attackPotionOpponentShieldDamage: true,
  schoolSymbol: false,
  reaction: null,
  mutagens: ['red', 'blue'],
  pokerKeepValues: [4, 6, 1, 3, 3],
  pokerPattern: 'Conservar 4, 6, 1, 3 y 3.',
  playerMonsterAttack: 'mordisco',
  imagePath: '/cards/cha-4.png',
};

// ==========================================
// CARTAS ESPECÍFICAS DE ESCUELA — Nivel I (#19–21)
// ==========================================

const ACT_19: ActionCard = {
  id: 'act-19',
  level: 1,
  cardNumber: 19,
  cardSet: 'school',
  movement: MOVEMENT_UNLIMITED,
  destination: 'Monstruo de nivel más bajo',
  tieBreakDirection: 'down',
  attributeBonus: 'defense_attack',
  defenseBonusRaisesShield: true,
  potionBonus: false,
  bombBonus: false,
  trailBonus: false,
  combatRequirement: 'Combatir monstruo en la localización si tienes < 1 trofeo',
  combatCondition: { type: 'trophies_lt', value: 1 },
  marketDiscards: [1],
  imagePath: '/cards/act-19.png',
};

const CHA_19: ChallengeCard = {
  id: 'cha-19',
  level: 1,
  cardNumber: 19,
  cardSet: 'school',
  damage: 3,
  shields: 0,
  consumableSlot: false,
  schoolSymbol: false,
  reaction: {
    type: 'damage',
    value: 2,
    description: 'Si esta carta es descartada por efecto de un ataque de un oponente, el oponente sufre 2 daños.',
  },
  mutagens: ['red'],
  pokerKeepValues: [1, 6, 6, 5, 5],
  pokerPattern: 'Conservar 1, 6, 6, 5 y 5.',
  playerMonsterAttack: 'embestida',
  imagePath: '/cards/cha-19.png',
};

const ACT_20: ActionCard = {
  id: 'act-20',
  level: 1,
  cardNumber: 20,
  cardSet: 'school',
  movement: MOVEMENT_UNLIMITED,
  destination: 'Monstruo de nivel más bajo',
  tieBreakDirection: 'up',
  attributeBonus: 'defense_special_trail',
  defenseBonusRaisesShield: true,
  potionBonus: false,
  bombBonus: false,
  trailBonus: true,
  trailType: 'terrain',
  combatRequirement: 'Combatir monstruo en la localización si tienes < 1 trofeo',
  combatCondition: { type: 'trophies_lt', value: 1 },
  marketDiscards: [2, 3],
  imagePath: '/cards/act-20.png',
};

const CHA_20: ChallengeCard = {
  id: 'cha-20',
  level: 1,
  cardNumber: 20,
  cardSet: 'school',
  damage: 1,
  shields: 2,
  consumableSlot: false,
  attackPotionForDamage: 2,
  schoolSymbol: false,
  reaction: null,
  mutagens: ['blue'],
  pokerKeepValues: [4, 2, 6, 6, 6],
  pokerPattern: 'Conservar 4, 2, 6, 6 y 6.',
  playerMonsterAttack: 'mordisco',
  imagePath: '/cards/cha-20.png',
};

const ACT_21: ActionCard = {
  id: 'act-21',
  level: 1,
  cardNumber: 21,
  cardSet: 'school',
  movement: MOVEMENT_UNLIMITED,
  destination: 'Monstruo de nivel más bajo',
  tieBreakDirection: 'down',
  attributeBonus: 'alchemy_attack',
  potionBonus: false,
  bombBonus: false,
  trailBonus: false,
  combatRequirement: 'Combatir monstruo en la localización si tienes < 1 trofeo',
  combatCondition: { type: 'trophies_lt', value: 1 },
  marketDiscards: [4],
  imagePath: '/cards/act-21.png',
};

const CHA_21: ChallengeCard = {
  id: 'cha-21',
  level: 1,
  cardNumber: 21,
  cardSet: 'school',
  damage: 2,
  shields: 1,
  consumableSlot: false,
  attackShuffleDiscardTopCount: 2,
  schoolSymbol: false,
  reaction: null,
  greenMutagen: true,
  pokerKeepValues: [1, 2, 3, 5, 5],
  pokerPattern: 'Conservar 1, 2, 3, 5 y 5.',
  playerMonsterAttack: 'embestida',
  imagePath: '/cards/cha-21.png',
};

// ==========================================
// CARTAS ESPECÍFICAS DE ESCUELA — Nivel II (#22–23)
// ==========================================

const ACT_22: ActionCard = {
  id: 'act-22',
  level: 2,
  cardNumber: 22,
  cardSet: 'school',
  movement: MOVEMENT_UNLIMITED,
  destination: 'Monstruo de nivel más bajo',
  tieBreakDirection: 'up',
  attributeBonus: 'highest',
  potionBonus: false,
  bombBonus: true,
  bombRequiresModule: true,
  trailBonus: false,
  combatRequirement: 'Combatir monstruo en la localización si tienes ≤ 2 trofeos',
  combatCondition: { type: 'trophies_lte', value: 2 },
  marketDiscards: [3, 4],
  imagePath: '/cards/act-22.png',
};

const CHA_22: ChallengeCard = {
  id: 'cha-22',
  level: 2,
  cardNumber: 22,
  cardSet: 'school',
  damage: 3,
  shields: 1,
  consumableSlot: false,
  schoolSymbol: false,
  reaction: {
    type: 'damage',
    value: 2,
    description: 'Si esta carta es descartada por efecto de un ataque de un oponente, el oponente sufre 2 daños.',
  },
  mutagens: ['red', 'blue'],
  pokerKeepValues: [2, 3, 4, 5, 6],
  pokerPattern: 'Conservar 2, 3, 4, 5 y 6.',
  playerMonsterAttack: 'embestida',
  imagePath: '/cards/cha-22.png',
};

const ACT_23: ActionCard = {
  id: 'act-23',
  level: 2,
  cardNumber: 23,
  cardSet: 'school',
  movement: MOVEMENT_UNLIMITED,
  destination: 'Monstruo de nivel más bajo',
  tieBreakDirection: 'down',
  attributeBonus: 'lowest',
  potionBonus: true,
  bombBonus: false,
  trailBonus: false,
  combatRequirement: 'Combatir monstruo en la localización si tienes ≤ 2 trofeos',
  combatCondition: { type: 'trophies_lte', value: 2 },
  marketDiscards: [1],
  imagePath: '/cards/act-23.png',
};

const CHA_23: ChallengeCard = {
  id: 'cha-23',
  level: 2,
  cardNumber: 23,
  cardSet: 'school',
  damage: 5,
  shields: 0,
  consumableSlot: false,
  schoolSymbol: false,
  reaction: null,
  mutagens: ['red', 'green'],
  pokerKeepValues: [1, 2, 2, 5, 5],
  pokerPattern: 'Conservar 1, 2, 2, 5 y 5.',
  playerMonsterAttack: 'embestida',
  imagePath: '/cards/cha-23.png',
};

// ==========================================
// CARTAS ESPECÍFICAS DE ESCUELA — Nivel II (#24)
// ==========================================

const ACT_24: ActionCard = {
  id: 'act-24',
  level: 2,
  cardNumber: 24,
  cardSet: 'school',
  movement: MOVEMENT_UNLIMITED,
  destination: 'Monstruo de nivel más bajo',
  tieBreakDirection: 'up',
  attributeBonus: null,
  potionBonus: true,
  bombBonus: true,
  bombRequiresModule: true,
  trailBonus: true,
  trailType: 'terrain',
  combatRequirement: 'Combatir monstruo en la localización si tienes ≤ 2 trofeos',
  combatCondition: { type: 'trophies_lte', value: 2 },
  marketDiscards: [2],
  imagePath: '/cards/act-24.png',
};

const CHA_24: ChallengeCard = {
  id: 'cha-24',
  level: 2,
  cardNumber: 24,
  cardSet: 'school',
  damage: 2,
  shields: 2,
  consumableSlot: false,
  attackExtraCombo: true,
  schoolSymbol: false,
  reaction: null,
  mutagens: ['blue', 'green'],
  pokerKeepValues: [3, 1, 1, 6, 6],
  pokerPattern: 'Conservar 3, 1, 1, 6 y 6.',
  playerMonsterAttack: 'mordisco',
  imagePath: '/cards/cha-24.png',
};

// ==========================================
// CARTAS ESPECÍFICAS DE ESCUELA — Nivel III (#26, #27, #29)
// ==========================================

const ACT_29: ActionCard = {
  id: 'act-29',
  level: 3,
  cardNumber: 29,
  cardSet: 'school',
  movement: MOVEMENT_UNLIMITED,
  destination: 'Monstruo de nivel más bajo',
  tieBreakDirection: 'down',
  attributeBonus: 'highest',
  potionBonus: false,
  bombBonus: false,
  trailBonus: true,
  trailType: 'terrain',
  combatRequirement: 'Combatir monstruo en la localización',
  combatCondition: { type: 'always' },
  marketDiscards: [4],
  imagePath: '/cards/act-29.png',
};

const CHA_29: ChallengeCard = {
  id: 'cha-29',
  level: 3,
  cardNumber: 29,
  cardSet: 'school',
  damage: 0,
  shields: 0,
  consumableSlot: false,
  schoolSpecialEffect: 1,
  schoolSymbol: false,
  reaction: null,
  mutagens: ['red', 'green'],
  pokerKeepValues: [2, 3, 4, 5, 6],
  pokerPattern: 'Conservar 2, 3, 4, 5 y 6.',
  playerMonsterAttack: 'mordisco',
  imagePath: '/cards/cha-29.png',
};

const ACT_26: ActionCard = {
  id: 'act-26',
  level: 3,
  cardNumber: 26,
  cardSet: 'school',
  movement: MOVEMENT_UNLIMITED,
  destination: 'Monstruo de nivel más bajo',
  tieBreakDirection: 'up',
  attributeBonus: 'special_alchemy',
  potionBonus: false,
  bombBonus: false,
  trailBonus: false,
  combatRequirement: 'Combatir monstruo en la localización',
  combatCondition: { type: 'always' },
  marketDiscards: [3],
  imagePath: '/cards/act-26.png',
};

const CHA_26: ChallengeCard = {
  id: 'cha-26',
  level: 3,
  cardNumber: 26,
  cardSet: 'school',
  damage: 0,
  shields: 0,
  consumableSlot: false,
  schoolSpecialEffect: 2,
  schoolSymbol: false,
  reaction: null,
  mutagens: ['blue', 'green'],
  pokerKeepValues: [5, 5, 6, 6, 6],
  pokerPattern: 'Conservar 5, 5, 6, 6 y 6.',
  playerMonsterAttack: 'embestida',
  imagePath: '/cards/cha-26.png',
};

const ACT_27: ActionCard = {
  id: 'act-27',
  level: 3,
  cardNumber: 27,
  cardSet: 'school',
  movement: MOVEMENT_UNLIMITED,
  destination: 'Monstruo de nivel más bajo',
  tieBreakDirection: 'down',
  attributeBonus: null,
  potionBonus: true,
  bombBonus: true,
  bombRequiresModule: true,
  trailBonus: false,
  combatRequirement: 'Combatir monstruo en la localización',
  combatCondition: { type: 'always' },
  marketDiscards: [1, 2],
  imagePath: '/cards/act-27.png',
};

const CHA_27: ChallengeCard = {
  id: 'cha-27',
  level: 3,
  cardNumber: 27,
  cardSet: 'school',
  damage: 0,
  shields: 0,
  consumableSlot: false,
  schoolSpecialEffect: 3,
  schoolSymbol: false,
  reaction: null,
  mutagens: ['blue', 'red'],
  pokerKeepValues: [4, 6, 6, 6, 6],
  pokerPattern: 'Conservar 4, 6, 6, 6 y 6.',
  playerMonsterAttack: 'mordisco',
  imagePath: '/cards/cha-27.png',
};

/** Cartas de Acción genéricas (mazo común). */
export const ACTION_CARDS: ActionCard[] = [
  ACT_1, ACT_2, ACT_3, ACT_4, ACT_5, ACT_6, ACT_7, ACT_8, ACT_9, ACT_10, ACT_11, ACT_12, ACT_13, ACT_14, ACT_15, ACT_16, ACT_17, ACT_18,
];

/** Cartas de Acción específicas de escuela (compartidas por todas las escuelas). */
export const SCHOOL_ACTION_CARDS: ActionCard[] = [
  ACT_19, ACT_20, ACT_21, ACT_22, ACT_23, ACT_24, ACT_26, ACT_27, ACT_29,
];

/** Cartas de Desafío genéricas catalogadas (orden de inserción). */
export const CHALLENGE_CARDS: ChallengeCard[] = [
  CHA_1, CHA_2, CHA_5, CHA_6, CHA_8, CHA_10, CHA_11, CHA_12, CHA_13, CHA_15, CHA_16, CHA_18,
];

/** Cartas de Desafío específicas de escuela (nivel III van a reserva vía deckBuilder). */
export const SCHOOL_CHALLENGE_CARDS: ChallengeCard[] = [
  CHA_19, CHA_20, CHA_21, CHA_22, CHA_23, CHA_24, CHA_26, CHA_27, CHA_29,
];

/**
 * Cartas de Desafío nivel 3 apartadas del mazo inicial.
 * Se añaden al mazo cuando el Automa medita o gana trofeos.
 */
export const LEVEL_3_CHALLENGE_RESERVE: ChallengeCard[] = [
  CHA_3, CHA_4, CHA_7, CHA_9, CHA_14, CHA_17,
];

export function getCatalogStats() {
  const genericChallengeCount = CHALLENGE_CARDS.length + LEVEL_3_CHALLENGE_RESERVE.length;
  const schoolChallengeCount = SCHOOL_CHALLENGE_CARDS.length;
  const totalActionCount = ACTION_CARDS.length + SCHOOL_ACTION_CARDS.length;
  const totalChallengeCount = genericChallengeCount + schoolChallengeCount;

  return {
    /** Total cartas de Acción catalogadas (genéricas + escuela). */
    actionCount: totalActionCount,
    /** Cartas LH disponibles (se añaden al pool niv. III según dificultad). */
    legendaryHuntActionCount: LEGENDARY_HUNT_ACTION_CARDS.length,
    /** Total cartas de Desafío catalogadas (genéricas + escuela, incluida reserva). */
    challengeCount: totalChallengeCount,
    genericActionCount: ACTION_CARDS.length,
    genericChallengeCount,
    schoolActionCount: SCHOOL_ACTION_CARDS.length,
    schoolChallengeCount,
    /** Cartas Lvl III genéricas disponibles para mazo/reserva de trofeos. */
    genericChallengeL3PoolCount: LEVEL_3_CHALLENGE_RESERVE.length,
    /** Reserva de trofeos al iniciar partida (manual). */
    trophyReserveCount: 3,
  };
}
