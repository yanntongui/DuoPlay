import { v } from "convex/values";
import {
  internalMutation,
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { assertAdmin } from "./lib/admin";
import { cleanDeviceToken, optionalDeviceToken } from "./lib/identity";
import { generateSession as buildSession, softenStep } from "./ai/engine";
import {
  DURATIONS,
  type AiBrief,
  type AiLevel,
  type AiMode,
  type AiMood,
} from "./ai/content";
import {
  EXCLUSION_LABELS,
  cleanExclusions,
  screenRequest,
} from "./ai/policy";
import {
  parseQuery,
  scoreExperience,
  type SearchFilters,
} from "./ai/search";
import {
  draftCommunication,
  type CommIntent,
  type CommTone,
} from "./ai/communication";
import { AI_CARDS, AI_CATALOGUE } from "./ai/catalogue";

/**
 * DuoPlay AI — fonctions publiques (phase 1).
 *
 * Toutes les fonctions sont liées à l'appareil (`deviceToken`), comme le reste
 * de l'application sans compte. Aucune réponse intime, note privée, média ou
 * conversation privée ne transite ici : uniquement les métadonnées nécessaires
 * à l'orchestration, conformément à docs/AI-DUOPLAY.md §6 et §8.
 */

const AI_VERSION = "ai-1.0.0";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const MONTHLY_LIMIT = 30;
const FLAG_KILL_SWITCH = "ai_kill_switch";
const FLAG_ENABLED = "duoplay_ai";

const moodValidator = v.union(
  v.literal("tendre"),
  v.literal("romantique"),
  v.literal("joueur"),
  v.literal("curieux"),
  v.literal("sensuel"),
  v.literal("audacieux"),
);
const levelValidator = v.union(
  v.literal("leger"),
  v.literal("moyen"),
  v.literal("profond"),
);
const modeValidator = v.union(
  v.literal("ensemble"),
  v.literal("a-distance"),
);
const actionValidator = v.union(
  v.literal("accept"),
  v.literal("modify"),
  v.literal("skip"),
  v.literal("replace"),
  v.literal("pause"),
  v.literal("resume"),
  v.literal("finish"),
  v.literal("revoke"),
);

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function monthKey(): string {
  return new Date().toISOString().slice(0, 7);
}

async function flagEnabled(
  ctx: QueryCtx | MutationCtx,
  key: string,
  fallback: boolean,
): Promise<boolean> {
  const row = await ctx.db
    .query("aiFeatureFlags")
    .withIndex("by_key", (q) => q.eq("key", key))
    .unique();
  return row ? row.enabled : fallback;
}

async function getConsentRow(ctx: QueryCtx | MutationCtx, deviceToken: string) {
  return await ctx.db
    .query("aiConsents")
    .withIndex("by_device_feature", (q) =>
      q.eq("deviceToken", deviceToken).eq("feature", "global"),
    )
    .unique();
}

async function monthlyUsage(ctx: QueryCtx | MutationCtx, deviceToken: string) {
  const rows = await ctx.db
    .query("aiUsageDaily")
    .withIndex("by_device", (q) => q.eq("deviceToken", deviceToken))
    .collect();
  const month = monthKey();
  return rows
    .filter((row) => row.day.startsWith(month))
    .reduce(
      (acc, row) => ({
        generations: acc.generations + row.generations,
        accepted: acc.accepted + row.accepted,
        skipped: acc.skipped + row.skipped,
        paused: acc.paused + row.paused,
        completed: acc.completed + row.completed,
      }),
      { generations: 0, accepted: 0, skipped: 0, paused: 0, completed: 0 },
    );
}

async function bumpUsage(
  ctx: MutationCtx,
  deviceToken: string,
  patch: Partial<{
    generations: number;
    accepted: number;
    skipped: number;
    paused: number;
    completed: number;
  }>,
) {
  const now = Date.now();
  const day = todayKey();
  const existing = await ctx.db
    .query("aiUsageDaily")
    .withIndex("by_device_day", (q) =>
      q.eq("deviceToken", deviceToken).eq("day", day),
    )
    .unique();

  if (existing) {
    await ctx.db.patch(existing._id, {
      generations: existing.generations + (patch.generations ?? 0),
      accepted: existing.accepted + (patch.accepted ?? 0),
      skipped: existing.skipped + (patch.skipped ?? 0),
      paused: existing.paused + (patch.paused ?? 0),
      completed: existing.completed + (patch.completed ?? 0),
      updatedAt: now,
    });
    return;
  }

  await ctx.db.insert("aiUsageDaily", {
    deviceToken,
    day,
    generations: patch.generations ?? 0,
    accepted: patch.accepted ?? 0,
    skipped: patch.skipped ?? 0,
    paused: patch.paused ?? 0,
    completed: patch.completed ?? 0,
    createdAt: now,
    updatedAt: now,
  });
}

async function logEvent(
  ctx: MutationCtx,
  deviceToken: string,
  kind: string,
  action: string,
  sessionId?: Id<"aiSessions">,
  stepIndex?: number,
) {
  await ctx.db.insert("aiEvents", {
    deviceToken,
    sessionId,
    kind,
    action,
    stepIndex,
    createdAt: Date.now(),
  });
}

async function logSafety(
  ctx: MutationCtx,
  deviceToken: string,
  category: string,
  severity: string,
  action: string,
) {
  await ctx.db.insert("aiSafetyEvents", {
    deviceToken,
    category,
    severity,
    action,
    createdAt: Date.now(),
  });
}

async function preferencesFor(ctx: QueryCtx | MutationCtx, deviceToken: string) {
  return await ctx.db
    .query("preferences")
    .withIndex("by_device", (q) => q.eq("deviceToken", deviceToken))
    .unique();
}

async function dismissalsFor(ctx: QueryCtx | MutationCtx, deviceToken: string) {
  return await ctx.db
    .query("aiRecommendationDismissals")
    .withIndex("by_device", (q) => q.eq("deviceToken", deviceToken))
    .collect();
}

/* ------------------------------------------------------------------ */
/* Consentement et état général                                        */
/* ------------------------------------------------------------------ */

export const overview = query({
  args: { deviceToken: v.string() },
  handler: async (ctx, args) => {
    const deviceToken = optionalDeviceToken(args.deviceToken);
    if (!deviceToken) return null;

    const [consent, usage, enabled, killSwitch, dismissals] = await Promise.all([
      getConsentRow(ctx, deviceToken),
      monthlyUsage(ctx, deviceToken),
      flagEnabled(ctx, FLAG_ENABLED, true),
      flagEnabled(ctx, FLAG_KILL_SWITCH, false),
      dismissalsFor(ctx, deviceToken),
    ]);

    const recent = await ctx.db
      .query("aiSessions")
      .withIndex("by_device_created", (q) => q.eq("deviceToken", deviceToken))
      .order("desc")
      .take(12);

    return {
      version: AI_VERSION,
      consent: {
        granted: Boolean(consent?.granted),
        grantedAt: consent?.grantedAt ?? null,
        revokedAt: consent?.revokedAt ?? null,
      },
      availability: enabled && !killSwitch,
      quota: {
        used: usage.generations,
        limit: MONTHLY_LIMIT,
        remaining: Math.max(0, MONTHLY_LIMIT - usage.generations),
      },
      usage,
      dismissals: dismissals.map((row) => ({ kind: row.kind, value: row.value })),
      sessions: recent
        .filter((row) => row.status !== "deleted")
        .map((row) => ({
          id: row._id,
          title: row.title,
          subtitle: row.subtitle,
          mood: row.mood,
          level: row.level,
          mode: row.mode,
          durationMinutes: row.durationMinutes,
          status: row.status,
          createdAt: row.createdAt,
        })),
    };
  },
});

export const setConsent = mutation({
  args: { deviceToken: v.string(), granted: v.boolean() },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const now = Date.now();
    const existing = await getConsentRow(ctx, deviceToken);

    if (existing) {
      await ctx.db.patch(existing._id, {
        granted: args.granted,
        grantedAt: args.granted ? now : existing.grantedAt,
        revokedAt: args.granted ? undefined : now,
        updatedAt: now,
        version: AI_VERSION,
      });
    } else {
      await ctx.db.insert("aiConsents", {
        deviceToken,
        feature: "global",
        granted: args.granted,
        version: AI_VERSION,
        grantedAt: args.granted ? now : undefined,
        revokedAt: args.granted ? undefined : now,
        updatedAt: now,
      });
    }

    await logEvent(ctx, deviceToken, "consent", args.granted ? "grant" : "revoke");
    return { granted: args.granted };
  },
});

/* ------------------------------------------------------------------ */
/* Génération et session                                               */
/* ------------------------------------------------------------------ */

export const generateSession = mutation({
  args: {
    deviceToken: v.string(),
    mood: moodValidator,
    level: levelValidator,
    mode: modeValidator,
    durationMinutes: v.number(),
    exclusions: v.array(v.string()),
    wish: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const enabled = await flagEnabled(ctx, FLAG_ENABLED, true);
    const killSwitch = await flagEnabled(ctx, FLAG_KILL_SWITCH, false);

    if (!enabled || killSwitch) {
      return {
        ok: false as const,
        reason: "indisponible" as const,
        message:
          "DuoPlay AI se repose un instant. Vous pouvez explorer le catalogue en attendant.",
        alternative: "Explorer les expériences",
      };
    }

    const consent = await getConsentRow(ctx, deviceToken);
    if (!consent?.granted) {
      return {
        ok: false as const,
        reason: "consentement" as const,
        message:
          "DuoPlay AI a besoin de votre accord pour créer une session. Rien n’est généré sans votre consentement.",
        alternative: "Activer DuoPlay AI",
      };
    }

    const usage = await monthlyUsage(ctx, deviceToken);
    if (usage.generations >= MONTHLY_LIMIT) {
      return {
        ok: false as const,
        reason: "quota" as const,
        message: `Vous avez atteint les ${MONTHLY_LIMIT} générations de ce mois. Le catalogue reste entièrement disponible.`,
        alternative: "Explorer le catalogue",
      };
    }

    const verdict = screenRequest(args.wish ?? "");
    if (verdict.blocked) {
      await logSafety(
        ctx,
        deviceToken,
        verdict.category ?? "inconnu",
        verdict.severity,
        "refus",
      );
      return {
        ok: false as const,
        reason: "securite" as const,
        message: verdict.message,
        alternative: verdict.alternative,
      };
    }

    const exclusions = cleanExclusions(args.exclusions);
    const duration = DURATIONS.includes(
      args.durationMinutes as (typeof DURATIONS)[number],
    )
      ? args.durationMinutes
      : 15;

    const brief: AiBrief = {
      mood: args.mood as AiMood,
      level: args.level as AiLevel,
      mode: args.mode as AiMode,
      durationMinutes: duration,
      exclusions,
      wish: args.wish?.slice(0, 300),
    };

    const generated = buildSession(brief);
    const now = Date.now();

    const sessionId = await ctx.db.insert("aiSessions", {
      deviceToken,
      title: generated.title,
      subtitle: generated.subtitle,
      mood: args.mood,
      level: args.level,
      mode: args.mode,
      durationMinutes: duration,
      exclusions,
      source: "generated",
      status: "draft",
      steps: generated.steps,
      finalQuestion: generated.finalQuestion,
      alternatives: generated.alternatives,
      rationale: generated.rationale,
      createdAt: now,
      updatedAt: now,
      expiresAt: now + SESSION_TTL_MS,
    });

    await bumpUsage(ctx, deviceToken, { generations: 1 });
    await logEvent(ctx, deviceToken, "generation", "generate", sessionId);

    return {
      ok: true as const,
      sessionId,
      session: {
        title: generated.title,
        subtitle: generated.subtitle,
        steps: generated.steps,
        finalQuestion: generated.finalQuestion,
        alternatives: generated.alternatives,
        rationale: generated.rationale,
        mood: args.mood,
        level: args.level,
        mode: args.mode,
        durationMinutes: duration,
        exclusions: exclusions.map((item) => EXCLUSION_LABELS[item] ?? item),
      },
    };
  },
});

export const getSession = query({
  args: { deviceToken: v.string(), sessionId: v.id("aiSessions") },
  handler: async (ctx, args) => {
    const deviceToken = optionalDeviceToken(args.deviceToken);
    if (!deviceToken) return null;
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.deviceToken !== deviceToken) return null;
    if (session.status === "deleted") return null;
    return session;
  },
});

export const listSessions = query({
  args: { deviceToken: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const deviceToken = optionalDeviceToken(args.deviceToken);
    if (!deviceToken) return [];
    const rows = await ctx.db
      .query("aiSessions")
      .withIndex("by_device_created", (q) => q.eq("deviceToken", deviceToken))
      .order("desc")
      .take(Math.min(50, args.limit ?? 20));

    return rows
      .filter((row) => row.status !== "deleted")
      .map((row) => ({
        id: row._id,
        title: row.title,
        subtitle: row.subtitle,
        mood: row.mood,
        level: row.level,
        mode: row.mode,
        durationMinutes: row.durationMinutes,
        status: row.status,
        createdAt: row.createdAt,
        stepCount: row.steps.length,
      }));
  },
});

export const startSession = mutation({
  args: { deviceToken: v.string(), sessionId: v.id("aiSessions") },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.deviceToken !== deviceToken || session.status === "deleted") {
      return { ok: false as const };
    }
    const now = Date.now();
    await ctx.db.patch(session._id, {
      status: "active",
      startedAt: session.startedAt ?? now,
      updatedAt: now,
    });
    await logEvent(ctx, deviceToken, "session", "start", session._id);
    return { ok: true as const };
  },
});

export const recordAction = mutation({
  args: {
    deviceToken: v.string(),
    sessionId: v.id("aiSessions"),
    stepIndex: v.optional(v.number()),
    action: actionValidator,
  },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.deviceToken !== deviceToken || session.status === "deleted") {
      return { ok: false as const };
    }

    const now = Date.now();
    const patch: {
      updatedAt: number;
      status?: string;
      pausedAt?: number | undefined;
      completedAt?: number;
    } = { updatedAt: now };

    if (args.action === "pause") {
      patch.status = "paused";
      patch.pausedAt = now;
    } else if (args.action === "resume") {
      patch.status = "active";
      patch.pausedAt = undefined;
    } else if (args.action === "finish") {
      patch.status = "completed";
      patch.completedAt = now;
    } else if (args.action === "revoke") {
      patch.status = "ended";
      patch.completedAt = now;
    } else {
      patch.status = "active";
    }

    await ctx.db.patch(session._id, patch);
    await logEvent(ctx, deviceToken, "step", args.action, session._id, args.stepIndex);

    const usagePatch: Parameters<typeof bumpUsage>[2] = {};
    if (args.action === "accept") usagePatch.accepted = 1;
    if (args.action === "skip") usagePatch.skipped = 1;
    if (args.action === "pause") usagePatch.paused = 1;
    if (args.action === "finish") usagePatch.completed = 1;
    if (Object.keys(usagePatch).length > 0) {
      await bumpUsage(ctx, deviceToken, usagePatch);
    }

    return { ok: true as const, status: patch.status as string };
  },
});

export const requestAlternative = mutation({
  args: {
    deviceToken: v.string(),
    sessionId: v.id("aiSessions"),
    stepIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.deviceToken !== deviceToken || session.status === "deleted") {
      return { ok: false as const };
    }
    const step = session.steps[args.stepIndex];
    if (!step) return { ok: false as const };

    await logEvent(
      ctx,
      deviceToken,
      "step",
      "replace",
      session._id,
      args.stepIndex,
    );

    return { ok: true as const, step: softenStep(step) };
  },
});

export const deleteSession = mutation({
  args: { deviceToken: v.string(), sessionId: v.id("aiSessions") },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.deviceToken !== deviceToken) {
      return { ok: false as const };
    }

    const now = Date.now();
    await ctx.db.patch(session._id, {
      status: "deleted",
      title: "Session supprimée",
      subtitle: "",
      steps: [],
      alternatives: [],
      rationale: [],
      finalQuestion: "",
      deletedAt: now,
      updatedAt: now,
      deletionHistory: [...(session.deletionHistory ?? []), now],
    });
    await logEvent(ctx, deviceToken, "deletion", "delete", session._id);
    return { ok: true as const };
  },
});

export const clearHistory = mutation({
  args: { deviceToken: v.string() },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const rows = await ctx.db
      .query("aiSessions")
      .withIndex("by_device", (q) => q.eq("deviceToken", deviceToken))
      .collect();

    const now = Date.now();
    let deleted = 0;
    for (const row of rows) {
      if (row.status === "deleted") continue;
      await ctx.db.patch(row._id, {
        status: "deleted",
        title: "Session supprimée",
        subtitle: "",
        steps: [],
        alternatives: [],
        rationale: [],
        finalQuestion: "",
        deletedAt: now,
        updatedAt: now,
        deletionHistory: [...(row.deletionHistory ?? []), now],
      });
      deleted += 1;
    }
    await logEvent(ctx, deviceToken, "deletion", "delete");
    return { ok: true as const, deleted };
  },
});

/* ------------------------------------------------------------------ */
/* Recommandations                                                     */
/* ------------------------------------------------------------------ */

type RecommendationItem = {
  slug: string;
  title: string;
  description: string;
  emoji: string;
  category: string;
  durationMinutes: number;
  depth: string;
  themes: string[];
  mood?: AiMood;
  reasons: string[];
  score: number;
  action: "compose" | "catalogue";
};

/**
 * Recommandations de repli quand aucune expérience n’est publiée en base.
 * Elles s’appuient sur les mêmes préférences et les mêmes exclusions, et
 * renvoient vers le composeur (jamais vers une fiche inexistante).
 */
function fallbackRecommendations(
  preferences: Awaited<ReturnType<typeof preferencesFor>>,
  avoidThemes: string[],
  dismissedValues: Set<string>,
): RecommendationItem[] {
  const items: RecommendationItem[] = [];

  for (const entry of AI_CATALOGUE) {
    if (dismissedValues.has(`experience:${entry.slug}`)) continue;
    if (entry.themes.some((theme) => avoidThemes.includes(theme))) continue;
    if (dismissedValues.has(`theme:${entry.themes[0]}`)) continue;
    if (preferences?.maxDepth === "leger" && entry.depth === "profond") continue;

    let score = 0;
    const reasons: string[] = [];

    if (
      preferences?.mode &&
      (preferences.mode === "ensemble" || preferences.mode === "a-distance") &&
      entry.modes.includes(preferences.mode)
    ) {
      score += 3;
      reasons.push(
        preferences.mode === "a-distance"
          ? "Pensée pour un moment à distance, sans contact."
          : "Pensée pour un moment au même endroit.",
      );
    }

    if (preferences?.durationMinutes) {
      const gap = Math.abs(entry.durationMinutes - preferences.durationMinutes);
      if (gap <= 5) {
        score += 2;
        reasons.push(
          `Tient dans votre format habituel de ${preferences.durationMinutes} minutes.`,
        );
      }
    }

    if (preferences?.mood && entry.mood === preferences.mood) {
      score += 2;
      reasons.push("Rejoint l’ambiance que vous avez choisie récemment.");
    }

    if (preferences?.maxDepth && entry.depth === preferences.maxDepth) {
      score += 1;
      reasons.push("Respecte le niveau que vous avez accepté.");
    }

    if (avoidThemes.length > 0) {
      reasons.push("Respecte les catégories que vous avez exclues.");
    }

    if (reasons.length === 0) {
      reasons.push("Une proposition pour varier les formats et les ambiances.");
    }

    items.push({
      slug: entry.slug,
      title: entry.title,
      description: entry.description,
      emoji: entry.emoji,
      category: entry.category,
      durationMinutes: entry.durationMinutes,
      depth: entry.depth,
      themes: entry.themes,
      mood: entry.mood,
      reasons: reasons.slice(0, 2),
      score,
      action: "compose",
    });
  }

  return items.sort((a, b) => b.score - a.score).slice(0, 3);
}

export const recommendations = query({
  args: { deviceToken: v.string() },
  handler: async (ctx, args) => {
    const deviceToken = optionalDeviceToken(args.deviceToken);
    if (!deviceToken) return { items: [], dismissed: [], basis: [] };

    const [preferences, dismissals] = await Promise.all([
      preferencesFor(ctx, deviceToken),
      dismissalsFor(ctx, deviceToken),
    ]);

    const dismissedValues = new Set(dismissals.map((row) => `${row.kind}:${row.value}`));
    const avoidThemes = preferences?.avoidThemes ?? [];

    const experiences = await ctx.db
      .query("experiences")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .take(200);

    // Aucun catalogue publié : on propose les idées éditoriales de DuoPlay AI.
    // Elles renvoient vers le composeur, pas vers une fiche inexistante.
    if (experiences.length === 0) {
      return {
        items: fallbackRecommendations(preferences, avoidThemes, dismissedValues),
        dismissed: [...dismissedValues],
        basis: [
          preferences?.mode ? "mode de session" : null,
          preferences?.durationMinutes ? "durée habituelle" : null,
          avoidThemes.length > 0 ? "catégories exclues" : null,
          "idées DuoPlay AI",
        ].filter(Boolean) as string[],
      };
    }

    const items: RecommendationItem[] = [];

    for (const experience of experiences) {
      if (dismissedValues.has(`experience:${experience.slug}`)) continue;
      if (avoidThemes.some((theme) => experience.themes.includes(theme))) continue;
      if (
        preferences?.maxDepth === "leger" &&
        experience.depth === "profond"
      ) {
        continue;
      }

      const category = await ctx.db.get(experience.categoryId);
      if (!category || category.status !== "published") continue;

      let score = 0;
      const reasons: string[] = [];

      if (preferences?.mode && experience.modes.includes(preferences.mode)) {
        score += 3;
        reasons.push("Cette expérience correspond à votre format habituel.");
      }

      if (preferences?.durationMinutes) {
        const gap = Math.abs(
          experience.estimatedMinutes - preferences.durationMinutes,
        );
        if (gap <= 5) {
          score += 2;
          reasons.push(
            `Cette session correspond à votre préférence pour les formats de ${preferences.durationMinutes} minutes.`,
          );
        }
      }

      if (preferences?.mood && experience.themes.includes(preferences.mood)) {
        score += 2;
        reasons.push("Elle rejoint l’ambiance que vous avez choisie récemment.");
      }

      if (preferences?.maxDepth && experience.depth === preferences.maxDepth) {
        score += 1;
        reasons.push("Elle respecte le niveau que vous avez accepté.");
      }

      if (avoidThemes.length > 0) {
        reasons.push(
          "Cette expérience respecte les catégories que vous avez exclues.",
        );
      }

      if (reasons.length === 0) {
        reasons.push("Une proposition pour varier les formats et les ambiances.");
      }

      items.push({
        slug: experience.slug,
        title: experience.title,
        description: experience.description,
        emoji: category.emoji,
        category: category.title,
        durationMinutes: experience.estimatedMinutes,
        depth: experience.depth,
        themes: experience.themes,
        reasons: reasons.slice(0, 2),
        score,
        action: "catalogue",
      });
    }

    items.sort((a, b) => b.score - a.score);
    return {
      items: items.slice(0, 3),
      dismissed: [...dismissedValues],
      basis: [
        preferences?.mode ? "mode de session" : null,
        preferences?.durationMinutes ? "durée habituelle" : null,
        avoidThemes.length > 0 ? "catégories exclues" : null,
        "expériences publiées",
      ].filter(Boolean) as string[],
    };
  },
});

export const dismissRecommendation = mutation({
  args: {
    deviceToken: v.string(),
    kind: v.union(
      v.literal("mood"),
      v.literal("theme"),
      v.literal("experience"),
      v.literal("duration"),
      v.literal("mode"),
    ),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const existing = await ctx.db
      .query("aiRecommendationDismissals")
      .withIndex("by_device", (q) => q.eq("deviceToken", deviceToken))
      .collect();

    const already = existing.find(
      (row) => row.kind === args.kind && row.value === args.value,
    );
    if (!already) {
      await ctx.db.insert("aiRecommendationDismissals", {
        deviceToken,
        kind: args.kind,
        value: args.value.slice(0, 120),
        createdAt: Date.now(),
      });
    }
    return { ok: true as const };
  },
});

export const restoreRecommendations = mutation({
  args: { deviceToken: v.string() },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const rows = await ctx.db
      .query("aiRecommendationDismissals")
      .withIndex("by_device", (q) => q.eq("deviceToken", deviceToken))
      .collect();
    for (const row of rows) await ctx.db.delete(row._id);
    return { ok: true as const };
  },
});

/* ------------------------------------------------------------------ */
/* Recherche en langage naturel                                        */
/* ------------------------------------------------------------------ */

export const search = query({
  args: { deviceToken: v.string(), query: v.string() },
  handler: async (ctx, args) => {
    const deviceToken = optionalDeviceToken(args.deviceToken);
    const filters: SearchFilters = parseQuery(args.query);
    const verdict = screenRequest(args.query);

    if (verdict.blocked) {
      return {
        blocked: true as const,
        message: verdict.message,
        alternative: verdict.alternative,
        filters,
        experiences: [],
        journeys: [],
        cards: [],
      };
    }

    const preferences = deviceToken ? await preferencesFor(ctx, deviceToken) : null;
    const avoidThemes = [
      ...(preferences?.avoidThemes ?? []),
      ...filters.exclusions.filter((item) => item === "audacieux"),
    ];

    // Une limite enregistrée ne peut jamais être retirée par la requête.
    if (preferences?.maxDepth) {
      const rank = { leger: 0, moyen: 1, profond: 2 } as const;
      if (rank[preferences.maxDepth] < 2) {
        filters.level = preferences.maxDepth;
      }
    }

    const experiences = await ctx.db
      .query("experiences")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .take(200);

    // Aucune expérience publiée : la recherche s’appuie sur les idées
    // éditoriales de DuoPlay AI. Elles ouvrent le composeur, pas une fiche
    // inexistante.
    if (experiences.length === 0) {
      const scoredFallback = AI_CATALOGUE.map((entry) => {
        const result = scoreExperience(
          {
            ...entry,
            estimatedMinutes: entry.durationMinutes,
            type: "questions",
          },
          filters,
          avoidThemes,
        );
        return result
          ? {
              ...result,
              category: entry.category,
              emoji: entry.emoji,
              source: "ai" as const,
              mood: entry.mood,
            }
          : null;
      })
        .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
        .sort((a, b) => b.score - a.score)
        .slice(0, 6);

      const fallbackCards = AI_CARDS.filter((card) => {
        if (filters.level === "leger" && card.depth === "profond") return false;
        if (avoidThemes.some((theme) => card.themes.includes(theme))) return false;
        if (
          filters.exclusions.some((exclusion) =>
            card.themes.includes(exclusion),
          )
        ) {
          return false;
        }
        return true;
      })
        .slice(0, 4)
        .map((card) => ({
          id: card.id,
          prompt: card.prompt,
          category: card.category,
          depth: card.depth,
          experienceTitle: card.experienceTitle,
          reason: "Une carte à piocher, proposée par DuoPlay AI.",
        }));

      return {
        blocked: false as const,
        filters,
        experiences: scoredFallback.map((entry) => ({
          slug: entry.item.slug,
          title: entry.item.title,
          description: entry.item.description,
          emoji: entry.emoji,
          category: entry.category,
          durationMinutes: entry.item.durationMinutes,
          depth: entry.item.depth,
          themes: entry.item.themes,
          mood: entry.mood,
          source: entry.source,
          reasons: entry.reasons.slice(0, 3),
        })),
        journeys: [],
        cards: fallbackCards,
      };
    }

    const scored = [];
    for (const experience of experiences) {
      const category = await ctx.db.get(experience.categoryId);
      if (!category || category.status !== "published") continue;
      const result = scoreExperience(
        experience,
        filters,
        avoidThemes,
        category.title,
      );
      if (result) {
        scored.push({
          ...result,
          category: category.title,
          emoji: category.emoji,
        });
      }
    }
    scored.sort((a, b) => b.score - a.score);
    const topExperiences = scored.slice(0, 6);

    const cards = [];
    for (const entry of topExperiences.slice(0, 4)) {
      const rows = await ctx.db
        .query("cards")
        .withIndex("by_experience", (q) =>
          q.eq("experienceId", entry.item._id),
        )
        .take(6);
      for (const card of rows) {
        if (card.status !== "published") continue;
        if (filters.level === "leger" && card.depth === "profond") continue;
        const text = `${card.prompt} ${card.tags.join(" ")}`.toLowerCase();
        if (filters.exclusions.includes("photo") && /photo|selfie/.test(text)) {
          continue;
        }
        if (filters.exclusions.includes("video") && /vid[ée]o|film/.test(text)) {
          continue;
        }
        cards.push({
          id: card._id,
          prompt: card.prompt,
          category: card.category,
          depth: card.depth,
          experienceTitle: entry.item.title,
          reason: "Une carte issue d’une expérience qui correspond à votre demande.",
        });
        if (cards.length >= 4) break;
      }
      if (cards.length >= 4) break;
    }

    const journeyRows = await ctx.db
      .query("journeys")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .take(30);

    const journeys = journeyRows
      .filter((journey) => {
        const text =
          `${journey.title} ${journey.tagline} ${journey.description}`.toLowerCase();
        if (avoidThemes.some((theme) => text.includes(theme))) return false;
        if (filters.keywords.length === 0) return true;
        return filters.keywords.some((word) => text.includes(word));
      })
      .slice(0, 3)
      .map((journey) => ({
        slug: journey.slug,
        title: journey.title,
        tagline: journey.tagline,
        emoji: journey.emoji,
        lengthDays: journey.lengthDays,
        reason:
          filters.themes.length > 0
            ? `Un parcours autour de ${filters.themes.join(", ")}.`
            : "Un parcours à découvrir sur plusieurs jours.",
      }));

    return {
      blocked: false as const,
      filters,
      experiences: topExperiences.map((entry) => ({
        slug: entry.item.slug,
        title: entry.item.title,
        description: entry.item.description,
        emoji: entry.emoji,
        category: entry.category,
        durationMinutes: entry.item.estimatedMinutes,
        depth: entry.item.depth,
        themes: entry.item.themes,
        mood: undefined,
        source: "catalogue" as const,
        reasons: entry.reasons.slice(0, 3),
      })),
      journeys,
      cards,
    };
  },
});

/* ------------------------------------------------------------------ */
/* Assistant de communication                                          */
/* ------------------------------------------------------------------ */

export const communication = mutation({
  args: {
    deviceToken: v.string(),
    intent: v.union(
      v.literal("envie"),
      v.literal("limite"),
      v.literal("attention"),
      v.literal("malaise"),
      v.literal("desir"),
      v.literal("temps"),
      v.literal("experience"),
    ),
    tone: v.union(
      v.literal("doux"),
      v.literal("direct"),
      v.literal("romantique"),
      v.literal("simple"),
      v.literal("humoristique"),
      v.literal("court"),
      v.literal("face-a-face"),
    ),
  },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const enabled = await flagEnabled(ctx, FLAG_ENABLED, true);
    const killSwitch = await flagEnabled(ctx, FLAG_KILL_SWITCH, false);
    if (!enabled || killSwitch) {
      return {
        ok: false as const,
        reason: "indisponible" as const,
        message:
          "DuoPlay AI se repose un instant. Vous pouvez réessayer plus tard.",
      };
    }

    const consent = await getConsentRow(ctx, deviceToken);
    if (!consent?.granted) {
      return {
        ok: false as const,
        reason: "consentement" as const,
        message:
          "Activez DuoPlay AI pour préparer une formulation. Rien n’est généré sans votre accord.",
      };
    }

    const draft = draftCommunication(
      args.intent as CommIntent,
      args.tone as CommTone,
    );
    await logEvent(ctx, deviceToken, "communication", "generate");
    return { ok: true as const, draft };
  },
});

/* ------------------------------------------------------------------ */
/* Administration                                                      */
/* ------------------------------------------------------------------ */

export const adminOverview = query({
  args: { adminKey: v.string() },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);

    const [sessions, events, safety, flags, usageRows, dismissals] =
      await Promise.all([
        ctx.db.query("aiSessions").take(500),
        ctx.db.query("aiEvents").take(500),
        ctx.db.query("aiSafetyEvents").order("desc").take(50),
        ctx.db.query("aiFeatureFlags").take(20),
        ctx.db.query("aiUsageDaily").take(500),
        ctx.db.query("aiRecommendationDismissals").take(200),
      ]);

    const visible = sessions.filter((row) => row.status !== "deleted");
    const totalUsage = usageRows.reduce(
      (acc, row) => ({
        generations: acc.generations + row.generations,
        accepted: acc.accepted + row.accepted,
        skipped: acc.skipped + row.skipped,
        paused: acc.paused + row.paused,
        completed: acc.completed + row.completed,
      }),
      { generations: 0, accepted: 0, skipped: 0, paused: 0, completed: 0 },
    );

    const actions = events.reduce<Record<string, number>>((acc, event) => {
      acc[event.action] = (acc[event.action] ?? 0) + 1;
      return acc;
    }, {});

    return {
      version: AI_VERSION,
      flag: {
        enabled:
          flags.find((row) => row.key === FLAG_ENABLED)?.enabled ?? true,
        killSwitch:
          flags.find((row) => row.key === FLAG_KILL_SWITCH)?.enabled ?? false,
      },
      counters: {
        sessions: visible.length,
        active: visible.filter((row) => row.status === "active").length,
        completed: visible.filter((row) => row.status === "completed").length,
        deleted: sessions.filter((row) => row.status === "deleted").length,
        safetyEvents: safety.length,
        dismissals: dismissals.length,
      },
      usage: totalUsage,
      quality: {
        acceptRate:
          totalUsage.generations > 0
            ? Math.round((totalUsage.accepted / totalUsage.generations) * 100)
            : 0,
        skipRate:
          totalUsage.generations > 0
            ? Math.round((totalUsage.skipped / totalUsage.generations) * 100)
            : 0,
        completionRate:
          totalUsage.generations > 0
            ? Math.round((totalUsage.completed / totalUsage.generations) * 100)
            : 0,
        estimatedCostEur: Number((totalUsage.generations * 0.004).toFixed(2)),
      },
      actions,
      safety: safety.map((row) => ({
        id: row._id,
        category: row.category,
        severity: row.severity,
        action: row.action,
        createdAt: row.createdAt,
      })),
      flags,
      recent: visible.slice(0, 10).map((row) => ({
        id: row._id,
        mood: row.mood,
        level: row.level,
        mode: row.mode,
        durationMinutes: row.durationMinutes,
        status: row.status,
        source: row.source,
        createdAt: row.createdAt,
      })),
    };
  },
});

export const setFeatureFlag = mutation({
  args: {
    adminKey: v.string(),
    key: v.union(
      v.literal("duoplay_ai"),
      v.literal("ai_kill_switch"),
      v.literal("ai_communication"),
    ),
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const existing = await ctx.db
      .query("aiFeatureFlags")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { enabled: args.enabled, updatedAt: now });
    } else {
      await ctx.db.insert("aiFeatureFlags", {
        key: args.key,
        enabled: args.enabled,
        updatedAt: now,
      });
    }

    await ctx.db.insert("auditLogs", {
      action: "ai.feature_flag",
      target: { key: args.key },
      adminId: "admin",
      reason: args.enabled ? "activation" : "désactivation",
      metadata: { enabled: args.enabled, version: AI_VERSION },
      createdAt: now,
    });

    return { ok: true as const };
  },
});

/**
 * Purge quotidienne : les sessions non enregistrées expirent après 30 jours.
 * Le contenu est supprimé, pas seulement masqué.
 */
export const purgeExpired = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const rows = await ctx.db
      .query("aiSessions")
      .withIndex("by_expires", (q) => q.lt("expiresAt", now))
      .take(200);

    let deleted = 0;
    for (const row of rows) {
      await ctx.db.delete(row._id);
      deleted += 1;
    }
    return { deleted };
  },
});
