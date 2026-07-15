/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Dispatch, SetStateAction } from "react";
import type {
  ActionCard,
  AutomaPlayerState,
  AutomaState,
  ChallengeCard,
  CombatState,
} from "../types";

export type SetAutomaPlayers = Dispatch<SetStateAction<AutomaPlayerState[]>>;

export function patchPlayerAtIndex(
  setAutomaPlayers: SetAutomaPlayers,
  index: number,
  patch: Partial<AutomaPlayerState>
) {
  setAutomaPlayers((prev) =>
    prev.map((player, playerIndex) =>
      playerIndex === index ? { ...player, ...patch } : player
    )
  );
}

export function updateActivePlayerField<K extends keyof AutomaPlayerState>(
  setAutomaPlayers: SetAutomaPlayers,
  activeIndex: number,
  field: K,
  value: AutomaPlayerState[K] | ((prev: AutomaPlayerState[K]) => AutomaPlayerState[K])
) {
  setAutomaPlayers((prev) =>
    prev.map((player, index) => {
      if (index !== activeIndex) return player;
      const next =
        typeof value === "function"
          ? (value as (prev: AutomaPlayerState[K]) => AutomaPlayerState[K])(
              player[field]
            )
          : value;
      return { ...player, [field]: next };
    })
  );
}

export function createActivePlayerSetters(
  setAutomaPlayers: SetAutomaPlayers,
  getActiveIndex: () => number
) {
  const activeIndex = () => getActiveIndex();

  return {
    setAutoma: (
      updater: AutomaState | ((prev: AutomaState) => AutomaState)
    ) => {
      updateActivePlayerField(setAutomaPlayers, activeIndex(), "automa", (prev) =>
        typeof updater === "function" ? updater(prev) : updater
      );
    },
    setLockedAttributes: (
      updater:
        | Record<string, boolean>
        | ((prev: Record<string, boolean>) => Record<string, boolean>)
    ) => {
      updateActivePlayerField(
        setAutomaPlayers,
        activeIndex(),
        "lockedAttributes",
        (prev) => (typeof updater === "function" ? updater(prev) : updater)
      );
    },
    setChallengeDeck: (
      updater: ChallengeCard[] | ((prev: ChallengeCard[]) => ChallengeCard[])
    ) => {
      updateActivePlayerField(
        setAutomaPlayers,
        activeIndex(),
        "challengeDeck",
        (prev) => (typeof updater === "function" ? updater(prev) : updater)
      );
    },
    setChallengeDiscard: (
      updater: ChallengeCard[] | ((prev: ChallengeCard[]) => ChallengeCard[])
    ) => {
      updateActivePlayerField(
        setAutomaPlayers,
        activeIndex(),
        "challengeDiscard",
        (prev) => (typeof updater === "function" ? updater(prev) : updater)
      );
    },
    setLevel3ChallengeReserve: (
      updater: ChallengeCard[] | ((prev: ChallengeCard[]) => ChallengeCard[])
    ) => {
      updateActivePlayerField(
        setAutomaPlayers,
        activeIndex(),
        "level3ChallengeReserve",
        (prev) => (typeof updater === "function" ? updater(prev) : updater)
      );
    },
    setTurnPhase: (value: 1 | 2 | 3) => {
      updateActivePlayerField(setAutomaPlayers, activeIndex(), "turnPhase", value);
    },
    setBonusApplied: (value: boolean) => {
      updateActivePlayerField(setAutomaPlayers, activeIndex(), "bonusApplied", value);
    },
    setActiveActionCard: (
      value: ActionCard | null | ((prev: ActionCard | null) => ActionCard | null)
    ) => {
      updateActivePlayerField(
        setAutomaPlayers,
        activeIndex(),
        "activeActionCard",
        (prev) => (typeof value === "function" ? value(prev) : value)
      );
    },
    setCombat: (
      updater: CombatState | ((prev: CombatState) => CombatState)
    ) => {
      updateActivePlayerField(setAutomaPlayers, activeIndex(), "combat", (prev) =>
        typeof updater === "function" ? updater(prev) : updater
      );
    },
    setLogs: (updater: string[] | ((prev: string[]) => string[])) => {
      updateActivePlayerField(setAutomaPlayers, activeIndex(), "logs", (prev) =>
        typeof updater === "function" ? updater(prev) : updater
      );
    },
  };
}
