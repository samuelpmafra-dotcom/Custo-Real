const CACHE_NAME = "custo-real-pwa-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./favicon.png",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Navegação: tenta cache primeiro, depois rede (melhor para modo app)
  if (req.mode === "navigate") {
    event.respondWith(
      caches.match("./index.html").then((cached) => cached || fetch(req).catch(() => cached))
    );
    return;
  }

  // Demais recursos: cache-first, fallback para rede
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
