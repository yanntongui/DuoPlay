import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertAdmin } from "./lib/admin";

// Catégories de dés (filtrent les cartes)
const CATEGORIES = [
  "connexion",
  "sensations",
  "defis",
  "fantasmes",
] as const;

// Ambiances possibles
const AMBIANCES = [
  "tendre",
  "romantique",
  "jouer",
  "mystereux",
  "sensuel",
  "audacieux",
] as const;

// Durées en minutes
const DURATIONS = [1, 3, 5, 10, 20, 30] as const;

/**
 * Lance un dé et génère un résultat adapté aux limites du couple
 */
export const roll = mutation({
  args: {
    sessionId: v.optional(v.id("sessions")),
    coupleId: v.optional(v.id("couples")),
    deviceId: v.optional(v.string()),
    preferredCategories: v.optional(v.array(v.string())),
  },
  handler: async (_ctx, args) => {
    const filters: string[] = [];

    if (args.coupleId !== undefined) {
      const limits = await _ctx.db
        .query("coupleLimits")
        .withIndex("by_couple", (q) =>
          q.eq("coupleId", args.coupleId!),
        )
        .first();

      if (limits) {
        if (limits.withoutPhoto) filters.push("with_photo");
        if (limits.withoutContact) filters.push("contact");
        if (limits.withoutPublic) filters.push("public_ok");
      }
    }

    const availableCategories = args.preferredCategories?.length
      ? args.preferredCategories.filter((c) => CATEGORIES.includes(c as "connexion" | "sensations" | "defis" | "fantasmes"))
      : CATEGORIES;

    const category =
      availableCategories[
        Math.floor(Math.random() * availableCategories.length)
      ];

    const ambiance = AMBIANCES[Math.floor(Math.random() * AMBIANCES.length)];
    const durationMinutes =
      DURATIONS[Math.floor(Math.random() * DURATIONS.length)];

    const resultId = await _ctx.db.insert("diceResults", {
      sessionId: args.sessionId,
      coupleId: args.coupleId,
      deviceId: args.deviceId,
      category,
      ambiance,
      durationMinutes,
      createdAt: Date.now(),
    });

    return {
      resultId,
      category,
      ambiance,
      durationMinutes,
    };
  },
});

/**
 * Récupérer l'historique des lancers
 */
export const list = query({
  args: {
    sessionId: v.optional(v.id("sessions")),
    coupleId: v.optional(v.id("couples")),
  },
  handler: async (ctx, args) => {
    if (args.sessionId) {
      return await ctx.db
        .query("diceResults")
        .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
        .order("desc")
        .collect();
    }

    if (args.coupleId) {
      return await ctx.db
        .query("diceResults")
        .withIndex("by_couple", (q) =>
          q.eq("coupleId", args.coupleId),
        )
        .order("desc")
        .collect();
    }

    return [];
  },
});

// ============================================
// Admin Functions for Dice
// ============================================

export const adminList = query({
  args: {
    page: v.number(),
    pageSize: v.number(),
  },
  handler: async (ctx: any, args: any) => {
    const { page, pageSize } = args;

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Accès refusé");
    }
    const access = await ctx.db.query("adminAccess").collect();
    if (!access.some((a: any) => a.userId === identity._id)) {
      throw new Error("Accès refusé");
    }

    let results = await ctx.db.query("diceResults").collect();
    results.sort((a: any, b: any) => b.createdAt - a.createdAt);

    const totalCount = results.length;
    const start = page * pageSize;
    const paginated = results.slice(start, start + pageSize);

    return {
      results: paginated,
      totalCount,
      page,
      pageSize,
    };
  },
});

export const adminGetStats = query({
  args: {},
  handler: async (ctx: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Accès refusé");
    }
    const access = await ctx.db.query("adminAccess").collect();
    if (!access.some((a: any) => a.userId === identity._id)) {
      throw new Error("Accès refusé");
    }

    const all = await ctx.db.query("diceResults").collect();
    
    const byCategory: Record<string, number> = {};
    for (const r of all) {
      byCategory[r.category] = (byCategory[r.category] || 0) + 1;
    }

    return {
      total: all.length,
      byCategory,
    };
  },
});
