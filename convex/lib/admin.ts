import { ConvexError } from "convex/values";

/**
 * Ancienne fonction de compatibilité pour l'API key
 */
export function assertAdmin(key: string | undefined) {
  const expected = process.env.ADMIN_KEY;
  if (!expected || !key || key !== expected) {
    throw new ConvexError("Accès administrateur refusé.");
  }
}

/**
 * Vérifie si l'admin peut effectuer une action sur une ressource
 */
export function hasPermission(permissions: string[], action: string) {
  return permissions.includes(action) || permissions.includes("*");
}
