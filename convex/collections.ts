import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { logEvent } from "./lib/events";
import { cleanDeviceToken } from "./lib/identity";

/**
 * Collections de favoris (§4) : des listes nommées pour trier ce qu'on a gardé.
 * Rattachées à l'appareil, jamais partagées avec le partenaire — comme les
 * favoris eux-mêmes.
 */

const MAX_NAME = 40;
const MAX_COLLECTIONS = 12;
const EMOJI = ["💞", "🌙", "🌊", "🔥", "🥂", "🎈", "🍃", "✨", "🌿", "🕯️"];

async function owned(
  ctx: QueryCtx | MutationCtx,
  deviceToken: string,
): Promise<Doc<"collections">[]> {
  const rows = await ctx.db
    .query("collections")
    .withIndex("by_device_position", (q) => q.eq("deviceToken", deviceToken))
    .collect();
  return rows.filter((row) => !row.removedAt);
}

/** Collections nommées de l'appareil, avec le nombre de favoris de chacune. */
export const list = query({
  args: { deviceToken: v.string() },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const rows = await owned(ctx, deviceToken);

    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_device", (q) => q.eq("deviceToken", deviceToken))
      .collect();
    const live = new Set(rows.map((row) => row._id));

    const counts = new Map<Id<"collections">, number>();
    let unfiled = 0;
    for (const favorite of favorites) {
      const id = favorite.collectionId;
      if (id && live.has(id)) {
        counts.set(id, (counts.get(id) ?? 0) + 1);
      } else {
        unfiled += 1;
      }
    }

    return {
      collections: rows
        .sort((a, b) => a.position - b.position)
        .map((row) => ({
          id: row._id,
          name: row.name,
          emoji: row.emoji,
          position: row.position,
          count: counts.get(row._id) ?? 0,
        })),
      unfiled,
      total: favorites.length,
    };
  },
});

/** Crée une collection nommée. */
export const create = mutation({
  args: { deviceToken: v.string(), name: v.string() },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const name = args.name.trim().slice(0, MAX_NAME);
    if (!name) throw new Error("Donnez un nom à cette collection.");

    const rows = await owned(ctx, deviceToken);
    if (rows.length >= MAX_COLLECTIONS) {
      throw new Error("Trop de collections (12 au maximum).");
    }

    const now = Date.now();
    const position =
      rows.reduce((max, row) => Math.max(max, row.position), 0) + 1;
    const id = await ctx.db.insert("collections", {
      deviceToken,
      name,
      emoji: EMOJI[rows.length % EMOJI.length],
      position,
      createdAt: now,
      updatedAt: now,
    });
    await logEvent(ctx, "collection_created", now, {});
    return { id };
  },
});

/** Renomme une collection. */
export const rename = mutation({
  args: {
    deviceToken: v.string(),
    collectionId: v.id("collections"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const collection = await ctx.db.get(args.collectionId);
    if (!collection || collection.removedAt) {
      throw new Error("Collection introuvable.");
    }
    if (collection.deviceToken !== deviceToken) {
      throw new Error("Cette collection appartient à un autre appareil.");
    }
    const name = args.name.trim().slice(0, MAX_NAME);
    if (!name) throw new Error("Donnez un nom à cette collection.");

    await ctx.db.patch(collection._id, { name, updatedAt: Date.now() });
    return { ok: true };
  },
});

/** Supprime une collection ; ses favoris redeviennent non classés. */
export const remove = mutation({
  args: { deviceToken: v.string(), collectionId: v.id("collections") },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const collection = await ctx.db.get(args.collectionId);
    if (!collection) return { ok: true };
    if (collection.deviceToken !== deviceToken) {
      throw new Error("Cette collection appartient à un autre appareil.");
    }

    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_device", (q) => q.eq("deviceToken", deviceToken))
      .collect();
    for (const favorite of favorites) {
      if (favorite.collectionId === collection._id) {
        await ctx.db.patch(favorite._id, { collectionId: undefined });
      }
    }

    await ctx.db.patch(collection._id, {
      removedAt: Date.now(),
      updatedAt: Date.now(),
    });
    return { ok: true };
  },
});

/** Réordonne les collections selon l'ordre reçu. */
export const reorder = mutation({
  args: { deviceToken: v.string(), ids: v.array(v.id("collections")) },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const rows = await owned(ctx, deviceToken);
    const known = new Set(rows.map((row) => row._id));
    let position = 0;
    for (const id of args.ids) {
      if (!known.has(id)) continue;
      position += 1;
      await ctx.db.patch(id, { position, updatedAt: Date.now() });
    }
    return { ok: true };
  },
});
