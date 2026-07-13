/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ActionCard, ChallengeCard } from '../types';

// ==========================================
// ACTION CARDS (Mazo de Acción del Automa)
// ==========================================

export const GENERIC_ACTION_CARDS: ActionCard[] = [
  {
    id: 'act-2',
    level: 'generic',
    movement: 4,
    destination: 'Monstruo de nivel más alto',
    attributeBonus: 'attack',
    potionBonus: true,
    bombBonus: false,
    trailBonus: true,
    combatRequirement: 'Combate siempre (Trofeos ≥ 0)',
    marketDiscards: [1, 6]
  },
  {
    id: 'act-15',
    level: 'generic',
    movement: 2,
    destination: 'Monstruo de nivel más bajo',
    attributeBonus: 'defense',
    potionBonus: false,
    bombBonus: true,
    trailBonus: true,
    combatRequirement: 'Combate si tienes ≥ 1 Trofeo',
    marketDiscards: [1, 5]
  },
  {
    id: 'act-8',
    level: 'generic',
    movement: 1,
    destination: 'Monstruo de nivel más alto',
    attributeBonus: 'alchemy',
    potionBonus: true,
    bombBonus: false,
    trailBonus: true,
    combatRequirement: 'Combate si tienes ≥ 1 Trofeo',
    marketDiscards: [3, 4]
  }
];

export const LEVEL_1_ACTION_CARDS: ActionCard[] = [
  {
    id: 'act-11',
    level: 1,
    movement: 3,
    destination: 'Monstruo de nivel más bajo',
    attributeBonus: 'special',
    potionBonus: true,
    bombBonus: true,
    trailBonus: false,
    combatRequirement: 'Combate siempre (Trofeos ≥ 0)',
    marketDiscards: [2, 5]
  },
  {
    id: 'act-5',
    level: 1,
    movement: 3,
    destination: 'Monstruo de nivel más alto',
    attributeBonus: 'attack',
    potionBonus: false,
    bombBonus: true,
    trailBonus: true,
    combatRequirement: 'Combate siempre (Trofeos ≥ 0)',
    marketDiscards: [1, 3, 5]
  },
  {
    id: 'act-16',
    level: 1,
    movement: 4,
    destination: 'Monstruo de nivel más bajo',
    attributeBonus: 'defense',
    potionBonus: true,
    bombBonus: false,
    trailBonus: false,
    combatRequirement: 'Combate si tienes ≥ 2 Trofeos',
    marketDiscards: [2, 6]
  },
  {
    id: 'act-19',
    level: 1,
    movement: 99,
    destination: 'Monstruo de nivel más bajo',
    attributeBonus: 'attack_defense',
    potionBonus: false,
    bombBonus: false,
    trailBonus: false,
    combatRequirement: 'Combate si tienes < 1 Trofeo (0 trofeos)',
    marketDiscards: [2]
  },
  {
    id: 'act-20',
    level: 1,
    movement: 99,
    destination: 'Monstruo de nivel más alto',
    attributeBonus: 'defense_special_any',
    potionBonus: false,
    bombBonus: false,
    trailBonus: false,
    combatRequirement: 'Combate si tienes < 1 Trofeo (0 trofeos)',
    marketDiscards: [2, 3]
  },
  {
    id: 'act-21',
    level: 1,
    movement: 99,
    destination: 'Monstruo de nivel más bajo',
    attributeBonus: 'attack_alchemy',
    potionBonus: false,
    bombBonus: false,
    trailBonus: false,
    combatRequirement: 'Combate si tienes < 1 Trofeo (0 trofeos)',
    marketDiscards: [4]
  }
];

export const LEVEL_2_ACTION_CARDS: ActionCard[] = [
  {
    id: 'act-1',
    level: 2,
    movement: 3,
    destination: 'Monstruo de nivel más alto',
    attributeBonus: 'attack',
    potionBonus: true,
    bombBonus: false,
    trailBonus: true,
    combatRequirement: 'Combate si tienes ≥ 1 Trofeo',
    marketDiscards: [1, 4]
  },
  {
    id: 'act-6',
    level: 2,
    movement: 3,
    destination: 'Monstruo de nivel más bajo',
    attributeBonus: 'defense',
    potionBonus: false,
    bombBonus: true,
    trailBonus: true,
    combatRequirement: 'Combate si tienes ≥ 1 Trofeo',
    marketDiscards: [2, 5]
  },
  {
    id: 'act-10',
    level: 2,
    movement: 3,
    destination: 'Monstruo de nivel más bajo',
    attributeBonus: 'alchemy',
    potionBonus: true,
    bombBonus: true,
    trailBonus: false,
    combatRequirement: 'Combate siempre (Trofeos ≥ 0)',
    marketDiscards: [3, 6]
  },
  {
    id: 'act-12',
    level: 2,
    movement: 4,
    destination: 'Monstruo de nivel más alto',
    attributeBonus: 'special',
    potionBonus: true,
    bombBonus: false,
    trailBonus: true,
    combatRequirement: 'Combate siempre (Trofeos ≥ 0)',
    marketDiscards: [1, 5]
  },
  {
    id: 'act-13',
    level: 2,
    movement: 2,
    destination: 'Monstruo de nivel más bajo',
    attributeBonus: 'attack',
    potionBonus: false,
    bombBonus: true,
    trailBonus: false,
    combatRequirement: 'Combate si tienes ≥ 2 Trofeos',
    marketDiscards: [2, 4]
  },
  {
    id: 'act-18',
    level: 2,
    movement: 3,
    destination: 'Monstruo de nivel más alto',
    attributeBonus: 'defense',
    potionBonus: true,
    bombBonus: true,
    trailBonus: true,
    combatRequirement: 'Combate si tienes ≥ 1 Trofeo',
    marketDiscards: [3, 4, 5]
  },
  {
    id: 'act-22',
    level: 2,
    movement: 99,
    destination: 'Monstruo de nivel más alto',
    attributeBonus: 'highest',
    potionBonus: false,
    bombBonus: true,
    trailBonus: false,
    combatRequirement: 'Combate si tienes ≤ 2 Trofeos',
    marketDiscards: [3, 4]
  },
  {
    id: 'act-23',
    level: 2,
    movement: 99,
    destination: 'Monstruo de nivel más bajo',
    attributeBonus: 'lowest',
    potionBonus: true,
    bombBonus: false,
    trailBonus: false,
    combatRequirement: 'Combate si tienes ≤ 2 Trofeos',
    marketDiscards: [1]
  },
  {
    id: 'act-24',
    level: 2,
    movement: 99,
    destination: 'Monstruo de nivel más alto',
    attributeBonus: 'special',
    potionBonus: true,
    bombBonus: true,
    trailBonus: false,
    combatRequirement: 'Combate si tienes ≤ 2 Trofeos',
    marketDiscards: [2]
  }
];

export const LEVEL_3_ACTION_CARDS: ActionCard[] = [
  {
    id: 'act-3',
    level: 3,
    movement: 3,
    destination: 'Monstruo de nivel más alto',
    attributeBonus: 'alchemy',
    potionBonus: true,
    bombBonus: true,
    trailBonus: true,
    combatRequirement: 'Combate siempre (Trofeos ≥ 0)',
    marketDiscards: [1, 3, 6]
  },
  {
    id: 'act-4',
    level: 3,
    movement: 4,
    destination: 'Monstruo de nivel más bajo',
    attributeBonus: 'special',
    potionBonus: true,
    bombBonus: true,
    trailBonus: true,
    combatRequirement: 'Combate si tienes ≥ 1 Trofeo',
    marketDiscards: [2, 4, 6]
  },
  {
    id: 'act-7',
    level: 3,
    movement: 3,
    destination: 'Monstruo de nivel más bajo',
    attributeBonus: 'attack',
    potionBonus: true,
    bombBonus: true,
    trailBonus: true,
    combatRequirement: 'Combate si tienes ≥ 2 Trofeos',
    marketDiscards: [1, 2, 5]
  },
  {
    id: 'act-9',
    level: 3,
    movement: 1,
    destination: 'Monstruo de nivel más alto',
    attributeBonus: 'defense',
    potionBonus: true,
    bombBonus: true,
    trailBonus: true,
    combatRequirement: 'Combate siempre (Trofeos ≥ 0)',
    marketDiscards: [3, 5, 6]
  },
  {
    id: 'act-14',
    level: 3,
    movement: 4,
    destination: 'Monstruo de nivel más alto',
    attributeBonus: 'alchemy',
    potionBonus: true,
    bombBonus: true,
    trailBonus: true,
    combatRequirement: 'Combate si tienes ≥ 1 Trofeo',
    marketDiscards: [1, 3, 5]
  },
  {
    id: 'act-17',
    level: 3,
    movement: 4,
    destination: 'Monstruo de nivel más bajo',
    attributeBonus: 'special',
    potionBonus: true,
    bombBonus: true,
    trailBonus: true,
    combatRequirement: 'Combate siempre (Trofeos ≥ 0)',
    marketDiscards: [2, 4, 5, 6]
  },
  {
    id: 'act-25',
    level: 3,
    movement: 99,
    destination: 'Monstruo de nivel más bajo',
    attributeBonus: 'highest_special',
    potionBonus: false,
    bombBonus: false,
    trailBonus: false,
    combatRequirement: 'Combate siempre (Trofeos ≥ 0)',
    marketDiscards: [4]
  },
  {
    id: 'act-26',
    level: 3,
    movement: 99,
    destination: 'Monstruo de nivel más alto',
    attributeBonus: 'alchemy_any',
    potionBonus: false,
    bombBonus: false,
    trailBonus: false,
    combatRequirement: 'Combate siempre (Trofeos ≥ 0)',
    marketDiscards: [3]
  },
  {
    id: 'act-27',
    level: 3,
    movement: 99,
    destination: 'Monstruo de nivel más bajo',
    attributeBonus: null,
    potionBonus: true,
    bombBonus: true,
    trailBonus: false,
    combatRequirement: 'Combate siempre (Trofeos ≥ 0)',
    marketDiscards: [1, 2]
  }
];


// ==========================================
// CHALLENGE CARDS (Mazo de Desafío y Combate)
// ==========================================

export const GENERIC_CHALLENGE_CARDS: ChallengeCard[] = [
  {
    id: 'cha-2',
    level: 'generic',
    damage: 2,
    shields: 1,
    consumableSlot: false,
    schoolSymbol: false,
    reaction: null,
    pokerPattern: 'Mantener valores consecutivos.'
  },
  {
    id: 'cha-15',
    level: 'generic',
    damage: 2,
    shields: 0,
    consumableSlot: true,
    schoolSymbol: true,
    reaction: null,
    pokerPattern: 'Mantener Parejas.'
  },
  {
    id: 'cha-8',
    level: 'generic',
    damage: 2,
    shields: 1,
    consumableSlot: false,
    schoolSymbol: true,
    reaction: {
      type: 'shield',
      value: 3,
      description: 'Defensa de Aard: Sube tu nivel de escudo al máximo de inmediato.'
    },
    pokerPattern: 'Mantener Parejas o Dobles Parejas.'
  }
];

export const LEVEL_1_CHALLENGE_CARDS: ChallengeCard[] = [
  {
    id: 'cha-11',
    level: 1,
    damage: 1,
    shields: 2,
    consumableSlot: false,
    schoolSymbol: true,
    reaction: {
      type: 'shield',
      value: 1,
      description: 'Esquiva Rápida: Absorbe 1 de daño entrante.'
    },
    pokerPattern: 'Relanzar todo excepto el dado más alto.'
  },
  {
    id: 'cha-5',
    level: 1,
    damage: 2,
    shields: 1,
    consumableSlot: false,
    schoolSymbol: true,
    reaction: {
      type: 'damage',
      value: 2,
      description: 'Barrera de Quen Explosiva: El oponente sufre 2 daños directos inmediatamente.'
    },
    pokerPattern: 'Mantener Parejas, Tríos o Póker.'
  },
  {
    id: 'cha-16',
    level: 1,
    damage: 2,
    shields: 2,
    consumableSlot: false,
    schoolSymbol: true,
    reaction: null,
    pokerPattern: 'Mantener valores consecutivos para intentar Escalera.'
  },
  {
    id: 'cha-19',
    level: 1,
    damage: 3,
    shields: 0,
    consumableSlot: true,
    schoolSymbol: true,
    reaction: {
      type: 'damage',
      value: 2,
      description: 'Ataque de Represalia: El oponente sufre 2 daños directos adicionales de inmediato.'
    },
    pokerPattern: 'Intentar Póker: Mantener cuatro dados iguales de valor 5.'
  },
  {
    id: 'cha-20',
    level: 1,
    damage: 1,
    shields: 2,
    consumableSlot: true,
    schoolSymbol: true,
    reaction: {
      type: 'damage',
      value: 2,
      description: 'Efecto de Alquimia: El Automa consume 1 poción para infligir 2 daños directos adicionales de inmediato.'
    },
    pokerPattern: 'Intentar Póker: Mantener cuatro dados iguales de valor 5.'
  },
  {
    id: 'cha-21',
    level: 1,
    damage: 2,
    shields: 1,
    consumableSlot: true,
    schoolSymbol: true,
    reaction: {
      type: 'none',
      value: 0,
      description: 'Descarte de Combate: El oponente debe descartar 2 cartas de su mano de inmediato.'
    },
    pokerPattern: 'Intentar Escalera: Mantener valores consecutivos de 1 a 5.'
  }
];

export const LEVEL_2_CHALLENGE_CARDS: ChallengeCard[] = [
  {
    id: 'cha-1',
    level: 2,
    damage: 2,
    shields: 2,
    consumableSlot: false,
    schoolSymbol: true,
    reaction: null,
    pokerPattern: 'Mantener Tríos.'
  },
  {
    id: 'cha-6',
    level: 2,
    damage: 2,
    shields: 1,
    consumableSlot: false,
    schoolSymbol: true,
    reaction: {
      type: 'shield_damage',
      value: 2,
      description: 'Bloqueo Activo Quen: Cancela 1 punto de daño e inflige 1 daño de contragolpe.'
    },
    pokerPattern: 'Mantener valores consecutivos.'
  },
  {
    id: 'cha-10',
    level: 2,
    damage: 2,
    shields: 1,
    consumableSlot: false,
    schoolSymbol: true,
    reaction: {
      type: 'shield',
      value: 2,
      description: 'Esquiva Desafiante Aard: Cancela hasta 2 puntos de daño entrante.'
    },
    pokerPattern: 'Mantener Parejas de valor alto.'
  },
  {
    id: 'cha-12',
    level: 2,
    damage: 2,
    shields: 1,
    consumableSlot: true,
    schoolSymbol: true,
    reaction: null,
    pokerPattern: 'Relanzar todo excepto el dado más alto.'
  },
  {
    id: 'cha-13',
    level: 2,
    damage: 2,
    shields: 1,
    consumableSlot: true,
    schoolSymbol: true,
    reaction: null,
    pokerPattern: 'Intentar Full House: Mantener parejas/tríos.'
  },
  {
    id: 'cha-18',
    level: 2,
    damage: 2,
    shields: 1,
    consumableSlot: true,
    schoolSymbol: true,
    reaction: null,
    pokerPattern: 'Mantener Parejas, relanzar el resto.'
  },
  {
    id: 'cha-22',
    level: 2,
    damage: 3,
    shields: 1,
    consumableSlot: true,
    schoolSymbol: true,
    reaction: {
      type: 'damage',
      value: 2,
      description: 'Contraataque Fulminante: El oponente sufre 2 daños directos de inmediato.'
    },
    pokerPattern: 'Intentar Póker o Escalera.'
  },
  {
    id: 'cha-23',
    level: 2,
    damage: 4,
    shields: 0,
    consumableSlot: true,
    schoolSymbol: true,
    reaction: {
      type: 'none',
      value: 0,
      description: 'Intimidación: El oponente debe descartar 2 cartas de su mano de inmediato.'
    },
    pokerPattern: 'Intentar Escalera: Conservar secuencia consecutiva.'
  },
  {
    id: 'cha-24',
    level: 2,
    damage: 2,
    shields: 2,
    consumableSlot: true,
    schoolSymbol: true,
    reaction: {
      type: 'none',
      value: 0,
      description: 'Robo de Combate: El Automa roba 1 carta de combate de su mazo de inmediato.'
    },
    pokerPattern: 'Intentar Full House: Mantener parejas y tríos.'
  }
];

export const LEVEL_3_CHALLENGE_CARDS: ChallengeCard[] = [
  {
    id: 'cha-3',
    level: 3,
    damage: 3,
    shields: 2,
    consumableSlot: true,
    schoolSymbol: true,
    reaction: null,
    pokerPattern: 'Mantener valores consecutivos.'
  },
  {
    id: 'cha-7',
    level: 3,
    damage: 3,
    shields: 2,
    consumableSlot: false,
    schoolSymbol: true,
    reaction: {
      type: 'shield',
      value: 3,
      description: 'Barrera Infranqueable: Absorbe hasta 3 de daño entrante.'
    },
    pokerPattern: 'Mantener Repóker (5 iguales) o Full House.'
  },
  {
    id: 'cha-9',
    level: 3,
    damage: 3,
    shields: 3,
    consumableSlot: false,
    schoolSymbol: true,
    reaction: null,
    pokerPattern: 'Mantener Full House, tríos o parejas.'
  },
  {
    id: 'cha-17',
    level: 3,
    damage: 3,
    shields: 2,
    consumableSlot: true,
    schoolSymbol: true,
    reaction: null,
    pokerPattern: 'Mantener consecutivos.'
  },
  {
    id: 'cha-14',
    level: 3,
    damage: 3,
    shields: 3,
    consumableSlot: false,
    schoolSymbol: true,
    reaction: null,
    pokerPattern: 'Mantener consecutivos.'
  },
  {
    id: 'cha-4',
    level: 3,
    damage: 3,
    shields: 2,
    consumableSlot: false,
    schoolSymbol: true,
    reaction: {
      type: 'damage',
      value: 3,
      description: 'Reflejo Rúnico Supremo: Devuelve daño directo igual a los escudos actuales del Automa.'
    },
    pokerPattern: 'Mantener consecutivos para intentar Escalera.'
  },
  {
    id: 'cha-25',
    level: 3,
    damage: 3,
    shields: 0,
    consumableSlot: true,
    schoolSymbol: true,
    reaction: {
      type: 'none',
      value: 0,
      description: 'Especial 1: Activa el efecto Especial 1 de la Cacería Legendaria o la expansión correspondiente.'
    },
    pokerPattern: 'Intentar Escalera Mayor.'
  },
  {
    id: 'cha-26',
    level: 3,
    damage: 2,
    shields: 0,
    consumableSlot: true,
    schoolSymbol: true,
    reaction: {
      type: 'none',
      value: 0,
      description: 'Especial 2: Activa el efecto Especial 2 de la Cacería Legendaria o la expansión correspondiente.'
    },
    pokerPattern: 'Intentar Escalera de valor alto.'
  },
  {
    id: 'cha-27',
    level: 3,
    damage: 3,
    shields: 0,
    consumableSlot: true,
    schoolSymbol: true,
    reaction: {
      type: 'none',
      value: 0,
      description: 'Especial 3: Activa el efecto Especial 3 de la Cacería Legendaria o la expansión correspondiente.'
    },
    pokerPattern: 'Intentar Full House: Mantener parejas y tríos.'
  }
];
