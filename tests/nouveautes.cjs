const {
  BASE,
  log,
  check,
  launchBrowser,
  finish,
} = require("./helpers.cjs");

/**
 * Test de bout en bout des rituels ajoutés :
 *  - Roue du hasard (tirage d'un gage, déclencheur depuis l'accueil) ;
 *  - ambiance « Soirée aux chandelles ↔ Douceur du jour » ;
 *  - univers enrichis (durée, intensité, déclencheur de partie).
 *
 *   npm run dev
 *   node tests/nouveautes.cjs
 */

(async () => {
  const browser = await launchBrowser();
  const viewport = { width: 430, height: 932 };
  const ctx = await browser.newContext({ viewport });
  const A = await ctx.newPage();
  A.on("pageerror", (error) => log("  [erreur JS]", error.message));

  // ---------------------------------------------------------------- 1
  // Roue du hasard
  await A.goto(`${BASE}/accueil`, { waitUntil: "domcontentloaded", timeout: 120000 });
  const cta = A.getByTestId("roue-cta");
  await cta.waitFor({ timeout: 60000 });
  await cta.click();
  await A.waitForURL(/\/roue$/, { timeout: 120000 });
  log("\n1. Roue du hasard");
  check("l'accueil mène à la roue", A.url().endsWith("/roue"));

  const wheel = A.getByTestId("roue-wheel");
  await wheel.waitFor({ timeout: 60000 });
  const before = await wheel.getAttribute("style");
  await A.getByTestId("roue-spin").click();
  const result = A.getByTestId("roue-result");
  await result.waitFor({ timeout: 20000 });
  const gage = (await A.getByTestId("roue-gage").innerText()).trim();
  check("la roue rend un gage", gage.length > 8, gage);
  const after = await wheel.getAttribute("style");
  check("la roue a effectivement tourné", before !== after);

  await A.getByTestId("roue-spin").click();
  // La roue repart : le résultat se retire puis revient une fois posée.
  await A
    .getByTestId("roue-result")
    .waitFor({ state: "detached", timeout: 5000 })
    .catch(() => {});
  await A.getByTestId("roue-result").waitFor({ timeout: 20000 });
  check(
    "on peut relancer la roue",
    (await A.getByTestId("roue-result").count()) === 1,
  );

  // ---------------------------------------------------------------- 2
  // Ambiance Soirée aux chandelles / Douceur du jour
  await A.goto(`${BASE}/accueil`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await A.getByRole("heading", { level: 1 }).waitFor({ timeout: 60000 });
  log("\n2. Ambiance");

  const readAmbiance = () =>
    A.evaluate(() => ({
      attr: document.documentElement.getAttribute("data-ambiance"),
      bg: getComputedStyle(document.documentElement)
        .getPropertyValue("--background")
        .trim(),
    }));

  const cold = await readAmbiance();
  check("ambiance par défaut : chandelles", cold.attr === null, String(cold.attr));

  // La bascule existe en double (barre mobile + en-tête desktop) : on cible
  // celle qui est réellement visible à cette taille d'écran.
  const toggle = A.locator('[data-testid="ambiance-toggle"]:visible');
  await toggle.waitFor({ timeout: 30000 });

  // L'écouteur est posé à l'hydratation : on clique jusqu'à ce que ça réagisse.
  const setAmbiance = async (expected) => {
    for (let i = 0; i < 20; i += 1) {
      const current = (await readAmbiance()).attr;
      if (current === expected) return true;
      await toggle.click();
      await A.waitForTimeout(350);
    }
    return (await readAmbiance()).attr === expected;
  };

  check("la bascule passe en Douceur du jour", await setAmbiance("douceur"));
  const warm = await readAmbiance();
  check("le climat change réellement", warm.bg !== cold.bg, `${cold.bg} → ${warm.bg}`);
  check(
    "l'état est exposé aux lecteurs d'écran",
    (await toggle.getAttribute("aria-pressed")) === "true",
  );

  await A.reload({ waitUntil: "domcontentloaded" });
  await A.getByRole("heading", { level: 1 }).waitFor({ timeout: 60000 });
  const persisted = await readAmbiance();
  check("le choix survit au rechargement", persisted.attr === "douceur", String(persisted.attr));

  await A.getByRole("heading", { level: 1 }).waitFor({ timeout: 60000 });
  check("on revient aux chandelles", await setAmbiance(null));

  // ---------------------------------------------------------------- 3
  // Univers enrichis
  await A.goto(`${BASE}/explorer`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await A.getByRole("heading", { level: 3 }).first().waitFor({ timeout: 60000 });
  log("\n3. Univers enrichis");

  const cards = await A.getByRole("heading", { level: 3 }).count();
  check("les univers sont affichés", cards >= 6, `${cards}`);

  const durations = await A.getByText(/^\d+ min$/).count();
  check("chaque univers annonce sa durée", durations >= 6, `${durations}`);

  const intensities = await A
    .getByText(/^(Léger|Tendre|Profond)$/)
    .count();
  check("chaque univers annonce son intensité", intensities >= 6, `${intensities}`);

  const triggers = A.getByRole("link", { name: /Lancer une partie/ });
  check(
    "un déclencheur de partie est présent",
    (await triggers.count()) >= 4,
    `${await triggers.count()}`,
  );
  await triggers.first().click();
  await A.waitForURL(/\/explorer\/[a-z-]+/, { timeout: 120000 });
  check("le déclencheur ouvre l'univers", /\/explorer\/[a-z-]+/.test(A.url()), A.url());

  await A.screenshot({ path: "/tmp/duo-nouveautes.png" });
  await browser.close();
  finish();
})().catch((error) => {
  log("\nERREUR:", error.message);
  process.exit(1);
});
