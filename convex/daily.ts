import { v } from "convex/values";
import {
  internalMutation,
  mutation,
  query,
  type QueryCtx,
} from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { findCoupleForDevice } from "./couples";
import { assertAdmin } from "./lib/admin";
import { dayKey, dayKeyMinus, stableHash } from "./lib/dates";
import { cleanDeviceToken } from "./lib/identity";

/**
 * Défi du jour (§3.D, §11.6).
 *
 * Un contenu par jour, tiré de façon **déterministe** dans le catalogue publié
 * (aucun tirage aléatoire : deux appels le même jour donnent le même défi, et
 * le contenu est figé en base). Publication par cron quotidien, avec une
 * création à la demande en secours.
 *
 * Le même défi est présenté aux deux membres du couple — c'est ce qui rend le
 * dévoilement possible — mais **les questions déjà servies récemment sont
 * écartées** (§17, risque de répétition) : au catalogue de 51 questions, revoir
 * la même deux jours de suite donnait l'impression d'un contenu figé.
 */

/** Nombre de jours pendant lesquels une question ne peut pas resservir. */
const REPEAT_LOOKBACK_DAYS = 30;

async function ensureChallenge(
  ctx: MutationCtx,
  date: string,
): Promise<Id<"dailyChallenges">> {
  const existing = await ctx.db
    .query("dailyChallenges")
    .withIndex("by_date", (q) => q.eq("date", date))
    .unique();
  if (existing) return existing._id;

  const questions = (
    await ctx.db.query("questions").collect()
  ).filter((question) => question.status === "published");
  if (questions.length === 0) {
    throw new Error("Aucun contenu publié pour le défi du jour.");
  }

  const ordered = questions
    .slice()
    .sort((a, b) => (a._id < b._id ? -1 : 1));

  // Anti-répétition : on écarte les questions déjà posées dans les 30 derniers
  // jours. Si le catalogue est trop petit pour tenir le délai, on préfère un
  // défi répété à pas de défi du tout.
  const recent = await ctx.db.query("dailyChallenges").collect();
  const floor = dayKeyMinus(date, REPEAT_LOOKBACK_DAYS);
  const alreadyServed = new Set(
    recent
      .filter((row) => row.date >= floor && row.date < date && row.questionId)
      .map((row) => String(row.questionId)),
  );
  const fresh = ordered.filter(
    (question) => !alreadyServed.has(String(question._id)),
  );
  const candidates = fresh.length > 0 ? fresh : ordered;
  const chosen = candidates[stableHash(date) % candidates.length];

  const experience = await ctx.db.get(chosen.experienceId);
  const category = experience ? await ctx.db.get(experience.categoryId) : null;
  const isMission = chosen.kind === "challenge";

  return await ctx.db.insert("dailyChallenges", {
    date,
    kind: isMission ? "mission" : "question",
    title: isMission ? "Mission du jour" : "Question du jour",
    prompt: chosen.prompt,
    options: chosen.options,
    questionId: chosen._id,
    categorySlug: category?.slug,
    publishedAt: Date.now(),
  });
}

/**
 * Nombre de jours consécutifs où **tous** les appareils fournis ont participé,
 * en remontant depuis `date` (ou la veille si ce jour n'est pas encore complet).
 * Avec un seul appareil, on retrouve exactement la série individuelle.
 */
async function streakFor(
  ctx: QueryCtx,
  deviceTokens: string[],
  date: string,
): Promise<number> {
  if (deviceTokens.length === 0) return 0;

  const byDate = new Map<string, Set<string>>();
  for (const token of deviceTokens) {
    const rows = await ctx.db
      .query("challengeCompletions")
      .withIndex("by_device", (q) => q.eq("deviceToken", token))
      .collect();
    for (const row of rows) {
      const challenge = await ctx.db.get(row.challengeId);
      if (!challenge) continue;
      const set = byDate.get(challenge.date) ?? new Set<string>();
      set.add(token);
      byDate.set(challenge.date, set);
    }
  }

  const required = deviceTokens.length;
  let cursor =
    (byDate.get(date)?.size ?? 0) >= required ? date : dayKeyMinus(date, 1);
  let count = 0;
  while ((byDate.get(cursor)?.size ?? 0) >= required) {
    count += 1;
    cursor = dayKeyMinus(cursor, 1);
  }
  return count;
}

/** Crée le défi du jour s'il n'existe pas (appelé par le serveur et le cron). */
export const ensureToday = mutation({
  args: {},
  handler: async (ctx) => {
    const date = dayKey();
    const challengeId = await ensureChallenge(ctx, date);
    return { date, challengeId };
  },
});

export const ensureTodayInternal = internalMutation({
  args: {},
  handler: async (ctx) => {
    const date = dayKey();
    await ensureChallenge(ctx, date);
  },
});

export const today = query({
  args: { deviceToken: v.string() },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const date = dayKey();

    const challenge = await ctx.db
      .query("dailyChallenges")
      .withIndex("by_date", (q) => q.eq("date", date))
      .unique();
    if (!challenge) return null;

    const mine = await ctx.db
      .query("challengeCompletions")
      .withIndex("by_challenge_device", (q) =>
        q.eq("challengeId", challenge._id).eq("deviceToken", deviceToken),
      )
      .unique();

    const couple = await findCoupleForDevice(ctx, deviceToken);
    const iAmA = couple ? couple.deviceA === deviceToken : true;
    const partnerDevice = couple
      ? iAmA
        ? couple.deviceB
        : couple.deviceA
      : undefined;
    const partnerName = couple
      ? ((iAmA ? couple.nameB : couple.nameA) ?? null)
      : null;

    let partner:
      | { name: string | null; value: string | null; skipped: boolean; doneAt: number }
      | null = null;

    if (partnerDevice) {
      const theirs = await ctx.db
        .query("challengeCompletions")
        .withIndex("by_challenge_device", (q) =>
          q.eq("challengeId", challenge._id).eq("deviceToken", partnerDevice),
        )
        .unique();
      if (theirs) {
        partner = {
          name: partnerName,
          value: theirs.value ?? null,
          skipped: theirs.skipped,
          doneAt: theirs.doneAt,
        };
      }
    }

    const completions = await ctx.db
      .query("challengeCompletions")
      .withIndex("by_device", (q) => q.eq("deviceToken", deviceToken))
      .collect();

    const doneDates = new Set<string>();
    for (const completion of completions) {
      const row = await ctx.db.get(completion.challengeId);
      if (row) doneDates.add(row.date);
    }

    let streakDays = 0;
    let cursor = doneDates.has(date) ? date : dayKeyMinus(date, 1);
    while (doneDates.has(cursor)) {
      streakDays += 1;
      cursor = dayKeyMinus(cursor, 1);
    }

    // Série **à deux** : des jours où le couple a participé ensemble. C'est la
    // série affichée dès qu'un partenaire est relié — plus fédératrice que la
    // série solitaire, et calculable sans requête supplémentaire côté client.
    const paired = Boolean(couple && couple.deviceB && partnerDevice);
    let coupleStreakDays = 0;
    if (couple && couple.deviceB && partnerDevice) {
      coupleStreakDays = await streakFor(
        ctx,
        [...new Set([couple.deviceA, couple.deviceB])],
        date,
      );
    }

    return {
      date,
      challenge: {
        _id: challenge._id,
        kind: challenge.kind,
        title: challenge.title,
        prompt: challenge.prompt,
        options: challenge.options ?? null,
        categorySlug: challenge.categorySlug ?? null,
      },
      mine: mine
        ? { value: mine.value ?? null, skipped: mine.skipped, doneAt: mine.doneAt }
        : null,
      partner,
      partnerName,
      streakDays,
      coupleStreakDays,
      streakScope: paired ? ("couple" as const) : ("solo" as const),
      totalDone: completions.length,
    };
  },
});

export const complete = mutation({
  args: {
    deviceToken: v.string(),
    value: v.string(),
    skipped: v.boolean(),
  },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const date = dayKey();
    const challengeId = await ensureChallenge(ctx, date);

    const value = args.skipped ? "" : args.value.trim().slice(0, 600);
    if (!args.skipped && value.length === 0) {
      throw new Error("Votre réponse est vide.");
    }

    const couple = await findCoupleForDevice(ctx, deviceToken);
    const now = Date.now();

    const existing = await ctx.db
      .query("challengeCompletions")
      .withIndex("by_challenge_device", (q) =>
        q.eq("challengeId", challengeId).eq("deviceToken", deviceToken),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        value,
        skipped: args.skipped,
        doneAt: now,
        coupleId: couple?._id,
      });
    } else {
      await ctx.db.insert("challengeCompletions", {
        challengeId,
        deviceToken,
        coupleId: couple?._id,
        value,
        skipped: args.skipped,
        doneAt: now,
      });
    }

    if (couple) {
      await ctx.db.patch(couple._id, { lastActivityAt: now });
    }

    await ctx.db.insert("analyticsEvents", {
      name: args.skipped ? "daily_challenge_skipped" : "daily_challenge_done",
      coupleId: couple?._id,
      props: { date },
      at: now,
    });

    return { ok: true };
  },
});

export const history = query({
  args: { deviceToken: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const limit = Math.min(Math.max(args.limit ?? 20, 1), 60);

    const completions = await ctx.db
      .query("challengeCompletions")
      .withIndex("by_device", (q) => q.eq("deviceToken", deviceToken))
      .collect();

    const rows = await Promise.all(
      completions
        .sort((a, b) => b.doneAt - a.doneAt)
        .slice(0, limit)
        .map(async (completion) => {
          const challenge = await ctx.db.get(completion.challengeId);
          if (!challenge) return null;
          return {
            date: challenge.date,
            kind: challenge.kind,
            title: challenge.title,
            prompt: challenge.prompt,
            value: completion.value ?? null,
            skipped: completion.skipped,
            doneAt: completion.doneAt,
          };
        }),
    );

    return rows.filter((row): row is NonNullable<typeof row> => row !== null);
  },
});

/**
 * Outil d'exploitation et de test : génère le défi d'une date donnée avec une
 * horloge injectée, et renvoie ce qui a été choisi. Sert à démontrer
 * l'anti-répétition (deux jours consécutifs ne peuvent pas servir la même
 * question) sans attendre. Réservé à la clé serveur.
 */
export const ensureForOps = mutation({
  args: { adminKey: v.string(), now: v.number() },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const date = dayKey(args.now);
    const challengeId = await ensureChallenge(ctx, date);
    const row = await ctx.db.get(challengeId);
    return {
      date,
      prompt: row?.prompt ?? null,
      questionId: row?.questionId ? String(row.questionId) : null,
      categorySlug: row?.categorySlug ?? null,
    };
  },
});

/**
 * Outil d'exploitation et de test : efface le défi d'une date donnée (et les
 * participations associées) pour le régénérer à volonté. Réservé à la clé
 * serveur — jamais appelé par l'application.
 */
export const resetForOps = mutation({
  args: { adminKey: v.string(), now: v.number() },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const date = dayKey(args.now);
    const challenge = await ctx.db
      .query("dailyChallenges")
      .withIndex("by_date", (q) => q.eq("date", date))
      .unique();
    if (!challenge) return { ok: true, removed: false, completions: 0 };

    const completions = await ctx.db
      .query("challengeCompletions")
      .withIndex("by_challenge_device", (q) =>
        q.eq("challengeId", challenge._id),
      )
      .collect();
    for (const completion of completions) {
      await ctx.db.delete(completion._id);
    }
    await ctx.db.delete(challenge._id);
    return {
      ok: true,
      removed: true,
      completions: completions.length,
    };
  },
});
