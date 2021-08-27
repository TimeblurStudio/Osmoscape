const cacheName = 'osmoscapeCache-v1';
const filesToCache=[
    './',
    './index.html',
    './Atom.js',
    './AudioCollTest.js',
    './Molecule.js',
    './Point.js',
    './Rect.js',
    './RectHelper.js',
    './Sounds.js',
    './Tone.js',
    './p5.js',
    './p5.min.js'
];

/* Start the service worker and cache all of the app's content */
self.addEventListener('install', function(e) {
    e.waitUntil(
      caches.open(cacheName).then(function(cache) {
        return cache.addAll(filesToCache);
      })
    );
  });
  
  /* Serve cached content when offline */
  self.addEventListener('fetch', function(e) {
    e.respondWith(
      caches.match(e.request).then(function(response) {
        return response || fetch(e.request);
      })
    );
  });