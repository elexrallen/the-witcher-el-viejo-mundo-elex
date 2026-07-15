/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { GameTab } from "./components/GameBoard";
import {
  createAutomaPlayerState,
  DEFAULT_COMBAT,
  mergeAutomaPlayerState,
} from "./utils/automaPlayer";
import type {
  ActionCard,
  AutomaPlayerState,
  AutomaState,
  ChallengeCard,
  CombatState,
  WitcherSchoolId,
} from "./types";

export { DEFAULT_COMBAT } from "./utils/automaPlayer";

export const AUTOMA_STORAGE_KEY = "witcher-automa-v1";

export interface AutomaSnapshot {
  setupMode: boolean;
  playerCount: number;
  setupSchoolIds: WitcherSchoolId[];
  difficulty: "easy" | "intermediate" | "difficult";
  useDicePoker: boolean;
  useBombs: boolean;
  useMutagens: boolean;
  useSkellige: boolean;
  useLegendaryHunt: boolean;
  turnCount: number;
  currentTab: GameTab;
  actionDeck: ActionCard[];
  actionDiscard: ActionCard[];
  automaPlayers: AutomaPlayerState[];
  activeAutomaIndex: number;
  /** @deprecated Migración desde saves v1 con un solo Automa. */
  selectedSchoolId?: WitcherSchoolId;
  /** @deprecated Migración desde saves v1 con un solo Automa. */
  automa?: AutomaState;
  /** @deprecated Migración desde saves v1 con un solo Automa. */
  lockedAttributes?: Record<string, boolean>;
  /** @deprecated Migración desde saves v1 con un solo Automa. */
  challengeDeck?: ChallengeCard[];
  /** @deprecated Migración desde saves v1 con un solo Automa. */
  challengeDiscard?: ChallengeCard[];
  /** @deprecated Migración desde saves v1 con un solo Automa. */
  level3ChallengeReserve?: ChallengeCard[];
  /** @deprecated Migración desde saves v1 con un solo Automa. */
  turnPhase?: 1 | 2 | 3;
  /** @deprecated Migración desde saves v1 con un solo Automa. */
  bonusApplied?: boolean;
  /** @deprecated Migración desde saves v1 con un solo Automa. */
  activeActionCard?: ActionCard | null;
  /** @deprecated Migración desde saves v1 con un solo Automa. */
  combat?: CombatState;
  /** @deprecated Migración desde saves v1 con un solo Automa. */
  logs?: string[];
}

function createDefaultPlayers(): AutomaPlayerState[] {
  return [createAutomaPlayerState(0, "wolf", "intermediate", false)];
}

function resolveUseBombs(parsed: Partial<AutomaSnapshot>, defaults: AutomaSnapshot): boolean {
  if (typeof parsed.useBombs === "boolean") {
    return parsed.useBombs;
  }

  const playersHaveBombs = (parsed.automaPlayers ?? []).some(
    (player) => (player.automa?.bombs ?? 0) > 0
  );
  if (playersHaveBombs) {
    return true;
  }

  if ((parsed.automa?.bombs ?? 0) > 0) {
    return true;
  }

  return defaults.useBombs;
}

export function createDefaultAutomaSnapshot(): AutomaSnapshot {
  return {
    setupMode: true,
    playerCount: 1,
    setupSchoolIds: ["wolf"],
    difficulty: "intermediate",
    useDicePoker: true,
    useBombs: false,
    useMutagens: false,
    useSkellige: false,
    useLegendaryHunt: false,
    turnCount: 1,
    currentTab: "turn",
    actionDeck: [],
    actionDiscard: [],
    automaPlayers: createDefaultPlayers(),
    activeAutomaIndex: 0,
  };
}

function migrateLegacySnapshot(parsed: Partial<AutomaSnapshot>): AutomaSnapshot {
  const defaults = createDefaultAutomaSnapshot();
  const schoolId = parsed.selectedSchoolId ?? parsed.automa?.schoolId ?? "wolf";
  const useBombs = resolveUseBombs(parsed, defaults);
  const defaultPlayer = createAutomaPlayerState(
    0,
    schoolId,
    parsed.difficulty ?? defaults.difficulty,
    useBombs
  );

  const legacyPlayer = mergeAutomaPlayerState(defaultPlayer, {
    schoolId,
    automa: parsed.automa,
    lockedAttributes: parsed.lockedAttributes,
    challengeDeck: parsed.challengeDeck,
    challengeDiscard: parsed.challengeDiscard,
    level3ChallengeReserve: parsed.level3ChallengeReserve,
    turnPhase: parsed.turnPhase,
    bonusApplied: parsed.bonusApplied,
    activeActionCard: (parsed as { activeActionCard?: ActionCard | null }).activeActionCard ?? null,
    combat: parsed.combat,
    logs: parsed.logs,
  });

  return {
    ...defaults,
    ...parsed,
    playerCount: 1,
    setupSchoolIds: [schoolId],
    useBombs,
    automaPlayers: [legacyPlayer],
    activeAutomaIndex: 0,
    actionDeck: parsed.actionDeck ?? defaults.actionDeck,
    actionDiscard: parsed.actionDiscard ?? defaults.actionDiscard,
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
    if (!parsed.automaPlayers || parsed.automaPlayers.length === 0) {
      return migrateLegacySnapshot(parsed);
    }

    const defaults = createDefaultAutomaSnapshot();
    const useBombs = resolveUseBombs(parsed, defaults);
    const setupSchoolIds =
      parsed.setupSchoolIds && parsed.setupSchoolIds.length > 0
        ? parsed.setupSchoolIds
        : parsed.automaPlayers.map((player) => player.schoolId);

    const automaPlayers = parsed.automaPlayers.map((player, index) => {
      const schoolId = player.schoolId ?? setupSchoolIds[index] ?? "wolf";
      const base = createAutomaPlayerState(
        index,
        schoolId,
        parsed.difficulty ?? defaults.difficulty,
        useBombs
      );
      return mergeAutomaPlayerState(base, player);
    });

    const activeAutomaIndex = Math.min(
      Math.max(parsed.activeAutomaIndex ?? 0, 0),
      automaPlayers.length - 1
    );

    return {
      ...defaults,
      ...parsed,
      playerCount: parsed.playerCount ?? automaPlayers.length,
      setupSchoolIds,
      useBombs,
      automaPlayers,
      activeAutomaIndex,
      actionDeck: parsed.actionDeck ?? defaults.actionDeck,
      actionDiscard: parsed.actionDiscard ?? defaults.actionDiscard,
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

export function getActivePlayer(snapshot: AutomaSnapshot): AutomaPlayerState {
  return (
    snapshot.automaPlayers[snapshot.activeAutomaIndex] ?? snapshot.automaPlayers[0]
  );
}

export function patchActivePlayer(
  snapshot: AutomaSnapshot,
  patch: Partial<AutomaPlayerState>
): AutomaSnapshot {
  const index = snapshot.activeAutomaIndex;
  return {
    ...snapshot,
    automaPlayers: snapshot.automaPlayers.map((player, playerIndex) =>
      playerIndex === index ? { ...player, ...patch } : player
    ),
  };
}
