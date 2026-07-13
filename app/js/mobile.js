/**
 * Ajustes de experiencia para pantallas táctiles y móvil.
 */
export function initMobileUX() {
  const isMobile = window.matchMedia("(max-width: 640px)").matches;

  if (isMobile) {
    collapseInstructionsByDefault();
    document.documentElement.classList.add("is-mobile");
  }

  if (window.matchMedia("(pointer: coarse)").matches) {
    document.documentElement.classList.add("is-touch");
  }

  updatePlayBarHeight();
  window.addEventListener("resize", updatePlayBarHeight, { passive: true });
}

function collapseInstructionsByDefault() {
  document.querySelectorAll(".instruction-toggle").forEach((button) => {
    const panel = button.parentElement?.querySelector(".instruction");
    if (!panel || panel.classList.contains("instruction--collapsed")) {
      return;
    }

    panel.classList.add("instruction--collapsed");
    button.setAttribute("aria-expanded", "false");
    button.textContent = "Mostrar guía";
  });
}

function updatePlayBarHeight() {
  const playBar = document.querySelector(".play-bar--visible, .play-bar.play-bar--visible");
  const bar = playBar || document.getElementById("play-bar");
  if (!bar) {
    return;
  }

  const height = bar.getBoundingClientRect().height;
  document.documentElement.style.setProperty("--play-bar-h", `${Math.ceil(height)}px`);
}

export function refreshPlayBarHeight() {
  requestAnimationFrame(updatePlayBarHeight);
}
