import { v } from "convex/values";
import { query } from "./_generated/server";
import { dayKey, dayKeyMinus, dayStart } from "./lib/dates";
import { cleanDeviceToken } from "./lib/identity";

/**
 * « Mon activité » (§5) — statistiques personnelles de l'appareil.
 *
 * Tout est dérivé des données réelles de l'appareil (aucune estimation) :
 * seules les parties `terminee` comptent comme jouées, jamais les parties
 * abandonnées ni expirées ; une même session n'est jamais comptée deux fois
 * (elle est rejointe ou reprise, pas dupliquée). Aucune donnée du partenaire
 * n'est exposée ici : uniquement ce que l'appareil a lui-même vécu.
 */

const rangeValidator = v.union(
  v.literal("7d"),
  v.literal("30d"),
  v.literal("all"),
);
type Range = "7d" | "30d" | "all";

const RECENT_LIMIT = 4;
const WEEKDAYS = ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"] as const;

function windowDays(range: Range): number | null {
  if (range === "7d") return 7;
  if (range === "30d") return 30;
  return null;
}

function weekdayLabel(dateKey: string): string {
  return WEEKDAYS[new Date(`${dateKey}T00:00:00.000Z`).getUTCDay()];
}

/** Nombre de jours récents pré-agrégés pour le graphique. */
const CHART_DAYS = 7;

export const overview = query({
  args: { deviceToken: v.string(), range: v.optional(rangeValidator) },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const selected: Range = args.range ?? "all";
    const now = Date.now();

    const days = windowDays(selected);
    const today = dayKey(now);
    const startMs =
      days === null ? null : dayStart(dayKeyMinus(today, days - 1));
    // Fenêtre précédente de même durée, juste avant celle-ci (tendance).
    const prevStartMs =
      days === null ? null : dayStart(dayKeyMinus(today, days * 2 - 1));

    const inRange = (at: number) => startMs === null || at >= startMs;
    const inPrev = (at: number) =>
      prevStartMs !== null && startMs !== null && at >= prevStartMs && at < startMs;

    /* --- Graphique : 7 derniers jours, jours vides inclus ------------ */
    const chartKeys: string[] = [];
    const perDay = new Map<string, number>();
    for (let offset = CHART_DAYS - 1; offset >= 0; offset -= 1) {
      const key = dayKeyMinus(today, offset);
      chartKeys.push(key);
      perDay.set(key, 0);
    }

    /* --- Parties de l'appareil --------------------------------------- */
    const rows = await ctx.db
      .query("sessionPlayers")
      .withIndex("by_device", (q) => q.eq("deviceToken", deviceToken))
      .collect();

    const seen = new Set<string>();
    const activeDays = new Set<string>();
    const myExperiences = new Set<string>();
    const prevExperiences = new Set<string>();
    const recent: {
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
    }[] = [];

    let sessions = 0;
    let shared = 0;
    let sessionsEver = 0;
    let prevSessions = 0;
    let prevShared = 0;

    for (const row of rows) {
      const session = await ctx.db.get(row.sessionId);
      if (!session || seen.has(session._id)) continue;
      seen.add(session._id);

      const [experience, category, players] = await Promise.all([
        ctx.db.get(session.experienceId),
        ctx.db.get(session.categoryId),
        ctx.db
          .query("sessionPlayers")
          .withIndex("by_session", (q) => q.eq("sessionId", session._id))
          .collect(),
      ]);

      const partner = players.find((item) => item._id !== row._id) ?? null;
      const expired =
        session.status === "expiree" || now > session.tokenExpiresAt;

      recent.push({
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
          ? { slug: category.slug, title: category.title, emoji: category.emoji }
          : null,
        partnerName: partner?.name ?? null,
      });

      if (session.status !== "terminee") continue;

      sessionsEver += 1;
      const doneAt = session.completedAt ?? session.lastActivityAt;
      const isShared = players.length >= 2;

      if (inRange(doneAt)) {
        sessions += 1;
        if (isShared) shared += 1;
        if (experience) myExperiences.add(String(session.experienceId));
        activeDays.add(dayKey(doneAt));
        const key = dayKey(doneAt);
        if (perDay.has(key)) perDay.set(key, (perDay.get(key) ?? 0) + 1);
      } else if (inPrev(doneAt)) {
        prevSessions += 1;
        if (isShared) prevShared += 1;
        if (experience) prevExperiences.add(String(session.experienceId));
      }
    }

    /* --- Défis accomplis (achèvements enregistrés) ------------------ */
    const completions = await ctx.db
      .query("challengeCompletions")
      .withIndex("by_device", (q) => q.eq("deviceToken", deviceToken))
      .collect();

    let challenges = 0;
    let prevChallenges = 0;
    for (const completion of completions) {
      if (inRange(completion.doneAt)) {
        challenges += 1;
        activeDays.add(dayKey(completion.doneAt));
      } else if (inPrev(completion.doneAt)) {
        prevChallenges += 1;
      }
    }

    recent.sort((a, b) => b.lastActivityAt - a.lastActivityAt);

    return {
      range: selected,
      counts: {
        sessions,
        shared,
        experiences: myExperiences.size,
        challenges,
      },
      previous:
        days === null
          ? null
          : {
              sessions: prevSessions,
              shared: prevShared,
              experiences: prevExperiences.size,
              challenges: prevChallenges,
            },
      activeDays: activeDays.size,
      chart: chartKeys.map((key) => ({
        date: key,
        label: weekdayLabel(key),
        count: perDay.get(key) ?? 0,
      })),
      recent: recent.slice(0, RECENT_LIMIT),
      // Sert à distinguer un nouvel appareil (aucun historique) d'un couple
      // simplement inactif sur la période choisie.
      allTime: { sessions: sessionsEver, challenges: completions.length },
    };
  },
});
