import { v } from "convex/values";
import { query } from "./_generated/server";
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
 * Vérifie si l'utilisateur courant est un administrateur
 * avec les permissions requises.
 */
export async function verifyAdmin(ctx: any, requiredPermissions?: string[]) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("Non authentifié");
  }

  const adminProfile = await ctx.db
    .query("adminAccess")
    .withIndex("by_user", (q) => q.eq("userId", identity.subject))
    .first();

  if (!adminProfile) {
    throw new ConvexError("Accès administrateur refusé");
  }

  if (requiredPermissions) {
    const missingPermissions = requiredPermissions.filter(
      (perm) => !adminProfile.permissions.includes(perm)
    );

    if (missingPermissions.length > 0) {
      throw new ConvexError(
        `Permissions requises manquantes : ${missingPermissions.join(", ")}`
      );
    }
  }

  return {
    userId: identity.subject,
    adminId: adminProfile._id,
    role: adminProfile.role,
    permissions: adminProfile.permissions,
  };
}

/**
 * Vérifie si l'admin peut effectuer une action sur une ressource
 */
export function hasPermission(permissions: string[], action: string) {
  return permissions.includes(action) || permissions.includes("*");
}
