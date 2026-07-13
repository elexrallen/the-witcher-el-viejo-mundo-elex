import { ArrowRight, Map, ScrollText, Swords } from "lucide-react";

const TOOLS = [
  {
    href: "../index.html",
    title: "Hub de partida",
    description: "Fases del turno, jugador activo y acceso a misiones.",
    icon: Swords,
    id: "tool-partida",
  },
  {
    href: "../exploracion.html",
    title: "Exploración",
    description: "Mazos barajados de Ciudad y Tierras Salvajes con revelado progresivo.",
    icon: Map,
    id: "tool-exploracion",
  },
  {
    href: "../eventos.html",
    title: "Eventos",
    description: "Cartas numeradas de campaña, misiones y expansiones.",
    icon: ScrollText,
    id: "tool-eventos",
  },
] as const;

type PlayerAssistantLinksProps = {
  compact?: boolean;
};

export default function PlayerAssistantLinks({ compact = false }: PlayerAssistantLinksProps) {
  return (
    <section className="panel automa-assistant" id="player-assistant-links">
      <h3 style={{ marginTop: 0 }}>Tu bruJo — asistente de partida</h3>
      <p className="muted" style={{ marginTop: "-0.35rem", marginBottom: compact ? "0.75rem" : "1rem" }}>
        El Automa gestiona al oponente virtual. Para tus acciones de exploración, eventos y
        fases de turno, usa las herramientas de la aplicación principal.
      </p>

      <div className="automa-assistant__grid">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <a key={tool.id} href={tool.href} id={tool.id} className="automa-assistant__card">
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
                <span className="automa-assistant__title">{tool.title}</span>
                <Icon aria-hidden style={{ width: "1rem", height: "1rem", color: "var(--gold-bright)" }} />
              </div>
              <p className="automa-assistant__desc">{tool.description}</p>
              <span className="automa-assistant__cta">
                Abrir <ArrowRight style={{ width: "0.85rem", height: "0.85rem", display: "inline" }} />
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
