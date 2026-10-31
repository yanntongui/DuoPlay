import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertAdmin } from "./lib/admin";
import { matchesPreferences, wantedQuestions } from "./lib/personalization";

const sessionMode = v.union(
  v.literal("ensemble"),
  v.literal("a-distance"),
  v.literal("differe"),
  v.literal("defi-individuel"),
);

const depth = v.union(
  v.literal("leger"),
  v.literal("moyen"),
  v.literal("profond"),
);

const status = v.union(
  v.literal("draft"),
  v.literal("published"),
  v.literal("archived"),
);

/* ------------------------------------------------------------------ */
/* Lecture publique                                                    */
/* ------------------------------------------------------------------ */

export const listByCategory = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("experiences")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();
    return items
      .filter((item) => item.status === "published")
      .sort((a, b) => a.order - b.order);
  },
});

export const bySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("experiences")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

/** Expériences publiées d'un univers + catégorie (lecture publique). */
export const listByCategorySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const category = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!category || category.status !== "published") return null;

    const items = (
      await ctx.db
        .query("experiences")
        .withIndex("by_category", (q) => q.eq("categoryId", category._id))
        .collect()
    )
      .filter((experience) => experience.status === "published")
      .sort((a, b) => a.order - b.order);

    const withCounts = await Promise.all(
      items.map(async (experience) => {
        const questions = await ctx.db
          .query("questions")
          .withIndex("by_experience", (q) =>
            q.eq("experienceId", experience._id),
          )
          .collect();
        const cards = await ctx.db
          .query("cards")
          .withIndex("by_experience", (q) =>
            q.eq("experienceId", experience._id),
          )
          .filter((q) => q.eq(q.field("status"), "published"))
          .collect();
        return {
          ...experience,
          questionCount: questions.filter(
            (question) => question.status === "published",
          ).length,
          cardCount: cards.length,
        };
      }),
    );

    return { category, items: withCounts };
  },
});

/** Une expérience publiée, sa catégorie, ses thèmes et son volume de questions. */
export const publicBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const experience = await ctx.db
      .query("experiences")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!experience || experience.status !== "published") return null;

    const [category, questions, cards] = await Promise.all([
      ctx.db.get(experience.categoryId),
      ctx.db
        .query("questions")
        .withIndex("by_experience", (q) =>
          q.eq("experienceId", experience._id),
        )
        .collect(),
      ctx.db
        .query("cards")
        .withIndex("by_experience", (q) =>
          q.eq("experienceId", experience._id),
        )
        .filter((q) => q.eq(q.field("status"), "published"))
        .collect(),
    ]);

    const published = questions.filter(
      (question) => question.status === "published",
    );

    // Thèmes proposés au couple comme « à éviter » — issus du contenu réel.
    const themes = [...new Set(published.flatMap((question) => question.themes))]
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, "fr"));

    return {
      experience,
      category,
      questionCount: published.length,
      cardCount: cards.length,
      themes,
      depthCounts: {
        leger: published.filter((q) => q.depth === "leger").length,
        moyen: published.filter((q) => q.depth === "moyen").length,
        profond: published.filter((q) => q.depth === "profond").length,
      },
    };
  },
});

/**
 * Aperçu du nombre de questions pour un jeu de préférences donné (cf. §3.F).
 * Source unique de vérité : le formulaire affiche exactement ce que la partie
 * contiendra, sans dupliquer la logique de sélection côté client.
 */
export const preview = query({
  args: {
    slug: v.string(),
    maxDepth: v.optional(depth),
    avoidThemes: v.optional(v.array(v.string())),
    durationMinutes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const experience = await ctx.db
      .query("experiences")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!experience || experience.status !== "published") return null;

    const published = (
      await ctx.db
        .query("questions")
        .withIndex("by_experience", (q) =>
          q.eq("experienceId", experience._id),
        )
        .collect()
    )
      .filter((question) => question.status === "published")
      .sort((a, b) => a.order - b.order);

    const durationMinutes = args.durationMinutes ?? experience.estimatedMinutes;
    const eligible = published.filter((question) =>
      matchesPreferences(question, {
        maxDepth: args.maxDepth,
        avoidThemes: args.avoidThemes,
      }),
    );

    return {
      count: Math.min(eligible.length, wantedQuestions(durationMinutes)),
      available: eligible.length,
      total: published.length,
    };
  },
});

/**
 * Thèmes disponibles pour « à éviter » (cf. §3.F), agrégés sur **tout** le
 * contenu publié — et non plus seulement sur une expérience. Les Paramètres
 * peuvent ainsi proposer la même liste partout, sans dupliquer le catalogue.
 */
export const themes = query({
  args: {},
  handler: async (ctx) => {
    const published = await ctx.db
      .query("questions")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();

    return [...new Set(published.flatMap((question) => question.themes))]
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, "fr"));
  },
});

/* ------------------------------------------------------------------ */
/* Administration                                                      */
/* ------------------------------------------------------------------ */

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("categories").collect();
    const byId = new Map(categories.map((c) => [c._id, c]));
    const items = await ctx.db.query("experiences").collect();

    return items
      .sort((a, b) => a.order - b.order)
      .map((item) => ({
        ...item,
        categoryTitle: byId.get(item.categoryId)?.title ?? "—",
        categorySlug: byId.get(item.categoryId)?.slug ?? "",
      }));
  },
});

export const adminUpsert = mutation({
  args: {
    adminKey: v.string(),
    id: v.optional(v.id("experiences")),
    categoryId: v.id("categories"),
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    depth,
    themes: v.array(v.string()),
    estimatedMinutes: v.number(),
    modes: v.array(sessionMode),
    type: v.union(v.literal("questions"), v.literal("cartes"), v.literal("des"), v.literal("parcours")),
    status,
    order: v.number(),
  },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    const { adminKey: _adminKey, id, ...data } = args;

    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }

    const existing = await ctx.db
      .query("experiences")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    }

    return await ctx.db.insert("experiences", data);
  },
});

export const adminSetStatus = mutation({
  args: { adminKey: v.string(), id: v.id("experiences"), status },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const patchAllWithTypes = mutation({
  args: {},
  handler: async (ctx) => {
    const exps = await ctx.db.query("experiences").collect();
    let updated = 0;
    for (const e of exps) {
      if (!e.type) {
        await ctx.db.patch(e._id, { type: "questions" });
        updated++;
      }
    }
    return { updated };
  },
});
