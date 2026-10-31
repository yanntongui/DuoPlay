"use client";

import { useT } from "@/lib/i18n";
import type { MessageKey } from "@/lib/i18n/messages";
import type { TranslateParams } from "@/lib/i18n";

/**
 * Petit pont de traduction pour les composants **serveur** (§22) : le texte est
 * extrait dans un composant client minimal, ce qui permet de garder les pages
 * en rendu statique (et leur `metadata`) tout en les rendant bilingues.
 */
export function T({
  k,
  params,
}: {
  k: MessageKey;
  params?: TranslateParams;
}) {
  const { t } = useT();
  return <>{t(k, params)}</>;
}
