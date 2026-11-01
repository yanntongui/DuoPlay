import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Login simplifié pour la démo - accepte n'importe quel email/mot de passe
 */
export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Pour la démo : accepter n'importe quel email/mot de passe
    // En production : utiliser Convex Auth avec validation réelle

    return { success: true };
  },
});

/**
 * Récupérer le profil admin (toujours retourne admin pour démo)
 */
export const adminMe = query({
  handler: async (ctx) => {
    return {
      userId: "demo_admin",
      role: "super_admin",
      permissions: ["*"],
      canViewSensitive: true,
      twoFactorEnabled: false,
    };
  },
});

/**
 * Utilisateurs
 */
export const listUsers = query({
  handler: async (ctx) => {
    const results = await ctx.db.query("profiles").order("desc").take(100);
    return results;
  },
});

export const suspendUser = mutation({
  args: {
    userId: v.id("profiles"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { status: "suspended" });
  },
});

export const activateUser = mutation({
  args: {
    userId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { status: "active" });
  },
});

/**
 * Expériences / Contenu
 */
export const listExperiences = query({
  args: {
    status: v.optional(v.union(v.literal("draft"), v.literal("published"), v.literal("archived"))),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("experiences").order("desc");
    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }
    return await query.take(100);
  },
});

export const publishExperience = mutation({
  args: {
    experienceId: v.id("experiences"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.experienceId, { status: "published" });
  },
});

export const archiveExperience = mutation({
  args: {
    experienceId: v.id("experiences"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.experienceId, { status: "archived" });
  },
});

/**
 * Audit Logs
 */
export const getAuditLogs = query({
  args: {
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
    action: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    let query = ctx.db.query("auditLogs").order("desc");

    if (args.action) {
      query = query.filter((q) => q.eq(q.field("action"), args.action));
    }

    const results = await query.take(limit + 1);
    return {
      logs: results.slice(0, limit),
      nextPage: results.length > limit ? results[limit]._id : undefined,
    };
  },
});

/**
 * Stats / Dashboard
 */
export const getStats = query({
  handler: async (ctx) => {
    const usersTotal = await ctx.db.query("profiles").collect();
    const couplesTotal = await ctx.db.query("couples").collect();
    const sessionsTotal = await ctx.db.query("sessions").collect();

    return {
      usersTotal: usersTotal.length,
      couplesTotal: couplesTotal.length,
      sessionsTotal: sessionsTotal.length,
    };
  },
});
