import { enhanceIconElements } from "./icons.js";
import { showToast } from "./ui.js";

/**
 * Botón «Deshacer» en la cabecera + atajo Ctrl/Cmd+Z.
 */
export function initUndoButton({ undoStack, onUndo }) {
  let button = document.getElementById("btn-undo");
  if (!button) {
    const headerActions = document.querySelector(".header__actions");
    const settingsButton = document.getElementById("btn-settings");
    if (!headerActions) {
      return { refresh() {} };
    }

    button = document.createElement("button");
    button.type = "button";
    button.className = "btn btn--ghost btn--icon-label undo-btn";
    button.id = "btn-undo";
    button.setAttribute("aria-label", "Deshacer");
    button.disabled = true;
    button.innerHTML = `
      <span data-icon="undo" data-icon-size="22" aria-hidden="true"></span>
      <span class="hide-on-mobile-tip undo-btn__label">Deshacer</span>
    `;
    headerActions.insertBefore(button, settingsButton ?? null);
    enhanceIconElements(button);
  }

  function refresh() {
    const canUndo = undoStack.canUndo();
    button.disabled = !canUndo;
    const label = undoStack.peekLabel();
    button.title = canUndo && label ? `Deshacer: ${label}` : "Nada que deshacer";
  }

  button.addEventListener("click", () => {
    if (!undoStack.canUndo()) {
      return;
    }
    const label = onUndo();
    if (label) {
      showToast(`Deshecho: ${label}`);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.defaultPrevented) {
      return;
    }
    const key = event.key.toLowerCase();
    if ((event.ctrlKey || event.metaKey) && key === "z" && !event.shiftKey) {
      if (!undoStack.canUndo()) {
        return;
      }
      event.preventDefault();
      const label = onUndo();
      if (label) {
        showToast(`Deshecho: ${label}`);
      }
    }
  });

  undoStack.subscribe(refresh);
  refresh();

  return { refresh };
}
