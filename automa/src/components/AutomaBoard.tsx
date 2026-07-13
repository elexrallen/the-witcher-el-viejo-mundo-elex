import { Plus, Minus, Droplet, Sparkles } from "lucide-react";
import { AutomaState } from "../types";
import { DEFAULT_CITIES } from "../utils/cities";

type AutomaBoardProps = {
  automa: AutomaState;
  lockedAttributes: Record<string, boolean>;
  onUpdateAttribute: (attr: "attack" | "defense" | "alchemy" | "special", delta: number) => void;
  onAutoImprove: (type: "highest" | "lowest") => void;
  onAddTrophy: () => void;
  onAutomaChange: (updater: (prev: AutomaState) => AutomaState) => void;
  onTrophyDecrease: () => void;
  collapsible?: boolean;
};

export default function AutomaBoard({
  automa,
  lockedAttributes,
  onUpdateAttribute,
  onAutoImprove,
  onAddTrophy,
  onAutomaChange,
  onTrophyDecrease,
  collapsible = false,
}: AutomaBoardProps) {
  const attrs = [
    { key: "attack" as const, label: "Ataque", color: "bg-red-500" },
    { key: "defense" as const, label: "Defensa", color: "bg-blue-500" },
    { key: "alchemy" as const, label: "Alquimia", color: "bg-emerald-500" },
    { key: "special" as const, label: "Especial", color: "bg-purple-500" },
  ];

  const Section = ({ title, id, children }: { title: string; id: string; children: React.ReactNode }) => {
    if (!collapsible) {
      return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl">{children}</div>
      );
    }
    return (
      <details className="automa-board__section bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl" open={id === "attributes"}>
        <summary className="automa-board__summary p-4 font-display text-xs font-black text-orange-500 uppercase tracking-wider cursor-pointer">
          {title}
        </summary>
        <div className="px-5 pb-5">{children}</div>
      </details>
    );
  };

  return (
    <div className="space-y-4" id="automa-board">
      <Section title="Atributos del Automa" id="attributes">
        <div className="flex items-center justify-between mb-4 border-b border-zinc-800/80 pb-2.5">
          {!collapsible && (
            <h3 className="font-display text-xs font-black text-orange-500 uppercase tracking-wider">Atributos del Automa</h3>
          )}
          <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold ml-auto">MÁX. NIVEL 5</span>
        </div>
        <div className="space-y-4">
          {attrs.map((attr) => {
            const currentVal = automa.attributes[attr.key];
            const isLocked = lockedAttributes[attr.key];
            return (
              <div key={attr.key} className="space-y-1.5" id={`attribute-${attr.key}`}>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-sans font-bold text-zinc-300 flex items-center gap-1.5">
                    {attr.label}
                    {isLocked && (
                      <span className="text-[9px] bg-orange-500 text-neutral-950 font-bold px-1.5 py-0.5 rounded uppercase font-mono">
                        Bloqueado
                      </span>
                    )}
                  </span>
                  <span className="font-mono font-black text-white">{currentVal} / 5</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 flex gap-1 h-2">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <div
                        key={lvl}
                        className={`flex-1 rounded-sm ${
                          lvl <= currentVal ? (isLocked ? "bg-orange-500" : attr.color) : "bg-zinc-900/60"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => onUpdateAttribute(attr.key, -1)}
                      disabled={isLocked && currentVal <= 5}
                      className="automa-touch-btn p-2 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 disabled:opacity-30 rounded-lg text-zinc-400 cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateAttribute(attr.key, 1)}
                      className="automa-touch-btn p-2 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-lg text-zinc-400 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-zinc-850/50">
          <button
            type="button"
            onClick={() => onAutoImprove("lowest")}
            className="py-2 min-h-[var(--touch-min)] bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 rounded-xl text-[10px] font-bold font-display uppercase"
          >
            Subir Menor
          </button>
          <button
            type="button"
            onClick={() => onAutoImprove("highest")}
            className="py-2 min-h-[var(--touch-min)] bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 rounded-xl text-[10px] font-bold font-display uppercase"
          >
            Subir Mayor
          </button>
        </div>
      </Section>

      <Section title="Inventario y Trofeos" id="inventory">
        {!collapsible && (
          <div className="flex items-center justify-between mb-4 border-b border-zinc-800/80 pb-2.5">
            <h3 className="font-display text-xs font-black text-orange-500 uppercase tracking-wider">Inventario y Trofeos</h3>
          </div>
        )}
        <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-850/60 mb-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-500 block font-display font-bold uppercase">Trofeos:</span>
            <span className="text-sm font-black text-orange-400 font-mono">{automa.trophies} / 4</span>
          </div>
          <div className="flex gap-1.5">
            <button type="button" onClick={onTrophyDecrease} className="automa-touch-btn p-2 bg-zinc-900 rounded-lg border border-zinc-800 text-zinc-300">
              <Minus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onAddTrophy}
              disabled={automa.trophies >= 4}
              className="automa-touch-btn p-2 bg-orange-600 disabled:bg-zinc-800 rounded-lg border border-orange-500 text-white font-bold flex items-center gap-1 text-xs"
            >
              <Plus className="w-4 h-4" /> Trofeo
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: "potions" as const, label: "Pociones", icon: Droplet, color: "text-emerald-500" },
            { key: "bombs" as const, label: "Bombas", icon: Sparkles, color: "text-purple-500" },
          ].map((item) => {
            const Icon = item.icon;
            const count = automa[item.key];
            return (
              <div key={item.key} className="bg-zinc-950 p-3 rounded-xl border border-zinc-850/60 text-center space-y-2">
                <Icon className={`w-4 h-4 mx-auto ${item.color}`} />
                <span className="text-[10px] text-zinc-500 font-display font-bold uppercase block">{item.label}</span>
                <span className="text-base font-black font-mono text-zinc-200 block">{count}</span>
                <div className="flex justify-center gap-1">
                  <button
                    type="button"
                    onClick={() => onAutomaChange((p) => ({ ...p, [item.key]: Math.max(0, p[item.key] - 1) }))}
                    className="automa-touch-btn px-3 py-1.5 bg-zinc-900 rounded-lg border border-zinc-800 text-xs font-black text-zinc-400"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => onAutomaChange((p) => ({ ...p, [item.key]: Math.min(4, p[item.key] + 1) }))}
                    className="automa-touch-btn px-3 py-1.5 bg-zinc-900 rounded-lg border border-zinc-800 text-xs font-black text-zinc-400"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Localización y Rastros" id="location">
        {!collapsible && (
          <div className="flex items-center justify-between mb-4 border-b border-zinc-800/80 pb-2.5">
            <h3 className="font-display text-xs font-black text-orange-500 uppercase tracking-wider">Localización y Rastros</h3>
          </div>
        )}
        <div className="space-y-2 mb-4">
          <label className="text-[10px] text-zinc-500 block font-display font-bold uppercase">Localización actual:</label>
          <select
            value={automa.location}
            onChange={(e) => onAutomaChange((p) => ({ ...p, location: e.target.value }))}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-300 focus:outline-none focus:border-orange-500 min-h-[var(--touch-min)]"
          >
            {DEFAULT_CITIES.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { key: "red" as const, label: "Rojo", color: "border-red-950 text-red-400 bg-red-950/25" },
            { key: "blue" as const, label: "Azul", color: "border-blue-950 text-blue-400 bg-blue-950/25" },
            { key: "green" as const, label: "Verde", color: "border-emerald-950 text-emerald-400 bg-emerald-950/25" },
            { key: "yellow" as const, label: "Amarillo", color: "border-amber-950 text-amber-500 bg-amber-950/15" },
          ].map((trail) => {
            const count = automa.trails[trail.key];
            return (
              <div key={trail.key} className={`border p-2 rounded-xl text-center space-y-1 ${trail.color}`}>
                <span className="text-[9px] uppercase font-mono font-bold">{trail.label}</span>
                <div className="text-sm font-black font-mono">{count}</div>
                <div className="flex justify-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      onAutomaChange((p) => ({
                        ...p,
                        trails: { ...p.trails, [trail.key]: Math.max(0, count - 1) },
                      }))
                    }
                    className="automa-touch-btn px-2 py-1 bg-zinc-900/60 border border-zinc-800 rounded-md text-[10px] font-black"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onAutomaChange((p) => ({
                        ...p,
                        trails: { ...p.trails, [trail.key]: count + 1 },
                      }))
                    }
                    className="automa-touch-btn px-2 py-1 bg-zinc-900/60 border border-zinc-800 rounded-md text-[10px] font-black"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
