import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { findCoupleForDevice } from "./couples";
import { recordJourneyMoment } from "./journal";
import { assertAdmin } from "./lib/admin";
import { logEvent } from "./lib/events";
import { cleanDeviceToken, optionalDeviceToken } from "./lib/identity";

/**
 * Parcours guidés (cf. docs/PRD.md §3.E, §11.7, §22 phase 4).
 *
 * Un parcours est une suite d'étapes, une par jour : soit une **expérience**
 * à lancer (la partie est reliée à l'étape et la termine), soit une
 * **mission** à faire dans la vie réelle. Objectif : supprimer la paralysie
 * du choix.
 *
 * La progression est **celle du couple** : chaque appareil garde sa trace,
 * mais la lecture additionne les jours faits de part et d'autre (cf. §10,
 * `journeyProgress.coupleId`). Aucune étape n'est verrouillée, rien n'est
 * imposé.
 */

const status = v.union(
  v.literal("draft"),
  v.literal("published"),
  v.literal("archived"),
);

type JourneyDoc = Doc<"journeys">;
type ProgressDoc = Doc<"journeyProgress">;

/** Progression consolidée d'un couple pour un parcours. */
type ProgressView = {
  completedDays: number[];
  startedAt: number;
  lastActivityAt: number;
  completedAt: number | null;
  recapSeenAt: number | null;
};

/* ------------------------------------------------------------------ */
/* Utilitaires                                                         */
/* ------------------------------------------------------------------ */

async function findJourneyBySlug(ctx: QueryCtx | MutationCtx, slug: string) {
  return await ctx.db
    .query("journeys")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();
}

async function stepsOf(ctx: QueryCtx | MutationCtx, journeyId: Id<"journeys">) {
  const rows = await ctx.db
    .query("journeySteps")
    .withIndex("by_journey", (q) => q.eq("journeyId", journeyId))
    .collect();
  return rows.sort((a, b) => a.dayIndex - b.dayIndex);
}

/** Tous les appareils qui partagent cette progression (soi + partenaire). */
async function coupleDevices(
  ctx: QueryCtx | MutationCtx,
  deviceToken: string,
): Promise<string[]> {
  const devices = new Set<string>([deviceToken]);
  const couple = await findCoupleForDevice(ctx, deviceToken);
  if (couple) {
    devices.add(couple.deviceA);
    if (couple.deviceB) devices.add(couple.deviceB);
  }
  return [...devices];
}

async function progressRows(
  ctx: QueryCtx | MutationCtx,
  deviceToken: string,
  journeyId: Id<"journeys">,
): Promise<ProgressDoc[]> {
  const devices = await coupleDevices(ctx, deviceToken);
  const rows: ProgressDoc[] = [];

  for (const device of devices) {
    const row = await ctx.db
      .query("journeyProgress")
      .withIndex("by_device_journey", (q) =>
        q.eq("deviceToken", device).eq("journeyId", journeyId),
      )
      .unique();
    if (row) rows.push(row);
  }

  return rows;
}

/** Fusionne les traces du couple : jour fait par l'un = jour fait pour les deux. */
function mergeProgress(
  rows: ProgressDoc[],
  journey: JourneyDoc,
): ProgressView | null {
  if (rows.length === 0) return null;

  const days = new Set<number>();
  for (const row of rows) {
    for (const day of row.completedDays) {
      if (day >= 1 && day <= journey.lengthDays) days.add(day);
    }
  }

  const numbers = (values: Array<number | undefined>) =>
    values.filter((value): value is number => typeof value === "number");

  const completed = numbers(rows.map((row) => row.completedAt)).sort(
    (a, b) => a - b,
  );
  const seen = numbers(rows.map((row) => row.recapSeenAt)).sort((a, b) => a - b);

  return {
    completedDays: [...days].sort((a, b) => a - b),
    startedAt: Math.min(...rows.map((row) => row.startedAt)),
    lastActivityAt: Math.max(...rows.map((row) => row.lastActivityAt)),
    completedAt: completed[0] ?? null,
    recapSeenAt: seen[0] ?? null,
  };
}

async function resolveProgress(
  ctx: QueryCtx | MutationCtx,
  deviceToken: string | undefined,
  journeyId: Id<"journeys">,
): Promise<{ view: ProgressView | null; rows: ProgressDoc[] }> {
  if (!deviceToken) return { view: null, rows: [] };
  const journey = await ctx.db.get(journeyId);
  if (!journey) return { view: null, rows: [] };
  const rows = await progressRows(ctx, deviceToken, journeyId);
  return { view: mergeProgress(rows, journey), rows };
}

/** Premier jour non terminé (1-indexé), ou `null` quand tout est fait. */
function currentDay(
  completedDays: number[],
  lengthDays: number,
): number | null {
  for (let day = 1; day <= lengthDays; day += 1) {
    if (!completedDays.includes(day)) return day;
  }
  return null;
}

/** Résumé de progression, identique partout dans l'interface. */
function summarize(journey: JourneyDoc, view: ProgressView | null) {
  const total = journey.lengthDays;
  const completedCount = view?.completedDays.length ?? 0;

  return {
    totalDays: total,
    completedCount,
    completed: Boolean(view?.completedAt) || (total > 0 && completedCount >= total),
    currentDay: currentDay(view?.completedDays ?? [], total),
    startedAt: view?.startedAt ?? null,
    completedAt: view?.completedAt ?? null,
    recapSeen: Boolean(view?.recapSeenAt),
  };
}

/* ------------------------------------------------------------------ */
/* Lecture publique                                                    */
/* ------------------------------------------------------------------ */

/** Catalogue des parcours publiés, avec la progression du couple. */
export const list = query({
  args: { deviceToken: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const deviceToken = optionalDeviceToken(args.deviceToken);

    const journeys = (await ctx.db.query("journeys").collect())
      .filter((journey) => journey.status === "published")
      .sort((a, b) => a.order - b.order);

    return await Promise.all(
      journeys.map(async (journey) => {
        const steps = await stepsOf(ctx, journey._id);
        const { view } = await resolveProgress(ctx, deviceToken, journey._id);

        return {
          _id: journey._id,
          slug: journey.slug,
          title: journey.title,
          tagline: journey.tagline,
          description: journey.description,
          emoji: journey.emoji,
          lengthDays: journey.lengthDays,
          stepCount: steps.length,
          preview: steps.slice(0, 3).map((step) => step.title),
          progress: summarize(journey, view),
        };
      }),
    );
  },
});

/** Un parcours publié : ses étapes détaillées et la progression. */
export const bySlug = query({
  args: { slug: v.string(), deviceToken: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const journey = await findJourneyBySlug(ctx, args.slug);
    if (!journey || journey.status !== "published") return null;

    const deviceToken = optionalDeviceToken(args.deviceToken);
    const steps = await stepsOf(ctx, journey._id);
    const { view } = await resolveProgress(ctx, deviceToken, journey._id);
    const completedDays = view?.completedDays ?? [];

    const detailed = await Promise.all(
      steps.map(async (step) => {
        const experience = step.experienceId
          ? await ctx.db.get(step.experienceId)
          : null;
        const category = experience
          ? await ctx.db.get(experience.categoryId)
          : null;

        return {
          _id: step._id,
          dayIndex: step.dayIndex,
          title: step.title,
          prompt: step.prompt ?? null,
          mission: step.mission ?? null,
          done: completedDays.includes(step.dayIndex),
          experience: experience
            ? {
                _id: experience._id,
                slug: experience.slug,
                title: experience.title,
                description: experience.description,
                estimatedMinutes: experience.estimatedMinutes,
                modes: experience.modes,
                categoryEmoji: category?.emoji ?? null,
              }
            : null,
        };
      }),
    );

    return {
      journey: {
        _id: journey._id,
        slug: journey.slug,
        title: journey.title,
        tagline: journey.tagline,
        description: journey.description,
        emoji: journey.emoji,
        lengthDays: journey.lengthDays,
      },
      steps: detailed,
      progress: summarize(journey, view),
    };
  },
});

/** Parcours suivis par le couple : en cours et terminés. */
export const mine = query({
  args: { deviceToken: v.string() },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const devices = await coupleDevices(ctx, deviceToken);

    const rows: ProgressDoc[] = [];
    for (const device of devices) {
      rows.push(
        ...(await ctx.db
          .query("journeyProgress")
          .withIndex("by_device", (q) => q.eq("deviceToken", device))
          .collect()),
      );
    }

    const grouped = new Map<Id<"journeys">, ProgressDoc[]>();
    for (const row of rows) {
      const group = grouped.get(row.journeyId) ?? [];
      group.push(row);
      grouped.set(row.journeyId, group);
    }

    const items = await Promise.all(
      [...grouped.entries()].map(async ([journeyId, group]) => {
        const journey = await ctx.db.get(journeyId);
        if (!journey) return null;

        const view = mergeProgress(group, journey);
        if (!view) return null;

        const progress = summarize(journey, view);
        const steps = await stepsOf(ctx, journey._id);
        const next =
          progress.currentDay === null
            ? null
            : (steps.find((step) => step.dayIndex === progress.currentDay) ??
              null);

        return {
          journeyId: journey._id,
          slug: journey.slug,
          title: journey.title,
          tagline: journey.tagline,
          emoji: journey.emoji,
          lengthDays: journey.lengthDays,
          progress,
          nextStepTitle: next?.title ?? null,
          updatedAt: view.lastActivityAt,
        };
      }),
    );

    const valid = items
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => b.updatedAt - a.updatedAt);

    return {
      active: valid.filter((item) => !item.progress.completed),
      completed: valid.filter((item) => item.progress.completed),
    };
  },
});

/** Récapitulatif final d'un parcours (cf. PRD §11.7). */
export const recap = query({
  args: { deviceToken: v.string(), slug: v.string() },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const journey = await findJourneyBySlug(ctx, args.slug);
    if (!journey) return null;

    const steps = await stepsOf(ctx, journey._id);
    const { view } = await resolveProgress(ctx, deviceToken, journey._id);
    const completedDays = view?.completedDays ?? [];

    const couple = await findCoupleForDevice(ctx, deviceToken);
    const partnerName = couple
      ? ((couple.deviceA === deviceToken ? couple.nameB : couple.nameA) ?? null)
      : null;

    const detailed = await Promise.all(
      steps.map(async (step) => {
        const experience = step.experienceId
          ? await ctx.db.get(step.experienceId)
          : null;
        return {
          dayIndex: step.dayIndex,
          title: step.title,
          mission: step.mission ?? null,
          experienceTitle: experience?.title ?? null,
          experienceSlug: experience?.slug ?? null,
          done: completedDays.includes(step.dayIndex),
        };
      }),
    );

    const done = detailed.filter((step) => step.done);

    return {
      journey: {
        slug: journey.slug,
        title: journey.title,
        tagline: journey.tagline,
        emoji: journey.emoji,
        lengthDays: journey.lengthDays,
      },
      steps: detailed,
      progress: summarize(journey, view),
      partnerName,
      stats: {
        days: done.length,
        experiences: done.filter((step) => step.experienceTitle).length,
        missions: done.filter((step) => step.mission).length,
      },
      startedAt: view?.startedAt ?? null,
      completedAt: view?.completedAt ?? null,
    };
  },
});

/* ------------------------------------------------------------------ */
/* Progression                                                         */
/* ------------------------------------------------------------------ */

/**
 * Marque un jour comme terminé (idempotent), pour cet appareil.
 * Utilisé par l'interface **et** par la fin d'une partie issue d'une étape.
 */
export async function completeJourneyDay(
  ctx: MutationCtx,
  input: { deviceToken: string; journeyId: Id<"journeys">; dayIndex: number },
): Promise<boolean> {
  const { deviceToken, journeyId, dayIndex } = input;

  const journey = await ctx.db.get(journeyId);
  if (!journey) return false;
  if (dayIndex < 1 || dayIndex > journey.lengthDays) return false;

  const now = Date.now();
  const couple = await findCoupleForDevice(ctx, deviceToken);
  const rows = await progressRows(ctx, deviceToken, journeyId);
  const before = mergeProgress(rows, journey);

  if (before?.completedDays.includes(dayIndex)) return false;

  const mine = rows.find((row) => row.deviceToken === deviceToken);

  if (mine) {
    await ctx.db.patch(mine._id, {
      completedDays: [...new Set([...mine.completedDays, dayIndex])].sort(
        (a, b) => a - b,
      ),
      coupleId: couple?._id,
      lastActivityAt: now,
    });
  } else {
    await ctx.db.insert("journeyProgress", {
      journeyId,
      deviceToken,
      coupleId: couple?._id,
      completedDays: [dayIndex],
      startedAt: now,
      lastActivityAt: now,
    });
  }

  await logEvent(ctx, "journey_step_done", now, {
    coupleId: couple?._id,
    props: { journeySlug: journey.slug, dayIndex },
  });

  const after = mergeProgress(
    await progressRows(ctx, deviceToken, journeyId),
    journey,
  );
  const allDone =
    (after?.completedDays.length ?? 0) >= journey.lengthDays &&
    journey.lengthDays > 0;

  if (allDone && !before?.completedAt) {
    const target = (await progressRows(ctx, deviceToken, journeyId)).find(
      (row) => row.deviceToken === deviceToken,
    );
    if (target) await ctx.db.patch(target._id, { completedAt: now });
    await recordJourneyMoment(ctx, {
      journeyId,
      deviceToken,
      occurredAt: now,
    });
    await logEvent(ctx, "journey_completed", now, {
      coupleId: couple?._id,
      props: { journeySlug: journey.slug, lengthDays: journey.lengthDays },
    });
  }

  return true;
}

/** Démarre (ou rejoint) un parcours. */
export const start = mutation({
  args: { deviceToken: v.string(), slug: v.string() },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const journey = await findJourneyBySlug(ctx, args.slug);
    if (!journey || journey.status !== "published") {
      throw new Error("Ce parcours n'est pas disponible.");
    }

    const now = Date.now();
    const couple = await findCoupleForDevice(ctx, deviceToken);
    const { view, rows } = await resolveProgress(
      ctx,
      deviceToken,
      journey._id,
    );

    // Le partenaire a peut-être déjà commencé : la progression est commune.
    if (view) {
      await ctx.db.patch(rows[0]._id, {
        coupleId: couple?._id,
        lastActivityAt: now,
      });
      return { journeyId: journey._id, started: false };
    }

    await ctx.db.insert("journeyProgress", {
      journeyId: journey._id,
      deviceToken,
      coupleId: couple?._id,
      completedDays: [],
      startedAt: now,
      lastActivityAt: now,
    });

    await logEvent(ctx, "journey_started", now, {
      coupleId: couple?._id,
      props: { journeySlug: journey.slug, lengthDays: journey.lengthDays },
    });

    return { journeyId: journey._id, started: true };
  },
});

/** Marque une étape comme faite (mission faite, ou partie jouée ailleurs). */
export const completeStep = mutation({
  args: { deviceToken: v.string(), slug: v.string(), dayIndex: v.number() },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const journey = await findJourneyBySlug(ctx, args.slug);
    if (!journey) throw new Error("Ce parcours est introuvable.");

    await completeJourneyDay(ctx, {
      deviceToken,
      journeyId: journey._id,
      dayIndex: Math.round(args.dayIndex),
    });

    const { view } = await resolveProgress(ctx, deviceToken, journey._id);
    return summarize(journey, view);
  },
});

/** Marque le récapitulatif comme consulté (§19 : ne pas le remettre en avant). */
export const markRecapSeen = mutation({
  args: { deviceToken: v.string(), slug: v.string() },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const journey = await findJourneyBySlug(ctx, args.slug);
    if (!journey) return;

    const rows = await progressRows(ctx, deviceToken, journey._id);
    const now = Date.now();
    for (const row of rows) {
      if (!row.recapSeenAt) await ctx.db.patch(row._id, { recapSeenAt: now });
    }
  },
});

/* ------------------------------------------------------------------ */
/* Administration                                                      */
/* ------------------------------------------------------------------ */

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const journeys = (await ctx.db.query("journeys").collect()).sort(
      (a, b) => a.order - b.order,
    );

    return await Promise.all(
      journeys.map(async (journey) => {
        const steps = await stepsOf(ctx, journey._id);
        const rows = await ctx.db
          .query("journeyProgress")
          .withIndex("by_journey", (q) => q.eq("journeyId", journey._id))
          .collect();

        return {
          ...journey,
          stepCount: steps.length,
          followers: rows.length,
          completions: rows.filter((row) => row.completedAt).length,
        };
      }),
    );
  },
});

export const adminSteps = query({
  args: { journeyId: v.id("journeys") },
  handler: async (ctx, args) => {
    const steps = await stepsOf(ctx, args.journeyId);
    return await Promise.all(
      steps.map(async (step) => {
        const experience = step.experienceId
          ? await ctx.db.get(step.experienceId)
          : null;
        return {
          ...step,
          experienceTitle: experience?.title ?? null,
          experienceSlug: experience?.slug ?? null,
        };
      }),
    );
  },
});

export const adminUpsert = mutation({
  args: {
    adminKey: v.string(),
    id: v.optional(v.id("journeys")),
    slug: v.string(),
    title: v.string(),
    tagline: v.string(),
    description: v.string(),
    emoji: v.string(),
    lengthDays: v.number(),
    order: v.number(),
    status,
  },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const { adminKey: _adminKey, id, ...rest } = args;
    const data = {
      ...rest,
      lengthDays: Math.min(Math.max(Math.round(rest.lengthDays), 1), 21),
      updatedAt: Date.now(),
    };

    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }

    const existing = await findJourneyBySlug(ctx, args.slug);
    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    }

    return await ctx.db.insert("journeys", { ...data, createdAt: Date.now() });
  },
});

export const adminSetStatus = mutation({
  args: { adminKey: v.string(), id: v.id("journeys"), status },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    await ctx.db.patch(args.id, { status: args.status, updatedAt: Date.now() });
  },
});

export const adminRemove = mutation({
  args: { adminKey: v.string(), id: v.id("journeys") },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);

    const steps = await stepsOf(ctx, args.id);
    for (const step of steps) await ctx.db.delete(step._id);

    const rows = await ctx.db
      .query("journeyProgress")
      .withIndex("by_journey", (q) => q.eq("journeyId", args.id))
      .collect();
    for (const row of rows) await ctx.db.delete(row._id);

    await ctx.db.delete(args.id);
  },
});

export const adminUpsertStep = mutation({
  args: {
    adminKey: v.string(),
    id: v.optional(v.id("journeySteps")),
    journeyId: v.id("journeys"),
    dayIndex: v.number(),
    title: v.string(),
    prompt: v.optional(v.string()),
    experienceId: v.optional(v.id("experiences")),
    mission: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const { adminKey: _adminKey, id, ...rest } = args;
    const data = {
      ...rest,
      dayIndex: Math.max(Math.round(rest.dayIndex), 1),
      prompt: rest.prompt?.trim() || undefined,
      mission: rest.mission?.trim() || undefined,
    };

    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }

    const existing = (await stepsOf(ctx, args.journeyId)).find(
      (step) => step.dayIndex === data.dayIndex,
    );
    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    }

    return await ctx.db.insert("journeySteps", data);
  },
});

export const adminRemoveStep = mutation({
  args: { adminKey: v.string(), id: v.id("journeySteps") },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    await ctx.db.delete(args.id);
  },
});
