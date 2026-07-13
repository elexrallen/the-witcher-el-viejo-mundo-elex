import { useEffect } from "react";
import { Bot, Home, Map, ScrollText } from "lucide-react";
import { useIsMobile } from "../hooks/useMediaQuery";

const NAV_ITEMS = [
  { id: "home", href: "../index.html", label: "Inicio", icon: Home },
  { id: "exploracion", href: "../exploracion.html", label: "Explorar", icon: Map },
  { id: "eventos", href: "../eventos.html", label: "Eventos", icon: ScrollText },
  { id: "automa", href: "./", label: "Automa", icon: Bot, active: true },
] as const;

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
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <a
            key={item.id}
            href={item.href}
            className={`bottom-nav__item ${"active" in item && item.active ? "bottom-nav__item--active" : ""}`}
            aria-current={"active" in item && item.active ? "page" : undefined}
          >
            <span className="bottom-nav__icon">
              <Icon size={22} aria-hidden />
            </span>
            <span className="bottom-nav__label">{item.label}</span>
          </a>
        );
      })}
    </nav>
  );
}
