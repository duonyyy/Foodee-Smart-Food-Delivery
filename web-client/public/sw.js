/**
 * Foodee Progressive Web App Service Worker
 * Supports offline asset caching, background sync, and Web Push Notifications (FCM / Web Push).
 * Enables instant order alerts even when browser tabs are closed or device screen is locked.
 */

const CACHE_NAME = "foodee-v1.0.0";
const PRECACHE_ASSETS = [
  "/",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/favicon.ico",
];

// 1. Install Event: Precaches essential shell assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.warn("[SW] Precache failed:", err);
      })
  );
});

// 2. Activate Event: Cleans up obsolete caches and claims clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Cache-first for images/fonts, Network-first for pages and API
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and WebSocket connections
  if (request.method !== "GET" || url.protocol === "ws:" || url.protocol === "wss:") {
    return;
  }

  // Skip API calls from cache to always get fresh order status
  if (url.pathname.startsWith("/api") || url.pathname.includes(":3000")) {
    return;
  }

  // Static assets (images, icons, styles) -> Stale-while-revalidate
  if (
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/assets/") ||
    url.pathname.startsWith("/images/") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".woff2")
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // HTML Navigation -> Network-first with cache fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((res) => res || caches.match("/")))
    );
  }
});

// 4. Web Push Notification Listener (FCM / Web Push)
// Fires even when phone is locked or browser tab is closed
self.addEventListener("push", (event) => {
  let data = {
    title: "Foodee Thông Báo",
    body: "Bạn có thông tin đơn hàng mới cập nhật!",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    tag: "foodee-order",
    url: "/",
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = {
        title: payload.title || data.title,
        body: payload.body || data.body,
        icon: payload.icon || data.icon,
        badge: payload.badge || data.badge,
        tag: payload.tag || `foodee-order-${Date.now()}`,
        url: payload.url || (payload.orderId ? `/order/${payload.orderId}` : "/"),
        data: payload.data || {},
      };
    } catch {
      data.body = event.data.text() || data.body;
    }
  }

  const notificationOptions = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    data: {
      url: data.url,
      timestamp: Date.now(),
    },
    // Vibrate pattern: 200ms pulse, 100ms pause, 200ms pulse
    vibrate: [200, 100, 200],
    requireInteraction: true,
    actions: [
      {
        action: "view_order",
        title: "Xem đơn hàng",
      },
      {
        action: "close",
        title: "Đóng",
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, notificationOptions)
  );
});

// 5. Notification Click Handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "close") {
    return;
  }

  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If an open window is already on the page, focus it and navigate
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        // Otherwise open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});

