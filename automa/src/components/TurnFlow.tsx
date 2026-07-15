import { useState, useEffect, useMemo } from "react";
import { WitcherIcon } from "./WitcherIcon";
import { ActionCard, AutomaPlayerState, AutomaState } from "../types";
import ActionCardTurnPreview from "./ActionCardTurnPreview";
import PhaseStepper from "./PhaseStepper";
import { canMeditate, getMeditationTrophyAttribute, ATTRIBUTE_LABELS } from "../utils/meditation";
import {
  getPhaseIIHint,
  inferPhaseIIAction,
  PhaseIIAction,
  PhaseIIPresence,
  resolvePhaseIICombat,
} from "../utils/phaseII";
import { COMBAT_MONSTER_OPTIONS } from "../utils/monsterSpecialAttacks";
import { formatMovementGuide, formatDestination, formatTieBreak } from "../utils/actionCard";
import { formatCombatCondition } from "../utils/combatCondition";
import { closeAllOpenDialogs } from "../utils/dialog";
import {
  formatAutomaOpponentLabel,
  getCoLocatedAutomaIndices,
} from "../utils/automaVsAutoma";

export type StartCombatOptions = {
  /** Índice del Automa rival; null = brujo humano / mesa. */
  opponentAutomaIndex?: number | null;
};

type TurnFlowProps = {
  turnPhase: 1 | 2 | 3;
  turnCount: number;
  actionDeckLength: number;
  challengeDeckLength: number;
  automa: AutomaState;
  automaPlayers?: AutomaPlayerState[];
  activeAutomaIndex?: number;
  activeActionCard: ActionCard | null;
  bonusApplied: boolean;
  logs: string[];
  onDrawCard: () => void;
  onApplyBonuses: () => void;
  onMeditate: () => void;
  onExplore: () => void;
  onStartCombat: (
    opponentType: "monster" | "witcher",
    name: string,
    options?: StartCombatOptions
  ) => void;
  onEndTurn: () => void;
  onClearLogs: () => void;
  onAdvanceToPhase2: () => void;
  useLegendaryHunt?: boolean;
  onCollectDestructionToken?: () => void;
};

export default function TurnFlow({
  turnPhase,
  turnCount,
  actionDeckLength,
  challengeDeckLength,
  automa,
  automaPlayers = [],
  activeAutomaIndex = 0,
  activeActionCard,
  bonusApplied,
  logs,
  onDrawCard,
  onApplyBonuses,
  onMeditate,
  onExplore,
  onStartCombat,
  onEndTurn,
  onClearLogs,
  onAdvanceToPhase2,
  useLegendaryHunt = false,
  onCollectDestructionToken,
}: TurnFlowProps) {
  const [opponentName, setOpponentName] = useState("Grifo");
  const [opponentType, setOpponentType] = useState<"monster" | "witcher">("monster");
  /** -1 = brujo humano/mesa; >=0 = índice Automa rival */
  const [selectedRivalIndex, setSelectedRivalIndex] = useState<number>(-1);
  const [presence, setPresence] = useState<PhaseIIPresence>({
    witcherPresent: false,
    monsterPresent: true,
  });
  const [witcherPresenceTouched, setWitcherPresenceTouched] = useState(false);

  const coLocatedIndices = useMemo(
    () => getCoLocatedAutomaIndices(automaPlayers, activeAutomaIndex),
    [automaPlayers, activeAutomaIndex, automa.location]
  );

  useEffect(() => {
    if (activeActionCard?.legendaryMonsterCombat) {
      setOpponentType("monster");
      setOpponentName("Monstruo legendario");
      setPresence({ witcherPresent: false, monsterPresent: true });
      setWitcherPresenceTouched(false);
      setSelectedRivalIndex(-1);
    }
  }, [activeActionCard?.id, activeActionCard?.legendaryMonsterCombat]);

  useEffect(() => {
    if (witcherPresenceTouched || activeActionCard?.legendaryMonsterCombat) {
      return;
    }
    if (coLocatedIndices.length > 0) {
      setPresence((prev) => ({ ...prev, witcherPresent: true }));
      setSelectedRivalIndex(coLocatedIndices[0]);
      setOpponentType("witcher");
      setOpponentName(formatAutomaOpponentLabel(automaPlayers[coLocatedIndices[0]]));
    } else {
      setPresence((prev) => ({ ...prev, witcherPresent: false }));
      setSelectedRivalIndex(-1);
    }
  }, [
    coLocatedIndices,
    automaPlayers,
    witcherPresenceTouched,
    activeActionCard?.legendaryMonsterCombat,
  ]);

  useEffect(() => {
    if (!activeActionCard || turnPhase !== 2) return;
    const resolved = resolvePhaseIICombat(activeActionCard, automa, presence);
    if (resolved) {
      setOpponentType(resolved.opponentType);
    }
  }, [activeActionCard, automa.trophies, presence, turnPhase]);

  useEffect(() => {
    if (opponentType !== "witcher") return;
    if (selectedRivalIndex >= 0 && automaPlayers[selectedRivalIndex]) {
      setOpponentName(formatAutomaOpponentLabel(automaPlayers[selectedRivalIndex]));
    } else if (selectedRivalIndex < 0 && opponentName !== "Brujo rival") {
      // keep custom human name if already set to a monster option wrongly
      if (!automaPlayers.some((p) => formatAutomaOpponentLabel(p) === opponentName)) {
        setOpponentName("Brujo rival");
      }
    }
  }, [opponentType, selectedRivalIndex, automaPlayers]);

  const recommended: PhaseIIAction | null = activeActionCard
    ? inferPhaseIIAction(activeActionCard, automa, presence)
    : null;

  const combatAvailable = activeActionCard
    ? resolvePhaseIICombat(activeActionCard, automa, presence) !== null
    : false;

  const meditationAttribute = getMeditationTrophyAttribute(automa);

  const phaseIIActionClass = (action: PhaseIIAction) => {
    if (recommended !== action) return "";
    return "ring-2 ring-orange-500/60 bg-orange-950/20";
  };

  return (
    <div className="turn-flow space-y-4" id="turn-tab-content">
      <div className="turn-flow__stats flex flex-wrap gap-2 text-[10px] font-mono uppercase font-bold text-zinc-500">
        <span className="bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-lg flex items-center gap-1">
          <WitcherIcon name="trophy" size={14} className="text-orange-400" /> Trofeos {automa.trophies}/4
        </span>
        <span className="bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-lg">Turno #{turnCount}</span>
        <span className="bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-lg">Acción: {actionDeckLength}</span>
        <span className="bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-lg">Desafío: {challengeDeckLength}</span>
      </div>

      <PhaseStepper currentPhase={turnPhase} />

      {activeActionCard && (
        <div className="turn-flow__card-hero py-2">
          <ActionCardTurnPreview card={activeActionCard} />
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-2xl">
        {turnPhase === 1 && (
          <div className="text-center space-y-4" id="phase-1-playmat">
            {!activeActionCard ? (
              <>
                <p className="font-sans text-sm text-zinc-400">
                  Fase I: Roba la carta superior del mazo de Acción para definir movimiento, acciones y descarte de mercado.
                  Si el mazo se vacía, se reponen solo las cartas de <strong className="text-zinc-300">nivel III</strong> del descarte (barajadas).
                </p>
                <button
                  type="button"
                  onClick={onDrawCard}
                  className="py-3 px-6 min-h-[var(--touch-min)] bg-orange-600 hover:bg-orange-500 text-white font-black uppercase rounded-xl flex items-center justify-center gap-2 mx-auto font-display text-xs"
                  id="draw-action-btn"
                >
                  <WitcherIcon name="play" size={18} />
                  Revelar Carta de Acción
                </button>
              </>
            ) : (
              <div className="space-y-4 text-left" id="phase-1-actions">
                <h5 className="text-[10px] uppercase font-mono text-orange-400 font-bold">Fase I — Movimiento y acciones</h5>
                <p className="text-xs text-zinc-300">
                  Desplázate <strong className="text-white">{formatMovementGuide(activeActionCard.movement)}</strong> hacia{" "}
                  <strong className="text-white">{formatDestination(activeActionCard)}</strong>.
                  {formatTieBreak(activeActionCard.tieBreakDirection) && (
                    <> Desempate: rastro → menor vida → <strong className="text-white">{formatTieBreak(activeActionCard.tieBreakDirection)}</strong>.</>
                  )}
                  {!activeActionCard.tieBreakDirection && (
                    <> Desempate: rastro → menor vida → flecha de dirección.</>
                  )}
                </p>
                {!bonusApplied ? (
                  <button
                    type="button"
                    onClick={onApplyBonuses}
                    className="w-full py-3 min-h-[var(--touch-min)] bg-orange-500/10 hover:bg-orange-500/25 text-orange-400 border border-orange-500/30 rounded-xl text-xs font-bold font-display uppercase"
                    id="apply-bonus-btn"
                  >
                    Aplicar acciones de Fase I
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 p-3 rounded-xl text-xs flex items-center gap-2 font-bold">
                      <WitcherIcon name="check" size={18} className="shrink-0" />
                      Acciones de Fase I aplicadas
                    </div>
                    {useLegendaryHunt && onCollectDestructionToken && (
                      <button
                        type="button"
                        onClick={onCollectDestructionToken}
                        className="w-full py-2.5 min-h-[var(--touch-min)] bg-red-950/30 hover:bg-red-950/50 text-red-300 border border-red-900/40 rounded-xl text-xs font-bold font-display uppercase flex items-center justify-center gap-2"
                        id="collect-destruction-btn"
                      >
                        <WitcherIcon name="legendary" size={16} />
                        Recoger ficha de Destrucción (fin Fase I en casilla destruida)
                      </button>
                    )}
                  </div>
                )}
                {(bonusApplied || (!activeActionCard.attributeBonus && !activeActionCard.potionBonus && !activeActionCard.bombBonus && !activeActionCard.trailBonus)) && (
                  <button
                    type="button"
                    onClick={onAdvanceToPhase2}
                    className="w-full py-3 min-h-[var(--touch-min)] btn btn--primary font-display uppercase text-xs"
                  >
                    Continuar a Fase II <WitcherIcon name="arrow-right" size={16} className="inline ml-1" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {turnPhase === 2 && activeActionCard && (
          <div className="space-y-4" id="phase-2-playmat">
            <p className="text-xs text-zinc-400 bg-zinc-950/60 border border-zinc-850 rounded-xl p-3">
              {getPhaseIIHint(activeActionCard, automa, presence)}
            </p>

            <div className="flex flex-wrap gap-3 text-[10px] text-zinc-400 bg-zinc-950/40 border border-zinc-850 rounded-xl p-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={presence.monsterPresent}
                  onChange={(e) =>
                    setPresence((p) => ({ ...p, monsterPresent: e.target.checked }))
                  }
                  className="rounded border-zinc-700"
                />
                Monstruo en localización
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={presence.witcherPresent}
                  onChange={(e) => {
                    setWitcherPresenceTouched(true);
                    setPresence((p) => ({ ...p, witcherPresent: e.target.checked }));
                  }}
                  className="rounded border-zinc-700"
                />
                Brujo en localización
              </label>
              {coLocatedIndices.length > 0 && (
                <span className="w-full text-orange-400/90 text-[10px]">
                  Automa(s) en la misma casilla ({automa.location}):{" "}
                  {coLocatedIndices
                    .map((i) => formatAutomaOpponentLabel(automaPlayers[i]))
                    .join(", ")}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              <button
                type="button"
                onClick={onMeditate}
                disabled={!canMeditate(automa)}
                className={`p-4 min-h-[var(--touch-min)] rounded-xl bg-zinc-950 border border-zinc-850 hover:border-orange-500/50 text-left transition-all cursor-pointer disabled:opacity-40 ${phaseIIActionClass("meditate")}`}
                id="option-meditate-btn"
              >
                <span className="font-display text-xs font-black text-orange-400 block uppercase">
                  Meditar {recommended === "meditate" && "← Prioridad carta"}
                </span>
                <span className="text-[10px] text-zinc-400 block mt-1">
                  {meditationAttribute
                    ? `Trofeo de ${ATTRIBUTE_LABELS[meditationAttribute]} disponible (orden tablero).`
                    : "Requiere atributo en nivel 5 con trofeo de meditación libre."}
                </span>
              </button>

              <div className={`p-4 rounded-xl bg-zinc-950 border border-zinc-850 space-y-3 ${phaseIIActionClass("combat")}`}>
                <span className="font-display text-xs font-black text-red-400 block uppercase">
                  Combatir {recommended === "combat" && "← Prioridad carta"}
                </span>
                <p className="text-[10px] text-zinc-400">{formatCombatCondition(activeActionCard)}</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={opponentType}
                    onChange={(e) => {
                      const next = e.target.value as "monster" | "witcher";
                      setOpponentType(next);
                      if (next === "witcher" && coLocatedIndices.length > 0) {
                        setSelectedRivalIndex(coLocatedIndices[0]);
                      } else if (next === "witcher") {
                        setSelectedRivalIndex(-1);
                        setOpponentName("Brujo rival");
                      } else {
                        setSelectedRivalIndex(-1);
                        setOpponentName("Grifo");
                      }
                    }}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-2 text-xs min-h-[var(--touch-min)]"
                  >
                    <option value="monster">Monstruo</option>
                    <option value="witcher">Brujo</option>
                  </select>
                  {opponentType === "witcher" ? (
                    <select
                      value={String(selectedRivalIndex)}
                      onChange={(e) => {
                        const idx = Number(e.target.value);
                        setSelectedRivalIndex(idx);
                        if (idx >= 0 && automaPlayers[idx]) {
                          setOpponentName(formatAutomaOpponentLabel(automaPlayers[idx]));
                        } else {
                          setOpponentName("Brujo rival");
                        }
                      }}
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-2 text-xs min-h-[var(--touch-min)]"
                    >
                      <option value="-1">Brujo (humano / mesa)</option>
                      {coLocatedIndices.map((index) => (
                        <option key={automaPlayers[index].id} value={index}>
                          {formatAutomaOpponentLabel(automaPlayers[index])}
                        </option>
                      ))}
                      {automaPlayers.length > 1 &&
                        automaPlayers
                          .map((player, index) => ({ player, index }))
                          .filter(
                            ({ index }) =>
                              index !== activeAutomaIndex &&
                              !coLocatedIndices.includes(index)
                          )
                          .map(({ player, index }) => (
                            <option key={player.id} value={index}>
                              {formatAutomaOpponentLabel(player)} (otra casilla)
                            </option>
                          ))}
                    </select>
                  ) : (
                    <select
                      value={opponentName}
                      onChange={(e) => setOpponentName(e.target.value)}
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-2 text-xs min-h-[var(--touch-min)]"
                    >
                      {["Legendarios", "Regulares", undefined].map((group) => {
                        const options = COMBAT_MONSTER_OPTIONS.filter(
                          (o) => o.group === group || (!group && !o.group)
                        );
                        if (options.length === 0) return null;
                        return (
                          <optgroup key={group ?? "other"} label={group ?? "Otros"}>
                            {options.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </optgroup>
                        );
                      })}
                    </select>
                  )}
                </div>
                {opponentType === "witcher" && selectedRivalIndex >= 0 && (
                  <p className="text-[10px] text-orange-400/80">
                    Combate Automa vs Automa: ambos usarán su mazo de Desafío.
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => {
                    closeAllOpenDialogs();
                    onStartCombat(opponentType, opponentName, {
                      opponentAutomaIndex:
                        opponentType === "witcher" && selectedRivalIndex >= 0
                          ? selectedRivalIndex
                          : null,
                    });
                  }}
                  disabled={!combatAvailable}
                  className="w-full py-2.5 min-h-[var(--touch-min)] bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-900/40 rounded-xl text-xs font-bold uppercase disabled:opacity-40"
                  id="option-combat-btn"
                >
                  Iniciar combate
                </button>
              </div>

              <button
                type="button"
                onClick={onExplore}
                className={`p-4 min-h-[var(--touch-min)] rounded-xl bg-zinc-950 border border-zinc-850 hover:border-sky-500/50 text-left ${phaseIIActionClass("explore")}`}
                id="option-explore-btn"
              >
                <span className="font-display text-xs font-black text-sky-400 block uppercase">
                  Explorar {recommended === "explore" && "← Si otras no aplican"}
                </span>
                <span className="text-[10px] text-zinc-400 block mt-1">No robar eventos. Pasa a Fase III.</span>
              </button>
            </div>
          </div>
        )}

        {turnPhase === 3 && activeActionCard && (
          <div className="space-y-4" id="phase-3-playmat">
            <h5 className="text-[10px] uppercase font-mono text-red-400 font-bold flex items-center gap-1.5">
              <WitcherIcon name="trash" size={18} /> Fase III — Mercado
            </h5>
            <p className="text-xs text-zinc-300">Descarta las cartas del mercado en estas posiciones (izq. a der.):</p>
            <div className="flex gap-2 justify-center flex-wrap py-2">
              {activeActionCard.marketDiscards.map((pos) => (
                <div
                  key={pos}
                  className="bg-red-950/40 border-2 border-red-900/60 text-red-400 px-5 py-3 rounded-xl font-mono text-base font-black"
                >
                  Pos. {pos}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-zinc-500">Reponer mercado tras descartar todas las indicadas.</p>
            {activeActionCard.returnToDeckBottomIfLegendaryAlive && (
              <p className="text-[10px] text-red-400/90 bg-red-950/20 border border-red-900/30 rounded-lg p-2">
                Si el Monstruo Legendario sigue vivo, esta carta va al <strong>fondo del mazo de Acción</strong> (no al descarte).
              </p>
            )}
            <button
              type="button"
              onClick={onEndTurn}
              className="w-full py-3.5 min-h-[var(--touch-min)] bg-zinc-900 hover:bg-zinc-800 text-orange-400 border border-orange-500/30 rounded-xl font-black font-display uppercase text-xs flex items-center justify-center gap-2"
              id="end-turn-btn"
            >
              Terminar turno del Automa <WitcherIcon name="arrow-right" size={16} />
            </button>
          </div>
        )}

        {turnPhase === 1 && !activeActionCard && (
          <div className="flex justify-center py-4 text-zinc-600">
            <WitcherIcon name="cards" size={40} className="text-zinc-600" />
          </div>
        )}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-2xl">
        <div className="flex items-center justify-between mb-2 border-b border-zinc-800 pb-2">
          <span className="text-[10px] uppercase font-mono text-zinc-500 font-bold">Registro</span>
          <button type="button" onClick={onClearLogs} className="text-[9px] uppercase text-zinc-500 hover:text-zinc-300 font-bold">
            Limpiar
          </button>
        </div>
        <div className="max-h-[120px] overflow-y-auto space-y-1 font-mono text-[11px] text-zinc-400">
          {logs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-orange-500 shrink-0">»</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
