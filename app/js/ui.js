export function showToast(message, duration = 2600) {
  let toast = document.getElementById("app-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "app-toast";
    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.append(toast);
  }

  toast.textContent = message;
  toast.classList.add("toast--visible");
  window.clearTimeout(showToast._timer);
  showToast._timer = window.setTimeout(() => {
    toast.classList.remove("toast--visible");
  }, duration);
}

export function setPlayMode(active) {
  document.body.classList.toggle("play-mode", active);
}

export function updateProgress(element, remaining, total) {
  if (!element) {
    return;
  }

  const safeTotal = Math.max(total, 1);
  const used = safeTotal - remaining;
  const percent = Math.round((used / safeTotal) * 100);
  element.hidden = false;
  element.innerHTML = `
    <div class="deck-progress__labels">
      <span>${remaining} restantes</span>
      <span>${used}/${safeTotal} vistas</span>
    </div>
    <div class="deck-progress__track" aria-hidden="true">
      <div class="deck-progress__fill" style="width: ${percent}%"></div>
    </div>
  `;
}

export function hideProgress(element) {
  if (element) {
    element.hidden = true;
  }
}

import { icon } from "./icons.js";

let instructionCollapsedByUser = false;

export function bindInstructionToggle(button, panel) {
  if (!button || !panel) {
    return;
  }

  const setLabel = (collapsed) => {
    button.setAttribute("aria-expanded", String(!collapsed));
    const isMobile = window.matchMedia("(max-width: 640px)").matches;
    if (isMobile) {
      button.innerHTML = `${icon("book", { size: 16 })}<span class="instruction-toggle__text">${collapsed ? "Guía" : "Ocultar"}</span>`;
      return;
    }
    button.textContent = collapsed ? "Mostrar guía" : "Ocultar guía";
  };

  button.addEventListener("click", () => {
    const collapsed = panel.classList.toggle("instruction--collapsed");
    instructionCollapsedByUser = collapsed;
    setLabel(collapsed);
  });

  setLabel(panel.classList.contains("instruction--collapsed"));
}

export function shouldAutoExpandInstruction() {
  return !instructionCollapsedByUser;
}

export function expandInstruction(panel, button) {
  if (!panel) {
    return;
  }
  panel.classList.remove("instruction--collapsed");
  if (button) {
    button.setAttribute("aria-expanded", "true");
    const isMobile = window.matchMedia("(max-width: 640px)").matches;
    if (isMobile) {
      button.innerHTML = `${icon("book", { size: 16 })}<span class="instruction-toggle__text">Ocultar</span>`;
    } else {
      button.textContent = "Ocultar guía";
    }
  }
}

export function isMobileViewport() {
  return window.matchMedia("(max-width: 640px)").matches;
}

export function renderRoleBanner(element, { role, player, detail }) {
  if (!element) {
    return;
  }

  element.hidden = false;
  element.innerHTML = `
    <div class="role-banner__role">${role}</div>
    <div class="role-banner__main">
      <span class="role-banner__player">${player}</span>
      <span class="role-banner__detail">${detail}</span>
    </div>
  `;
}

export function bindTapToZoom(image, canZoom, openZoom) {
  if (!image) {
    return;
  }

  image.addEventListener("click", () => {
    if (canZoom()) {
      openZoom();
    }
  });
}
