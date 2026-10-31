import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertAdmin } from "./lib/admin";

/* ------------------------------------------------------------------ */
/* Signalement (public, cf. PRD §6 / §15.5)                            */
/* ------------------------------------------------------------------ */

export const create = mutation({
  args: {
    targetType: v.union(v.literal("experience"), v.literal("question")),
    targetId: v.string(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("reports", {
      targetType: args.targetType,
      targetId: args.targetId,
      reason: args.reason.trim().slice(0, 500),
      status: "nouveau",
      createdAt: Date.now(),
    });
  },
});

/* ------------------------------------------------------------------ */
/* Modération                                                          */
/* ------------------------------------------------------------------ */

export const listAll = query({
  args: { adminKey: v.string() },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const items = await ctx.db.query("reports").collect();
    return items.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const resolve = mutation({
  args: {
    adminKey: v.string(),
    id: v.id("reports"),
    status: v.union(
      v.literal("nouveau"),
      v.literal("traite"),
      v.literal("rejete"),
    ),
  },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    await ctx.db.patch(args.id, { status: args.status });
  },
});
