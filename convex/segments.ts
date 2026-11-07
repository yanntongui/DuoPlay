import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { assertAdmin } from "./lib/admin";

export const list = query({
  args: {
    page: v.number(),
    pageSize: v.number(),
    status: v.optional(v.union(
      v.literal("published"),
      v.literal("draft"),
      v.literal("review"),
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
    // Verify admin access (this could be enhanced with proper role check)
    const access = await ctx.db.query("adminAccess").collect();
    if (!access.some((a: any) => a.userId === identity._id)) {
      throw new Error("Accès refusé");
    }

    let segments = await ctx.db.query("segments").collect();

    // Filter by status
    if (status) {
      segments = segments.filter((s: any) => s.status === status);
    }

    // Filter by search
    if (search) {
      const query = search.toLowerCase();
      segments = segments.filter((s: any) =>
        s.name.toLowerCase().includes(query) ||
        (s.description && s.description.toLowerCase().includes(query))
      );
    }

    // Sort by updatedAt descending
    segments.sort((a: any, b: any) => b.updatedAt - a.updatedAt);

    // Pagination
    const totalCount = segments.length;
    const start = page * pageSize;
    const paginated = segments.slice(start, start + pageSize);

    return {
      segments: paginated,
      totalCount,
      page,
      pageSize,
    };
  },
});

export const upsert = mutation({
  args: {
    adminKey: v.string(),
    id: v.optional(v.id("segments")),
    name: v.string(),
    description: v.optional(v.string()),
    type: v.string(),
    size: v.number(),
    growthRate: v.optional(v.number()),
    status: v.union(
      v.literal("published"),
      v.literal("draft"),
      v.literal("review"),
    ),
  },
  handler: async (ctx: any, args: any) => {
    const { adminKey, id, ...data } = args;
    await assertAdmin(adminKey);

    const now = Date.now();

    const segmentId = id
      ? await ctx.db.patch(id, { ...data, updatedAt: now })
      : await ctx.db.insert("segments", { ...data, createdAt: now, updatedAt: now });

    // Log audit
    await ctx.db.insert("auditLogs", {
      action: id ? "segment_update" : "segment_create",
      target: { id: segmentId, name: data.name },
      adminId: adminKey,
      createdAt: now,
    });

    return segmentId;
  },
});

export const remove = mutation({
  args: {
    adminKey: v.string(),
    id: v.id("segments"),
  },
  handler: async (ctx: any, args: any) => {
    const { adminKey, id } = args;
    await assertAdmin(adminKey);

    const segment = await ctx.db.get(id);
    if (!segment) {
      throw new Error("Segment introuvable");
    }

    await ctx.db.delete(id);

    // Log audit
    await ctx.db.insert("auditLogs", {
      action: "segment_delete",
      target: { id, name: segment.name },
      adminId: adminKey,
      createdAt: Date.now(),
    });
  },
});

export const getById = query({
  args: { id: v.id("segments") },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Accès refusé");
    }

    return ctx.db.get(args.id);
  },
});
