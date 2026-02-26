// PWA Service Worker
// Version format: vYYYY.MM.DD.n (increment n for same-day releases)
// WARN: duplicates version in html title, need to keep in sync manually
// TODO: automate versioning
const CACHE_VERSION = 'v2026.02.26.1';
const CACHE_NAME = `wf-cache-${CACHE_VERSION}`;

const ASSETS_TO_CACHE = [
  './waterfall.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// install: pre-cache all assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting()) // activate immediately
  );
});

// activate: delete old caches and take control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('wf-cache-') && name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim()) // take control of all clients
  );
});

// fetch: cache-first strategy
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request);
      })
  );
});
