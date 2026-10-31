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
 * Présence du partenaire (§3.B) — le bandeau « X est là » ne doit **jamais**
 * être un faux signal.
 *
 * On vérifie ici ce qui est observable sans couple : le battement de cœur est
 * bien posé côté serveur, l'état reste neutre tant qu'aucun partenaire n'est
 * relié, et l'écriture de présence est fermée au client (clé serveur requise).
 * Les états « est là » / « vu il y a … » sont couverts par `engagement.cjs`,
 * où un couple existe réellement.
 *
 *   npm run dev
 *   node tests/presence.cjs
 */

const ADMIN_KEY =
  process.env.ADMIN_KEY || "3c5d8188016287357c692c61b6a0367fdb5a7a4bf613c655";
const ROOT = path.join(__dirname, "..");

/**
 * Le bandeau de présence est rendu deux fois (barre du haut + îlot). Sur mobile
 * seule la barre du haut est visible : on cible donc explicitement celle-là.
 */
function visiblePresence(page) {
  return page.locator('[data-testid="presence"]:visible').first();
}

function convex(fn, args) {
  const out = execFileSync(
    "npx",
    ["convex", "run", fn, JSON.stringify(args)],
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

  const ctx = await browser.newContext(view);
  const page = await ctx.newPage();
  page.on("pageerror", (error) => log("  [erreur JS]", error.message));

  await page.goto(`${BASE}/accueil`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await waitForHydration(page);
  await acceptConsent(page);

  const token = await page.evaluate(() =>
    window.localStorage.getItem("duoplay:device"),
  );
  check(
    "l'appareil a un identifiant local",
    typeof token === "string" && token.length >= 8,
    String(token).slice(0, 6) + "…",
  );

  // 1. Le battement de cœur est posé côté serveur --------------------
  const startedAt = Date.now();
  let lastSeenAt = null;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const seen = convex("presence:readForOps", {
      adminKey: ADMIN_KEY,
      deviceToken: token,
    });
    if (typeof seen.lastSeenAt === "number") {
      lastSeenAt = seen.lastSeenAt;
      break;
    }
    await page.waitForTimeout(500);
  }
  check(
    "battement de cœur enregistré au chargement",
    typeof lastSeenAt === "number" && lastSeenAt >= startedAt - 60 * 1000,
    lastSeenAt ? new Date(lastSeenAt).toISOString() : "aucun",
  );

  // 2. Sans partenaire : état neutre, jamais « est là » --------------
  const presence = visiblePresence(page);
  await presence.waitFor({ timeout: 60000 });
  const text = await presence.innerText();
  check(
    "sans partenaire, état neutre (« À deux »)",
    (await presence.getAttribute("data-state")) === "duo",
    text,
  );
  check("aucun faux signal « est là »", !text.includes("est là"), text);

  // 3. Vieillir son propre battement ne change rien (aucun partenaire)
  convex("presence:touchForOps", {
    adminKey: ADMIN_KEY,
    deviceToken: token,
    at: Date.now() - 45 * 60 * 1000,
  });
  await page.reload({ waitUntil: "domcontentloaded", timeout: 120000 });
  await waitForHydration(page);
  const afterAge = visiblePresence(page);
  await afterAge.waitFor({ timeout: 60000 });
  check(
    "un appareil seul reste neutre, même « absent »",
    (await afterAge.getAttribute("data-state")) === "duo",
    await afterAge.innerText(),
  );

  // 4. L'écriture de présence exige la clé serveur ------------------
  let refused = false;
  try {
    convex("presence:touchForOps", {
      adminKey: "cle-invalide",
      deviceToken: token,
      at: Date.now(),
    });
  } catch {
    refused = true;
  }
  check("battement d'un tiers refusé sans clé serveur", refused);

  await page.screenshot({ path: "/tmp/duoplay-presence.png" });
  await browser.close();
  finish();
})().catch((error) => {
  log("\nERREUR:", error.message);
  process.exit(1);
});
