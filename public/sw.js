/// <reference lib="webworker" />

const CACHE_VERSION = "fr-tutor-v1";
const APP_SHELL_CACHE = `app-shell-${CACHE_VERSION}`;
const CURRICULUM_CACHE = `curriculum-${CACHE_VERSION}`;
const AUDIO_CACHE = `audio-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;

const AUDIO_CACHE_MAX_BYTES = 50 * 1024 * 1024; // 50 MB

// App shell files to pre-cache on install
const APP_SHELL_FILES = ["/offline.html"];

// ─── Install ────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL_FILES))
  );
  self.skipWaiting();
});

// ─── Activate: clean old caches ─────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => !k.includes(CACHE_VERSION))
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ─── Fetch strategies ───────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip chrome-extension, etc
  if (!url.protocol.startsWith("http")) return;

  // 1. Curriculum JSON — stale-while-revalidate
  if (url.pathname.includes("/curriculum/") && url.pathname.endsWith(".json")) {
    event.respondWith(staleWhileRevalidate(request, CURRICULUM_CACHE));
    return;
  }

  // 2. Audio files — cache-first with LRU eviction
  if (
    url.pathname.includes("/audio/") ||
    url.pathname.endsWith(".mp3") ||
    url.pathname.endsWith(".wav") ||
    url.pathname.endsWith(".ogg")
  ) {
    event.respondWith(cacheFirstWithLimit(request, AUDIO_CACHE));
    return;
  }

  // 3. Supabase API calls — network-first
  if (url.hostname.includes("supabase")) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  // 4. Next.js static assets — cache-first
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.json"
  ) {
    event.respondWith(cacheFirst(request, APP_SHELL_CACHE));
    return;
  }

  // 5. HTML pages / other — network-first with offline fallback
  if (request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(networkFirstWithOffline(request));
    return;
  }

  // 6. Everything else — network-first
  event.respondWith(networkFirst(request, APP_SHELL_CACHE));
});

// ─── Strategies ─────────────────────────────────────────────────────

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);

  return cached || fetchPromise;
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

async function cacheFirstWithLimit(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      // Evict oldest entries if cache is too large
      const keys = await cache.keys();
      if (keys.length > 200) {
        // Remove oldest 50 entries (LRU approximation)
        for (let i = 0; i < 50; i++) {
          await cache.delete(keys[i]);
        }
      }
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached || new Response("Offline", { status: 503 });
  }
}

async function networkFirstWithOffline(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(APP_SHELL_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch {
    const cache = await caches.open(APP_SHELL_CACHE);
    const cached = await cache.match(request);
    if (cached) return cached;
    return cache.match("/offline.html");
  }
}
