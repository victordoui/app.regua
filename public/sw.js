// Service Worker for Push Notifications
// VIZZU - Gestão inteligente de agendamentos

const CACHE_NAME = 'vizzu-v3';

// Install event — skip waiting immediately
self.addEventListener('install', (event) => {
  console.log('[SW] New version installed, activating immediately');
  self.skipWaiting();
});

// Activate event — claim all clients immediately
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activated, claiming clients');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Listen for SKIP_WAITING message from client (legacy support)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);

  let data = {
    title: 'VIZZU',
    body: 'Você tem uma nova notificação',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    url: '/',
    actions: [],
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/favicon.ico',
    badge: data.badge || '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      dateOfArrival: Date.now(),
    },
    actions: data.actions || [],
    requireInteraction: data.requireInteraction || false,
    tag: data.tag || 'default',
    renotify: data.renotify || false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  if (event.action) {
    console.log('[SW] Action clicked:', event.action);
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event);
});

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications());
  }
});

async function syncNotifications() {
  console.log('[SW] Syncing notifications...');
}

// Fetch event — network-first for navigation, pass-through for others
self.addEventListener('fetch', (event) => {
  // Don't cache navigation requests — always go to network
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }
  // Pass-through for everything else
});
