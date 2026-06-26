const CACHE_NAME = "driver-client-runtime-5.0.0-normal-hard-update";
const OFFLINE_FALLBACK = "./index.html?offline=1";

self.addEventListener("install", event => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(key => key.startsWith("driver-client") || key.startsWith("hfdriver") || key.startsWith("hammerfest"))
      .map(key => caches.delete(key))
    );
    await self.clients.claim();
  })());
});

self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Supabase and CDN requests must stay live and must not be cached by the app shell.
  if (url.origin !== self.location.origin) return;

  const isNavigation = req.mode === "navigate" || url.pathname.endsWith("/") || url.pathname.endsWith("/index.html");
  const isUpdateFile = url.pathname.endsWith("/service-worker.js") || url.pathname.endsWith("/version.json");

  if (isUpdateFile) {
    event.respondWith(fetch(req, { cache:"no-store" }));
    return;
  }

  if (isNavigation) {
    event.respondWith((async () => {
      try {
        return await fetch(req, { cache:"reload" });
      } catch (e) {
        const cached = await caches.match(OFFLINE_FALLBACK, { ignoreSearch:true });
        if (cached) return cached;
        return new Response("Offline and no cached app shell available.", { status:503, headers:{"Content-Type":"text/plain"} });
      }
    })());
    return;
  }

  // Static same-origin files: network first, cache fallback.
  event.respondWith((async () => {
    try {
      const fresh = await fetch(req, { cache:"reload" });
      if (fresh && fresh.ok) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, fresh.clone()).catch(() => null);
      }
      return fresh;
    } catch (e) {
      const cached = await caches.match(req, { ignoreSearch:true });
      if (cached) return cached;
      throw e;
    }
  })());
});
