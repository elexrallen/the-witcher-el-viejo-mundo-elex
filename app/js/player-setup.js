import { getDrawerLabel, loadPartidaSession, savePartidaSession } from "./partida.js";

export function initPlayerSetup({ playerCountEl, activePlayerEl, drawerHintEl, onChange }) {
  let session = loadPartidaSession();

  function render() {
    playerCountEl.value = String(session.playerCount);
    activePlayerEl.innerHTML = "";

    for (let player = 1; player <= session.playerCount; player += 1) {
      const option = document.createElement("option");
      option.value = String(player);
      option.textContent = session.playerCount <= 1 ? "Tú" : `Jugador ${player}`;
      activePlayerEl.append(option);
    }

    activePlayerEl.value = String(session.activePlayer);

    if (drawerHintEl) {
      const drawer = getDrawerLabel(session.activePlayer, session.playerCount);
      drawerHintEl.textContent =
        session.playerCount <= 1
          ? "En solitario tú robas y lees las cartas."
          : `${drawer} roba y lee las cartas del mazo.`;
    }
  }

  playerCountEl.addEventListener("change", () => {
    session.playerCount = Number.parseInt(playerCountEl.value, 10);
    if (session.activePlayer > session.playerCount) {
      session.activePlayer = 1;
    }
    session = savePartidaSession(session);
    render();
    onChange?.(session);
  });

  activePlayerEl.addEventListener("change", () => {
    session.activePlayer = Number.parseInt(activePlayerEl.value, 10);
    session = savePartidaSession(session);
    render();
    onChange?.(session);
  });

  render();

  return {
    refresh() {
      session = loadPartidaSession();
      render();
      return session;
    },
  };
}
