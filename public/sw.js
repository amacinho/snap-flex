console.log('Service Worker: registered');
const CACHE_NAME = 'snap-flex-v1.01';
const ASSETS = [
//  '/',
//  '/index.html',
//  '/src/main.tsx',
//  '/src/styles.css',
//  '/assets/screenshot.png'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker: install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker: activate');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  console.log('Service Worker: fetch');
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
