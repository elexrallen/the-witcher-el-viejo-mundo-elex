import { useState } from "react";
import {
  Play,
  CheckCircle,
  Trash2,
  ArrowRight,
  Layers,
  Award,
} from "lucide-react";
import { ActionCard, WitcherSchool } from "../types";
import WitcherCard from "./WitcherCard";
import PhaseStepper from "./PhaseStepper";
import { canMeditate, getPhaseIIHint, inferPhaseIIAction, PhaseIIAction } from "../utils/phaseII";
import { COMMON_OPPONENTS } from "../utils/cities";
import { AutomaState } from "../types";

type TurnFlowProps = {
  turnPhase: 1 | 2 | 3;
  turnCount: number;
  actionDeckLength: number;
  challengeDeckLength: number;
  automa: AutomaState;
  activeActionCard: ActionCard | null;
  bonusApplied: boolean;
  logs: string[];
  onDrawCard: () => void;
  onApplyBonuses: () => void;
  onMeditate: () => void;
  onExplore: () => void;
  onStartCombat: (opponentType: "monster" | "witcher", name: string) => void;
  onEndTurn: () => void;
  onClearLogs: () => void;
  onAdvanceToPhase2: () => void;
};

export default function TurnFlow({
  turnPhase,
  turnCount,
  actionDeckLength,
  challengeDeckLength,
  automa,
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
}: TurnFlowProps) {
  const [opponentName, setOpponentName] = useState(COMMON_OPPONENTS[0]);
  const [opponentType, setOpponentType] = useState<"monster" | "witcher">("monster");

  const recommended: PhaseIIAction | null = activeActionCard
    ? inferPhaseIIAction(activeActionCard, automa)
    : null;

  const phaseIIActionClass = (action: PhaseIIAction) => {
    if (recommended !== action) return "";
    return "ring-2 ring-orange-500/60 bg-orange-950/20";
  };

  return (
    <div className="turn-flow space-y-4" id="turn-tab-content">
      <div className="turn-flow__stats flex flex-wrap gap-2 text-[10px] font-mono uppercase font-bold text-zinc-500">
        <span className="bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-lg flex items-center gap-1">
          <Award className="w-3.5 h-3.5 text-orange-400" /> Trofeos {automa.trophies}/4
        </span>
        <span className="bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-lg">Turno #{turnCount}</span>
        <span className="bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-lg">Acción: {actionDeckLength}</span>
        <span className="bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-lg">Desafío: {challengeDeckLength}</span>
      </div>

      <PhaseStepper currentPhase={turnPhase} />

      {activeActionCard && turnPhase > 1 && (
        <div className="turn-flow__card-hero flex justify-center py-2">
          <div className="space-y-1 text-center">
            <WitcherCard card={activeActionCard} type="action" />
            <span className="text-[9px] font-mono text-zinc-500 uppercase">ID: {activeActionCard.id}</span>
          </div>
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-2xl">
        {turnPhase === 1 && (
          <div className="text-center space-y-4" id="phase-1-playmat">
            {!activeActionCard ? (
              <>
                <p className="font-sans text-sm text-zinc-400">
                  Fase I: Roba la carta superior del mazo de Acción para definir movimiento, acciones y descarte de mercado.
                </p>
                <button
                  type="button"
                  onClick={onDrawCard}
                  className="py-3 px-6 min-h-[var(--touch-min)] bg-orange-600 hover:bg-orange-500 text-white font-black uppercase rounded-xl flex items-center justify-center gap-2 mx-auto font-display text-xs"
                  id="draw-action-btn"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Revelar Carta de Acción
                </button>
              </>
            ) : (
              <div className="space-y-4 text-left" id="phase-1-actions">
                <h5 className="text-[10px] uppercase font-mono text-orange-400 font-bold">Fase I — Movimiento y acciones</h5>
                <p className="text-xs text-zinc-300">
                  Mueve <strong className="text-white">{activeActionCard.movement} espacios</strong> hacia{" "}
                  <strong className="text-white">{activeActionCard.destination}</strong> (ruta más corta).
                  Desempate: rastro → menor vida → flecha de dirección.
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
                  <div className="bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 p-3 rounded-xl text-xs flex items-center gap-2 font-bold">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    Acciones de Fase I aplicadas
                  </div>
                )}
                {(bonusApplied || (!activeActionCard.attributeBonus && !activeActionCard.potionBonus && !activeActionCard.bombBonus && !activeActionCard.trailBonus)) && (
                  <button
                    type="button"
                    onClick={onAdvanceToPhase2}
                    className="w-full py-3 min-h-[var(--touch-min)] btn btn--primary font-display uppercase text-xs"
                  >
                    Continuar a Fase II <ArrowRight className="w-4 h-4 inline ml-1" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {turnPhase === 2 && activeActionCard && (
          <div className="space-y-4" id="phase-2-playmat">
            <p className="text-xs text-zinc-400 bg-zinc-950/60 border border-zinc-850 rounded-xl p-3">
              {getPhaseIIHint(activeActionCard)}
            </p>

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
                  Atributo en nivel 5 + trofeo disponible. ¡Puede ganar la partida!
                </span>
              </button>

              <div className={`p-4 rounded-xl bg-zinc-950 border border-zinc-850 space-y-3 ${phaseIIActionClass("combat")}`}>
                <span className="font-display text-xs font-black text-red-400 block uppercase">
                  Combatir {recommended === "combat" && "← Prioridad carta"}
                </span>
                <p className="text-[10px] text-zinc-400">{activeActionCard.combatRequirement}</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={opponentType}
                    onChange={(e) => setOpponentType(e.target.value as "monster" | "witcher")}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-2 text-xs min-h-[var(--touch-min)]"
                  >
                    <option value="monster">Monstruo</option>
                    <option value="witcher">Brujo</option>
                  </select>
                  <select
                    value={opponentName}
                    onChange={(e) => setOpponentName(e.target.value)}
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-2 text-xs min-h-[var(--touch-min)]"
                  >
                    {COMMON_OPPONENTS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => onStartCombat(opponentType, opponentName)}
                  className="w-full py-2.5 min-h-[var(--touch-min)] bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-900/40 rounded-xl text-xs font-bold uppercase"
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
              <Trash2 className="w-4 h-4" /> Fase III — Mercado
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
            <button
              type="button"
              onClick={onEndTurn}
              className="w-full py-3.5 min-h-[var(--touch-min)] bg-zinc-900 hover:bg-zinc-800 text-orange-400 border border-orange-500/30 rounded-xl font-black font-display uppercase text-xs flex items-center justify-center gap-2"
              id="end-turn-btn"
            >
              Terminar turno del Automa <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {turnPhase === 1 && !activeActionCard && (
          <div className="flex justify-center py-4 text-zinc-600">
            <Layers className="w-10 h-10 stroke-[1.5]" />
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
