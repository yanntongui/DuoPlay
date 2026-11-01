import {
  ActionBuilder,
  HttpActionBuilder,
  internalMutation,
  internalQuery,
  query,
  mutation,
} from "./_generated/server";
import { v } from "convex/values";

/**
 * Admin Actions
 */

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Find the user by email (in production, use Convex Auth)
    const users = await ctx.db.query("users").collect();
    const user = users.find((u) => u.email === args.email);

    if (!user) {
      // Create demo user if not exists
      const userId = await ctx.db.insert("users", {
        name: "Admin",
        email: args.email,
        image: "",
        isVerified: true,
      });

      await ctx.db.insert("profiles", {
        userId,
        displayName: "Admin",
        role: "admin",
        plan: "premium",
        status: "active",
        lastActiveAt: Date.now(),
        createdAt: Date.now(),
      });

      await ctx.db.insert("adminAccess", {
        userId,
        role: "super_admin",
        permissions: ["*"],
        canViewSensitive: true,
        twoFactorEnabled: false,
        lastLoginAt: Date.now(),
        createdAt: Date.now(),
      });

      return { token: "demo_token" };
    }

    const adminProfile = await ctx.db
      .query("adminAccess")
      .withIndex("by_user", (q) => q.eq("userId", user.userId))
      .first();

    if (!adminProfile) {
      throw new Error("User is not an admin");
    }

    // Record last login
    await ctx.db.patch(adminProfile._id, {
      lastLoginAt: Date.now(),
    });

    return { token: "demo_token" };
  },
});

/**
 * Admin Queries
 */

export const adminMe = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const adminProfile = await ctx.db
      .query("adminAccess")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    if (!adminProfile) return null;

    return {
      userId: identity.subject,
      role: adminProfile.role,
      permissions: adminProfile.permissions,
      canViewSensitive: adminProfile.canViewSensitive,
      twoFactorEnabled: adminProfile.twoFactorEnabled,
    };
  },
});

/**
 * Admin Functions
 */

export const listUsers = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const adminProfile = await ctx.db
      .query("adminAccess")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    if (!adminProfile) throw new Error("Not an admin");

    // Check permission
    if (!adminProfile.permissions.includes("user.read") && adminProfile.permissions.length > 1) {
      throw new Error("Permission denied");
    }

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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const adminProfile = await ctx.db
      .query("adminAccess")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    if (!adminProfile) throw new Error("Not an admin");

    if (!adminProfile.permissions.includes("user.suspend")) {
      throw new Error("Permission denied");
    }

    await ctx.db.patch(args.userId, { status: "suspended" });

    await ctx.db.insert("auditLogs", {
      action: "user_suspended",
      target: args.userId,
      adminId: identity.subject,
      reason: args.reason,
      createdAt: Date.now(),
    });
  },
});

export const activateUser = mutation({
  args: {
    userId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const adminProfile = await ctx.db
      .query("adminAccess")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    if (!adminProfile) throw new Error("Not an admin");

    if (!adminProfile.permissions.includes("user.activate")) {
      throw new Error("Permission denied");
    }

    await ctx.db.patch(args.userId, { status: "active" });

    await ctx.db.insert("auditLogs", {
      action: "user_activated",
      target: args.userId,
      adminId: identity.subject,
      createdAt: Date.now(),
    });
  },
});

export const listExperiences = query({
  args: {
    status: v.optional(v.union(v.literal("draft"), v.literal("published"), v.literal("archived"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const adminProfile = await ctx.db
      .query("adminAccess")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    if (!adminProfile) throw new Error("Not an admin");

    if (!adminProfile.permissions.includes("content.read") && adminProfile.permissions.length > 1) {
      throw new Error("Permission denied");
    }

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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const adminProfile = await ctx.db
      .query("adminAccess")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    if (!adminProfile) throw new Error("Not an admin");

    if (!adminProfile.permissions.includes("content.publish")) {
      throw new Error("Permission denied");
    }

    const exp = await ctx.db.get(args.experienceId);
    if (!exp) throw new Error("Experience not found");

    await ctx.db.patch(args.experienceId, { status: "published" });

    await ctx.db.insert("auditLogs", {
      action: "experience_published",
      target: args.experienceId,
      adminId: identity.subject,
      createdAt: Date.now(),
    });
  },
});

export const archiveExperience = mutation({
  args: {
    experienceId: v.id("experiences"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const adminProfile = await ctx.db
      .query("adminAccess")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    if (!adminProfile) throw new Error("Not an admin");

    if (!adminProfile.permissions.includes("content.archive")) {
      throw new Error("Permission denied");
    }

    await ctx.db.patch(args.experienceId, { status: "archived" });

    await ctx.db.insert("auditLogs", {
      action: "experience_archived",
      target: args.experienceId,
      adminId: identity.subject,
      createdAt: Date.now(),
    });
  },
});

export const getAuditLogs = query({
  args: {
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
    action: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const adminProfile = await ctx.db
      .query("adminAccess")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    if (!adminProfile) throw new Error("Not an admin");

    if (!adminProfile.permissions.includes("audit.read") && adminProfile.permissions.length > 1) {
      throw new Error("Permission denied");
    }

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

export const getStats = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const adminProfile = await ctx.db
      .query("adminAccess")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    if (!adminProfile) throw new Error("Not an admin");

    if (!adminProfile.permissions.includes("dashboard.read") && adminProfile.permissions.length > 1) {
      throw new Error("Permission denied");
    }

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
