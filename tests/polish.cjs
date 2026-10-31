const {
  BASE,
  log,
  check,
  launchBrowser,
  finish,
} = require("./helpers.cjs");

/**
 * Test de bout en bout du polish (Phase 8) : accessibilité, animations
 * respectueuses du système, hors ligne, invitation à installer, états d'erreur.
 *
 *   npm run dev
 *   node tests/polish.cjs
 */

(async () => {
  const browser = await launchBrowser();
  const viewport = { width: 430, height: 932 };
  const ctx = await browser.newContext({ viewport });
  const A = await ctx.newPage();
  A.on("pageerror", (error) => log("  [erreur JS]", error.message));

  // 1. Cible de saut clavier ------------------------------------------
  await A.goto(`${BASE}/accueil`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await A.getByRole("heading", { level: 1 }).waitFor({ timeout: 60000 });

  const skip = A.getByRole("link", { name: "Aller au contenu" });
  check("cible de saut présente", (await skip.count()) === 1);
  const topBefore = await skip.evaluate(
    (node) => node.getBoundingClientRect().top,
  );
  await skip.focus();
  await A.waitForTimeout(250);
  const topAfter = await skip.evaluate(
    (node) => node.getBoundingClientRect().top,
  );
  check(
    "elle apparaît au focus clavier",
    topBefore < 0 && topAfter >= 0,
    `avant=${Math.round(topBefore)} après=${Math.round(topAfter)}`,
  );
  check(
    "elle pointe vers la zone de contenu",
    (await skip.getAttribute("href")) === "#contenu" &&
      (await A.locator("#contenu").count()) === 1,
  );

  // 2. Structure et focus --------------------------------------------
  for (const route of ["/accueil", "/explorer", "/notre-espace", "/parcours"]) {
    await A.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded", timeout: 120000 });
    await A.waitForTimeout(500);
    check(`un seul h1 sur ${route}`, (await A.getByRole("heading", { level: 1 }).count()) === 1);
  }

  await A.goto(`${BASE}/nouvelle/nos-reves`, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  await A.getByTestId("adjust").waitFor({ timeout: 60000 });
  await A.waitForTimeout(500);
  await A.keyboard.press("Tab");
  const focus = await A.evaluate(() => {
    const el = document.activeElement;
    if (!el) return null;
    const style = window.getComputedStyle(el);
    return {
      tag: el.tagName,
      ...(style.outlineStyle !== "none" ? { outline: style.outlineStyle } : {}),
      ring: style.getPropertyValue("--tw-ring-shadow") || "",
    };
  });
  check("le focus clavier reste visible", Boolean(focus?.outline || focus?.ring), JSON.stringify(focus));

  const contrast = await A.evaluate(() =>
    window
      .getComputedStyle(document.documentElement)
      .getPropertyValue("--muted-foreground")
      .trim(),
  );
  check(
    "texte secondaire assez contrasté (graphite-600)",
    /#a79ab2|rgb\(167,\s*154,\s*178\)/i.test(contrast),
    contrast,
  );

  // 3. Partie : progression, saisie, annonces --------------------------
  await A.getByPlaceholder("Ex. Awa").fill("Awa");
  await A.getByRole("button", { name: "Créer la partie" }).click();
  await A.waitForURL(/\/partie\//, { timeout: 120000 });
  await A.getByRole("button", { name: "Commencer à répondre" }).click();

  const bar = A.locator('[role="progressbar"]');
  await bar.waitFor({ timeout: 60000 });
  check(
    "la progression est exposée aux lecteurs d'écran",
    (await bar.getAttribute("aria-valuenow")) === "1" &&
      (await bar.getAttribute("aria-valuemax")) === "5" &&
      (await bar.getAttribute("aria-valuemin")) === "1",
    `now=${await bar.getAttribute("aria-valuenow")} max=${await bar.getAttribute("aria-valuemax")}`,
  );
  const announce = A.getByTestId("announce");
  check(
    "une région d'annonce vocale existe",
    (await announce.getAttribute("aria-live")) === "polite" &&
      (await announce.getAttribute("role")) === "status",
  );
  const animated = await A.evaluate(() => {
    const el = document.querySelector(".rise");
    return el ? window.getComputedStyle(el).animationDuration : null;
  });
  check(
    "animation de question active par défaut",
    animated !== null && parseFloat(animated) > 0,
    String(animated),
  );

  // 4. Hors ligne -----------------------------------------------------
  await A.goto(`${BASE}/accueil`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await ctx.setOffline(true);
  const banner = A.getByTestId("offline-banner");
  await banner.waitFor({ timeout: 20000 }).catch(() => {});
  check("le bandeau hors ligne apparaît", await banner.isVisible().catch(() => false));
  await ctx.setOffline(false);
  await A.waitForTimeout(600);
  check("il disparaît au retour du réseau", (await banner.count()) === 0);

  // 5. Invitation à installer, après une première partie --------------
  const played = await browser.newContext({ viewport });
  await played.addInitScript(() => {
    try {
      window.localStorage.setItem("duoplay:played", "1");
    } catch {
      /* stockage indisponible */
    }
  });
  const P = await played.newPage();
  P.on("pageerror", (error) => log("  [erreur JS install]", error.message));
  await P.goto(`${BASE}/accueil`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await P.getByRole("heading", { level: 1 }).waitFor({ timeout: 60000 });
  check(
    "pas d'invitation avant l'événement navigateur",
    (await P.getByTestId("install-prompt").count()) === 0,
  );

  const fire = () =>
    P.evaluate(() => {
      const event = new Event("beforeinstallprompt");
      Object.assign(event, {
        prompt: () => Promise.resolve(),
        userChoice: Promise.resolve({ outcome: "dismissed" }),
      });
      window.dispatchEvent(event);
    });

  // L'écouteur est posé à l'hydratation : on réémet jusqu'à ce qu'il réagisse.
  for (let i = 0; i < 20; i += 1) {
    if ((await P.getByTestId("install-prompt").count()) > 0) break;
    await P.waitForTimeout(500);
    await fire();
  }
  check(
    "l'invitation apparaît après une partie jouée",
    (await P.getByTestId("install-prompt").count()) > 0,
  );

  await P.getByRole("button", { name: "Ne plus proposer l'installation" }).click();
  await P.waitForTimeout(400);
  check("le refus est respecté", (await P.getByTestId("install-prompt").count()) === 0);
  for (let i = 0; i < 4; i += 1) {
    await fire();
    await P.waitForTimeout(300);
  }
  check(
    "elle ne revient plus après refus",
    (await P.getByTestId("install-prompt").count()) === 0,
  );
  await played.close();

  // 6. Animations : prefers-reduced-motion ----------------------------
  const calm = await browser.newContext({
    viewport,
    reducedMotion: "reduce",
  });
  const C = await calm.newPage();
  await C.goto(`${BASE}/nouvelle/nos-reves`, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  await C.getByPlaceholder("Ex. Awa").fill("Binah");
  await C.getByRole("button", { name: "Créer la partie" }).click();
  await C.waitForURL(/\/partie\//, { timeout: 120000 });
  await C.getByRole("button", { name: "Commencer à répondre" }).click();
  await C.locator(".rise").first().waitFor({ timeout: 60000 });
  const duration = await C.evaluate(() => {
    const el = document.querySelector(".rise");
    return el ? window.getComputedStyle(el).animationDuration : null;
  });
  check(
    "animations neutralisées si le système le demande",
    duration === null || parseFloat(duration) <= 0.01,
    String(duration),
  );
  await calm.close();

  // 7. Poids & états d'erreur -----------------------------------------
  const fonts = await A.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .map((entry) => entry.name)
      .filter((name) => /fonts\.(googleapis|gstatic)/.test(name)),
  );
  check("aucune police téléchargée (pile système)", fonts.length === 0, `${fonts.length}`);

  await A.goto(`${BASE}/page-introuvable-test`, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  await A.getByRole("heading", { level: 1 }).waitFor({ timeout: 60000 });
  check(
    "page inconnue : message clair et porte de sortie",
    (await A.getByText("Cette page n'existe pas").count()) > 0 &&
      (await A.getByRole("link", { name: "Revenir à l'accueil" }).count()) > 0,
  );

  await A.goto(`${BASE}/hors-ligne`, { waitUntil: "domcontentloaded", timeout: 120000 });
  check(
    "écran hors ligne servi avec une action",
    (await A.getByRole("heading", { name: "Pas de connexion" }).count()) > 0 &&
      (await A.getByRole("link", { name: "Réessayer" }).count()) > 0,
  );

  await A.screenshot({ path: "/tmp/duoplay-polish.png" });
  await browser.close();
  finish();
})().catch((error) => {
  log("\nERREUR:", error.message);
  process.exit(1);
});
