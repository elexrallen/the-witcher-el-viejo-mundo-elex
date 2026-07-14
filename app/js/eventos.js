import { initCardReveal } from "./card-reveal.js";
import { initMobileUX, refreshPlayBarHeight } from "./mobile.js";
import { initAppChrome } from "./chrome.js";
import { enhanceIconElements } from "./icons.js";
import {
  loadActiveExpansions,
  migrateLegacyExpansions,
  saveActiveExpansions,
} from "./expansions.js";
import {
  addCard,
  clearAllStash,
  clearStashForPlayer,
  getCardsForPlayer,
  getStashCount,
  hasCard,
  makeCardId,
  removeCard,
} from "./event-stash.js";
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
import { initPlayerSetup } from "./player-setup.js";

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
  decks: {},
  stashViewPlayer: 1,
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
  btnRevealDirection: document.getElementById("btn-reveal-direction"),
  cardPlaceholder: document.getElementById("card-placeholder"),
  eventJump: document.getElementById("event-jump"),
  jumpNumber: document.getElementById("jump-number"),
  jumpHint: document.getElementById("jump-hint"),
  btnPrev: document.getElementById("btn-prev"),
  btnNextNumber: document.getElementById("btn-next-number"),
  playBar: document.getElementById("play-bar"),
  btnZoom: document.getElementById("btn-zoom"),
  btnNext: document.getElementById("btn-next"),
  btnNextLabel: document.getElementById("btn-next-label"),
  zoomDialog: document.getElementById("zoom-dialog"),
  zoomImage: document.getElementById("zoom-image"),
  btnCloseZoom: document.getElementById("btn-close-zoom"),
  eventPersistent: document.getElementById("event-persistent"),
  eventPersistentBanner: document.getElementById("event-persistent-banner"),
  eventPersistentActions: document.getElementById("event-persistent-actions"),
  btnOpenStash: document.getElementById("btn-open-stash"),
  btnStashChip: document.getElementById("btn-stash-chip"),
  stashChipCount: document.getElementById("stash-chip-count"),
  stashDialog: document.getElementById("stash-dialog"),
  stashList: document.getElementById("stash-list"),
  stashPlayerTabs: document.getElementById("stash-player-tabs"),
  btnCloseStash: document.getElementById("btn-close-stash"),
  btnClearStashActive: document.getElementById("btn-clear-stash-active"),
  btnClearStashAll: document.getElementById("btn-clear-stash-all"),
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
    directionButton: els.btnRevealDirection,
    zoomImage: els.zoomImage,
    onRevealChange: () => {
      if (state.cardRevealed) {
        renderStashActions();
      }
    },
  });
  loadPersistedState();

  const params = new URLSearchParams(window.location.search);
  const eventParam = Number.parseInt(params.get("event") || "", 10);

  const mainDeck = getMainDeck();
  if (!mainDeck) {
    throw new Error("No se encontró el mazo principal de eventos.");
  }

  state.currentDeck = state.data.decks.find((deck) => deck.id === state.currentDeck?.id) || mainDeck;
  renderExpansions();
  renderCampaignDecks();
  initPlayerSetup({
    playerCountEl: els.playerCount,
    activePlayerEl: els.activePlayer,
    drawerHintEl: els.drawerHint,
    onChange: (session) => {
      state.session = session;
      state.stashViewPlayer = session.activePlayer;
      updateRoleBanner();
      updateInstruction();
      renderStashActions();
      updateStashIndicators();
      if (els.stashDialog?.open) {
        renderStashPanel();
      }
    },
  });
  bindEvents();
  initMobileUX();
  initAppChrome({ page: "eventos" });
  enhanceIconElements();
  setPlayMode(true);
  els.playBar.classList.add("play-bar--visible");
  refreshPlayBarHeight();

  const deckKey = getDeckKey(state.currentDeck);
  const deckState = getDeckState(deckKey, getDeckCards(state.currentDeck).length);
  const initialNumber = Number.isNaN(eventParam) ? (deckState.lastNumber || 1) : eventParam;
  setupDeck(state.currentDeck, initialNumber);
  updateRoleBanner();
  updateInstruction();
  updateStashIndicators();

  if (!Number.isNaN(eventParam)) {
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
  import("./saved-games.js").then(({ syncActiveGame, setLastMode }) => {
    setLastMode("eventos");
    syncActiveGame();
  });
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

  els.btnResetAll.addEventListener("click", () => {
    state.decks = {};
    state.currentDeck = getMainDeck();
    persistState();
    setupDeck(state.currentDeck, 1);
    showToast("Todos los mazos reiniciados");
  });

  els.btnClearStashActive?.addEventListener("click", () => {
    const active = getActivePlayerLabel(state.session.activePlayer, state.session.playerCount);
    if (!window.confirm(`¿Vaciar las cartas en mesa de ${active}?`)) {
      return;
    }
    if (clearStashForPlayer(state.session.activePlayer)) {
      showToast("Cartas en mesa vaciadas");
      renderStashActions();
      updateStashIndicators();
      if (els.stashDialog?.open) {
        renderStashPanel();
      }
    } else {
      showToast("No hay cartas en mesa");
    }
  });

  els.btnClearStashAll?.addEventListener("click", () => {
    if (!window.confirm("¿Vaciar las cartas en mesa de todos los jugadores?")) {
      return;
    }
    if (clearAllStash()) {
      showToast("Cartas en mesa vaciadas");
      renderStashActions();
      updateStashIndicators();
      if (els.stashDialog?.open) {
        renderStashPanel();
      }
    } else {
      showToast("No hay cartas en mesa");
    }
  });

  els.btnOpenStash?.addEventListener("click", openStashPanel);
  els.btnStashChip?.addEventListener("click", openStashPanel);
  els.btnCloseStash?.addEventListener("click", () => els.stashDialog?.close());
  els.stashDialog?.addEventListener("click", (event) => {
    if (event.target === els.stashDialog) {
      els.stashDialog.close();
    }
  });

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

  const detail = "Busca la carta por número en el mazo ordenado (no barajado).";

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
      <p class="instruction__body">Desliza la barra para leer la carta. Pulsa ↑ junto a la barra para revelar de abajo arriba. Aplica los efectos a <strong>${active}</strong>.</p>
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
  hidePersistentActions();
  updateRoleBanner();
  updateInstruction();
}

function hidePersistentActions() {
  if (els.eventPersistent) {
    els.eventPersistent.hidden = true;
  }
  if (els.eventPersistentBanner) {
    els.eventPersistentBanner.innerHTML = "";
  }
  if (els.eventPersistentActions) {
    els.eventPersistentActions.innerHTML = "";
  }
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
  if (els.zoomImage) {
    els.zoomImage.style.clipPath = cardReveal?.getClipPath?.() ?? "none";
    els.zoomImage.alt = `Evento #${state.currentCard.number}`;
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
  els.jumpHint.dataset.tip = els.jumpHint.textContent;

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
  renderStashActions();
}

function isCardFullyRevealed() {
  return (cardReveal?.getReveal?.() ?? 0) >= 100;
}

function buildStashCardMeta(deck, card) {
  const deckKey = getDeckKey(deck);
  return {
    id: makeCardId(deckKey, card.card_id),
    cardId: card.card_id,
    deckKey,
    number: card.number,
    label: `Evento #${card.number}`,
    type: "event",
    image: card.image,
  };
}

function renderStashActions() {
  hidePersistentActions();
  if (!state.cardRevealed || !state.currentCard || !state.currentDeck) {
    return;
  }

  const activePlayer = state.session.activePlayer;
  const activeLabel = getActivePlayerLabel(activePlayer, state.session.playerCount);
  const stashMeta = buildStashCardMeta(state.currentDeck, state.currentCard);
  const alreadyInStash = hasCard(activePlayer, stashMeta.id);
  const fullyRevealed = isCardFullyRevealed();

  els.eventPersistentBanner.innerHTML = `
    <span class="event-persistent__type-badge" data-icon="stash" data-icon-size="18" aria-hidden="true"></span>
    <span><strong>Evento #${state.currentCard.number}</strong></span>
  `;

  if (alreadyInStash) {
    els.eventPersistentActions.innerHTML = `
      <p class="event-persistent__status muted">Ya en mesa de ${activeLabel}.</p>
      <button type="button" class="btn btn--secondary btn--icon-label" data-action="open-stash">
        <span data-icon="stash" data-icon-size="18" aria-hidden="true"></span>
        Ver en inventario
      </button>
    `;
  } else if (!fullyRevealed) {
    els.eventPersistentActions.innerHTML = `
      <button type="button" class="btn btn--primary btn--icon-label" data-action="add-stash" disabled>
        <span data-icon="stash" data-icon-size="18" aria-hidden="true"></span>
        Añadir a cartas en mesa
      </button>
      <p class="event-persistent__hint muted">Revela la carta por completo para poder añadirla.</p>
    `;
  } else {
    els.eventPersistentActions.innerHTML = `
      <button type="button" class="btn btn--primary btn--icon-label" data-action="add-stash">
        <span data-icon="stash" data-icon-size="18" aria-hidden="true"></span>
        Añadir a cartas en mesa
      </button>
      <p class="event-persistent__hint muted">Se asignará a ${activeLabel}.</p>
    `;
  }

  els.eventPersistent.hidden = false;
  enhanceIconElements(els.eventPersistent);

  els.eventPersistentActions.querySelector("[data-action='add-stash']")?.addEventListener("click", () => {
    if (!isCardFullyRevealed()) {
      showToast("Revela la carta por completo antes de añadirla");
      return;
    }
    if (addCard(activePlayer, stashMeta)) {
      showToast(`Añadido a cartas en mesa (${activeLabel})`);
      renderStashActions();
      updateStashIndicators();
    }
  });

  els.eventPersistentActions.querySelector("[data-action='open-stash']")?.addEventListener("click", openStashPanel);
}

function updateStashIndicators() {
  const count = getStashCount(state.session.activePlayer);
  if (els.stashChipCount) {
    els.stashChipCount.textContent = String(count);
  }
  if (els.btnStashChip) {
    els.btnStashChip.hidden = count === 0;
  }
}

function openStashPanel() {
  state.stashViewPlayer = state.session.activePlayer;
  renderStashPanel();
  els.stashDialog?.showModal();
  refreshPlayBarHeight();
}

function renderStashPlayerTabs() {
  if (!els.stashPlayerTabs) {
    return;
  }

  const count = state.session.playerCount;
  if (count <= 1) {
    els.stashPlayerTabs.hidden = true;
    els.stashPlayerTabs.innerHTML = "";
    state.stashViewPlayer = 1;
    return;
  }

  els.stashPlayerTabs.hidden = false;
  els.stashPlayerTabs.innerHTML = "";

  for (let player = 1; player <= count; player += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "event-stash__tab";
    if (player === state.stashViewPlayer) {
      button.classList.add("event-stash__tab--active");
    }
    const cardCount = getStashCount(player);
    button.textContent = `Jugador ${player} (${cardCount})`;
    button.addEventListener("click", () => {
      state.stashViewPlayer = player;
      renderStashPanel();
    });
    els.stashPlayerTabs.append(button);
  }
}

function renderStashPanel() {
  if (!els.stashList) {
    return;
  }

  renderStashPlayerTabs();
  const cards = getCardsForPlayer(state.stashViewPlayer);
  els.stashList.innerHTML = "";

  if (cards.length === 0) {
    els.stashList.innerHTML = `<p class="event-stash__empty muted">Aún no tienes cartas en mesa.</p>`;
    return;
  }

  const list = document.createElement("ul");
  list.className = "event-stash__items";

  for (const item of [...cards].sort((a, b) => a.number - b.number)) {
    const li = document.createElement("li");
    li.className = "event-stash__item";
    li.innerHTML = `
      <img class="event-stash__thumb" src="${item.image}" alt="" loading="lazy" width="40" height="56">
      <div class="event-stash__meta">
        <span class="event-stash__label">Evento #${item.number}</span>
      </div>
      <div class="event-stash__actions">
        <button type="button" class="btn btn--secondary btn--icon-label" data-action="view" data-id="${item.id}" aria-label="Ver evento #${item.number}">
          <span data-icon="eye" data-icon-size="16" aria-hidden="true"></span>
          <span class="event-stash__btn-label">Ver</span>
        </button>
        <button type="button" class="btn btn--ghost btn--icon-label" data-action="remove" data-id="${item.id}" aria-label="Quitar evento #${item.number}">
          <span data-icon="trash" data-icon-size="16" aria-hidden="true"></span>
          <span class="event-stash__btn-label">Quitar</span>
        </button>
      </div>
    `;
    list.append(li);
  }

  els.stashList.append(list);

  enhanceIconElements(els.stashList);

  els.stashList.querySelectorAll("[data-action='view']").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.id;
      const item = cards.find((card) => card.id === id);
      if (item) {
        openStashCardView(item);
      }
    });
  });

  els.stashList.querySelectorAll("[data-action='remove']").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.id;
      if (removeCard(state.stashViewPlayer, id)) {
        showToast("Carta quitada de la mesa");
        renderStashActions();
        updateStashIndicators();
        renderStashPanel();
      }
    });
  });
}

function openStashCardView(item) {
  if (!els.zoomImage || !els.zoomDialog) {
    return;
  }
  els.zoomImage.src = item.image;
  els.zoomImage.style.clipPath = "none";
  els.zoomImage.alt = `Evento #${item.number}`;
  els.zoomDialog.showModal();
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
