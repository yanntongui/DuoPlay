const {
  log,
  check,
  launchBrowser,
  finish,
} = require("./helpers.cjs");

/**
 * Vérifie le service worker sur un serveur de production (le SW ne s'enregistre
 * jamais en `next dev`).
 *
 *   npm run build && npx next start -p 3100
 *   BASE_URL=http://localhost:3100 node tests/offline.cjs
 */

const BASE = process.env.BASE_URL || "http://localhost:3100";

(async () => {
  const browser = await launchBrowser();
  const ctx = await browser.newContext({ viewport: { width: 430, height: 932 } });
  const page = await ctx.newPage();
  page.on("pageerror", (error) => log("  [erreur JS]", error.message));

  const served = await page.goto(`${BASE}/accueil`, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  check("serveur de production joignable", served?.status() === 200, `${served?.status()}`);

  const registered = await page
    .waitForFunction(
      async () => {
        if (!("serviceWorker" in navigator)) return false;
        const reg = await navigator.serviceWorker.getRegistration();
        return Boolean(reg?.active);
      },
      { timeout: 60000 },
    )
    .then(() => true)
    .catch(() => false);
  check("le service worker s'enregistre et s'active", registered);

  // L'installation du cache suit de peu l'activation : on la laisse finir.
  const readCache = () =>
    page.evaluate(async () => {
      const keys = await caches.keys();
      const duoplay = keys.find((key) => key.startsWith("duoplay-"));
      if (!duoplay) return { keys, urls: [] };
      const cache = await caches.open(duoplay);
      const requests = await cache.keys();
      return {
        keys,
        urls: requests.map((request) => new URL(request.url).pathname),
      };
    });

  let cached = await readCache();
  for (
    let i = 0;
    i < 40 &&
    !(cached.urls.includes("/") && cached.urls.includes("/hors-ligne"));
    i += 1
  ) {
    await page.waitForTimeout(500);
    cached = await readCache();
  }
  check(
    "cache versionné présent",
    cached.keys.some((key) => key.startsWith("duoplay-")),
    cached.keys.join(", "),
  );
  check(
    "coquille et écran hors ligne mis en cache",
    cached.urls.includes("/hors-ligne") && cached.urls.includes("/"),
    cached.urls.join(", "),
  );
  check(
    "aucune charge RSC mise en cache",
    !cached.urls.some((url) => url.includes("_rsc")),
    cached.urls.filter((url) => url.includes("_rsc")).join(", "),
  );

  // Le manifeste et les icônes doivent survivre à la coupure.
  const manifest = await page.evaluate(async () => {
    const response = await fetch("/manifest.webmanifest");
    return response.status;
  });
  check("manifeste servi", manifest === 200, `${manifest}`);

  // Une navigation contrôlée par le service worker met la page en cache.
  await page.evaluate(() => navigator.serviceWorker.ready);
  const controlled = await page
    .waitForFunction(() => Boolean(navigator.serviceWorker.controller), {
      timeout: 30000,
    })
    .then(() => true)
    .catch(() => false);
  check("la page est prise en charge par le service worker", controlled);

  await page.goto(`${BASE}/accueil`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await page.waitForTimeout(1200);
  const visited = await page.evaluate(async () => {
    const keys = await caches.keys();
    const cache = await caches.open(keys.find((k) => k.startsWith("duoplay-")));
    return (await cache.keys()).map((request) => new URL(request.url).pathname);
  });
  check(
    "la page visitée entre en cache",
    visited.includes("/accueil"),
    visited.join(", "),
  );

  // Coupure réseau : la page déjà visitée reste servie, les autres basculent
  // sur l'écran hors ligne.
  await ctx.setOffline(true);
  const revisit = await page.reload({ waitUntil: "domcontentloaded", timeout: 60000 });
  const revisitBody = await page.locator("body").innerText();
  check(
    "page déjà visitée servie hors ligne",
    Boolean(revisit) &&
      revisitBody.includes("Mes parties") &&
      !revisitBody.includes("Pas de connexion"),
    revisitBody.slice(0, 70).replace(/\s+/g, " "),
  );

  const cold = await ctx.newPage();
  const offline = await cold.goto(`${BASE}/notre-espace`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  const offlineBody = await cold.locator("body").innerText();
  check(
    "page jamais visitée : écran hors ligne explicite",
    Boolean(offline) &&
      offlineBody.includes("Pas de connexion") &&
      offlineBody.includes("Réessayer"),
    offlineBody.slice(0, 60).replace(/\s+/g, " "),
  );
  await ctx.setOffline(false);

  await cold.screenshot({ path: "/tmp/duoplay-offline.png" });
  await browser.close();
  finish();
})().catch((error) => {
  log("\nERREUR:", error.message);
  process.exit(1);
});
