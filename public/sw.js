// Service Worker para Controle Financeiro
const CACHE_NAME = 'controle-financeiro-v1';
const STATIC_CACHE_NAME = 'controle-financeiro-static-v1';
const DYNAMIC_CACHE_NAME = 'controle-financeiro-dynamic-v1';

// Arquivos estáticos para cache
const STATIC_FILES = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('[SW] Static files cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Error caching static files:', error);
      })
  );
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Limpar caches antigos
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Activated successfully');
        return self.clients.claim();
      })
  );
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Estratégia para diferentes tipos de requisições
  if (request.method === 'GET') {
    // Páginas HTML - Network First
    if (request.destination === 'document') {
      event.respondWith(networkFirstStrategy(request));
    }
    // Arquivos estáticos - Cache First
    else if (request.destination === 'script' || 
             request.destination === 'style' || 
             request.destination === 'image') {
      event.respondWith(cacheFirstStrategy(request));
    }
    // APIs Firebase - Network First com fallback
    else if (url.hostname.includes('firestore.googleapis.com') || 
             url.hostname.includes('firebase.googleapis.com')) {
      event.respondWith(networkFirstStrategy(request));
    }
    // Outras requisições
    else {
      event.respondWith(staleWhileRevalidateStrategy(request));
    }
  }
});

// Estratégia: Network First
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Se a resposta é válida, cache ela
    if (networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache for:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback para páginas HTML
    if (request.destination === 'document') {
      return caches.match('/');
    }
    
    throw error;
  }
}

// Estratégia: Cache First
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.status === 200) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Failed to fetch:', request.url, error);
    throw error;
  }
}

// Estratégia: Stale While Revalidate
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Em caso de erro de rede, retorna cached se disponível
    return cachedResponse;
  });
  
  return cachedResponse || fetchPromise;
}

// Limpar cache antigo periodicamente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAN_CACHE') {
    cleanOldCache();
  }
});

async function cleanOldCache() {
  const cacheNames = await caches.keys();
  const oldCaches = cacheNames.filter(name => 
    name.includes('controle-financeiro') && 
    name !== STATIC_CACHE_NAME && 
    name !== DYNAMIC_CACHE_NAME
  );
  
  await Promise.all(
    oldCaches.map(cacheName => caches.delete(cacheName))
  );
  
  console.log('[SW] Old caches cleaned');
}

// Notificações push (futuro)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/logo192.png',
      badge: '/logo192.png',
      vibrate: [200, 100, 200],
      data: data.data,
      actions: [
        {
          action: 'open',
          title: 'Abrir App',
          icon: '/logo192.png'
        },
        {
          action: 'close',
          title: 'Fechar'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
