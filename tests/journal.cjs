const {
  BASE,
  log,
  check,
  playAll,
  launchBrowser,
  finish,
} = require("./helpers.cjs");

/**
 * Test de bout en bout du « Journal du couple » (§4) : état vide honnête,
 * note libre écrite puis modifiée puis retirée, souvenir illustré d'une photo
 * (stockage Convex), moment créé automatiquement à la fin d'une partie — une
 * seule fois —, partage avec le partenaire relié, et suggestions issues des
 * favoris. Aucun débordement horizontal sur mobile.
 *
 *   npm run dev
 *   node tests/journal.cjs
 */

// PNG 1×1 transparent — suffisant pour valider le type et le poids.
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

async function loadJournal(page) {
  await page.goto(`${BASE}/notre-espace`, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  await page
    .locator('[data-testid="journal"][data-loaded="true"]')
    .waitFor({ timeout: 60000 });
}

function card(page, title) {
  return page.locator('[data-testid="journal-card"]', { hasText: title });
}

async function addNote(page, title, note) {
  await page.getByTestId("journal-add").click();
  await page.getByTestId("journal-form").waitFor({ timeout: 15000 });
  await page.getByTestId("journal-title").fill(title);
  if (note) await page.getByTestId("journal-note").fill(note);
  await page.getByTestId("journal-submit").click();
  await card(page, title).waitFor({ timeout: 30000 });
}

(async () => {
  const browser = await launchBrowser();
  const view = { viewport: { width: 390, height: 844 } };

  // --- A : appareil neuf -------------------------------------------
  const ctxA = await browser.newContext(view);
  const A = await ctxA.newPage();
  A.on("pageerror", (error) => log("  [A erreur JS]", error.message));

  await loadJournal(A);
  await A.getByTestId("journal-empty").waitFor({ timeout: 30000 });
  check("appareil neuf : journal vide annoncé", true);
  check(
    "aucun compteur tant que rien n'est gardé",
    (await A.getByTestId("journal-count").count()) === 0,
  );
  const emptyText = (await A.getByTestId("journal-empty").innerText()).replace(
    /\s+/g,
    " ",
  );
  check(
    "l'état vide explique comment le journal se remplit",
    /chaque partie terminée/i.test(emptyText) && /note|photo/i.test(emptyText),
    emptyText.slice(0, 80),
  );

  // --- Note libre ---------------------------------------------------
  await addNote(A, "Notre premier thé", "Rue des fleurs, un dimanche.");
  check("une note libre rejoint le journal", true);
  check(
    "le compteur suit le journal",
    (await A.getByTestId("journal-count").innerText()).trim() === "1",
  );
  const noteText = (await card(A, "Notre premier thé").innerText()).replace(
    /\s+/g,
    " ",
  );
  check(
    "la note affiche son texte et sa provenance",
    noteText.includes("Rue des fleurs") && /Note/.test(noteText),
    noteText.slice(0, 80),
  );

  // --- Modification -------------------------------------------------
  await card(A, "Notre premier thé").getByTestId("journal-edit").click();
  await A.getByTestId("journal-form").waitFor({ timeout: 15000 });
  await A.getByTestId("journal-title").fill("Notre thé d'hibiscus");
  await A.getByTestId("journal-submit").click();
  await card(A, "Notre thé d'hibiscus").waitFor({ timeout: 30000 });
  check(
    "une note peut être corrigée",
    (await card(A, "Notre premier thé").count()) === 0,
  );

  // --- Photo --------------------------------------------------------
  await A.getByTestId("journal-add").click();
  await A.getByTestId("journal-form").waitFor({ timeout: 15000 });
  await A.getByTestId("journal-title").fill("La pluie sur la véranda");
  await A.getByTestId("journal-photo").setInputFiles({
    name: "moment.png",
    mimeType: "image/png",
    buffer: PNG,
  });
  await A.getByRole("button", { name: "Retirer" }).first().waitFor({
    timeout: 30000,
  });
  await A.getByTestId("journal-submit").click();
  await card(A, "La pluie sur la véranda").waitFor({ timeout: 30000 });
  await card(A, "La pluie sur la véranda")
    .getByTestId("journal-media")
    .waitFor({ timeout: 30000 });
  check("une note peut porter une photo", true);
  check(
    "le compteur compte les deux souvenirs",
    (await A.getByTestId("journal-count").innerText()).trim() === "2",
  );

  // --- Retrait ------------------------------------------------------
  await card(A, "La pluie sur la véranda").getByTestId("journal-remove").click();
  await card(A, "La pluie sur la véranda")
    .getByTestId("journal-remove-confirm")
    .click();
  await card(A, "La pluie sur la véranda").waitFor({
    state: "detached",
    timeout: 30000,
  });
  check("un souvenir peut être retiré", true);
  check(
    "le compteur revient à un",
    (await A.getByTestId("journal-count").innerText()).trim() === "1",
  );

  // --- Favoris ------------------------------------------------------
  await A.goto(`${BASE}/explorer/eclats-de-rire`, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  const favTitle = (await A.locator("h2").first().innerText()).trim();
  await A.getByTestId("favorite").first().click();
  await loadJournal(A);
  await A.getByTestId("journal-favorite-keep").first().waitFor({
    timeout: 30000,
  });
  check("les favoris sont proposés au journal", true);
  await A.getByTestId("journal-favorite-keep").first().click();
  await card(A, favTitle).waitFor({ timeout: 30000 });
  check("un favori peut devenir un souvenir", true);
  check(
    "le souvenir gardé depuis un favori est étiqueté",
    /Favori/.test(
      (await card(A, favTitle).innerText()).replace(/\s+/g, " "),
    ),
  );

  // --- Partie jouée à deux : moment automatique ---------------------
  await A.goto(`${BASE}/explorer/eclats-de-rire`, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  const gameTitle = (await A.locator("h2").first().innerText()).trim();
  await A.getByRole("link", { name: "Lancer" }).first().click();
  await A.waitForURL(/\/nouvelle\//, { timeout: 120000 });
  await A.getByPlaceholder("Ex. Awa").fill("Awa");
  await A.getByRole("button", { name: "Créer la partie" }).click();
  await A.waitForURL(/\/partie\//, { timeout: 120000 });
  const room = A.url();

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

  await loadJournal(A);
  const moments = A.locator(
    '[data-testid="journal-card"][data-kind="moment"]',
  );
  await moments.first().waitFor({ timeout: 30000 });
  const momentCount = await moments.count();
  check("une partie terminée crée un moment", momentCount >= 1, String(momentCount));
  const momentText = (await moments.first().innerText()).replace(/\s+/g, " ");
  check(
    "le moment est intitulé d'après l'expérience jouée",
    momentText.includes(gameTitle.slice(0, 12)),
    momentText.slice(0, 80),
  );
  check(
    "le moment porte sa provenance « Partie terminée »",
    /Partie terminée/.test(momentText),
    momentText.slice(0, 80),
  );

  // Idempotence : revenir ne crée jamais de doublon.
  await loadJournal(A);
  await A.waitForTimeout(600);
  check(
    "revenir sur le journal ne duplique pas le moment",
    (await moments.count()) === momentCount,
    `${momentCount} → ${await moments.count()}`,
  );

  // --- Partage avec le partenaire -----------------------------------
  await loadJournal(B);
  await B.getByTestId("journal").waitFor({ timeout: 30000 });
  check(
    "le partenaire relié voit le moment partagé",
    (await B.locator('[data-testid="journal-card"][data-kind="moment"]').count()) >= 1,
  );
  check(
    "le partenaire voit aussi la note écrite par Awa",
    (await card(B, "Notre thé d'hibiscus").count()) === 1,
  );
  check(
    "le partenaire ne peut pas s'approprier une note de l'autre",
    (await card(B, "Notre thé d'hibiscus").getByTestId("journal-edit").count()) === 0,
  );
  check(
    "le partenaire peut enrichir un moment commun",
    (await B.locator('[data-testid="journal-card"][data-kind="moment"]').first().getByTestId("journal-edit").count()) === 1,
  );

  // --- Mise en page -------------------------------------------------
  await loadJournal(A);
  await A.waitForTimeout(1200);
  const overflow = await A.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  check("notre-espace sans débordement horizontal (mobile)", overflow <= 1, `${overflow}px`);
  check(
    "l'espace du couple conserve sa grille de statistiques",
    (await A.locator("div.grid > div").count()) === 3,
  );
  await A.screenshot({ path: "/tmp/duoplay-journal.png" });

  await browser.close();
  finish();
})().catch((error) => {
  log("\nERREUR:", error.message);
  process.exit(1);
});
