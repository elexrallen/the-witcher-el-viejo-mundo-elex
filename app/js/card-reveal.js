/**
 * Revelado progresivo de cartas: desliza la barra vertical hacia abajo mientras lees.
 */
export function initCardReveal({
  root,
  image,
  shade,
  line,
  slider,
  hint,
  resetButton,
  zoomImage,
}) {
  let reveal = 0;

  function updateHintVisibility() {
    if (!root) {
      return;
    }
    root.classList.toggle("card-reveal--active", reveal > 0);
    root.classList.toggle("card-reveal--full", reveal >= 100);
  }

  function applyReveal(percent) {
    reveal = Math.min(100, Math.max(0, Math.round(percent)));
    const hiddenBottom = 100 - reveal;

    if (shade) {
      shade.style.top = `${reveal}%`;
    }
    if (line) {
      line.style.top = `${reveal}%`;
      line.hidden = reveal <= 0;
    }

    const clip = reveal >= 100 ? "none" : `inset(0 0 ${hiddenBottom}% 0)`;
    image.style.clipPath = clip;
    if (zoomImage) {
      zoomImage.style.clipPath = clip;
    }

    if (slider) {
      slider.value = String(reveal);
      slider.setAttribute("aria-valuenow", String(reveal));
    }

    updateHintVisibility();
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

  return {
    setImage(src) {
      image.src = src;
      if (zoomImage) {
        zoomImage.src = src;
      }
      applyReveal(0);
      if (hint) {
        hint.hidden = false;
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
