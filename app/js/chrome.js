import { enhanceIconElements, icon } from "./icons.js";
import { initTooltips } from "./tooltip.js";
import { initPwa } from "./pwa.js";

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
  injectBottomNav(page);
  initCollapsibleSections();
  markSecondaryHints();
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
