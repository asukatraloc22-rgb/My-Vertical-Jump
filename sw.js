const CACHE_NAME = 'pg-dunk-v1';

// Installation du Service Worker
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

// Activation et nettoyage immédiat
self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// Stratégie "Network Only" : laisse Vercel gérer les fichiers en temps réel sans bloquer le cache
self.addEventListener('fetch', (event) => {
    event.respondWith(fetch(event.request));
});
