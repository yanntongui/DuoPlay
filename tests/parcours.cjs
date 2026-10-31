const {
  BASE,
  log,
  check,
  playAll,
  launchBrowser,
  finish,
} = require("./helpers.cjs");

/**
 * Test de bout en bout des parcours guidés (Phase 4) :
 * catalogue, démarrage, étapes (mission et jeu), validation automatique à la
 * fin d'une partie, récapitulatif, suivi dans « Notre espace ».
 *
 *   npm run dev
 *   node tests/parcours.cjs
 */

const JOURNEY = "nos-plus-beaux-souvenirs";
const JOURNEY_TITLE = "Nos plus beaux souvenirs";

(async () => {
  const browser = await launchBrowser();
  const view = { viewport: { width: 430, height: 932 } };

  // --- A ------------------------------------------------------------
  const ctxA = await browser.newContext(view);
  const A = await ctxA.newPage();
  A.on("pageerror", (error) => log("  [A erreur JS]", error.message));

  // 1. Catalogue ----------------------------------------------------
  await A.goto(`${BASE}/parcours`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await A.getByText(JOURNEY_TITLE).first().waitFor({ timeout: 60000 });
  const cards = await A.getByRole("heading", { level: 2 }).count();
  check("catalogue des parcours disponible", cards >= 5, `${cards} parcours`);

  // 2. Détail et démarrage ------------------------------------------
  await A.getByText(JOURNEY_TITLE).first().click();
  await A.waitForURL(new RegExp(`/parcours/${JOURNEY}$`), { timeout: 120000 });
  await A.getByTestId("journey-start").waitFor({ timeout: 60000 });
  const stepCount = await A.getByTestId("journey-step").count();
  check("les étapes du parcours sont listées", stepCount === 3, `${stepCount} étapes`);

  await A.getByTestId("journey-start").click();
  await A.getByTestId("journey-progress").waitFor({ state: "attached", timeout: 60000 });
  const width0 = await A.getByTestId("journey-progress").getAttribute("style");
  check("progression initiale à zéro", /width:\s*0%/.test(width0 ?? ""), width0 ?? "");

  // 3. Étape 1 : mission --------------------------------------------
  await A.getByTestId("journey-done").first().click();
  await A.getByTestId("journey-step-complete").first().waitFor({ timeout: 60000 });
  const width1 = await A.getByTestId("journey-progress").getAttribute("style");
  check("une mission validée fait progresser le parcours", /33%/.test(width1 ?? ""), width1 ?? "");

  // 4. Accueil : parcours en cours ----------------------------------
  await A.goto(`${BASE}/accueil`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await A.getByTestId("journey-active-progress").waitFor({ state: "attached", timeout: 60000 });
  check(
    "l'accueil met en avant le parcours en cours",
    (await A.getByText(JOURNEY_TITLE).count()) > 0,
  );

  // 5. Étape 3 : mission --------------------------------------------
  await A.goto(`${BASE}/parcours/${JOURNEY}`, { waitUntil: "domcontentloaded", timeout: 120000 });
  const last = A.getByTestId("journey-step").last();
  await last.getByTestId("journey-done").click();
  await A.waitForTimeout(600);

  // 6. Étape 2 : jeu, relié au parcours ------------------------------
  const gameStep = A.getByTestId("journey-step").nth(1);
  await gameStep.getByTestId("journey-launch").click();
  await A.waitForURL(/\/nouvelle\/.+\?journey=/, { timeout: 120000 });
  const banner = await A.getByTestId("journey-banner").innerText();
  check("la partie est présentée comme une étape du parcours", banner.includes("2"), banner.trim().slice(0, 40));

  await A.getByPlaceholder("Ex. Awa").fill("Awa");
  await A.getByRole("button", { name: "Créer la partie" }).click();
  await A.waitForURL(/\/partie\//, { timeout: 120000 });
  const room = A.url();
  log("\nPartie d'étape créée :", room.split("/partie/")[1].slice(0, 8) + "…");

  // --- B ------------------------------------------------------------
  const ctxB = await browser.newContext(view);
  const B = await ctxB.newPage();
  B.on("pageerror", (error) => log("  [B erreur JS]", error.message));

  await B.goto(room, { waitUntil: "domcontentloaded", timeout: 120000 });
  await B.getByPlaceholder("Ex. Koffi").fill("Koffi");
  await B.getByRole("button", { name: "Rejoindre la partie" }).click();
  await B.getByTestId("counter").waitFor({ timeout: 60000 });
  await A.getByTestId("counter").waitFor({ timeout: 60000 });
  log("Koffi a rejoint la partie d'étape");

  await Promise.all([playAll(A, "Awa"), playAll(B, "Koffi")]);
  await A.getByRole("heading", { name: /Merci pour ce moment|Presque terminé/ }).waitFor({ timeout: 60000 });
  check("la partie d'étape se termine normalement", true);

  // 7. Validation automatique de l'étape -----------------------------
  await A.goto(`${BASE}/parcours/${JOURNEY}`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await A.getByText("Terminé").first().waitFor({ timeout: 60000 });
  const widthFinal = await A.getByTestId("journey-progress").getAttribute("style");
  check(
    "la partie terminée vaut étape validée (3/3)",
    /100%/.test(widthFinal ?? ""),
    widthFinal ?? "",
  );

  const recapLink = A.getByRole("link", { name: /récapitulatif/ });
  await recapLink.waitFor({ timeout: 30000 });
  await recapLink.click();
  await A.waitForURL(new RegExp(`/parcours/${JOURNEY}/recapitulatif$`), { timeout: 120000 });

  // 8. Récapitulatif -------------------------------------------------
  await A.getByText("Parcours terminé").first().waitFor({ timeout: 60000 });
  const days = (await A.getByTestId("recap-days").innerText()).trim();
  const recapSteps = await A.getByTestId("recap-step").count();
  check("récapitulatif : toutes les étapes traversées", days === "3" && recapSteps === 3, `${days} jours · ${recapSteps} étapes`);

  const played = await A.getByText(/Jeu :/).count();
  check("récapitulatif : le jeu joué est identifié", played === 1, `${played}`);

  await A.screenshot({ path: "/tmp/duoplay-recap-parcours.png" });

  // 9. Suivi dans « Notre espace », des deux côtés --------------------
  await A.goto(`${BASE}/notre-espace`, { waitUntil: "domcontentloaded", timeout: 120000 });
  const aSpace = A.getByText("Parcours suivis");
  await aSpace.waitFor({ timeout: 60000 });
  const aCompleted = await A
    .getByText("Parcours terminé")
    .first()
    .waitFor({ timeout: 60000 })
    .then(() => A.getByText("Parcours terminé").count())
    .catch(() => 0);
  check("Awa voit le parcours terminé dans son espace", aCompleted > 0);

  await B.goto(`${BASE}/notre-espace`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await B.getByText("Parcours suivis").waitFor({ timeout: 60000 });
  // La progression du partenaire arrive par la souscription Convex : on la
  // laisse se poser avant de compter, plutôt que de lire au premier rendu.
  const bSeen = await B.getByText("Parcours terminé")
    .first()
    .waitFor({ timeout: 30000 })
    .then(() => true)
    .catch(() => false);
  const bCompleted = bSeen ? await B.getByText("Parcours terminé").count() : 0;
  const bJourney = await B.getByText(JOURNEY_TITLE).count();
  check(
    "Koffi (invité) a aussi validé l'étape",
    bCompleted > 0 && bJourney > 0,
    `${bCompleted} terminé · ${bJourney} titre`,
  );

  // 10. Accueil après achèvement -------------------------------------
  await A.goto(`${BASE}/accueil`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await A.getByText("Parcours guidé").waitFor({ timeout: 60000 });
  const hint = A.getByText("Envie d'être guidé ?");
  await hint.waitFor({ timeout: 60000 }).catch(() => {});
  check(
    "l'accueil propose de découvrir les parcours",
    await hint.isVisible().catch(() => false),
  );
  check(
    "plus de parcours en cours mis en avant",
    (await A.getByTestId("journey-active-progress").count()) === 0,
  );

  await browser.close();
  finish();
})().catch((error) => {
  log("\nERREUR:", error.message);
  process.exit(1);
});
