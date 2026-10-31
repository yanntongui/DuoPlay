const {
  BASE,
  log,
  check,
  playAll,
  launchBrowser,
  finish,
} = require("./helpers.cjs");

/**
 * Test de bout en bout du « Calendrier des moments » (§4) : état vide honnête,
 * planification d'un rendez-vous (date + heure), affichage du prochain moment
 * avec son étiquette relative, marquage « fait », retrait, et partage avec le
 * partenaire relié. Aucun débordement horizontal sur mobile.
 *
 *   npm run dev
 *   node tests/calendar.cjs
 */

const WAT_OFFSET_MS = 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const dayKey = (ms) => new Date(ms + WAT_OFFSET_MS).toISOString().slice(0, 10);

async function loadCalendar(page) {
  await page.goto(`${BASE}/notre-espace`, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  await page
    .locator('[data-testid="calendar"][data-loaded="true"]')
    .waitFor({ timeout: 60000 });
}

async function plan(page, { title, kind, day, time, note }) {
  await page.getByTestId("event-add").click();
  await page.getByTestId("event-form").waitFor({ timeout: 15000 });
  await page.getByTestId("event-title").fill(title);
  if (kind) await page.getByTestId(`event-kind-${kind}`).click();
  if (day) await page.getByTestId("event-day").fill(day);
  if (time) await page.getByTestId("event-time").fill(time);
  if (note) await page.getByTestId("event-note").fill(note);
  await page.getByTestId("event-submit").click();
  await page.getByTestId("event-form").waitFor({
    state: "detached",
    timeout: 30000,
  });
}

function card(page, title) {
  return page
    .locator('[data-testid="event-next"], [data-testid="event-row"], [data-testid="event-past"]')
    .filter({ hasText: title });
}

(async () => {
  const browser = await launchBrowser();
  const view = { viewport: { width: 390, height: 844 } };

  // --- A : appareil neuf -------------------------------------------
  const ctxA = await browser.newContext(view);
  const A = await ctxA.newPage();
  A.on("pageerror", (error) => log("  [A erreur JS]", error.message));

  await loadCalendar(A);
  await A.getByTestId("calendar-empty").waitFor({ timeout: 30000 });
  check("appareil neuf : calendrier vide annoncé", true);
  check(
    "aucun compteur tant que rien n'est prévu",
    (await A.getByTestId("calendar-count").count()) === 0,
  );
  const emptyText = (await A.getByTestId("calendar-empty").innerText()).replace(
    /\s+/g,
    " ",
  );
  check(
    "l'état vide propose de noter une date",
    /rien de prévu/i.test(emptyText) && /date/i.test(emptyText),
    emptyText.slice(0, 80),
  );

  const today = dayKey(Date.now());
  const inThreeDays = dayKey(Date.now() + 3 * DAY_MS);

  // --- Planifier un moment aujourd'hui ------------------------------
  await plan(A, {
    title: "Dîner aux chandelles",
    kind: "rendez-vous",
    day: today,
    time: "19:30",
    note: "Réserver la petite table près de la fenêtre.",
  });
  await A.getByTestId("event-next").waitFor({ timeout: 30000 });
  check("un moment planifié devient le prochain moment", true);
  const nextText = (await A.getByTestId("event-next").innerText()).replace(
    /\s+/g,
    " ",
  );
  check(
    "le prochain moment est daté relativement et horodaté",
    /Aujourd'hui/.test(nextText) && /19:30/.test(nextText),
    nextText.slice(0, 90),
  );
  check(
    "le prochain moment porte son genre et sa note",
    /Rendez-vous/.test(nextText) && /fenêtre/.test(nextText),
  );
  check(
    "le compteur reflète les moments à venir",
    (await A.getByTestId("calendar-count").innerText()).trim() === "1",
  );

  // --- Un second moment, plus tard ----------------------------------
  await plan(A, {
    title: "Anniversaire de Awa",
    kind: "anniversaire",
    day: inThreeDays,
  });
  const later = card(A, "Anniversaire de Awa");
  await later.waitFor({ timeout: 30000 });
  check(
    "la date la plus proche reste en tête",
    (await A.getByTestId("event-next").innerText()).includes(
      "Dîner aux chandelles",
    ),
  );
  const laterText = (await later.innerText()).replace(/\s+/g, " ");
  check(
    "un moment plus lointain est relativement daté",
    /Dans 3 jours/.test(laterText) && /Anniversaire/.test(laterText),
    laterText.slice(0, 80),
  );
  check(
    "les deux moments sont comptés",
    (await A.getByTestId("calendar-count").innerText()).trim() === "2",
  );

  // --- Marquer fait --------------------------------------------------
  await card(A, "Dîner aux chandelles").getByTestId("event-done").click();
  await A.locator(
    '[data-testid="event-next"]:has-text("Dîner aux chandelles")',
  ).waitFor({ state: "detached", timeout: 30000 });
  check("un moment peut être marqué fait", true);
  check(
    "le moment fait rejoint les moments passés",
    /Fait/.test(
      (await card(A, "Dîner aux chandelles").innerText()).replace(/\s+/g, " "),
    ),
  );
  check(
    "le prochain moment devient l'autre date",
    (await A.getByTestId("event-next").innerText()).includes(
      "Anniversaire de Awa",
    ),
  );
  check(
    "le compteur ne compte que les moments à venir",
    (await A.getByTestId("calendar-count").innerText()).trim() === "1",
  );

  // --- Retirer -------------------------------------------------------
  await card(A, "Dîner aux chandelles").getByTestId("event-remove").click();
  await card(A, "Dîner aux chandelles")
    .getByTestId("event-remove-confirm")
    .click();
  await card(A, "Dîner aux chandelles").waitFor({
    state: "detached",
    timeout: 30000,
  });
  check("un moment peut être retiré", true);

  // --- Partage avec le partenaire -----------------------------------
  await A.goto(`${BASE}/explorer/eclats-de-rire`, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  await A.getByRole("link", { name: "Lancer" }).first().click();
  await A.waitForURL(/\/nouvelle\//, { timeout: 120000 });
  await A.getByPlaceholder("Ex. Awa").fill("Awa");
  await A.getByRole("button", { name: "Créer la partie" }).click();
  await A.waitForURL(/\/partie\//, { timeout: 120000 });
  const room = A.url();

  const ctxB = await browser.newContext(view);
  const B = await ctxB.newPage();
  B.on("pageerror", (error) => log("  [B erreur JS]", error.message));
  await B.goto(room, { waitUntil: "domcontentloaded", timeout: 120000 });
  await B.getByPlaceholder("Ex. Koffi").fill("Koffi");
  await B.getByRole("button", { name: "Rejoindre la partie" }).click();
  await A.getByTestId("counter").waitFor({ timeout: 60000 });
  await B.getByTestId("counter").waitFor({ timeout: 60000 });
  await Promise.all([playAll(A, "Awa"), playAll(B, "Koffi")]);
  await A.getByRole("heading", {
    name: /Merci pour ce moment|Presque terminé/,
  }).waitFor({ timeout: 60000 });

  await loadCalendar(B);
  await B.getByTestId("calendar").waitFor({ timeout: 30000 });
  const shared = card(B, "Anniversaire de Awa");
  await shared.waitFor({ timeout: 30000 });
  check("le partenaire relié voit le moment partagé", true);

  // Koffi peut à son tour ajouter un moment, visible d'Awa.
  await plan(B, {
    title: "Surprise du dimanche",
    kind: "surprise",
    day: today,
  });
  await loadCalendar(A);
  await card(A, "Surprise du dimanche").waitFor({ timeout: 30000 });
  check("les deux peuvent enrichir le calendrier partagé", true);

  // --- Mise en page -------------------------------------------------
  await A.waitForTimeout(1200);
  const overflow = await A.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  check(
    "notre-espace sans débordement horizontal (mobile)",
    overflow <= 1,
    `${overflow}px`,
  );
  check(
    "l'espace du couple conserve sa grille de statistiques",
    (await A.locator("div.grid > div").count()) === 3,
  );
  await A.screenshot({ path: "/tmp/duoplay-calendrier.png" });

  await browser.close();
  finish();
})().catch((error) => {
  log("\nERREUR:", error.message);
  process.exit(1);
});
