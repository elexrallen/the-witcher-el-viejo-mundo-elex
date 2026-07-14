/** El escudo activo nunca puede superar el nivel de Defensa del Automa (manual base). */
export function getMaxShieldLevel(defenseAttribute: number): number {
  return Math.max(1, Math.min(5, defenseAttribute));
}
