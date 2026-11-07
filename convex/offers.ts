import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertAdmin } from "./lib/admin";

export const list = query({
  args: {
    page: v.number(),
    pageSize: v.number(),
    status: v.optional(v.union(
      v.literal("active"),
      v.literal("paused"),
      v.literal("expired"),
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

    let promos = await ctx.db.query("promoCodes").collect();

    if (status) {
      promos = promos.filter((p: any) => p.status === status);
    }

    if (search) {
      const query = search.toLowerCase();
      promos = promos.filter((p: any) =>
        p.code.toLowerCase().includes(query) ||
        (p.description || "").toLowerCase().includes(query)
      );
    }

    promos.sort((a: any, b: any) => b.createdAt - a.createdAt);

    const totalCount = promos.length;
    const start = page * pageSize;
    const paginated = promos.slice(start, start + pageSize);

    return {
      promos: paginated,
      totalCount,
      page,
      pageSize,
    };
  },
});

export const upsert = mutation({
  args: {
    adminKey: v.string(),
    id: v.optional(v.id("promoCodes")),
    code: v.string(),
    type: v.union(
      v.literal("Pourcentage"),
      v.literal("Montant fixe"),
      v.literal("Essai"),
    ),
    value: v.string(),
    maxUses: v.number(),
    expiry: v.optional(v.string()),
    status: v.union(
      v.literal("active"),
      v.literal("paused"),
      v.literal("expired"),
    ),
  },
  handler: async (ctx: any, args: any) => {
    const { adminKey, id, ...data } = args;
    await assertAdmin(adminKey);

    const now = Date.now();

    const promoId = id
      ? await ctx.db.patch(id, { ...data, updatedAt: now })
      : await ctx.db.insert("promoCodes", { ...data, createdAt: now, updatedAt: now });

    await ctx.db.insert("auditLogs", {
      action: id ? "promo_update" : "promo_create",
      target: { id: promoId, code: data.code },
      adminId: adminKey,
      createdAt: now,
    });

    return promoId;
  },
});

export const remove = mutation({
  args: {
    adminKey: v.string(),
    id: v.id("promoCodes"),
  },
  handler: async (ctx: any, args: any) => {
    const { adminKey, id } = args;
    await assertAdmin(adminKey);

    const promo = await ctx.db.get(id);
    if (!promo) {
      throw new Error("Code promo introuvable");
    }

    await ctx.db.delete(id);

    await ctx.db.insert("auditLogs", {
      action: "promo_delete",
      target: { id, code: promo.code },
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

    const all = await ctx.db.query("promoCodes").collect();
    const active = all.filter((p: any) => p.status === "active").length;

    return {
      total: all.length,
      active,
    };
  },
});
