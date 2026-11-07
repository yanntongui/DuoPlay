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

    let tickets = await ctx.db.query("supportTickets").collect();

    if (status) {
      tickets = tickets.filter((t: any) => t.status === status);
    }

    if (search) {
      const query = search.toLowerCase();
      tickets = tickets.filter((t: any) =>
        t.subject.toLowerCase().includes(query) ||
        t.user.toLowerCase().includes(query)
      );
    }

    tickets.sort((a: any, b: any) => b.createdAt - a.createdAt);

    const totalCount = tickets.length;
    const start = page * pageSize;
    const paginated = tickets.slice(start, start + pageSize);

    return {
      tickets: paginated,
      totalCount,
      page,
      pageSize,
    };
  },
});

export const upsert = mutation({
  args: {
    adminKey: v.string(),
    id: v.optional(v.id("supportTickets")),
    subject: v.string(),
    user: v.string(),
    category: v.string(),
    priority: v.union(
      v.literal("high"),
      v.literal("medium"),
      v.literal("low"),
    ),
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

    const ticketId = id
      ? await ctx.db.patch(id, { ...data, updatedAt: now })
      : await ctx.db.insert("supportTickets", { ...data, createdAt: now, updatedAt: now });

    await ctx.db.insert("auditLogs", {
      action: id ? "ticket_update" : "ticket_create",
      target: { id: ticketId, subject: data.subject },
      adminId: adminKey,
      createdAt: now,
    });

    return ticketId;
  },
});

export const remove = mutation({
  args: {
    adminKey: v.string(),
    id: v.id("supportTickets"),
  },
  handler: async (ctx: any, args: any) => {
    const { adminKey, id } = args;
    await assertAdmin(adminKey);

    const ticket = await ctx.db.get(id);
    if (!ticket) {
      throw new Error("Ticket introuvable");
    }

    await ctx.db.delete(id);

    await ctx.db.insert("auditLogs", {
      action: "ticket_delete",
      target: { id, subject: ticket.subject },
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

    const all = await ctx.db.query("supportTickets").collect();
    const open = all.filter((t: any) => t.status === "pending" || t.status === "in_progress").length;

    return {
      total: all.length,
      open,
    };
  },
});
