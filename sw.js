// Cache version — MUST change on every release or installed apps keep
// serving the old files. Decoupled from the game version string.
const CACHE = 'acornaut-v1.2.1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg?v=2',
  './apple-touch-icon.png?v=2',
  './icon-192.png?v=2',
  './icon-512.png?v=2'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const path = new URL(req.url).pathname;
  // Never intercept the beta test build — it must always come from the network
  if (path.includes('/beta/')) return;
  // Pages and the manifest come from the NETWORK first: an installed app
  // must pick up a new release on its next launch, not whenever the old
  // worker happens to cycle. The cache is the offline fallback only,
  // refreshed on every successful fetch.
  if (req.mode === 'navigate' || path.endsWith('.webmanifest')) {
    event.respondWith(
      fetch(req).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      }).catch(() =>
        caches.match(req).then((cached) => cached || caches.match('./index.html'))
      )
    );
    return;
  }
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        const copy = res.clone();
        if (res.ok && (req.url.startsWith(self.location.origin))) {
          caches.open(CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      }).catch(() => {
        // Offline fallback only makes sense for page navigations
        if (req.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});
