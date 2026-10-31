import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { depth } from "./schema";

/**
 * Lister les cartes d'une expérience
 */
export const listByExperience = query({
  args: { experienceId: v.id("experiences") },
  handler: async (ctx, args) => {
    const cards = await ctx.db
      .query("cards")
      .withIndex("by_experience", (q) =>
        q.eq("experienceId", args.experienceId),
      )
      .filter((q) => q.eq(q.field("status"), "published"))
      .order("asc")
      .collect();

    return cards;
  },
});

/**
 * Lister les catégories de cartes
 */
export const listCategories = query({
  args: {},
  handler: async () => {
    return ["connexion", "sensations", "defis", "fantasmes"];
  },
});

/**
 * Créer une carte (admin only)
 */
export const adminCreate = mutation({
  args: {
    experienceId: v.id("experiences"),
    category: v.union(
      v.literal("connexion"),
      v.literal("sensations"),
      v.literal("defis"),
      v.literal("fantasmes"),
    ),
    prompt: v.string(),
    depth,
    tags: v.array(v.string()),
    isOptional: v.boolean(),
    order: v.number(),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived"),
    ),
  },
  handler: async (_ctx, args) => {
    await _ctx.db.insert("cards", args);
  },
});

/**
 * Modifier une carte (admin only)
 */
export const adminUpdate = mutation({
  args: {
    cardId: v.id("cards"),
    prompt: v.optional(v.string()),
    depth: v.optional(depth),
    tags: v.optional(v.array(v.string())),
    isOptional: v.optional(v.boolean()),
    order: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("published"),
        v.literal("archived"),
      ),
    ),
  },
  handler: async (_ctx, args) => {
    const { cardId, ...data } = args;
    await _ctx.db.patch(cardId, data);
  },
});

/**
 * Supprimer une carte (admin only)
 */
export const adminRemove = mutation({
  args: { cardId: v.id("cards") },
  handler: async (_ctx, args) => {
    await _ctx.db.delete(args.cardId);
  },
});

/**
 * Sauvegarder une réponse à une carte
 */
export const saveResponse = mutation({
  args: {
    cardId: v.id("cards"),
    sessionId: v.optional(v.id("sessions")),
    playerId: v.optional(v.id("sessionPlayers")),
    kind: v.union(
      v.literal("jaime"),
      v.literal("a_discuter"),
      v.literal("pas_maintenant"),
      v.literal("passer"),
    ),
    note: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    await _ctx.db.insert("cardResponses", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

/**
 * Compter les cartes d'une expérience
 */
export const countByExperience = query({
  args: { experienceId: v.id("experiences") },
  handler: async (ctx, args) => {
    const cards = await ctx.db
      .query("cards")
      .withIndex("by_experience", (q) =>
        q.eq("experienceId", args.experienceId),
      )
      .filter((q) => q.eq(q.field("status"), "published"))
      .collect();

    return cards.length;
  },
});
