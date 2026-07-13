export const EXPANSIONS_STORAGE_KEY = "witcher-active-expansions-v1";

export function loadActiveExpansions() {
  const raw = localStorage.getItem(EXPANSIONS_STORAGE_KEY);
  if (!raw) {
    return new Set(["base"]);
  }

  try {
    const parsed = JSON.parse(raw);
    const expansions = new Set(Array.isArray(parsed) ? parsed : ["base"]);
    expansions.add("base");
    return expansions;
  } catch {
    return new Set(["base"]);
  }
}

export function saveActiveExpansions(activeExpansions) {
  const expansions = new Set(activeExpansions);
  expansions.add("base");
  localStorage.setItem(EXPANSIONS_STORAGE_KEY, JSON.stringify([...expansions]));
  import("./saved-games.js").then(({ syncActiveGame }) => syncActiveGame());
}

export function migrateLegacyExpansions(legacyStorageKey) {
  if (localStorage.getItem(EXPANSIONS_STORAGE_KEY)) {
    return;
  }

  const raw = localStorage.getItem(legacyStorageKey);
  if (!raw) {
    return;
  }

  try {
    const saved = JSON.parse(raw);
    if (saved.activeExpansions) {
      saveActiveExpansions(saved.activeExpansions);
    }
  } catch {
    // ignore invalid legacy state
  }
}
