/* ═══════════════════════════════════════════
   FRIENDS OF BIODIVERSITY — SERVICE WORKER
   Uganda Biodiversity Fund
   
   Caches core app files for offline access.
   Members can open the app even without internet
   and see the last loaded content.
═══════════════════════════════════════════ */

const CACHE_NAME = 'fob-app-v4';

// Core files to cache immediately on install.
// RELATIVE paths so the app works under a GitHub project subpath
// (e.g. /friends-of-biodiversity/) as well as a custom domain root.
const CORE_FILES = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './fob-logo.png',
  './ubf-logo.png',
  './footprint-globe.jpg',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png',
  './slide-1.jpg',
  './slide-2.jpg',
  './slide-3.jpg',
];

// ── INSTALL: cache core files (each independently, so one missing
// file can never break the whole install) ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.allSettled(CORE_FILES.map(f => cache.add(f))))
      .then(() => self.skipWaiting())
  );
});

// ── ACTIVATE: clean up old caches ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH ──
// App code (HTML/CSS/JS) = NETWORK-FIRST so updates appear immediately after deploy.
// Images & other static assets = CACHE-FIRST for speed and offline use.
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Always go to network for live/external data — never cache these
  const url = new URL(event.request.url);
  if (url.hostname.includes('supabase.co')) return;
  if (url.hostname.includes('googleapis.com')) return;
  if (url.hostname.includes('jsdelivr.net')) return;
  if (url.hostname.includes('cloudflare')) return;

  const sameOrigin = url.origin === self.location.origin;
  const isCode = event.request.destination === 'document' ||
                 /\.(?:html|css|js)$/i.test(url.pathname);

  // NETWORK-FIRST for the app shell and code so new deploys show up right away
  if (sameOrigin && isCode) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(event.request).then(c => c || caches.match('./index.html'))
        )
    );
    return;
  }

  // CACHE-FIRST for images and everything else
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request)
        .then(response => {
          if (response && response.ok && response.type === 'basic' && sameOrigin) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          if (event.request.destination === 'document') {
            return caches.match('./index.html');
          }
        });
    })
  );
});

// ── PUSH NOTIFICATIONS (future use) ──
self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json();
  self.registration.showNotification(data.title || 'Friends of Biodiversity', {
    body: data.body || 'New update from Uganda Biodiversity Fund',
    icon: './icon-192.png',
    badge: './icon-96.png',
    data: { url: data.url || './' }
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || './')
  );
});
