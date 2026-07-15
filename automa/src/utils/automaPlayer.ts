/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WITCHER_SCHOOLS } from "../data/schools";
import type { AutomaPlayerState, AutomaState, CombatState, WitcherSchoolId } from "../types";
import { getMaxShieldLevel } from "./combat";
import {
  DEFAULT_DESTRUCTION_RESERVE,
  DEFAULT_LEGENDARY_MONSTER_BASE_LIFE,
} from "./legendaryHuntRules";
import { EMPTY_MEDITATION_TROPHIES } from "./meditation";

export const DEFAULT_COMBAT: CombatState = {
  isActive: false,
  opponentType: "monster",
  opponentName: "Monstruo",
  combatDeck: [],
  combatDiscard: [],
  revealedCard: null,
  damageInflictedThisTurn: 0,
  shieldsActiveThisTurn: 0,
  potionsConsumedThisTurn: 0,
  bombsConsumedThisTurn: 0,
  lastReactionTriggered: null,
  fightLog: [],
  isAutomaVsAutoma: false,
  opponentAutomaIndex: null,
  opponentCombatDeck: [],
  opponentCombatDiscard: [],
  opponentShieldsThisTurn: 0,
  opponentRevealedCard: null,
};

export function getStartLocationForSchool(schoolId: WitcherSchoolId): string {
  if (schoolId === "wolf") return "Kaer Morhen (Lobo)";
  if (schoolId === "griffin") return "Kaer Seren (Grifo)";
  if (schoolId === "viper") return "Gorthur Gvaed (Víbora)";
  return "Vizima (Temeria)";
}

export function createInitialAutomaState(
  schoolId: WitcherSchoolId,
  difficulty: AutomaState["difficulty"],
  useBombs: boolean
): AutomaState {
  return {
    schoolId,
    difficulty,
    attributes: { attack: 1, defense: 1, alchemy: 1, special: 1 },
    trophies: 0,
    potions: 1,
    bombs: useBombs ? 1 : 0,
    trails: { red: 0, blue: 0, green: 0, yellow: 0 },
    location: getStartLocationForSchool(schoolId),
    currentTerrain: "yellow",
    mutagens: [],
    weaknesses: 0,
    destructionTokens: 0,
    dagonTrack: 0,
    legendaryMonsterDefeated: false,
    legendaryMonsterBaseLife: DEFAULT_LEGENDARY_MONSTER_BASE_LIFE,
    destructionReserveRemaining: DEFAULT_DESTRUCTION_RESERVE,
    legendaryMonsterId: "ciclope",
    meditationTrophiesClaimed: { ...EMPTY_MEDITATION_TROPHIES },
    shieldLevel: 1,
  };
}

export function createAutomaPlayerState(
  index: number,
  schoolId: WitcherSchoolId,
  difficulty: AutomaState["difficulty"],
  useBombs: boolean
): AutomaPlayerState {
  const schoolName =
    WITCHER_SCHOOLS.find((school) => school.id === schoolId)?.name ?? schoolId;

  return {
    id: `automa-${index + 1}`,
    label: `Automa ${index + 1} (${schoolName})`,
    schoolId,
    automa: createInitialAutomaState(schoolId, difficulty, useBombs),
    lockedAttributes: {
      attack: false,
      defense: false,
      alchemy: false,
      special: false,
    },
    actionDeck: [],
    actionDiscard: [],
    challengeDeck: [],
    challengeDiscard: [],
    level3ChallengeReserve: [],
    turnPhase: 1,
    bonusApplied: false,
    activeActionCard: null,
    combat: { ...DEFAULT_COMBAT },
    logs: [`${schoolName} listo para la cacería.`],
  };
}

export function mergeAutomaPlayerState(
  defaults: AutomaPlayerState,
  partial?: Partial<AutomaPlayerState>
): AutomaPlayerState {
  if (!partial) {
    return defaults;
  }

  return {
    ...defaults,
    ...partial,
    automa: {
      ...defaults.automa,
      ...partial.automa,
      attributes: {
        ...defaults.automa.attributes,
        ...partial.automa?.attributes,
      },
      trails: {
        ...defaults.automa.trails,
        ...partial.automa?.trails,
      },
      meditationTrophiesClaimed: {
        ...defaults.automa.meditationTrophiesClaimed,
        ...partial.automa?.meditationTrophiesClaimed,
      },
      shieldLevel:
        partial.automa?.shieldLevel ??
        getMaxShieldLevel(
          partial.automa?.attributes?.defense ?? defaults.automa.attributes.defense
        ),
    },
    lockedAttributes: {
      ...defaults.lockedAttributes,
      ...partial.lockedAttributes,
    },
    combat: { ...defaults.combat, ...partial.combat },
    actionDeck: partial.actionDeck ?? defaults.actionDeck,
    actionDiscard: partial.actionDiscard ?? defaults.actionDiscard,
    challengeDeck: partial.challengeDeck ?? defaults.challengeDeck,
    challengeDiscard: partial.challengeDiscard ?? defaults.challengeDiscard,
    level3ChallengeReserve:
      partial.level3ChallengeReserve ?? defaults.level3ChallengeReserve,
    logs: Array.isArray(partial.logs) ? partial.logs : defaults.logs,
  };
}
