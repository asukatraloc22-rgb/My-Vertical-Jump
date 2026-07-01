const CACHE_NAME = 'pg-flight-v2';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Stratégie Network-First : Priorité au réseau pour tes mises à jour Vercel, fallback sur le cache si tu es sur le terrain sans réseau
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});
