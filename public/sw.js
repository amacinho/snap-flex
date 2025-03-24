console.log('SW: sw.js started');
// Minimal offline-first service worker
self.addEventListener('fetch', (event) => {
  console.log('SW: fetch');
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});