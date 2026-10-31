const { execFileSync } = require("node:child_process");
const path = require("node:path");
const {
  BASE,
  log,
  check,
  launchBrowser,
  finish,
} = require("./helpers.cjs");

/**
 * Cycle de vie différé (§13) : relance douce J+1/J+3, expiration, clôture
 * assistée, et rappel affiché dans « Notre espace » (§14).
 *
 * Le balayage temporel est déclenché via la commande d'exploitation
 * `sessions.lifecycleSweep` avec une horloge injectée — pas d'attente réelle.
 *
 *   npm run dev
 *   node tests/differe.cjs
 */

const ADMIN_KEY =
  process.env.ADMIN_KEY || "3c5d8188016287357c692c61b6a0367fdb5a7a4bf613c655";
const ROOT = path.join(__dirname, "..");

/** Déclenche le balayage de cycle de vie à une date donnée. */
function sweep(nowMs) {
  const out = execFileSync(
    "npx",
    [
      "convex",
      "run",
      "sessions:lifecycleSweep",
      JSON.stringify({ adminKey: ADMIN_KEY, now: nowMs }),
    ],
    { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
  return JSON.parse(out.slice(out.indexOf("{")));
}

async function acceptConsent(page) {
  const banner = page.getByTestId("consent-banner");
  try {
    await banner.waitFor({ state: "visible", timeout: 8000 });
    await banner.getByRole("button", { name: "Tout accepter" }).click();
    await banner.waitFor({ state: "hidden", timeout: 8000 });
  } catch {
    /* déjà décidé : rien à faire */
  }
}

(async () => {
  const browser = await launchBrowser();
  const view = { viewport: { width: 430, height: 932 } };

  const ctxA = await browser.newContext(view);
  const A = await ctxA.newPage();
  A.on("pageerror", (error) => log("  [A erreur JS]", error.message));

  // --- 1. Créer une partie en mode « Différé » ------------------------
  await A.goto(`${BASE}/explorer/eclats-de-rire`, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  await acceptConsent(A);
  await A.getByRole("link", { name: "Lancer" }).first().waitFor({ timeout: 60000 });
  await A.getByRole("link", { name: "Lancer" }).first().click();
  await A.waitForURL(/\/nouvelle\//, { timeout: 120000 });

  await A.getByPlaceholder("Ex. Awa").fill("Awa");
  await A.getByRole("button", { name: "Différé" }).click();
  await A.getByRole("button", { name: "Créer la partie" }).click();
  await A.waitForURL(/\/partie\//, { timeout: 120000 });
  const token = A.url().split("/partie/")[1];
  log("\n1. Partie différée créée — token:", token);

  await A.getByText("Inviter mon partenaire").waitFor({ timeout: 60000 });
  check("la partie attend le partenaire (personne n'a rejoint)", true);

  // --- 2. Relance douce (J+2) ----------------------------------------
  const day = 24 * 60 * 60 * 1000;
  const nudge = sweep(Date.now() + 2 * day);
  check("le balayage produit une relance", nudge.nudged >= 1, JSON.stringify(nudge));
  log("\n2. Relance douce (J+2)");

  await A.goto(`${BASE}/notre-espace`, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  const section = A.getByTestId("notifications-section");
  await section.waitFor({ timeout: 60000 });
  const hasRelance = (await section.innerText()).includes(
    "n'a pas encore répondu",
  );
  check("le rappel apparaît dans « Notre espace »", hasRelance);

  // --- 3. Expiration (J+8) -------------------------------------------
  const expire = sweep(Date.now() + 8 * day);
  check("le balayage matérialise l'expiration", expire.expired >= 1, JSON.stringify(expire));
  log("\n3. Expiration (J+8)");

  await A.goto(`${BASE}/mes-parties`, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  const card = A.getByTestId("party-card").first();
  await card.waitFor({ timeout: 60000 });
  check(
    "la partie expirée est signalée comme telle",
    (await card.innerText()).includes("Expirée"),
  );

  // --- 4. Relance puis clôture assistée ------------------------------
  await card.getByTestId("party-relance").click();
  // La relance replace la partie en attente : on la retrouve au rechargement.
  await A.waitForTimeout(1500);
  log("\n4. Relance puis clôture assistée");

  await A.reload({ waitUntil: "domcontentloaded", timeout: 120000 });
  const cardAfter = A.getByTestId("party-card").first();
  await cardAfter.waitFor({ timeout: 60000 });
  check(
    "après relance, la partie repasse en attente",
    (await cardAfter.innerText()).includes("En attente"),
  );

  await cardAfter.getByTestId("party-close").click();
  await cardAfter.getByTestId("party-close-confirm").click();
  await A.getByText("Clôturée").first().waitFor({ timeout: 30000 });
  check("la partie peut être clôturée en gardant ses réponses", true);

  await A.screenshot({ path: "/tmp/duoplay-differe.png" });

  await browser.close();
  finish();
})().catch((error) => {
  log("\nERREUR:", error.message);
  process.exit(1);
});
