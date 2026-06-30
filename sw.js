const CACHE_NAME = 'pg-dunk-v2-dynamic';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Stratégie Network-first pour garantir la mise à jour instantanée après tes déploiements Vercel
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});
