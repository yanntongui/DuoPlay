const {
  BASE,
  log,
  check,
  launchBrowser,
  finish,
} = require("./helpers.cjs");

/**
 * Test de bout en bout du dashboard (sidebar, navigation responsive).
 *
 *   npm run dev
 *   node tests/dashboard.cjs
 */

(async () => {
  const browser = await launchBrowser();

  // ---------------------------------------------------------------- 1
  // Desktop : sidebar
  const desktop = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const D = await desktop.newPage();
  D.on("pageerror", (error) => log("  [erreur JS desktop]", error.message));

  await D.goto(`${BASE}/accueil`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await D.getByRole("heading", { level: 1 }).waitFor({ timeout: 60000 });
  log("\n1. Sidebar desktop");

  const sidebar = D.getByTestId("app-sidebar");
  await sidebar.waitFor({ timeout: 30000 });
  check("la sidebar est visible sur desktop", await sidebar.isVisible());

  const bottom = D.getByTestId("bottom-nav");
  check(
    "la barre inférieure est masquée sur desktop",
    (await bottom.count()) === 0 || !(await bottom.isVisible()),
  );

  for (const label of [
    "Accueil",
    "Expériences",
    "Mes parties",
    "Mes favoris",
    "Notre espace",
    "Mon profil",
    "Paramètres",
  ]) {
    check(
      `l'entrée « ${label} » est présente`,
      (await sidebar.getByRole("link", { name: label, exact: true }).count()) === 1,
    );
  }

  const soon = D.getByTestId("nav-soon");
  check(
    "plus aucune entrée « Bientôt » : tout est fonctionnel",
    (await soon.count()) === 0,
  );

  const active = sidebar.locator('[aria-current="page"]');
  check(
    "la page active est signalée",
    (await active.count()) === 1 &&
      (await active.first().getAttribute("href")) === "/accueil",
  );

  const header = D.getByTestId("app-header");
  check("l'en-tête contextuel est visible", await header.isVisible());
  check(
    "l'en-tête affiche la page courante",
    (await header.innerText()).toUpperCase().includes("ACCUEIL"),
  );

  const overflowD = await D.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  check("aucun débordement horizontal (desktop)", overflowD <= 1, `${overflowD}px`);

  // 2. Navigation vers les pages dédiées ---------------------------
  await sidebar.getByRole("link", { name: "Mes favoris", exact: true }).click();
  await D.waitForURL(/\/mes-favoris$/, { timeout: 120000 });
  await D.getByRole("heading", { level: 1, name: "Mes favoris" }).waitFor({ timeout: 60000 });
  check("« Mes favoris » ouvre la page dédiée", true);
  check(
    "l'entrée active suit la page",
    (await sidebar.locator('[aria-current="page"]').first().getAttribute("href")) ===
      "/mes-favoris",
  );

  await sidebar.getByRole("link", { name: "Mes parties", exact: true }).click();
  await D.waitForURL(/\/mes-parties$/, { timeout: 120000 });
  await D.getByRole("heading", { level: 1, name: "Mes parties" }).waitFor({ timeout: 60000 });
  check("« Mes parties » ouvre la page dédiée", true);

  await sidebar.getByRole("link", { name: "Paramètres", exact: true }).click();
  await D.waitForURL(/\/parametres$/, { timeout: 120000 });
  await D.getByRole("heading", { level: 1, name: "Paramètres" }).waitFor({ timeout: 60000 });
  check("« Paramètres » ouvre la page dédiée", true);

  await sidebar.getByTestId("sidebar-cta").click();
  await D.waitForURL(/\/explorer/, { timeout: 120000 });
  check("le bouton « Créer une partie » lance le parcours", /\/explorer/.test(D.url()));

  // ---------------------------------------------------------------- 3
  // Mobile : barre inférieure
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const M = await mobile.newPage();
  M.on("pageerror", (error) => log("  [erreur JS mobile]", error.message));

  await M.goto(`${BASE}/accueil`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await M.getByRole("heading", { level: 1 }).waitFor({ timeout: 60000 });
  log("\n3. Navigation mobile");

  check(
    "la sidebar est masquée sur mobile",
    (await M.getByTestId("app-sidebar").count()) === 0 ||
      !(await M.getByTestId("app-sidebar").isVisible()),
  );

  const mnav = M.getByTestId("bottom-nav");
  await mnav.waitFor({ timeout: 30000 });
  check("la barre inférieure est visible", await mnav.isVisible());
  check(
    "quatre entrées principales",
    (await mnav.getByRole("link").count()) === 4,
  );

  await mnav.getByRole("link", { name: "Mes parties" }).click();
  await M.waitForURL(/\/mes-parties$/, { timeout: 120000 });
  await M.getByRole("heading", { level: 1, name: "Mes parties" }).waitFor({ timeout: 60000 });
  check("la navigation mobile fonctionne", true);

  const overflowM = await M.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  check("aucun débordement horizontal (mobile)", overflowM <= 1, `${overflowM}px`);

  await D.screenshot({ path: "/tmp/duoplay-dashboard.png" });
  await browser.close();
  finish();
})().catch((error) => {
  log("\nERREUR:", error.message);
  process.exit(1);
});
