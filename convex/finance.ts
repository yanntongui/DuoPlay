import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertAdmin } from "./lib/admin";

export const list = query({
  args: {
    page: v.number(),
    pageSize: v.number(),
    status: v.optional(v.union(
      v.literal("completed"),
      v.literal("pending"),
      v.literal("failed"),
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

    let transactions = await ctx.db.query("transactions").collect();

    if (status) {
      transactions = transactions.filter((t: any) => t.status === status);
    }

    if (search) {
      const query = search.toLowerCase();
      transactions = transactions.filter((t: any) =>
        t.user.toLowerCase().includes(query) ||
        t.id.toLowerCase().includes(query)
      );
    }

    transactions.sort((a: any, b: any) => b.createdAt - a.createdAt);

    const totalCount = transactions.length;
    const start = page * pageSize;
    const paginated = transactions.slice(start, start + pageSize);

    return {
      transactions: paginated,
      totalCount,
      page,
      pageSize,
    };
  },
});

export const upsert = mutation({
  args: {
    adminKey: v.string(),
    id: v.optional(v.id("transactions")),
    user: v.string(),
    type: v.string(),
    amount: v.number(),
    currency: v.string(),
    status: v.union(
      v.literal("completed"),
      v.literal("pending"),
      v.literal("failed"),
    ),
  },
  handler: async (ctx: any, args: any) => {
    const { adminKey, id, ...data } = args;
    await assertAdmin(adminKey);

    const now = Date.now();

    const txId = id
      ? await ctx.db.patch(id, { ...data, updatedAt: now })
      : await ctx.db.insert("transactions", { ...data, createdAt: now, updatedAt: now });

    await ctx.db.insert("auditLogs", {
      action: id ? "transaction_update" : "transaction_create",
      target: { id: txId, user: data.user },
      adminId: adminKey,
      createdAt: now,
    });

    return txId;
  },
});

export const remove = mutation({
  args: {
    adminKey: v.string(),
    id: v.id("transactions"),
  },
  handler: async (ctx: any, args: any) => {
    const { adminKey, id } = args;
    await assertAdmin(adminKey);

    const tx = await ctx.db.get(id);
    if (!tx) {
      throw new Error("Transaction introuvable");
    }

    await ctx.db.delete(id);

    await ctx.db.insert("auditLogs", {
      action: "transaction_delete",
      target: { id, user: tx.user },
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

    const all = await ctx.db.query("transactions").collect();
    const total = all.filter((t: any) => t.status === "completed").reduce((sum: number, t: any) => sum + t.amount, 0);

    return {
      total: all.length,
      revenue: total,
    };
  },
});
