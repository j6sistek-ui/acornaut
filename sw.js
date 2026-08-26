// Cache version — MUST change on every release or installed apps keep
// serving the old files. Decoupled from the game version string.
//
// v2 moved the arcade build to /arcade/ and gave the site root to the
// landing page. Bumping the name is what flushes every v1 cache, which
// still holds the arcade build under the root URLs.
const CACHE = 'acornaut-v2.0.0';

// The installed app opens the ARCADE, so that is the shell worth precaching.
// The landing page is a page you visit, not an app you launch: it is left to
// the network and the browser's own HTTP cache.
const ASSETS = [
  './arcade/',
  './arcade/index.html',
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

  // Never intercept video. A worker that answers a ranged media request from
  // a cached whole-file response breaks seeking, and Safari refuses to play
  // it at all. Let the browser's own media stack talk to the network.
  if (path.includes('/clips/') || path.endsWith('.mp4') || path.endsWith('.webm')) return;

  // Range requests are the browser's business in general, not ours.
  if (req.headers.has('range')) return;

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
        caches.match(req).then((cached) => cached || caches.match('./arcade/index.html'))
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
        if (req.mode === 'navigate') return caches.match('./arcade/index.html');
      });
    })
  );
});
