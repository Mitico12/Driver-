// v6 cleanup service worker. The app no longer relies on service-worker caching for updates.
self.addEventListener("install", event => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys
        .filter(key => key.startsWith("driver-client") || key.startsWith("hfdriver") || key.startsWith("hammerfest"))
        .map(key => caches.delete(key))
      );
    } catch(e) {}
    await self.clients.claim();
    try { await self.registration.unregister(); } catch(e) {}
  })());
});

// No fetch handler: all requests go to the network/browser normally.
