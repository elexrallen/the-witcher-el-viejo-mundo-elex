import { initAppChrome } from "./chrome.js";
import { initMobileUX } from "./mobile.js";
import { enhanceIconElements } from "./icons.js";
import {
  canMigrateOrphanedSession,
  createGame,
  deleteGame,
  formatGameDate,
  formatGameSummary,
  getActiveGame,
  listGames,
  loadGame,
  migrateOrphanedSession,
  renameGame,
} from "./saved-games.js";
import { showToast } from "./ui.js";

const els = {
  activeBanner: document.getElementById("active-game-banner"),
  activeName: document.getElementById("active-game-name"),
  migrateBanner: document.getElementById("migrate-banner"),
  btnMigrate: document.getElementById("btn-migrate"),
  savedGamesList: document.getElementById("saved-games-list"),
  savedGamesEmpty: document.getElementById("saved-games-empty"),
  btnNewGame: document.getElementById("btn-new-game"),
  gameDialog: document.getElementById("game-dialog"),
  gameDialogTitle: document.getElementById("game-dialog-title"),
  gameNameInput: document.getElementById("game-name-input"),
  gameDialogForm: document.getElementById("game-dialog-form"),
  btnCancelGameDialog: document.getElementById("btn-cancel-game-dialog"),
};

let dialogMode = "create";
let editingGameId = null;

function init() {
  initAppChrome({ page: "home" });
  initMobileUX();
  enhanceIconElements();
  bindEvents();
  render();
}

function bindEvents() {
  els.btnNewGame?.addEventListener("click", () => openDialog("create"));
  els.btnMigrate?.addEventListener("click", handleMigrate);
  els.btnCancelGameDialog?.addEventListener("click", () => els.gameDialog?.close());
  els.gameDialog?.addEventListener("click", (event) => {
    if (event.target === els.gameDialog) {
      els.gameDialog.close();
    }
  });

  els.gameDialogForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = els.gameNameInput?.value?.trim();
    if (!name) {
      showToast("Escribe un nombre para la partida");
      return;
    }

    if (dialogMode === "create") {
      createGame(name);
      showToast(`Partida «${name}» creada`);
    } else if (dialogMode === "rename" && editingGameId) {
      renameGame(editingGameId, name);
      showToast("Partida renombrada");
    }

    els.gameDialog?.close();
    render();
  });
}

function openDialog(mode, game = null) {
  dialogMode = mode;
  editingGameId = game?.id || null;

  if (els.gameDialogTitle) {
    els.gameDialogTitle.textContent = mode === "rename" ? "Renombrar partida" : "Nueva partida";
  }
  if (els.gameNameInput) {
    els.gameNameInput.value = game?.name || "";
    els.gameNameInput.placeholder = mode === "rename" ? "Nuevo nombre" : "Nombre de la partida";
  }

  els.gameDialog?.showModal();
  els.gameNameInput?.focus();
  els.gameNameInput?.select();
}

function handleMigrate() {
  const game = migrateOrphanedSession("Partida 1");
  if (game) {
    showToast("Progreso importado como «Partida 1»");
    render();
  }
}

function render() {
  renderActiveBanner();
  renderMigrateBanner();
  renderGamesList();
}

function renderActiveBanner() {
  const active = getActiveGame();
  if (!els.activeBanner) {
    return;
  }

  if (!active) {
    els.activeBanner.hidden = true;
    return;
  }

  els.activeBanner.hidden = false;
  if (els.activeName) {
    els.activeName.textContent = active.name;
  }
}

function renderMigrateBanner() {
  if (!els.migrateBanner) {
    return;
  }
  els.migrateBanner.hidden = !canMigrateOrphanedSession();
}

function renderGamesList() {
  if (!els.savedGamesList) {
    return;
  }

  const games = listGames();
  const active = getActiveGame();
  els.savedGamesList.innerHTML = "";

  if (els.savedGamesEmpty) {
    els.savedGamesEmpty.hidden = games.length > 0;
  }

  for (const game of games) {
    const isActive = active?.id === game.id;
    const card = document.createElement("article");
    card.className = `saved-game-card${isActive ? " saved-game-card--active" : ""}`;
    card.innerHTML = `
      <div class="saved-game-card__main">
        <h3 class="saved-game-card__title">${escapeHtml(game.name)}</h3>
        <p class="saved-game-card__meta muted">${formatGameDate(game.updatedAt)}</p>
        <p class="saved-game-card__summary">${escapeHtml(formatGameSummary(game.meta))}</p>
        ${isActive ? '<span class="saved-game-card__badge">Activa</span>' : ""}
      </div>
      <div class="saved-game-card__actions">
        <button type="button" class="btn btn--primary btn--small" data-action="load">Cargar</button>
        <button type="button" class="btn btn--secondary btn--small" data-action="rename">Renombrar</button>
        <button type="button" class="btn btn--ghost btn--small" data-action="delete">Eliminar</button>
      </div>
    `;

    card.querySelector("[data-action='load']")?.addEventListener("click", () => {
      loadGame(game.id);
      showToast(`Partida «${game.name}» cargada`);
      render();
    });

    card.querySelector("[data-action='rename']")?.addEventListener("click", () => {
      openDialog("rename", game);
    });

    card.querySelector("[data-action='delete']")?.addEventListener("click", () => {
      if (!window.confirm(`¿Eliminar la partida «${game.name}»?`)) {
        return;
      }
      deleteGame(game.id);
      showToast("Partida eliminada");
      render();
    });

    els.savedGamesList.append(card);
  }
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

init();
