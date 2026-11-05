import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { optionalDeviceToken } from "./lib/identity";

/**
 * Brouillons d'expériences personnalisées créées par le couple.
 */

const depth = v.union(
  v.literal("leger"),
  v.literal("moyen"),
  v.literal("profond"),
);

const savedTo = v.union(
  v.literal("favorites"),
  v.literal("space"),
  v.literal("none"),
);

/** Liste des brouillons d'un couple. */
export const list = query({
  args: { deviceToken: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const deviceToken = optionalDeviceToken(args.deviceToken);
    if (!deviceToken) return [];

    const couples = await ctx.db
      .query("couples")
      .withIndex("by_deviceA", (q) =>
        q.eq("deviceA", deviceToken),
      )
      .collect();

    if (couples.length === 0) return [];

    const coupleId = couples[0]._id;
    const drafts = await ctx.db
      .query("customExperienceDrafts")
      .withIndex("by_couple", (q) => q.eq("coupleId", coupleId))
      .collect();

    return drafts.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

/** Créer un brouillon d'expérience personnalisée. */
export const create = mutation({
  args: {
    deviceToken: v.string(),
    title: v.string(),
    theme: v.string(),
    mood: v.optional(v.string()),
    durationMinutes: v.number(),
    depth: v.optional(depth),
    questionIds: v.optional(v.array(v.id("questions"))),
    customQuestions: v.optional(v.array(v.any())),
    excludedCategories: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const deviceToken = optionalDeviceToken(args.deviceToken);
    if (!deviceToken) throw new Error("Device token manquant");

    const couples = await ctx.db
      .query("couples")
      .withIndex("by_deviceA", (q) =>
        q.eq("deviceA", deviceToken),
      )
      .collect();

    const coupleId = couples.length > 0 ? couples[0]._id : undefined;
    const userId = couples.length > 0 ? couples[0].userIdA : undefined;

    const now = Date.now();
    const id = await ctx.db.insert("customExperienceDrafts", {
      coupleId,
      userId,
      title: args.title,
      theme: args.theme,
      mood: args.mood,
      durationMinutes: args.durationMinutes,
      depth: args.depth,
      questionIds: args.questionIds ?? [],
      customQuestions: args.customQuestions ?? [],
      excludedCategories: args.excludedCategories ?? [],
      savedTo: "none",
      createdAt: now,
      updatedAt: now,
    });

    return id;
  },
});

/** Mettre à jour un brouillon. */
export const update = mutation({
  args: {
    id: v.id("customExperienceDrafts"),
    title: v.optional(v.string()),
    theme: v.optional(v.string()),
    mood: v.optional(v.string()),
    durationMinutes: v.optional(v.number()),
    depth: v.optional(depth),
    questionIds: v.optional(v.array(v.id("questions"))),
    customQuestions: v.optional(v.array(v.any())),
    excludedCategories: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const draft = await ctx.db.get(args.id);
    if (!draft) throw new Error("Brouillon introuvable");

    const now = Date.now();
    await ctx.db.patch(args.id, {
      title: args.title ?? draft.title,
      theme: args.theme ?? draft.theme,
      mood: args.mood ?? draft.mood,
      durationMinutes: args.durationMinutes ?? draft.durationMinutes,
      depth: args.depth ?? draft.depth,
      questionIds: args.questionIds ?? draft.questionIds,
      customQuestions: args.customQuestions ?? draft.customQuestions,
      excludedCategories: args.excludedCategories ?? draft.excludedCategories,
      updatedAt: now,
    });

    return true;
  },
});

/** Marquer comme sauvegardé. */
export const markSaved = mutation({
  args: {
    id: v.id("customExperienceDrafts"),
    savedTo: savedTo,
  },
  handler: async (ctx, args) => {
    const draft = await ctx.db.get(args.id);
    if (!draft) throw new Error("Brouillon introuvable");

    const now = Date.now();
    await ctx.db.patch(args.id, {
      savedTo: args.savedTo,
      updatedAt: now,
    });

    return true;
  },
});

/** Supprimer un brouillon. */
export const remove = mutation({
  args: { id: v.id("customExperienceDrafts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return true;
  },
});
