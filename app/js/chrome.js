import { enhanceIconElements, icon } from "./icons.js";
import { initTooltips } from "./tooltip.js";
import { initPwa } from "./pwa.js";
import { getActiveGame } from "./saved-games.js";

const NAV_ITEMS = [
  { id: "home", href: "index.html", label: "Inicio", icon: "home" },
  { id: "exploracion", href: "exploracion.html", label: "Explorar", icon: "map" },
  { id: "eventos", href: "eventos.html", label: "Eventos", icon: "scroll" },
  { id: "automa", href: "automa/", label: "Automa", icon: "automa" },
];

export function initAppChrome({ page }) {
  enhanceIconElements();
  initTooltips();
  initPwa();
  upgradeSettingsButton();
  injectActiveGameChip(page);
  injectNoGameBanner(page);
  injectBottomNav(page);
  initCollapsibleSections();
  markSecondaryHints();
}

function getHomeHref(page) {
  if (page === "home") {
    return "index.html";
  }
  if (page === "automa") {
    return "../index.html";
  }
  return "index.html";
}

function injectActiveGameChip(page) {
  const headerActions = document.querySelector(".header__actions");
  if (!headerActions || document.getElementById("active-game-chip")) {
    return;
  }

  const active = getActiveGame();
  if (!active) {
    return;
  }

  const homeHref = getHomeHref(page);
  const link = document.createElement("a");
  link.id = "active-game-chip";
  link.className = "btn btn--ghost btn--icon-label active-game-chip";
  link.href = homeHref;
  link.title = "Ir a partidas guardadas";
  link.innerHTML = `
    <span data-icon="layers" data-icon-size="18" aria-hidden="true"></span>
    <span class="active-game-chip__label">${active.name}</span>
  `;
  headerActions.prepend(link);
  enhanceIconElements(link);
}

function injectNoGameBanner(page) {
  if (page === "home" || getActiveGame()) {
    return;
  }

  const main = document.querySelector(".main");
  if (!main || document.getElementById("no-game-banner")) {
    return;
  }

  const homeHref = getHomeHref(page);
  const banner = document.createElement("div");
  banner.id = "no-game-banner";
  banner.className = "no-game-banner panel panel--inline";
  banner.innerHTML = `
    <p>No hay partida activa. <a href="${homeHref}">Crea o carga una partida</a> en Inicio para guardar tu progreso.</p>
  `;
  main.prepend(banner);
}

function upgradeSettingsButton() {
  const button = document.getElementById("btn-settings");
  if (!button) {
    return;
  }
  if (button.dataset.icon) {
    return;
  }
  button.dataset.iconReady = "true";
  button.innerHTML = icon("settings", { size: 22 });
}

function injectBottomNav(activePage) {
  if (!window.matchMedia("(max-width: 640px)").matches) {
    return;
  }

  if (document.querySelector(".bottom-nav")) {
    return;
  }

  const nav = document.createElement("nav");
  nav.className = "bottom-nav";
  nav.setAttribute("aria-label", "Navegación principal");

  for (const item of NAV_ITEMS) {
    const link = document.createElement("a");
    link.href = item.href;
    link.className = "bottom-nav__item";
    link.dataset.page = item.id;
    if (item.id === activePage) {
      link.classList.add("bottom-nav__item--active");
      link.setAttribute("aria-current", "page");
    }
    link.innerHTML = `
      <span class="bottom-nav__icon" data-icon="${item.icon}" data-icon-size="22"></span>
      <span class="bottom-nav__label">${item.label}</span>
    `;
    nav.append(link);
  }

  document.body.append(nav);
  document.body.classList.add("has-bottom-nav");
  enhanceIconElements(nav);

  import("./mobile.js").then(({ refreshMobileChrome }) => refreshMobileChrome());
}

function initCollapsibleSections() {
  document.querySelectorAll("[data-collapsible]").forEach((section) => {
    if (section.dataset.collapsibleReady === "true") {
      return;
    }
    section.dataset.collapsibleReady = "true";

    const title = section.querySelector("[data-collapsible-title]");
    const body = section.querySelector("[data-collapsible-body]");
    if (!title || !body) {
      return;
    }

    const collapsedByDefault =
      section.dataset.collapsibleDefault === "collapsed" ||
      (window.matchMedia("(max-width: 640px)").matches &&
        section.dataset.collapsibleDefault !== "open");

    title.classList.add("collapsible__trigger");
    body.classList.add("collapsible__body");
    if (collapsedByDefault) {
      section.classList.add("collapsible--collapsed");
      title.setAttribute("aria-expanded", "false");
    } else {
      title.setAttribute("aria-expanded", "true");
    }

    title.addEventListener("click", () => {
      const collapsed = section.classList.toggle("collapsible--collapsed");
      title.setAttribute("aria-expanded", String(!collapsed));
    });
  });
}

function markSecondaryHints() {
  document.querySelectorAll(".hide-on-mobile-tip").forEach((element) => {
    if (window.matchMedia("(max-width: 640px)").matches) {
      element.hidden = true;
    }
  });
}
