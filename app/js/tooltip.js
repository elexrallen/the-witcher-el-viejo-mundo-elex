import { icon } from "./icons.js";

let activePopover = null;

export function initTooltips(root = document) {
  root.querySelectorAll(".help-btn").forEach((button) => {
    if (!button.innerHTML.trim()) {
      button.innerHTML = icon("help-circle", { size: 18 });
    }
  });

  root.querySelectorAll("[data-tip]").forEach((element) => {
    if (element.dataset.tipBound === "true") {
      return;
    }
    element.dataset.tipBound = "true";

    const text = element.dataset.tip;
    if (!text) {
      return;
    }

    if (isTouchUi()) {
      element.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (activePopover?.anchor === element) {
          closeTipPopover();
        } else {
          showTipPopover(element, text);
        }
      });
    }
  });

  if (!initTooltips.bound) {
    document.addEventListener("click", (event) => {
      if (
        activePopover &&
        !event.target.closest(".tip-popover, .help-btn, [data-tip]")
      ) {
        closeTipPopover();
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeTipPopover();
      }
    });
    initTooltips.bound = true;
  }
}

export function createHelpButton(tip, { label = "Ayuda" } = {}) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "help-btn";
  button.dataset.tip = tip;
  button.setAttribute("aria-label", label);
  button.innerHTML = icon("help-circle", { size: 18 });
  return button;
}

export function showTipPopover(anchor, text) {
  closeTipPopover();

  const popover = document.createElement("div");
  popover.className = "tip-popover";
  popover.setAttribute("role", "tooltip");
  popover.innerHTML = `
    <p class="tip-popover__text">${text}</p>
    <button type="button" class="tip-popover__close" aria-label="Cerrar">Cerrar</button>
  `;

  document.body.append(popover);
  popover.querySelector(".tip-popover__close")?.addEventListener("click", closeTipPopover);

  const rect = anchor.getBoundingClientRect();
  const margin = 12;
  const maxWidth = Math.min(360, window.innerWidth - margin * 2);
  popover.style.maxWidth = `${maxWidth}px`;

  let left = Math.min(
    Math.max(rect.left + rect.width / 2 - maxWidth / 2, margin),
    window.innerWidth - maxWidth - margin,
  );
  let top = rect.bottom + 8;

  if (top + popover.offsetHeight > window.innerHeight - margin) {
    top = Math.max(margin, rect.top - popover.offsetHeight - 8);
  }

  popover.style.left = `${left}px`;
  popover.style.top = `${top}px`;
  activePopover = { anchor, element: popover };
}

export function closeTipPopover() {
  activePopover?.element?.remove();
  activePopover = null;
}

function isTouchUi() {
  return window.matchMedia("(pointer: coarse)").matches;
}
