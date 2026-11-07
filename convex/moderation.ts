import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertAdmin } from "./lib/admin";

export const list = query({
  args: {
    page: v.number(),
    pageSize: v.number(),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("resolved"),
    )),
    search: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const { page, pageSize, status, search } = args;

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Accès refusé");
    }
    const access = await ctx.db.query("adminAccess").collect();
    if (!access.some((a: any) => a.userId === identity._id)) {
      throw new Error("Accès refusé");
    }

    let reports = await ctx.db.query("reports").collect();

    if (status) {
      reports = reports.filter((r: any) => r.status === status);
    }

    if (search) {
      const query = search.toLowerCase();
      reports = reports.filter((r: any) =>
        r.content.toLowerCase().includes(query) ||
        r.motif.toLowerCase().includes(query)
      );
    }

    reports.sort((a: any, b: any) => b.createdAt - a.createdAt);

    const totalCount = reports.length;
    const start = page * pageSize;
    const paginated = reports.slice(start, start + pageSize);

    return {
      reports: paginated,
      totalCount,
      page,
      pageSize,
    };
  },
});

export const upsert = mutation({
  args: {
    adminKey: v.string(),
    id: v.optional(v.id("reports")),
    content: v.string(),
    motif: v.string(),
    severity: v.union(
      v.literal("high"),
      v.literal("medium"),
      v.literal("low"),
    ),
    category: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("resolved"),
    ),
  },
  handler: async (ctx: any, args: any) => {
    const { adminKey, id, ...data } = args;
    await assertAdmin(adminKey);

    const now = Date.now();

    const reportId = id
      ? await ctx.db.patch(id, { ...data, updatedAt: now })
      : await ctx.db.insert("reports", { ...data, createdAt: now, updatedAt: now });

    await ctx.db.insert("auditLogs", {
      action: id ? "report_update" : "report_create",
      target: { id: reportId, content: data.content },
      adminId: adminKey,
      createdAt: now,
    });

    return reportId;
  },
});

export const remove = mutation({
  args: {
    adminKey: v.string(),
    id: v.id("reports"),
  },
  handler: async (ctx: any, args: any) => {
    const { adminKey, id } = args;
    await assertAdmin(adminKey);

    const report = await ctx.db.get(id);
    if (!report) {
      throw new Error("Signalement introuvable");
    }

    await ctx.db.delete(id);

    await ctx.db.insert("auditLogs", {
      action: "report_delete",
      target: { id, content: report.content },
      adminId: adminKey,
      createdAt: Date.now(),
    });
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Accès refusé");
    }
    const access = await ctx.db.query("adminAccess").collect();
    if (!access.some((a: any) => a.userId === identity._id)) {
      throw new Error("Accès refusé");
    }

    const all = await ctx.db.query("reports").collect();
    const pending = all.filter((r: any) => r.status === "pending").length;
    const highSeverity = all.filter((r: any) => r.severity === "high" && r.status !== "resolved").length;

    return {
      total: all.length,
      pending,
      highSeverity,
    };
  },
});
