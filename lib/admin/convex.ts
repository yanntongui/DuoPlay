import "server-only";
import { ConvexHttpClient } from "convex/browser";

/** Client Convex côté serveur pour les écrans d'administration. */
export function adminClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL manquant dans l'environnement.");
  }
  return new ConvexHttpClient(url);
}

/** Clé serveur injectée dans les mutations d'administration Convex. */
export function adminKey() {
  const key = process.env.ADMIN_KEY;
  if (!key) {
    throw new Error("ADMIN_KEY manquant dans l'environnement.");
  }
  return key;
}
