import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";
import { verifyAdmin } from "./lib/admin";

/**
 * Admin Authentication
 */

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // In production: use actual Convex Auth password provider
    // For demo: accept any email/password and create a test admin if not exists
    const user = await ctx.db
      .query("profiles")
      .withIndex("by_user")
      .first();

    // Create demo admin if not exists
    if (!user) {
      const userId = await ctx.db.insert("users", {
        name: args.email,
        email: args.email,
        image: "",
        isVerified: true,
      });

      await ctx.db.insert("adminAccess", {
        userId: userId,
        role: "super_admin",
        permissions: ["*"],
        canViewSensitive: true,
        twoFactorEnabled: false,
        createdAt: Date.now(),
      });

      await ctx.db.insert("profiles", {
        userId: userId,
        displayName: args.email.split("@")[0],
        role: "admin",
        plan: "premium",
        status: "active",
        lastActiveAt: Date.now(),
        createdAt: Date.now(),
      });

      return { token: "demo_token" };
    }

    // In production: verify password with Convex Auth
    const adminProfile = await ctx.db
      .query("adminAccess")
      .withIndex("by_user", (q) => q.eq("userId", user.userId))
      .first();

    if (!adminProfile) {
      throw new ConvexError("Email ou mot de passe incorrect");
    }

    // Record last login
    await ctx.db.patch(adminProfile._id, {
      lastLoginAt: Date.now(),
    });

    return { token: "demo_token" };
  },
});

/**
 * Utilisateurs
 */

export const listUsers = query({
  handler: async (ctx) => {
    await verifyAdmin(ctx, ["user.read"]);
    const results = await ctx.db.query("profiles").order("desc").take(100);
    return results;
  },
});

export const getUserById = query({
  args: { id: v.id("profiles") },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx, ["user.read"]);
    const user = await ctx.db.get(args.id);
    if (!user) throw new ConvexError("Utilisateur non trouvé");
    return user;
  },
});

export const suspendUser = mutation({
  args: {
    userId: v.id("profiles"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await verifyAdmin(ctx, ["user.suspend"]);
    await ctx.db.patch(args.userId, { status: "suspended" });
    await ctx.db.insert("auditLogs", {
      action: "user_suspended",
      target: args.userId,
      adminId: admin.userId,
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
    const admin = await verifyAdmin(ctx, ["user.activate"]);
    await ctx.db.patch(args.userId, { status: "active" });
    await ctx.db.insert("auditLogs", {
      action: "user_activated",
      target: args.userId,
      adminId: admin.userId,
      createdAt: Date.now(),
    });
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
    await verifyAdmin(ctx, ["content.read"]);
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
    const admin = await verifyAdmin(ctx, ["content.publish"]);
    const exp = await ctx.db.get(args.experienceId);
    if (!exp) throw new ConvexError("Expérience non trouvée");
    await ctx.db.patch(args.experienceId, { status: "published" });
    await ctx.db.insert("auditLogs", {
      action: "experience_published",
      target: args.experienceId,
      adminId: admin.userId,
      createdAt: Date.now(),
    });
  },
});

export const archiveExperience = mutation({
  args: {
    experienceId: v.id("experiences"),
  },
  handler: async (ctx, args) => {
    const admin = await verifyAdmin(ctx, ["content.archive"]);
    await ctx.db.patch(args.experienceId, { status: "archived" });
    await ctx.db.insert("auditLogs", {
      action: "experience_archived",
      target: args.experienceId,
      adminId: admin.userId,
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
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx, ["audit.read"]);
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
    await verifyAdmin(ctx, ["dashboard.read"]);
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

/**
 * Admin Setup (for super admin only)
 */

export const createAdminAccess = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(
      v.literal("super_admin"),
      v.literal("admin_produit"),
      v.literal("admin_support"),
      v.literal("admin_finance"),
      v.literal("admin_moderateur"),
      v.literal("admin_analyste"),
    ),
    permissions: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await verifyAdmin(ctx, ["user.manage"]);
    const existing = await ctx.db
      .query("adminAccess")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      throw new ConvexError("Admin already exists");
    }

    await ctx.db.insert("adminAccess", {
      userId: args.userId,
      role: args.role,
      permissions: args.permissions,
      canViewSensitive: args.role === "super_admin",
      twoFactorEnabled: false,
      createdAt: Date.now(),
    });
  },
});

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
