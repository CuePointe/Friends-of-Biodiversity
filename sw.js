/* ═══════════════════════════════════════════
   FRIENDS OF BIODIVERSITY — SERVICE WORKER
   Uganda Biodiversity Fund

   Caches core app files for offline access.
   Sprint 8 runtime is injected into the HTML response so the legacy SPA can
   adopt the new Auth, analytics and performance layer without a monolithic rewrite.
═══════════════════════════════════════════ */

const CACHE_NAME = 'fob-app-v7';
const RUNTIME_SRC = './sprint8-runtime.js';

const CORE_FILES = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  RUNTIME_SRC,
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
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

async function injectRuntime(response) {
  if (!response || !response.ok) return response;
  const type = response.headers.get('content-type') || '';
  if (!type.includes('text/html')) return response;
  try {
    const html = await response.text();
    if (/sprint8-runtime\.js/i.test(html)) return new Response(html, response);
    const tag = '<script src="' + RUNTIME_SRC + '" defer></script>';
    const updated = html.includes('</body>')
      ? html.replace('</body>', tag + '</body>')
      : html + tag;
    const headers = new Headers(response.headers);
    headers.delete('content-length');
    return new Response(updated, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  } catch (_) {
    return response;
  }
}

async function networkCodeRequest(request) {
  const network = await fetch(request);
  const transformed = await injectRuntime(network.clone());
  if (transformed && transformed.ok) {
    const clone = transformed.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(request, clone)).catch(() => {});
  }
  return transformed;
}

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  // Never cache live backend/API traffic or third-party dynamic resources.
  if (url.hostname.includes('supabase.co')) return;
  if (url.hostname.includes('googleapis.com')) return;
  if (url.hostname.includes('jsdelivr.net')) return;
  if (url.hostname.includes('cloudflare')) return;

  const sameOrigin = url.origin === self.location.origin;
  const isCode = event.request.destination === 'document' || /\.(?:html|css|js)$/i.test(url.pathname);

  if (sameOrigin && isCode) {
    event.respondWith(
      networkCodeRequest(event.request).catch(() => caches.match(event.request).then(c => c || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request)
        .then(response => {
          if (response && response.ok && response.type === 'basic' && sameOrigin) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone)).catch(() => {});
          }
          return response;
        })
        .catch(() => event.request.destination === 'document' ? caches.match('./index.html') : undefined);
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
