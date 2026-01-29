const CACHE_NAME = 'ndayane-services-v1';
const OFFLINE_URL = '/offline';

// Ressources à mettre en cache immédiatement
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/login',
  '/dashboard',
  '/caisse',
  '/logo.png',
  '/manifest.json',
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Cache ouvert');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activation et nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Stratégie de cache: Network First avec fallback sur cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') return;

  // Ignorer les requêtes API en mode hors-ligne (elles seront gérées par IndexedDB)
  if (url.pathname.startsWith('/api') || url.origin === 'http://localhost:3001') {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({ offline: true, error: 'Vous êtes hors ligne' }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  // Pour les pages et assets statiques: Network First
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Mettre en cache la nouvelle réponse
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(async () => {
        // En cas d'échec réseau, utiliser le cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }
        // Si pas en cache, afficher la page hors-ligne
        if (request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }
        return new Response('Ressource non disponible hors ligne', { status: 503 });
      })
  );
});

// Écouter les messages du client
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});

// Synchronisation en arrière-plan (pour les ventes hors-ligne)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-ventes') {
    event.waitUntil(syncVentesOffline());
  }
});

async function syncVentesOffline() {
  // Cette fonction sera appelée quand la connexion revient
  // Elle synchronisera les ventes stockées localement
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({ type: 'SYNC_COMPLETE' });
  });
}
