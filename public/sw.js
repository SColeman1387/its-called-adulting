self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? "It's Called Adulting", {
      body: data.body ?? "",
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      data: data.url ? { url: data.url } : {},
      actions: data.actions ?? [],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/home";
  if (event.action === "done") {
    // Post message to client to mark done
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((cs) => {
        if (cs.length > 0) {
          cs[0].postMessage({ type: "TRASH_DONE" });
          cs[0].focus();
        } else {
          clients.openWindow(url + "?trash=done");
        }
      })
    );
  } else {
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((cs) => {
        if (cs.length > 0) { cs[0].focus(); cs[0].navigate(url); }
        else { clients.openWindow(url); }
      })
    );
  }
});
