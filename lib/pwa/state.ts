/**
 * État de connexion et préférences locales du PWA (cf. PRD §16.2, §16.3).
 * Aucune de ces clés ne contient de donnée sensible : elles disent seulement
 * si le couple a déjà joué et s'il a déjà refusé l'installation.
 */

const PLAYED_KEY = "duoplay:played";
const DISMISSED_KEY = "duoplay:install-dismissed";
const EVENT = "duoplay:pwa-change";

function read(key: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function write(key: string, value: boolean) {
  if (typeof window === "undefined") return;
  try {
    if (value) window.localStorage.setItem(key, "1");
    else window.localStorage.removeItem(key);
  } catch {
    /* stockage indisponible : on continue sans */
  }
  window.dispatchEvent(new Event(EVENT));
}

/** Appelé à la fin d'une première partie : le prompt d'installation devient légitime. */
export function markGamePlayed() {
  if (!read(PLAYED_KEY)) write(PLAYED_KEY, true);
}

export function hasPlayed() {
  return read(PLAYED_KEY);
}

export function isInstallDismissed() {
  return read(DISMISSED_KEY);
}

export function dismissInstall() {
  write(DISMISSED_KEY, true);
}

/** Réautorise l'invitation à installer (depuis les Paramètres). */
export function allowInstallPrompt() {
  write(DISMISSED_KEY, false);
}

/** S'abonne aux changements d'état PWA (le prompt réagit sans rechargement). */
export function subscribePwa(listener: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}
