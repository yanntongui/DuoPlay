import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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
    // Récupérer les limites du couple si elles existent
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

    // Sélectionner une catégorie (filtrée si nécessaire)
    const availableCategories = args.preferredCategories?.length
      ? args.preferredCategories.filter((c) => CATEGORIES.includes(c as "connexion" | "sensations" | "defis" | "fantasmes"))
      : CATEGORIES;

    const category =
      availableCategories[
        Math.floor(Math.random() * availableCategories.length)
      ];

    // Sélectionner une ambiance
    const ambiance = AMBIANCES[Math.floor(Math.random() * AMBIANCES.length)];

    // Sélectionner une durée
    const durationMinutes =
      DURATIONS[Math.floor(Math.random() * DURATIONS.length)];

    // Enregistrer le résultat
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
