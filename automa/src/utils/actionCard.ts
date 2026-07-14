/** Marcador interno para cartas específicas: movimiento hasta el destino (sin límite de PM). */
export const MOVEMENT_UNLIMITED = 99;

export function isUnlimitedMovement(movement: number): boolean {
  return movement >= MOVEMENT_UNLIMITED;
}

/** Etiqueta corta para la carta o contadores (ej. "∞" o "3"). */
export function formatMovementPM(movement: number): string {
  return isUnlimitedMovement(movement) ? "∞" : String(movement);
}

/** Texto para guías de turno y logs. */
export function formatMovementGuide(movement: number): string {
  if (isUnlimitedMovement(movement)) {
    return "hasta el destino (camino más corto, sin límite de PM)";
  }
  return `${movement} PM`;
}

const TIE_BREAK_LABELS: Record<string, string> = {
  up: "flecha ↑ (prioridad norte)",
  down: "flecha ↓ (prioridad sur)",
  left: "flecha ← (prioridad oeste)",
  right: "flecha → (prioridad este)",
};

export function formatTieBreak(direction?: string): string | null {
  if (!direction) return null;
  return TIE_BREAK_LABELS[direction] ?? `flecha ${direction}`;
}

export function formatDestination(card: { destination: string; destinationSlot?: number }): string {
  if (card.destinationSlot != null) {
    return `Casilla ${card.destinationSlot}`;
  }
  return card.destination;
}
