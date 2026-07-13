import {
  loadActiveExpansions,
  migrateLegacyExpansions,
  saveActiveExpansions,
} from "./expansions.js";
import {
  getDrawerLabel,
  getActivePlayerLabel,
  loadPartidaSession,
  PHASE_II_ACTIONS,
  PHASES,
  savePartidaSession,
} from "./partida.js";
import { initMobileUX } from "./mobile.js";

const EXPANSIONS_URL = "data/exploracion.json";
const STORAGE_KEY = "witcher-partida-v1";

const state = {
  session: loadPartidaSession(),
  expansions: [],
};

const els = {
  panelSettings: document.getElementById("panel-settings"),
  btnSettings: document.getElementById("btn-settings"),
  playerCount: document.getElementById("player-count"),
  activePlayer: document.getElementById("active-player"),
  drawerHint: document.getElementById("drawer-hint"),
  expansionList: document.getElementById("expansion-list"),
  turnNumber: document.getElementById("turn-number"),
  activePlayerLabel: document.getElementById("active-player-label"),
  btnEndTurn: document.getElementById("btn-end-turn"),
  phaseTrack: document.getElementById("phase-track"),
  phaseSummary: document.getElementById("phase-summary"),
  phaseContentI: document.getElementById("phase-content-I"),
  phaseContentII: document.getElementById("phase-content-II"),
  phaseContentIII: document.getElementById("phase-content-III"),
  actionGrid: document.getElementById("action-grid"),
  btnFinishTurn: document.getElementById("btn-finish-turn"),
  missionForm: document.getElementById("mission-form"),
  missionEventNumber: document.getElementById("mission-event-number"),
  soloBanner: document.getElementById("solo-banner"),
};

async function init() {
  migrateLegacyExpansions(STORAGE_KEY);
  const response = await fetch(EXPANSIONS_URL);
  if (response.ok) {
    const data = await response.json();
    state.expansions = data.expansions || [];
  }

  renderPlayerSelectors();
  renderExpansions();
  renderPhaseTrack();
  renderPhaseIIActions();
  bindEvents();
  initMobileUX();
  renderHub();
}

function bindEvents() {
  els.btnSettings.addEventListener("click", () => {
    const hidden = els.panelSettings.hasAttribute("hidden");
    if (hidden) {
      els.panelSettings.removeAttribute("hidden");
    } else {
      els.panelSettings.setAttribute("hidden", "");
    }
  });

  els.playerCount.addEventListener("change", () => {
    state.session.playerCount = Number.parseInt(els.playerCount.value, 10);
    if (state.session.activePlayer > state.session.playerCount) {
      state.session.activePlayer = 1;
    }
    savePartidaSession(state.session);
    renderPlayerSelectors();
    renderHub();
  });

  els.activePlayer.addEventListener("change", () => {
    state.session.activePlayer = Number.parseInt(els.activePlayer.value, 10);
    savePartidaSession(state.session);
    renderHub();
  });

  els.btnEndTurn.addEventListener("click", endTurn);
  els.btnFinishTurn.addEventListener("click", endTurn);

  els.missionForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const number = Number.parseInt(els.missionEventNumber.value, 10);
    if (Number.isNaN(number) || number < 1) {
      return;
    }
    const url = new URL("eventos.html", window.location.href);
    url.searchParams.set("event", String(number));
    url.searchParams.set("from", "mission");
    window.location.href = url.toString();
  });

  document.querySelectorAll(".phase-advance").forEach((button) => {
    button.addEventListener("click", () => {
      const phase = button.dataset.phase;
      if (phase) {
        setPhase(phase);
      }
    });
  });
}

function renderPlayerSelectors() {
  els.playerCount.value = String(state.session.playerCount);
  els.activePlayer.innerHTML = "";

  for (let player = 1; player <= state.session.playerCount; player += 1) {
    const option = document.createElement("option");
    option.value = String(player);
    option.textContent = `Jugador ${player}`;
    els.activePlayer.append(option);
  }

  els.activePlayer.value = String(state.session.activePlayer);
}

function renderExpansions() {
  if (!els.expansionList || state.expansions.length === 0) {
    return;
  }

  const activeExpansions = loadActiveExpansions();
  els.expansionList.innerHTML = "";

  for (const expansion of state.expansions) {
    const label = document.createElement("label");
    label.className = "chip";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = expansion.id;
    input.checked = activeExpansions.has(expansion.id);
    input.disabled = expansion.kind === "base";
    input.addEventListener("change", () => {
      if (input.checked) {
        activeExpansions.add(expansion.id);
      } else {
        activeExpansions.delete(expansion.id);
      }
      saveActiveExpansions(activeExpansions);
    });

    label.append(input, document.createTextNode(expansion.name));
    els.expansionList.append(label);
  }
}

function renderPhaseTrack() {
  els.phaseTrack.innerHTML = "";

  for (const phase of PHASES) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "phase-track__item";
    button.dataset.phase = phase.id;
    button.innerHTML = `
      <span class="phase-track__name">${phase.name}</span>
      <span class="phase-track__subtitle">${phase.subtitle}</span>
    `;
    button.addEventListener("click", () => setPhase(phase.id));
    els.phaseTrack.append(button);
  }
}

function renderPhaseIIActions() {
  els.actionGrid.innerHTML = "";

  for (const action of PHASE_II_ACTIONS) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "action-card";
    card.dataset.action = action.id;
    card.innerHTML = `
      <span class="action-card__icon" aria-hidden="true">${action.icon}</span>
      <span class="action-card__title">${action.name}</span>
      <span class="action-card__desc">${action.description}</span>
    `;
    card.addEventListener("click", () => selectPhaseIIAction(action));
    els.actionGrid.append(card);
  }
}

function setPhase(phaseId) {
  state.session.phase = phaseId;
  if (phaseId !== "II") {
    state.session.phaseIIAction = null;
  }
  savePartidaSession(state.session);
  renderHub();
}

function selectPhaseIIAction(action) {
  state.session.phase = "II";
  state.session.phaseIIAction = action.id;
  savePartidaSession(state.session);
  renderHub();

  if (action.appLink) {
    window.location.href = action.appLink;
  }
}

function endTurn() {
  const nextPlayer = state.session.activePlayer >= state.session.playerCount
    ? 1
    : state.session.activePlayer + 1;

  state.session.activePlayer = nextPlayer;
  state.session.turnNumber += 1;
  state.session.phase = "I";
  state.session.phaseIIAction = null;
  savePartidaSession(state.session);
  renderPlayerSelectors();
  renderHub();
}

function renderHub() {
  const phase = PHASES.find((item) => item.id === state.session.phase) || PHASES[0];

  els.turnNumber.textContent = String(state.session.turnNumber);
  els.activePlayerLabel.textContent = getActivePlayerLabel(
    state.session.activePlayer,
    state.session.playerCount,
  );
  els.phaseSummary.textContent = phase.summary;

  const drawer = getDrawerLabel(state.session.activePlayer, state.session.playerCount);
  const isSolo = state.session.playerCount <= 1;
  els.drawerHint.textContent = isSolo
    ? "En solitario, tú lees y eliges. Usa el Automa para el oponente virtual y el combate."
    : `Para explorar o eventos, roba y lee: ${drawer}.`;

  if (els.soloBanner) {
    if (isSolo) {
      els.soloBanner.removeAttribute("hidden");
    } else {
      els.soloBanner.setAttribute("hidden", "");
    }
  }

  els.phaseContentI.hidden = state.session.phase !== "I";
  els.phaseContentII.hidden = state.session.phase !== "II";
  els.phaseContentIII.hidden = state.session.phase !== "III";

  els.phaseTrack.querySelectorAll(".phase-track__item").forEach((button) => {
    const isActive = button.dataset.phase === state.session.phase;
    button.classList.toggle("phase-track__item--active", isActive);
  });

  els.actionGrid.querySelectorAll(".action-card").forEach((card) => {
    const isSelected = card.dataset.action === state.session.phaseIIAction;
    card.classList.toggle("action-card--selected", isSelected);
  });
}

init().catch((error) => {
  document.body.innerHTML = `<main class="panel" style="margin:2rem auto; max-width:720px"><h2>Error</h2><p>${error.message}</p></main>`;
});
