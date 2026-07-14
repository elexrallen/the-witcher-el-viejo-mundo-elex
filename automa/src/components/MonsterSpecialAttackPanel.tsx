/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WitcherIcon } from "./WitcherIcon";
import {
  describeMonsterEffect,
  effectNeedsDiscardTop,
  getBeforeCombatEffects,
  getMonsterPartEffects,
} from "../utils/monsterSpecialAttacks";
import { MonsterSpecialAttackEntry } from "../data/monsterSpecialAttacks";

type MonsterSpecialAttackPanelProps = {
  rule: MonsterSpecialAttackEntry | null;
  monsterAttack: "mordisco" | "embestida" | null;
  beforeCombatAcknowledged: boolean;
  onAcknowledgeBeforeCombat: () => void;
  onDiscardTopCombatCard: () => void;
  combatDeckLength: number;
};

const PART_LABELS: Record<1 | 2 | 3 | 4, string> = {
  1: "Parte I",
  2: "Parte II",
  3: "Parte III",
  4: "Parte IV",
};

export default function MonsterSpecialAttackPanel({
  rule,
  monsterAttack,
  beforeCombatAcknowledged,
  onAcknowledgeBeforeCombat,
  onDiscardTopCombatCard,
  combatDeckLength,
}: MonsterSpecialAttackPanelProps) {
  if (!rule || getMonsterPartEffects(rule).length === 0) {
    return (
      <div className="mt-4 p-3 rounded-xl bg-zinc-950/60 border border-zinc-850 text-[10px] text-zinc-500">
        Este monstruo no aparece en la tabla del manual (p. 14–15): aplica reglas normales.
        Si activa habilidad incompatible, descarta la 1ª carta del mazo de combate del Automa.
      </div>
    );
  }

  const beforeCombat = getBeforeCombatEffects(rule);
  const parts = getMonsterPartEffects(rule).filter(
    ({ effect }) => effect.type !== "before_combat_suffer"
  );

  return (
    <div className="mt-4 pt-4 border-t border-zinc-800/80 space-y-3" id="monster-special-attack-panel">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] uppercase font-mono text-orange-500 font-bold flex items-center gap-1">
          <WitcherIcon name="alert" size={14} />
          Ataque esp. — {rule.name}
          {rule.category === "legendary" && (
            <span className="text-red-400 normal-case">(Legendario)</span>
          )}
        </p>
        <span className="text-[9px] font-mono text-zinc-600">Manual p. {rule.category === "legendary" ? "14" : "15"}</span>
      </div>

      {rule.notes && (
        <p className="text-[10px] text-zinc-400 bg-zinc-950/50 border border-zinc-850 rounded-lg p-2">
          {rule.notes}
        </p>
      )}

      {beforeCombat.length > 0 && !beforeCombatAcknowledged && (
        <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-900/50 space-y-2">
          <p className="text-xs text-amber-300 font-bold">Antes del combate</p>
          {beforeCombat.map((effect, i) => (
            <p key={i} className="text-[10px] text-amber-200/90">
              {describeMonsterEffect(effect.type)}
            </p>
          ))}
          <button
            type="button"
            onClick={onAcknowledgeBeforeCombat}
            className="w-full py-2 text-[10px] font-bold uppercase bg-amber-900/40 hover:bg-amber-900/60 text-amber-200 rounded-lg border border-amber-800/50"
          >
            Daño previo aplicado — continuar combate
          </button>
        </div>
      )}

      {monsterAttack && (
        <p className="text-[10px] text-zinc-400">
          Ataque anunciado: <strong className="text-orange-400">{monsterAttack}</strong>.
          Resuelve cada parte de la carta del monstruo según la tabla:
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {parts.map(({ part, effect }) => (
          <div
            key={part}
            className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-850 text-[10px] space-y-1.5"
          >
            <span className="font-mono font-black text-zinc-300 uppercase">
              {PART_LABELS[part]}
            </span>
            <p className="text-zinc-400 leading-snug">{effect.manual}</p>
            <p className="text-orange-300/90 leading-snug">
              {describeMonsterEffect(effect.type)}
            </p>
            {effectNeedsDiscardTop(effect.type) && (
              <button
                type="button"
                onClick={onDiscardTopCombatCard}
                disabled={combatDeckLength === 0}
                className="w-full py-1.5 mt-1 bg-red-950/40 hover:bg-red-950/60 disabled:opacity-40 text-red-300 border border-red-900/40 rounded-lg font-bold uppercase text-[9px]"
              >
                Descartar 1ª carta combate
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
