import { ArrowRight, Compass, Map, ScrollText, Swords } from "lucide-react";

const TOOLS = [
  {
    href: "../index.html",
    title: "Hub de partida",
    description: "Fases del turno, jugador activo y acceso a misiones.",
    icon: Swords,
    accent: "text-amber-400",
    border: "hover:border-amber-500/40",
    id: "tool-partida",
  },
  {
    href: "../exploracion.html",
    title: "Exploración",
    description: "Mazos barajados de Ciudad y Tierras Salvajes con revelado progresivo.",
    icon: Map,
    accent: "text-sky-400",
    border: "hover:border-sky-500/40",
    id: "tool-exploracion",
  },
  {
    href: "../eventos.html",
    title: "Eventos",
    description: "Cartas numeradas de campaña, misiones y expansiones.",
    icon: ScrollText,
    accent: "text-emerald-400",
    border: "hover:border-emerald-500/40",
    id: "tool-eventos",
  },
] as const;

type PlayerAssistantLinksProps = {
  compact?: boolean;
};

export default function PlayerAssistantLinks({ compact = false }: PlayerAssistantLinksProps) {
  return (
    <section
      className={`bg-[#111111] border border-zinc-800 rounded-2xl shadow-xl ${
        compact ? "p-4 sm:p-5" : "p-5 sm:p-6"
      }`}
      id="player-assistant-links"
    >
      <div className={`flex items-start gap-3 ${compact ? "mb-3" : "mb-5"}`}>
        <Compass className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-display text-sm font-black text-white uppercase tracking-wider">
            Tu bruJo — asistente de partida
          </h3>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            El Automa gestiona al oponente virtual. Para tus acciones de exploración, eventos y
            fases de turno, usa las herramientas de la aplicación principal.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <a
              key={tool.id}
              href={tool.href}
              id={tool.id}
              className={`group flex flex-col gap-2 p-4 rounded-xl border border-zinc-850 bg-zinc-950/50 transition-all ${tool.border}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`font-display text-xs font-black uppercase tracking-wider ${tool.accent}`}>
                  {tool.title}
                </span>
                <Icon className={`w-4 h-4 shrink-0 ${tool.accent}`} />
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed flex-1">{tool.description}</p>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500 group-hover:text-zinc-300 transition-colors">
                Abrir
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
