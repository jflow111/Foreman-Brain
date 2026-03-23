var CACHE = 'foreman-brain-v1';
var SHELL = ['/app.html', '/auth.html', '/manifest.json'];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(SHELL);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  // Network-first for API calls, cache-first for shell
  if (e.request.url.includes('/estimate') || e.request.url.includes('/price-lookup') || e.request.url.includes('supabase')) {
    return; // Let these go straight to network
  }
  e.respondWith(
    fetch(e.request).catch(function() {
      return caches.match(e.request).then(function(cached) {
        return cached || caches.match('/app.html');
      });
    })
  );
});
