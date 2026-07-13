export const REGISTRY_KEY = "witcher-saved-games-v1";
export const AUTOMA_STORAGE_KEY = "witcher-automa-v1";
export const EXPLORACION_STORAGE_KEY = "witcher-exploracion-v1";
export const EVENTOS_STORAGE_KEY = "witcher-eventos-v1";
export const STASH_STORAGE_KEY = "witcher-eventos-stash-v1";
export const PARTIDA_STORAGE_KEY = "witcher-partida-v1";
export const EXPANSIONS_STORAGE_KEY = "witcher-active-expansions-v1";

const SNAPSHOT_VERSION = 1;
const SYNC_DEBOUNCE_MS = 400;

let syncTimer = null;
let syncing = false;

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `game-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createDefaultAutomaSnapshot() {
  return {
    setupMode: true,
    selectedSchoolId: "wolf",
    difficulty: "intermediate",
    useDicePoker: true,
    useMutagens: false,
    useSkellige: false,
    useLegendaryHunt: false,
    automa: {
      schoolId: "wolf",
      difficulty: "intermediate",
      attributes: { attack: 1, defense: 1, alchemy: 1, special: 1 },
      trophies: 0,
      potions: 1,
      bombs: 1,
      trails: { red: 0, blue: 0, green: 0, yellow: 0 },
      location: "Vizima (Temeria)",
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
    combat: {
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
    },
    logs: ["El Brujo Automa ha desenvainado sus espadas."],
  };
}

export function createDefaultSnapshot() {
  return {
    version: SNAPSHOT_VERSION,
    session: { playerCount: 1, activePlayer: 1 },
    expansions: ["base"],
    exploracion: { decks: {}, lastLocationId: null },
    eventos: { decks: {}, currentDeckId: "eventos" },
    eventStash: { byPlayer: {} },
    automa: createDefaultAutomaSnapshot(),
  };
}

function readJson(key, fallback = null) {
  const raw = localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function removeKey(key) {
  localStorage.removeItem(key);
}

export function loadRegistry() {
  const raw = readJson(REGISTRY_KEY, { activeGameId: null, games: [] });
  return {
    activeGameId: raw.activeGameId || null,
    games: Array.isArray(raw.games) ? raw.games : [],
  };
}

export function saveRegistry(registry) {
  writeJson(REGISTRY_KEY, {
    activeGameId: registry.activeGameId || null,
    games: registry.games || [],
  });
}

export function captureSnapshot() {
  const session = readJson(PARTIDA_STORAGE_KEY, createDefaultSnapshot().session);
  const expansions = readJson(EXPANSIONS_STORAGE_KEY, ["base"]);
  const exploracion = readJson(EXPLORACION_STORAGE_KEY, { decks: {}, lastLocationId: null });
  const eventos = readJson(EVENTOS_STORAGE_KEY, { decks: {}, currentDeckId: "eventos" });
  const eventStash = readJson(STASH_STORAGE_KEY, { byPlayer: {} });
  const automa = readJson(AUTOMA_STORAGE_KEY, createDefaultAutomaSnapshot());

  return {
    version: SNAPSHOT_VERSION,
    session: {
      playerCount: session.playerCount ?? 1,
      activePlayer: session.activePlayer ?? 1,
    },
    expansions: Array.isArray(expansions) ? expansions : ["base"],
    exploracion: {
      decks: exploracion.decks || {},
      lastLocationId: exploracion.lastLocationId ?? null,
    },
    eventos: {
      decks: eventos.decks || {},
      currentDeckId: eventos.currentDeckId || "eventos",
    },
    eventStash: {
      byPlayer: eventStash.byPlayer || {},
    },
    automa,
  };
}

export function applySnapshot(snapshot) {
  const data = snapshot || createDefaultSnapshot();

  writeJson(EXPANSIONS_STORAGE_KEY, data.expansions || ["base"]);
  writeJson(PARTIDA_STORAGE_KEY, data.session || { playerCount: 1, activePlayer: 1 });
  writeJson(EXPLORACION_STORAGE_KEY, data.exploracion || { decks: {}, lastLocationId: null });
  writeJson(EVENTOS_STORAGE_KEY, data.eventos || { decks: {}, currentDeckId: "eventos" });
  writeJson(STASH_STORAGE_KEY, data.eventStash || { byPlayer: {} });
  writeJson(AUTOMA_STORAGE_KEY, data.automa || createDefaultAutomaSnapshot());
}

export function buildMeta(snapshot) {
  const session = snapshot.session || { playerCount: 1 };
  const exploracion = snapshot.exploracion || {};
  const eventos = snapshot.eventos || {};
  const automa = snapshot.automa || {};

  let eventosNumber = null;
  const currentDeckId = eventos.currentDeckId || "eventos";
  const deckState = eventos.decks?.[currentDeckId];
  if (deckState?.lastNumber) {
    eventosNumber = deckState.lastNumber;
  } else {
    const firstDeck = Object.values(eventos.decks || {})[0];
    if (firstDeck?.lastNumber) {
      eventosNumber = firstDeck.lastNumber;
    }
  }

  return {
    playerCount: session.playerCount ?? 1,
    lastMode: snapshot.lastMode || null,
    exploracionLocation: exploracion.lastLocationId || null,
    eventosNumber,
    automaTurn: automa.turnCount ?? null,
    automaInSetup: Boolean(automa.setupMode),
  };
}

function findGame(registry, id) {
  return registry.games.find((game) => game.id === id) || null;
}

export function getActiveGame() {
  const registry = loadRegistry();
  if (!registry.activeGameId) {
    return null;
  }
  return findGame(registry, registry.activeGameId);
}

export function listGames() {
  const registry = loadRegistry();
  return [...registry.games].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

export function setActiveGame(id) {
  const registry = loadRegistry();
  if (!findGame(registry, id)) {
    return null;
  }
  registry.activeGameId = id;
  saveRegistry(registry);
  return getActiveGame();
}

function upsertGameSnapshot(registry, id, snapshot, name) {
  const game = findGame(registry, id);
  const now = Date.now();
  const meta = buildMeta(snapshot);

  if (game) {
    game.snapshot = snapshot;
    game.meta = meta;
    game.updatedAt = now;
    if (name) {
      game.name = name;
    }
    return game;
  }

  const created = {
    id,
    name: name || "Partida",
    createdAt: now,
    updatedAt: now,
    meta,
    snapshot,
  };
  registry.games.push(created);
  return created;
}

export function createGame(name) {
  syncActiveGameNow();
  const registry = loadRegistry();
  const id = createId();
  const snapshot = createDefaultSnapshot();
  const trimmedName = (name || "").trim() || `Partida ${registry.games.length + 1}`;

  applySnapshot(snapshot);
  upsertGameSnapshot(registry, id, snapshot, trimmedName);
  registry.activeGameId = id;
  saveRegistry(registry);

  return findGame(registry, id);
}

export function loadGame(id) {
  syncActiveGameNow();
  const registry = loadRegistry();
  const game = findGame(registry, id);
  if (!game) {
    return null;
  }

  applySnapshot(game.snapshot);
  registry.activeGameId = id;
  saveRegistry(registry);
  return game;
}

export function deleteGame(id) {
  const registry = loadRegistry();
  const index = registry.games.findIndex((game) => game.id === id);
  if (index === -1) {
    return false;
  }

  const wasActive = registry.activeGameId === id;
  registry.games.splice(index, 1);

  if (wasActive) {
    if (registry.games.length > 0) {
      const next = registry.games[0];
      registry.activeGameId = next.id;
      applySnapshot(next.snapshot);
    } else {
      registry.activeGameId = null;
      applySnapshot(createDefaultSnapshot());
    }
  }

  saveRegistry(registry);
  return true;
}

export function renameGame(id, name) {
  const registry = loadRegistry();
  const game = findGame(registry, id);
  if (!game) {
    return null;
  }

  const trimmed = (name || "").trim();
  if (!trimmed) {
    return null;
  }

  game.name = trimmed;
  game.updatedAt = Date.now();
  saveRegistry(registry);
  return game;
}

export function syncActiveGameNow() {
  if (syncing) {
    return;
  }

  const registry = loadRegistry();
  if (!registry.activeGameId) {
    return;
  }

  const game = findGame(registry, registry.activeGameId);
  if (!game) {
    return;
  }

  syncing = true;
  try {
    const snapshot = captureSnapshot();
    if (game.snapshot?.lastMode) {
      snapshot.lastMode = game.snapshot.lastMode;
    }
    game.snapshot = snapshot;
    game.meta = buildMeta(snapshot);
    game.updatedAt = Date.now();
    saveRegistry(registry);
  } finally {
    syncing = false;
  }
}

export function syncActiveGame() {
  window.clearTimeout(syncTimer);
  syncTimer = window.setTimeout(syncActiveGameNow, SYNC_DEBOUNCE_MS);
}

export function setLastMode(mode) {
  const registry = loadRegistry();
  if (!registry.activeGameId) {
    return;
  }
  const game = findGame(registry, registry.activeGameId);
  if (!game) {
    return;
  }
  game.snapshot = game.snapshot || captureSnapshot();
  game.snapshot.lastMode = mode;
  game.meta = buildMeta(game.snapshot);
  saveRegistry(registry);
}

function hasOrphanedRuntimeData() {
  const exploracion = readJson(EXPLORACION_STORAGE_KEY);
  const eventos = readJson(EVENTOS_STORAGE_KEY);
  const stash = readJson(STASH_STORAGE_KEY);
  const automa = readJson(AUTOMA_STORAGE_KEY);

  const hasExploracionDecks = exploracion?.decks && Object.keys(exploracion.decks).length > 0;
  const hasEventosDecks = eventos?.decks && Object.keys(eventos.decks).length > 0;
  const hasStash = stash?.byPlayer && Object.values(stash.byPlayer).some((cards) => Array.isArray(cards) && cards.length > 0);
  const hasAutomaProgress = automa && !automa.setupMode;

  return hasExploracionDecks || hasEventosDecks || hasStash || hasAutomaProgress;
}

export function canMigrateOrphanedSession() {
  const registry = loadRegistry();
  return registry.games.length === 0 && hasOrphanedRuntimeData();
}

export function migrateOrphanedSession(name = "Partida 1") {
  if (!canMigrateOrphanedSession()) {
    return null;
  }

  const registry = loadRegistry();
  const id = createId();
  const snapshot = captureSnapshot();
  const game = upsertGameSnapshot(registry, id, snapshot, name);
  registry.activeGameId = id;
  saveRegistry(registry);
  return game;
}

export function formatGameDate(timestamp) {
  if (!timestamp) {
    return "—";
  }
  return new Date(timestamp).toLocaleString("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatGameSummary(meta) {
  if (!meta) {
    return "";
  }
  const parts = [];
  if (meta.playerCount > 1) {
    parts.push(`${meta.playerCount} jugadores`);
  }
  if (meta.exploracionLocation) {
    parts.push(`Exploración: ${meta.exploracionLocation}`);
  }
  if (meta.eventosNumber) {
    parts.push(`Evento #${meta.eventosNumber}`);
  }
  if (meta.automaTurn && !meta.automaInSetup) {
    parts.push(`Automa turno ${meta.automaTurn}`);
  }
  return parts.join(" · ") || "Sin progreso aún";
}
