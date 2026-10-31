import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertAdmin } from "./lib/admin";

/**
 * Roue du hasard (§3) — des gages courts à relever dans l'instant.
 *
 * Le tirage vit côté client : `pool` renvoie tout le contenu publié, la roue
 * en mélange un jeu à chaque tour et désigne un gage. Aucun aléa serveur dans
 * une query (elle serait rejouée) : la stabilité du résultat vient du client.
 */

type Intensity = "leger" | "moyen" | "profond";

const GAGES: Array<{
  text: string;
  intensity: Intensity;
  theme?: string;
}> = [
  /* ---------------------------------------------------------------- */
  /* Léger                                                             */
  /* ---------------------------------------------------------------- */
  {
    text: "Imitez la façon dont l'autre dit bonjour au réveil.",
    intensity: "leger",
    theme: "humour",
  },
  {
    text: "Chuchotez un compliment inattendu, en cinq mots.",
    intensity: "leger",
    theme: "tendresse",
  },
  {
    text: "Racontez le pire jeu de mots que vous connaissiez — l'autre doit rire.",
    intensity: "leger",
    theme: "humour",
  },
  {
    text: "Décrivez de mémoire la tenue que porte l'autre, sans regarder.",
    intensity: "leger",
    theme: "decouverte",
  },
  /* ---------------------------------------------------------------- */
  /* Moyen                                                             */
  /* ---------------------------------------------------------------- */
  {
    text: "Dites trois choses que vous aimez chez l'autre, une par inspiration.",
    intensity: "moyen",
    theme: "tendresse",
  },
  {
    text: "Racontez un souvenir précis de votre premier mois ensemble.",
    intensity: "moyen",
    theme: "souvenirs",
  },
  {
    text: "Décrivez l'autre par un seul parfum, puis expliquez pourquoi.",
    intensity: "moyen",
    theme: "decouverte",
  },
  {
    text: "Reproduisez votre premier fou rire ensemble.",
    intensity: "moyen",
    theme: "souvenirs",
  },
  {
    text: "Donnez un surnom secret à l'autre et racontez ce qu'il évoque.",
    intensity: "moyen",
    theme: "tendresse",
  },
  {
    text: "Racontez quelque chose que l'autre ne sait pas que vous avez remarqué.",
    intensity: "moyen",
    theme: "decouverte",
  },
  {
    text: "Décrivez votre rendez-vous idéal, en trente secondes.",
    intensity: "moyen",
    theme: "avenir",
  },
  /* ---------------------------------------------------------------- */
  /* Profond                                                           */
  /* ---------------------------------------------------------------- */
  {
    text: "Racontez le moment où vous avez su que c'était l'autre.",
    intensity: "profond",
    theme: "souvenirs",
  },
  {
    text: "Dites ce que vous aimeriez faire à deux dans dix ans.",
    intensity: "profond",
    theme: "avenir",
  },
  {
    text: "Décrivez comment vous voulez vieillir, côte à côte.",
    intensity: "profond",
    theme: "avenir",
  },
  {
    text: "Faites une déclaration en cinq mots, pas un de plus.",
    intensity: "profond",
    theme: "tendresse",
  },
  {
    text: "Dites merci pour quelque chose de précis, en regardant l'autre.",
    intensity: "profond",
    theme: "tendresse",
  },
];

/** Tous les gages publiés, dans l'ordre éditorial (jeu stable pour la roue). */
export const pool = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db
      .query("forfeits")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();
    return items.sort((a, b) => a.order - b.order);
  },
});

/** Nombre de gages publiés (utilisé par les tests et l'état vide). */
export const count = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db
      .query("forfeits")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();
    return items.length;
  },
});

/** Seed idempotent : les gages sont identifiés par leur texte. */
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    let created = 0;
    let updated = 0;

    const existing = await ctx.db
      .query("forfeits")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();

    for (let i = 0; i < GAGES.length; i += 1) {
      const gage = GAGES[i];
      const match = existing.find((row) => row.text === gage.text);
      const doc = {
        text: gage.text,
        intensity: gage.intensity,
        theme: gage.theme,
        order: i + 1,
        status: "published" as const,
      };
      if (match) {
        await ctx.db.patch(match._id, doc);
        updated += 1;
      } else {
        await ctx.db.insert("forfeits", doc);
        created += 1;
      }
    }

    return { created, updated, total: GAGES.length };
  },
});

/* ------------------------------------------------------------------ */
/* Administration                                                      */
/* ------------------------------------------------------------------ */

export const adminSetStatus = mutation({
  args: {
    adminKey: v.string(),
    id: v.id("forfeits"),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived"),
    ),
  },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    await ctx.db.patch(args.id, { status: args.status });
  },
});
