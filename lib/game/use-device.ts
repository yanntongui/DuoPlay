"use client";

import { useEffect, useState } from "react";
import { getActiveDeviceToken, subscribeAccount } from "./storage";

/**
 * Identité active (compte léger s'il existe, sinon l'appareil), disponible
 * uniquement après hydratation (elle vit dans le stockage local).
 *
 * `undefined` = pas encore lue (écran de chargement) ; `string` = prêt.
 * La connexion / déconnexion d'un compte léger notifie l'abonnement, ce qui
 * fait basculer « Notre espace » sur la bonne identité sans rechargement.
 */
export function useDeviceToken(): string | undefined {
  const [token, setToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    const update = () => setToken(getActiveDeviceToken());
    update();
    return subscribeAccount(update);
  }, []);

  return token;
}
