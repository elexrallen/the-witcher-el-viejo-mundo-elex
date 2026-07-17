import { initCardReveal } from "./card-reveal.js";
import {
  loadActiveExpansions,
  migrateLegacyExpansions,
  saveActiveExpansions,
} from "./expansions.js";
import {
  getActivePlayerLabel,
  getDrawerLabel,
  loadPartidaSession,
} from "./partida.js";
import {
  bindInstructionToggle,
  expandInstruction,
  hideProgress,
  isMobileViewport,
  renderRoleBanner,
  setPlayMode,
  shouldAutoExpandInstruction,
  showToast,
  updateProgress,
} from "./ui.js";
import { initMobileUX, refreshMobileChrome } from "./mobile.js";
import { initAppChrome } from "./chrome.js";
import { enhanceIconElements, locationIconId } from "./icons.js";
import { initPlayerSetup } from "./player-setup.js";
import { createUndoStack } from "./undo-stack.js";
import { initUndoButton } from "./undo-ui.js";

const DATA_URL = "data/exploracion.json";
const STORAGE_KEY = "witcher-exploracion-v1";

const MAIN_LOCATION_IDS = new Set(["ciudad", "naturaleza"]);
const CAMPAIGN_LOCATION_IDS = new Set(["skellige", "caceria-fase-1", "caceria-fase-2"]);

const INSTRUCTIONS = {
  draw: {
    title: "Paso 1 — Robar",
    body: "El jugador a la derecha del activo saca una carta del mazo correspondiente.",
  },
  read: {
    title: "Paso 2 — Leer",
    body: "Usa la barra para revelar la carta a tu ritmo. Aplica los efectos en mesa según lo que leáis.",
  },
  narrative: {
    title: "Carta de exploración",
    body: "Desliza la barra sobre la carta para revelar el contenido poco a poco.",
  },
};

const state = {
  data: null,
  session: loadPartidaSession(),
  activeExpansions: new Set(["base"]),
  currentLocation: null,
  currentCard: null,
  cardPhase: "draw",
  lastLocationId: null,
  decks: {},
};

const els = {
  panelSettings: document.getElementById("panel-settings"),
  btnSettings: document.getElementById("btn-settings"),
  playerCount: document.getElementById("player-count"),
  activePlayer: document.getElementById("active-player"),
  drawerHint: document.getElementById("drawer-hint"),
  expansionList: document.getElementById("expansion-list"),
  deckStatus: document.getElementById("deck-status"),
  btnResetDeck: document.getElementById("btn-reset-deck"),
  btnResetAll: document.getElementById("btn-reset-all"),
  screenLocations: document.getElementById("screen-locations"),
  screenCard: document.getElementById("screen-card"),
  roleBannerLocations: document.getElementById("role-banner-locations"),
  roleBanner: document.getElementById("role-banner"),
  locationGridMain: document.getElementById("location-grid-main"),
  locationGridCampaign: document.getElementById("location-grid-campaign"),
  campaignSection: document.getElementById("campaign-section"),
  resumeBanner: document.getElementById("resume-banner"),
  resumeText: document.getElementById("resume-text"),
  btnResume: document.getElementById("btn-resume"),
  deckProgress: document.getElementById("deck-progress"),
  phaseSteps: document.getElementById("phase-steps"),
  phaseDraw: document.getElementById("phase-draw"),
  phaseRead: document.getElementById("phase-read"),
  cardLocation: document.getElementById("card-location"),
  cardExpansion: document.getElementById("card-expansion"),
  cardRemaining: document.getElementById("card-remaining"),
  instruction: document.getElementById("instruction"),
  btnToggleInstruction: document.getElementById("btn-toggle-instruction"),
  cardPlaceholder: document.getElementById("card-placeholder"),
  placeholderText: document.getElementById("placeholder-text"),
  btnDraw: document.getElementById("btn-draw"),
  cardFigure: document.getElementById("card-figure"),
  cardRevealRoot: document.getElementById("card-reveal"),
  cardImage: document.getElementById("card-image"),
  cardShade: document.getElementById("card-shade"),
  cardRevealLine: document.getElementById("card-reveal-line"),
  cardRevealSlider: document.getElementById("card-reveal-slider"),
  cardRevealHint: document.getElementById("card-reveal-hint"),
  btnRevealReset: document.getElementById("btn-reveal-reset"),
  btnRevealDirection: document.getElementById("btn-reveal-direction"),
  cardCaption: document.getElementById("card-caption"),
  playBar: document.getElementById("play-bar"),
  btnBack: document.getElementById("btn-back"),
  btnZoom: document.getElementById("btn-zoom"),
  btnNext: document.getElementById("btn-next"),
  zoomDialog: document.getElementById("zoom-dialog"),
  zoomImage: document.getElementById("zoom-image"),
  zoomRevealRoot: document.getElementById("zoom-reveal-root"),
  zoomShade: document.getElementById("zoom-shade"),
  zoomRevealLine: document.getElementById("zoom-reveal-line"),
  zoomRevealSlider: document.getElementById("zoom-reveal-slider"),
  zoomRevealHint: document.getElementById("zoom-reveal-hint"),
  zoomBtnDirection: document.getElementById("zoom-btn-direction"),
  zoomBtnReset: document.getElementById("zoom-btn-reset"),
  zoomBtnFull: document.getElementById("zoom-btn-full"),
  btnCloseZoom: document.getElementById("btn-close-zoom"),
};

let cardReveal = null;
const undoStack = createUndoStack();

function cloneDecks() {
  return structuredClone(state.decks);
}

function captureExploracionSnapshot() {
  return {
    decks: cloneDecks(),
    lastLocationId: state.lastLocationId,
    currentLocation: state.currentLocation,
    currentCard: state.currentCard,
    cardPhase: state.cardPhase,
    screen: els.screenCard.hidden ? "locations" : "card",
  };
}

function pushUndo(label) {
  const snapshot = captureExploracionSnapshot();
  undoStack.push(label, () => restoreExploracionSnapshot(snapshot));
}

function restoreExploracionSnapshot(snapshot) {
  state.decks = structuredClone(snapshot.decks);
  state.lastLocationId = snapshot.lastLocationId;
  state.currentLocation = snapshot.currentLocation;
  state.currentCard = snapshot.currentCard;
  state.cardPhase = snapshot.cardPhase;
  persistState();

  if (snapshot.screen === "locations" || !snapshot.currentLocation) {
    showLocations();
    return;
  }

  els.screenLocations.hidden = true;
  els.screenCard.hidden = false;
  els.playBar.classList.add("play-bar--visible");
  setPlayMode(true);
  refreshMobileChrome();

  if (!snapshot.currentCard) {
    if (snapshot.currentLocation) {
      els.cardLocation.textContent = snapshot.currentLocation.name;
      const cards = getLocationCards(snapshot.currentLocation);
      const deckKey = getDeckKey(snapshot.currentLocation);
      const deck = getDeckState(deckKey, cards);
      els.cardRemaining.textContent = `${deck.draw.length} restantes`;
      updateProgress(els.deckProgress, deck.draw.length, cards.length);
    }
    hideCardImage();
    els.btnNext.hidden = true;
    showPlaceholder(
      "Carta bocabajo",
      "Pulsa <strong>Robar carta</strong> para revelar la imagen.",
    );
    state.cardPhase = "draw";
    updatePhaseSteps();
    updateRoleBanner("draw");
    setInstruction("draw");
    updateDeckStatus();
    renderResumeBanner();
    refreshMobileChrome();
    return;
  }

  restoreCardView(snapshot.currentLocation, snapshot.currentCard, snapshot.cardPhase);
  updateDeckStatus();
  renderResumeBanner();
}

function restoreCardView(location, card, phase) {
  els.cardLocation.textContent = location.name;
  els.cardExpansion.textContent = card.expansion.name;

  const cards = getLocationCards(location);
  const deckKey = getDeckKey(location);
  const deck = getDeckState(deckKey, cards);
  els.cardRemaining.textContent = `${deck.draw.length} restantes`;
  updateProgress(els.deckProgress, deck.draw.length, cards.length);

  setCardImage(card);
  cardReveal?.setDirection("down");
  cardReveal?.setReveal(0);

  if (phase === "read") {
    hidePlaceholder();
    showCardImage();
    els.btnNext.hidden = false;
    els.btnNext.textContent = "Siguiente carta";
    setInstruction("read");
    updateRoleBanner("read");
  } else {
    hideCardImage();
    els.btnNext.hidden = true;
    showPlaceholder(
      "Carta bocabajo",
      "Pulsa <strong>Robar carta</strong> para revelar la imagen.",
    );
    setInstruction("draw");
    updateRoleBanner("draw");
  }

  updatePhaseSteps();
  refreshMobileChrome();
}

async function init() {
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error("No se pudo cargar el archivo de cartas.");
  }

  state.data = await response.json();
  state.session = loadPartidaSession();
  cardReveal = initCardReveal({
    root: els.cardRevealRoot,
    image: els.cardImage,
    shade: els.cardShade,
    line: els.cardRevealLine,
    slider: els.cardRevealSlider,
    hint: els.cardRevealHint,
    resetButton: els.btnRevealReset,
    directionButton: els.btnRevealDirection,
    modal: {
      dialog: els.zoomDialog,
      root: els.zoomRevealRoot,
      image: els.zoomImage,
      shade: els.zoomShade,
      line: els.zoomRevealLine,
      slider: els.zoomRevealSlider,
      hint: els.zoomRevealHint,
      directionButton: els.zoomBtnDirection,
      resetButton: els.zoomBtnReset,
      fullButton: els.zoomBtnFull,
    },
  });
  loadPersistedState();
  renderExpansions();
  renderLocations();
  renderResumeBanner();
  renderLocationsRoleBanner();
  initPlayerSetup({
    playerCountEl: els.playerCount,
    activePlayerEl: els.activePlayer,
    drawerHintEl: els.drawerHint,
    onChange: (session) => {
      state.session = session;
      renderLocationsRoleBanner();
      updateRoleBanner();
    },
  });
  bindEvents();
  initMobileUX();
  initAppChrome({ page: "exploracion" });
  initUndoButton({
    undoStack,
    onUndo: () => undoStack.undo(),
  });
  updateDeckStatus();
}

function loadPersistedState() {
  migrateLegacyExpansions(STORAGE_KEY);
  state.activeExpansions = loadActiveExpansions();

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return;
  }

  try {
    const saved = JSON.parse(raw);
    state.decks = saved.decks || {};
    state.lastLocationId = saved.lastLocationId || null;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function persistState() {
  saveActiveExpansions(state.activeExpansions);
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      decks: state.decks,
      lastLocationId: state.lastLocationId,
    }),
  );
  import("./saved-games.js").then(({ syncActiveGame, setLastMode }) => {
    setLastMode("exploracion");
    syncActiveGame();
  });
}

function toggleSettingsPanel(open) {
  const shouldOpen = open ?? els.panelSettings.hasAttribute("hidden");
  if (shouldOpen) {
    els.panelSettings.removeAttribute("hidden");
    if (isMobileViewport()) {
      document.body.classList.add("settings-open");
    }
  } else {
    els.panelSettings.setAttribute("hidden", "");
    document.body.classList.remove("settings-open");
  }
  refreshMobileChrome();
}

function bindEvents() {
  els.btnSettings.addEventListener("click", () => {
    toggleSettingsPanel();
  });

  els.btnResetDeck.addEventListener("click", () => {
    if (!state.currentLocation) {
      return;
    }
    pushUndo(`Reiniciar mazo (${state.currentLocation.name})`);
    resetDeck(state.currentLocation);
    updateDeckStatus();
    renderLocations();
    if (state.currentCard) {
      prepareCard(state.currentLocation, state.currentCard);
    }
    showToast("Mazo reiniciado");
  });

  els.btnResetAll.addEventListener("click", () => {
    pushUndo("Reiniciar todos los mazos");
    state.decks = {};
    state.lastLocationId = null;
    persistState();
    updateDeckStatus();
    renderLocations();
    renderResumeBanner();
    showToast("Todos los mazos reiniciados");
  });

  els.btnResume.addEventListener("click", () => {
    const location = state.data.locations.find((item) => item.id === state.lastLocationId);
    if (location && isLocationAvailable(location)) {
      openCardScreen(location);
    }
  });

  els.btnDraw.addEventListener("click", revealDrawnCard);
  els.btnBack.addEventListener("click", showLocations);
  els.btnNext.addEventListener("click", () => {
    if (!state.currentLocation) {
      return;
    }
    drawAndPrepare(state.currentLocation);
  });

  els.btnZoom.addEventListener("click", openZoom);
  els.btnCloseZoom.addEventListener("click", () => els.zoomDialog.close());
  els.zoomDialog.addEventListener("click", (event) => {
    if (event.target === els.zoomDialog) {
      els.zoomDialog.close();
    }
  });

  els.cardImage.addEventListener("click", () => {
    if (cardReveal?.isVisible()) {
      openZoom();
    }
  });

  bindInstructionToggle(els.btnToggleInstruction, els.instruction);

  document.addEventListener("keydown", (event) => {
    if (els.screenCard.hidden || !state.currentCard) {
      return;
    }

    const key = event.key.toLowerCase();
    if (key === "escape") {
      showLocations();
      return;
    }

    if (key === "enter") {
      event.preventDefault();
      if (state.cardPhase === "draw") {
        revealDrawnCard();
        return;
      }
      if (!els.btnNext.hidden && state.cardPhase === "read") {
        drawAndPrepare(state.currentLocation);
      }
      return;
    }

    if (cardReveal?.isVisible() && (key === "arrowdown" || key === "arrowup")) {
      event.preventDefault();
      const step = key === "arrowdown" ? 4 : -4;
      cardReveal.setReveal(cardReveal.getReveal() + step);
    }
  });
}

function updateRoleBanner(phase) {
  const active = getActivePlayerLabel(state.session.activePlayer, state.session.playerCount);
  const drawer = getDrawerLabel(state.session.activePlayer, state.session.playerCount);

  if (phase === "draw") {
    renderRoleBanner(els.roleBanner, {
      role: "Roba",
      player: drawer,
      detail: "Saca una carta del mazo barajado.",
    });
    return;
  }

  if (phase === "read") {
    renderRoleBanner(els.roleBanner, {
      role: "Lee",
      player: drawer,
      detail: "Lee la carta y aplica los efectos en mesa.",
    });
    return;
  }

  renderRoleBanner(els.roleBanner, {
    role: "Exploración",
    player: active,
    detail: "Aplica los efectos al jugador activo.",
  });
}

function updatePhaseSteps() {
  els.phaseSteps.hidden = false;
  const steps = [els.phaseDraw, els.phaseRead];
  steps.forEach((step) => step.classList.remove("phase-step--active", "phase-step--done"));

  const phaseIndex = state.cardPhase === "draw" ? 0 : 1;

  steps.forEach((step, index) => {
    if (index < phaseIndex) {
      step.classList.add("phase-step--done");
    }
    if (index === phaseIndex) {
      step.classList.add("phase-step--active");
    }
  });
}

function setInstruction(key) {
  const copy = INSTRUCTIONS[key];
  els.instruction.innerHTML = `
    <h3 class="instruction__title">${copy.title}</h3>
    <p class="instruction__body">${copy.body}</p>
  `;
  if (isMobileViewport() && shouldAutoExpandInstruction()) {
    expandInstruction(els.instruction, els.btnToggleInstruction);
  }
}

function renderLocationsRoleBanner() {
  const drawer = getDrawerLabel(state.session.activePlayer, state.session.playerCount);
  renderRoleBanner(els.roleBannerLocations, {
    role: "Explorar",
    player: drawer,
    detail: "Tras elegir ubicación, este jugador robará la carta.",
  });
  els.roleBannerLocations.hidden = false;
}

function setCardImage(card) {
  els.cardCaption.textContent = `Carta #${card.position}`;
  cardReveal?.setImage(card.image);
}

function showCardImage() {
  els.cardFigure.hidden = false;
  cardReveal?.show();
  els.btnZoom.hidden = false;
}

function hideCardImage() {
  els.cardFigure.hidden = true;
  cardReveal?.hide();
  els.btnZoom.hidden = true;
}

function openZoom() {
  if (!state.currentCard || !cardReveal?.isVisible()) {
    return;
  }
  cardReveal.openModal();
}

function showPlaceholder(title, text) {
  els.cardPlaceholder.hidden = false;
  els.cardPlaceholder.querySelector(".card-placeholder__title").textContent = title;
  els.placeholderText.innerHTML = text;
}

function hidePlaceholder() {
  els.cardPlaceholder.hidden = true;
}

function renderExpansions() {
  els.expansionList.innerHTML = "";

  for (const expansion of state.data.expansions) {
    const label = document.createElement("label");
    label.className = "chip";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = expansion.id;
    input.checked = state.activeExpansions.has(expansion.id);
    input.disabled = expansion.kind === "base";
    input.addEventListener("change", () => {
      if (input.checked) {
        state.activeExpansions.add(expansion.id);
      } else {
        state.activeExpansions.delete(expansion.id);
      }
      persistState();
      renderLocations();
      renderResumeBanner();
      updateDeckStatus();
    });

    label.append(input, document.createTextNode(expansion.name));
    els.expansionList.append(label);
  }
}

function isLocationAvailable(location) {
  return state.activeExpansions.has(location.expansion_id);
}

function getLocationCards(location) {
  let cards = [...location.cards];
  for (const addon of location.addons || []) {
    if (state.activeExpansions.has(addon.expansion_id)) {
      cards = cards.concat(addon.cards);
    }
  }
  return cards;
}

function getDeckKey(location) {
  const addonKeys = (location.addons || [])
    .filter((addon) => state.activeExpansions.has(addon.expansion_id))
    .map((addon) => addon.expansion_id)
    .sort()
    .join("+");
  return addonKeys ? `${location.id}:${addonKeys}` : location.id;
}

function getDeckState(deckKey, cards) {
  if (!state.decks[deckKey]) {
    state.decks[deckKey] = {
      draw: shuffle(cards.map((card) => card.card_id)),
      discard: [],
    };
    persistState();
  }
  return state.decks[deckKey];
}

function shuffle(items) {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function resetDeck(location) {
  const deckKey = getDeckKey(location);
  const cards = getLocationCards(location);
  state.decks[deckKey] = {
    draw: shuffle(cards.map((card) => card.card_id)),
    discard: [],
  };
  persistState();
}

function drawCard(location) {
  const cards = getLocationCards(location);
  const deckKey = getDeckKey(location);
  const deck = getDeckState(deckKey, cards);

  if (deck.draw.length === 0) {
    if (deck.discard.length === 0) {
      return null;
    }
    deck.draw = shuffle(deck.discard);
    deck.discard = [];
  }

  const cardId = deck.draw.pop();
  deck.discard.push(cardId);
  persistState();

  return cards.find((card) => card.card_id === cardId) || null;
}

function renderResumeBanner() {
  const location = state.data.locations.find((item) => item.id === state.lastLocationId);
  if (!location || !isLocationAvailable(location)) {
    els.resumeBanner.hidden = true;
    return;
  }

  const cards = getLocationCards(location);
  const deck = getDeckState(getDeckKey(location), cards);
  els.resumeText.textContent = `Última partida en ${location.name} · ${deck.draw.length} cartas en el mazo`;
  els.resumeBanner.hidden = false;
}

function renderLocationButton(location) {
  const available = isLocationAvailable(location);
  const cards = getLocationCards(location);
  const totalCards = cards.length;
  const deckKey = getDeckKey(location);
  const deck = available ? getDeckState(deckKey, cards) : null;
  const remaining = deck ? deck.draw.length : totalCards;
  const iconName = locationIconId(location.id);
  const meta = available
    ? `${remaining}/${totalCards} en el mazo`
    : `Requiere: ${location.expansion.name}`;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "location-card";
  button.disabled = !available;
  button.innerHTML = `
    <div class="location-card__icon" data-icon="${iconName}" data-icon-size="28" aria-hidden="true"></div>
    <h3 class="location-card__title">${location.name}</h3>
    <p class="location-card__desc">${location.description}</p>
    <p class="location-card__meta">${meta}</p>
    ${available ? '<span class="location-card__cta">Preparar robo</span>' : ""}
  `;
  enhanceIconElements(button);
  button.addEventListener("click", () => openCardScreen(location));
  return button;
}

function renderLocations() {
  els.locationGridMain.innerHTML = "";
  els.locationGridCampaign.innerHTML = "";

  let hasCampaign = false;

  for (const location of state.data.locations) {
    const button = renderLocationButton(location);
    if (MAIN_LOCATION_IDS.has(location.id)) {
      els.locationGridMain.append(button);
      continue;
    }
    if (CAMPAIGN_LOCATION_IDS.has(location.id)) {
      els.locationGridCampaign.append(button);
      hasCampaign = true;
    }
  }

  els.campaignSection.hidden = !hasCampaign;
}

function showLocations() {
  state.currentCard = null;
  state.cardPhase = "draw";
  state.currentLocation = null;
  els.screenCard.hidden = true;
  els.screenLocations.hidden = false;
  els.playBar.classList.remove("play-bar--visible");
  setPlayMode(false);
  refreshMobileChrome();
  hideProgress(els.deckProgress);
  renderLocations();
  renderResumeBanner();
  renderLocationsRoleBanner();
  updateDeckStatus();
}

function openCardScreen(location) {
  state.currentLocation = location;
  state.lastLocationId = location.id;
  persistState();

  els.screenLocations.hidden = true;
  els.screenCard.hidden = false;
  els.playBar.classList.add("play-bar--visible");
  setPlayMode(true);
  refreshMobileChrome();
  els.panelSettings.setAttribute("hidden", "");
  document.body.classList.remove("settings-open");

  if (isMobileViewport() && shouldAutoExpandInstruction()) {
    expandInstruction(els.instruction, els.btnToggleInstruction);
  }

  drawAndPrepare(location);
  updateDeckStatus();
  renderResumeBanner();
}

function drawAndPrepare(location) {
  const cards = getLocationCards(location);
  const deckKey = getDeckKey(location);
  const deck = getDeckState(deckKey, cards);
  if (deck.draw.length === 0 && deck.discard.length === 0) {
    showToast("Mazo agotado — reinicia en configuración");
    return;
  }

  pushUndo(
    state.currentCard
      ? `Robar carta en ${location.name}`
      : `Preparar carta en ${location.name}`,
  );

  const card = drawCard(location);
  if (!card) {
    undoStack.undo();
    showToast("Mazo agotado — reinicia en configuración");
    return;
  }

  state.currentCard = card;
  state.cardPhase = "draw";
  prepareCard(location, card);
}

function prepareCard(location, card) {
  els.cardLocation.textContent = location.name;
  els.cardExpansion.textContent = card.expansion.name;

  const cards = getLocationCards(location);
  const deckKey = getDeckKey(location);
  const deck = getDeckState(deckKey, cards);
  els.cardRemaining.textContent = `${deck.draw.length} restantes`;
  updateProgress(els.deckProgress, deck.draw.length, cards.length);

  setCardImage(card);
  cardReveal?.setDirection("down");
  hideCardImage();
  els.btnNext.hidden = true;

  updatePhaseSteps();
  updateRoleBanner("draw");
  setInstruction("draw");

  showPlaceholder(
    "Carta bocabajo",
    "Pulsa <strong>Robar carta</strong> para revelar la imagen.",
  );
  refreshMobileChrome();
}

function revealDrawnCard() {
  if (!state.currentLocation || !state.currentCard) {
    return;
  }

  hidePlaceholder();
  showCardImage();
  state.cardPhase = "read";
  setInstruction("read");
  updateRoleBanner("read");
  updatePhaseSteps();
  els.btnNext.hidden = false;
  els.btnNext.textContent = "Siguiente carta";
  refreshMobileChrome();
}

function updateDeckStatus() {
  if (!state.currentLocation) {
    els.deckStatus.textContent = "Selecciona una ubicación para explorar.";
    return;
  }

  const cards = getLocationCards(state.currentLocation);
  const deckKey = getDeckKey(state.currentLocation);
  const deck = getDeckState(deckKey, cards);
  els.deckStatus.textContent = `${state.currentLocation.name}: ${deck.draw.length} restantes, ${deck.discard.length} jugadas`;
}

init().catch((error) => {
  document.body.innerHTML = `<main class="panel" style="margin:2rem auto; max-width:720px"><h2>Error</h2><p>${error.message}</p></main>`;
});
