const fs = require("fs");
const {
  BASE,
  log,
  check,
  playAll,
  launchBrowser,
  finish,
} = require("./helpers.cjs");

/**
 * Test de bout en bout de la **carte souvenir partageable** (§4, §19.1).
 *
 * Vérifie qu'une partie terminée produit une carte prête à partager : rendue
 * **localement** (blob), téléchargeable en PNG, résumée pour WhatsApp / copie,
 * et surtout **sans aucune réponse ni énoncé** — seuls les prénoms, la
 * ressemblance et le titre en sortent (cf. §15).
 *
 *   npm run dev
 *   node tests/partage.cjs
 */

const view = { viewport: { width: 430, height: 932 }, acceptDownloads: true };

(async () => {
  const browser = await launchBrowser();

  // --- Joueur A : crée la partie -----------------------------------
  const ctxA = await browser.newContext(view);
  const A = await ctxA.newPage();
  A.on("pageerror", (error) => log("  [A erreur JS]", error.message));

  await A.goto(`${BASE}/explorer/eclats-de-rire`, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  await A.getByRole("link", { name: "Lancer" })
    .first()
    .waitFor({ timeout: 60000 });
  await A.getByRole("link", { name: "Lancer" }).first().click();
  await A.waitForURL(/\/nouvelle\//, { timeout: 120000 });
  await A.getByPlaceholder("Ex. Awa").fill("Awa");
  await A.getByRole("button", { name: "Créer la partie" }).click();
  await A.waitForURL(/\/partie\//, { timeout: 120000 });
  const room = A.url();
  const token = room.split("/partie/")[1];

  check(
    "aucune carte partagée tant que la partie n'est pas finie",
    (await A.getByTestId("partage").count()) === 0,
  );

  // --- Joueur B rejoint --------------------------------------------
  const ctxB = await browser.newContext(view);
  const B = await ctxB.newPage();
  B.on("pageerror", (error) => log("  [B erreur JS]", error.message));
  await B.goto(`${BASE}/partie/${token}`, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  await B.getByPlaceholder("Ex. Koffi").fill("Koffi");
  await B.getByRole("button", { name: "Rejoindre la partie" }).click();
  await B.getByTestId("counter").waitFor({ timeout: 60000 });
  await A.getByTestId("counter").waitFor({ timeout: 60000 });

  log("\n1. Les deux joueurs terminent la partie…");
  await Promise.all([playAll(A, "Awa"), playAll(B, "Koffi")]);

  await A.getByRole("heading", { name: "Merci pour ce moment" }).waitFor({
    timeout: 60000,
  });

  // --- La carte est préparée ---------------------------------------
  const section = A.getByTestId("partage");
  await section.waitFor({ timeout: 60000 });
  await A.locator('[data-testid="partage"][data-loaded="true"]').waitFor({
    timeout: 60000,
  });
  check("une carte souvenir est proposée au bilan", true);

  const src = await A.getByTestId("partage-preview").getAttribute("src");
  check("la carte est rendue localement (blob)", (src ?? "").startsWith("blob:"), String(src).slice(0, 24));

  const previewAlt = await A.getByTestId("partage-preview").getAttribute("alt");
  check(
    "l'alternative textuelle décrit la carte",
    /ressemblance/i.test(previewAlt ?? ""),
  );

  // --- Le texte partagé ne révèle rien ------------------------------
  const summary = (await A.getByTestId("partage-summary").innerText()).trim();
  check(
    "le texte partagé annonce la ressemblance",
    /\d+ % de réponses identiques sur \d+ questions?/.test(summary),
    summary,
  );

  const prompts = await A.locator("p.text-base.leading-snug").allInnerTexts();
  check("les énoncés sont bien présents dans le détail", prompts.length > 0, `${prompts.length}`);
  const leaked = prompts.filter((prompt) =>
    summary.toLowerCase().includes(prompt.trim().toLowerCase()),
  );
  check(
    "aucun énoncé ne fuit dans le texte partagé",
    leaked.length === 0,
    leaked[0] ?? "",
  );

  const answers = await A.getByTestId("partage-summary").evaluate((node) => {
    const seen = node.closest("section");
    return seen ? seen.innerText : "";
  });
  check(
    "la carte n'affiche que des agrégats",
    !/même réponse|réponses différentes/i.test(answers),
  );

  const waHref = await A.getByTestId("partage-whatsapp").getAttribute("href");
  const waText = new URL(waHref ?? "").searchParams.get("text") ?? "";
  check(
    "WhatsApp partage le même texte (complets, pas de réponses)",
    waText === summary,
    waText.slice(0, 60),
  );

  // --- Téléchargement du PNG ----------------------------------------
  const [download] = await Promise.all([
    A.waitForEvent("download", { timeout: 60000 }),
    A.getByTestId("partage-download").click(),
  ]);
  check(
    "le fichier proposé est un PNG nommé",
    download.suggestedFilename() === "duoplay-souvenir.png",
    download.suggestedFilename(),
  );
  const saved = await download.path();
  const size = saved ? fs.statSync(saved).size : 0;
  check("l'image téléchargée n'est pas vide", size > 5000, `${size} octets`);

  // --- Copie du texte (depuis le second joueur) ---------------------
  await ctxB.grantPermissions(["clipboard-read", "clipboard-write"]);
  await B.getByRole("heading", { name: "Merci pour ce moment" }).waitFor({
    timeout: 60000,
  });
  await B.locator('[data-testid="partage"][data-loaded="true"]').waitFor({
    timeout: 60000,
  });
  check("le second joueur obtient sa propre carte", true);
  await B.getByTestId("partage-copy").click();
  await B.waitForTimeout(600);
  const clipboard = await B.evaluate(() => navigator.clipboard.readText());
  check(
    "la copie reprend le texte de la carte",
    clipboard.includes("réponses identiques") && clipboard.length > 20,
    clipboard.slice(0, 60),
  );

  // --- Mise en page -------------------------------------------------
  await A.waitForTimeout(600);
  const overflow = await A.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  check(
    "bilan sans débordement horizontal (mobile)",
    overflow <= 1,
    `${overflow}px`,
  );

  await browser.close();
  finish();
})().catch((error) => {
  log("\nERREUR:", error.message);
  process.exit(1);
});
