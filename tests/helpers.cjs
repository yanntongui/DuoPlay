const { chromium } = require("playwright");
const fs = require("node:fs");
const path = require("node:path");

/**
 * Utilitaires communs aux tests de bout en bout.
 *
 * Prérequis : un navigateur Playwright (`npx playwright install chromium`) ou
 * `CHROME_PATH` pointant vers un Chromium local.
 */

const BASE = process.env.BASE_URL || "http://localhost:3000";
const log = (...args) => console.log(...args);
const state = { failures: 0 };

function check(label, ok, extra = "") {
  log(`${ok ? "  OK  " : " FAIL "} ${label}${extra ? " — " + extra : ""}`);
  if (!ok) state.failures += 1;
}

/** Répond à la question affichée, quel que soit son type. */
async function answerCurrent(page, preferOption) {
  const area = page.getByPlaceholder("Votre réponse…");
  if ((await area.count()) > 0) {
    await area.first().fill("Le premier soir, sous la pluie");
    await page.getByRole("button", { name: "Envoyer ma réponse" }).click();
    return { kind: "open" };
  }

  const defi = page.getByTestId("challenge");
  if ((await defi.count()) > 0) {
    await defi.first().click();
    return { kind: "challenge" };
  }

  const options = page.getByTestId("option");
  const total = await options.count();
  let pick = 0;
  if (preferOption) {
    for (let i = 0; i < total; i += 1) {
      if ((await options.nth(i).innerText()).trim() === preferOption) pick = i;
    }
  }
  const text = (await options.nth(pick).innerText()).trim();
  await options.nth(pick).click();
  return { kind: "choice", value: text };
}

/** Y a-t-il, à cet instant, une question à répondre à l'écran ? */
async function hasQuestion(page) {
  if ((await page.getByPlaceholder("Votre réponse…").count()) > 0) return true;
  if ((await page.getByTestId("challenge").count()) > 0) return true;
  if ((await page.getByTestId("option").count()) > 0) return true;
  return false;
}

/** Déroule toute la partie jusqu'au bilan. */
async function playAll(page, name) {
  for (let i = 0; i < 80; i += 1) {
    const done = await page
      .getByRole("heading", { name: /Merci pour ce moment|Presque terminé/ })
      .count();
    if (done > 0) return;

    const next = page.getByTestId("next");
    const nextCount = await next.count();
    if (nextCount > 0 && (await next.first().isEnabled())) {
      await next.first().click();
    } else if (await hasQuestion(page)) {
      await answerCurrent(page);
      await page.getByTestId("next").first().waitFor({ timeout: 30000 });
      await next.first().click();
    } else {
      // Transition de révélation ou attente de la réponse du partenaire :
      // on laisse le temps au temps réel de faire son travail.
      await page.waitForTimeout(300);
      continue;
    }
    await page.waitForTimeout(250);
  }
  throw new Error(`${name}: la partie ne s'est pas terminée`);
}

function findBundledChromium() {
  const root = path.join(process.env.HOME || "", "Library/Caches/ms-playwright");
  if (!fs.existsSync(root)) return null;
  for (const entry of fs.readdirSync(root)) {
    if (!entry.startsWith("chromium_headless_shell")) continue;
    const base = path.join(root, entry);
    for (const inner of fs.readdirSync(base)) {
      const candidate = path.join(base, inner, "chrome-headless-shell");
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  return null;
}

/**
 * Les suites E2E sont écrites en français : on **épingle le français** dans
 * chaque contexte (localStorage + `navigator.language`) pour que le libellé
 * des écrans reste stable quelle que soit la machine (§22). La suite
 * `i18n.cjs` teste l'anglais explicitement, via `?lang=en`.
 */
function pinFrench(browser) {
  const original = browser.newContext.bind(browser);
  browser.newContext = async (options = {}) => {
    const context = await original({
      locale: options.locale ?? "fr-FR",
      ...options,
    });
    await context.addInitScript(() => {
      try {
        // Un choix déjà enregistré dans le contexte (ex. bascule en anglais)
        // n'est jamais écrasé : on ne pose le français qu'au premier passage.
        if (!window.localStorage.getItem("duoplay:lang")) {
          window.localStorage.setItem("duoplay:lang", "fr");
        }
      } catch (error) {
        /* stockage indisponible : le français reste la langue par défaut */
      }
    });
    return context;
  };
  return browser;
}

async function launchBrowser() {
  if (process.env.CHROME_PATH) {
    return pinFrench(
      await chromium.launch({ executablePath: process.env.CHROME_PATH }),
    );
  }
  try {
    return pinFrench(await chromium.launch());
  } catch (error) {
    const bundled = findBundledChromium();
    if (!bundled) throw error;
    log(`(navigateur Playwright absent — utilisation de ${bundled})`);
    return pinFrench(await chromium.launch({ executablePath: bundled }));
  }
}

/**
 * Attend que l'interface soit **hydratée** (donc cliquable) : le HTML est
 * rendu côté serveur, un clic trop précoce tombe dans le vide.
 */
async function waitForHydration(page, timeout = 60000) {
  await page.waitForFunction(
    () => document.documentElement.dataset.hydrated === "true",
    undefined,
    { timeout },
  );
}

/** Termine le test : code de sortie 0 si tout est vert. */
function finish() {
  log(`\n${state.failures === 0 ? "TOUT EST VERT" : state.failures + " ECHEC(S)"}`);
  process.exit(state.failures === 0 ? 0 : 1);
}

module.exports = {
  BASE,
  log,
  check,
  state,
  answerCurrent,
  playAll,
  hasQuestion,
  launchBrowser,
  waitForHydration,
  finish,
};
