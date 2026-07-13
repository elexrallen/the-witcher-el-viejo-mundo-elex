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
  hideProgress,
  renderRoleBanner,
  setPlayMode,
  showToast,
  updateProgress,
} from "./ui.js";
import { initMobileUX, refreshPlayBarHeight } from "./mobile.js";
import { initAppChrome } from "./chrome.js";
import { enhanceIconElements, locationIconId } from "./icons.js";

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
    body: "Usa la barra sobre la carta para ir revelando el texto de arriba a abajo. Para antes de los resultados.",
  },
  choose: {
    title: "Paso 3 — Elegir",
    body: "El jugador activo elige A o B. Sigue deslizando solo si necesitas ver más de la carta.",
  },
  outcomeA: {
    title: "Paso 4 — Resultado A",
    body: "Desliza hasta el resultado de la opción A y léelo en voz alta. No muestres la opción B.",
  },
  outcomeB: {
    title: "Paso 4 — Resultado B",
    body: "Desliza hasta el resultado de la opción B y léelo en voz alta. No muestres la opción A.",
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
  phaseChoose: document.getElementById("phase-choose"),
  phaseResult: document.getElementById("phase-result"),
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
  cardCaption: document.getElementById("card-caption"),
  choices: document.getElementById("choices"),
  choiceA: document.getElementById("choice-a"),
  choiceB: document.getElementById("choice-b"),
  playBar: document.getElementById("play-bar"),
  btnBack: document.getElementById("btn-back"),
  btnHub: document.getElementById("btn-hub"),
  btnZoom: document.getElementById("btn-zoom"),
  btnNext: document.getElementById("btn-next"),
  zoomDialog: document.getElementById("zoom-dialog"),
  zoomImage: document.getElementById("zoom-image"),
  btnCloseZoom: document.getElementById("btn-close-zoom"),
};

let cardReveal = null;

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
    zoomImage: els.zoomImage,
  });
  loadPersistedState();
  renderExpansions();
  renderLocations();
  renderResumeBanner();
  renderLocationsRoleBanner();
  bindEvents();
  initMobileUX();
  initAppChrome({ page: "exploracion" });
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

  els.btnResetDeck.addEventListener("click", () => {
    if (!state.currentLocation) {
      return;
    }
    resetDeck(state.currentLocation);
    updateDeckStatus();
    renderLocations();
    if (state.currentCard) {
      prepareCard(state.currentLocation, state.currentCard);
    }
    showToast("Mazo reiniciado");
  });

  els.btnResetAll.addEventListener("click", () => {
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
  els.choiceA.addEventListener("click", () => revealOutcome("A"));
  els.choiceB.addEventListener("click", () => revealOutcome("B"));
  els.btnBack.addEventListener("click", showLocations);
  els.btnHub.addEventListener("click", () => {
    window.location.href = "index.html";
  });
  els.btnNext.addEventListener("click", () => {
    if (!state.currentLocation) {
      return;
    }
    if (state.cardPhase === "read" && cardHasChoices(state.currentCard)) {
      showChoosePhase();
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
      if (state.cardPhase === "read" && cardHasChoices(state.currentCard)) {
        showChoosePhase();
        return;
      }
      if (!els.btnNext.hidden && state.cardPhase === "outcome") {
        drawAndPrepare(state.currentLocation);
      }
      return;
    }

    if (state.cardPhase === "choose" && !els.choices.hidden) {
      if (key === "a") {
        event.preventDefault();
        revealOutcome("A");
      }
      if (key === "b") {
        event.preventDefault();
        revealOutcome("B");
      }
    }

    if (cardReveal?.isVisible() && (key === "arrowdown" || key === "arrowup")) {
      event.preventDefault();
      const step = key === "arrowdown" ? 4 : -4;
      cardReveal.setReveal(cardReveal.getReveal() + step);
    }
  });
}

function cardHasChoices(card) {
  const structured = card?.structured || {};
  return structured.format === "choices" || Boolean(structured.choice_a && structured.choice_b);
}

function setInstruction(key) {
  const copy = INSTRUCTIONS[key];
  els.instruction.innerHTML = `
    <h3 class="instruction__title">${copy.title}</h3>
    <p class="instruction__body">${copy.body}</p>
  `;
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

  if (phase === "read" || phase === "choose") {
    renderRoleBanner(els.roleBanner, {
      role: phase === "read" ? "Lee" : "Elige",
      player: phase === "read" ? drawer : active,
      detail: phase === "read"
        ? "Lee la carta al jugador activo."
        : "El jugador activo decide A o B.",
    });
    return;
  }

  if (phase === "outcome") {
    renderRoleBanner(els.roleBanner, {
      role: "Lee resultado",
      player: drawer,
      detail: "Solo el resultado de la opción elegida.",
    });
    return;
  }

  renderRoleBanner(els.roleBanner, {
    role: "Exploración",
    player: active,
    detail: "Aplica los efectos al jugador activo.",
  });
}

function renderLocationsRoleBanner() {
  const drawer = getDrawerLabel(state.session.activePlayer, state.session.playerCount);
  renderRoleBanner(els.roleBannerLocations, {
    role: "Fase II",
    player: drawer,
    detail: "Tras elegir ubicación, este jugador robará la carta.",
  });
  els.roleBannerLocations.hidden = false;
}

function updatePhaseSteps(hasChoices) {
  if (!hasChoices) {
    els.phaseSteps.hidden = true;
    return;
  }

  els.phaseSteps.hidden = false;
  const steps = [els.phaseDraw, els.phaseRead, els.phaseChoose, els.phaseResult];
  steps.forEach((step) => step.classList.remove("phase-step--active", "phase-step--done"));

  const phaseIndex = {
    draw: 0,
    read: 1,
    choose: 2,
    outcome: 3,
  }[state.cardPhase] ?? 0;

  steps.forEach((step, index) => {
    if (index < phaseIndex) {
      step.classList.add("phase-step--done");
    }
    if (index === phaseIndex) {
      step.classList.add("phase-step--active");
    }
  });
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
  els.zoomDialog.showModal();
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
  els.screenCard.hidden = true;
  els.screenLocations.hidden = false;
  els.playBar.classList.remove("play-bar--visible");
  setPlayMode(false);
  refreshPlayBarHeight();
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
  refreshPlayBarHeight();
  els.panelSettings.setAttribute("hidden", "");

  drawAndPrepare(location);
  updateDeckStatus();
  renderResumeBanner();
}

function drawAndPrepare(location) {
  const card = drawCard(location);
  if (!card) {
    showToast("Mazo agotado — reinicia en configuración");
    return;
  }

  state.currentCard = card;
  state.cardPhase = "draw";
  prepareCard(location, card);
}

function setRuleRemindersVisible(visible) {
  document.querySelectorAll(".rule-reminder").forEach((element) => {
    element.hidden = !visible;
  });
}

function prepareCard(location, card) {
  const hasChoices = cardHasChoices(card);

  els.cardLocation.textContent = location.name;
  els.cardExpansion.textContent = card.expansion.name;

  const cards = getLocationCards(location);
  const deckKey = getDeckKey(location);
  const deck = getDeckState(deckKey, cards);
  els.cardRemaining.textContent = `${deck.draw.length} restantes`;
  updateProgress(els.deckProgress, deck.draw.length, cards.length);

  setCardImage(card);
  hideCardImage();
  els.choices.hidden = true;
  els.choiceA.textContent = "Opción A";
  els.choiceB.textContent = "Opción B";
  els.btnNext.hidden = true;

  updatePhaseSteps(hasChoices);
  updateRoleBanner("draw");
  setInstruction("draw");

  showPlaceholder(
    "Carta bocabajo",
    "Pulsa <strong>Robar carta</strong> para revelar la imagen.",
  );
  setRuleRemindersVisible(!hasChoices);
  refreshPlayBarHeight();
}

function revealDrawnCard() {
  if (!state.currentLocation || !state.currentCard) {
    return;
  }

  const card = state.currentCard;
  const hasChoices = cardHasChoices(card);

  hidePlaceholder();
  showCardImage();
  refreshPlayBarHeight();

  if (hasChoices) {
    state.cardPhase = "read";
    setInstruction("read");
    updateRoleBanner("read");
    updatePhaseSteps(true);
    els.choices.hidden = true;
    els.btnNext.hidden = false;
    els.btnNext.textContent = "Elegir opción";
    setRuleRemindersVisible(true);
    refreshPlayBarHeight();
    return;
  }

  state.cardPhase = "outcome";
  setInstruction("narrative");
  updateRoleBanner("narrative");
  updatePhaseSteps(false);
  els.btnNext.hidden = false;
  els.btnNext.textContent = "Siguiente carta";
  setRuleRemindersVisible(false);
  refreshPlayBarHeight();
}

function showChoosePhase() {
  state.cardPhase = "choose";
  setInstruction("choose");
  updateRoleBanner("choose");
  updatePhaseSteps(true);
  els.choices.hidden = false;
  els.btnNext.hidden = true;
  refreshPlayBarHeight();
}

function revealOutcome(choice) {
  state.cardPhase = "outcome";
  setInstruction(choice === "A" ? "outcomeA" : "outcomeB");
  updateRoleBanner("outcome");
  updatePhaseSteps(true);
  els.choices.hidden = true;
  showCardImage();
  refreshPlayBarHeight();
  els.btnNext.hidden = false;
  els.btnNext.textContent = "Siguiente carta";
  refreshPlayBarHeight();
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
