/** Registro PWA: service worker + botón de instalación. */

let deferredInstallPrompt = null;

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function isIosSafari() {
  const ua = window.navigator.userAgent;
  return /iphone|ipad|ipod/i.test(ua) && !window.MSStream;
}

function getServiceWorkerUrl() {
  const manifest = document.querySelector('link[rel="manifest"]');
  if (manifest?.href) {
    return new URL("sw.js", manifest.href).href;
  }
  return new URL("sw.js", window.location.href).href;
}

export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register(getServiceWorkerUrl()).catch(() => {
      /* Sin HTTPS o navegador sin soporte completo */
    });
  });
}

function createInstallSection() {
  const section = document.createElement("section");
  section.id = "pwa-install-section";
  section.className = "pwa-install";
  section.hidden = true;
  section.innerHTML = `
    <h3>Instalar aplicación</h3>
    <p class="muted pwa-install__hint" id="pwa-install-hint">
      Instala el asistente en tu dispositivo para abrirlo a pantalla completa, como una app.
    </p>
    <button type="button" class="btn btn--primary" id="btn-pwa-install">Instalar app</button>
    <p class="muted pwa-install__ios" id="pwa-install-ios" hidden>
      En iPhone/iPad: pulsa <strong>Compartir</strong> en Safari y elige <strong>Añadir a pantalla de inicio</strong>.
    </p>
  `;
  return section;
}

function mountInstallSection() {
  if (document.getElementById("pwa-install-section")) {
    return;
  }

  const section = createInstallSection();
  const settings = document.getElementById("panel-settings");
  const home = document.getElementById("screen-home");

  if (settings) {
    settings.prepend(section);
  } else if (home) {
    const wrap = document.createElement("section");
    wrap.className = "pwa-install-wrap";
    wrap.append(section);
    home.append(wrap);
  } else {
    return;
  }

  document.getElementById("btn-pwa-install")?.addEventListener("click", async () => {
    if (!deferredInstallPrompt) {
      return;
    }
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    updateInstallVisibility();
  });
}

function updateInstallVisibility() {
  const section = document.getElementById("pwa-install-section");
  const iosHint = document.getElementById("pwa-install-ios");
  const installBtn = document.getElementById("btn-pwa-install");
  if (!section) {
    return;
  }

  if (isStandalone()) {
    section.hidden = true;
    return;
  }

  if (deferredInstallPrompt) {
    section.hidden = false;
    if (iosHint) iosHint.hidden = true;
    if (installBtn) installBtn.hidden = false;
    return;
  }

  if (isIosSafari()) {
    section.hidden = false;
    if (iosHint) iosHint.hidden = false;
    if (installBtn) installBtn.hidden = true;
    return;
  }

  section.hidden = true;
}

export function initPwaInstallUi() {
  mountInstallSection();

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    updateInstallVisibility();
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    updateInstallVisibility();
  });

  updateInstallVisibility();
}

export function initPwa() {
  registerServiceWorker();
  initPwaInstallUi();
}
