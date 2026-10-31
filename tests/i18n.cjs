const {
  BASE,
  log,
  check,
  launchBrowser,
  waitForHydration,
  finish,
} = require("./helpers.cjs");

/**
 * Test de bout en bout du **bilingue français / anglais** (§22).
 *
 * `tests/helpers.cjs` épingle le français pour toutes les autres suites ; ici on
 * vérifie explicitement l'anglais (`?lang=en`), le choix persisté depuis les
 * Paramètres, l'attribut `lang` du document, le lien d'évitement, le bandeau de
 * consentement, et l'absence de mélange des deux langues sur un même écran.
 *
 *   npm run dev
 *   node tests/i18n.cjs
 */

const desktop = { viewport: { width: 1280, height: 900 } };

const NAV_FR = [
  "Accueil",
  "Expériences",
  "Mes parties",
  "Mes favoris",
  "Notre espace",
  "Mon profil",
  "Paramètres",
];
const NAV_EN = [
  "Home",
  "Experiences",
  "My games",
  "My favourites",
  "Our space",
  "My profile",
  "Settings",
];

async function navLabels(page) {
  const links = page.locator('[data-testid="app-sidebar"] nav a');
  const total = await links.count();
  const labels = [];
  for (let i = 0; i < total; i += 1) {
    const text = (await links.nth(i).innerText()).trim();
    if (text) labels.push(text);
  }
  return labels;
}

/**
 * La langue vit sur l'appareil : la première peinture est toujours le français
 * (comme côté serveur), puis l'interface bascule. On attend donc la bascule
 * plutôt que de la supposer instantanée.
 */
async function waitForLabels(page, expected, timeout = 30000) {
  const deadline = Date.now() + timeout;
  let latest = [];
  while (Date.now() < deadline) {
    latest = await navLabels(page);
    if (JSON.stringify(latest) === JSON.stringify(expected)) return latest;
    await page.waitForTimeout(200);
  }
  return latest;
}

async function waitForChecked(page, testid, timeout = 30000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const value = await page.getByTestId(testid).getAttribute("aria-checked");
    if (value === "true") return true;
    await page.waitForTimeout(200);
  }
  return false;
}

(async () => {
  const browser = await launchBrowser();
  const ctx = await browser.newContext(desktop);
  const page = await ctx.newPage();
  page.on("pageerror", (error) => log("  [erreur JS]", error.message));

  // --- 1. Français par défaut --------------------------------------
  await page.goto(`${BASE}/accueil`, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  await page.getByTestId("app-sidebar").waitFor({ timeout: 60000 });
  await waitForHydration(page);
  check(
    "sans choix, la langue par défaut est le français",
    (await page.getAttribute("html", "lang")) === "fr",
    String(await page.getAttribute("html", "lang")),
  );
  check(
    "la navigation est en français",
    JSON.stringify(await navLabels(page)) === JSON.stringify(NAV_FR),
    (await navLabels(page)).join(" / "),
  );
  check(
    "le lien d'évitement est en français",
    (await page.locator("a.skip-link").innerText()).trim() ===
      "Aller au contenu",
  );
  check(
    "le bandeau de consentement est en français",
    (await page.getByTestId("consent-banner").innerText()).includes(
      "Tout accepter",
    ),
  );

  // --- 2. Anglais via ?lang=en --------------------------------------
  await page.goto(`${BASE}/accueil?lang=en`, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  await page.getByTestId("app-sidebar").waitFor({ timeout: 60000 });
  await waitForHydration(page);
  const enLabels = await waitForLabels(page, NAV_EN);
  check(
    "?lang=en bascule le document en anglais",
    (await page.getAttribute("html", "lang")) === "en",
    String(await page.getAttribute("html", "lang")),
  );
  check(
    "la navigation passe en anglais",
    JSON.stringify(enLabels) === JSON.stringify(NAV_EN),
    enLabels.join(" / "),
  );
  check(
    "le lien d'évitement est traduit",
    (await page.locator("a.skip-link").innerText()).trim() ===
      "Skip to content",
  );
  check(
    "le bandeau de consentement est traduit",
    (await page.getByTestId("consent-banner").innerText()).includes(
      "Accept all",
    ),
  );
  check(
    "aucun libellé français ne subsiste dans la navigation",
    (await navLabels(page)).every((label) => !NAV_FR.includes(label)),
  );

  // --- 3. Choix persisté depuis les Paramètres ----------------------
  await page.goto(`${BASE}/parametres?lang=en`, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  const section = page.getByTestId("settings-language");
  await section.waitFor({ timeout: 60000 });
  await waitForHydration(page);
  check(
    "les Paramètres proposent le choix de langue",
    await waitForChecked(page, "settings-lang-en"),
  );

  await page.getByTestId("settings-lang-fr").click();
  await waitForChecked(page, "settings-lang-fr");
  check(
    "le passage au français est immédiat",
    (await page.getAttribute("html", "lang")) === "fr" &&
      (await page.getByTestId("settings-lang-fr").getAttribute("aria-checked")) ===
        "true",
  );
  check(
    "le titre de la section suit la langue",
    (await section.locator("h2").innerText()).includes("Langue"),
  );

  await page.goto(`${BASE}/parametres`, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  await page.getByTestId("settings-language").waitFor({ timeout: 60000 });
  await waitForHydration(page);
  check(
    "le choix français est conservé sans paramètre d'URL",
    await waitForChecked(page, "settings-lang-fr"),
  );

  await page.getByTestId("settings-lang-en").click();
  await waitForChecked(page, "settings-lang-en");
  await page.goto(`${BASE}/accueil`, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  await page.getByTestId("app-sidebar").waitFor({ timeout: 60000 });
  await waitForHydration(page);
  const kept = await waitForLabels(page, NAV_EN);
  check(
    "le choix anglais survit à la navigation",
    JSON.stringify(kept) === JSON.stringify(NAV_EN),
    kept.join(" / "),
  );

  // --- 4. Mobile : la barre inférieure suit aussi -------------------
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const M = await mobile.newPage();
  M.on("pageerror", (error) => log("  [mobile erreur JS]", error.message));
  await M.goto(`${BASE}/accueil?lang=en`, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  await M.getByTestId("bottom-nav").waitFor({ timeout: 60000 });
  await waitForHydration(M);
  await M.getByTestId("bottom-nav").getByText("Home").first().waitFor({
    timeout: 30000,
  });
  const bottom = (await M.getByTestId("bottom-nav").innerText()).replace(
    /\s+/g,
    " ",
  );
  check(
    "la barre inférieure mobile est traduite",
    bottom.includes("Home") && bottom.includes("Experiences"),
    bottom,
  );
  const hidden = await M.locator('[data-testid="app-sidebar"]').isVisible();
  check("la sidebar n'est pas rendue sur mobile", hidden === false);
  const overflow = await M.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  check("aucun débordement horizontal en anglais (mobile)", overflow <= 1, `${overflow}px`);

  await browser.close();
  finish();
})().catch((error) => {
  log("\nERREUR:", error.message);
  process.exit(1);
});
