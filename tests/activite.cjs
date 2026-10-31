const {
  BASE,
  log,
  check,
  playAll,
  launchBrowser,
  finish,
} = require("./helpers.cjs");
/**
 * Test de bout en bout de « Mon activité » (§5) : compteurs honnêtes sur un
 * appareil neuf, mise à jour après une partie réellement terminée, absence de
 * double comptage (reprise), partie non terminée / abandonnée jamais comptée,
 * filtre de période et graphique des sept derniers jours.
 *
 *   npm run dev
 *   node tests/activite.cjs
 */
const KEYS = ["sessions", "shared", "experiences", "challenges"];
async function loadActivity(page) {
  await page.goto(`${BASE}/accueil`, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  await page
    .locator('[data-testid="activity"][data-loaded="true"]')
    .waitFor({ timeout: 60000 });
}
async function value(page, key) {
  return Number(
    (await page.getByTestId(`activity-value-${key}`).innerText()).trim(),
  );
}
async function counts(page) {
  const out = {};
  for (const key of KEYS) out[key] = await value(page, key);
  return out;
}
(async () => {
  const browser = await launchBrowser();
  const view = { viewport: { width: 390, height: 844 } };
  // --- A : appareil neuf -------------------------------------------
  const ctxA = await browser.newContext(view);
  const A = await ctxA.newPage();
  A.on("pageerror", (error) => log("  [A erreur JS]", error.message));
  await loadActivity(A);
  await A.getByTestId("activity-empty").waitFor({ timeout: 60000 });
  check("appareil neuf : état vide affiché", true);
  const emptyText = (await A.getByTestId("activity-empty").innerText()).replace(
    /\s+/g,
    " ",
  );
  check(
    "état vide explicite et non culpabilisant",
    /Votre histoire DuoPlay commence ici/.test(emptyText) &&
      /première expérience/.test(emptyText),
    emptyText.slice(0, 72),
  );
  const zero = await counts(A);
  check(
    "les quatre compteurs partent de zéro",
    KEYS.every((key) => zero[key] === 0),
    KEYS.map((key) => `${key}:${zero[key]}`).join(" "),
  );
  check(
    "aucun filtre temporel sans données",
    (await A.getByTestId("activity-range-all").count()) === 0,
  );
  check(
    "aucun graphique sans données",
    (await A.getByTestId("activity-chart").count()) === 0,
  );
  await A.screenshot({ path: "/tmp/duoplay-activite-vide.png" });
  // --- Création d'une partie ---------------------------------------
  await A.goto(`${BASE}/explorer/eclats-de-rire`, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  const firstTitle = (await A.locator("h2").first().innerText()).trim();
  await A.getByRole("link", { name: "Lancer" }).first().click();
  await A.waitForURL(/\/nouvelle\//, { timeout: 120000 });
  await A.getByPlaceholder("Ex. Awa").fill("Awa");
  await A.getByRole("button", { name: "Créer la partie" }).click();
  await A.waitForURL(/\/partie\//, { timeout: 120000 });
  const room = A.url();
  log("Partie créée :", room.split("/partie/")[1].slice(0, 8) + "…");
  // 1. Partie en attente : jamais comptée comme jouée -----------------
  await loadActivity(A);
  const waiting = await counts(A);
  check(
    "une partie en attente n'est pas comptée comme jouée",
    waiting.sessions === 0 && waiting.shared === 0,
    JSON.stringify(waiting),
  );
  check(
    "la partie en attente apparaît dans l'activité récente",
    (await A.getByTestId("activity-recent-item").count()) >= 1,
  );
  // --- Koffi rejoint -------------------------------------------------
  await A.goto(room, { waitUntil: "domcontentloaded", timeout: 120000 });
  const ctxB = await browser.newContext(view);
  const B = await ctxB.newPage();
  B.on("pageerror", (error) => log("  [B erreur JS]", error.message));
  await B.goto(room, { waitUntil: "domcontentloaded", timeout: 120000 });
  await B.getByPlaceholder("Ex. Koffi").fill("Koffi");
  await B.getByRole("button", { name: "Rejoindre la partie" }).click();
  await A.getByTestId("counter").waitFor({ timeout: 60000 });
  await B.getByTestId("counter").waitFor({ timeout: 60000 });
  await Promise.all([playAll(A, "Awa"), playAll(B, "Koffi")]);
  await A.getByRole("heading", {
    name: /Merci pour ce moment|Presque terminé/,
  }).waitFor({ timeout: 60000 });
  check("la partie se termine normalement", true);
  // 2. Après une partie terminée --------------------------------------
  await loadActivity(A);
  const after = await counts(A);
  check(
    "une partie terminée compte une partie jouée",
    after.sessions === 1,
    JSON.stringify(after),
  );
  check(
    "partie terminée à deux = moment partagé",
    after.shared === 1,
    JSON.stringify(after),
  );
  check(
    "une expérience distincte découverte",
    after.experiences === 1,
    JSON.stringify(after),
  );
  check(
    "aucun défi du jour inventé",
    after.challenges === 0,
    JSON.stringify(after),
  );
  check(
    "filtre de période disponible une fois des données présentes",
    (await A.getByTestId("activity-range-all").count()) === 1,
  );
  const days = await A.getByTestId("activity-chart-day").count();
  check("graphique : sept jours", days === 7, String(days));
  const chartCounts = await A
    .getByTestId("activity-chart-day")
    .evaluateAll((nodes) =>
      nodes.map((node) => Number(node.getAttribute("data-count"))),
    );
  check(
    "graphique : une seule journée active",
    chartCounts.filter((count) => count > 0).length === 1 &&
      chartCounts.reduce((sum, count) => sum + count, 0) === 1,
    chartCounts.join(","),
  );
  check(
    "régularité : un jour actif",
    (await A.getByTestId("activity-active-days").innerText()).trim() === "1",
  );
  const recentText = (await A.getByTestId("activity-recent-item").first().innerText()).replace(
    /\s+/g,
    " ",
  );
  check(
    "activité récente : expérience, catégorie et statut",
    recentText.includes(firstTitle) && /Terminée/.test(recentText),
    recentText.slice(0, 80),
  );
  check(
    "activité récente : action « Voir le résultat »",
    (await A.getByText("Voir le résultat").count()) === 1,
  );
  check(
    "lien vers toutes les parties",
    (await A.getByText("Voir toutes mes parties").count()) === 1,
  );
  // 3. Filtres de période ---------------------------------------------
  await A.getByTestId("activity-range-7d").click();
  await A.waitForTimeout(300);
  check(
    "période « 7 jours » sélectionnée",
    (await A.getByTestId("activity-range-7d").getAttribute("aria-pressed")) ===
      "true",
  );
  const week = await counts(A);
  check(
    "période « 7 jours » recalcule les compteurs",
    week.sessions === 1 && week.experiences === 1,
    JSON.stringify(week),
  );
  await A.getByTestId("activity-range-all").click();
  await A.waitForTimeout(300);
  // 4. Reprendre ne double pas ----------------------------------------
  await A.goto(room, { waitUntil: "domcontentloaded", timeout: 120000 });
  await loadActivity(A);
  check(
    "revenir sur une partie terminée ne double pas le compte",
    (await value(A, "sessions")) === 1,
  );
  // 5. Une partie abandonnée ne compte pas -----------------------------
  await A.goto(`${BASE}/explorer/eclats-de-rire`, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  await A.getByRole("link", { name: "Lancer" }).nth(1).click();
  await A.waitForURL(/\/nouvelle\//, { timeout: 120000 });
  await A.getByPlaceholder("Ex. Awa").fill("Awa");
  await A.getByRole("button", { name: "Créer la partie" }).click();
  await A.waitForURL(/\/partie\//, { timeout: 120000 });
  await A.goto(`${BASE}/mes-parties`, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  const close = A.getByTestId("party-close").first();
  await close.waitFor({ timeout: 60000 });
  await close.click();
  await A.getByTestId("party-close-confirm").first().click();
  await A.waitForTimeout(800);
  await loadActivity(A);
  const closed = await counts(A);
  check(
    "une partie abandonnée n'est pas comptée comme jouée",
    closed.sessions === 1,
    JSON.stringify(closed),
  );
  const abandoned = await A
    .locator('[data-testid="activity-recent-item"][data-status="abandonnee"]')
    .count();
  check("la partie abandonnée reste lisible dans l'historique", abandoned >= 1);

  // 6. Aucun débordement horizontal ------------------------------------
  await A.waitForTimeout(1200);
  const sectionRight = await A.getByTestId("activity").evaluate(
    (el) => Math.round(el.getBoundingClientRect().right) - window.innerWidth,
  );
  check(
    "section « Mon activité » dans la largeur de l'écran (mobile)",
    sectionRight <= 1,
    `${sectionRight}px`,
  );
  const overflow = await A.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  check("accueil sans débordement horizontal (mobile)", overflow <= 1, `${overflow}px`);

  await A.screenshot({ path: "/tmp/duoplay-activite.png" });

  // --- Koffi : son activité reste la sienne --------------------------
  await loadActivity(B);
  const bCounts = await counts(B);
  check(
    "Koffi voit sa propre activité (moment partagé compté des deux côtés)",
    bCounts.sessions === 1 && bCounts.shared === 1,
    JSON.stringify(bCounts),
  );
  await browser.close();
  finish();
})().catch((error) => {
  log("\nERREUR:", error.message);
  process.exit(1);
});
