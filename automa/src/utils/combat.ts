/** El escudo activo nunca puede superar el nivel de Defensa del Automa (manual p. 9). */
export function getMaxShieldLevel(defenseAttribute: number): number {
  return Math.max(1, Math.min(5, defenseAttribute));
}

export function capShieldLevel(
  rawShield: number,
  defenseAttribute: number
): number {
  return Math.min(Math.max(0, rawShield), getMaxShieldLevel(defenseAttribute));
}
