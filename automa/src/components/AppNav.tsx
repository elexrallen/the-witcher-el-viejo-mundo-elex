const APP_LINKS = [
  { href: "../index.html", label: "Partida", id: "nav-partida" },
  { href: "../exploracion.html", label: "Exploración", id: "nav-exploracion" },
  { href: "../eventos.html", label: "Eventos", id: "nav-eventos" },
  { href: "./", label: "Automa", id: "nav-automa", active: true },
] as const;

export default function AppNav() {
  return (
    <nav
      className="flex flex-wrap items-center gap-1.5 sm:gap-2"
      aria-label="Modos de juego"
      id="app-mode-nav"
    >
      {APP_LINKS.map((link) => (
        <a
          key={link.id}
          href={link.href}
          id={link.id}
          aria-current={"active" in link && link.active ? "page" : undefined}
          className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider border transition-colors ${
            "active" in link && link.active
              ? "bg-orange-950/40 text-orange-400 border-orange-500/50"
              : "bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-600"
          }`}
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}
