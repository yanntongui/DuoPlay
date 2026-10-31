const {
  BASE,
  log,
  check,
  launchBrowser,
  finish,
} = require("./helpers.cjs");

/**
 * Paramètres — ambiance, préférences de jeu, consentements, données locales.
 *
 *   npm run dev
 *   node tests/parametres.cjs
 */

async function acceptConsent(page) {
  const banner = page.getByTestId("consent-banner");
  try {
    await banner.waitFor({ state: "visible", timeout: 10000 });
    await banner.getByRole("button", { name: "Tout accepter" }).click();
    await banner.waitFor({ state: "hidden", timeout: 10000 });
    return true;
  } catch {
    return false;
  }
}

const readAmbiance = (page) =>
  page.evaluate(() => document.documentElement.getAttribute("data-ambiance"));

/** Attend qu'une pastille/cran soit actif (aria-pressed="true"). */
function waitPressed(page, testid) {
  return page
    .locator(`[data-testid="${testid}"][aria-pressed="true"]`)
    .waitFor({ timeout: 15000 });
}

(async () => {
  const browser = await launchBrowser();
  const ctx = await browser.newContext({ viewport: { width: 430, height: 932 } });
  const A = await ctx.newPage();
  A.on("pageerror", (error) => log("  [erreur JS]", error.message));

  await A.goto(`${BASE}/parametres`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await A.getByRole("heading", { level: 1, name: "Paramètres" }).waitFor({
    timeout: 60000,
  });
  log("\n1. La page tient ses sections");
  check("la page Paramètres s'ouvre", true);

  await acceptConsent(A);

  for (const id of [
    "settings-ambiance",
    "settings-preferences",
    "settings-privacy",
    "settings-app",
    "settings-device",
  ]) {
    check(
      `la section « ${id} » est présente`,
      (await A.getByTestId(id).count()) === 1,
    );
  }

  // ---------------------------------------------------------------- 2
  log("\n2. Ambiance");
  await A.getByTestId("settings-ambiance-douceur").click();
  await A.waitForTimeout(300);
  check("« Douceur du jour » est appliquée", (await readAmbiance(A)) === "douceur");

  await A.reload({ waitUntil: "domcontentloaded", timeout: 120000 });
  await A.getByTestId("settings-ambiance").waitFor({ timeout: 60000 });
  check(
    "le choix d'ambiance survit au rechargement",
    (await readAmbiance(A)) === "douceur",
  );

  // ---------------------------------------------------------------- 3
  log("\n3. Préférences de jeu");
  await A.locator(
    '[data-testid="settings-preferences"][data-loaded="true"]',
  ).waitFor({ timeout: 60000 });

  await A.getByTestId("settings-depth-leger").click();
  await waitPressed(A, "settings-depth-leger");
  check("la profondeur « Léger » est retenue", true);

  await A.getByTestId("settings-duration-10").click();
  await waitPressed(A, "settings-duration-10");
  await A.getByTestId("settings-mode-differe").click();
  await waitPressed(A, "settings-mode-differe");
  check("durée et mode sont retenus", true);

  const themes = A.locator('[data-testid^="settings-theme-"]');
  const themeCount = await themes.count();
  check("des thèmes réels sont proposés", themeCount > 0, `${themeCount}`);
  await themes.first().click();
  check("un thème peut être mis à l'écart", await themes.first().getAttribute("aria-pressed") === "true");

  await A.getByTestId("settings-save").click();
  await A.getByTestId("settings-status").getByText("Enregistré").waitFor({
    timeout: 30000,
  });
  check("les préférences sont enregistrées", true);

  await A.reload({ waitUntil: "domcontentloaded", timeout: 120000 });
  await A.locator(
    '[data-testid="settings-preferences"][data-loaded="true"]',
  ).waitFor({ timeout: 60000 });
  check(
    "la profondeur enregistrée pré-remplit la page",
    (await A.getByTestId("settings-depth-leger").getAttribute("aria-pressed")) ===
      "true",
  );
  check(
    "la durée enregistrée pré-remplit la page",
    (await A.getByTestId("settings-duration-10").getAttribute("aria-pressed")) ===
      "true",
  );

  await A.getByTestId("settings-reset").click();
  await waitPressed(A, "settings-depth-all");
  check("« Tout remettre à zéro » rétablit le plafond « Tout »", true);

  // ---------------------------------------------------------------- 4
  log("\n4. Consentements");
  await A.locator(
    '[data-testid="settings-privacy"][data-loaded="true"]',
  ).waitFor({ timeout: 60000 });
  const consent = A.getByTestId("settings-consent-analytics");
  const beforeConsent = await consent.isChecked();
  await consent.click();
  await A.getByTestId("settings-privacy-status")
    .getByText("Enregistré")
    .waitFor({ timeout: 30000 });
  check("un tap sur la mesure est enregistré", true);

  await A.reload({ waitUntil: "domcontentloaded", timeout: 120000 });
  await A.locator(
    '[data-testid="settings-privacy"][data-loaded="true"]',
  ).waitFor({ timeout: 60000 });
  check(
    "le choix de mesure persiste",
    (await A.getByTestId("settings-consent-analytics").isChecked()) ===
      !beforeConsent,
  );

  // ---------------------------------------------------------------- 5
  log("\n5. Données locales");
  const deviceText = await A.getByTestId("settings-device").innerText();
  check(
    "les données locales sont résumées",
    deviceText.includes("Ambiance") && deviceText.includes("Identifiant"),
  );

  await A.getByTestId("settings-reset-local").click();
  await A.getByTestId("settings-reset-local-confirm").waitFor({ timeout: 30000 });
  check("l'effacement demande une confirmation", true);
  await A.getByTestId("settings-reset-local-confirm").click();
  await A.waitForURL(/\/parametres$/, { timeout: 120000 });
  await A.getByTestId("settings-ambiance-chandelles").waitFor({ timeout: 60000 });
  check(
    "après effacement, l'ambiance repart aux chandelles",
    (await readAmbiance(A)) === null,
  );

  await A.screenshot({ path: "/tmp/duoplay-parametres.png" });

  await browser.close();
  finish();
})().catch((error) => {
  log("\nERREUR:", error.message);
  process.exit(1);
});
