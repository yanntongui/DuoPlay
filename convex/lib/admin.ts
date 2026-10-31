import { ConvexError } from "convex/values";

/**
 * Garde temporaire pour les mutations d'administration.
 *
 * En attendant Convex Auth (Phase 6/7), les mutations admin exigent une clé
 * serveur (`ADMIN_KEY`, définie via `npx convex env set ADMIN_KEY ...`).
 * La clé n'est jamais exposée au navigateur : les Server Actions Next.js
 * l'injectent côté serveur.
 */
export function assertAdmin(key: string | undefined) {
  const expected = process.env.ADMIN_KEY;
  if (!expected || !key || key !== expected) {
    throw new ConvexError("Accès administrateur refusé.");
  }
}
