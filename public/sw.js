self.addEventListener('push', function (event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || '🚨 Laporan Kerusakan Baru!';
  const options = {
    body: data.body || 'Ada kendala mesin baru yang dilaporkan.',
    icon: '/talo.png',
    badge: '/talo.png',
    vibrate: [300, 100, 300, 100, 300], // Pola getar mirip WhatsApp
    tag: 'mtc-floating-alert',
    renotify: true,
    requireInteraction: true, // Membuat notifikasi mengambang tetap ada sampai ditekan
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
