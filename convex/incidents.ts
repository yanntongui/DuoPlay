import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { assertAdmin } from "./lib/admin";

export const list = query({
  args: {
    page: v.number(),
    pageSize: v.number(),
    status: v.optional(v.union(
      v.literal("in_progress"),
      v.literal("resolved"),
    )),
    search: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const { page, pageSize, status, search } = args;

    // Check admin authorization
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Accès refusé");
    }
    const access = await ctx.db.query("adminAccess").collect();
    if (!access.some((a: any) => a.userId === identity._id)) {
      throw new Error("Accès refusé");
    }

    let incidents = await ctx.db.query("incidents").collect();

    // Filter by status
    if (status) {
      incidents = incidents.filter((i: any) => i.status === status);
    }

    // Filter by search
    if (search) {
      const query = search.toLowerCase();
      incidents = incidents.filter((i: any) =>
        i.title.toLowerCase().includes(query) ||
        i.service.toLowerCase().includes(query)
      );
    }

    // Sort by startedAt descending (most recent first)
    incidents.sort((a: any, b: any) => b.startedAt - a.startedAt);

    // Pagination
    const totalCount = incidents.length;
    const start = page * pageSize;
    const paginated = incidents.slice(start, start + pageSize);

    return {
      incidents: paginated,
      totalCount,
      page,
      pageSize,
    };
  },
});

export const declare = mutation({
  args: {
    adminKey: v.string(),
    title: v.string(),
    severity: v.union(
      v.literal("critical"),
      v.literal("major"),
      v.literal("minor"),
    ),
    service: v.string(),
    owner: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const { adminKey, ...data } = args;
    await assertAdmin(adminKey);

    const now = Date.now();

    const incidentId = await ctx.db.insert("incidents", {
      ...data,
      status: "in_progress",
      startedAt: now,
      resolvedAt: undefined,
      durationMinutes: 1,
      createdAt: now,
      updatedAt: now,
    });

    // Log audit
    await ctx.db.insert("auditLogs", {
      action: "incident_declared",
      target: { id: incidentId, title: data.title },
      adminId: adminKey,
      createdAt: now,
    });

    return incidentId;
  },
});

export const resolve = mutation({
  args: {
    adminKey: v.string(),
    id: v.id("incidents"),
  },
  handler: async (ctx: any, args: any) => {
    const { adminKey, id } = args;
    await assertAdmin(adminKey);

    const incident = await ctx.db.get(id);
    if (!incident) {
      throw new Error("Incident introuvable");
    }

    if (incident.status === "resolved") {
      throw new Error("L'incident est déjà résolu");
    }

    const now = Date.now();
    const durationMinutes = Math.max(1, Math.round((now - incident.startedAt) / 60000));

    await ctx.db.patch(id, {
      status: "resolved",
      resolvedAt: now,
      durationMinutes,
      updatedAt: now,
    });

    // Log audit
    await ctx.db.insert("auditLogs", {
      action: "incident_resolved",
      target: { id, title: incident.title },
      adminId: adminKey,
      metadata: { durationMinutes },
      createdAt: now,
    });
  },
});

export const reopen = mutation({
  args: {
    adminKey: v.string(),
    id: v.id("incidents"),
  },
  handler: async (ctx: any, args: any) => {
    const { adminKey, id } = args;
    await assertAdmin(adminKey);

    const incident = await ctx.db.get(id);
    if (!incident) {
      throw new Error("Incident introuvable");
    }

    if (incident.status !== "resolved") {
      throw new Error("L'incident n'est pas résolu");
    }

    const now = Date.now();

    await ctx.db.patch(id, {
      status: "in_progress",
      resolvedAt: undefined,
      durationMinutes: 1,
      updatedAt: now,
    });

    // Log audit
    await ctx.db.insert("auditLogs", {
      action: "incident_reopened",
      target: { id, title: incident.title },
      adminId: adminKey,
      createdAt: now,
    });
  },
});

export const getById = query({
  args: { id: v.id("incidents") },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Accès refusé");
    }

    return ctx.db.get(args.id);
  },
});

// Get active incidents count for stats
export const getStats = query({
  args: {},
  handler: async (ctx: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Accès refusé");
    }

    const all = await ctx.db.query("incidents").collect();
    const open = all.filter((i: any) => i.status === "in_progress").length;
    const critical = all.filter((i: any) => i.severity === "critical").length;

    return {
      total: all.length,
      open,
      resolved: all.length - open,
      critical,
    };
  },
});
