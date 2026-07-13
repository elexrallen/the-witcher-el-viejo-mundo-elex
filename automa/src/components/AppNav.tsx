const APP_LINKS = [
  { href: "../index.html", label: "Partida", id: "nav-partida" },
  { href: "../exploracion.html", label: "Exploración", id: "nav-exploracion" },
  { href: "../eventos.html", label: "Eventos", id: "nav-eventos" },
  { href: "./", label: "Automa", id: "nav-automa", active: true },
] as const;

export default function AppNav() {
  return (
    <nav className="mode-nav" aria-label="Modos de juego" id="app-mode-nav">
      {APP_LINKS.map((link) => (
        <a
          key={link.id}
          href={link.href}
          id={link.id}
          aria-current={"active" in link && link.active ? "page" : undefined}
          className={`mode-nav__link${
            "active" in link && link.active ? " mode-nav__link--active" : ""
          }`}
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}
