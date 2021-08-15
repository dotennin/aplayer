const cacheName = "aplayer-v1"
const assets = [
  "/",
  "/index.html",
  "/css/main.css",
  "/scripts/script.js",
]

self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(cacheName).then(cache => {
			console.log('[Service Worker] Caching all: app shell and content');
      cache.addAll(assets)
    })
  )
})

// this will resolve the error 'page does not work offline'
// self.addEventListener('fetch', function(event) {});

// Fetching content using Service Worker
self.addEventListener('fetch', (e) => {
  e.respondWith((async () => {
    const r = await caches.match(e.request);
    console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
    if (r) return r;
    const response = await fetch(e.request);
    const cache = await caches.open(cacheName);
    console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
    cache.put(e.request, response.clone());
    return response;
  })());
});
