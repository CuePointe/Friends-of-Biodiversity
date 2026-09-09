/* ═══════════════════════════════════════════
   FRIENDS OF BIODIVERSITY — SERVICE WORKER
   Uganda Biodiversity Fund

   Caches core app files for offline access.
   Members can open the app even without internet
   and see the last loaded content.
═══════════════════════════════════════════ */

// Sprint 8: bump cache so new runtime assets are picked up cleanly.
const CACHE_NAME = 'fob-app-v6';

const CORE_FILES = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './sprint8-runtime.js',
  './manifest.json',
  './fob-logo.png',
  './ubf-logo.png',
  './footprint-globe.jpg',
  './icon192.png',
  './icon512.png',
  './icon-512-maskable.png',
  './slide1sm.jpg',
  './slide2sm.jpg',
  './slide3sm.jpg',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.allSettled(CORE_FILES.map(f => cache.add(f))))
      .then(() => self.skipWaiting())
  );
});

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

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  // Never cache live backend/API traffic or third-party dynamic resources.
  if (url.hostname.includes('supabase.co')) return;
  if (url.hostname.includes('googleapis.com')) return;
  if (url.hostname.includes('jsdelivr.net')) return;
  if (url.hostname.includes('cloudflare')) return;

  const sameOrigin = url.origin === self.location.origin;
  const isCode = event.request.destination === 'document' ||
                 /\.(?:html|css|js)$/i.test(url.pathname);

  // App code = network first, cache fallback. This preserves fast repeat loads
  // without trapping users on stale application logic after a deployment.
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

  // Images and other stable local assets = cache first.
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

self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json();
  self.registration.showNotification(data.title || 'Friends of Biodiversity', {
    body: data.body || 'New update from Uganda Biodiversity Fund',
    icon: './icon192.png',
    badge: './icon192.png',
    data: { url: data.url || './' }
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url || './'));
});
