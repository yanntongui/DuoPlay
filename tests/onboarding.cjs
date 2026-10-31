const { BASE, log, check, launchBrowser, finish } = require("./helpers.cjs");

/**
 * Test de bout en bout du « Premier réglage » (§4, §3.F) — onboarding **non
 * bloquant**. Vérifie : la carte n'apparaît que sans préférences, ses valeurs
 * par défaut, l'enregistrement (repris par les Paramètres et le formulaire de
 * partie), l'écartement persistant qui n'enregistre **rien**, et l'absence de
 * débordement horizontal. Rien n'est jamais imposé.
 *
 *   npm run dev
 *   node tests/onboarding.cjs
 */

const view = { viewport: { width: 390, height: 844 } };

async function loadHome(page) {
  await page.goto(`${BASE}/accueil`, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  await page
    .locator('[data-testid="onboarding"][data-loaded="true"]')
    .waitFor({ timeout: 60000 });
}

const pressed = (page, testid) =>
  page.getByTestId(testid).getAttribute("aria-pressed");

(async () => {
  const browser = await launchBrowser();

  // --- A : premier passage, puis enregistrement --------------------
  const ctxA = await browser.newContext(view);
  const A = await ctxA.newPage();
  A.on("pageerror", (error) => log("  [A erreur JS]", error.message));

  await loadHome(A);
  check("la carte « Premier réglage » apparaît sans préférences", true);
  check(
    "des valeurs par défaut sont déjà posées (rien à remplir)",
    (await pressed(A, "onboarding-depth-moyen")) === "true" &&
      (await pressed(A, "onboarding-duration-15")) === "true" &&
      (await pressed(A, "onboarding-mode-ensemble")) === "true",
  );

  const themeButtons = A.locator('[data-testid^="onboarding-theme-"]');
  check(
    "des thèmes réels sont proposés",
    (await themeButtons.count()) > 0,
    `${await themeButtons.count()}`,
  );
  const firstTheme = (await themeButtons.first().innerText()).trim();
  await themeButtons.first().click();
  check(
    "un thème peut être mis à l'écart",
    (await themeButtons.first().getAttribute("aria-pressed")) === "true",
  );

  await A.getByTestId("onboarding-depth-profond").click();
  await A.getByTestId("onboarding-duration-30").click();
  await A.getByTestId("onboarding-mode-a-distance").click();
  check(
    "les choix sont pris en compte",
    (await pressed(A, "onboarding-depth-profond")) === "true" &&
      (await pressed(A, "onboarding-duration-30")) === "true",
  );

  await A.getByTestId("onboarding-save").click();
  await A.getByTestId("onboarding").waitFor({
    state: "detached",
    timeout: 30000,
  });
  check("après enregistrement, la carte disparaît", true);

  await A.reload({ waitUntil: "domcontentloaded" });
  await A.waitForTimeout(1500);
  check(
    "elle ne revient pas une fois les préférences posées",
    (await A.getByTestId("onboarding").count()) === 0,
  );

  // Les réglages sont bien repris côté serveur (page Paramètres).
  await A.goto(`${BASE}/parametres`, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  await A.locator(
    '[data-testid="settings-preferences"][data-loaded="true"]',
  ).waitFor({ timeout: 60000 });
  await A.waitForTimeout(800);
  check(
    "la profondeur enregistrée est reprise dans les Paramètres",
    (await pressed(A, "settings-depth-profond")) === "true",
  );
  check(
    "la durée enregistrée est reprise dans les Paramètres",
    (await pressed(A, "settings-duration-30")) === "true",
  );
  check(
    "le thème écarté est repris dans les Paramètres",
    (await A.getByTestId(`settings-theme-${firstTheme}`).getAttribute(
      "aria-pressed",
    )) === "true",
    firstTheme,
  );

  // Et par le formulaire de partie : la durée pré-remplie est la bonne.
  await A.goto(`${BASE}/explorer/eclats-de-rire`, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  await A.getByRole("link", { name: "Lancer" }).first().click();
  await A.waitForURL(/\/nouvelle\//, { timeout: 120000 });
  await A.getByTestId("planned-count").waitFor({ timeout: 60000 });
  await A.waitForTimeout(1200);
  const durationClass = await A.getByTestId("duration-30").getAttribute(
    "class",
  );
  check(
    "la partie se pré-remplit avec la durée choisie",
    /border-coral-300/.test(durationClass ?? ""),
    String(durationClass).slice(0, 60),
  );

  // --- Mise en page -------------------------------------------------
  await loadHome(A).catch(() => {});
  await A.goto(`${BASE}/accueil`, { waitUntil: "domcontentloaded" });
  await A.waitForTimeout(1200);
  const overflow = await A.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  check("accueil sans débordement horizontal (mobile)", overflow <= 1, `${overflow}px`);

  // --- B : écarter n'enregistre rien -------------------------------
  const ctxB = await browser.newContext(view);
  const B = await ctxB.newPage();
  B.on("pageerror", (error) => log("  [B erreur JS]", error.message));
  await loadHome(B);
  await B.getByTestId("onboarding-dismiss").click();
  await B.getByTestId("onboarding").waitFor({
    state: "detached",
    timeout: 15000,
  });
  check("la carte peut être écartée d'un geste", true);
  await B.reload({ waitUntil: "domcontentloaded" });
  await B.waitForTimeout(1500);
  check(
    "elle reste écartée après rechargement",
    (await B.getByTestId("onboarding").count()) === 0,
  );
  await B.goto(`${BASE}/parametres`, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  await B.locator(
    '[data-testid="settings-preferences"][data-loaded="true"]',
  ).waitFor({ timeout: 60000 });
  await B.waitForTimeout(800);
  check(
    "écarter n'enregistre aucune préférence (profondeur « Auto »)",
    (await pressed(B, "settings-depth-all")) === "true",
  );

  // --- C : la carte vit aussi sur l'explorateur --------------------
  const ctxC = await browser.newContext(view);
  const C = await ctxC.newPage();
  C.on("pageerror", (error) => log("  [C erreur JS]", error.message));
  await C.goto(`${BASE}/explorer`, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  await C.locator('[data-testid="onboarding"][data-loaded="true"]').waitFor({
    timeout: 60000,
  });
  check("la carte est aussi proposée depuis l'explorateur", true);

  await browser.close();
  finish();
})().catch((error) => {
  log("\nERREUR:", error.message);
  process.exit(1);
});
