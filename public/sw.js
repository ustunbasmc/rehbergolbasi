const CACHE_NAME = "rehbergolbasi-v1";
const OFFLINE_FALLBACK = "/";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API, admin ve GET olmayan istekler her zaman ağdan gitsin — bunlara
  // dokunmuyoruz ki veri her zaman güncel kalsın, bayat cache dönmesin.
  if (request.method !== "GET" || url.pathname.startsWith("/api/") || url.pathname.startsWith("/admin")) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match(OFFLINE_FALLBACK)))
  );
});