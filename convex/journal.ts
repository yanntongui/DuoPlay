import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { coupleDeviceTokens, findCoupleForDevice } from "./couples";
import { logEvent } from "./lib/events";
import { cleanDeviceToken } from "./lib/identity";

/**
 * Journal du couple (§4) — souvenirs conservés à deux.
 *
 * Deux origines : les **moments** créés automatiquement à la fin d'une partie
 * ou d'un parcours (jamais deux fois la même), et les **notes** libres écrites
 * par l'un des deux, éventuellement illustrées d'une photo. L'espace est
 * partagé avec le partenaire relié ; aucune réponse de jeu n'y est exposée.
 */

const MAX_TITLE = 120;
const MAX_NOTE = 2000;
const MAX_MEDIA_BYTES = 6 * 1024 * 1024; // 6 Mo
const FEED_LIMIT_DEFAULT = 40;
const FEED_LIMIT_MAX = 100;

type Media = { mediaId: Id<"_storage">; mediaType: string };

/** Vérifie une image téléversée : type et poids, côté serveur. */
async function validateMedia(
  ctx: MutationCtx,
  mediaId: Id<"_storage"> | undefined,
): Promise<Media | null> {
  if (!mediaId) return null;
  const meta = await ctx.db.system.get("_storage", mediaId);
  if (!meta) throw new Error("Image introuvable.");
  if (!meta.contentType || !meta.contentType.startsWith("image/")) {
    throw new Error("Seules les images sont acceptées.");
  }
  if (meta.size > MAX_MEDIA_BYTES) {
    throw new Error("Image trop lourde (6 Mo maximum).");
  }
  return { mediaId, mediaType: meta.contentType };
}

/**
 * Crée un « moment » de journal pour une partie terminée. Idempotent par
 * session : un balayage ou un rejeu ne crée jamais de doublon.
 */
export async function recordSessionMoment(
  ctx: MutationCtx,
  input: {
    sessionId: Id<"sessions">;
    experienceId: Id<"experiences">;
    journeyId?: Id<"journeys">;
    deviceToken: string;
    authorName?: string;
    occurredAt: number;
  },
): Promise<void> {
  const existing = await ctx.db
    .query("journalEntries")
    .withIndex("by_session", (q) => q.eq("sessionId", input.sessionId))
    .first();
  if (existing) return;

  const experience = await ctx.db.get(input.experienceId);
  await ctx.db.insert("journalEntries", {
    deviceToken: input.deviceToken,
    authorName: input.authorName,
    kind: "moment",
    source: input.journeyId ? "parcours" : "partie",
    title: experience?.title ?? "Un moment à deux",
    sessionId: input.sessionId,
    journeyId: input.journeyId,
    experienceId: input.experienceId,
    occurredAt: input.occurredAt,
    createdAt: input.occurredAt,
    updatedAt: input.occurredAt,
  });
}

/**
 * Crée un « moment » de journal pour un parcours terminé. Idempotent par
 * parcours : un seul souvenir par parcours accompli.
 */
export async function recordJourneyMoment(
  ctx: MutationCtx,
  input: {
    journeyId: Id<"journeys">;
    deviceToken: string;
    authorName?: string;
    occurredAt: number;
  },
): Promise<void> {
  const existing = await ctx.db
    .query("journalEntries")
    .withIndex("by_journey", (q) => q.eq("journeyId", input.journeyId))
    .first();
  if (existing) return;

  const journey = await ctx.db.get(input.journeyId);
  if (!journey) return;

  await ctx.db.insert("journalEntries", {
    deviceToken: input.deviceToken,
    authorName: input.authorName,
    kind: "moment",
    source: "parcours",
    title: journey.title,
    journeyId: input.journeyId,
    occurredAt: input.occurredAt,
    createdAt: input.occurredAt,
    updatedAt: input.occurredAt,
  });
}

/** Une entrée est modifiable par son auteur ; un moment partagé par les deux. */
function canEdit(entry: Doc<"journalEntries">, deviceToken: string): boolean {
  return entry.deviceToken === deviceToken || entry.kind === "moment";
}

/** Résout une entrée pour le client (image comprise), sans fuite d'identité. */
async function present(
  ctx: QueryCtx,
  entry: Doc<"journalEntries">,
  deviceToken: string,
) {
  const experience = entry.experienceId
    ? await ctx.db.get(entry.experienceId)
    : null;
  return {
    id: entry._id,
    kind: entry.kind,
    source: entry.source,
    title: entry.title,
    note: entry.note ?? null,
    authorName: entry.authorName ?? null,
    occurredAt: entry.occurredAt,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
    mediaUrl: entry.mediaId ? await ctx.storage.getUrl(entry.mediaId) : null,
    hasMedia: Boolean(entry.mediaId),
    experience: experience
      ? { slug: experience.slug, title: experience.title }
      : null,
    mine: entry.deviceToken === deviceToken,
    canEdit: canEdit(entry, deviceToken),
    canDelete: canEdit(entry, deviceToken),
  };
}

/** Journal partagé du couple (ou de l'appareil seul, avant la liaison). */
export const feed = query({
  args: { deviceToken: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const tokens = await coupleDeviceTokens(ctx, deviceToken);
    const limit = Math.min(
      Math.max(args.limit ?? FEED_LIMIT_DEFAULT, 1),
      FEED_LIMIT_MAX,
    );

    const collected: Doc<"journalEntries">[] = [];
    for (const token of tokens) {
      const rows = await ctx.db
        .query("journalEntries")
        .withIndex("by_device_occurredAt", (q) => q.eq("deviceToken", token))
        .order("desc")
        .collect();
      collected.push(...rows);
    }

    const kept = collected
      .filter((entry) => !entry.removedAt)
      .sort((a, b) => b.occurredAt - a.occurredAt);

    const items = await Promise.all(
      kept.slice(0, limit).map((entry) => present(ctx, entry, deviceToken)),
    );

    const couple = await findCoupleForDevice(ctx, deviceToken);
    const iAmA = couple?.deviceA === deviceToken;
    const partnerName = couple
      ? ((iAmA ? couple.nameB : couple.nameA) ?? null)
      : null;

    return {
      items,
      total: kept.length,
      partnerName,
      counts: {
        moments: kept.filter((entry) => entry.kind === "moment").length,
        notes: kept.filter((entry) => entry.kind === "note").length,
        photos: kept.filter((entry) => entry.mediaId).length,
      },
    };
  },
});

/** URL de téléversement éphémère pour une image (cf. Convex file storage). */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

/** Ajoute une note libre au journal, éventuellement illustrée. */
export const add = mutation({
  args: {
    deviceToken: v.string(),
    authorName: v.optional(v.string()),
    title: v.string(),
    note: v.optional(v.string()),
    mediaId: v.optional(v.id("_storage")),
    experienceId: v.optional(v.id("experiences")),
  },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const title = args.title.trim().slice(0, MAX_TITLE);
    if (!title) throw new Error("Un titre est nécessaire.");

    const note = args.note?.trim().slice(0, MAX_NOTE) || undefined;
    const media = await validateMedia(ctx, args.mediaId);
    const now = Date.now();

    const id = await ctx.db.insert("journalEntries", {
      deviceToken,
      authorName: args.authorName?.trim().slice(0, 40) || undefined,
      kind: "note",
      source: args.experienceId ? "favori" : "libre",
      title,
      note,
      experienceId: args.experienceId,
      mediaId: media?.mediaId,
      mediaType: media?.mediaType,
      occurredAt: now,
      createdAt: now,
      updatedAt: now,
    });

    await logEvent(ctx, "journal_entry_added", now, { props: { kind: "note" } });
    return { id };
  },
});

/** Modifie une note (titre, texte, image) — réservé à qui peut l'éditer. */
export const update = mutation({
  args: {
    deviceToken: v.string(),
    entryId: v.id("journalEntries"),
    title: v.optional(v.string()),
    note: v.optional(v.string()),
    mediaId: v.optional(v.id("_storage")),
    clearMedia: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const entry = await ctx.db.get(args.entryId);
    if (!entry || entry.removedAt) throw new Error("Souvenir introuvable.");
    if (!canEdit(entry, deviceToken)) {
      throw new Error("Ce souvenir appartient à l'autre appareil.");
    }

    const now = Date.now();
    const patch: Partial<Doc<"journalEntries">> = { updatedAt: now };

    if (args.title !== undefined) {
      const title = args.title.trim().slice(0, MAX_TITLE);
      if (!title) throw new Error("Un titre est nécessaire.");
      patch.title = title;
    }
    if (args.note !== undefined) {
      patch.note = args.note.trim().slice(0, MAX_NOTE) || undefined;
    }
    if (args.clearMedia) {
      if (entry.mediaId) await ctx.storage.delete(entry.mediaId);
      patch.mediaId = undefined;
      patch.mediaType = undefined;
    } else if (args.mediaId !== undefined) {
      const media = await validateMedia(ctx, args.mediaId);
      if (media) {
        if (entry.mediaId && entry.mediaId !== media.mediaId) {
          await ctx.storage.delete(entry.mediaId);
        }
        patch.mediaId = media.mediaId;
        patch.mediaType = media.mediaType;
      }
    }

    await ctx.db.patch(entry._id, patch);
    return { ok: true };
  },
});

/**
 * Retire un souvenir du journal (marqué, jamais recréé automatiquement) et
 * libère l'image associée.
 */
export const remove = mutation({
  args: { deviceToken: v.string(), entryId: v.id("journalEntries") },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const entry = await ctx.db.get(args.entryId);
    if (!entry) return { ok: true };
    if (!canEdit(entry, deviceToken)) {
      throw new Error("Ce souvenir appartient à l'autre appareil.");
    }

    const now = Date.now();
    if (entry.mediaId) await ctx.storage.delete(entry.mediaId);
    await ctx.db.patch(entry._id, {
      removedAt: now,
      mediaId: undefined,
      mediaType: undefined,
      updatedAt: now,
    });
    return { ok: true };
  },
});
