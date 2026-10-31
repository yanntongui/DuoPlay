"use client";

/**
 * Langue de l'interface (§22) — français par défaut, anglais disponible.
 *
 * Le choix vit **sur l'appareil** (`localStorage`), jamais côté serveur : il
 * n'est donc jamais partagé entre les deux joueurs d'un couple, et rien n'est
 * collecté. `?lang=` permet de forcer une langue pour un lien précis (utile en
 * test et pour partager une page déjà traduite).
 */

export type Locale = "fr" | "en";

export const LOCALES: readonly Locale[] = ["fr", "en"] as const;

/** Nom de la langue dans cette langue (jamais traduit). */
export const LOCALE_LABELS: Record<Locale, string> = {
  fr: "Français",
  en: "English",
};

export const LOCALE_SHORT: Record<Locale, string> = {
  fr: "FR",
  en: "EN",
};

/** Étiquette BCP 47 utilisée pour les dates et les nombres. */
export const LOCALE_TAG: Record<Locale, string> = {
  fr: "fr-FR",
  en: "en-GB",
};

const KEY = "duoplay:lang";
const EVENT = "duoplay:lang-change";

let cached: Locale | null = null;

export function isLocale(value: unknown): value is Locale {
  return value === "fr" || value === "en";
}

/** Le navigateur parle-t-il anglais ? Sinon, français (Bénin, francophonie). */
export function detectLocale(): Locale {
  if (typeof navigator === "undefined") return "fr";
  const candidates = [
    navigator.language,
    ...(Array.isArray(navigator.languages) ? navigator.languages : []),
  ];
  for (const candidate of candidates) {
    if (typeof candidate !== "string") continue;
    if (candidate.toLowerCase().startsWith("en")) return "en";
  }
  return "fr";
}

/** La langue active : `?lang=` > choix enregistré > navigateur > français. */
export function getLocale(): Locale {
  if (typeof window === "undefined") return "fr";
  if (cached) return cached;

  try {
    const forced = new URLSearchParams(window.location.search).get("lang");
    if (isLocale(forced)) {
      cached = forced;
      return cached;
    }
  } catch {
    /* URL illisible : on continue avec le reste */
  }

  try {
    const stored = window.localStorage.getItem(KEY);
    if (isLocale(stored)) {
      cached = stored;
      return cached;
    }
  } catch {
    /* stockage indisponible (mode privé strict) : on détecte seulement */
  }

  cached = detectLocale();
  return cached;
}

export function applyLocale(locale: Locale): void {
  if (typeof document === "undefined") return;
  document.documentElement.lang = locale;
  document.documentElement.setAttribute("data-lang", locale);
}

export function setLocale(locale: Locale): void {
  cached = locale;
  try {
    window.localStorage.setItem(KEY, locale);
  } catch {
    /* sans stockage, le choix ne tient que le temps de la page */
  }
  applyLocale(locale);
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeLocale(listener: () => void): () => void {
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}

/** Snapshot serveur / première peinture : toujours le français. */
export function serverLocale(): Locale {
  return "fr";
}
