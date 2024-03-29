// This will be replaced by Workbox with the list of assets to precache
self.__WB_MANIFEST;

self.addEventListener("push", function (event) {
  const data = event.data.text();
  const title = data || "A new message!";
  const options = {
    body: data.body || "홈메이트에게서 알림이 왔습니다.",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});