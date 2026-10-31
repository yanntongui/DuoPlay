const { BASE, log, check, launchBrowser, finish } = require("./helpers.cjs");

/**
 * Test de bout en bout des « Favoris et collections » (§4, §6.3) : état vide,
 * création d'une collection nommée, classement d'un favori dedans, filtrage,
 * renommage, réordonnancement des favoris, suppression de la collection (les
 * favoris redeviennent non classés). Les collections restent **propres à
 * l'appareil**. Aucun débordement horizontal sur mobile.
 *
 *   npm run dev
 *   node tests/favoris.cjs
 */

async function openFavorites(page) {
  await page.goto(`${BASE}/mes-favoris`, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
}

function favCard(page, title) {
  return page.locator('[data-testid="favorite-item"]', { hasText: title });
}

function chip(page, name) {
  return page.locator('[data-testid="collection-filter"]', { hasText: name });
}

(async () => {
  const browser = await launchBrowser();
  const view = { viewport: { width: 390, height: 844 } };

  // --- A : appareil neuf -------------------------------------------
  const ctxA = await browser.newContext(view);
  const A = await ctxA.newPage();
  A.on("pageerror", (error) => log("  [A erreur JS]", error.message));

  await openFavorites(A);
  await A.getByText("Aucun favori").waitFor({ timeout: 30000 });
  check("appareil neuf : état vide explicite", true);
  check(
    "aucune collection sans favori",
    (await A.getByTestId("collections-bar").count()) === 0,
  );

  // --- Deux favoris -------------------------------------------------
  await A.goto(`${BASE}/explorer/eclats-de-rire`, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  await A.locator("h2").nth(1).waitFor({ timeout: 30000 });
  const titles = await A.locator("h2").allInnerTexts();
  const first = titles[0].trim();
  const second = titles[1].trim();
  await A.getByTestId("favorite").nth(0).click();
  await A.getByTestId("favorite").nth(1).click();
  await A.waitForTimeout(600);

  await openFavorites(A);
  await A.getByTestId("collections-bar").waitFor({ timeout: 30000 });
  check(
    "les deux favoris sont listés",
    (await A.getByTestId("favorite-item").count()) === 2,
  );
  check(
    "le filtre « Tous » est actif et complet",
    (await A.getByTestId("collection-filter-all").getAttribute("aria-pressed")) ===
      "true" &&
      (await A.getByTestId("collection-filter-all").innerText()).includes("2"),
  );

  // --- Créer une collection ----------------------------------------
  await A.getByTestId("collection-add").click();
  await A.getByTestId("collection-name").fill("Soirées calmes");
  await A.getByTestId("collection-create").click();
  await chip(A, "Soirées calmes").waitFor({ timeout: 30000 });
  check("une collection nommée est créée", true);
  await A.getByTestId("collection-empty").waitFor({ timeout: 30000 });
  check(
    "une collection neuve est vide et le dit",
    (await A.getByTestId("favorite-item").count()) === 0,
  );

  // --- Classer un favori dedans ------------------------------------
  await A.getByTestId("collection-filter-all").click();
  await favCard(A, first)
    .locator('select[data-testid="favorite-collection"]')
    .selectOption({ index: 1 });
  await A.waitForTimeout(600);
  check(
    "un favori est classé dans la collection",
    (await favCard(A, first)
      .locator('select[data-testid="favorite-collection"]')
      .inputValue()) !== "",
  );

  await chip(A, "Soirées calmes").click();
  await A.waitForTimeout(400);
  check(
    "le filtre de collection ne montre que ses favoris",
    (await A.getByTestId("favorite-item").count()) === 1 &&
      (await favCard(A, first).count()) === 1,
  );
  check(
    "le compteur de la collection suit",
    (await chip(A, "Soirées calmes").innerText()).includes("1"),
  );

  // --- Renommer -----------------------------------------------------
  await A.getByTestId("collection-rename").click();
  await A.getByTestId("collection-rename-input").fill("Soirées douces");
  await A.getByTestId("collection-rename-save").click();
  await chip(A, "Soirées douces").waitFor({ timeout: 30000 });
  check(
    "une collection peut être renommée",
    (await chip(A, "Soirées calmes").count()) === 0,
  );

  // --- Réordonner les favoris --------------------------------------
  await A.getByTestId("collection-filter-all").click();
  await A.waitForTimeout(300);
  const beforeFirst = (
    await A.getByTestId("favorite-item").first().innerText()
  ).trim();
  const moved = beforeFirst.includes(second) ? first : second;
  await favCard(A, moved)
    .getByTestId("favorite-move-up")
    .click();
  await A.waitForTimeout(600);
  check(
    "un favori peut remonter dans l'ordre",
    (await A.getByTestId("favorite-item").first().innerText()).includes(moved),
    moved,
  );

  // --- Supprimer la collection -------------------------------------
  await chip(A, "Soirées douces").click();
  await A.getByTestId("collection-delete").click();
  await A.getByTestId("collection-delete-confirm").click();
  await A.waitForTimeout(800);
  check(
    "une collection peut être supprimée",
    (await A.getByTestId("collection-filter").count()) === 0,
  );
  check(
    "après suppression, les favoris redeviennent non classés",
    (await favCard(A, first)
      .locator('select[data-testid="favorite-collection"]')
      .inputValue()) === "",
  );
  check(
    "les deux favoris sont toujours là",
    (await A.getByTestId("favorite-item").count()) === 2,
  );

  // --- Mise en page -------------------------------------------------
  await A.waitForTimeout(1200);
  const overflow = await A.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  check(
    "mes-favoris sans débordement horizontal (mobile)",
    overflow <= 1,
    `${overflow}px`,
  );
  await A.screenshot({ path: "/tmp/duoplay-favoris.png" });

  // --- B : les collections restent propres à l'appareil -------------
  const ctxB = await browser.newContext(view);
  const B = await ctxB.newPage();
  B.on("pageerror", (error) => log("  [B erreur JS]", error.message));
  await openFavorites(B);
  await B.getByText("Aucun favori").waitFor({ timeout: 30000 });
  check(
    "un second appareil ne voit ni les favoris ni les collections",
    (await B.getByTestId("collections-bar").count()) === 0 &&
      (await B.getByTestId("favorite-item").count()) === 0,
  );

  await browser.close();
  finish();
})().catch((error) => {
  log("\nERREUR:", error.message);
  process.exit(1);
});
