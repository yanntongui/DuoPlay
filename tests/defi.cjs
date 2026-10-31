const { execFileSync } = require("node:child_process");
const path = require("node:path");
const {
  BASE,
  log,
  check,
  launchBrowser,
  waitForHydration,
  finish,
} = require("./helpers.cjs");

/**
 * Défi du jour « de couple » (§3.D, §11.6) :
 *  - le défi affiché est bien celui figé en base par le serveur ;
 *  - **anti-répétition** : deux jours consécutifs ne peuvent pas servir la même
 *    question (les questions des 30 derniers jours sont écartées) ;
 *  - le tirage reste **déterministe** : régénérer un jour redonne le même défi ;
 *  - la série affichée est celle de l'appareil tant qu'aucun couple n'est relié
 *    (la série « à deux » est vérifiée dans `engagement.cjs`).
 *
 * Les jours manipulés sont volontairement **anciens** (J-40, J-39) pour ne rien
 * perturber dans les données du jour.
 *
 *   npm run dev
 *   node tests/defi.cjs
 */

const ADMIN_KEY =
  process.env.ADMIN_KEY || "3c5d8188016287357c692c61b6a0367fdb5a7a4bf613c655";
const ROOT = path.join(__dirname, "..");
const DAY_MS = 24 * 60 * 60 * 1000;

function convex(fn, args) {
  const out = execFileSync("npx", ["convex", "run", fn, JSON.stringify(args)], {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
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
  // --- 1. Anti-répétition (sans navigateur) ------------------------
  const olderDay = Date.now() - 40 * DAY_MS;
  const recentDay = Date.now() - 39 * DAY_MS;

  convex("daily:resetForOps", { adminKey: ADMIN_KEY, now: olderDay });
  convex("daily:resetForOps", { adminKey: ADMIN_KEY, now: recentDay });

  const older = convex("daily:ensureForOps", {
    adminKey: ADMIN_KEY,
    now: olderDay,
  });
  const recent = convex("daily:ensureForOps", {
    adminKey: ADMIN_KEY,
    now: recentDay,
  });

  check(
    "le défi d'un jour est bien figé avec sa question",
    Boolean(recent.questionId && recent.prompt),
    `${recent.date} · ${String(recent.prompt).slice(0, 40)}`,
  );
  check(
    "deux jours consécutifs ne servent pas la même question",
    older.questionId !== recent.questionId,
    `${older.date} ≠ ${recent.date}`,
  );

  const again = convex("daily:ensureForOps", {
    adminKey: ADMIN_KEY,
    now: recentDay,
  });
  check(
    "le défi d'un jour est déterministe (régénérer ne change rien)",
    again.questionId === recent.questionId && again.prompt === recent.prompt,
    again.date,
  );

  // --- 2. L'écran suit le serveur ----------------------------------
  const browser = await launchBrowser();
  const view = { viewport: { width: 430, height: 932 } };
  const ctx = await browser.newContext(view);
  const page = await ctx.newPage();
  page.on("pageerror", (error) => log("  [erreur JS]", error.message));

  const today = convex("daily:ensureForOps", {
    adminKey: ADMIN_KEY,
    now: Date.now(),
  });

  await page.goto(`${BASE}/defi`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await waitForHydration(page);
  await acceptConsent(page);

  await page.getByTestId("daily-prompt").waitFor({ timeout: 60000 });
  const shown = (await page.getByTestId("daily-prompt").innerText()).trim();
  check(
    "le défi affiché est celui du serveur",
    shown === today.prompt,
    today.date,
  );

  // --- 3. Participer : la série de l'appareil s'affiche ------------
  const option = page.getByTestId("daily-option").first();
  if (await option.count()) {
    await option.click();
  } else {
    await page.getByTestId("daily-answer").fill("Le premier soir, sous la pluie");
    await page.getByTestId("daily-submit").click();
  }
  await page.getByTestId("daily-done").waitFor({ timeout: 60000 });
  check("participation au défi enregistrée", true);

  const streak = page.getByTestId("streak");
  await streak.waitFor({ timeout: 60000 });
  check(
    "série de l'appareil affichée (aucun couple relié)",
    (await streak.getAttribute("data-scope")) === "solo",
    await streak.innerText(),
  );

  const history = page.getByText("Vos derniers défis").first();
  check(
    "défi du jour présent dans l'historique",
    await history.isVisible().catch(() => false),
  );

  await page.screenshot({ path: "/tmp/duoplay-defi-anti-repeat.png" });
  await browser.close();
  finish();
})().catch((error) => {
  log("\nERREUR:", error.message);
  process.exit(1);
});
