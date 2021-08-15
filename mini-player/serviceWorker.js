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
self.addEventListener('fetch', function(event) {});
