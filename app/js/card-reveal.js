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
  modal,
  onRevealChange,
}) {
  let reveal = 0;
  /** @type {'down' | 'up'} down = de arriba a abajo; up = de abajo a arriba */
  let direction = "down";

  const HINT_DOWN =
    "Desliza hacia abajo para revelar la carta de arriba a abajo.";
  const HINT_UP =
    "Desliza hacia abajo para revelar de abajo arriba (útil para la opción B).";

  const viewports = [
    { image, shade, line, slider, hint, directionButton, resetButton },
  ];

  if (modal?.image) {
    viewports.push({
      image: modal.image,
      shade: modal.shade ?? null,
      line: modal.line ?? null,
      slider: modal.slider ?? null,
      hint: modal.hint ?? null,
      directionButton: modal.directionButton ?? null,
      resetButton: modal.resetButton ?? null,
    });
  } else if (zoomImage) {
    viewports.push({ image: zoomImage, shade: null, line: null, slider: null, hint: null, directionButton: null, resetButton: null });
  }

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
    if (modal?.root) {
      modal.root.classList.toggle("card-reveal--from-bottom", direction === "up");
    }

    for (const viewport of viewports) {
      if (viewport.directionButton) {
        viewport.directionButton.setAttribute("aria-pressed", direction === "up" ? "true" : "false");
        viewport.directionButton.textContent = direction === "up" ? "↓" : "↑";
        viewport.directionButton.title =
          direction === "up"
            ? "Revelando desde abajo — pulsa para revelar desde arriba"
            : "Revelando desde arriba — pulsa para revelar desde abajo";
        viewport.directionButton.setAttribute(
          "aria-label",
          direction === "up" ? "Revelar desde arriba" : "Revelar desde abajo",
        );
      }
      if (viewport.hint) {
        viewport.hint.textContent = direction === "up" ? HINT_UP : HINT_DOWN;
      }
    }
  }

  function updateHintVisibility() {
    if (!root) {
      return;
    }
    root.classList.toggle("card-reveal--active", reveal > 0);
    root.classList.toggle("card-reveal--full", reveal >= 100);
    if (modal?.root) {
      modal.root.classList.toggle("card-reveal--active", reveal > 0);
      modal.root.classList.toggle("card-reveal--full", reveal >= 100);
    }
  }

  function paintViewport(viewport, clip) {
    if (!viewport.image) {
      return;
    }

    viewport.image.style.clipPath = clip;

    if (viewport.shade) {
      if (direction === "up") {
        viewport.shade.style.top = "0";
        viewport.shade.style.bottom = "auto";
        viewport.shade.style.height = `${100 - reveal}%`;
      } else {
        viewport.shade.style.top = `${reveal}%`;
        viewport.shade.style.bottom = "0";
        viewport.shade.style.height = "";
      }
    }

    if (viewport.line) {
      if (direction === "up") {
        viewport.line.style.top = `${100 - reveal}%`;
        viewport.line.style.bottom = "auto";
      } else {
        viewport.line.style.top = `${reveal}%`;
        viewport.line.style.bottom = "auto";
      }
      viewport.line.hidden = reveal <= 0;
    }

    if (viewport.slider) {
      viewport.slider.value = String(reveal);
      viewport.slider.setAttribute("aria-valuenow", String(reveal));
    }
  }

  function applyReveal(percent) {
    reveal = Math.min(100, Math.max(0, Math.round(percent)));
    const clip = getClipPath(reveal);

    for (const viewport of viewports) {
      paintViewport(viewport, clip);
    }

    updateHintVisibility();
    updateDirectionUI();
    onRevealChange?.(reveal);
  }

  function setDirection(nextDirection) {
    if (nextDirection !== "down" && nextDirection !== "up") {
      return;
    }
    if (nextDirection !== direction) {
      direction = nextDirection;
      applyReveal(0);
      return;
    }
    direction = nextDirection;
    applyReveal(reveal);
  }

  function toggleDirection() {
    setDirection(direction === "down" ? "up" : "down");
  }

  function bindViewportControls(viewport) {
    if (viewport.slider) {
      viewport.slider.addEventListener("input", () => {
        applyReveal(Number.parseInt(viewport.slider.value, 10));
      });
    }

    if (viewport.resetButton) {
      viewport.resetButton.addEventListener("click", (event) => {
        event.stopPropagation();
        applyReveal(0);
      });
    }

    if (viewport.directionButton) {
      viewport.directionButton.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleDirection();
      });
    }
  }

  for (const viewport of viewports) {
    bindViewportControls(viewport);
  }

  if (modal?.fullButton) {
    modal.fullButton.addEventListener("click", (event) => {
      event.stopPropagation();
      applyReveal(100);
    });
  }

  updateDirectionUI();

  return {
    setImage(src) {
      for (const viewport of viewports) {
        if (viewport.image) {
          viewport.image.src = src;
        }
      }
      applyReveal(0);
      for (const viewport of viewports) {
        if (viewport.hint) {
          viewport.hint.hidden = false;
        }
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

    setDirection,

    toggleDirection,

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

    openModal() {
      if (modal?.dialog) {
        modal.dialog.showModal();
      }
    },

    closeModal() {
      if (modal?.dialog) {
        modal.dialog.close();
      }
    },
  };
}
