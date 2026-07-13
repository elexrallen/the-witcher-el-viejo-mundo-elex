import { useState, type ReactNode } from "react";
import {
  ShieldAlert,
  Zap,
  Flame,
  Shield,
  Skull,
  Droplet,
  Play,
  ChevronLeft,
  ChevronRight,
  Dices,
  Layers,
  Anchor,
  Skull as SkeletonIcon,
} from "lucide-react";
import { WitcherSchoolId, WitcherSchool } from "../types";
import { WITCHER_SCHOOLS } from "../data/schools";
import SpecialSchoolCardComponent from "./SpecialSchoolCardComponent";
import PlayerAssistantLinks from "./PlayerAssistantLinks";
import { useIsMobile } from "../hooks/useMediaQuery";

type Difficulty = "easy" | "intermediate" | "difficult";

type SetupWizardProps = {
  selectedSchoolId: WitcherSchoolId;
  onSchoolChange: (id: WitcherSchoolId) => void;
  difficulty: Difficulty;
  onDifficultyChange: (d: Difficulty) => void;
  useDicePoker: boolean;
  onDicePokerChange: (v: boolean) => void;
  useMutagens: boolean;
  onMutagensChange: (v: boolean) => void;
  useSkellige: boolean;
  onSkelligeChange: (v: boolean) => void;
  useLegendaryHunt: boolean;
  onLegendaryHuntChange: (v: boolean) => void;
  selectedSchool: WitcherSchool;
  onStart: () => void;
};

const STEPS = ["Escuela", "Dificultad", "Módulos", "Resumen"];

const SCHOOL_ICONS: Record<WitcherSchoolId, ReactNode> = {
  wolf: <ShieldAlert className="w-4 h-4 text-red-400" />,
  cat: <Zap className="w-4 h-4 text-emerald-400" />,
  griffin: <Flame className="w-4 h-4 text-amber-400" />,
  bear: <Shield className="w-4 h-4 text-amber-600" />,
  viper: <Skull className="w-4 h-4 text-purple-400" />,
  manticore: <Droplet className="w-4 h-4 text-cyan-400" />,
};

function DeckTable({ difficulty }: { difficulty: Difficulty }) {
  const action =
    difficulty === "easy"
      ? ["Nivel I: 4 Gen. + 1 Esp.", "Nivel II: 4 Gen. + 1 Esp.", "Nivel III: 2 Gen. + 1 Esp.", "Total: 13 cartas"]
      : difficulty === "intermediate"
        ? ["Nivel I: 3 Gen. + 1 Esp.", "Nivel II: 3 Gen. + 1 Esp.", "Nivel III: 3 Gen. + 1 Esp.", "Total: 12 cartas"]
        : ["Nivel I: 2 Gen. + 1 Esp.", "Nivel II: 2 Gen. + 1 Esp.", "Nivel III: 2 Gen. + 1 Esp.", "Total: 9 cartas"];

  const challenge =
    difficulty === "easy"
      ? ["Nivel I: 2 Gen. + 2 Esp.", "Nivel II: 2 Gen. + 2 Esp.", "Nivel III: 1 Gen. + 2 Esp.", "Total: 11 cartas"]
      : ["Nivel I: 3 Gen. + 2 Esp.", "Nivel II: 3 Gen. + 2 Esp.", "Nivel III: 0 Gen. + 2 Esp.", "Total: 12 cartas"];

  return (
    <div className="setup-deck-table grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
      <div className="bg-zinc-900/40 p-3 rounded-lg border border-zinc-850">
        <span className="text-zinc-200 font-bold block mb-2">Mazo de ACCIÓN</span>
        <ul className="space-y-0.5 text-zinc-400">
          {action.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="text-[10px] text-orange-400/80 mt-2">Baraja Lvl3 → Lvl2 → Lvl1 al apilar.</p>
      </div>
      <div className="bg-zinc-900/40 p-3 rounded-lg border border-zinc-850">
        <span className="text-zinc-200 font-bold block mb-2">Mazo de DESAFÍO</span>
        <ul className="space-y-0.5 text-zinc-400">
          {challenge.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="text-[10px] text-orange-400/80 mt-2">Aparta 3 cartas Lvl3 para trofeos.</p>
      </div>
    </div>
  );
}

export default function SetupWizard({
  selectedSchoolId,
  onSchoolChange,
  difficulty,
  onDifficultyChange,
  useDicePoker,
  onDicePokerChange,
  useMutagens,
  onMutagensChange,
  useSkellige,
  onSkelligeChange,
  useLegendaryHunt,
  onLegendaryHuntChange,
  selectedSchool,
  onStart,
}: SetupWizardProps) {
  const isMobile = useIsMobile();
  const [step, setStep] = useState(0);
  const [showBonusTip, setShowBonusTip] = useState(false);

  const bonusLabel = (id: WitcherSchoolId) => {
    if (id === "wolf") return "+1 Daño";
    if (id === "cat") return "+1 Escudo";
    if (id === "bear") return "+2 Escudos";
    return "+1 Daño / +1 Escudo";
  };

  const canNext = step < STEPS.length - 1;
  const canPrev = step > 0;

  return (
    <main className="setup-wizard flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6" id="setup-view">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="flex-1 w-full">
          <div className="panel automa-panel-accent border-2 border-zinc-800 rounded-2xl p-5 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-display uppercase">
                Preparación del Automa V1.4
              </h2>
              <p className="text-sm text-zinc-400 mt-2">Paso {step + 1} de {STEPS.length}: {STEPS[step]}</p>
            </div>

            <div className="setup-stepper flex gap-1 mb-6 overflow-x-auto">
              {STEPS.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setStep(i)}
                  className={`setup-stepper__step shrink-0 ${i === step ? "setup-stepper__step--active" : i < step ? "setup-stepper__step--done" : ""}`}
                >
                  <span className="setup-stepper__num">{i + 1}</span>
                  <span className="setup-stepper__label">{label}</span>
                </button>
              ))}
            </div>

            {step === 0 && (
              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-500 font-mono mb-3 font-bold">
                  Selecciona la Escuela del Automa
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {WITCHER_SCHOOLS.map((school) => {
                    const isSelected = selectedSchoolId === school.id;
                    return (
                      <button
                        key={school.id}
                        type="button"
                        onClick={() => onSchoolChange(school.id)}
                        className={`p-3 sm:p-4 rounded-xl border-2 text-left flex flex-col justify-between min-h-[5.5rem] transition-all cursor-pointer ${
                          isSelected
                            ? "bg-gradient-to-br from-orange-600/30 to-amber-500/20 border-orange-500 text-white"
                            : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                        }`}
                        id={`setup-school-${school.id}`}
                      >
                        <div className="flex items-center justify-between w-full gap-1">
                          <span className="font-display text-xs sm:text-sm font-bold">{school.name}</span>
                          {SCHOOL_ICONS[school.id]}
                        </div>
                        <span className="text-[10px] font-mono mt-2 text-orange-400 font-black uppercase">
                          {bonusLabel(school.id)}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => setShowBonusTip(!showBonusTip)}
                  className="mt-3 text-xs text-orange-400 underline cursor-pointer"
                >
                  {showBonusTip ? "Ocultar" : "¿Qué significan los bonos de escuela?"}
                </button>
                {showBonusTip && (
                  <p className="mt-2 text-xs text-zinc-400 leading-relaxed bg-zinc-950/60 border border-zinc-850 rounded-xl p-3">
                    En combate, si la carta muestra el símbolo de escuela, el Automa recibe el bono pasivo de su fortaleza (+daño o +escudo según escuela).
                  </p>
                )}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <label className="block text-xs uppercase tracking-wider text-zinc-500 font-mono font-bold">
                  Nivel de Dificultad
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { key: "easy" as const, label: "Fácil", desc: "13 Acciones / 11 Desafíos" },
                    { key: "intermediate" as const, label: "Intermedio", desc: "12 Acciones / 12 Desafíos" },
                    { key: "difficult" as const, label: "Difícil", desc: "9 Acciones / 12 Desafíos" },
                  ].map((diffOpt) => (
                    <button
                      key={diffOpt.key}
                      type="button"
                      onClick={() => onDifficultyChange(diffOpt.key)}
                      className={`p-3 min-h-[var(--touch-min)] rounded-xl border-2 text-center transition-all cursor-pointer ${
                        difficulty === diffOpt.key
                          ? "bg-orange-950/20 text-orange-400 border-orange-500"
                          : "bg-zinc-950 border-zinc-800 text-zinc-400"
                      }`}
                    >
                      <span className="font-display text-sm font-bold uppercase block">{diffOpt.label}</span>
                      <span className="text-[10px] font-mono opacity-85">{diffOpt.desc}</span>
                    </button>
                  ))}
                </div>
                <DeckTable difficulty={difficulty} />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <label className="block text-xs uppercase tracking-wider text-zinc-500 font-mono font-bold mb-2">
                  Módulos y expansiones
                </label>
                {[
                  { checked: useDicePoker, onChange: onDicePokerChange, icon: Dices, title: "Póker de Dados", desc: "Rerolls con cartas del mazo Desafío." },
                  { checked: useMutagens, onChange: onMutagensChange, icon: Layers, title: "Mutágenos y Debilidad", desc: "Mutaciones y debilitar monstruos con rastros." },
                  { checked: useSkellige, onChange: onSkelligeChange, icon: Anchor, title: "Skellige", desc: "Islas, barcos y pista de Dagon." },
                  { checked: useLegendaryHunt, onChange: onLegendaryHuntChange, icon: SkeletonIcon, title: "Cacería Legendaria", desc: "Fichas de destrucción vs jefe legendario." },
                ].map((mod) => {
                  const Icon = mod.icon;
                  return (
                    <label
                      key={mod.title}
                      className="flex items-start gap-3 cursor-pointer select-none min-h-[var(--touch-min)] p-3 rounded-xl border border-zinc-850 bg-zinc-950/40"
                    >
                      <input
                        type="checkbox"
                        checked={mod.checked}
                        onChange={(e) => mod.onChange(e.target.checked)}
                        className="mt-1 accent-orange-500"
                      />
                      <div>
                        <span className="font-display text-xs font-bold text-zinc-200 flex items-center gap-1.5 uppercase">
                          <Icon className="w-3.5 h-3.5 text-orange-500" />
                          {mod.title}
                        </span>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{mod.desc}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="bg-zinc-950/60 border border-zinc-850 rounded-xl p-4 text-sm text-zinc-300 space-y-2">
                  <p><strong className="text-orange-400">Escuela:</strong> {selectedSchool.name}</p>
                  <p><strong className="text-orange-400">Dificultad:</strong> {difficulty}</p>
                  <p><strong className="text-orange-400">Módulos:</strong>{" "}
                    {[useDicePoker && "Póker", useMutagens && "Mutágenos", useSkellige && "Skellige", useLegendaryHunt && "Cacería"].filter(Boolean).join(", ") || "Ninguno"}
                  </p>
                </div>
                {!isMobile && (
                  <div className="flex justify-center">
                    <SpecialSchoolCardComponent school={selectedSchool} />
                  </div>
                )}
                <button
                  type="button"
                  onClick={onStart}
                  className="w-full btn btn--primary font-display uppercase tracking-wider flex items-center justify-center gap-2 min-h-[var(--touch-min)]"
                  id="start-game-btn"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Iniciar Misión en Solitario
                </button>
              </div>
            )}

            <div className="setup-wizard__nav flex gap-3 mt-6 pt-4 border-t border-zinc-850">
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                disabled={!canPrev}
                className="flex-1 py-3 btn btn--secondary flex items-center justify-center gap-1 min-h-[var(--touch-min)] disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" /> Anterior
              </button>
              {canNext ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s + 1)}
                  className="flex-1 py-3 btn btn--primary flex items-center justify-center gap-1 min-h-[var(--touch-min)]"
                >
                  Siguiente <ChevronRight className="w-4 h-4" />
                </button>
              ) : null}
            </div>
          </div>

          {isMobile && step === 3 && (
            <div className="mt-4 flex justify-center">
              <SpecialSchoolCardComponent school={selectedSchool} />
            </div>
          )}

          <div className="mt-6">
            <PlayerAssistantLinks compact />
          </div>
        </div>

        {!isMobile && (
          <div className="w-full lg:w-[340px] shrink-0 flex flex-col items-center bg-zinc-950/60 border border-zinc-850 p-6 rounded-2xl gap-4">
            <span className="text-[10px] uppercase tracking-widest text-orange-400 font-mono font-black">
              Carta de Habilidad Especial
            </span>
            <SpecialSchoolCardComponent school={selectedSchool} />
          </div>
        )}
      </div>
    </main>
  );
}
