import AppNav from "./AppNav";

type AppHeaderProps = {
  setupMode: boolean;
  schoolName?: string;
  difficulty?: string;
  turnCount?: number;
  onReconfig?: () => void;
};

export default function AppHeader({
  setupMode,
  schoolName,
  difficulty,
  turnCount,
  onReconfig,
}: AppHeaderProps) {
  return (
    <header className="header automa-header" id="game-header">
      <div className="header__brand">
        <span className="header__sigil" aria-hidden="true">
          ⚔
        </span>
        <div>
          <h1>El Viejo Mundo</h1>
          <p>
            {setupMode
              ? "Automa — modo solitario V1.4"
              : "Automa — turno del oponente virtual"}
          </p>
        </div>
      </div>

      <div className="header__actions header__actions--stack">
        {!setupMode && schoolName && (
          <div className="automa-status" id="automa-status-bar">
            <div className="automa-status__item">
              <span className="automa-status__label">Escuela</span>
              <span className="automa-status__value">{schoolName}</span>
            </div>
            <div className="automa-status__item">
              <span className="automa-status__label">Dificultad</span>
              <span className="automa-status__value automa-status__value--gold">
                {difficulty}
              </span>
            </div>
            <div className="automa-status__item">
              <span className="automa-status__label">Turno</span>
              <span className="automa-status__value">#{turnCount}</span>
            </div>
            <button
              type="button"
              onClick={onReconfig}
              className="btn btn--secondary"
              style={{ padding: "0.45rem 0.85rem", fontSize: "0.72rem" }}
              id="reconfig-btn"
            >
              Ajustes
            </button>
          </div>
        )}
        <AppNav />
      </div>
    </header>
  );
}
