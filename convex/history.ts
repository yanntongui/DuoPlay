import { v } from "convex/values";
import { query } from "./_generated/server";
import { cleanDeviceToken } from "./lib/identity";

/**
 * Historique de l'appareil (§3.D, §5 « Notre espace »).
 * Rassemble les parties jouées et l'état de chacune, sans compte.
 */

type HistoryItem = {
  sessionId: string;
  token: string;
  playerToken: string;
  mode: string;
  status: string;
  createdAt: number;
  completedAt: number | null;
  lastActivityAt: number;
  expired: boolean;
  experience: { slug: string; title: string } | null;
  category: { slug: string; title: string; emoji: string } | null;
  partnerName: string | null;
  progress: { mine: number; revealed: number; total: number };
  resumable: boolean;
};

export const byDevice = query({
  args: { deviceToken: v.string() },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const now = Date.now();

    const rows = await ctx.db
      .query("sessionPlayers")
      .withIndex("by_device", (q) => q.eq("deviceToken", deviceToken))
      .collect();

    const collected = await Promise.all(
      rows.map(async (row): Promise<HistoryItem | null> => {
        const session = await ctx.db.get(row.sessionId);
        if (!session) return null;

        const [experience, category, players, myAnswers] = await Promise.all([
          ctx.db.get(session.experienceId),
          ctx.db.get(session.categoryId),
          ctx.db
            .query("sessionPlayers")
            .withIndex("by_session", (q) => q.eq("sessionId", session._id))
            .collect(),
          ctx.db
            .query("answers")
            .withIndex("by_player", (q) => q.eq("playerId", row._id))
            .collect(),
        ]);

        const partner = players.find((item) => item._id !== row._id) ?? null;
        const total = session.questionIds.length;
        const mine = myAnswers.length;
        // « Expirée » fait foi dès que le cycle de vie (§13) l'a matérialisée,
        // même si le client et le serveur ne partagent pas la même horloge.
        const expired =
          session.status === "expiree" || now > session.tokenExpiresAt;

        return {
          sessionId: session._id,
          token: session.token,
          playerToken: row.playerToken,
          mode: session.mode,
          status: session.status,
          createdAt: session.createdAt,
          completedAt: session.completedAt ?? null,
          lastActivityAt: session.lastActivityAt,
          expired,
          experience: experience
            ? { slug: experience.slug, title: experience.title }
            : null,
          category: category
            ? {
                slug: category.slug,
                title: category.title,
                emoji: category.emoji,
              }
            : null,
          partnerName: partner?.name ?? null,
          progress: {
            mine,
            revealed: myAnswers.filter(
              (answer) => answer.revealed && !answer.skipped,
            ).length,
            total,
          },
          resumable:
            !expired && session.status !== "terminee" && mine < total,
        };
      }),
    );

    const items = collected
      .filter((item): item is HistoryItem => item !== null)
      .sort((a, b) => b.createdAt - a.createdAt);

    return {
      items,
      summary: {
        sessions: items.length,
        completed: items.filter((item) => item.status === "terminee").length,
        inProgress: items.filter((item) => item.resumable).length,
        answered: items.reduce((sum, item) => sum + item.progress.mine, 0),
        revealed: items.reduce((sum, item) => sum + item.progress.revealed, 0),
      },
    };
  },
});
