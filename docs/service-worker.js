// Service Worker for Simple Calculator App (PWA)
// Provides offline-first caching for the calculator shell and assets,
// navigation fallback, and basic runtime caching for updated resources.

const CACHE_NAME = 'simple-calculator-v1';
const urlsToCache = [
  '/',                    // root (should serve calculator UI)
  '/index.html',          // main HTML (calculator shell)
  '/calculator.css',      // app styling specific to calculator
  '/calculator.js',       // calculator logic
  '/manifest.json',       // web manifest
  '/offline.html',        // friendly offline fallback with basic calculator instructions
  '/icons/icon-192.png',  // app icon
  '/icons/icon-512.png'   // large app icon
];

// Install: cache app shell and assets for offline use
self.addEventListener('install', event => {
  // Activate this SW immediately once installed
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Simple Calculator SW] Caching app shell and assets');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('[Simple Calculator SW] Failed to cache during install:', err);
      })
  );
});

// Fetch: serve cached assets when available, network-first for navigation with offline fallback.
// Also caches successful GET responses at runtime to keep assets fresh.
self.addEventListener('fetch', event => {
  const request = event.request;

  // For navigation requests (e.g., user enters URL or refresh), use network-first
  // so updates to index.html are retrieved, falling back to cached shell/offline page.
  if (request.mode === 'navigate' || (request.method === 'GET' && request.headers.get('accept') && request.headers.get('accept').includes('text/html'))) {
    event.respondWith(
      fetch(request)
        .then(networkResponse => {
          // If network fetch succeeds, update the cache for the shell
          return caches.open(CACHE_NAME).then(cache => {
            // Clone and store network response for future offline use
            cache.put('/index.html', networkResponse.clone()).catch(() => {/* not critical */});
            return networkResponse;
          });
        })
        .catch(() => {
          // Network failed — try to serve from cache, else offline fallback
          return caches.match('/index.html').then(cached => {
            return cached || caches.match('/offline.html');
          });
        })
    );
    return;
  }

  // For other requests (CSS, JS, images), use cache-first strategy with runtime update.
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        // Return cached response immediately, and concurrently try to update cache in background
        // by fetching fresh copy and replacing cache if available.
        fetch(request).then(networkResponse => {
          if (networkResponse && networkResponse.status === 200 && request.method === 'GET') {
            caches.open(CACHE_NAME).then(cache => cache.put(request, networkResponse.clone()));
          }
        }).catch(() => {/* network update failed; ignore */});
        return cachedResponse;
      }

      // Nothing cached — try network and cache the result for future
      return fetch(request)
        .then(networkResponse => {
          if (!networkResponse || networkResponse.status !== 200 || request.method !== 'GET') {
            return networkResponse;
          }
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone).catch(() => {/* not critical */});
          });
          return networkResponse;
        })
        .catch(() => {
          // If request is for an image and both cache & network fail, serve a bundled icon as placeholder
          if (request.headers.get('accept') && request.headers.get('accept').includes('image')) {
            return caches.match('/icons/icon-192.png');
          }
          // Final fallback: offline page for other failures
          if (request.headers.get('accept') && request.headers.get('accept').includes('text/html')) {
            return caches.match('/offline.html');
          }
        });
    })
  );
});

// Activate: remove old caches and take control of clients immediately
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      const deletions = cacheNames.map(cacheName => {
        if (cacheName !== CACHE_NAME) {
          console.log('[Simple Calculator SW] Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        }
      });
      return Promise.all(deletions);
    }).then(() => {
      // Claim clients so the service worker starts controlling pages immediately
      return self.clients.claim();
    })
  );
});

// Listen for skipWaiting message from the web app to immediately activate new SW
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});