// Service Worker for PantryPal - Force cache updates
const CACHE_VERSION = 'v4.0.1'; // Increment this with each deployment
const CACHE_NAME = `pantrypal-${CACHE_VERSION}`;

// Install event - clear old caches
self.addEventListener('install', (event) => {
  console.log('Service Worker installing version:', CACHE_VERSION);
  self.skipWaiting(); // Activate immediately
});

// Activate event - delete old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating version:', CACHE_VERSION);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('pantrypal-') && name !== CACHE_NAME)
          .map((name) => {
            console.log('Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim()) // Take control immediately
  );
});

// Fetch event - network first, then cache
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response before caching
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        
        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(event.request);
      })
  );
});

// Listen for messages to force update
self.addEventListener('message', (event) => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
