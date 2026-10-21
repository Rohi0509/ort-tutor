/* Service worker: makes the tutor and the mock test work offline once opened.
   Every request is answered from the cache straight away and refreshed from the network in the
   background, so edits reach students on their next visit. Bump VERSION to drop old caches. */
const VERSION = "ort-tutor-v6";
const FILES = [
  "./", "index.html", "manifest.webmanifest", "css/styles.css",
  "vendor/supabase.js", "js/config.js", "js/auth.js", "js/ui.js", "js/game.js", "js/guide.js", "js/subjects.js", "js/app.js",
  "js/data/math.js", "js/data/analogies.js", "js/data/sentences.js", "js/data/reading.js", "js/data/grammar.js",
  "mock-test/index.html",
  "icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Same-origin files and Google Fonts are cached; any other request goes straight to the network.
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  const fonts = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (e.request.method !== "GET" || (url.origin !== location.origin && !fonts)) return;
  e.respondWith(caches.open(VERSION).then(async cache => {
    // A folder URL such as mock-test/ falls back to its cached index.html.
    const hit = await cache.match(e.request, { ignoreSearch: !fonts })
      || (url.pathname.endsWith("/") && !fonts ? await cache.match(url.pathname + "index.html") : undefined);
    const net = fetch(e.request).then(res => {
      if (res.ok || res.type === "opaque") cache.put(e.request, res.clone());
      return res;
    }).catch(() => hit);
    if (hit) { e.waitUntil(net); return hit; }
    return net;
  }));
});
