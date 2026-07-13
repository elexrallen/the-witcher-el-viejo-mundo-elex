/** Registro del service worker compartido (manifest en la raíz de app/). */

function getServiceWorkerUrl(): string {
  const manifest = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
  if (manifest?.href) {
    return new URL("sw.js", manifest.href).href;
  }
  return new URL("../sw.js", window.location.href).href;
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(getServiceWorkerUrl()).catch(() => {
      /* localhost sin HTTPS o scope no válido */
    });
  });
}
