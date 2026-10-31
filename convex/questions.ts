import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertAdmin } from "./lib/admin";

const kind = v.union(
  v.literal("choice"),
  v.literal("open"),
  v.literal("challenge"),
);

const depth = v.union(
  v.literal("leger"),
  v.literal("moyen"),
  v.literal("profond"),
);

const status = v.union(
  v.literal("draft"),
  v.literal("published"),
  v.literal("archived"),
);

/* ------------------------------------------------------------------ */
/* Lecture                                                             */
/* ------------------------------------------------------------------ */

export const listByExperience = query({
  args: { experienceId: v.id("experiences") },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("questions")
      .withIndex("by_experience", (q) =>
        q.eq("experienceId", args.experienceId),
      )
      .collect();
    return items.sort((a, b) => a.order - b.order);
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const experiences = await ctx.db.query("experiences").collect();
    const byId = new Map(experiences.map((e) => [e._id, e]));
    const items = await ctx.db.query("questions").collect();

    return items
      .sort((a, b) => a.order - b.order)
      .map((item) => ({
        ...item,
        experienceTitle: byId.get(item.experienceId)?.title ?? "—",
      }));
  },
});

/* ------------------------------------------------------------------ */
/* Administration                                                      */
/* ------------------------------------------------------------------ */

export const adminUpsert = mutation({
  args: {
    adminKey: v.string(),
    id: v.optional(v.id("questions")),
    experienceId: v.id("experiences"),
    kind,
    prompt: v.string(),
    options: v.optional(v.array(v.string())),
    depth,
    themes: v.array(v.string()),
    order: v.number(),
    status,
  },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const { adminKey: _adminKey, id, ...data } = args;

    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return await ctx.db.insert("questions", data);
  },
});

export const adminSetStatus = mutation({
  args: { adminKey: v.string(), id: v.id("questions"), status },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const adminRemove = mutation({
  args: { adminKey: v.string(), id: v.id("questions") },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    await ctx.db.delete(args.id);
  },
});
