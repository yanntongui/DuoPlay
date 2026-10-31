import type { MutationCtx } from "../_generated/server";

/**
 * Limitation de débit (cf. PRD §15.4).
 *
 * Protège contre deux abus précis : le **spam d'invitations** (création de
 * parties en rafale) et le **brute-force de tokens** (tentatives de jointure
 * ratées). Fenêtre fixe : le compteur repart de zéro à chaque nouvelle fenêtre,
 * ce qui suffit largement pour un usage légitime.
 *
 * Lève une erreur explicite dès que la limite est dépassée — jamais de blocage
 * silencieux.
 */
export async function enforceRateLimit(
  ctx: MutationCtx,
  key: string,
  limit: number,
  windowMs: number,
): Promise<void> {
  const now = Date.now();
  const existing = await ctx.db
    .query("rateLimits")
    .withIndex("by_key", (q) => q.eq("key", key))
    .unique();

  if (!existing || now - existing.windowStart >= windowMs) {
    if (existing) {
      await ctx.db.patch(existing._id, { windowStart: now, count: 1 });
    } else {
      await ctx.db.insert("rateLimits", {
        key,
        windowStart: now,
        count: 1,
      });
    }
    return;
  }

  if (existing.count >= limit) {
    throw new Error(
      "Trop de tentatives en peu de temps. Réessayez dans un instant.",
    );
  }

  await ctx.db.patch(existing._id, { count: existing.count + 1 });
}

/** Réinitialise un compteur (par ex. après un succès légitime). */
export async function clearRateLimit(
  ctx: MutationCtx,
  key: string,
): Promise<void> {
  const existing = await ctx.db
    .query("rateLimits")
    .withIndex("by_key", (q) => q.eq("key", key))
    .unique();
  if (existing) await ctx.db.delete(existing._id);
}
