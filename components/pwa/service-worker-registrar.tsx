"use client";

import { useEffect } from "react";

/** Enregistre le service worker PWA (production uniquement). */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      typeof window === "undefined" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    };

    // `load` peut déjà être passé au moment de l'hydratation : on s'enregistre
    // tout de suite plutôt que d'attendre un événement qui ne reviendra pas.
    if (document.readyState === "complete") {
      register();
      return;
    }

    window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
