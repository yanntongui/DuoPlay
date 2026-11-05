import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { optionalDeviceToken } from "./lib/identity";

/**
 * Éléments personnalisés du couple : envies, souvenirs, dates, etc.
 */

const kind = v.union(
  v.literal("desire"),
  v.literal("memory"),
  v.literal("favorite"),
  v.literal("upcoming"),
  v.literal("date"),
  v.literal("custom_experience"),
);

const visibility = v.union(
  v.literal("private"),
  v.literal("shared"),
  v.literal("common"),
  v.literal("to_discuss"),
  v.literal("deleted"),
);

/** Liste des éléments personnalisés d'un couple. */
export const list = query({
  args: {
    deviceToken: v.optional(v.string()),
    kind: v.optional(kind),
  },
  handler: async (ctx, args) => {
    const deviceToken = optionalDeviceToken(args.deviceToken);
    if (!deviceToken) return [];

    // Trouver le couple lié à l'appareil
    const couples = await ctx.db
      .query("couples")
      .withIndex("by_deviceA", (q) =>
        q.eq("deviceA", deviceToken),
      )
      .collect();

    if (couples.length === 0) return [];

    const coupleId = couples[0]._id;
    const items = await ctx.db
      .query("coupleCustomItems")
      .withIndex("by_couple", (q) => q.eq("coupleId", coupleId))
      .collect();

    const filtered = items
      .filter((item) => item.kind === args.kind || !args.kind)
      .filter((item) => item.visibility !== "deleted")
      .sort((a, b) => b.updatedAt - a.updatedAt);

    return filtered;
  },
});

/** Créer un élément personnalisé. */
export const create = mutation({
  args: {
    deviceToken: v.string(),
    kind: kind,
    title: v.string(),
    description: v.optional(v.string()),
    data: v.optional(v.any()),
    visibility: visibility,
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
    const id = await ctx.db.insert("coupleCustomItems", {
      coupleId,
      userId,
      deviceToken,
      kind: args.kind,
      title: args.title,
      description: args.description,
      data: args.data,
      visibility: args.visibility,
      createdAt: now,
      updatedAt: now,
    });

    return id;
  },
});

/** Mettre à jour un élément personnalisé. */
export const update = mutation({
  args: {
    id: v.id("coupleCustomItems"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    data: v.optional(v.any()),
    visibility: v.optional(visibility),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Élément introuvable");

    const now = Date.now();
    await ctx.db.patch(args.id, {
      title: args.title ?? item.title,
      description: args.description ?? item.description,
      data: args.data ?? item.data,
      visibility: args.visibility ?? item.visibility,
      updatedAt: now,
    });

    return true;
  },
});

/** Supprimer (marquer comme deleted) un élément. */
export const remove = mutation({
  args: { id: v.id("coupleCustomItems") },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.id, {
      visibility: "deleted",
      deletedAt: now,
    });

    return true;
  },
});
