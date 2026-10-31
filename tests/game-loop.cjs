const {
  BASE,
  log,
  check,
  answerCurrent,
  playAll,
  launchBrowser,
  finish,
} = require("./helpers.cjs");

/**
 * Test de bout en bout de la boucle de jeu (Phase 2).
 *
 *   npm run dev              # dans un premier terminal
 *   node tests/game-loop.cjs
 */

(async () => {
  const browser = await launchBrowser();
  const view = { viewport: { width: 430, height: 932 } };

  // --- Joueur A -----------------------------------------------------
  const ctxA = await browser.newContext(view);
  const A = await ctxA.newPage();
  A.on("pageerror", (error) => log("  [A erreur JS]", error.message));

  await A.goto(`${BASE}/explorer/eclats-de-rire`, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  await A.getByRole("link", { name: "Lancer" }).first().waitFor({ timeout: 60000 });
  const lancerCount = await A.getByRole("link", { name: "Lancer" }).count();
  check("univers affiche ses experiences", lancerCount > 0, `${lancerCount} experiences`);

  await A.getByRole("link", { name: "Lancer" }).first().click();
  await A.waitForURL(/\/nouvelle\//, { timeout: 120000 });
  await A.getByPlaceholder("Ex. Awa").fill("Awa");
  await A.getByRole("button", { name: "Créer la partie" }).click();
  await A.waitForURL(/\/partie\//, { timeout: 120000 });

  const room = A.url();
  const token = room.split("/partie/")[1];
  log("\n1. Partie créée — token:", token);

  await A.getByText("Inviter mon partenaire").waitFor({ timeout: 60000 });
  const shownUrl = (
    await A.getByText(new RegExp(`${BASE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/partie/`))
      .first()
      .innerText()
  ).trim();
  check("lien d'invitation affiche dans le lobby", shownUrl === room, shownUrl);

  const joinRes = await fetch(`${BASE}/join/${token}`, { redirect: "manual" });
  check(
    "/join/<token> redirige vers /partie/<token>",
    joinRes.status === 307 && (joinRes.headers.get("location") ?? "").includes(`/partie/${token}`),
    `${joinRes.status} -> ${joinRes.headers.get("location")}`,
  );

  // --- Joueur B (contexte isole = autre appareil) -------------------
  const ctxB = await browser.newContext(view);
  const B = await ctxB.newPage();
  B.on("pageerror", (error) => log("  [B erreur JS]", error.message));

  await B.goto(room, { waitUntil: "domcontentloaded", timeout: 120000 });
  await B.getByPlaceholder("Ex. Koffi").fill("Koffi");
  await B.getByRole("button", { name: "Rejoindre la partie" }).click();
  await B.getByTestId("counter").waitFor({ timeout: 60000 });
  log("2. Koffi a rejoint via le lien prive");

  // A passe du lobby au jeu par reactivite (sans recharger)
  await A.getByTestId("counter").waitFor({ timeout: 60000 });
  log("3. Awa est passee au jeu automatiquement (temps reel)");

  const counter = await A.getByTestId("counter").innerText();
  log("   ", counter.trim());

  // --- Question 1 : reponses masquees puis revelation ----------------
  const first = await answerCurrent(A);
  log("4. Awa a repondu (", first.kind, ")");
  await A.getByTestId("waiting").waitFor({ timeout: 30000 });
  const hidden = (await A.getByTestId("verdict").count()) === 0;
  check("la reponse reste masquee avant que Koffi reponde", hidden);

  await answerCurrent(B, first.value);
  log("5. Koffi a repondu (", first.kind, ")");

  await A.getByTestId("verdict").waitFor({ timeout: 30000 });
  await B.getByTestId("verdict").waitFor({ timeout: 30000 });
  const verdictA = (await A.getByTestId("verdict").innerText()).trim();
  const verdictB = (await B.getByTestId("verdict").innerText()).trim();
  check(
    "revelation simultanee identique des deux cotes",
    verdictA === verdictB,
    `Awa="${verdictA}" Koffi="${verdictB}"`,
  );
  if (first.kind === "choice") {
    check("reponse identique detectee", verdictA === "Même réponse", verdictA);
  }

  const followUp = await A.getByText(/Comparez vos réponses|Vous avez répondu la même chose|Vos réponses diffèrent|Racontez-vous/).count();
  check("suggestion de discussion affichee", followUp > 0);

  await A.screenshot({ path: "/tmp/duoplay-reveal.png", fullPage: false });

  // --- Deroule complet des deux joueurs -----------------------------
  await Promise.all([playAll(A, "Awa"), playAll(B, "Koffi")]);

  await A.getByRole("heading", { name: /Merci pour ce moment|Presque terminé/ }).waitFor({ timeout: 60000 });
  const recapTitle = (await A.getByRole("heading", { level: 1 }).first().innerText()).trim();
  log("6. Bilan atteint :", recapTitle);

  await B.getByRole("heading", { name: /Merci pour ce moment/ }).waitFor({ timeout: 60000 });
  check("session terminee apres que les deux aient fini", true);

  const pct = await A.getByText(/de réponses identiques/).count();
  check("taux de ressemblance affiche dans le bilan", pct > 0);

  await A.screenshot({ path: "/tmp/duoplay-recap.png", fullPage: false });

  // --- Reprise : rechargement en cours de partie --------------------
  const ctxC = await browser.newContext(view);
  const C = await ctxC.newPage();
  await C.goto(room, { waitUntil: "domcontentloaded", timeout: 120000 });
  let blocked = false;
  try {
    await C.getByRole("heading", {
      name: /Cette partie est complète|Cette partie est terminée|Ce lien a expiré/,
    }).waitFor({ timeout: 60000 });
    blocked = true;
  } catch {
    blocked = false;
  }
  check("un 3e appareil ne peut pas entrer", blocked);

  // Le joueur A retrouve sa partie (identite conservee localement)
  await A.reload({ waitUntil: "domcontentloaded", timeout: 120000 });
  const resumed = await A.getByRole("heading", {
    name: /Merci pour ce moment|Presque terminé/,
  }).waitFor({ timeout: 60000 }).then(() => true).catch(() => false);
  check("Awa retrouve sa partie apres rechargement (reprise)", resumed);

  await browser.close();
  finish();
})().catch((error) => {
  log("\nERREUR:", error.message);
  process.exit(1);
});
