import { useEffect } from "react";
import { WitcherIcon, type WitcherIconName } from "./WitcherIcon";
import { useIsMobile } from "../hooks/useMediaQuery";

const NAV_ITEMS: { id: string; href: string; label: string; icon: WitcherIconName; active?: boolean }[] = [
  { id: "home", href: "../index.html", label: "Inicio", icon: "home" },
  { id: "exploracion", href: "../exploracion.html", label: "Explorar", icon: "map" },
  { id: "eventos", href: "../eventos.html", label: "Eventos", icon: "scroll" },
  { id: "automa", href: "./", label: "Automa", icon: "automa", active: true },
];

export default function BottomNav() {
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isMobile) {
      document.body.classList.remove("has-bottom-nav");
      return;
    }
    document.body.classList.add("has-bottom-nav");
    return () => document.body.classList.remove("has-bottom-nav");
  }, [isMobile]);

  if (!isMobile) return null;

  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      {NAV_ITEMS.map((item) => (
        <a
          key={item.id}
          href={item.href}
          className={`bottom-nav__item ${item.active ? "bottom-nav__item--active" : ""}`}
          aria-current={item.active ? "page" : undefined}
        >
          <span className="bottom-nav__icon">
            <WitcherIcon name={item.icon} size={22} />
          </span>
          <span className="bottom-nav__label">{item.label}</span>
        </a>
      ))}
    </nav>
  );
}
