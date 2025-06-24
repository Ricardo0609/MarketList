const CACHE_NAME = "supermercado-cache-v1";
const urlsToCache = [
     // Asegúrate de que la ruta base esté en caché
    "/index.html",
    "/style.css",
    "/js.js",
    "/sw.js"
    
];

// Instalación del Service Worker
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return Promise.all(
                urlsToCache.map((url) => {
                    console.log(`Intentando cachear: ${url}`);
                    return cache.add(url).catch((err) => {
                        console.error(`Error al intentar cachear ${url}:`, err);
                    });
                })
            );
        })
    );
});


// Interceptar solicitudes y responder con caché
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        }).catch(() => {
            return caches.match("/index.html"); // Fallback si no hay conexión
        })
    );
});
