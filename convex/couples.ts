import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { cleanDeviceToken } from "./lib/identity";
import { assertAdmin } from "./lib/admin";

/**
 * Modèle relationnel « couple » (cf. PRD §12).
 *
 * Le couple est créé **implicitement à la première partie commune**. Tant que
 * le compte léger n'existe pas, il relie deux appareils ; `userIdA`/`userIdB`
 * prendront le relais en Phase 6 (passage « temporaire » → « actif »).
 */

export async function findCoupleForDevice(
  ctx: QueryCtx | MutationCtx,
  deviceToken: string,
) {
  const [asA, asB] = await Promise.all([
    ctx.db
      .query("couples")
      .withIndex("by_deviceA", (q) => q.eq("deviceA", deviceToken))
      .collect(),
    ctx.db
      .query("couples")
      .withIndex("by_deviceB", (q) => q.eq("deviceB", deviceToken))
      .collect(),
  ]);

  const active = [...asA, ...asB].filter(
    (couple) => couple.status !== "dissous",
  );
  active.sort((a, b) => b.lastActivityAt - a.lastActivityAt);
  return active[0] ?? null;
}

/**
 * Appareils qui composent le couple de cet appareil : lui-même et, s'il est
 * relié, son partenaire. Sert à partager l'espace commun (journal, favoris…)
 * sans jamais exposer un tiers.
 */
export async function coupleDeviceTokens(
  ctx: QueryCtx | MutationCtx,
  deviceToken: string,
): Promise<string[]> {
  const couple = await findCoupleForDevice(ctx, deviceToken);
  const tokens = new Set<string>([deviceToken]);
  if (couple) {
    tokens.add(couple.deviceA);
    if (couple.deviceB) tokens.add(couple.deviceB);
  }
  return [...tokens];
}

/** Relie deux appareils à la première partie commune (idempotent). */
export async function linkCouplePair(
  ctx: MutationCtx,
  input: {
    deviceA: string;
    nameA: string;
    photoA?: string;
    deviceB: string;
    nameB: string;
    photoB?: string;
  },
): Promise<string | null> {
  const { deviceA, nameA, photoA, deviceB, nameB, photoB } = input;
  if (deviceA === deviceB) return null;

  const [asA, asB] = await Promise.all([
    ctx.db
      .query("couples")
      .withIndex("by_deviceA", (q) => q.eq("deviceA", deviceA))
      .collect(),
    ctx.db
      .query("couples")
      .withIndex("by_deviceB", (q) => q.eq("deviceB", deviceA))
      .collect(),
  ]);

  const existing = [...asA, ...asB].find(
    (couple) =>
      couple.status !== "dissous" &&
      (couple.deviceA === deviceB || couple.deviceB === deviceB),
  );

  const now = Date.now();
  if (existing) {
    await ctx.db.patch(existing._id, {
      nameA,
      nameB,
      photoA,
      photoB,
      lastActivityAt: now,
    });
    return existing._id;
  }

  return await ctx.db.insert("couples", {
    deviceA,
    deviceB,
    nameA,
    nameB,
    photoA,
    photoB,
    status: "temporaire",
    createdAt: now,
    lastActivityAt: now,
  });
}

export const updateSharedMood = mutation({
  args: { 
    coupleId: v.id("couples"),
    mood: v.union(
      v.literal("joyeux"),
      v.literal("curieux"),
      v.literal("calme"),
      v.literal("fatigué"),
      v.literal("romantique")
    )
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.coupleId, { sharedMood: args.mood });
  },
});

export const mine = query({
  args: { deviceToken: v.string() },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const couple = await findCoupleForDevice(ctx, deviceToken);
    if (!couple) return null;

    const iAmA = couple.deviceA === deviceToken;
    const partnerDevice = iAmA ? couple.deviceB : couple.deviceA;

    const playerRows = await ctx.db
      .query("sessionPlayers")
      .withIndex("by_device", (q) => q.eq("deviceToken", deviceToken))
      .collect();

    let answered = 0;
    for (const row of playerRows) {
      const answers = await ctx.db
        .query("answers")
        .withIndex("by_player", (q) => q.eq("playerId", row._id))
        .collect();
      answered += answers.filter((answer) => !answer.skipped).length;
    }

    return {
      id: couple._id,
      status: couple.status,
      since: couple.createdAt,
      lastActivityAt: couple.lastActivityAt,
      me: {
        name: (iAmA ? couple.nameA : couple.nameB) ?? null,
        photo: (iAmA ? couple.photoA : couple.photoB) ?? null,
      },
      partner: {
        name: (iAmA ? couple.nameB : couple.nameA) ?? null,
        photo: (iAmA ? couple.photoB : couple.photoA) ?? null,
        linked: Boolean(partnerDevice),
      },
      stats: {
        sessions: new Set(playerRows.map((row) => row.sessionId)).size,
        answered,
      },
    };
  },
});

// ============================================
// Admin Functions for Couples
// ============================================

export const list = query({
  args: {
    page: v.number(),
    pageSize: v.number(),
    status: v.optional(v.union(
      v.literal("temporaire"),
      v.literal("actif"),
      v.literal("dissous"),
    )),
    search: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const { page, pageSize, status, search } = args;

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Accès refusé");
    }
    const access = await ctx.db.query("adminAccess").collect();
    if (!access.some((a: any) => a.userId === identity._id)) {
      throw new Error("Accès refusé");
    }

    let couples = await ctx.db.query("couples").collect();

    if (status) {
      couples = couples.filter((c: any) => c.status === status);
    }

    if (search) {
      const query = search.toLowerCase();
      couples = couples.filter((c: any) =>
        (c.nameA || "").toLowerCase().includes(query) ||
        (c.nameB || "").toLowerCase().includes(query)
      );
    }

    couples.sort((a: any, b: any) => b.lastActivityAt - a.lastActivityAt);

    const totalCount = couples.length;
    const start = page * pageSize;
    const paginated = couples.slice(start, start + pageSize);

    return {
      couples: paginated,
      totalCount,
      page,
      pageSize,
    };
  },
});

export const updateStatus = mutation({
  args: {
    adminKey: v.string(),
    coupleId: v.id("couples"),
    status: v.union(
      v.literal("temporaire"),
      v.literal("actif"),
      v.literal("dissous"),
    ),
  },
  handler: async (ctx: any, args: any) => {
    const { adminKey, coupleId, status } = args;
    await assertAdmin(adminKey);

    const couple = await ctx.db.get(coupleId);
    if (!couple) {
      throw new Error("Couple introuvable");
    }

    await ctx.db.patch(coupleId, {
      status,
      lastActivityAt: Date.now(),
    });
  },
});

export const suspend = mutation({
  args: {
    adminKey: v.string(),
    coupleId: v.id("couples"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const { adminKey, coupleId, reason } = args;
    await assertAdmin(adminKey);

    await ctx.db.insert("auditLogs", {
      action: "couple_suspended",
      target: { coupleId, reason },
      adminId: adminKey,
      createdAt: Date.now(),
    });
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Accès refusé");
    }
    const access = await ctx.db.query("adminAccess").collect();
    if (!access.some((a: any) => a.userId === identity._id)) {
      throw new Error("Accès refusé");
    }

    const all = await ctx.db.query("couples").collect();
    const active = all.filter((c: any) => c.status === "actif").length;
    const pending = all.filter((c: any) => c.status === "temporaire").length;
    const dissolved = all.filter((c: any) => c.status === "dissous").length;

    return {
      total: all.length,
      active,
      pending,
      dissolved,
    };
  },
});
