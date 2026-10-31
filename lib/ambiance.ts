"use client";

/**
 * Ambiance « Soirée aux chandelles ↔ Douceur du jour » (cf. doctrine §2).
 *
 * Source unique de vérité pour l'affichage : l'en-tête (bascule icône) et les
 * Paramètres (choix explicite) parlent au même endroit. La clé est appliquée
 * sur `<html>` avant la première peinture par le script du layout, puis
 * maintenue ici — aucun flash, aucune divergence entre les deux surfaces.
 */

export const AMBIANCE_KEY = "duoplay:ambiance";
const EVENT = "duoplay:ambiance-change";

export type Ambiance = "chandelles" | "douceur";

export function getAmbiance(): Ambiance {
  if (typeof window === "undefined") return "chandelles";
  try {
    return window.localStorage.getItem(AMBIANCE_KEY) === "douceur"
      ? "douceur"
      : "chandelles";
  } catch {
    return "chandelles";
  }
}

/** Pose (ou retire) l'attribut `<html data-ambiance>` qui pilote les jetons. */
export function applyAmbiance(value: Ambiance): void {
  if (typeof document === "undefined") return;
  if (value === "douceur") {
    document.documentElement.setAttribute("data-ambiance", "douceur");
  } else {
    document.documentElement.removeAttribute("data-ambiance");
  }
}

export function saveAmbiance(value: Ambiance): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(AMBIANCE_KEY, value);
  } catch {
    /* stockage indisponible : l'ambiance ne survivra pas au rechargement */
  }
  applyAmbiance(value);
  window.dispatchEvent(new Event(EVENT));
}

export function toggleAmbiance(): Ambiance {
  const next: Ambiance = getAmbiance() === "douceur" ? "chandelles" : "douceur";
  saveAmbiance(next);
  return next;
}

/** S'abonne aux changements d'ambiance (autre onglet ou autre surface). */
export function subscribeAmbiance(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}
