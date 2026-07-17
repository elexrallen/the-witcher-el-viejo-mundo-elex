/**
 * Pila de deshacer con entradas { label, restore }.
 */
export function createUndoStack({ maxEntries = 20 } = {}) {
  /** @type {{ label: string, restore: () => void }[]} */
  const entries = [];

  /** @type {Set<() => void>} */
  const listeners = new Set();

  function notify() {
    listeners.forEach((listener) => listener());
  }

  return {
    canUndo() {
      return entries.length > 0;
    },

    peekLabel() {
      return entries[entries.length - 1]?.label ?? null;
    },

    push(label, restore) {
      entries.push({ label, restore });
      if (entries.length > maxEntries) {
        entries.shift();
      }
      notify();
    },

    undo() {
      const entry = entries.pop();
      if (!entry) {
        return null;
      }
      entry.restore();
      notify();
      return entry.label;
    },

    clear() {
      entries.length = 0;
      notify();
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
