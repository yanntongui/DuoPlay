const {
  BASE,
  log,
  check,
  launchBrowser,
  finish,
} = require("./helpers.cjs");

/**
 * Test de bout en bout de la personnalisation (Phase 5) :
 * ambiance, profondeur, thèmes à éviter, préférences retenues,
 * et « passer sans justification ».
 *
 *   npm run dev
 *   node tests/personnalisation.cjs
 */

const EXPERIENCE = "nos-reves";

(async () => {
  const browser = await launchBrowser();
  const ctx = await browser.newContext({ viewport: { width: 430, height: 932 } });
  const A = await ctx.newPage();
  A.on("pageerror", (error) => log("  [erreur JS]", error.message));

  // 1. Ambiance ------------------------------------------------------
  await A.goto(`${BASE}/explorer`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await A.getByText("Éclats de rire").first().waitFor({ timeout: 60000 });
  const allUniverses = await A.getByRole("heading", { level: 3 }).count();
  check("tous les univers affichés par défaut", allUniverses >= 6, `${allUniverses}`);

  await A.getByTestId("mood-rire").click();
  await A.waitForURL(/ambiance=rire/, { timeout: 120000 });
  await A.waitForTimeout(400);
  const rireVisible = await A.getByText("Éclats de rire").count();
  const tendresseHidden = await A.getByText("Cœur à cœur").count();
  check(
    "l'ambiance filtre les univers",
    rireVisible > 0 && tendresseHidden === 0,
    `rire=${rireVisible} tendresse=${tendresseHidden}`,
  );

  await A.getByTestId("mood-all").click();
  await A.waitForTimeout(400);
  check(
    "on revient à tous les univers",
    (await A.getByText("Cœur à cœur").count()) > 0,
  );

  // 2. Ajuster : profondeur et thèmes --------------------------------
  await A.goto(`${BASE}/nouvelle/${EXPERIENCE}`, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  const planned = A.getByTestId("planned-count");
  await planned.waitFor({ timeout: 60000 });
  check("le volume de questions est annoncé", (await planned.innerText()).includes("5"), await planned.innerText());

  await A.getByTestId("depth-moyen").click();
  await A.waitForTimeout(500);
  check(
    "la profondeur réduit le volume",
    (await planned.innerText()).includes("4"),
    await planned.innerText(),
  );

  await A.getByTestId("theme-voyage").click();
  await A.waitForTimeout(500);
  check(
    "un thème écarté réduit encore le volume",
    (await planned.innerText()).includes("3"),
    await planned.innerText(),
  );

  // 3. La partie ne contient que les questions retenues ---------------
  await A.getByPlaceholder("Ex. Awa").fill("Awa");
  await A.getByRole("button", { name: "Créer la partie" }).click();
  await A.waitForURL(/\/partie\//, { timeout: 120000 });

  // L'invité n'est pas encore là : on commence quand même (mode différé).
  await A.getByRole("button", { name: "Commencer à répondre" }).click();
  await A.getByTestId("counter").waitFor({ timeout: 60000 });
  const counter = await A.getByTestId("counter").innerText();
  check("la partie ne contient que les questions retenues", counter.includes("sur 3"), counter);

  const prefs = await A.getByTestId("personalization").innerText();
  check(
    "les préférences appliquées sont affichées",
    prefs.includes("Moyen") && prefs.includes("1 thème écarté"),
    prefs.trim().slice(0, 70),
  );

  // 4. Passer sans justification --------------------------------------
  const skipLabel = await A.getByTestId("skip").innerText();
  check("le passage est proposé sans justification", /sans justification/i.test(skipLabel), skipLabel);

  await A.getByTestId("skip").click();
  await A.getByTestId("next").waitFor({ timeout: 60000 });
  check(
    "on avance sans rien avoir à justifier",
    (await A.getByTestId("next").isVisible()) &&
      (await A.getByRole("textbox").count()) === 0,
  );

  // Le partenaire arrive : le passage devient visible des deux côtés.
  const room = A.url();
  const token = room.split("/partie/")[1];
  const ctxB = await browser.newContext({ viewport: { width: 430, height: 932 } });
  const B = await ctxB.newPage();
  B.on("pageerror", (error) => log("  [B erreur JS]", error.message));
  await B.goto(room, { waitUntil: "domcontentloaded", timeout: 120000 });
  await B.getByPlaceholder("Ex. Koffi").fill("Koffi");
  await B.getByRole("button", { name: "Rejoindre la partie" }).click();
  await A.getByTestId("passed").waitFor({ timeout: 60000 });
  const passed = await A.getByTestId("passed").innerText();
  check("passer une question ne demande rien", /justifier/i.test(passed), passed.trim().slice(0, 60));
  check("la partie reste à deux", Boolean(token), token.slice(0, 6) + "…");

  // 5. Préférences retenues sur l'appareil ----------------------------
  await A.goto(`${BASE}/nouvelle/${EXPERIENCE}`, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  await A.getByTestId("planned-count").waitFor({ timeout: 60000 });
  await A.waitForTimeout(800);
  const depthPressed = await A.getByTestId("depth-moyen").getAttribute("aria-pressed");
  const themePressed = await A.getByTestId("theme-voyage").getAttribute("aria-pressed");
  check(
    "profondeur et thème écarté sont retenus",
    depthPressed === "true" && themePressed === "true",
    `depth=${depthPressed} thème=${themePressed}`,
  );
  check(
    "le volume retenu est appliqué d'emblée",
    (await A.getByTestId("planned-count").innerText()).includes("3"),
    await A.getByTestId("planned-count").innerText(),
  );

  // 6. Cas limites -----------------------------------------------------
  await A.getByTestId("depth-leger").click();
  await A.waitForTimeout(500);
  const tooFew = await A.getByTestId("too-few").isVisible().catch(() => false);
  check("trop peu de questions est signalé", tooFew);

  await A.getByTestId("depth-all").click();
  for (const theme of ["apprentissage", "futur", "relation", "rêves", "voyage"]) {
    const chip = A.getByTestId(`theme-${theme}`);
    if ((await chip.getAttribute("aria-pressed")) !== "true") {
      await chip.click();
      await A.waitForTimeout(200);
    }
  }
  await A.waitForTimeout(500);
  const empty = await A.getByTestId("empty-selection").isVisible().catch(() => false);
  const createDisabled = await A
    .getByRole("button", { name: "Créer la partie" })
    .isDisabled();
  check("aucune question correspondante : la partie ne peut pas démarrer", empty && createDisabled, `vide=${empty} désactivé=${createDisabled}`);

  await A.screenshot({ path: "/tmp/duoplay-personnalisation.png" });
  await browser.close();
  finish();
})().catch((error) => {
  log("\nERREUR:", error.message);
  process.exit(1);
});
