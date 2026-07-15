import { useState } from "react";
import { WitcherIcon, SchoolIcon, type WitcherIconName } from "./WitcherIcon";
import { WitcherSchoolId, WitcherSchool } from "../types";
import { WITCHER_SCHOOLS } from "../data/schools";
import SpecialSchoolCardComponent from "./SpecialSchoolCardComponent";
import SchoolCardSetupPreview from "./SchoolCardSetupPreview";
import PlayerAssistantLinks from "./PlayerAssistantLinks";
import { useIsMobile } from "../hooks/useMediaQuery";

type Difficulty = "easy" | "intermediate" | "difficult";

type SetupWizardProps = {
  playerCount: number;
  maxPlayerCount: number;
  setupSchoolIds: WitcherSchoolId[];
  onPlayerCountChange: (count: number) => void;
  onSchoolChange: (index: number, id: WitcherSchoolId) => void;
  difficulty: Difficulty;
  onDifficultyChange: (d: Difficulty) => void;
  useDicePoker: boolean;
  onDicePokerChange: (v: boolean) => void;
  useBombs: boolean;
  onBombsChange: (v: boolean) => void;
  useMutagens: boolean;
  onMutagensChange: (v: boolean) => void;
  useSkellige: boolean;
  onSkelligeChange: (v: boolean) => void;
  useLegendaryHunt: boolean;
  onLegendaryHuntChange: (v: boolean) => void;
  onStart: () => void;
  startError?: string | null;
};

const STEPS = ["Automas", "Dificultad", "Módulos", "Resumen"];

import { getCatalogStats } from "../data/cards";
import {
  getManualDeckTotals,
  TROPHY_RESERVE_COUNT,
} from "../utils/deckBuilder";

function DeckTable({
  useLegendaryHunt = false,
  difficulty = "intermediate",
  playerCount = 1,
}: {
  useLegendaryHunt?: boolean;
  difficulty?: Difficulty;
  playerCount?: number;
}) {
  const {
    actionCount,
    challengeCount,
    genericActionCount,
    genericChallengeCount,
    schoolActionCount,
    schoolChallengeCount,
  } = getCatalogStats();

  const lhInDeck =
    difficulty === "easy" ? 1 : difficulty === "difficult" ? 3 : 2;
  const manual = getManualDeckTotals(difficulty);

  return (
    <div className="setup-deck-table grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
      <div className="bg-zinc-900/40 p-3 rounded-lg border border-zinc-850">
        <span className="text-zinc-200 font-bold block mb-2">Mazo de ACCIÓN (compartido)</span>
        <ul className="space-y-0.5 text-zinc-400">
          <li>Total catalogadas: <strong className="text-zinc-200">{actionCount}</strong></li>
          <li>Genéricas: {genericActionCount} · Escuela: {schoolActionCount}</li>
          <li>
            Partida ({difficulty}):{" "}
            <strong className="text-zinc-200">{manual.actionTotal}</strong> cartas
            {useLegendaryHunt && (
              <span className="text-red-400"> (+{lhInDeck} LH en niv. III)</span>
            )}
          </li>
          <li className="text-[10px]">
            Apilado: niv. III abajo → II → I arriba (roba desde I)
          </li>
        </ul>
      </div>
      <div className="bg-zinc-900/40 p-3 rounded-lg border border-zinc-850">
        <span className="text-zinc-200 font-bold block mb-2">Mazo de DESAFÍO (por Automa)</span>
        <ul className="space-y-0.5 text-zinc-400">
          <li>Total catalogadas: <strong className="text-zinc-200">{challengeCount}</strong></li>
          <li>Genéricas: {genericChallengeCount} · Escuela: {schoolChallengeCount}</li>
          <li>
            Partida ({difficulty}):{" "}
            <strong className="text-zinc-200">{manual.challengeTotal}</strong> en mazo ·{" "}
            <strong className="text-zinc-200">{TROPHY_RESERVE_COUNT}</strong> reserva trofeos
            {playerCount > 1 && (
              <span className="text-orange-400"> × {playerCount} Automas</span>
            )}
          </li>
        </ul>
        <p className="text-[10px] text-orange-400/80 mt-2">
          Cada Automa necesita su propio mazo Desafío sin cartas duplicadas entre ellos.
        </p>
      </div>
    </div>
  );
}

export default function SetupWizard(props: SetupWizardProps) {
  const isMobile = useIsMobile();
  const [step, setStep] = useState(0);
  const [showBonusTip, setShowBonusTip] = useState(false);
  const [configuringAutoma, setConfiguringAutoma] = useState(0);

  const {
    playerCount,
    maxPlayerCount,
    setupSchoolIds,
    onPlayerCountChange,
    onSchoolChange,
    difficulty,
    onDifficultyChange,
    useDicePoker,
    onDicePokerChange,
    useBombs,
    onBombsChange,
    useMutagens,
    onMutagensChange,
    useSkellige,
    onSkelligeChange,
    useLegendaryHunt,
    onLegendaryHuntChange,
    onStart,
    startError,
  } = props;

  const previewSchoolId = setupSchoolIds[configuringAutoma] ?? setupSchoolIds[0] ?? "wolf";
  const previewSchool: WitcherSchool =
    WITCHER_SCHOOLS.find((school) => school.id === previewSchoolId) ?? WITCHER_SCHOOLS[0];

  const bonusLabel = (id: WitcherSchoolId) => {
    if (id === "wolf") return "+1 Daño";
    if (id === "cat") return "+1 Escudo";
    if (id === "bear") return "+2 Escudos";
    return "+1 Daño / +1 Escudo";
  };

  const modules = [
    { checked: useDicePoker, onChange: onDicePokerChange, icon: "dice" as const, title: "Póker de Dados", desc: "Rerolls con cartas del mazo Desafío." },
    { checked: useBombs, onChange: onBombsChange, icon: "bomb" as const, title: "Bombas", desc: "Bonos de bomba en cartas de Acción y uso en combate (máx. 4)." },
    { checked: useMutagens, onChange: onMutagensChange, icon: "magic" as const, title: "Mutágenos y Debilidad", desc: "Mutaciones y debilitar monstruos con rastros." },
    { checked: useSkellige, onChange: onSkelligeChange, icon: "sail" as const, title: "Skellige", desc: "Islas, barcos y pista de Dagon." },
    { checked: useLegendaryHunt, onChange: onLegendaryHuntChange, icon: "legendary" as const, title: "Cacería Legendaria", desc: "Fichas de destrucción vs jefe legendario." },
  ];

  return (
    <main className="setup-wizard flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6" id="setup-view">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="flex-1 w-full">
          <div
            className={`panel automa-panel-accent border-2 border-zinc-800 rounded-2xl p-5 sm:p-8 shadow-2xl relative setup-wizard__panel ${
              isMobile ? "setup-wizard__panel--mobile" : ""
            } ${step === 3 && !isMobile ? "overflow-visible" : "overflow-hidden"}`}
          >
            <div className="setup-wizard__head">
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
            </div>

            <div className="setup-wizard__body">
            {step === 0 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-500 font-mono mb-3 font-bold">
                    ¿Cuántos Automas en mesa?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4].map((count) => {
                      const disabled = count > maxPlayerCount;
                      const isSelected = playerCount === count;
                      return (
                        <button
                          key={count}
                          type="button"
                          disabled={disabled}
                          onClick={() => onPlayerCountChange(count)}
                          className={`px-4 py-3 min-h-[var(--touch-min)] rounded-xl border-2 font-display font-bold text-sm uppercase transition-all ${
                            isSelected
                              ? "bg-orange-950/30 border-orange-500 text-orange-300"
                              : disabled
                                ? "bg-zinc-950 border-zinc-900 text-zinc-600 cursor-not-allowed"
                                : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 cursor-pointer"
                          }`}
                        >
                          {count} Automa{count > 1 ? "s" : ""}
                        </button>
                      );
                    })}
                  </div>
                  {maxPlayerCount < 4 && (
                    <p className="text-[10px] text-zinc-500 mt-2">
                      Máximo {maxPlayerCount} con el catálogo actual y la dificultad elegida (cada uno necesita mazo Desafío propio).
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-500 font-mono mb-3 font-bold">
                    Escuela de cada Automa
                  </label>
                  {playerCount > 1 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {setupSchoolIds.slice(0, playerCount).map((schoolId, index) => {
                        const school = WITCHER_SCHOOLS.find((item) => item.id === schoolId);
                        return (
                          <button
                            key={`tab-${index}`}
                            type="button"
                            onClick={() => setConfiguringAutoma(index)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-bold uppercase ${
                              configuringAutoma === index
                                ? "border-orange-500 text-orange-300 bg-orange-950/30"
                                : "border-zinc-800 text-zinc-500"
                            }`}
                          >
                            <SchoolIcon school={schoolId} size={16} />
                            Automa {index + 1}
                            {school && <span className="hidden sm:inline text-zinc-400">({school.name})</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {WITCHER_SCHOOLS.map((school) => {
                      const activeSchoolId = setupSchoolIds[configuringAutoma] ?? setupSchoolIds[0];
                      const isSelected = activeSchoolId === school.id;
                      return (
                        <button
                          key={school.id}
                          type="button"
                          onClick={() => onSchoolChange(configuringAutoma, school.id)}
                          className={`p-3 sm:p-4 rounded-xl border-2 text-left flex flex-col justify-between min-h-[5.5rem] transition-all cursor-pointer ${
                            isSelected
                              ? "bg-gradient-to-br from-orange-600/30 to-amber-500/20 border-orange-500 text-white"
                              : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                          }`}
                          id={`setup-school-${configuringAutoma}-${school.id}`}
                        >
                          <div className="flex items-center justify-between w-full gap-1">
                            <span className="font-display text-xs sm:text-sm font-bold">{school.name}</span>
                            <SchoolIcon school={school.id} size={20} />
                          </div>
                          <span className="text-[10px] font-mono mt-2 text-orange-400 font-black uppercase">
                            {bonusLabel(school.id)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button type="button" onClick={() => setShowBonusTip(!showBonusTip)} className="text-xs text-orange-400 underline cursor-pointer">
                  {showBonusTip ? "Ocultar" : "¿Qué significan los bonos de escuela?"}
                </button>
                {showBonusTip && (
                  <p className="text-xs text-zinc-400 leading-relaxed bg-zinc-950/60 border border-zinc-850 rounded-xl p-3">
                    En combate, si la carta muestra el símbolo de escuela, el Automa recibe el bono pasivo de su fortaleza. Puedes simular varios brujos: un mazo Desafío por Automa y un mazo Acción compartido.
                  </p>
                )}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <label className="block text-xs uppercase tracking-wider text-zinc-500 font-mono font-bold">Nivel de Dificultad</label>
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
                <DeckTable
                  useLegendaryHunt={useLegendaryHunt}
                  difficulty={difficulty}
                  playerCount={playerCount}
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <label className="block text-xs uppercase tracking-wider text-zinc-500 font-mono font-bold mb-2">Módulos y expansiones</label>
                {modules.map((mod) => (
                  <label key={mod.title} className="flex items-start gap-3 cursor-pointer select-none min-h-[var(--touch-min)] p-3 rounded-xl border border-zinc-850 bg-zinc-950/40">
                    <input type="checkbox" checked={mod.checked} onChange={(e) => mod.onChange(e.target.checked)} className="mt-1 accent-orange-500" />
                    <div>
                      <span className="font-display text-xs font-bold text-zinc-200 flex items-center gap-1.5 uppercase">
                        <WitcherIcon name={mod.icon} size={16} className="text-orange-500" />
                        {mod.title}
                      </span>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{mod.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="bg-zinc-950/60 border border-zinc-850 rounded-xl p-4 text-sm text-zinc-300 space-y-2">
                  <p>
                    <strong className="text-orange-400">Automas:</strong>{" "}
                    {setupSchoolIds.slice(0, playerCount).map((schoolId, index) => {
                      const school = WITCHER_SCHOOLS.find((item) => item.id === schoolId);
                      return `${index + 1}. ${school?.name ?? schoolId}`;
                    }).join(" · ")}
                  </p>
                  <p><strong className="text-orange-400">Dificultad:</strong> {difficulty}</p>
                  <p><strong className="text-orange-400">Módulos:</strong>{" "}
                    {[useDicePoker && "Póker", useBombs && "Bombas", useMutagens && "Mutágenos", useSkellige && "Skellige", useLegendaryHunt && "Cacería"].filter(Boolean).join(", ") || "Ninguno"}
                  </p>
                  {playerCount > 1 && (
                    <p className="text-xs text-zinc-500">
                      Turnos alternados: cada Automa juega su fase completa antes de pasar al siguiente. Mazo Acción compartido.
                    </p>
                  )}
                </div>
                <SchoolCardSetupPreview school={previewSchool} />
                {startError && (
                  <p className="text-sm text-red-400 bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2" role="alert">
                    {startError}
                  </p>
                )}
                <button type="button" onClick={onStart} className="w-full btn btn--primary font-display uppercase tracking-wider flex items-center justify-center gap-2 min-h-[var(--touch-min)]" id="start-game-btn">
                  <WitcherIcon name="play" size={22} />
                  Iniciar Misión en Solitario
                </button>
              </div>
            )}
            </div>

            <div className="setup-wizard__nav flex gap-3 mt-6 pt-4 border-t border-zinc-850">
              <button type="button" onClick={() => setStep((s) => s - 1)} disabled={step === 0} className="flex-1 py-3 btn btn--secondary flex items-center justify-center gap-1 min-h-[var(--touch-min)] disabled:opacity-40">
                <WitcherIcon name="chevron-left" size={16} /> Anterior
              </button>
              {step < STEPS.length - 1 && (
                <button type="button" onClick={() => setStep((s) => s + 1)} className="flex-1 py-3 btn btn--primary flex items-center justify-center gap-1 min-h-[var(--touch-min)]">
                  Siguiente <WitcherIcon name="chevron-right" size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="mt-6"><PlayerAssistantLinks compact /></div>
        </div>

        {isMobile && step !== 3 && (
          <div className="w-full lg:w-[340px] shrink-0 flex flex-col items-center bg-zinc-950/60 border border-zinc-850 p-4 sm:p-6 rounded-2xl gap-4">
            <SchoolCardSetupPreview school={previewSchool} />
          </div>
        )}

        {!isMobile && step !== 3 && (
          <div className="w-full lg:w-[340px] shrink-0 flex flex-col items-center bg-zinc-950/60 border border-zinc-850 p-6 rounded-2xl gap-4">
            <span className="text-[10px] uppercase tracking-widest text-orange-400 font-mono font-black">Carta de Habilidad Especial</span>
            <SpecialSchoolCardComponent school={previewSchool} />
          </div>
        )}
      </div>
    </main>
  );
}
