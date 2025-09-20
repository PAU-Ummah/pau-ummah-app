const CACHE_NAME = 'pau-ummah-v1';
const OFFLINE_URL = '/offline.html';
const CACHE_ASSETS = [
  '/',
  '/offline.html',
  '/logo.jpg',
  // Add other assets you want to cache
];

// Install event - cache the application shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching app shell');
        return cache.addAll(CACHE_ASSETS);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Clearing old cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache, falling back to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests, like those to Google Fonts or Analytics
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle navigation requests with network-first strategy
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone the response to store it in the cache
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          return response;
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(OFFLINE_URL);
        })
    );
  } else {
    // For all other requests, try cache first, then network
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          // Return cached response if found
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Otherwise, try the network
          return fetch(event.request)
            .then((response) => {
              // Don't cache responses with error status codes
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              
              // Clone the response to store it in the cache
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
                
              return response;
            });
        })
    );
  }
});
