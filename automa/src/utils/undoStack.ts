import type { AutomaSnapshot } from "../gameSnapshot";

export function createUndoStack(maxEntries = 25) {
  const entries: AutomaSnapshot[] = [];

  return {
    canUndo() {
      return entries.length > 0;
    },

    push(snapshot: AutomaSnapshot) {
      entries.push(structuredClone(snapshot));
      if (entries.length > maxEntries) {
        entries.shift();
      }
    },

    pop(): AutomaSnapshot | null {
      return entries.pop() ?? null;
    },

    clear() {
      entries.length = 0;
    },
  };
}
