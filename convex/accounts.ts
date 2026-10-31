import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { findCoupleForDevice } from "./couples";
import { logEvent } from "./lib/events";
import { cleanDeviceToken } from "./lib/identity";

/**
 * Compte léger (cf. PRD §12, §14.1 — Phase 6).
 *
 * Un compte fédère **plusieurs appareils** autour d'un `primaryDeviceToken` :
 * « Notre espace » (historique, favoris, couple, parcours) suit alors
 * l'utilisateur d'un appareil à l'autre, sans jamais exiger d'inscription pour
 * jouer. Le `recoveryCode` est le seul secret de reconnexion ; il est affiché
 * une fois à la création puis peut être recopié depuis « Mon profil ».
 *
 * Tant qu'aucun fournisseur e-mail/SMS n'est branché, le contact est
 * **déclaratif** (non vérifié) : il prépare la ré-engagement (§14) sans
 * prétendre sécuriser l'identité. Le code de récupération, lui, est un vrai
 * secret aléatoire.
 */

const contactKind = v.union(
  v.literal("email"),
  v.literal("phone"),
  v.literal("none"),
);

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function makeRecoveryCode(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < 12; i += 1) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
    if (i === 3 || i === 7) out += "-";
  }
  return out;
}

function normalizeContact(
  kind: "email" | "phone" | "none",
  raw: string,
): string {
  if (kind === "none") return "";
  if (kind === "phone") {
    return raw.replace(/[^\d+]/g, "").slice(0, 20);
  }
  return raw.trim().toLowerCase().slice(0, 160);
}

/**
 * Rattache les données d'un appareil au `primaryDeviceToken` du compte : les
 * parties, favoris, parcours et défis déjà joués depuis ce second appareil
 * rejoignent l'espace du compte. Idempotent (sans effet si déjà fusionné).
 */
async function mergeDevice(
  ctx: MutationCtx,
  from: string,
  to: string,
): Promise<void> {
  if (from === to) return;

  const players = await ctx.db
    .query("sessionPlayers")
    .withIndex("by_device", (q) => q.eq("deviceToken", from))
    .collect();
  for (const row of players) await ctx.db.patch(row._id, { deviceToken: to });

  const favorites = await ctx.db
    .query("favorites")
    .withIndex("by_device", (q) => q.eq("deviceToken", from))
    .collect();
  for (const row of favorites) await ctx.db.patch(row._id, { deviceToken: to });

  const progress = await ctx.db
    .query("journeyProgress")
    .withIndex("by_device", (q) => q.eq("deviceToken", from))
    .collect();
  for (const row of progress) await ctx.db.patch(row._id, { deviceToken: to });

  const completions = await ctx.db
    .query("challengeCompletions")
    .withIndex("by_device", (q) => q.eq("deviceToken", from))
    .collect();
  for (const row of completions) await ctx.db.patch(row._id, { deviceToken: to });

  const notifications = await ctx.db
    .query("notifications")
    .withIndex("by_device", (q) => q.eq("deviceToken", from))
    .collect();
  for (const row of notifications) await ctx.db.patch(row._id, { deviceToken: to });

  // Préférences et consentements : on garde la version du compte si elle existe,
  // sinon on déplace celle du nouvel appareil.
  const targetPrefs = await ctx.db
    .query("preferences")
    .withIndex("by_device", (q) => q.eq("deviceToken", to))
    .unique();
  const sourcePrefs = await ctx.db
    .query("preferences")
    .withIndex("by_device", (q) => q.eq("deviceToken", from))
    .unique();
  if (sourcePrefs) {
    if (targetPrefs) await ctx.db.delete(sourcePrefs._id);
    else await ctx.db.patch(sourcePrefs._id, { deviceToken: to });
  }

  const sourceConsent = await ctx.db
    .query("consents")
    .withIndex("by_device", (q) => q.eq("deviceToken", from))
    .unique();
  if (sourceConsent) await ctx.db.delete(sourceConsent._id);
}

export const create = mutation({
  args: {
    deviceToken: v.string(),
    displayName: v.string(),
    contact: v.optional(v.string()),
    contactKind: v.optional(contactKind),
    analyticsConsent: v.boolean(),
    notificationsConsent: v.boolean(),
    verified: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const name = args.displayName.trim().replace(/\s+/g, " ").slice(0, 24);
    if (name.length < 2) throw new Error("Merci d'indiquer un prénom.");

    const kind = args.contactKind ?? "none";
    const contact = normalizeContact(kind, args.contact ?? "");
    if (kind !== "none" && contact.length < 3) {
      throw new Error("Ce contact semble invalide.");
    }

    if (contact) {
      const taken = await ctx.db
        .query("accounts")
        .withIndex("by_contact", (q) => q.eq("contact", contact))
        .unique();
      if (taken) throw new Error("Un compte utilise déjà ce contact.");
    }

    const existing = await ctx.db
      .query("accounts")
      .withIndex("by_device", (q) => q.eq("primaryDeviceToken", deviceToken))
      .unique();
    if (existing) throw new Error("Cet appareil est déjà relié à un compte.");

    const now = Date.now();
    const recoveryCode = makeRecoveryCode();
    const verificationCode = kind !== "none" ? generateVerificationCode() : undefined;
    const accountId = await ctx.db.insert("accounts", {
      displayName: name,
      contact,
      contactKind: kind,
      recoveryCode,
      verificationCode,
      verificationCodeSentAt: kind !== "none" ? now : undefined,
      primaryDeviceToken: deviceToken,
      plan: "free",
      analyticsConsent: args.analyticsConsent,
      notificationsConsent: args.notificationsConsent,
      consentsAt: now,
      createdAt: now,
      updatedAt: now,
      lastSeenAt: now,
    });

    await ctx.db.insert("accountDevices", {
      accountId,
      deviceToken,
      linkedAt: now,
    });

    // Les consentements appareil sont repris (et alignés) sur le compte.
    const consent = await ctx.db
      .query("consents")
      .withIndex("by_device", (q) => q.eq("deviceToken", deviceToken))
      .unique();
    if (consent) {
      await ctx.db.patch(consent._id, {
        analytics: args.analyticsConsent,
        notifications: args.notificationsConsent,
        decidedAt: now,
      });
    } else {
      await ctx.db.insert("consents", {
        deviceToken,
        analytics: args.analyticsConsent,
        notifications: args.notificationsConsent,
        version: 1,
        decidedAt: now,
      });
    }

    await logEvent(ctx, "account_created", now, {
      props: { contactKind: kind },
    });

    return {
      accountId,
      recoveryCode,
      displayName: name,
      primaryDeviceToken: deviceToken,
      verificationCode: args.verified ? undefined : verificationCode,
      verified: args.verified ?? false,
    };
  },
});

export const signIn = mutation({
  args: { deviceToken: v.string(), recoveryCode: v.string() },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const code = args.recoveryCode.trim().toUpperCase();
    if (code.length < 8) throw new Error("Code de récupération invalide.");

    const account = await ctx.db
      .query("accounts")
      .withIndex("by_recovery", (q) => q.eq("recoveryCode", code))
      .unique();
    if (!account) throw new Error("Code de récupération invalide.");

    const primary = account.primaryDeviceToken;
    if (deviceToken !== primary) {
      await mergeDevice(ctx, deviceToken, primary);
      const link = await ctx.db
        .query("accountDevices")
        .withIndex("by_device", (q) => q.eq("deviceToken", deviceToken))
        .unique();
      if (!link) {
        await ctx.db.insert("accountDevices", {
          accountId: account._id,
          deviceToken,
          linkedAt: Date.now(),
        });
      }
    }

    await ctx.db.patch(account._id, { lastSeenAt: Date.now() });

    return {
      accountId: account._id,
      displayName: account.displayName,
      primaryDeviceToken: primary,
      recoveryCode: account.recoveryCode,
      analyticsConsent: account.analyticsConsent,
      notificationsConsent: account.notificationsConsent,
    };
  },
});

/** Verify contact email/phone */
export const verifyContact = mutation({
  args: { deviceToken: v.string(), code: v.string() },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const code = args.code.trim();

    const account = await ctx.db
      .query("accounts")
      .withIndex("by_device", (q) => q.eq("primaryDeviceToken", deviceToken))
      .unique();

    if (!account) throw new Error("Aucun compte trouvé.");
    if (account.contactKind === "none") throw new Error("Aucun contact à vérifier.");

    if (account.verificationCode !== code) {
      throw new Error("Code de vérification invalide.");
    }

    if (!account.verificationCodeSentAt) {
      throw new Error("Code expiré. Demande une nouvelle vérification.");
    }

    const sentAt = account.verificationCodeSentAt;
    const now = Date.now();
    if (now - sentAt > 15 * 60 * 1000) {
      await ctx.db.patch(account._id, {
        verificationCode: undefined,
        verificationCodeSentAt: undefined,
      });
      throw new Error("Code expiré. Demande une nouvelle vérification.");
    }

    await ctx.db.patch(account._id, {
      verificationCode: undefined,
      verificationCodeSentAt: undefined,
      updatedAt: now,
    });

    return { success: true };
  },
});

export const resendVerificationCode = mutation({
  args: { deviceToken: v.string() },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const account = await ctx.db
      .query("accounts")
      .withIndex("by_device", (q) => q.eq("primaryDeviceToken", deviceToken))
      .unique();

    if (!account) throw new Error("Aucun compte trouvé.");
    if (account.contactKind === "none") throw new Error("Aucun contact à vérifier.");
    if (!account.contact) throw new Error("Aucun contact enregistré.");

    const verificationCode = generateVerificationCode();
    const now = Date.now();
    await ctx.db.patch(account._id, {
      verificationCode,
      verificationCodeSentAt: now,
      updatedAt: now,
    });

    return {
      code: verificationCode,
      contact: account.contact,
    };
  },
});

/** Compte rattaché à cet appareil (directement ou via un appareil lié). */
export const mine = query({
  args: { deviceToken: v.string() },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);

    let account = await ctx.db
      .query("accounts")
      .withIndex("by_device", (q) => q.eq("primaryDeviceToken", deviceToken))
      .unique();

    if (!account) {
      const link = await ctx.db
        .query("accountDevices")
        .withIndex("by_device", (q) => q.eq("deviceToken", deviceToken))
        .unique();
      if (link) account = await ctx.db.get(link.accountId);
    }
    if (!account) return null;

    return {
      accountId: account._id,
      displayName: account.displayName,
      contactKind: account.contactKind,
      primaryDeviceToken: account.primaryDeviceToken,
      analyticsConsent: account.analyticsConsent,
      notificationsConsent: account.notificationsConsent,
      since: account.createdAt,
    };
  },
});

/** Renommer son partenaire (cf. PRD §12.4). */
export const renamePartner = mutation({
  args: { deviceToken: v.string(), partnerName: v.string() },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const name = args.partnerName.trim().replace(/\s+/g, " ").slice(0, 24);
    if (name.length < 2) throw new Error("Merci d'indiquer un prénom.");

    const couple = await findCoupleForDevice(ctx, deviceToken);
    if (!couple) throw new Error("Aucun couple à renommer pour l'instant.");

    const iAmA = couple.deviceA === deviceToken;
    await ctx.db.patch(couple._id, {
      ...(iAmA ? { nameB: name } : { nameA: name }),
      lastActivityAt: Date.now(),
    });
    return { ok: true };
  },
});

/**
 * Dissolution du couple (cf. PRD §12.3) : les parties privées partagées
 * cessent d'être mises en avant ; chacun garde ses propres réponses.
 */
export const dissolve = mutation({
  args: { deviceToken: v.string() },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const couple = await findCoupleForDevice(ctx, deviceToken);
    if (!couple) return { ok: true, dissolved: false };

    const now = Date.now();
    await ctx.db.patch(couple._id, {
      status: "dissous",
      dissolvedAt: now,
      lastActivityAt: now,
    });
    return { ok: true, dissolved: true };
  },
});

/** Mise à jour des consentements depuis « Mon profil ». */
export const updateConsents = mutation({
  args: {
    deviceToken: v.string(),
    analytics: v.boolean(),
    notifications: v.boolean(),
  },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const now = Date.now();

    const account = await ctx.db
      .query("accounts")
      .withIndex("by_device", (q) => q.eq("primaryDeviceToken", deviceToken))
      .unique();
    if (!account) throw new Error("Aucun compte pour cet appareil.");

    await ctx.db.patch(account._id, {
      analyticsConsent: args.analytics,
      notificationsConsent: args.notifications,
      consentsAt: now,
      updatedAt: now,
    });

    const consent = await ctx.db
      .query("consents")
      .withIndex("by_device", (q) => q.eq("deviceToken", deviceToken))
      .unique();
    if (consent) {
      await ctx.db.patch(consent._id, {
        analytics: args.analytics,
        notifications: args.notifications,
        decidedAt: now,
      });
    }

    return { ok: true };
  },
});

/** Dissocier cet appareil du compte — le compte et ses données subsistent. */
export const unlink = mutation({
  args: { deviceToken: v.string() },
  handler: async (ctx, args) => {
    const deviceToken = cleanDeviceToken(args.deviceToken);
    const link = await ctx.db
      .query("accountDevices")
      .withIndex("by_device", (q) => q.eq("deviceToken", deviceToken))
      .unique();
    if (link) await ctx.db.delete(link._id);
    return { ok: true };
  },
});
