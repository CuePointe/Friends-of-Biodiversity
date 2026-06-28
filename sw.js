/* ═══════════════════════════════════════════
   FRIENDS OF BIODIVERSITY — SERVICE WORKER
   Uganda Biodiversity Fund
   
   Caches core app files for offline access.
   Members can open the app even without internet
   and see the last loaded content.
═══════════════════════════════════════════ */

const CACHE_NAME = 'fob-app-v1';

// Core files to cache immediately on install
const CORE_FILES = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  '/fob-logo.png',
  '/ubf-logo.png',
  '/favicon.png',
  '/footprint-globe.jpg',
  '/icon-192.png',
  '/icon-512.png',
  '/slide-1.jpg',
  '/slide-2.jpg',
  '/slide-3.jpg',
];

// ── INSTALL: cache core files ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_FILES))
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

// ── FETCH: serve from cache, fall back to network ──
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Skip Supabase API calls — always go to network for live data
  const url = new URL(event.request.url);
  if (url.hostname.includes('supabase.co')) return;
  if (url.hostname.includes('googleapis.com')) return;
  if (url.hostname.includes('jsdelivr.net')) return;

  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        // Return cached version immediately if available
        if (cached) return cached;

        // Otherwise fetch from network and cache for next time
        return fetch(event.request)
          .then(response => {
            // Only cache successful responses for same-origin files
            if (
              response.ok &&
              response.type === 'basic' &&
              event.request.url.startsWith(self.location.origin)
            ) {
              const clone = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, clone));
            }
            return response;
          })
          .catch(() => {
            // Offline and not cached — return the main app shell
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
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
    icon: '/icon-192.png',
    badge: '/icon-96.png',
    data: { url: data.url || '/' }
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});
