"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import {
  applyLocale,
  getLocale,
  serverLocale,
  setLocale,
  subscribeLocale,
  type Locale,
} from "./store";
import { translate, translatePlural, type Translator } from "./translate";

export type { MessageKey } from "./messages";
export type { Locale } from "./store";
export {
  LOCALES,
  LOCALE_LABELS,
  LOCALE_SHORT,
  LOCALE_TAG,
  isLocale,
} from "./store";
export { applyLocale, detectLocale, setLocale } from "./store";
export type { TranslateParams, Translator } from "./translate";
export { translate, translatePlural, translator, localize } from "./translate";

/** La langue active, réactive (choix enregistré, `?lang=`, sinon navigateur). */
export function useLocale(): Locale {
  const locale = useSyncExternalStore(
    subscribeLocale,
    getLocale,
    serverLocale,
  );
  useEffect(() => {
    applyLocale(locale);
  }, [locale]);
  return locale;
}

/** Traducteur lié à la langue active. */
export function useT(): Translator {
  const locale = useLocale();
  return useMemo(
    () => ({
      locale,
      t: (key, params) => translate(locale, key, params),
      tp: (base, count, params) =>
        translatePlural(locale, base, count, params),
    }),
    [locale],
  );
}

/** Sélection de la langue, pour l'écran des Paramètres. */
export function useLanguage() {
  const locale = useLocale();
  const change = useCallback((next: Locale) => setLocale(next), []);
  return { locale, change };
}
