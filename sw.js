var C = 'fit-pwa-v1';
self.addEventListener('install', function (e) { self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (ks) {
      return Promise.all(ks.filter(function (k) { return k !== C })
        .map(function (k) { return caches.delete(k) }));
    }).then(function () { return self.clients.claim() })
  );
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function (r) {
      var net = fetch(e.request).then(function (n) {
        if (n && n.status === 200) {
          var cp = n.clone();
          caches.open(C).then(function (c) { c.put(e.request, cp) });
        }
        return n;
      }).catch(function () { return r });
      return r ? Promise.race([net, r]) : net;
    })
  );
});
