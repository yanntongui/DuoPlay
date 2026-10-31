import { v } from "convex/values";
import { internalMutation, mutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { assertAdmin } from "./lib/admin";

/**
 * Rétention & purge (cf. PRD §15.2).
 *
 * Les données de jeu sont temporaires par nature : une partie expirée depuis
 * plus de 30 jours, ses réponses, ses relances et ses journaux de limitation
 * sont supprimés. Aucune donnée intime n'est conservée « au cas où ».
 */
const DAY_MS = 24 * 60 * 60 * 1000;
const SESSION_GRACE_MS = 30 * DAY_MS;
const NOTIFICATION_TTL_MS = 30 * DAY_MS;
const RATE_LIMIT_TTL_MS = 1 * DAY_MS;

async function runPurge(ctx: MutationCtx) {
  const now = Date.now();
  const result = { sessions: 0, answers: 0, notifications: 0, rateLimits: 0 };

  const sessions = await ctx.db.query("sessions").collect();
  for (const session of sessions) {
    if (now <= session.tokenExpiresAt + SESSION_GRACE_MS) continue;

    const players = await ctx.db
      .query("sessionPlayers")
      .withIndex("by_session", (q) => q.eq("sessionId", session._id))
      .collect();
    for (const player of players) {
      const answers = await ctx.db
        .query("answers")
        .withIndex("by_player", (q) => q.eq("playerId", player._id))
        .collect();
      for (const answer of answers) {
        await ctx.db.delete(answer._id);
        result.answers += 1;
      }
      await ctx.db.delete(player._id);
    }

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_session", (q) => q.eq("sessionId", session._id))
      .collect();
    for (const notification of notifications) {
      await ctx.db.delete(notification._id);
      result.notifications += 1;
    }

    await ctx.db.delete(session._id);
    result.sessions += 1;
  }

  const notifications = await ctx.db.query("notifications").collect();
  for (const notification of notifications) {
    if (now - notification.createdAt > NOTIFICATION_TTL_MS) {
      await ctx.db.delete(notification._id);
      result.notifications += 1;
    }
  }

  const limits = await ctx.db.query("rateLimits").collect();
  for (const limit of limits) {
    if (now - limit.windowStart > RATE_LIMIT_TTL_MS) {
      await ctx.db.delete(limit._id);
      result.rateLimits += 1;
    }
  }

  return result;
}

export const purgeInternal = internalMutation({
  args: {},
  handler: async (ctx) => runPurge(ctx),
});

/** Purge à la demande (outil d'exploitation / test). */
export const purge = mutation({
  args: { adminKey: v.string() },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    return await runPurge(ctx);
  },
});
