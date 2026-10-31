const {
  BASE,
  log,
  check,
  launchBrowser,
  finish,
} = require("./helpers.cjs");

/**
 * Compte léger (Phase 6) — création, code de récupération, reconnexion depuis
 * un second appareil, refus d'un code invalide.
 *
 *   npm run dev
 *   node tests/compte.cjs
 */

/** Accepte la bannière de consentement si elle est présente (sinon, tant pis). */
async function acceptConsent(page) {
  const banner = page.getByTestId("consent-banner");
  try {
    await banner.waitFor({ state: "visible", timeout: 8000 });
    await banner.getByRole("button", { name: "Tout accepter" }).click();
    await banner.waitFor({ state: "hidden", timeout: 8000 });
    return true;
  } catch {
    return false;
  }
}

(async () => {
  const browser = await launchBrowser();
  const view = { viewport: { width: 430, height: 932 } };

  // --- Appareil A : création du compte ------------------------------
  const ctxA = await browser.newContext(view);
  const A = await ctxA.newPage();
  A.on("pageerror", (error) => log("  [A erreur JS]", error.message));

  await A.goto(`${BASE}/compte`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await A.getByRole("heading", { level: 1, name: "Mon profil" }).waitFor({
    timeout: 60000,
  });
  log("\n1. Création d'un compte léger");

  const consented = await acceptConsent(A);
  check("la bannière de confidentialité s'affiche puis se ferme", consented);

  await A.getByTestId("account-name").fill("Awa");
  await A.getByTestId("account-create").click();

  const panel = A.getByTestId("account-panel");
  await panel.waitFor({ timeout: 60000 });
  check("le compte est créé et le profil s'affiche", await panel.isVisible());

  const code = (await A.getByTestId("account-recovery-code").innerText()).trim();
  check(
    "un code de récupération au format XXXX-XXXX-XXXX est remis",
    /^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(code),
    code,
  );

  // Persistance locale : un rechargement garde le compte.
  await A.reload({ waitUntil: "domcontentloaded", timeout: 120000 });
  const stillThere = await A.getByTestId("account-panel")
    .waitFor({ timeout: 60000 })
    .then(() => true)
    .catch(() => false);
  check("le compte persiste après rechargement", stillThere);
  const codeAfter = (
    await A.getByTestId("account-recovery-code").innerText()
  ).trim();
  check("le code reste consultable dans le profil", codeAfter === code, codeAfter);

  // --- Appareil B : code invalide puis reconnexion -------------------
  const ctxB = await browser.newContext(view);
  const B = await ctxB.newPage();
  B.on("pageerror", (error) => log("  [B erreur JS]", error.message));

  await B.goto(`${BASE}/compte`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await B.getByTestId("account-tab-signin").click();
  await B.getByTestId("account-recovery-input").fill("ZZZZ-ZZZZ-ZZZZ");
  await B.getByTestId("account-signin").click();
  await B.getByTestId("account-error").waitFor({ timeout: 30000 });
  check("un code invalide est refusé avec un message clair", true);
  log("\n2. Reconnexion depuis un second appareil");

  await B.getByTestId("account-recovery-input").fill(code);
  await B.getByTestId("account-signin").click();
  await B.getByTestId("account-panel").waitFor({ timeout: 60000 });
  check("le second appareil retrouve le compte", true);

  const nameB = (await B.getByTestId("account-panel").innerText()).includes("Awa");
  check("le second appareil affiche la même identité", nameB);

  await A.screenshot({ path: "/tmp/duoplay-compte.png" });

  await browser.close();
  finish();
})().catch((error) => {
  log("\nERREUR:", error.message);
  process.exit(1);
});
