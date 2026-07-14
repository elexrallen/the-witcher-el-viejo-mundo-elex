/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { GameTab } from "./components/GameBoard";
import type {
  ActionCard,
  AutomaState,
  ChallengeCard,
  CombatState,
  WitcherSchoolId,
} from "./types";

export const AUTOMA_STORAGE_KEY = "witcher-automa-v1";

export interface AutomaSnapshot {
  setupMode: boolean;
  selectedSchoolId: WitcherSchoolId;
  difficulty: "easy" | "intermediate" | "difficult";
  useDicePoker: boolean;
  useBombs: boolean;
  useMutagens: boolean;
  useSkellige: boolean;
  useLegendaryHunt: boolean;
  automa: AutomaState;
  lockedAttributes: Record<string, boolean>;
  turnCount: number;
  currentTab: GameTab;
  actionDeck: ActionCard[];
  actionDiscard: ActionCard[];
  activeActionCard: ActionCard | null;
  challengeDeck: ChallengeCard[];
  challengeDiscard: ChallengeCard[];
  level3ChallengeReserve: ChallengeCard[];
  turnPhase: 1 | 2 | 3;
  bonusApplied: boolean;
  combat: CombatState;
  logs: string[];
}

const DEFAULT_COMBAT: CombatState = {
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
};

export function createDefaultAutomaSnapshot(): AutomaSnapshot {
  return {
    setupMode: true,
    selectedSchoolId: "wolf",
    difficulty: "intermediate",
    useDicePoker: true,
    useBombs: false,
    useMutagens: false,
    useSkellige: false,
    useLegendaryHunt: false,
    automa: {
      schoolId: "wolf",
      difficulty: "intermediate",
      attributes: { attack: 1, defense: 1, alchemy: 1, special: 1 },
      trophies: 0,
      potions: 1,
      bombs: 0,
      trails: { red: 0, blue: 0, green: 0, yellow: 0 },
      location: "Vizima (Temeria)",
      currentTerrain: "yellow",
      mutagens: [],
      weaknesses: 0,
      destructionTokens: 0,
      dagonTrack: 0,
    },
    lockedAttributes: {
      attack: false,
      defense: false,
      alchemy: false,
      special: false,
    },
    turnCount: 1,
    currentTab: "turn",
    actionDeck: [],
    actionDiscard: [],
    activeActionCard: null,
    challengeDeck: [],
    challengeDiscard: [],
    level3ChallengeReserve: [],
    turnPhase: 1,
    bonusApplied: false,
    combat: { ...DEFAULT_COMBAT },
    logs: ["El Brujo Automa ha desenvainado sus espadas."],
  };
}

export function loadAutomaSnapshot(): AutomaSnapshot {
  if (typeof localStorage === "undefined") {
    return createDefaultAutomaSnapshot();
  }

  const raw = localStorage.getItem(AUTOMA_STORAGE_KEY);
  if (!raw) {
    return createDefaultAutomaSnapshot();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AutomaSnapshot>;
    const defaults = createDefaultAutomaSnapshot();
    return {
      ...defaults,
      ...parsed,
      useBombs: parsed.useBombs ?? defaults.useBombs,
      automa: { ...defaults.automa, ...parsed.automa, currentTerrain: parsed.automa?.currentTerrain ?? defaults.automa.currentTerrain },
      lockedAttributes: { ...defaults.lockedAttributes, ...parsed.lockedAttributes },
      combat: { ...defaults.combat, ...parsed.combat },
      actionDeck: parsed.actionDeck ?? defaults.actionDeck,
      actionDiscard: parsed.actionDiscard ?? defaults.actionDiscard,
      challengeDeck: parsed.challengeDeck ?? defaults.challengeDeck,
      challengeDiscard: parsed.challengeDiscard ?? defaults.challengeDiscard,
      level3ChallengeReserve: parsed.level3ChallengeReserve ?? defaults.level3ChallengeReserve,
      logs: Array.isArray(parsed.logs) ? parsed.logs : defaults.logs,
    };
  } catch {
    return createDefaultAutomaSnapshot();
  }
}

export function saveAutomaSnapshot(snapshot: AutomaSnapshot) {
  if (typeof localStorage === "undefined") {
    return;
  }
  localStorage.setItem(AUTOMA_STORAGE_KEY, JSON.stringify(snapshot));
}

export function buildAutomaSnapshot(state: AutomaSnapshot): AutomaSnapshot {
  return structuredClone(state);
}
