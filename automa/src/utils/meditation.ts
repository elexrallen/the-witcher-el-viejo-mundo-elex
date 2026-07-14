import { AutomaState } from "../types";

export type AutomaAttributeKey = "attack" | "defense" | "alchemy" | "special";

/** Orden en el tablero de escuela: izquierda → derecha (manual p. 7). */
export const ATTRIBUTE_ORDER: AutomaAttributeKey[] = [
  "attack",
  "defense",
  "alchemy",
  "special",
];

export const ATTRIBUTE_LABELS: Record<AutomaAttributeKey, string> = {
  attack: "Ataque",
  defense: "Defensa",
  alchemy: "Alquimia",
  special: "Especial",
};

export const EMPTY_MEDITATION_TROPHIES: AutomaState["meditationTrophiesClaimed"] = {
  attack: false,
  defense: false,
  alchemy: false,
  special: false,
};

/** Primer atributo en nivel 5 con trofeo de meditación aún disponible. */
export function getMeditationTrophyAttribute(
  automa: AutomaState
): AutomaAttributeKey | null {
  for (const key of ATTRIBUTE_ORDER) {
    if (
      automa.attributes[key] === 5 &&
      !automa.meditationTrophiesClaimed[key]
    ) {
      return key;
    }
  }
  return null;
}

export function canMeditate(automa: AutomaState): boolean {
  return getMeditationTrophyAttribute(automa) !== null && automa.trophies < 4;
}
