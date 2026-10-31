import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { coupleDeviceTokens } from "./couples";
import { logEvent } from "./lib/events";
import { dayKey, dayStart } from "./lib/dates";
import { cleanDeviceToken } from "./lib/identity";

/**
 * Calendrier des moments à deux (§4) : proposer un rendez-vous, une activité,
 * un anniversaire ou une surprise, puis le retrouver — à deux. Comme le
 * journal, l'agenda est partagé avec l'appareil partenaire relié et **jamais**
 * avec un tiers. Aucune donnée de jeu n'y transite.
 */

const MAX_TITLE = 90;
const MAX_NOTE = 500;
const WAT_OFFSET_MS = 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

const KIND_LABEL: Record<Doc<"events">["kind"], string> = {
  "rendez-vous": "Rendez-vous",
  anniversaire: "Anniversaire",
  activite: "Activité",
  surprise: "Surprise",
};

const KIND_EMOJI: Record<Doc<"events">["kind"], string> = {
  "rendez-vous": "🍷",
  anniversaire: "🎂",
  activite: "✨",
  surprise: "🎁",
};

/** Étiquette relative honnête, calculée sur des journées locales (WAT). */
function relativeLabel(eventKey: string, nowKey: string): string {
  const diff = Math.round(
    (Date.parse(`${eventKey}T00:00:00.000Z`) -
      Date.parse(`${nowKey}T00:00:00.000Z`)) /
      DAY_MS,
  );
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return "Demain";
  if (diff === 2) return "Après-demain";
  if (diff > 0 && diff <= 7) return `Dans ${diff} jours`;
  if (diff === -1) return "Hier";
  if (diff < 0) return `Il y a ${-diff} jours`;
  return "";
}

function timeLabel(startAt: number): string {
  return new Date(startAt + WAT_OFFSET_MS).toISOString().slice(11, 16);
}

/** Instant prévu à partir d'un jour local (`YYYY-MM-DD`) et d'une heure. */
function instantFrom(day: string, time: string | undefined): number {
  const base = dayStart(day);
  if (!Number.isFinite(base)) throw new Error("Date invalide.");
  if (!time) return base;
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match) throw new Error("Heure invalide.");
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) throw new Error("Heure invalide.");
  return base + (hours * 60 + minutes) * 60 * 1000;
}

async function present(ctx: QueryCtx, event: Doc<"events">, deviceToken: string) {
  const experience = event.experienceId
    ? await ctx.db.get(event.experienceId)
    : null;
  const eventKey = dayKey(event.startAt);
  const nowKey = dayKey();
  return {
    id: event._id,
    title: event.title,
    kind: event.kind,
    kindLabel: KIND_LABEL[event.kind],
    emoji: KIND_EMOJI[event.kind],
    note: event.note ?? null,
    startAt: event.startAt,
    dayKey: eventKey,
    timeLabel: event.allDay ? null : timeLabel(event.startAt),
    allDay: Boolean(event.allDay),
    relative: relativeLabel(eventKey, nowKey),
    status: event.status,
    authorName: event.authorName ?? null,
    mine: event.deviceToken === deviceToken,
    experience: experience
      ? { slug: experience.slug, title: experience.title }
      : null,
  };
}

type Prez = Awaited<ReturnType<typeof present>>;

/** Agenda partagé du couple : prochain moment, à venir, et moments passés. */
export const agenda = query({
  args: { deviceToken: v.string(), pastLimit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const tokens = await coupleDeviceTokens(ctx, deviceToken);
    const pastLimit = Math.min(Math.max(args.pastLimit ?? 6, 1), 30);

    const collected: Doc<"events">[] = [];
    for (const token of tokens) {
      const rows = await ctx.db
        .query("events")
        .withIndex("by_device_startAt", (q) => q.eq("deviceToken", token))
        .collect();
      collected.push(...rows);
    }

    const todayStart = dayStart(dayKey());
    const live = collected.filter((event) => !event.removedAt);
    const dedup = new Map<Id<"events">, Doc<"events">>();
    for (const event of live) dedup.set(event._id, event);
    const all = [...dedup.values()];

    const upcomingDocs = all
      .filter((event) => event.status === "prevu" && event.startAt >= todayStart)
      .sort((a, b) => a.startAt - b.startAt);
    const pastDocs = all
      .filter((event) => !(event.status === "prevu" && event.startAt >= todayStart))
      .sort((a, b) => b.startAt - a.startAt);

    const upcoming: Prez[] = [];
    for (const event of upcomingDocs) {
      upcoming.push(await present(ctx, event, deviceToken));
    }
    const past: Prez[] = [];
    for (const event of pastDocs.slice(0, pastLimit)) {
      past.push(await present(ctx, event, deviceToken));
    }

    return {
      next: upcoming[0] ?? null,
      upcoming: upcoming.slice(1),
      past,
      counts: {
        upcoming: upcomingDocs.length,
        done: all.filter((event) => event.status === "fait").length,
        total: all.length,
      },
    };
  },
});

/** Propose un moment — visible des deux dès qu'un partenaire est relié. */
export const create = mutation({
  args: {
    deviceToken: v.string(),
    authorName: v.optional(v.string()),
    title: v.string(),
    kind: v.union(
      v.literal("rendez-vous"),
      v.literal("anniversaire"),
      v.literal("activite"),
      v.literal("surprise"),
    ),
    day: v.string(),
    time: v.optional(v.string()),
    note: v.optional(v.string()),
    experienceId: v.optional(v.id("experiences")),
  },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const title = args.title.trim().slice(0, MAX_TITLE);
    if (!title) throw new Error("Donnez un nom à ce moment.");

    const startAt = instantFrom(args.day, args.time);
    if (startAt < Date.now() - 365 * DAY_MS) {
      throw new Error("Cette date est trop ancienne.");
    }

    const now = Date.now();
    const id = await ctx.db.insert("events", {
      deviceToken,
      authorName: args.authorName?.trim().slice(0, 40) || undefined,
      title,
      kind: args.kind,
      note: args.note?.trim().slice(0, MAX_NOTE) || undefined,
      experienceId: args.experienceId,
      startAt,
      allDay: !args.time,
      status: "prevu",
      createdAt: now,
      updatedAt: now,
    });

    await logEvent(ctx, "event_created", now, { props: { kind: args.kind } });
    return { id };
  },
});

/** Modifie un moment (titre, genre, date, note) — les deux peuvent y toucher. */
export const update = mutation({
  args: {
    deviceToken: v.string(),
    eventId: v.id("events"),
    title: v.optional(v.string()),
    kind: v.optional(
      v.union(
        v.literal("rendez-vous"),
        v.literal("anniversaire"),
        v.literal("activite"),
        v.literal("surprise"),
      ),
    ),
    day: v.optional(v.string()),
    time: v.optional(v.string()),
    clearTime: v.optional(v.boolean()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const event = await ctx.db.get(args.eventId);
    if (!event || event.removedAt) throw new Error("Moment introuvable.");
    if (
      !(await coupleDeviceTokens(ctx, deviceToken)).includes(event.deviceToken)
    ) {
      throw new Error("Ce moment appartient à un autre espace.");
    }

    const patch: Partial<Doc<"events">> = { updatedAt: Date.now() };

    if (args.title !== undefined) {
      const title = args.title.trim().slice(0, MAX_TITLE);
      if (!title) throw new Error("Donnez un nom à ce moment.");
      patch.title = title;
    }
    if (args.kind !== undefined) patch.kind = args.kind;
    if (args.note !== undefined) {
      patch.note = args.note.trim().slice(0, MAX_NOTE) || undefined;
    }
    if (args.day !== undefined) {
      const time = args.clearTime ? undefined : args.time;
      patch.startAt = instantFrom(args.day, time);
      patch.allDay = !time;
    }

    await ctx.db.patch(event._id, patch);
    return { ok: true };
  },
});

/** Marque un moment comme fait, annulé, ou le remet à venir. */
export const setStatus = mutation({
  args: {
    deviceToken: v.string(),
    eventId: v.id("events"),
    status: v.union(
      v.literal("prevu"),
      v.literal("fait"),
      v.literal("annule"),
    ),
  },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const event = await ctx.db.get(args.eventId);
    if (!event || event.removedAt) throw new Error("Moment introuvable.");
    if (
      !(await coupleDeviceTokens(ctx, deviceToken)).includes(event.deviceToken)
    ) {
      throw new Error("Ce moment appartient à un autre espace.");
    }
    await ctx.db.patch(event._id, {
      status: args.status,
      updatedAt: Date.now(),
    });
    return { ok: true };
  },
});

/** Retire un moment du calendrier. */
export const remove = mutation({
  args: { deviceToken: v.string(), eventId: v.id("events") },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const event = await ctx.db.get(args.eventId);
    if (!event) return { ok: true };
    if (
      !(await coupleDeviceTokens(ctx, deviceToken)).includes(event.deviceToken)
    ) {
      throw new Error("Ce moment appartient à un autre espace.");
    }
    await ctx.db.patch(event._id, {
      removedAt: Date.now(),
      updatedAt: Date.now(),
    });
    return { ok: true };
  },
});
