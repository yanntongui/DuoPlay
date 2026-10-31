import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { cleanDeviceToken } from "./lib/identity";

/**
 * Favoris & collections (§3 « fonctionnalités complémentaires »).
 * Rattachés à l'appareil tant que le compte léger n'existe pas (Phase 6).
 */

export const list = query({
  args: { deviceToken: v.string() },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);

    const rows = await ctx.db
      .query("favorites")
      .withIndex("by_device", (q) => q.eq("deviceToken", deviceToken))
      .collect();

    const experiences = await Promise.all(
      rows.map(async (row) => {
        const experience = await ctx.db.get(row.experienceId);
        if (!experience) return null;
        const category = await ctx.db.get(experience.categoryId);
        return {
          favoriteId: row._id,
          createdAt: row.createdAt,
          collectionId: row.collectionId ?? null,
          position: row.position ?? row.createdAt,
          experience: {
            _id: experience._id,
            slug: experience.slug,
            title: experience.title,
            description: experience.description,
            depth: experience.depth,
            estimatedMinutes: experience.estimatedMinutes,
            modes: experience.modes,
          },
          category: category
            ? {
                slug: category.slug,
                title: category.title,
                emoji: category.emoji,
              }
            : null,
        };
      }),
    );

    return experiences
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => a.position - b.position);
  },
});

export const idsForDevice = query({
  args: { deviceToken: v.string() },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const rows = await ctx.db
      .query("favorites")
      .withIndex("by_device", (q) => q.eq("deviceToken", deviceToken))
      .collect();
    return rows.map((row) => row.experienceId);
  },
});

export const toggle = mutation({
  args: { deviceToken: v.string(), experienceId: v.id("experiences") },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);

    const experience = await ctx.db.get(args.experienceId);
    if (!experience) throw new Error("Cette expérience n'existe pas.");

    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_device_experience", (q) =>
        q.eq("deviceToken", deviceToken).eq("experienceId", args.experienceId),
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { favorite: false };
    }

    await ctx.db.insert("favorites", {
      deviceToken,
      experienceId: args.experienceId,
      position: await nextPosition(ctx, deviceToken),
      createdAt: Date.now(),
    });
    return { favorite: true };
  },
});

/** Classe un favori dans une collection, ou le laisse sans collection. */
export const assign = mutation({
  args: {
    deviceToken: v.string(),
    favoriteId: v.id("favorites"),
    collectionId: v.union(v.id("collections"), v.null()),
  },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const favorite = await ctx.db.get(args.favoriteId);
    if (!favorite) throw new Error("Ce favori n'existe plus.");
    if (favorite.deviceToken !== deviceToken) {
      throw new Error("Ce favori appartient à un autre appareil.");
    }

    if (args.collectionId !== null) {
      const collection = await ctx.db.get(args.collectionId);
      if (!collection || collection.removedAt) {
        throw new Error("Collection introuvable.");
      }
      if (collection.deviceToken !== deviceToken) {
        throw new Error("Cette collection appartient à un autre appareil.");
      }
    }

    await ctx.db.patch(favorite._id, {
      collectionId: args.collectionId ?? undefined,
    });
    return { ok: true };
  },
});

/** Réordonne les favoris de l'appareil selon l'ordre reçu. */
export const reorder = mutation({
  args: { deviceToken: v.string(), ids: v.array(v.id("favorites")) },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const rows = await ctx.db
      .query("favorites")
      .withIndex("by_device", (q) => q.eq("deviceToken", deviceToken))
      .collect();
    const known = new Set(rows.map((row) => row._id));

    let position = 0;
    for (const id of args.ids) {
      if (!known.has(id)) continue;
      position += 1;
      await ctx.db.patch(id, { position });
    }
    return { ok: true };
  },
});

async function nextPosition(
  ctx: MutationCtx,
  deviceToken: string,
): Promise<number> {
  const rows = await ctx.db
    .query("favorites")
    .withIndex("by_device", (q) => q.eq("deviceToken", deviceToken))
    .collect();
  return rows.reduce((max, row) => Math.max(max, row.position ?? 0), 0) + 1;
}
