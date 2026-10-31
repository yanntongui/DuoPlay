import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { cleanDeviceToken } from "./lib/identity";

/**
 * Notifications in-app (cf. PRD §14).
 *
 * Sans push ni e-mail au MVP, la relance est **consultée dans l'application**
 * (jamais un spam de notifications) ; le partage WhatsApp reste le canal de
 * secours, généré côté client. Un tap suffit pour lire ou écarter.
 */

const MAX_ITEMS = 20;

export const list = query({
  args: { deviceToken: v.string() },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const rows = await ctx.db
      .query("notifications")
      .withIndex("by_device", (q) => q.eq("deviceToken", deviceToken))
      .collect();

    const active = rows
      .filter((row) => !row.dismissedAt)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, MAX_ITEMS);

    const items = await Promise.all(
      active.map(async (row) => {
        const session = row.sessionId
          ? await ctx.db.get(row.sessionId)
          : null;
        return {
          id: row._id,
          kind: row.kind,
          title: row.title,
          body: row.body,
          sessionId: row.sessionId ?? null,
          sessionToken: session?.token ?? null,
          level: row.level ?? null,
          read: Boolean(row.readAt),
          createdAt: row.createdAt,
        };
      }),
    );

    return {
      unread: active.filter((row) => !row.readAt).length,
      items,
    };
  },
});

export const markRead = mutation({
  args: { deviceToken: v.string(), id: v.id("notifications") },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const row = await ctx.db.get(args.id);
    if (!row || row.deviceToken !== deviceToken) {
      throw new Error("Notification introuvable.");
    }
    if (!row.readAt) await ctx.db.patch(row._id, { readAt: Date.now() });
    return { ok: true };
  },
});

export const markAllRead = mutation({
  args: { deviceToken: v.string() },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const rows = await ctx.db
      .query("notifications")
      .withIndex("by_device", (q) => q.eq("deviceToken", deviceToken))
      .collect();
    const now = Date.now();
    for (const row of rows) {
      if (!row.readAt && !row.dismissedAt) {
        await ctx.db.patch(row._id, { readAt: now });
      }
    }
    return { ok: true };
  },
});

export const dismiss = mutation({
  args: { deviceToken: v.string(), id: v.id("notifications") },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const row = await ctx.db.get(args.id);
    if (!row || row.deviceToken !== deviceToken) {
      throw new Error("Notification introuvable.");
    }
    if (!row.dismissedAt) {
      await ctx.db.patch(row._id, {
        dismissedAt: Date.now(),
        readAt: row.readAt ?? Date.now(),
      });
    }
    return { ok: true };
  },
});
