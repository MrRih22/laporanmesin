self.addEventListener('push', function (event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || '🚨 Laporan Kerusakan Baru!';
  const options = {
    body: data.body || 'Ada kendala mesin baru yang dilaporkan.',
    icon: '/talo.png',
    badge: '/talo.png',
    vibrate: [300, 100, 300, 100, 300],
    tag: `mtc-alert-${Date.now()}`, // <--- Memastikan setiap notifikasi berdiri sendiri
    renotify: true,
    requireInteraction: true,
    actions: [
      { action: 'open', title: 'Buka Dashboard' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/dashboard')
  );
});
