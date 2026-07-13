import { WitcherIcon } from "./WitcherIcon";
import { AutomaState, WitcherSchool } from "../types";
import SpecialSchoolCardComponent from "./SpecialSchoolCardComponent";

type ExpansionsPanelProps = {
  automa: AutomaState;
  activeSchool: WitcherSchool;
  useMutagens: boolean;
  useSkellige: boolean;
  useLegendaryHunt: boolean;
  onAutomaChange: (updater: (prev: AutomaState) => AutomaState) => void;
};

export default function ExpansionsPanel({
  automa,
  activeSchool,
  useMutagens,
  useSkellige,
  useLegendaryHunt,
  onAutomaChange,
}: ExpansionsPanelProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="expansions-tab-content">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <h4 className="font-display text-xs font-black text-orange-500 uppercase border-b border-zinc-800/80 pb-2">
          Mutágenos y Debilidad
        </h4>
        {useMutagens ? (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: "red", label: "Rojo", color: "border-red-800 bg-red-950/25 text-red-400" },
                { key: "blue", label: "Azul", color: "border-blue-800 bg-blue-950/25 text-blue-400" },
                { key: "green", label: "Verde", color: "border-emerald-800 bg-emerald-950/25 text-emerald-400" },
              ].map((mut) => {
                const hasMut = automa.mutagens.includes(mut.key);
                return (
                  <button
                    key={mut.key}
                    type="button"
                    onClick={() =>
                      onAutomaChange((prev) => ({
                        ...prev,
                        mutagens: prev.mutagens.includes(mut.key)
                          ? prev.mutagens.filter((m) => m !== mut.key)
                          : [...prev.mutagens, mut.key],
                      }))
                    }
                    className={`p-2.5 min-h-[var(--touch-min)] rounded-xl border text-center font-display text-[10px] font-black uppercase ${
                      hasMut ? `${mut.color} border-2` : "bg-zinc-950 border-zinc-850 text-zinc-500"
                    }`}
                  >
                    {mut.label}
                  </button>
                );
              })}
            </div>
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850/60 flex justify-between items-center">
              <span className="text-xs text-zinc-300 font-bold">Debilidad enemigo</span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => onAutomaChange((p) => ({ ...p, weaknesses: Math.max(0, p.weaknesses - 1) }))} className="automa-touch-btn px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs">-</button>
                <span className="font-mono font-black text-orange-400">{automa.weaknesses}/3</span>
                <button type="button" onClick={() => onAutomaChange((p) => ({ ...p, weaknesses: Math.min(3, p.weaknesses + 1) }))} className="automa-touch-btn px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs">+</button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center py-6 text-zinc-500 text-xs italic">Actívalo en preparación.</p>
        )}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <h4 className="font-display text-xs font-black text-orange-500 uppercase border-b border-zinc-800/80 pb-2">
          Skellige y Cacería
        </h4>
        {useSkellige && (
          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850/60 flex justify-between items-center">
            <span className="text-xs text-zinc-300 font-bold flex items-center gap-1">
              <WitcherIcon name="anchor" size={16} className="text-sky-400" /> Dagon
            </span>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => onAutomaChange((p) => ({ ...p, dagonTrack: Math.max(0, p.dagonTrack - 1) }))} className="automa-touch-btn px-2 py-1 text-xs bg-zinc-900 border border-zinc-800 rounded-lg">-</button>
              <span className="font-mono font-black text-sky-400">{automa.dagonTrack}/6</span>
              <button type="button" onClick={() => onAutomaChange((p) => ({ ...p, dagonTrack: Math.min(6, p.dagonTrack + 1) }))} className="automa-touch-btn px-2 py-1 text-xs bg-zinc-900 border border-zinc-800 rounded-lg">+</button>
            </div>
          </div>
        )}
        {useLegendaryHunt && (
          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850/60 flex justify-between items-center">
            <span className="text-xs text-zinc-300 font-bold flex items-center gap-1">
              <WitcherIcon name="legendary" size={16} className="text-red-500" /> Destrucción
            </span>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => onAutomaChange((p) => ({ ...p, destructionTokens: Math.max(0, p.destructionTokens - 1) }))} className="automa-touch-btn px-2 py-1 text-xs bg-zinc-900 border border-zinc-800 rounded-lg">-</button>
              <span className="font-mono font-black text-red-400">{automa.destructionTokens}</span>
              <button type="button" onClick={() => onAutomaChange((p) => ({ ...p, destructionTokens: p.destructionTokens + 1 }))} className="automa-touch-btn px-2 py-1 text-xs bg-zinc-900 border border-zinc-800 rounded-lg">+</button>
            </div>
          </div>
        )}
        {!useSkellige && !useLegendaryHunt && (
          <p className="text-center py-6 text-zinc-500 text-xs italic">Actívalos en preparación.</p>
        )}
      </div>

      <div className="md:col-span-2 bg-zinc-950/40 border border-zinc-850 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
        <p className="text-xs text-zinc-400 flex-1">
          Carta de habilidad especial de <strong>{activeSchool.name}</strong>.
        </p>
        <SpecialSchoolCardComponent school={activeSchool} />
      </div>
    </div>
  );
}
