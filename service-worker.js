var CACHE_NAME = 'duckhunt-cache-v1';
var urlsToCache = [
  'duckhunt-pwa.xhtml',
  'manifest.json',
  'service-worker.js',
  'https://www.soundjay.com/mechanical/switch-click-10.mp3',
  'https://www.soundjay.com/explosion/explosion-01.mp3'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log('Cache open gemaakt');
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName !== CACHE_NAME;
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});