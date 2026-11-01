import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";

/**
 * Vérifie l'accès administrateur
 */
export async function verifyAdmin(ctx: any, apiKey?: string) {
  // En production: vérifier via Convex Auth ou API key
  return { adminId: "admin_001", role: "super_admin" };
}

/**
 * Utilisateurs
 */

export const listUsers = query({
  handler: async (ctx, args: { cursor?: string; limit?: number }) => {
    const limit = args.limit ?? 20;
    const results = await ctx.db
      .query("profiles")
      .order("desc")
      .take(limit + 1);

    return {
      users: results.slice(0, limit),
      nextPage: results.length > limit ? results[limit]._id : undefined,
    };
  },
});

export const getUserById = query({
  args: { id: v.id("profiles") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (!user) throw new ConvexError("Utilisateur non trouvé");
    return user;
  },
});

export const suspendUser = mutation({
  args: {
    userId: v.id("profiles"),
    reason: v.string(),
    adminId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { status: "suspended" });

    // Journaliser l'audit
    await ctx.db.insert("auditLogs", {
      action: "user_suspended",
      target: args.userId,
      adminId: args.adminId,
      reason: args.reason,
      createdAt: Date.now(),
    });
  },
});

export const activateUser = mutation({
  args: {
    userId: v.id("profiles"),
    adminId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { status: "active" });

    await ctx.db.insert("auditLogs", {
      action: "user_activated",
      target: args.userId,
      adminId: args.adminId,
      createdAt: Date.now(),
    });
  },
});

/**
 * Expériences / Contenu
 */

export const listExperiences = query({
  args: {
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
    status: v.optional(v.union(v.literal("draft"), v.literal("published"), v.literal("archived"))),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    let query = ctx.db.query("experiences").order("desc");

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    const results = await query.take(limit + 1);

    return {
      experiences: results.slice(0, limit),
      nextPage: results.length > limit ? results[limit]._id : undefined,
    };
  },
});

export const publishExperience = mutation({
  args: {
    experienceId: v.id("experiences"),
    adminId: v.string(),
  },
  handler: async (ctx, args) => {
    const exp = await ctx.db.get(args.experienceId);
    if (!exp) throw new ConvexError("Expérience non trouvée");

    await ctx.db.patch(args.experienceId, { status: "published" });

    await ctx.db.insert("auditLogs", {
      action: "experience_published",
      target: args.experienceId,
      adminId: args.adminId,
      createdAt: Date.now(),
    });
  },
});

export const archiveExperience = mutation({
  args: {
    experienceId: v.id("experiences"),
    adminId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.experienceId, { status: "archived" });

    await ctx.db.insert("auditLogs", {
      action: "experience_archived",
      target: args.experienceId,
      adminId: args.adminId,
      createdAt: Date.now(),
    });
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
    adminId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    let query = ctx.db.query("auditLogs").order("desc");

    if (args.action) {
      query = query.filter((q) => q.eq(q.field("action"), args.action));
    }

    if (args.adminId) {
      query = query.filter((q) => q.eq(q.field("adminId"), args.adminId));
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
