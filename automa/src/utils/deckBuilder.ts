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

export type BuiltMultiChallengeDecks = {
  challengeDecks: ChallengeCard[][];
  level3Reserves: ChallengeCard[][];
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

function pickByLevelExcluding<T extends { id: string }>(
  pool: T[],
  counts: LevelCounts,
  usedIds: Set<string>
): T[] {
  const available = pool.filter((card) => !usedIds.has(card.id));
  const picked = pickByLevel(available, counts);
  for (const card of picked) {
    usedIds.add(card.id);
  }
  return picked;
}

function cloneCardById<T extends { id: string }>(card: T, suffix: string): T {
  return { ...card, id: `${card.id}${suffix}` };
}

/**
 * Elige cartas por nivel priorizando IDs aún no usados.
 * Si el catálogo no alcanza (prototipo incompleto), rellena reutilizando
 * clones del pool completo para no dejar mazos a medias.
 */
function pickByLevelPreferUnique<T extends ActionCard | ChallengeCard>(
  pool: T[],
  counts: LevelCounts,
  usedIds: Set<string>,
  reuseSuffix: string
): T[] {
  const unique = pickByLevelExcluding(pool, counts, usedIds);
  const got: LevelCounts = { 1: 0, 2: 0, 3: 0 };
  for (const card of unique) {
    got[normalizeLevel(card.level)] += 1;
  }

  const shortfall: LevelCounts = {
    1: Math.max(0, counts[1] - got[1]),
    2: Math.max(0, counts[2] - got[2]),
    3: Math.max(0, counts[3] - got[3]),
  };
  if (shortfall[1] + shortfall[2] + shortfall[3] === 0) {
    return unique;
  }

  const fillers = pickByLevel(pool, shortfall).map((card, index) =>
    cloneCardById(card, `${reuseSuffix}-${index}`)
  );
  return [...unique, ...fillers];
}

function pickTrophyReserve(
  pool: ChallengeCard[],
  usedIds: Set<string>,
  count: number,
  reuseSuffix: string
): ChallengeCard[] {
  const available = pool.filter((card) => !usedIds.has(card.id));
  const unique = pickRandom(available, count);
  for (const card of unique) {
    usedIds.add(card.id);
  }
  if (unique.length >= count) {
    return unique;
  }

  const fillers = pickRandom(pool, count - unique.length).map((card, index) =>
    cloneCardById(card, `${reuseSuffix}-tr-${index}`)
  );
  return [...unique, ...fillers];
}

function pickLegendaryHuntForPlayer(
  difficulty: DeckDifficulty,
  usedIds: Set<string>,
  reuseSuffix: string
): ActionCard[] {
  const count = difficulty === "easy" ? 1 : difficulty === "difficult" ? 3 : 2;
  if (count <= 0 || LEGENDARY_HUNT_ACTION_CARDS.length === 0) {
    return [];
  }

  const available = LEGENDARY_HUNT_ACTION_CARDS.filter((card) => !usedIds.has(card.id));
  const unique = pickRandom(available, count);
  for (const card of unique) {
    usedIds.add(card.id);
  }
  if (unique.length >= count) {
    return unique;
  }

  return [
    ...unique,
    ...pickRandom(LEGENDARY_HUNT_ACTION_CARDS, count - unique.length).map((card, index) =>
      cloneCardById(card, `${reuseSuffix}-lh-${index}`)
    ),
  ];
}

/** Cartas Desafío necesarias por Automa (mazo + reserva de trofeos). */
export function getChallengeCardsPerAutoma(difficulty: DeckDifficulty): number {
  const table = MANUAL_DECK_TABLES[difficulty];
  const sum = (counts: LevelCounts) => counts[1] + counts[2] + counts[3];
  return sum(table.challenge.generic) + sum(table.challenge.school) + TROPHY_RESERVE_COUNT;
}

/**
 * Máximo de Automas configurables.
 * Las cartas de escuela se reutilizan por Automa (en física cada escuela tiene las suyas).
 * Las genéricas se reparten sin duplicar mientras el catálogo alcance; si no, se clonan.
 */
export function getMaxAutomaPlayers(_difficulty?: DeckDifficulty): number {
  return 4;
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

export type BuiltMultiActionDecks = {
  actionDecks: ActionCard[][];
};

/**
 * Construye un mazo de Acción por Automa.
 * - Escuela: pool completo para cada Automa.
 * - Genéricas / Cacería Legendaria: sin duplicar mientras haya cartas; si no, se clonan.
 */
export function buildActionDecksForPlayers(
  playerCount: number,
  options?: DeckBuildOptions
): BuiltMultiActionDecks {
  const difficulty: DeckDifficulty = options?.difficulty ?? "intermediate";
  const table = MANUAL_DECK_TABLES[difficulty];
  const usedIds = new Set<string>();
  const lhUsedIds = new Set<string>();

  const genericActionPool = [...ACTION_CARDS];
  const schoolActionPool = [...SCHOOL_ACTION_CARDS];
  const actionDecks: ActionCard[][] = [];

  for (let i = 0; i < playerCount; i++) {
    const reuseSuffix = `__a${i + 1}`;
    const selectedActionGeneric = pickByLevelPreferUnique(
      genericActionPool,
      table.action.generic,
      usedIds,
      reuseSuffix
    );
    const selectedActionSchool = pickByLevel(schoolActionPool, table.action.school);

    const actionByLevel: Record<1 | 2 | 3, ActionCard[]> = { 1: [], 2: [], 3: [] };
    for (const card of [...selectedActionGeneric, ...selectedActionSchool]) {
      actionByLevel[normalizeLevel(card.level)].push(card);
    }

    if (options?.useLegendaryHunt) {
      actionByLevel[3].push(
        ...pickLegendaryHuntForPlayer(difficulty, lhUsedIds, reuseSuffix)
      );
    }

    actionDecks.push(
      stackActionDeck(actionByLevel[1], actionByLevel[2], actionByLevel[3])
    );
  }

  return { actionDecks };
}

/**
 * Construye mazos según dificultad (manual V1.4) para un solo Automa.
 * Reserva de trofeos: 3 cartas Desafío genéricas Lvl III.
 */
export function buildDecksFromCatalog(options?: DeckBuildOptions): BuiltDecks {
  const { actionDecks } = buildActionDecksForPlayers(1, options);
  const { challengeDecks, level3Reserves } = buildChallengeDecksForPlayers(1, options);

  return {
    actionDeck: actionDecks[0] ?? [],
    challengeDeck: challengeDecks[0] ?? [],
    level3Reserve: level3Reserves[0] ?? [],
  };
}

/**
 * Construye un mazo Desafío por Automa.
 * - Escuela: pool completo para cada Automa (físicamente cada escuela tiene las suyas).
 * - Genéricas / reserva de trofeos: sin duplicar mientras haya cartas; si no alcanzan, se clonan.
 */
export function buildChallengeDecksForPlayers(
  playerCount: number,
  options?: DeckBuildOptions
): BuiltMultiChallengeDecks {
  const difficulty: DeckDifficulty = options?.difficulty ?? "intermediate";
  const table = MANUAL_DECK_TABLES[difficulty];
  const usedIds = new Set<string>();

  const genericChallengePool = [...CHALLENGE_CARDS];
  const genericChallengeL3Pool = [...LEVEL_3_CHALLENGE_RESERVE];
  const schoolChallengePool = [...SCHOOL_CHALLENGE_CARDS];
  const genericFullPool = [...genericChallengePool, ...genericChallengeL3Pool];

  const challengeDecks: ChallengeCard[][] = [];
  const level3Reserves: ChallengeCard[][] = [];

  for (let i = 0; i < playerCount; i++) {
    const reuseSuffix = `__a${i + 1}`;
    const trophyReserve = pickTrophyReserve(
      genericChallengeL3Pool,
      usedIds,
      TROPHY_RESERVE_COUNT,
      reuseSuffix
    );

    const selectedChallengeGeneric = pickByLevelPreferUnique(
      genericFullPool,
      table.challenge.generic,
      usedIds,
      reuseSuffix
    );
    // Cartas de escuela: cada Automa elige de todo el pool (no se "gastan" entre Automas).
    const selectedChallengeSchool = pickByLevel(
      schoolChallengePool,
      table.challenge.school
    );

    challengeDecks.push(
      shuffleArray([...selectedChallengeGeneric, ...selectedChallengeSchool])
    );
    level3Reserves.push(trophyReserve);
  }

  return { challengeDecks, level3Reserves };
}
