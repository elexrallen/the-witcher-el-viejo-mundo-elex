import { WitcherIcon } from "./WitcherIcon";

const TOOLS = [
  {
    href: "../exploracion.html",
    title: "Exploración",
    description: "Mazos barajados de Ciudad y Tierras Salvajes con revelado progresivo.",
    icon: "map" as const,
    id: "tool-exploracion",
  },
  {
    href: "../eventos.html",
    title: "Eventos",
    description: "Cartas numeradas de campaña, misiones y expansiones.",
    icon: "scroll" as const,
    id: "tool-eventos",
  },
] as const;

type PlayerAssistantLinksProps = {
  compact?: boolean;
};

export default function PlayerAssistantLinks({ compact = false }: PlayerAssistantLinksProps) {
  return (
    <section className="panel automa-assistant" id="player-assistant-links">
      <h3 style={{ marginTop: 0 }}>Herramientas de mesa</h3>
      <p className="muted" style={{ marginTop: "-0.35rem", marginBottom: compact ? "0.75rem" : "1rem" }}>
        El Automa gestiona al oponente virtual. Para exploración y eventos usa estas
        herramientas mientras juegas en la mesa.
      </p>

      <div className="automa-assistant__grid">
        {TOOLS.map((tool) => (
          <a key={tool.id} href={tool.href} id={tool.id} className="automa-assistant__card">
            <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
              <span className="automa-assistant__title">{tool.title}</span>
              <WitcherIcon name={tool.icon} size={18} className="text-[var(--gold-bright)]" />
            </div>
            <p className="automa-assistant__desc">{tool.description}</p>
            <span className="automa-assistant__cta">
              Abrir <WitcherIcon name="arrow-right" size={14} className="inline align-middle ml-0.5" />
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
