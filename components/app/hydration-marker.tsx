"use client";

import { useEffect } from "react";

/**
 * Marqueur d'hydratation : posé une fois l'interface réellement interactive.
 *
 * Le HTML est rendu côté serveur en français puis repris par React ; sans ce
 * repère, un clic trop précoce peut tomber dans le vide (la page est peinte
 * mais les gestionnaires ne sont pas encore attachés). Les tests de bout en
 * bout s'appuient dessus (`waitForHydration`) au lieu d'attendre au hasard.
 */
export function HydrationMarker() {
  useEffect(() => {
    document.documentElement.dataset.hydrated = "true";
  }, []);
  return null;
}
