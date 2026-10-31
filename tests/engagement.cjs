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

const ADMIN_KEY =
  process.env.ADMIN_KEY || "3c5d8188016287357c692c61b6a0367fdb5a7a4bf613c655";
const ROOT = path.join(__dirname, "..");

/** Vieillit le battement de cœur d'un appareil (outil d'exploitation). */
function agePresence(deviceToken, at) {
  const out = execFileSync(
    "npx",
    [
      "convex",
      "run",
      "presence:touchForOps",
      JSON.stringify({ adminKey: ADMIN_KEY, deviceToken, at }),
    ],
    { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
  return JSON.parse(out.slice(out.indexOf("{")));
}

/**
 * Test de bout en bout de l'engagement (Phase 3) :
 * défi du jour, favoris, historique, couple, « Notre espace ».
 *
 *   npm run dev
 *   node tests/engagement.cjs
 */

async function joinRoom(page, room, name) {
  await page.goto(room, { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.getByPlaceholder("Ex. Koffi").fill(name);
  await page.getByRole("button", { name: "Rejoindre la partie" }).click();
  await page.getByTestId("counter").waitFor({ timeout: 60000 });
}

(async () => {
  const browser = await launchBrowser();
  const view = { viewport: { width: 430, height: 932 } };

  // ---------------------------------------------------------------- A
  const ctxA = await browser.newContext(view);
  const A = await ctxA.newPage();
  A.on("pageerror", (error) => log("  [A erreur JS]", error.message));

  // 1. Défi du jour ------------------------------------------------
  await A.goto(`${BASE}/defi`, { waitUntil: "domcontentloaded", timeout: 120000 });
  const promptEl = A.getByTestId("daily-prompt");
  await promptEl.waitFor({ timeout: 60000 });
  const prompt = (await promptEl.innerText()).trim();
  log("\n1. Défi du jour :", prompt.slice(0, 60));

  let chosenValue = "";
  const option = A.getByTestId("daily-option").first();
  if (await option.count()) {
    chosenValue = (await option.innerText()).trim();
    await option.click();
  } else {
    chosenValue = "Savoir écouter sans interrompre";
    await A.getByTestId("daily-answer").fill(chosenValue);
    await A.getByTestId("daily-submit").click();
  }
  await A.getByTestId("daily-done").waitFor({ timeout: 60000 });
  check("participation au défi enregistrée", true, `« ${chosenValue} »`);

  await A.getByText(/jour de suite/).first().waitFor({ timeout: 30000 });
  const streak = (await A.getByText(/jour de suite/).first().innerText()).trim();
  check("série de jours affichée", streak.length > 0, streak);

  const dailyHistory = A.getByText("Vos derniers défis").first();
  await dailyHistory.waitFor({ timeout: 30000 }).catch(() => {});
  check(
    "défi passé listé dans l'historique",
    await dailyHistory.isVisible().catch(() => false),
  );

  // 2. Favori ------------------------------------------------------
  await A.goto(`${BASE}/explorer/eclats-de-rire`, { waitUntil: "domcontentloaded", timeout: 120000 });
  const firstTitle = (await A.locator("h2").first().innerText()).trim();
  await A.getByTestId("favorite").first().click();
  await A.waitForTimeout(800);
  const pressed = await A.getByTestId("favorite").first().getAttribute("aria-pressed");
  check("favori ajouté depuis l'univers", pressed === "true", `« ${firstTitle} »`);

  // 3. Création de partie -----------------------------------------
  await A.getByRole("link", { name: "Lancer" }).first().click();
  await A.waitForURL(/\/nouvelle\//, { timeout: 120000 });
  await A.getByPlaceholder("Ex. Awa").fill("Awa");
  await A.getByRole("button", { name: "Créer la partie" }).click();
  await A.waitForURL(/\/partie\//, { timeout: 120000 });
  const room = A.url();
  log("2. Partie créée :", room.split("/partie/")[1].slice(0, 8) + "…");

  // 4. Accueil : reprise ------------------------------------------
  await A.goto(`${BASE}/accueil`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await A.getByTestId("daily-prompt").waitFor({ timeout: 60000 });
  const resumeTitle = A.getByText(firstTitle).first();
  await resumeTitle.waitFor({ timeout: 60000 }).catch(() => {});
  check(
    "accueil propose la reprise de la partie",
    await resumeTitle.isVisible().catch(() => false),
    firstTitle,
  );
  check(
    "accueil affiche le défi du jour",
    (await A.getByText("Défi du jour").count()) > 0,
  );

  // 5. Notre espace ------------------------------------------------
  await A.goto(`${BASE}/notre-espace`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await A.getByText("Votre espace se construit à deux").waitFor({ timeout: 60000 });
  check("espace vide explicite avant le partenaire", true);

  const favoriteCard = A.getByText(firstTitle).first();
  await favoriteCard.waitFor({ timeout: 60000 }).catch(() => {});
  check(
    "favori visible dans Notre espace",
    await favoriteCard.isVisible().catch(() => false),
    firstTitle,
  );

  const historyCard = A.getByText("En cours").first();
  await historyCard.waitFor({ timeout: 60000 }).catch(() => {});
  check(
    "historique visible dans Notre espace",
    await historyCard.isVisible().catch(() => false),
  );

  const resumeLink = A.getByRole("link", { name: /Reprendre/ }).first();
  await resumeLink.waitFor({ timeout: 60000 }).catch(() => {});
  check(
    "reprise proposée depuis l'historique",
    await resumeLink.isVisible().catch(() => false),
  );

  await A.getByText("Parcours suivis").waitFor({ timeout: 60000 });
  check(
    "parcours guidés disponibles (Phase 4)",
    await A.getByText("Aucun parcours suivi").isVisible().catch(() => false),
  );

  // ---------------------------------------------------------------- B
  const ctxB = await browser.newContext(view);
  const B = await ctxB.newPage();
  B.on("pageerror", (error) => log("  [B erreur JS]", error.message));
  await joinRoom(B, room, "Koffi");
  log("3. Koffi a rejoint — le couple est créé");

  // 6. Le couple apparaît des deux côtés ---------------------------
  await A.goto(`${BASE}/notre-espace`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await A.getByText(/Awa & Koffi/).waitFor({ timeout: 60000 });
  check("Awa voit « Awa & Koffi »", true);

  await B.goto(`${BASE}/notre-espace`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await B.getByText(/Koffi & Awa/).waitFor({ timeout: 60000 });
  check("Koffi voit « Koffi & Awa »", true);

  const stats = await A.locator("div.grid > div").allInnerTexts();
  check("statistiques du couple affichées", stats.length === 3, stats.join(" | ").replace(/\n/g, "="));

  // 6 bis. Présence **vérifiée côté serveur** -----------------------
  await A.goto(`${BASE}/accueil`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await waitForHydration(A);
  const presenceB = B.locator('[data-testid="presence"]:visible').first();
  await presenceB.waitFor({ timeout: 60000 });
  await B.waitForFunction(
    () =>
      document
        .querySelector('[data-testid="presence"]:not(.hidden)')
        ?.getAttribute("data-state") === "here",
    undefined,
    { timeout: 45000 },
  ).catch(() => {});
  check(
    "Koffi voit qu'Awa est là (battement récent)",
    (await presenceB.getAttribute("data-state")) === "here",
    await presenceB.innerText(),
  );

  const deviceA = await A.evaluate(() =>
    window.localStorage.getItem("duoplay:device"),
  );
  // Awa s'éloigne : on ferme son onglet et on vieillit son battement.
  await A.goto("about:blank");
  agePresence(deviceA, Date.now() - 12 * 60 * 1000);
  await B.waitForFunction(
    () =>
      document
        .querySelector('[data-testid="presence"]:not(.hidden)')
        ?.getAttribute("data-state") === "seen",
    undefined,
    { timeout: 30000 },
  ).catch(() => {});
  check(
    "après absence, « vu il y a … » remplace « est là »",
    (await presenceB.getAttribute("data-state")) === "seen" &&
      (await presenceB.innerText()).includes("vu"),
    await presenceB.innerText(),
  );

  // 7. Le défi du jour devient partagé -----------------------------
  await B.goto(`${BASE}/defi`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await B.getByTestId("daily-prompt").waitFor({ timeout: 60000 });
  const samePrompt = (await B.getByTestId("daily-prompt").innerText()).trim();
  check("le même défi est présenté aux deux appareils", samePrompt === prompt);

  const bOption = B.getByTestId("daily-option").first();
  let bValue;
  if (await bOption.count()) {
    bValue = (await bOption.innerText()).trim();
    await bOption.click();
  } else {
    bValue = "Koffi sait garder un secret";
    await B.getByTestId("daily-answer").fill(bValue);
    await B.getByTestId("daily-submit").click();
  }
  await B.getByTestId("daily-done").waitFor({ timeout: 60000 });

  const bSeesA = B.getByTestId("daily-partner");
  await bSeesA.waitFor({ timeout: 60000 });
  check(
    "Koffi voit la réponse d'Awa au défi du jour",
    (await bSeesA.innerText()).includes(chosenValue),
    chosenValue,
  );

  await A.goto(`${BASE}/defi`, { waitUntil: "domcontentloaded", timeout: 120000 });
  const aSeesB = A.getByTestId("daily-partner");
  await aSeesB.waitFor({ timeout: 60000 });
  check(
    "Awa voit la réponse de Koffi au défi du jour",
    (await aSeesB.innerText()).includes(bValue),
    bValue,
  );
  check(
    "série de jours persistée",
    (await A.getByTestId("streak").count()) > 0,
  );

  const streakA = A.getByTestId("streak");
  check(
    "série **à deux** dès que le couple a participé",
    (await streakA.getAttribute("data-scope")) === "couple" &&
      /à deux/.test(await streakA.innerText()),
    await streakA.innerText(),
  );

  await B.screenshot({ path: "/tmp/duoplay-defi.png" });
  await A.goto(`${BASE}/notre-espace`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await A.getByText("Awa & Koffi").waitFor({ timeout: 60000 });
  await A.screenshot({ path: "/tmp/duoplay-espace.png" });

  await browser.close();
  finish();
})().catch((error) => {
  log("\nERREUR:", error.message);
  process.exit(1);
});
