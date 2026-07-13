type PhaseStepperProps = {
  currentPhase: 1 | 2 | 3;
};

const PHASES = [
  { id: 1, label: "Fase I", short: "I", desc: "Movimiento y acciones" },
  { id: 2, label: "Fase II", short: "II", desc: "Meditar / Combatir / Explorar" },
  { id: 3, label: "Fase III", short: "III", desc: "Mercado" },
] as const;

export default function PhaseStepper({ currentPhase }: PhaseStepperProps) {
  return (
    <nav className="phase-stepper" aria-label="Fases del turno del Automa">
      {PHASES.map((phase, index) => {
        const isActive = currentPhase === phase.id;
        const isDone = currentPhase > phase.id;
        return (
          <div key={phase.id} className="phase-stepper__item">
            <div
              className={`phase-stepper__dot ${isActive ? "phase-stepper__dot--active" : ""} ${isDone ? "phase-stepper__dot--done" : ""}`}
              aria-current={isActive ? "step" : undefined}
            >
              <span className="phase-stepper__short">{phase.short}</span>
            </div>
            <div className="phase-stepper__text">
              <span className={`phase-stepper__label ${isActive ? "phase-stepper__label--active" : ""}`}>
                {phase.label}
              </span>
              <span className="phase-stepper__desc">{phase.desc}</span>
            </div>
            {index < PHASES.length - 1 && (
              <div className={`phase-stepper__line ${isDone ? "phase-stepper__line--done" : ""}`} aria-hidden />
            )}
          </div>
        );
      })}
    </nav>
  );
}
