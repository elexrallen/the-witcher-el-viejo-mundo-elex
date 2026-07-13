/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type WitcherSchoolId = 'wolf' | 'cat' | 'griffin' | 'bear' | 'viper' | 'manticore';

export interface SchoolSpecialEffect {
  damage: number;
  shields: number;
  description: string;
  effectDetail?: string;
}

export interface SchoolSpecialCard {
  special1: SchoolSpecialEffect;
  special2: SchoolSpecialEffect;
  special3: SchoolSpecialEffect;
  mutagenBonuses: {
    blue: string;
    red: string;
    green: string;
  };
}

export interface WitcherSchool {
  id: WitcherSchoolId;
  name: string;
  color: string;
  iconName: string;
  description: string;
  bonusText: string;
  combatBonus: {
    damage: number;
    shields: number;
    potions: number;
  };
  specialCard?: SchoolSpecialCard;
}

export interface ActionCard {
  id: string;
  level: 'generic' | 1 | 2 | 3;
  movement: number;
  destination: string;
  attributeBonus: string | null;
  potionBonus: boolean;
  bombBonus: boolean;
  trailBonus: boolean;
  combatRequirement: string;
  marketDiscards: number[];
}

export interface ChallengeCard {
  id: string;
  level: 'generic' | 1 | 2 | 3;
  damage: number;
  shields: number;
  consumableSlot: boolean; // Triggers potion/bomb use
  schoolSymbol: boolean;   // Triggers School Bonus
  reaction: {
    type: 'shield' | 'damage' | 'shield_damage' | 'none';
    value: number;
    description: string;
  } | null;
  pokerPattern: string;
}

export interface AutomaState {
  schoolId: WitcherSchoolId;
  difficulty: 'easy' | 'intermediate' | 'difficult';
  attributes: {
    attack: number; // 1-5
    defense: number; // 1-5
    alchemy: number; // 1-5
    special: number; // 1-5
  };
  trophies: number; // 0-4
  potions: number;
  bombs: number;
  trails: {
    red: number;
    blue: number;
    green: number;
    yellow: number;
  };
  location: string;
  mutagens: string[]; // e.g. "red", "blue", "green"
  weaknesses: number; // monster weakness level (0-3)
  destructionTokens: number; // Legendary Hunt
  dagonTrack: number; // Skellige
}

export interface CombatState {
  isActive: boolean;
  opponentType: 'monster' | 'witcher';
  opponentName: string;
  combatDeck: ChallengeCard[];
  combatDiscard: ChallengeCard[];
  revealedCard: ChallengeCard | null;
  damageInflictedThisTurn: number;
  shieldsActiveThisTurn: number;
  potionsConsumedThisTurn: number;
  bombsConsumedThisTurn: number;
  lastReactionTriggered: {
    card: ChallengeCard;
    effectDescription: string;
  } | null;
  fightLog: string[];
}
