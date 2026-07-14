import { useState } from "react";
import { WitcherIcon } from "./WitcherIcon";
import { CombatState, WitcherSchool } from "../types";
import WitcherCard from "./WitcherCard";
import SpecialSchoolCardComponent from "./SpecialSchoolCardComponent";
import { useIsMobile } from "../hooks/useMediaQuery";

type CombatViewProps = {
  combat: CombatState;
  activeSchool: WitcherSchool;
  onAttack: () => void;
  onReceiveDamage: (damage: number) => void;
  onEndCombat: (automaWon: boolean) => void;
};

export default function CombatView({
  combat,
  activeSchool,
  onAttack,
  onReceiveDamage,
  onEndCombat,
}: CombatViewProps) {
  const isMobile = useIsMobile();
  const [damageInput, setDamageInput] = useState("");
  const [monsterAttack, setMonsterAttack] = useState<"mordisco" | "embestida" | null>(null);
  const [cardSheetOpen, setCardSheetOpen] = useState(true);

  const applyDamage = () => {
    const val = parseInt(damageInput, 10);
    if (val > 0) {
      onReceiveDamage(val);
      setDamageInput("");
    }
  };

  return (
    <main className="combat-view flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto" id="combat-view">
      <div className="combat-view__layout flex flex-col gap-4">
        <div className="bg-zinc-900 border-2 border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-600" />
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <WitcherIcon name="combat" size={22} className="text-red-500" />
              <h2 className="font-display text-base sm:text-lg font-black text-red-400 uppercase">
                vs {combat.opponentName}
              </h2>
            </div>
            <span className="text-[10px] font-mono text-red-400 bg-red-950/60 px-2.5 py-0.5 rounded-full border border-red-900/50 uppercase font-bold">
              {combat.opponentType === "monster" ? "Monstruo" : "Brujo"}
            </span>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-xs text-zinc-400">
              <span className="font-bold">Mazo de Combate del Automa</span>
              <span className="font-mono font-black text-white">{combat.combatDeck.length} cartas</span>
            </div>
            <div className="w-full bg-zinc-950 h-3 rounded-full overflow-hidden border border-zinc-800">
              <div
                className="bg-red-600 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (combat.combatDeck.length / 12) * 100)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={onAttack}
              disabled={combat.combatDeck.length === 0}
              className="py-3 min-h-[var(--touch-min)] bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 text-white font-black rounded-xl flex items-center justify-center gap-2 text-sm font-display uppercase"
              id="combat-attack-btn"
            >
              <WitcherIcon name="sword" size={18} /> Atacar (Automa)
            </button>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Daño"
                min="1"
                value={damageInput}
                onChange={(e) => setDamageInput(e.target.value)}
                className="flex-1 bg-zinc-950 text-sm border border-zinc-800 rounded-xl px-3 py-2 text-center font-mono text-red-400 min-h-[var(--touch-min)]"
              />
              <button
                type="button"
                onClick={applyDamage}
                className="px-4 min-h-[var(--touch-min)] bg-zinc-900 text-red-400 border border-red-900/40 rounded-xl font-bold text-xs uppercase font-display"
                id="combat-receive-damage-btn"
              >
                Daño
              </button>
            </div>
          </div>

          {combat.opponentType === "monster" && (
            <div className="mt-4 pt-4 border-t border-zinc-800/80">
              <p className="text-[10px] uppercase font-mono text-zinc-500 font-bold mb-2">
                Turno del monstruo — elige antes de revelar carta:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMonsterAttack("mordisco")}
                  className={`py-2.5 min-h-[var(--touch-min)] rounded-xl border text-xs font-bold uppercase font-display ${
                    monsterAttack === "mordisco"
                      ? "bg-orange-950/40 border-orange-500 text-orange-400"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400"
                  }`}
                >
                  Mordisco
                </button>
                <button
                  type="button"
                  onClick={() => setMonsterAttack("embestida")}
                  className={`py-2.5 min-h-[var(--touch-min)] rounded-xl border text-xs font-bold uppercase font-display ${
                    monsterAttack === "embestida"
                      ? "bg-orange-950/40 border-orange-500 text-orange-400"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400"
                  }`}
                >
                  Embestida
                </button>
              </div>
              {monsterAttack && (
                <p className="text-[10px] text-zinc-500 mt-2">
                  Anunciado: <strong className="text-zinc-300">{monsterAttack}</strong>. Revela la carta de combate del monstruo en mesa.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 h-[180px] sm:h-[200px] flex flex-col">
          <span className="text-[9px] uppercase font-mono text-zinc-500 font-bold mb-2">Bitácora de combate</span>
          <div className="overflow-y-auto flex-1 space-y-1 font-mono text-[11px]" id="combat-logs-scroller">
            {combat.fightLog.map((logLine, logIdx) => (
              <div
                key={logIdx}
                className={`border-l-2 pl-2 ${
                  logLine.includes("⚡") ? "border-red-500 text-red-300" : logLine.includes("Turno Automa") || logLine.includes("Ataque") ? "border-orange-500 text-orange-300" : "border-zinc-800 text-zinc-400"
                }`}
              >
                {logLine}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => onEndCombat(true)} className="flex-1 py-3 min-h-[var(--touch-min)] bg-zinc-900 border border-emerald-950 text-emerald-400 font-display font-black rounded-xl text-xs uppercase" id="combat-win-btn">
            Automa gana
          </button>
          <button type="button" onClick={() => onEndCombat(false)} className="flex-1 py-3 min-h-[var(--touch-min)] bg-zinc-900 border border-red-950 text-red-400 font-display font-black rounded-xl text-xs uppercase" id="combat-lose-btn">
            Automa pierde
          </button>
        </div>

        {isMobile ? (
          <>
            {combat.revealedCard && (
              <button type="button" onClick={() => setCardSheetOpen(!cardSheetOpen)} className="combat-card-sheet__toggle py-2 text-xs text-orange-400 font-bold uppercase">
                {cardSheetOpen ? "Ocultar carta" : "Ver carta revelada"}
              </button>
            )}
            <div className={`combat-card-sheet ${cardSheetOpen && combat.revealedCard ? "combat-card-sheet--open" : ""}`}>
              {combat.revealedCard ? (
                <div className="flex flex-col items-center gap-3 p-4">
                  <WitcherCard card={combat.revealedCard} type="challenge" school={activeSchool} />
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono w-full max-w-[280px]">
                    <span className="text-red-400 font-black text-center">{combat.damageInflictedThisTurn} Daño</span>
                    <span className="text-sky-400 font-black text-center">+{combat.shieldsActiveThisTurn} Escudo</span>
                  </div>
                  {(combat.bonusOpponentDamageThisTurn ?? 0) > 0 && (
                    <p className="text-amber-400 text-xs font-mono text-center">
                      +{combat.bonusOpponentDamageThisTurn} daño al oponente (poción)
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center text-zinc-500 text-sm">
                  <WitcherIcon name="cards" size={40} className="mx-auto mb-2 text-zinc-600" />
                  Pulsa Atacar para revelar carta
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4">
            {combat.revealedCard ? (
              <>
                <WitcherCard card={combat.revealedCard} type="challenge" school={activeSchool} />
                <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                  <span className="text-red-400 font-black">{combat.damageInflictedThisTurn} Daño</span>
                  <span className="text-sky-400 font-black">+{combat.shieldsActiveThisTurn} Escudo</span>
                </div>
              </>
            ) : (
              <div className="w-full max-w-[280px] min-h-[12rem] border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col justify-center items-center p-6 text-zinc-500 text-center text-sm">
                <WitcherIcon name="cards" size={48} className="mb-3 text-zinc-600" />
                Pulsa Atacar (Automa) para revelar carta
              </div>
            )}
            <SpecialSchoolCardComponent
              school={activeSchool}
              activeSpecialIndex={
                combat.revealedCard?.id === "cha-25" ? 1 : combat.revealedCard?.id === "cha-26" ? 2 : combat.revealedCard?.id === "cha-27" ? 3 : null
              }
            />
          </div>
        )}
      </div>
    </main>
  );
}
