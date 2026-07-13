export const PARTIDA_STORAGE_KEY = "witcher-partida-v1";

const DEFAULT_SESSION = {
  playerCount: 1,
  activePlayer: 1,
};

export function loadPartidaSession() {
  const raw = localStorage.getItem(PARTIDA_STORAGE_KEY);
  if (!raw) {
    return { ...DEFAULT_SESSION };
  }

  try {
    const saved = JSON.parse(raw);
    return {
      ...DEFAULT_SESSION,
      playerCount: clampPlayerCount(saved.playerCount),
      activePlayer: clampActivePlayer(saved.activePlayer, saved.playerCount),
    };
  } catch {
    return { ...DEFAULT_SESSION };
  }
}

export function savePartidaSession(session) {
  const normalized = {
    playerCount: clampPlayerCount(session.playerCount),
    activePlayer: clampActivePlayer(session.activePlayer, session.playerCount),
  };
  localStorage.setItem(PARTIDA_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

function clampPlayerCount(count) {
  const value = Number.parseInt(count, 10);
  if (Number.isNaN(value)) {
    return 1;
  }
  return Math.min(Math.max(value, 1), 4);
}

function clampActivePlayer(activePlayer, playerCount) {
  const count = clampPlayerCount(playerCount);
  const value = Number.parseInt(activePlayer, 10);
  if (Number.isNaN(value)) {
    return 1;
  }
  return Math.min(Math.max(value, 1), count);
}

export function getDrawerPlayer(activePlayer, playerCount) {
  const count = clampPlayerCount(playerCount);
  const active = clampActivePlayer(activePlayer, count);
  if (count <= 1) {
    return 1;
  }
  return active === count ? 1 : active + 1;
}

export function getActivePlayerLabel(activePlayer, playerCount) {
  const count = clampPlayerCount(playerCount);
  const active = clampActivePlayer(activePlayer, count);
  if (count <= 1) {
    return "Jugador activo";
  }
  return `Jugador ${active}`;
}

export function getDrawerLabel(activePlayer, playerCount) {
  const count = clampPlayerCount(playerCount);
  const active = clampActivePlayer(activePlayer, count);
  if (count <= 1) {
    return "Tú (solitario)";
  }
  return `Jugador ${getDrawerPlayer(active, count)}`;
}

export function getReaderLabel(activePlayer, playerCount) {
  return getDrawerLabel(activePlayer, playerCount);
}
