const CACHE_NAME = "jin-aek-routine-v3";
const URLS_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json"
  // 아이콘 파일을 쓰면 여기에도 추가해줘:
  // "./icon-checklist-192.png",
  // "./icon-checklist-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});