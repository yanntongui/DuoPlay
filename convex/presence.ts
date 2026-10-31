import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { findCoupleForDevice } from "./couples";
import { assertAdmin } from "./lib/admin";
import { cleanDeviceToken } from "./lib/identity";

/**
 * Présence du partenaire (§3.B).
 *
 * Le bandeau « Clara est là » s'appuyait sur la seule connectivité **locale** :
 * il annonçait la présence du partenaire dès qu'une partie était liée et que
 * *notre* appareil était en ligne — un faux signal. Ici, la vérité vient du
 * serveur : chaque appareil pose un **battement de cœur**, et l'autre n'affiche
 * « est là » que si ce battement est récent.
 *
 * Deux seuils, volontairement généreux (le réseau est parfois capricieux) :
 *  - « est là » tant que le battement a moins de `ONLINE_WINDOW_MS` ;
 *  - au-delà, on dit simplement depuis combien de temps il a été vu ;
 *  - jamais vu, ou aucun partenaire lié : état neutre, sans inventer.
 */

/** Fenêtre pendant laquelle un appareil est considéré comme présent. */
const ONLINE_WINDOW_MS = 2 * 60 * 1000;
/** On n'écrit pas en base plus d'une fois toutes les 40 s. */
const HEARTBEAT_THROTTLE_MS = 40 * 1000;

/**
 * Battement de cœur de l'appareil appelant. Idempotent et silencieux : on
 * n'écrit que si le dernier battement commence à dater, pour ne pas inonder la
 * base à chaque rendu.
 */
export const heartbeat = mutation({
  args: { deviceToken: v.string() },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const now = Date.now();

    const existing = await ctx.db
      .query("presence")
      .withIndex("by_device", (q) => q.eq("deviceToken", deviceToken))
      .unique();

    if (existing && now - existing.lastSeenAt < HEARTBEAT_THROTTLE_MS) {
      return { ok: true, tracked: false };
    }
    if (existing) {
      await ctx.db.patch(existing._id, { lastSeenAt: now });
    } else {
      await ctx.db.insert("presence", { deviceToken, lastSeenAt: now });
    }

    // Un compte léger, s'il existe, garde aussi sa propre trace de présence —
    // c'est elle qui suit l'utilisateur d'un appareil à l'autre.
    const account = await ctx.db
      .query("accounts")
      .withIndex("by_device", (q) => q.eq("primaryDeviceToken", deviceToken))
      .unique();
    if (account) {
      await ctx.db.patch(account._id, { lastSeenAt: now });
    } else {
      const link = await ctx.db
        .query("accountDevices")
        .withIndex("by_device", (q) => q.eq("deviceToken", deviceToken))
        .unique();
      const linked = link ? await ctx.db.get(link.accountId) : null;
      if (linked) await ctx.db.patch(linked._id, { lastSeenAt: now });
    }

    return { ok: true, tracked: true };
  },
});

/**
 * État du partenaire pour cet appareil : son prénom, l'instant de son dernier
 * battement (ou `null` s'il n'a jamais été vu) et la fenêtre d'« présence ».
 * L'interface décide seule du libellé — le serveur ne ment jamais.
 */
export const partner = query({
  args: { deviceToken: v.string() },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const empty = {
      linked: false,
      name: null,
      lastSeenAt: null,
      onlineWindowMs: ONLINE_WINDOW_MS,
    };

    const couple = await findCoupleForDevice(ctx, deviceToken);
    if (!couple || !couple.deviceB) return empty;

    const isA = couple.deviceA === deviceToken;
    const partnerDevice = isA ? couple.deviceB : couple.deviceA;
    if (partnerDevice === deviceToken) return empty;

    const row = await ctx.db
      .query("presence")
      .withIndex("by_device", (q) => q.eq("deviceToken", partnerDevice))
      .unique();

    return {
      linked: true,
      name: (isA ? couple.nameB : couple.nameA) ?? null,
      lastSeenAt: row?.lastSeenAt ?? null,
      onlineWindowMs: ONLINE_WINDOW_MS,
    };
  },
});

/**
 * Outil d'exploitation et de test : vieillit (ou pose) le battement de cœur
 * d'un appareil, pour vérifier les états « vu il y a … » / « hors ligne » sans
 * attendre. Réservé à la clé serveur.
 */
export const touchForOps = mutation({
  args: { adminKey: v.string(), deviceToken: v.string(), at: v.number() },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const existing = await ctx.db
      .query("presence")
      .withIndex("by_device", (q) => q.eq("deviceToken", deviceToken))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { lastSeenAt: args.at });
      return { ok: true, patched: true };
    }
    await ctx.db.insert("presence", { deviceToken, lastSeenAt: args.at });
    return { ok: true, patched: false };
  },
});

/**
 * Outil d'exploitation et de test : lit le battement de cœur d'un appareil
 * (ce que le client ne peut jamais lire d'un tiers). Réservé à la clé serveur.
 */
export const readForOps = query({
  args: { adminKey: v.string(), deviceToken: v.string() },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const row = await ctx.db
      .query("presence")
      .withIndex("by_device", (q) => q.eq("deviceToken", deviceToken))
      .unique();
    return { lastSeenAt: row?.lastSeenAt ?? null };
  },
});
