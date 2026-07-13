/**
 * Service worker — caché offline del asistente de mesa.
 * Permite instalación como PWA en navegadores compatibles.
 */
const CACHE_NAME = "witcher-assistant-v3";

const APP_SHELL = [
  "./",
  "./index.html",
  "./exploracion.html",
  "./eventos.html",
  "./css/styles.css",
  "./js/chrome.js",
  "./js/pwa.js",
  "./js/icons.js",
  "./js/home.js",
  "./manifest.webmanifest",
  "./favicon.png",
  "./icon-192.png",
  "./icon-512.png",
  "./automa/",
  "./automa/index.html",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);

      return cached || network;
    })
  );
});
