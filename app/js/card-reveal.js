/**
 * Revelado progresivo de cartas: de arriba abajo o de abajo arriba.
 */
export function initCardReveal({
  root,
  image,
  shade,
  line,
  slider,
  hint,
  resetButton,
  directionButton,
  zoomImage,
  onRevealChange,
}) {
  let reveal = 0;
  /** @type {'down' | 'up'} down = de arriba a abajo; up = de abajo a arriba */
  let direction = "down";

  const HINT_DOWN =
    "Desliza la barra hacia abajo para revelar la carta de arriba a abajo.";
  const HINT_UP =
    "Desliza la barra hacia abajo para revelar de abajo arriba (útil para la opción B).";

  function getClipPath(percent = reveal) {
    if (percent >= 100) {
      return "none";
    }
    if (direction === "up") {
      return `inset(${100 - percent}% 0 0 0)`;
    }
    return `inset(0 0 ${100 - percent}% 0)`;
  }

  function updateDirectionUI() {
    if (root) {
      root.classList.toggle("card-reveal--from-bottom", direction === "up");
    }
    if (directionButton) {
      directionButton.setAttribute("aria-pressed", direction === "up" ? "true" : "false");
      directionButton.title =
        direction === "up"
          ? "Revelando desde abajo — pulsa para revelar desde arriba"
          : "Revelando desde arriba — pulsa para revelar desde abajo";
      directionButton.setAttribute(
        "aria-label",
        direction === "up" ? "Revelar desde arriba" : "Revelar desde abajo",
      );
    }
    if (hint && !root?.classList.contains("card-reveal--active")) {
      hint.textContent = direction === "up" ? HINT_UP : HINT_DOWN;
    }
  }

  function updateHintVisibility() {
    if (!root) {
      return;
    }
    root.classList.toggle("card-reveal--active", reveal > 0);
    root.classList.toggle("card-reveal--full", reveal >= 100);
  }

  function applyReveal(percent) {
    reveal = Math.min(100, Math.max(0, Math.round(percent)));
    const clip = getClipPath(reveal);

    if (shade) {
      if (direction === "up") {
        shade.style.top = "0";
        shade.style.bottom = "auto";
        shade.style.height = `${100 - reveal}%`;
      } else {
        shade.style.top = `${reveal}%`;
        shade.style.bottom = "0";
        shade.style.height = "";
      }
    }

    if (line) {
      if (direction === "up") {
        line.style.top = `${100 - reveal}%`;
        line.style.bottom = "auto";
      } else {
        line.style.top = `${reveal}%`;
        line.style.bottom = "auto";
      }
      line.hidden = reveal <= 0;
    }

    image.style.clipPath = clip;
    if (zoomImage) {
      zoomImage.style.clipPath = clip;
    }

    if (slider) {
      slider.value = String(reveal);
      slider.setAttribute("aria-valuenow", String(reveal));
    }

    updateHintVisibility();
    onRevealChange?.(reveal);
  }

  if (slider) {
    slider.addEventListener("input", () => {
      applyReveal(Number.parseInt(slider.value, 10));
    });
  }

  if (resetButton) {
    resetButton.addEventListener("click", (event) => {
      event.stopPropagation();
      applyReveal(0);
    });
  }

  if (directionButton) {
    directionButton.addEventListener("click", (event) => {
      event.stopPropagation();
      setDirection(direction === "down" ? "up" : "down");
    });
  }

  updateDirectionUI();

  return {
    setImage(src) {
      image.src = src;
      if (zoomImage) {
        zoomImage.src = src;
      }
      applyReveal(0);
      if (hint) {
        hint.hidden = false;
        hint.textContent = direction === "up" ? HINT_UP : HINT_DOWN;
      }
    },

    setReveal(percent) {
      applyReveal(percent);
    },

    reset() {
      applyReveal(0);
    },

    revealAll() {
      applyReveal(100);
    },

    getReveal() {
      return reveal;
    },

    getClipPath() {
      return getClipPath(reveal);
    },

    getDirection() {
      return direction;
    },

    setDirection(nextDirection) {
      if (nextDirection !== "down" && nextDirection !== "up") {
        return;
      }
      direction = nextDirection;
      updateDirectionUI();
      applyReveal(reveal);
    },

    show() {
      if (root) {
        root.hidden = false;
      }
    },

    hide() {
      if (root) {
        root.hidden = true;
      }
      applyReveal(0);
    },

    isVisible() {
      return Boolean(root && !root.hidden);
    },
  };
}
