const CACHE_NAME = 'vietanh-master-v1';

// Cài đặt Service Worker và kích hoạt ngay lập tức
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Dọn dẹp các phiên bản cache cũ khi nâng cấp
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Chiến lược Network-First: Luôn lấy bản mới nhất từ mạng, lỗi mạng mới dùng cache
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Bỏ qua các request gọi API ngoài (như Gemini API)
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});