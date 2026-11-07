/* NEXUS — service worker: aplikacja na telefonie, szybkie ładowanie, działa przy słabym zasięgu.
   Dane z API (VPS) NIE są zapisywane — zawsze świeże. */
const V = 'nexus-v4';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {           // panel: najpierw sieć, w razie braku — kopia
    e.respondWith(fetch(req).then(r => { if (r.ok) { const c = r.clone(); caches.open(V).then(x => x.put(req, c)); } return r; }).catch(() => caches.match(req).then(r => r || caches.match('index.html'))));
  } else if (url.hostname === 'cdn.jsdelivr.net' || url.hostname.endsWith('gstatic.com') || url.hostname === 'fonts.googleapis.com') {
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(n => { if (n.ok || n.type === 'opaque') { const c = n.clone(); caches.open(V).then(x => x.put(req, c)); } return n; })));
  }                                                      // API VPS: bez cache
});
