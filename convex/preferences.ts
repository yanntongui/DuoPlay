import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { cleanDeviceToken, optionalDeviceToken } from "./lib/identity";

/**
 * Préférences de personnalisation (cf. docs/PRD.md §3.F).
 *
 * Elles vivent **par appareil** et ne sont jamais exposées au partenaire : les
 * thèmes écartés et la profondeur acceptée relèvent de l'intimité de chacun
 * (§15). En Phase 6, le compte léger les rattachera.
 */

const depth = v.union(
  v.literal("leger"),
  v.literal("moyen"),
  v.literal("profond"),
);

const sessionMode = v.union(
  v.literal("ensemble"),
  v.literal("a-distance"),
  v.literal("differe"),
  v.literal("defi-individuel"),
);

export const get = query({
  args: { deviceToken: v.string() },
  handler: async (ctx, args) => {
    const deviceToken = optionalDeviceToken(args.deviceToken);
    if (!deviceToken) return null;

    const row = await ctx.db
      .query("preferences")
      .withIndex("by_device", (q) => q.eq("deviceToken", deviceToken))
      .unique();

    if (!row) return null;

    return {
      mood: row.mood ?? null,
      maxDepth: row.maxDepth ?? null,
      avoidThemes: row.avoidThemes,
      durationMinutes: row.durationMinutes ?? null,
      mode: row.mode ?? null,
      updatedAt: row.updatedAt,
    };
  },
});

export const save = mutation({
  args: {
    deviceToken: v.string(),
    mood: v.optional(v.string()),
    maxDepth: v.optional(depth),
    avoidThemes: v.optional(v.array(v.string())),
    durationMinutes: v.optional(v.number()),
    mode: v.optional(sessionMode),
  },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    await savePreferences(ctx, deviceToken, args);
  },
});

/**
 * Efface les préférences retenues : le formulaire repart des valeurs par défaut
 * du contenu. Utile depuis les Paramètres, sans toucher au reste de l'appareil.
 */
export const clear = mutation({
  args: { deviceToken: v.string() },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const existing = await ctx.db
      .query("preferences")
      .withIndex("by_device", (q) => q.eq("deviceToken", deviceToken))
      .unique();
    if (existing) await ctx.db.delete(existing._id);
    return { ok: true };
  },
});

/** Enregistrement interne (utilisé aussi par la création de partie). */
export async function savePreferences(
  ctx: MutationCtx,
  deviceToken: string,
  input: {
    mood?: string;
    maxDepth?: "leger" | "moyen" | "profond";
    avoidThemes?: string[];
    durationMinutes?: number;
    mode?: "ensemble" | "a-distance" | "differe" | "defi-individuel";
  },
) {
  const now = Date.now();
  const existing = await ctx.db
    .query("preferences")
    .withIndex("by_device", (q) => q.eq("deviceToken", deviceToken))
    .unique();

  const avoidThemes = input.avoidThemes
    ? [...new Set(input.avoidThemes.map((theme) => theme.trim()).filter(Boolean))]
    : undefined;

  if (existing) {
    await ctx.db.patch(existing._id, {
      mood: input.mood ?? existing.mood,
      maxDepth: input.maxDepth ?? existing.maxDepth,
      avoidThemes: avoidThemes ?? existing.avoidThemes,
      durationMinutes: input.durationMinutes ?? existing.durationMinutes,
      mode: input.mode ?? existing.mode,
      updatedAt: now,
    });
    return;
  }

  await ctx.db.insert("preferences", {
    deviceToken,
    mood: input.mood,
    maxDepth: input.maxDepth,
    avoidThemes: avoidThemes ?? [],
    durationMinutes: input.durationMinutes,
    mode: input.mode,
    updatedAt: now,
  });
}
