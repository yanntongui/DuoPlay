import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { cleanDeviceToken } from "./lib/identity";

/**
 * Consentements (§15.6) — décidés par appareil, avant tout compte.
 *
 * La bannière cookies/analytics doit pouvoir être tranchée sans inscription.
 * Un compte léger recopie ces valeurs ; le compte prend alors le relais.
 */

/** Version du texte de consentement : l'incrémenter force un nouveau choix. */
export const CONSENT_VERSION = 1;

export const get = query({
  args: { deviceToken: v.string() },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const row = await ctx.db
      .query("consents")
      .withIndex("by_device", (q) => q.eq("deviceToken", deviceToken))
      .unique();
    if (!row) return null;
    return {
      analytics: row.analytics,
      notifications: row.notifications,
      version: row.version,
      decidedAt: row.decidedAt,
      current: row.version >= CONSENT_VERSION,
    };
  },
});

export const set = mutation({
  args: {
    deviceToken: v.string(),
    analytics: v.boolean(),
    notifications: v.boolean(),
  },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const now = Date.now();

    const existing = await ctx.db
      .query("consents")
      .withIndex("by_device", (q) => q.eq("deviceToken", deviceToken))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        analytics: args.analytics,
        notifications: args.notifications,
        version: CONSENT_VERSION,
        decidedAt: now,
      });
    } else {
      await ctx.db.insert("consents", {
        deviceToken,
        analytics: args.analytics,
        notifications: args.notifications,
        version: CONSENT_VERSION,
        decidedAt: now,
      });
    }

    // Le compte léger, s'il existe, prend le relais.
    const account = await ctx.db
      .query("accounts")
      .withIndex("by_device", (q) => q.eq("primaryDeviceToken", deviceToken))
      .unique();
    if (account) {
      await ctx.db.patch(account._id, {
        analyticsConsent: args.analytics,
        notificationsConsent: args.notifications,
        consentsAt: now,
        updatedAt: now,
      });
    }

    // Un événement de mesure n'est écrit que si l'utilisateur l'autorise (§15.6).
    if (args.analytics) {
      await ctx.db.insert("analyticsEvents", {
        name: "consent_updated",
        props: { notifications: args.notifications },
        at: now,
      });
    }

    return { ok: true };
  },
});
