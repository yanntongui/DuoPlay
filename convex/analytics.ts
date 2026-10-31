import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { optionalDeviceToken } from "./lib/identity";

/**
 * Journal d'événements produit côté client (cf. PRD §19.1).
 *
 * Seuls les événements **exportés par l'interface** sont acceptés : la boucle
 * de jeu, le défi et les parcours sont déjà journalisés côté serveur. Tout est
 * conditionné au **consentement analytics** (§15.6) : sans consentement, rien
 * n'est écrit — jamais de collecte silencieuse.
 */
const ALLOWED = new Set([
  "landing_view",
  "invite_link_shared",
  "invite_opened",
  "game_started",
  "session_resumed",
  "notification_optin",
  "result_card_shared",
]);

export const track = mutation({
  args: {
    name: v.string(),
    deviceToken: v.optional(v.string()),
    props: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    if (!ALLOWED.has(args.name)) {
      return { ok: false, reason: "unknown" as const };
    }

    const deviceToken = optionalDeviceToken(args.deviceToken);
    const consent = deviceToken
      ? await ctx.db
          .query("consents")
          .withIndex("by_device", (q) => q.eq("deviceToken", deviceToken))
          .unique()
      : null;
    const account = deviceToken
      ? await ctx.db
          .query("accounts")
          .withIndex("by_device", (q) => q.eq("primaryDeviceToken", deviceToken))
          .unique()
      : null;

    const allowed = account ? account.analyticsConsent : Boolean(consent?.analytics);
    if (!allowed) return { ok: false, reason: "no-consent" as const };

    await ctx.db.insert("analyticsEvents", {
      name: args.name,
      props: args.props,
      at: Date.now(),
    });
    return { ok: true as const };
  },
});
