/* DuoPlay — service worker (cf. PRD §16.2, §16.3)
 *
 * Offline-first **léger** : on met en cache la coquille déjà consultée et les
 * ressources statiques. Le temps réel et les données vivent chez Convex : ils ne
 * passent jamais par ce cache, pour ne jamais servir un état périmé.
 */

const VERSION = "duoplay-v2";
const OFFLINE_URL = "/hors-ligne";

/* Coquille statique uniquement : les pages personnalisées sont mises en cache
 * au fil de la visite (voir le handler de navigation). */
const APP_SHELL = [
  "/",
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/icons/icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => undefined),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== VERSION).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

/** Réponse Convex / Next RSC : jamais mise en cache (état + build volatils). */
function isVolatile(request, url) {
  if (url.pathname.startsWith("/api/")) return true;
  if (url.searchParams.has("_rsc")) return true;
  const accept = request.headers.get("accept") || "";
  return accept.includes("text/x-component");
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Convex (autre origine) et requêtes volatiles : réseau pur.
  if (url.origin !== self.location.origin || isVolatile(request, url)) return;

  // Navigations : réseau d'abord, repli sur la page demandée puis l'écran hors ligne.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(VERSION).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          // 1. la même page déjà visitée (périmée mais juste), 2. l'écran hors ligne.
          const cached = await caches.match(request);
          return cached || (await caches.match(OFFLINE_URL));
        }),
    );
    return;
  }

  // Ressources statiques : cache d'abord, rafraîchissement en arrière-plan.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type === "basic") {
            const copy = response.clone();
            caches.open(VERSION).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
