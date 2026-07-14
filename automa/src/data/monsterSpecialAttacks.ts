/**
 * Tablas de ataques especiales — manual Automa V1.4, pp. 14–15.
 * Columnas = partes del ataque del monstruo (I → II → III → IV).
 */

export type MonsterAttackEffectType =
  | "ignore_ability"
  | "ignore_part_1"
  | "ignore_part_2"
  | "ignore_part_3"
  | "ignore_part_4"
  | "suffer"
  | "ignore_gold_loss"
  | "reveal_or_skip_turn"
  | "discard_top_combat"
  | "leshen_minimum_combo"
  | "discard_if_possible"
  | "before_combat_suffer";

export type MonsterAttackEffect = {
  type: MonsterAttackEffectType;
  /** Texto original del manual. */
  manual: string;
};

export type MonsterSpecialAttackEntry = {
  id: string;
  name: string;
  category: "legendary" | "regular";
  /** Efectos por columna/parte del ataque (1 = primera columna). */
  parts: Partial<Record<1 | 2 | 3 | 4, MonsterAttackEffect>>;
  notes?: string;
};

const E = (
  type: MonsterAttackEffectType,
  manual: string
): MonsterAttackEffect => ({ type, manual });

const ignoreAbility = E("ignore_ability", "Ignora habilidad");
const ignore2 = E("ignore_part_2", "Ignora 2ª parte");
const ignore1 = E("ignore_part_1", "Ignora 1ª parte");
const ignore3 = E("ignore_part_3", "Ignora 3ª parte");
const suffer = E("suffer", "Sufres (aplica daño con normalidad)");
const ignoreGold = E("ignore_gold_loss", "Ignora pérdida de oro");

/** Monstruos legendarios — manual p. 14 */
export const LEGENDARY_MONSTER_ATTACKS: MonsterSpecialAttackEntry[] = [
  {
    id: "ciclope",
    name: "Cíclope",
    category: "legendary",
    parts: { 1: ignoreAbility, 2: ignore2 },
  },
  {
    id: "espanto",
    name: "Espanto",
    category: "legendary",
    parts: { 1: ignoreAbility },
  },
  {
    id: "gaunter_odimm",
    name: "Gaunter O'Dimm",
    category: "legendary",
    parts: { 1: ignoreAbility, 2: ignore2 },
  },
  {
    id: "golem",
    name: "Golem",
    category: "legendary",
    parts: { 1: ignore2, 2: ignore2 },
  },
  {
    id: "gigante_de_hielo",
    name: "Gigante de Hielo",
    category: "legendary",
    parts: {
      1: E("before_combat_suffer", "Antes del combate: sufres daño"),
      2: ignore2,
    },
  },
  {
    id: "kayran",
    name: "Kayran",
    category: "legendary",
    parts: { 1: ignore2, 2: suffer },
  },
  {
    id: "sapo",
    name: "Sapo",
    category: "legendary",
    parts: { 1: ignoreAbility, 2: suffer, 3: ignore2 },
  },
  {
    id: "anciano_oculto",
    name: "Anciano Oculto",
    category: "legendary",
    parts: { 1: suffer },
  },
];

/** Monstruos regulares — manual p. 15 */
export const REGULAR_MONSTER_ATTACKS: MonsterSpecialAttackEntry[] = [
  {
    id: "arachas",
    name: "Arachas",
    category: "regular",
    parts: {
      1: E("reveal_or_skip_turn", "Revela carta: si no coincide → salta turno"),
      3: ignore2,
    },
    notes: "Revela la carta superior del mazo de combate del Automa; si no cumple, el monstruo pierde el turno.",
  },
  {
    id: "barghest",
    name: "Barghest",
    category: "regular",
    parts: { 1: ignoreAbility, 2: ignore2 },
  },
  {
    id: "nido_de_sumergidos",
    name: "Nido de Sumergidos",
    category: "regular",
    parts: { 1: ignore2 },
  },
  {
    id: "nido_de_nekkers",
    name: "Nido de Nekkers",
    category: "regular",
    parts: { 1: ignore2 },
  },
  {
    id: "demonio_podrido",
    name: "Demonio podrido",
    category: "regular",
    parts: { 1: ignore1 },
  },
  {
    id: "demonibestia",
    name: "Demonibestia",
    category: "regular",
    parts: { 1: ignore2, 2: ignore2 },
  },
  {
    id: "bruja_sepulcral",
    name: "Bruja sepulcral",
    category: "regular",
    parts: { 1: ignore2, 2: suffer },
  },
  {
    id: "manticora",
    name: "Mantícora",
    category: "regular",
    parts: { 1: ignore2 },
  },
  {
    id: "aparicion_nocturna",
    name: "Aparición nocturna",
    category: "regular",
    parts: { 1: ignore2 },
  },
  {
    id: "dama_del_mediodia",
    name: "Dama del mediodía",
    category: "regular",
    parts: { 1: ignore2 },
  },
  {
    id: "penitente",
    name: "Penitente",
    category: "regular",
    parts: { 1: ignoreAbility, 2: ignore2 },
  },
  {
    id: "bruja_del_agua",
    name: "Bruja del agua",
    category: "regular",
    parts: { 1: ignore2, 2: ignore2 },
  },
  {
    id: "tejedora",
    name: "Tejedora",
    category: "regular",
    parts: {
      1: E("discard_top_combat", "Descarta carta superior del mazo de combate"),
      2: ignore2,
      3: suffer,
    },
  },
  {
    id: "hombre_lobo",
    name: "Hombre lobo",
    category: "regular",
    parts: { 1: ignoreGold, 2: ignore2, 3: suffer },
  },
  {
    id: "susurradora",
    name: "Susurradora",
    category: "regular",
    parts: { 1: ignoreGold, 2: suffer, 3: ignore2, 4: suffer },
  },
  {
    id: "wyverno",
    name: "Wyverno",
    category: "regular",
    parts: { 1: ignoreAbility, 2: ignore2, 3: ignore2, 4: ignore2 },
  },
  {
    id: "guisadora",
    name: "Guisadora",
    category: "regular",
    parts: { 1: ignore2, 2: ignore2, 3: ignore2 },
  },
  {
    id: "lamia",
    name: "Lamia",
    category: "regular",
    parts: { 1: ignore2 },
  },
  {
    id: "babagor",
    name: "Babagor",
    category: "regular",
    parts: { 1: ignore2 },
  },
  {
    id: "koshchey",
    name: "Koshchey",
    category: "regular",
    parts: { 1: ignore2 },
  },
  {
    id: "leshen",
    name: "Leshen",
    category: "regular",
    parts: {
      1: E(
        "leshen_minimum_combo",
        "Próximo combo mínimo ; si no → salta turno"
      ),
      2: ignore3,
    },
    notes: "Comprueba el combo mínimo del ataque; si no se cumple, el monstruo pierde el turno.",
  },
  {
    id: "strige",
    name: "Estrige",
    category: "regular",
    parts: { 1: ignore2, 2: ignore2, 3: ignore2, 4: suffer },
  },
  {
    id: "troll",
    name: "Troll",
    category: "regular",
    parts: { 1: ignore2 },
  },
  {
    id: "yghern",
    name: "Yghern",
    category: "regular",
    parts: {
      1: E("discard_if_possible", "Descartará carta si es posible"),
    },
    notes: "Descarta la primera carta del mazo de combate del Automa si la habilidad lo permite.",
  },
];

export const ALL_MONSTER_SPECIAL_ATTACKS: MonsterSpecialAttackEntry[] = [
  ...LEGENDARY_MONSTER_ATTACKS,
  ...REGULAR_MONSTER_ATTACKS,
];
