// EcoThread offline support: the page works offline after the first visit.
const CACHE = "ecothread-v4";
const CORE = ["/", "/index.html", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.pathname.startsWith("/api/") || url.hostname.endsWith("supabase.co")) return;
  if (req.mode === "navigate") { // network first for the page, so updates show up
    e.respondWith(fetch(req).then(r => { caches.open(CACHE).then(c => c.put("/", r.clone())); return r; }).catch(() => caches.match("/")));
    return;
  }
  if (url.hostname.includes("fonts.g")) { // fonts: cache first
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return r; })));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
