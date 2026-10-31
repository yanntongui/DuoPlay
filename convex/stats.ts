import { v } from "convex/values";
import { query } from "./_generated/server";
import { assertAdmin } from "./lib/admin";

/** Statistiques du tableau de bord (cf. PRD §6). */
export const overview = query({
  args: { adminKey: v.string() },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);

    const [
      categories,
      experiences,
      questions,
      sessions,
      reports,
      analytics,
    ] = await Promise.all([
      ctx.db.query("categories").collect(),
      ctx.db.query("experiences").collect(),
      ctx.db.query("questions").collect(),
      ctx.db.query("sessions").collect(),
      ctx.db.query("reports").collect(),
      ctx.db.query("analyticsEvents").collect(),
    ]);

    const count = (name: string) =>
      analytics.filter((event) => event.name === name).length;

    return {
      categories: {
        total: categories.length,
        published: categories.filter((c) => c.status === "published").length,
      },
      experiences: {
        total: experiences.length,
        published: experiences.filter((e) => e.status === "published").length,
      },
      questions: {
        total: questions.length,
        published: questions.filter((q) => q.status === "published").length,
      },
      sessions: {
        total: sessions.length,
        completed: sessions.filter((s) => s.status === "terminee").length,
      },
      reports: {
        total: reports.length,
        open: reports.filter((r) => r.status === "nouveau").length,
      },
      funnel: {
        landingView: count("landing_view"),
        sessionCreated: count("session_created"),
        inviteShared: count("invite_link_shared"),
        inviteOpened: count("invite_opened"),
        guestJoined: count("guest_joined"),
        gameStarted: count("game_started"),
        gameRevealed: count("game_revealed"),
        questionsAnswered: count("question_answered"),
        sessionsResumed: count("session_resumed"),
        gameCompleted: count("game_completed"),
        accountsCreated: count("account_created"),
      },
      accounts: await ctx.db.query("accounts").collect().then((rows) => ({
        total: rows.length,
        notificationOptIn: rows.filter((row) => row.notificationsConsent).length,
        analyticsOptIn: rows.filter((row) => row.analyticsConsent).length,
      })),
    };
  },
});
