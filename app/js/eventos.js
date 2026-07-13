import { initCardReveal } from "./card-reveal.js";
import { initMobileUX, refreshPlayBarHeight } from "./mobile.js";
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
  renderRoleBanner,
  setPlayMode,
  showToast,
} from "./ui.js";

const DATA_URL = "data/eventos.json";
const STORAGE_KEY = "witcher-eventos-v1";
const MAIN_DECK_ID = "eventos";

const state = {
  data: null,
  session: loadPartidaSession(),
  activeExpansions: new Set(["base"]),
  currentDeck: null,
  currentCard: null,
  pendingNumber: 1,
  cardRevealed: false,
  fromMission: false,
  decks: {},
};

const els = {
  panelSettings: document.getElementById("panel-settings"),
  btnSettings: document.getElementById("btn-settings"),
  expansionList: document.getElementById("expansion-list"),
  deckStatus: document.getElementById("deck-status"),
  btnResetDeck: document.getElementById("btn-reset-deck"),
  btnResetAll: document.getElementById("btn-reset-all"),
  campaignDecksSection: document.getElementById("campaign-decks-section"),
  campaignDeckList: document.getElementById("campaign-deck-list"),
  roleBanner: document.getElementById("role-banner"),
  instruction: document.getElementById("instruction"),
  btnToggleInstruction: document.getElementById("btn-toggle-instruction"),
  screenCard: document.getElementById("screen-card"),
  cardDeck: document.getElementById("card-deck"),
  cardNumber: document.getElementById("card-number"),
  cardExpansion: document.getElementById("card-expansion"),
  cardRemaining: document.getElementById("card-remaining"),
  cardImage: document.getElementById("card-image"),
  cardCaption: document.getElementById("card-caption"),
  cardFigure: document.getElementById("card-figure"),
  cardRevealRoot: document.getElementById("card-reveal"),
  cardShade: document.getElementById("card-shade"),
  cardRevealLine: document.getElementById("card-reveal-line"),
  cardRevealSlider: document.getElementById("card-reveal-slider"),
  cardRevealHint: document.getElementById("card-reveal-hint"),
  btnRevealReset: document.getElementById("btn-reveal-reset"),
  cardPlaceholder: document.getElementById("card-placeholder"),
  eventJump: document.getElementById("event-jump"),
  jumpNumber: document.getElementById("jump-number"),
  jumpHint: document.getElementById("jump-hint"),
  btnPrev: document.getElementById("btn-prev"),
  btnNextNumber: document.getElementById("btn-next-number"),
  playBar: document.getElementById("play-bar"),
  btnHub: document.getElementById("btn-hub"),
  btnZoom: document.getElementById("btn-zoom"),
  btnNext: document.getElementById("btn-next"),
  btnNextLabel: document.getElementById("btn-next-label"),
  zoomDialog: document.getElementById("zoom-dialog"),
  zoomImage: document.getElementById("zoom-image"),
  btnCloseZoom: document.getElementById("btn-close-zoom"),
};

let cardReveal = null;

async function init() {
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error("No se pudo cargar el archivo de eventos.");
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

  const params = new URLSearchParams(window.location.search);
  const eventParam = Number.parseInt(params.get("event") || "", 10);
  state.fromMission = params.get("from") === "mission";

  const mainDeck = getMainDeck();
  if (!mainDeck) {
    throw new Error("No se encontró el mazo principal de eventos.");
  }

  state.currentDeck = state.data.decks.find((deck) => deck.id === state.currentDeck?.id) || mainDeck;
  renderExpansions();
  renderCampaignDecks();
  bindEvents();
  initMobileUX();
  setPlayMode(true);
  els.playBar.classList.add("play-bar--visible");
  refreshPlayBarHeight();

  const deckKey = getDeckKey(state.currentDeck);
  const deckState = getDeckState(deckKey, getDeckCards(state.currentDeck).length);
  const initialNumber = Number.isNaN(eventParam) ? (deckState.lastNumber || 1) : eventParam;
  setupDeck(state.currentDeck, initialNumber);
  updateRoleBanner();
  updateInstruction();

  if (state.fromMission && !Number.isNaN(eventParam)) {
    revealEvent(state.currentDeck, eventParam);
  }
}

function setupDeck(deck, number) {
  state.currentDeck = deck;
  state.currentCard = null;
  state.cardRevealed = false;
  setPendingNumber(deck, number);
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
    if (saved.currentDeckId) {
      const deck = state.data.decks.find((item) => item.id === saved.currentDeckId);
      if (deck) {
        state.currentDeck = deck;
      }
    }
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
      currentDeckId: state.currentDeck?.id || MAIN_DECK_ID,
    }),
  );
}

function getMainDeck() {
  return state.data.decks.find((deck) => deck.id === MAIN_DECK_ID) || state.data.decks[0] || null;
}

function getCampaignDecks() {
  return state.data.decks.filter((deck) => deck.id !== MAIN_DECK_ID);
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
    if (!state.currentDeck) {
      return;
    }
    resetDeck(state.currentDeck);
    setupDeck(state.currentDeck, 1);
    showToast("Mazo reiniciado");
  });

  els.btnResetAll.addEventListener("click", () => {
    state.decks = {};
    state.currentDeck = getMainDeck();
    persistState();
    setupDeck(state.currentDeck, 1);
    showToast("Todos los mazos reiniciados");
  });

  if (els.btnHub) {
    els.btnHub.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }

  bindInstructionToggle(els.btnToggleInstruction, els.instruction);

  els.btnNext.addEventListener("click", () => {
    if (!state.currentDeck) {
      return;
    }
    const cards = getDeckCards(state.currentDeck);
    const next = clampNumber(state.pendingNumber + 1, cards.length);
    setPendingNumber(state.currentDeck, next);
  });

  els.btnPrev.addEventListener("click", () => {
    if (!state.currentDeck) {
      return;
    }
    const cards = getDeckCards(state.currentDeck);
    const prev = clampNumber(state.pendingNumber - 1, cards.length);
    setPendingNumber(state.currentDeck, prev);
  });

  els.btnNextNumber.addEventListener("click", () => {
    if (!state.currentDeck) {
      return;
    }
    const cards = getDeckCards(state.currentDeck);
    const next = clampNumber(state.pendingNumber + 1, cards.length);
    setPendingNumber(state.currentDeck, next);
  });

  els.eventJump.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!state.currentDeck) {
      return;
    }
    const number = Number.parseInt(els.jumpNumber.value, 10);
    revealEvent(state.currentDeck, number);
  });

  els.jumpNumber.addEventListener("input", () => {
    const value = Number.parseInt(els.jumpNumber.value, 10);
    if (!Number.isNaN(value)) {
      state.pendingNumber = value;
    }
    hideCard();
  });

  els.btnZoom.addEventListener("click", openZoom);
  els.btnCloseZoom.addEventListener("click", () => els.zoomDialog.close());
  els.zoomDialog.addEventListener("click", (event) => {
    if (event.target === els.zoomDialog) {
      els.zoomDialog.close();
    }
  });

  els.cardImage.addEventListener("click", () => {
    if (state.cardRevealed && cardReveal?.isVisible()) {
      openZoom();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!state.currentDeck) {
      return;
    }

    const cards = getDeckCards(state.currentDeck);

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setPendingNumber(state.currentDeck, state.pendingNumber - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      setPendingNumber(state.currentDeck, state.pendingNumber + 1);
    }
    if (event.key === "Enter" && event.target !== els.jumpNumber) {
      event.preventDefault();
      revealEvent(state.currentDeck, state.pendingNumber);
    }

    if (state.cardRevealed && cardReveal?.isVisible() && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 4 : -4;
      cardReveal.setReveal(cardReveal.getReveal() + step);
    }
  });
}

function isDeckAvailable(deck) {
  return state.activeExpansions.has(deck.expansion_id);
}

function getActiveAddons(deck) {
  return (deck.addons || []).filter((addon) => state.activeExpansions.has(addon.expansion_id));
}

function describeDeckSize(deck) {
  const baseCount = deck.cards.length;
  const activeAddons = getActiveAddons(deck);
  const addonCount = activeAddons.reduce((total, addon) => total + addon.cards.length, 0);
  const total = baseCount + addonCount;

  if (addonCount === 0) {
    return `${baseCount} cartas (solo base)`;
  }

  const addonLabel = activeAddons
    .map((addon) => {
      const expansion = state.data.expansions.find((item) => item.id === addon.expansion_id);
      return `${addon.cards.length} ${expansion?.name || addon.deck_name}`;
    })
    .join(" + ");

  return `${baseCount} base + ${addonLabel} = ${total} cartas`;
}

function getDeckCards(deck) {
  const cards = deck.cards.map((card) => ({
    ...card,
    number: card.position,
    source: deck.deck_name,
  }));

  let offset = deck.cards.length;
  for (const addon of deck.addons || []) {
    if (!state.activeExpansions.has(addon.expansion_id)) {
      continue;
    }
    for (const card of addon.cards) {
      cards.push({
        ...card,
        number: offset + card.position,
        source: addon.deck_name,
      });
    }
    offset += addon.cards.length;
  }

  return cards.sort((a, b) => a.number - b.number);
}

function getDeckKey(deck) {
  const addonKeys = (deck.addons || [])
    .filter((addon) => state.activeExpansions.has(addon.expansion_id))
    .map((addon) => addon.expansion_id)
    .sort()
    .join("+");
  return addonKeys ? `${deck.id}:${addonKeys}` : deck.id;
}

function getDeckState(deckKey, totalCards) {
  if (!state.decks[deckKey]) {
    state.decks[deckKey] = {
      lastNumber: 1,
      totalCards,
    };
    persistState();
  } else if (state.decks[deckKey].totalCards !== totalCards) {
    state.decks[deckKey].totalCards = totalCards;
    if (state.decks[deckKey].lastNumber > totalCards) {
      state.decks[deckKey].lastNumber = totalCards;
    }
    persistState();
  }
  return state.decks[deckKey];
}

function resetDeck(deck) {
  const cards = getDeckCards(deck);
  const deckKey = getDeckKey(deck);
  state.decks[deckKey] = {
    lastNumber: 1,
    totalCards: cards.length,
  };
  persistState();
}

function clampNumber(number, totalCards) {
  return Math.min(Math.max(number, 1), totalCards);
}

function updateRoleBanner() {
  const drawer = getDrawerLabel(state.session.activePlayer, state.session.playerCount);
  const active = getActivePlayerLabel(state.session.activePlayer, state.session.playerCount);

  if (state.cardRevealed) {
    renderRoleBanner(els.roleBanner, {
      role: "Resolver",
      player: active,
      detail: "Los efectos afectan al jugador activo.",
    });
    return;
  }

  const detail = state.fromMission
    ? "Misión resuelta: roba la carta numerada indicada."
    : "Busca la carta por número en el mazo ordenado (no barajado).";

  renderRoleBanner(els.roleBanner, {
    role: "Roba evento",
    player: drawer,
    detail,
  });
}

function updateInstruction() {
  if (!els.instruction) {
    return;
  }

  const active = getActivePlayerLabel(state.session.activePlayer, state.session.playerCount);

  if (state.cardRevealed && state.currentCard) {
    els.instruction.innerHTML = `
      <h3 class="instruction__title">Carta revelada</h3>
      <p class="instruction__body">Desliza la barra sobre la carta para ir leyendo de arriba a abajo. Aplica los efectos a <strong>${active}</strong>.</p>
    `;
    return;
  }

  els.instruction.innerHTML = `
    <h3 class="instruction__title">Mazo de eventos</h3>
    <p class="instruction__body">El mazo va en orden numérico (1–56+), <strong>sin barajar</strong>. Introduce el número y pulsa <strong>Ver</strong> para revelar la carta.</p>
  `;
}

function hideCard() {
  state.cardRevealed = false;
  state.currentCard = null;
  els.cardFigure.hidden = true;
  cardReveal?.hide();
  els.cardPlaceholder.hidden = false;
  els.cardNumber.textContent = "Sin revelar";
  els.btnZoom.disabled = true;
  updateRoleBanner();
  updateInstruction();
}

function setPendingNumber(deck, number) {
  const cards = getDeckCards(deck);
  if (cards.length === 0) {
    showToast("Este mazo no tiene cartas");
    return;
  }

  const targetNumber = clampNumber(number, cards.length);
  state.pendingNumber = targetNumber;
  state.currentDeck = deck;

  const deckKey = getDeckKey(deck);
  const deckState = getDeckState(deckKey, cards.length);
  deckState.lastNumber = targetNumber;
  persistState();

  hideCard();
  renderDeckUI(deck, targetNumber);
  updateDeckStatus();
  updateRoleBanner();
  updateInstruction();
}

function revealEvent(deck, number) {
  const cards = getDeckCards(deck);
  if (cards.length === 0) {
    showToast("Este mazo no tiene cartas");
    return;
  }

  const targetNumber = clampNumber(number, cards.length);
  const card = cards.find((item) => item.number === targetNumber);
  if (!card) {
    showToast(`No existe el evento #${targetNumber}`);
    return;
  }

  state.pendingNumber = targetNumber;
  state.currentDeck = deck;
  state.currentCard = card;
  state.cardRevealed = true;

  const deckKey = getDeckKey(deck);
  const deckState = getDeckState(deckKey, cards.length);
  deckState.lastNumber = targetNumber;
  persistState();

  renderDeckUI(deck, targetNumber);
  renderRevealedCard(deck, card);
  updateDeckStatus();
  updateRoleBanner();
  updateInstruction();
  refreshPlayBarHeight();

  if (state.fromMission) {
    showToast(`Evento #${targetNumber} revelado tras misión`);
    state.fromMission = false;
  }
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
      renderCampaignDecks();
      if (state.currentDeck?.id === MAIN_DECK_ID) {
        setupDeck(state.currentDeck, state.pendingNumber || 1);
      }
    });

    label.append(input, document.createTextNode(expansion.name));
    els.expansionList.append(label);
  }
}

function renderCampaignDecks() {
  const campaignDecks = getCampaignDecks();
  if (!els.campaignDeckList || !els.campaignDecksSection) {
    return;
  }

  els.campaignDeckList.innerHTML = "";
  const availableDecks = campaignDecks.filter((deck) => isDeckAvailable(deck));

  if (availableDecks.length === 0) {
    els.campaignDecksSection.hidden = true;
    return;
  }

  els.campaignDecksSection.hidden = false;

  for (const deck of availableDecks) {
    const cards = getDeckCards(deck);
    const deckState = getDeckState(getDeckKey(deck), cards.length);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn btn--secondary campaign-deck-btn";
    button.textContent = `${deck.name} (${cards.length})`;
    button.addEventListener("click", () => {
      setupDeck(deck, deckState.lastNumber || 1);
      els.panelSettings.setAttribute("hidden", "");
    });
    els.campaignDeckList.append(button);
  }
}

function setCardImage(card) {
  els.cardCaption.textContent = card.source;
  cardReveal?.setImage(card.image);
}

function openZoom() {
  if (!state.cardRevealed || !state.currentCard) {
    return;
  }
  els.zoomDialog.showModal();
}

function updateJumpControls(deck, number) {
  const cards = getDeckCards(deck);
  const totalCards = cards.length;

  els.jumpNumber.min = "1";
  els.jumpNumber.max = String(totalCards);
  els.jumpNumber.value = String(number);
  els.jumpHint.textContent = `${describeDeckSize(deck)} · del 1 al ${totalCards}`;

  els.btnPrev.disabled = number <= 1;
  els.btnNextNumber.disabled = number >= totalCards;

  const nextNumber = number + 1;
  if (nextNumber <= totalCards) {
    els.btnNext.hidden = false;
    els.btnNextLabel.textContent = String(nextNumber);
  } else {
    els.btnNext.hidden = true;
  }
}

function renderDeckUI(deck, number) {
  els.cardDeck.textContent = deck.name;
  els.cardRemaining.textContent = describeDeckSize(deck);
  els.cardExpansion.textContent = deck.expansion.name;
  updateJumpControls(deck, number);
}

function renderRevealedCard(deck, card) {
  els.cardNumber.textContent = `Evento #${card.number}`;
  els.cardFigure.hidden = false;
  els.cardPlaceholder.hidden = true;
  els.btnZoom.disabled = false;
  setCardImage(card);
  cardReveal?.show();
}

function updateDeckStatus() {
  if (!state.currentDeck) {
    els.deckStatus.textContent = "Mazo de eventos del juego.";
    return;
  }

  const cards = getDeckCards(state.currentDeck);
  if (state.cardRevealed && state.currentCard) {
    els.deckStatus.textContent = `${state.currentDeck.name}: evento #${state.currentCard.number} de ${cards.length}`;
    return;
  }

  els.deckStatus.textContent = `${state.currentDeck.name}: pendiente #${state.pendingNumber} de ${cards.length}`;
}

init().catch((error) => {
  document.body.innerHTML = `<main class="panel" style="margin:2rem auto; max-width:720px"><h2>Error</h2><p>${error.message}</p></main>`;
});
