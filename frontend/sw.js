/**
 * MediRemind Web System — Service Worker (v2)
 * Team: Beergin | Course: Application Development and Emerging Technologies
 * Provides offline fallback and static asset caching with Network-First strategy
 * to prevent stale development caches.
 */

const CACHE_NAME = 'mediremind-ws-v3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/icons.js',
  '/js/app.js',
  '/manifest.json'
];

// Install: pre-cache static assets and activate immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean up old caches (specifically v1) and take control of all clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch: Network-First for HTML/JS/CSS, always network for API
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Always bypass cache for API calls or non-GET requests
  if (event.request.method !== 'GET' || url.pathname.startsWith('/api')) {
    return;
  }

  // Network-first strategy: always fetch fresh from server, update cache, fallback to cache on offline
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkResponse;
      })
      .catch(() => {
        // Offline fallback: serve from cache if available
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response('Network offline and asset not cached', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
          });
        });
      })
  );
});
