import {
  ALL_MONSTER_SPECIAL_ATTACKS,
  LEGENDARY_MONSTER_ATTACKS,
  MonsterAttackEffect,
  MonsterAttackEffectType,
  MonsterSpecialAttackEntry,
  REGULAR_MONSTER_ATTACKS,
} from "../data/monsterSpecialAttacks";

export function normalizeMonsterName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

const ALIASES: Record<string, string> = {
  estrige: "strige",
  monstruo_legendario: "",
};

export function findMonsterSpecialAttack(
  nameOrId: string,
  legendaryMonsterId?: string
): MonsterSpecialAttackEntry | null {
  const key = normalizeMonsterName(nameOrId);

  if (key === "monstruo_legendario" && legendaryMonsterId) {
    return (
      ALL_MONSTER_SPECIAL_ATTACKS.find((entry) => entry.id === legendaryMonsterId) ??
      null
    );
  }

  const alias = ALIASES[key];
  if (alias === "") {
    return null;
  }
  const lookup = alias || key;

  return (
    ALL_MONSTER_SPECIAL_ATTACKS.find(
      (entry) =>
        entry.id === lookup || normalizeMonsterName(entry.name) === lookup
    ) ?? null
  );
}

export function getMonsterPartEffects(
  entry: MonsterSpecialAttackEntry
): Array<{ part: 1 | 2 | 3 | 4; effect: MonsterAttackEffect }> {
  return ([1, 2, 3, 4] as const)
    .filter((part) => entry.parts[part])
    .map((part) => ({
      part,
      effect: entry.parts[part]!,
    }));
}

export function describeMonsterEffect(type: MonsterAttackEffectType): string {
  switch (type) {
    case "ignore_ability":
      return "Ignora la habilidad del monstruo → descarta la 1ª carta del mazo de combate del Automa (sin barajar).";
    case "ignore_part_1":
      return "Ignora la 1ª parte del ataque — no apliques su daño ni efecto.";
    case "ignore_part_2":
      return "Ignora la 2ª parte del ataque — no apliques su daño ni efecto.";
    case "ignore_part_3":
      return "Ignora la 3ª parte del ataque — no apliques su daño ni efecto.";
    case "ignore_part_4":
      return "Ignora la 4ª parte del ataque — no apliques su daño ni efecto.";
    case "suffer":
      return "Sufres — aplica el daño/efecto con normalidad al Automa.";
    case "ignore_gold_loss":
      return "Ignora pérdida de oro (el Automa no usa oro).";
    case "reveal_or_skip_turn":
      return "Revela carta superior del mazo de combate; si no cumple condición, el monstruo salta turno.";
    case "discard_top_combat":
      return "Descarta la carta superior del mazo de combate del Automa.";
    case "leshen_minimum_combo":
      return "Comprueba combo mínimo ; si no se cumple, el monstruo salta turno.";
    case "discard_if_possible":
      return "Descarta carta del mazo de combate del Automa si la habilidad lo permite.";
    case "before_combat_suffer":
      return "Antes del combate: el Automa sufre daño (aplicar antes de iniciar).";
    default:
      return "Sin cambios.";
  }
}

export function effectNeedsDiscardTop(type: MonsterAttackEffectType): boolean {
  return (
    type === "ignore_ability" ||
    type === "discard_top_combat" ||
    type === "discard_if_possible"
  );
}

export function getBeforeCombatEffects(
  entry: MonsterSpecialAttackEntry
): MonsterAttackEffect[] {
  return getMonsterPartEffects(entry)
    .filter(({ effect }) => effect.type === "before_combat_suffer")
    .map(({ effect }) => effect);
}

export { LEGENDARY_MONSTER_ATTACKS, REGULAR_MONSTER_ATTACKS, ALL_MONSTER_SPECIAL_ATTACKS };

/** Lista plana para selectores de combate. */
export const COMBAT_MONSTER_OPTIONS: { value: string; label: string; group?: string }[] = [
  ...LEGENDARY_MONSTER_ATTACKS.map((m) => ({
    value: m.name,
    label: `${m.name} (LH)`,
    group: "Legendarios",
  })),
  ...REGULAR_MONSTER_ATTACKS.map((m) => ({
    value: m.name,
    label: m.name,
    group: "Regulares",
  })),
  { value: "Brujo rival", label: "Brujo rival" },
  { value: "Otro monstruo", label: "Otro monstruo (sin tabla)" },
];
