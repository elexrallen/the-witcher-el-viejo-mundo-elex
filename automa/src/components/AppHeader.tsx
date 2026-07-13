import { useState } from "react";
import { WitcherIcon } from "./WitcherIcon";
import AppNav from "./AppNav";
import { useIsMobile } from "../hooks/useMediaQuery";

type AppHeaderProps = {
  setupMode: boolean;
  schoolName?: string;
  difficulty?: string;
  turnCount?: number;
  trophies?: number;
  onReconfig?: () => void;
};

export default function AppHeader({
  setupMode,
  schoolName,
  difficulty,
  turnCount,
  trophies = 0,
  onReconfig,
}: AppHeaderProps) {
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header automa-header sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-sm" id="game-header">
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
                </span>
                <div className="automa-header-menu relative">
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
                  <span className="automa-status__value">{schoolName}</span>
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
      </div>
    </header>
  );
}
