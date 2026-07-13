const STASH_KEY = "witcher-eventos-stash-v1";

const EMPTY_STASH = { byPlayer: {} };

function normalizePlayer(player) {
  const value = Number.parseInt(player, 10);
  if (Number.isNaN(value)) {
    return 1;
  }
  return Math.min(Math.max(value, 1), 4);
}

function readStash() {
  const raw = localStorage.getItem(STASH_KEY);
  if (!raw) {
    return structuredClone(EMPTY_STASH);
  }

  try {
    const saved = JSON.parse(raw);
    return {
      byPlayer: saved.byPlayer && typeof saved.byPlayer === "object" ? saved.byPlayer : {},
    };
  } catch {
    localStorage.removeItem(STASH_KEY);
    return structuredClone(EMPTY_STASH);
  }
}

function writeStash(stash) {
  localStorage.setItem(STASH_KEY, JSON.stringify(stash));
  import("./saved-games.js").then(({ syncActiveGame }) => syncActiveGame());
}

export function makeCardId(deckKey, cardId) {
  return `${deckKey}:${cardId}`;
}

export function loadStash() {
  return readStash();
}

export function getCardsForPlayer(player) {
  const stash = readStash();
  const key = String(normalizePlayer(player));
  return Array.isArray(stash.byPlayer[key]) ? [...stash.byPlayer[key]] : [];
}

export function getStashCount(player) {
  return getCardsForPlayer(player).length;
}

export function hasCard(player, id) {
  return getCardsForPlayer(player).some((card) => card.id === id);
}

export function addCard(player, cardMeta) {
  const stash = readStash();
  const key = String(normalizePlayer(player));
  const cards = Array.isArray(stash.byPlayer[key]) ? [...stash.byPlayer[key]] : [];
  const id = cardMeta.id || makeCardId(cardMeta.deckKey, cardMeta.cardId);

  if (cards.some((card) => card.id === id)) {
    return false;
  }

  cards.push({
    id,
    cardId: cardMeta.cardId,
    deckKey: cardMeta.deckKey,
    number: cardMeta.number,
    label: cardMeta.label,
    type: cardMeta.type,
    image: cardMeta.image,
    addedAt: Date.now(),
  });
  stash.byPlayer[key] = cards;
  writeStash(stash);
  return true;
}

export function removeCard(player, id) {
  const stash = readStash();
  const key = String(normalizePlayer(player));
  const cards = Array.isArray(stash.byPlayer[key]) ? stash.byPlayer[key] : [];
  const next = cards.filter((card) => card.id !== id);
  if (next.length === cards.length) {
    return false;
  }
  stash.byPlayer[key] = next;
  writeStash(stash);
  return true;
}

export function clearStashForPlayer(player) {
  const stash = readStash();
  const key = String(normalizePlayer(player));
  const hadCards = Array.isArray(stash.byPlayer[key]) && stash.byPlayer[key].length > 0;
  stash.byPlayer[key] = [];
  writeStash(stash);
  return hadCards;
}

export function clearAllStash() {
  const stash = readStash();
  const hadCards = Object.values(stash.byPlayer).some((cards) => Array.isArray(cards) && cards.length > 0);
  writeStash(structuredClone(EMPTY_STASH));
  return hadCards;
}
