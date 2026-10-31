import type { Locale } from "./store";
import { messages, type MessageKey } from "./messages";

/**
 * Traduction pure (sans React) : utilisable côté serveur comme côté client.
 * Le français fait foi ; une clé absente retombe sur le français, puis sur la
 * clé elle-même — jamais d'écran vide.
 */

export type TranslateParams = Record<string, string | number>;

export type Translator = {
  locale: Locale;
  t: (key: MessageKey, params?: TranslateParams) => string;
  tp: (base: string, count: number, params?: TranslateParams) => string;
};

export function interpolate(
  text: string,
  params?: TranslateParams,
): string {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.prototype.hasOwnProperty.call(params, name)
      ? String(params[name])
      : match,
  );
}

/**
 * Choisit une variante de **donnée** (titre, description, gage…) selon la
 * langue active. Complète le catalogue de messages : le contenu seedé vit en
 * base, pas dans les dictionnaires.
 */
export function localize(
  locale: Locale,
  fr: string,
  en?: string | null,
): string {
  if (locale === "en" && en) return en;
  return fr;
}

export function translate(
  locale: Locale,
  key: MessageKey,
  params?: TranslateParams,
): string {
  const text = messages[locale][key] ?? messages.fr[key] ?? key;
  return interpolate(text, params);
}

const PLURALS = new Map<Locale, Intl.PluralRules>();

function rulesFor(locale: Locale): Intl.PluralRules {
  let rules = PLURALS.get(locale);
  if (!rules) {
    rules = new Intl.PluralRules(locale);
    PLURALS.set(locale, rules);
  }
  return rules;
}

/**
 * Traduit une clé dépendant d'un nombre : `{base}_one` ou `{base}_other` est
 * choisie par `Intl.PluralRules`, avec repli sur la clé simple.
 * `{count}` reste disponible dans les paramètres.
 */
export function translatePlural(
  locale: Locale,
  base: string,
  count: number,
  params?: TranslateParams,
): string {
  const form = rulesFor(locale).select(count);
  const key = `${base}_${form}` as MessageKey;
  const fallback = base as MessageKey;
  const available = messages[locale][key] ?? messages[locale][fallback];
  if (available === undefined) return String(base);
  return interpolate(available, { count, ...params });
}

/** Traducteur détaché (hors React), utile pour les messages d'erreur. */
export function translator(locale: Locale): Translator {
  return {
    locale,
    t: (key, params) => translate(locale, key, params),
    tp: (base, count, params) => translatePlural(locale, base, count, params),
  };
}
