// This will be replaced by Workbox with the list of assets to precache
self.__WB_MANIFEST;

self.addEventListener("push", function (event) {
  const data = event.data.text();
  const title = data || "A new message!";
  const options = {
    body: data.body || "홈메이트에게서 알림이 왔습니다.",
    icon: "/icon-192x192.png",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  self.clients.openWindow("https://homemate-ai.vercel.app/")
  event.notification.close();
});