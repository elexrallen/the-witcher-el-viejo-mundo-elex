import {
  ACTION_CARDS,
  CHALLENGE_CARDS,
  LEVEL_3_CHALLENGE_RESERVE,
  SCHOOL_ACTION_CARDS,
  SCHOOL_CHALLENGE_CARDS,
} from "../data/cards";
import { LEGENDARY_HUNT_ACTION_CARDS } from "../data/legendaryHunt";
import { ActionCard, ChallengeCard } from "../types";
import { shuffleArray } from "./shuffle";
import { normalizeActionLevel } from "./actionDeck";

export type BuiltDecks = {
  actionDeck: ActionCard[];
  challengeDeck: ChallengeCard[];
  level3Reserve: ChallengeCard[];
};

export type DeckBuildOptions = {
  useLegendaryHunt?: boolean;
  difficulty?: "easy" | "intermediate" | "difficult";
};

export type DeckDifficulty = NonNullable<DeckBuildOptions["difficulty"]>;

/** Cartas Lvl III apartadas para trofeos (manual V1.4). */
export const TROPHY_RESERVE_COUNT = 3;

type LevelCounts = { 1: number; 2: number; 3: number };

type DeckSelectionTable = {
  generic: LevelCounts;
  school: LevelCounts;
};

/** Tablas de preparación — manual Automa V1.4, p. 4. */
export const MANUAL_DECK_TABLES: Record<
  DeckDifficulty,
  { action: DeckSelectionTable; challenge: DeckSelectionTable }
> = {
  easy: {
    action: {
      generic: { 1: 4, 2: 4, 3: 2 },
      school: { 1: 1, 2: 1, 3: 1 },
    },
    challenge: {
      generic: { 1: 2, 2: 2, 3: 1 },
      school: { 1: 2, 2: 2, 3: 2 },
    },
  },
  intermediate: {
    action: {
      generic: { 1: 3, 2: 3, 3: 3 },
      school: { 1: 1, 2: 1, 3: 1 },
    },
    challenge: {
      generic: { 1: 3, 2: 3, 3: 0 },
      school: { 1: 2, 2: 2, 3: 2 },
    },
  },
  difficult: {
    action: {
      generic: { 1: 2, 2: 2, 3: 2 },
      school: { 1: 1, 2: 1, 3: 1 },
    },
    challenge: {
      generic: { 1: 3, 2: 3, 3: 0 },
      school: { 1: 2, 2: 2, 3: 2 },
    },
  },
};

export function getManualDeckTotals(difficulty: DeckDifficulty) {
  const table = MANUAL_DECK_TABLES[difficulty];
  const sum = (counts: LevelCounts) => counts[1] + counts[2] + counts[3];

  return {
    actionTotal: sum(table.action.generic) + sum(table.action.school),
    challengeTotal: sum(table.challenge.generic) + sum(table.challenge.school),
    actionByLevel: {
      1: table.action.generic[1] + table.action.school[1],
      2: table.action.generic[2] + table.action.school[2],
      3: table.action.generic[3] + table.action.school[3],
    },
    challengeByLevel: {
      1: table.challenge.generic[1] + table.challenge.school[1],
      2: table.challenge.generic[2] + table.challenge.school[2],
      3: table.challenge.generic[3] + table.challenge.school[3],
    },
  };
}

function normalizeLevel(level: ActionCard["level"] | ChallengeCard["level"]): 1 | 2 | 3 {
  if (typeof level === "number") {
    return level;
  }
  return normalizeActionLevel(level);
}

function pickRandom<T extends { id: string }>(pool: T[], count: number): T[] {
  if (count <= 0 || pool.length === 0) {
    return [];
  }
  return shuffleArray([...pool]).slice(0, Math.min(count, pool.length));
}

function pickByLevel<T extends ActionCard | ChallengeCard>(
  pool: T[],
  counts: LevelCounts
): T[] {
  const byLevel: Record<1 | 2 | 3, T[]> = { 1: [], 2: [], 3: [] };
  for (const card of pool) {
    byLevel[normalizeLevel(card.level)].push(card);
  }

  return ([1, 2, 3] as const).flatMap((level) =>
    pickRandom(byLevel[level], counts[level])
  );
}

function pickLegendaryHuntCards(difficulty: DeckDifficulty): ActionCard[] {
  const count = difficulty === "easy" ? 1 : difficulty === "difficult" ? 3 : 2;
  return pickRandom(LEGENDARY_HUNT_ACTION_CARDS, count);
}

/**
 * Mazo de Acción: Lvl III abajo (barajado), Lvl II encima, Lvl I arriba (manual p. 4).
 * El Automa roba desde arriba (Lvl I primero).
 */
function stackActionDeck(
  level1: ActionCard[],
  level2: ActionCard[],
  level3: ActionCard[]
): ActionCard[] {
  return [
    ...shuffleArray(level3),
    ...shuffleArray(level2),
    ...shuffleArray(level1),
  ];
}

/**
 * Construye mazos según dificultad (manual V1.4).
 * Reserva de trofeos: 3 cartas Desafío genéricas Lvl III.
 */
export function buildDecksFromCatalog(options?: DeckBuildOptions): BuiltDecks {
  const difficulty: DeckDifficulty = options?.difficulty ?? "intermediate";
  const table = MANUAL_DECK_TABLES[difficulty];

  const genericActionPool = [...ACTION_CARDS];
  const schoolActionPool = [...SCHOOL_ACTION_CARDS];
  const genericChallengePool = [...CHALLENGE_CARDS];
  const genericChallengeL3Pool = [...LEVEL_3_CHALLENGE_RESERVE];
  const schoolChallengePool = [...SCHOOL_CHALLENGE_CARDS];

  const trophyReserve = pickRandom(genericChallengeL3Pool, TROPHY_RESERVE_COUNT);
  const trophyIds = new Set(trophyReserve.map((card) => card.id));
  const genericL3ForDeck = genericChallengeL3Pool.filter(
    (card) => !trophyIds.has(card.id)
  );

  const genericChallengeFullPool = [
    ...genericChallengePool,
    ...genericL3ForDeck,
  ];

  const selectedActionGeneric = pickByLevel(genericActionPool, table.action.generic);
  const selectedActionSchool = pickByLevel(schoolActionPool, table.action.school);
  const selectedChallengeGeneric = pickByLevel(
    genericChallengeFullPool,
    table.challenge.generic
  );
  const selectedChallengeSchool = pickByLevel(
    schoolChallengePool,
    table.challenge.school
  );

  const actionByLevel: Record<1 | 2 | 3, ActionCard[]> = { 1: [], 2: [], 3: [] };
  for (const card of [...selectedActionGeneric, ...selectedActionSchool]) {
    actionByLevel[normalizeLevel(card.level)].push(card);
  }

  const lhCards =
    options?.useLegendaryHunt && LEGENDARY_HUNT_ACTION_CARDS.length > 0
      ? pickLegendaryHuntCards(difficulty)
      : [];
  actionByLevel[3].push(...lhCards);

  const actionDeck = stackActionDeck(
    actionByLevel[1],
    actionByLevel[2],
    actionByLevel[3]
  );

  const challengeDeck = shuffleArray([
    ...selectedChallengeGeneric,
    ...selectedChallengeSchool,
  ]);

  return {
    actionDeck,
    challengeDeck,
    level3Reserve: trophyReserve,
  };
}
