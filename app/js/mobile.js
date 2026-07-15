/**
 * Ajustes de experiencia para pantallas táctiles y móvil.
 */
import { icon } from "./icons.js";

export function initMobileUX() {
  const mq = window.matchMedia("(max-width: 640px)");

  const applyMobileClass = () => {
    if (mq.matches) {
      collapseInstructionsByDefault();
      document.documentElement.classList.add("is-mobile");
    } else {
      document.documentElement.classList.remove("is-mobile");
    }
  };

  applyMobileClass();
  mq.addEventListener("change", applyMobileClass);

  if (window.matchMedia("(pointer: coarse)").matches) {
    document.documentElement.classList.add("is-touch");
  }

  refreshMobileChrome();
  window.addEventListener("resize", refreshMobileChrome, { passive: true });
}

function collapseInstructionsByDefault() {
  document.querySelectorAll(".instruction-toggle").forEach((button) => {
    const panel = button.parentElement?.querySelector(".instruction");
    if (!panel || panel.classList.contains("instruction--collapsed")) {
      return;
    }

    panel.classList.add("instruction--collapsed");
    button.setAttribute("aria-expanded", "false");
    button.innerHTML = `${icon("book", { size: 16 })}<span class="instruction-toggle__text">Guía</span>`;
  });
}

function updatePlayBarHeight() {
  const playBar = document.querySelector(".play-bar--visible, .play-bar.play-bar--visible");
  const bar = playBar || document.getElementById("play-bar");
  if (!bar) {
    return;
  }

  const visible = bar.classList.contains("play-bar--visible") || !bar.hasAttribute("hidden");
  if (!visible) {
    document.documentElement.style.setProperty("--play-bar-h", "0px");
    return;
  }

  const height = bar.getBoundingClientRect().height;
  document.documentElement.style.setProperty("--play-bar-h", `${Math.ceil(height)}px`);
}

function updateBottomNavHeight() {
  const nav = document.querySelector(".bottom-nav");
  if (!nav || !window.matchMedia("(max-width: 640px)").matches) {
    document.documentElement.style.setProperty("--bottom-nav-h", "0px");
    return;
  }

  const height = nav.getBoundingClientRect().height;
  document.documentElement.style.setProperty("--bottom-nav-h", `${Math.ceil(height)}px`);
}

function updateHeaderHeight() {
  const header = document.querySelector(".header");
  if (!header) {
    return;
  }

  const height = header.getBoundingClientRect().height;
  document.documentElement.style.setProperty("--header-h", `${Math.ceil(height)}px`);
}

export function refreshMobileChrome() {
  requestAnimationFrame(() => {
    updatePlayBarHeight();
    updateBottomNavHeight();
    updateHeaderHeight();
  });
}

export function refreshPlayBarHeight() {
  refreshMobileChrome();
}
