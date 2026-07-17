import { useState, useEffect } from "react";
import { WitcherIcon } from "./WitcherIcon";
import AppNav from "./AppNav";
import { useIsMobile } from "../hooks/useMediaQuery";

type AppHeaderProps = {
  setupMode: boolean;
  schoolName?: string;
  difficulty?: string;
  turnCount?: number;
  trophies?: number;
  automaCount?: number;
  activeAutomaLabel?: string;
  canUndo?: boolean;
  onUndo?: () => void;
  onReconfig?: () => void;
};

export default function AppHeader({
  setupMode,
  schoolName,
  difficulty,
  turnCount,
  trophies = 0,
  automaCount = 1,
  activeAutomaLabel,
  canUndo = false,
  onUndo,
  onReconfig,
}: AppHeaderProps) {
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const header = document.getElementById("game-header");
    if (!header) return;

    const updateHeight = () => {
      document.documentElement.style.setProperty(
        "--automa-header-h",
        `${Math.ceil(header.getBoundingClientRect().height)}px`
      );
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(header);
    window.addEventListener("resize", updateHeight, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, [setupMode, isMobile, schoolName, turnCount, trophies, automaCount]);

  return (
    <header
      className="header automa-header sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-sm"
      id="game-header"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="header__brand">
        <span className="header__sigil" aria-hidden="true">⚔</span>
        <div>
          <h1>El Viejo Mundo</h1>
          <p className={isMobile && !setupMode ? "header__subtitle--hide-mobile" : ""}>
            {setupMode ? "Automa — modo solitario V1.4" : "Automa — turno del oponente virtual"}
          </p>
        </div>
      </div>

      <div className="header__actions header__actions--stack">
        {!setupMode && schoolName && (
          <div className="automa-status automa-status--compact" id="automa-status-bar">
            {isMobile ? (
              <>
                <span className="automa-status__compact-item">
                  <span className="automa-status__label">Turno</span>
                  <span className="automa-status__value">#{turnCount}</span>
                </span>
                <span className="automa-status__compact-item automa-status__compact-item--gold">
                  <span className="automa-status__label">Trofeos</span>
                  <span className="automa-status__value">{trophies}/4</span>
                </span>
                <span className="automa-status__compact-item automa-status__compact-school">
                  {schoolName}
                  {automaCount > 1 && (
                    <span className="text-zinc-500 font-normal"> · {automaCount}A</span>
                  )}
                </span>
                <div className="automa-header-menu">
                  <button
                    type="button"
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="automa-touch-btn btn btn--secondary p-2"
                    aria-label="Más opciones"
                  >
                    <WitcherIcon name="menu" size={22} />
                  </button>
                  {menuOpen && (
                    <div className="automa-header-menu__dropdown">
                      <p className="text-[10px] text-zinc-500 uppercase mb-1">Dificultad: {difficulty}</p>
                      <button
                        type="button"
                        onClick={() => { onUndo?.(); setMenuOpen(false); }}
                        disabled={!canUndo}
                        className="w-full text-left text-xs py-2 disabled:opacity-40"
                      >
                        Deshacer
                      </button>
                      <button type="button" onClick={() => { onReconfig?.(); setMenuOpen(false); }} className="w-full text-left text-xs text-orange-400 py-2">
                        Reconfigurar partida
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="automa-status__item">
                  <span className="automa-status__label">Escuela</span>
                  <span className="automa-status__value">
                    {schoolName}
                    {automaCount > 1 && activeAutomaLabel && (
                      <span className="block text-[10px] text-zinc-500 font-normal normal-case">
                        {activeAutomaLabel}
                      </span>
                    )}
                  </span>
                </div>
                <div className="automa-status__item">
                  <span className="automa-status__label">Trofeos</span>
                  <span className="automa-status__value automa-status__value--gold">{trophies}/4</span>
                </div>
                <div className="automa-status__item">
                  <span className="automa-status__label">Turno</span>
                  <span className="automa-status__value">#{turnCount}</span>
                </div>
                <button type="button" onClick={onReconfig} className="btn btn--secondary" style={{ padding: "0.45rem 0.85rem", fontSize: "0.72rem" }} id="reconfig-btn">
                  Ajustes
                </button>
              </>
            )}
          </div>
        )}
        {!isMobile && <AppNav />}
        {!setupMode && onUndo && (
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className="btn btn--ghost btn--icon-label undo-btn"
            aria-label="Deshacer"
            title={canUndo ? "Deshacer última acción" : "Nada que deshacer"}
          >
            <WitcherIcon name="undo" size={22} />
            <span className="hide-on-mobile-tip">Deshacer</span>
          </button>
        )}
      </div>
    </header>
  );
}
