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
  /** Baraja la carta superior del descarte en el mazo de combate. */
  shuffleDiscardTop?: boolean;
  /** Baraja la carta superior del descarte N veces. */
  shuffleDiscardTopCount?: number;
  /** Añade pociones al inventario del Automa. */
  gainPotions?: number;
  /** Gasta 1 poción para infligir este daño adicional. */
  spendPotionForDamage?: number;
  /** Tras resolver, el Automa juega N combos adicionales inmediatamente. */
  attackExtraComboCount?: number;
  /** Sube los escudos activos al máximo (nivel Defensa). */
  raiseShieldToMax?: boolean;
  /** Ignora todo el daño del próximo turno de combate del oponente. */
  ignoreNextOpponentDamage?: boolean;
  /** El próximo ataque del Automa recibe este bonus de daño. */
  nextAttackDamageBonus?: number;
}

export interface SchoolMutagenCombatBonus {
  damage?: number;
  shields?: number;
  shuffleDiscardTop?: boolean;
  shuffleDiscardTopCount?: number;
  gainPotions?: number;
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
  /** Efectos mecánicos de mutágenos en combate (si el Automa los ha adquirido). */
  mutagenCombat?: {
    blue?: SchoolMutagenCombatBonus;
    red?: SchoolMutagenCombatBonus;
    green?: SchoolMutagenCombatBonus;
  };
  imagePath?: string;
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
  /** Imagen de la carta de habilidades especiales de la escuela. */
  specialCardImagePath?: string;
}

export type TieBreakDirection = 'up' | 'down' | 'left' | 'right';
export type TrailColor = 'red' | 'blue' | 'green' | 'yellow';
export type TrailType = 'none' | 'random' | 'terrain';

export type CombatCondition =
  | { type: 'always' }
  | { type: 'trophies_gte'; value: number }
  | { type: 'trophies_lte'; value: number }
  | { type: 'trophies_lt'; value: number };

export type CombatPriority = 'monster' | 'witcher_then_monster';

export interface ActionCard {
  id: string;
  level: 'generic' | 1 | 2 | 3;
  cardNumber?: number;
  movement: number;
  /** Texto legible del destino (p. ej. «Casilla 2» o «Monstruo de nivel más alto»). */
  destination: string;
  /** Número de casilla impreso en la carta (1–6), si aplica. */
  destinationSlot?: number;
  /** Flecha de desempate de prioridad de movimiento. */
  tieBreakDirection?: TieBreakDirection;
  attributeBonus: string | null;
  /** Si true, al subir Defensa en Fase I el escudo en combate refleja el nivel de Defensa. */
  defenseBonusRaisesShield?: boolean;
  potionBonus: boolean;
  /** Cantidad de pociones ganadas con potionBonus (por defecto 1). */
  potionBonusCount?: number;
  bombBonus: boolean;
  /** Si true, el bono de bomba solo aplica con el módulo de bombas activo. */
  bombRequiresModule?: boolean;
  trailBonus: boolean;
  /** random = color aleatorio; terrain = rastro del terreno de la localización actual. */
  trailType?: TrailType;
  combatRequirement: string;
  combatCondition?: CombatCondition;
  /** Prioridad en Fase II: brujo/automa antes que monstruo. */
  combatPriority?: CombatPriority;
  /** Meditar si puede; si no, combate con monstruo si cumple combatCondition. */
  phaseIIPriority?: 'meditate_or_monster';
  marketDiscards: number[];
  /** Genérica (mazo común) o específica de escuela. */
  cardSet?: 'generic' | 'school' | 'legendary_hunt';
  /** Fase II: combate con Monstruo Legendario si comparte espacio. */
  legendaryMonsterCombat?: boolean;
  /** Si el Monstruo Legendario sigue vivo, la carta va al fondo del mazo de Acción. */
  returnToDeckBottomIfLegendaryAlive?: boolean;
  /** Ruta a imagen de la carta física (opcional). */
  imagePath?: string;
}

export interface ChallengeCard {
  id: string;
  level: 'generic' | 1 | 2 | 3;
  cardNumber?: number;
  damage: number;
  shields: number;
  consumableSlot: boolean; // Triggers potion/bomb use
  /** Daño extra al consumir poción con consumableSlot (por defecto +2, o +4 Mantícora). */
  potionDamageBonus?: number;
  /** Daño extra al consumir poción en el ataque (p. ej. descartar poción → +2). */
  attackPotionForDamage?: number;
  /** Descarta la carta superior del mazo (sin barajar) al atacar con esta carta. */
  attackDiscardTopCard?: boolean;
  /** Gasta 1 bomba: descarta la carta superior del mazo y suma este daño. */
  attackBombDiscardTopDamage?: number;
  /** Gasta 1 bomba: tras resolver, juega otro combo de inmediato. */
  attackBombExtraCombo?: boolean;
  /** Tras resolver, juega otro combo de inmediato (sin gastar bomba). */
  attackExtraCombo?: boolean;
  /** Al atacar, aplica el efecto Especial 1/2/3 de la carta de habilidad de la escuela. */
  schoolSpecialEffect?: 1 | 2 | 3;
  /** Gasta 1 poción: baraja la carta superior del descarte en el mazo de combate. */
  attackPotionShuffleDiscardTop?: boolean;
  /** Gasta 1 poción: el oponente sufre daño igual a los escudos activos del Automa. */
  attackPotionOpponentShieldDamage?: boolean;
  /** Baraja la carta superior del descarte al mazo de combate (N veces) al atacar. */
  attackShuffleDiscardTopCount?: number;
  schoolSymbol: boolean;   // Triggers School Bonus
  reaction: {
    type: 'shield' | 'damage' | 'shield_damage' | 'none';
    value: number;
    description: string;
    /** Sube el escudo activo al máximo al descartarse por daño (p. ej. cha-8). */
    raiseShieldToMax?: boolean;
  } | null;
  pokerPattern: string;
  /** Valores concretos a conservar en el póker (p. ej. [1,2,3,4,4]). */
  pokerKeepValues?: number[];
  /** Mutágenos impresos en el margen de la carta. */
  mutagens?: ('red' | 'blue' | 'green')[];
  /** @deprecated Usar mutagens. */
  redMutagen?: boolean;
  /** Mutágeno verde impreso en el margen de la carta. */
  greenMutagen?: boolean;
  /** Si true, el escudo solo se aplica si el atributo Defensa lo permite. */
  shieldRequiresDefense?: boolean;
  /** Símbolo de ataque del monstruo cuando el jugador combate (mordisco/embestida). */
  playerMonsterAttack?: 'mordisco' | 'embestida' | null;
  cardSet?: 'generic' | 'school';
  imagePath?: string;
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
  /** Terreno de la localización actual (para rastros de terreno en Fase I). */
  currentTerrain: TrailColor;
  mutagens: string[]; // e.g. "red", "blue", "green"
  weaknesses: number; // monster weakness level (0-3)
  destructionTokens: number; // Legendary Hunt
  dagonTrack: number; // Skellige
  /** Monstruo Legendario derrotado (Cacería Legendaria). */
  legendaryMonsterDefeated: boolean;
  /** Vida base del Monstruo Legendario (cartas en reserva física antes de reducción). */
  legendaryMonsterBaseLife: number;
  /** Fichas de Destrucción restantes en la reserva general (mesa). */
  destructionReserveRemaining: number;
  /** Monstruo Legendario activo en mesa (para tabla de ataques p. 14). */
  legendaryMonsterId: string;
  /** Trofeos de meditación reclamados por atributo (manual: un trofeo por columna del tablero). */
  meditationTrophiesClaimed: {
    attack: boolean;
    defense: boolean;
    alchemy: boolean;
    special: boolean;
  };
  /** Nivel de escudo en el tablero (máx. = Defensa). Se restaura al terminar combate. */
  shieldLevel: number;
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
  /** Daño extra infligido al oponente por efectos de carta (p. ej. poción → escudos). */
  bonusOpponentDamageThisTurn?: number;
  /** Bono de daño pendiente para el próximo ataque (p. ej. Víbora Especial 1). */
  pendingAttackDamageBonus?: number;
  /** Ignora el daño del próximo turno de combate del oponente (p. ej. Oso Especial 3). */
  ignoreNextOpponentDamage?: boolean;
  /** Combate final vs Monstruo Legendario (Cacería Legendaria). */
  isLegendaryMonsterCombat?: boolean;
  /** Vida efectiva del jefe al iniciar este combate (base − fichas de Destrucción). */
  legendaryMonsterEffectiveLife?: number;
  /** ID del monstruo para tabla de ataques especiales (manual p. 14–15). */
  opponentMonsterId?: string;
  /** Efecto «antes del combate» ya aplicado (p. ej. Gigante de Hielo). */
  beforeCombatSpecialAcknowledged?: boolean;
}
