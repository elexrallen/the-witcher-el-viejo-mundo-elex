import { SchoolIcon } from "./WitcherIcon";
import type { AutomaPlayerState } from "../types";

type AutomaSelectorProps = {
  players: AutomaPlayerState[];
  activeIndex: number;
  onSelect: (index: number) => void;
  disabled?: boolean;
};

export default function AutomaSelector({
  players,
  activeIndex,
  onSelect,
  disabled = false,
}: AutomaSelectorProps) {
  if (players.length <= 1) {
    return null;
  }

  return (
    <div
      className="automa-selector flex flex-wrap gap-2 p-3 rounded-xl border border-zinc-850 bg-zinc-950/50"
      role="tablist"
      aria-label="Seleccionar Automa activo"
    >
      <span className="w-full text-[10px] uppercase tracking-wider text-zinc-500 font-mono font-bold">
        Automa activo ({players.length} en mesa)
      </span>
      {players.map((player, index) => {
        const isActive = index === activeIndex;
        const shortLabel = player.label.replace(/^Automa \d+ \(/, "").replace(/\)$/, "");

        return (
          <button
            key={player.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={disabled && !isActive}
            onClick={() => onSelect(index)}
            className={`automa-selector__chip flex items-center gap-2 px-3 py-2 min-h-[var(--touch-min)] rounded-lg border text-xs font-display font-bold uppercase transition-all ${
              isActive
                ? "bg-orange-950/40 border-orange-500 text-orange-300"
                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
            } ${disabled && !isActive ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <SchoolIcon school={player.schoolId} size={18} />
            <span className="hidden sm:inline">{player.label}</span>
            <span className="sm:hidden">{shortLabel}</span>
            {isActive && (
              <span className="text-[9px] font-mono text-orange-400/80 normal-case">
                turno
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
