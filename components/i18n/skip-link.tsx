"use client";

import { useT } from "@/lib/i18n";

/**
 * Lien d'évitement (§16.6) : premier élément focusable de la page, il mène au
 * contenu principal. Il doit être traduit comme le reste de l'interface.
 */
export function SkipLink() {
  const { t } = useT();
  return (
    <a href="#contenu" className="skip-link">
      {t("common.skip")}
    </a>
  );
}
