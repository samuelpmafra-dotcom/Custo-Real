// Troque a versão quando publicar mudanças (isso força o app a atualizar)
const CACHE_NAME = "custo-real-pwa-v2";

// Base do GitHub Pages (repo)
const BASE = "/Custo-Real/";

// Arquivos essenciais (use caminhos absolutos com BASE)
const ASSETS = [
  BASE,
  BASE + "index.html",
  BASE + "manifest.webmanifest",
  BASE + "favicon.png",
  BASE + "icon-192.png",
  BASE + "icon-512.png"
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
  const url = new URL(req.url);

  // Só trata requests do mesmo domínio (evita mexer em CDN)
  if (url.origin !== self.location.origin) return;

  // Para navegação (HTML): Network-first -> cai pro cache se offline
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(BASE + "index.html", copy));
          return res;
        })
        .catch(() => caches.match(BASE + "index.html"))
    );
    return;
  }

  // Para arquivos estáticos: Cache-first -> cai pra rede se não tiver
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
