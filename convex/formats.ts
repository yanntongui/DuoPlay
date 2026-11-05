import { v } from "convex/values";
import { query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { optionalDeviceToken } from "./lib/identity";

/**
 * Catalogue jouable & contenus des quatre formats.
 *
 * Le catalogue est volontairement **dérivé** du contenu éditorial existant :
 * une expérience publiée peut être jouée en DuoCards, DuoDice ou DuoReveal,
 * sans dupliquer 442 questions dans une nouvelle table. DuoPath s'appuie sur
 * les parcours, dont les métadonnées d'ambiance / durée / niveau sont
 * optionnelles pour rester compatible avec les programmes historiques.
 */

const ADULT_CATEGORY = "entre-nous";

function isAdultCategory(slug: string): boolean {
  return slug === ADULT_CATEGORY;
}

function depthRank(depth: string): number {
  if (depth === "profond") return 3;
  if (depth === "moyen") return 2;
  return 1;
}

/** Un parcours est un DuoPath dès qu'il porte les métadonnées éditoriales. */
function isPlayablePath(journey: Doc<"journeys">): boolean {
  return (
    journey.status === "published" &&
    typeof journey.durationMinutes === "number" &&
    journey.lengthDays >= 5 &&
    journey.lengthDays <= 12
  );
}

export const catalogue = query({
  args: { deviceToken: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const deviceToken = optionalDeviceToken(args.deviceToken);

    const categories = (await ctx.db.query("categories").collect())
      .filter((category) => category.status === "published")
      .sort((a, b) => a.order - b.order);
    const categoryById = new Map(categories.map((item) => [item._id, item]));

    const experiences = (await ctx.db.query("experiences").collect())
      .filter((experience) => experience.status === "published")
      .sort((a, b) => a.order - b.order);

    const [questions, cards] = await Promise.all([
      ctx.db.query("questions").collect(),
      ctx.db.query("cards").collect(),
    ]);
    const favorites: Doc<"favorites">[] = deviceToken
      ? await ctx.db
          .query("favorites")
          .withIndex("by_device", (q) => q.eq("deviceToken", deviceToken))
          .collect()
      : [];

    const publishedQuestions = questions.filter(
      (question) => question.status === "published",
    );
    const publishedCards = cards.filter((card) => card.status === "published");
    const favoriteIds = new Set(favorites.map((row) => row.experienceId));

    const experiencesByCategory = new Map<string, typeof experiences>();
    for (const experience of experiences) {
      const list = experiencesByCategory.get(experience.categoryId) ?? [];
      list.push(experience);
      experiencesByCategory.set(experience.categoryId, list);
    }

    const items = experiences
      .map((experience) => {
        const category = categoryById.get(experience.categoryId);
        if (!category) return null;

        const questionCount = publishedQuestions.filter(
          (question) => question.experienceId === experience._id,
        ).length;
        const cardCount = publishedCards.filter(
          (card) => card.experienceId === experience._id,
        ).length;
        const adult = isAdultCategory(category.slug);

        return {
          kind: "experience" as const,
          _id: experience._id,
          slug: experience.slug,
          title: experience.title,
          description: experience.description,
          benefit: experience.description,
          depth: experience.depth,
          depthRank: depthRank(experience.depth),
          themes: experience.themes,
          estimatedMinutes: experience.estimatedMinutes,
          modes: experience.modes,
          type: experience.type,
          adult,
          available: questionCount > 0 || cardCount > 0,
          questionCount,
          cardCount,
          stepCount: questionCount || cardCount,
          players: 2,
          formats: ["cartes", "des", "reveal"] as const,
          category: {
            slug: category.slug,
            title: category.title,
            tagline: category.tagline,
            emoji: category.emoji,
            accent: category.accent,
          },
          favorite: favoriteIds.has(experience._id),
          progress: null,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    const journeys = (await ctx.db.query("journeys").collect())
      .filter(isPlayablePath)
      .sort((a, b) => a.order - b.order);

    const paths = await Promise.all(
      journeys.map(async (journey) => {
        const steps = (
          await ctx.db
            .query("journeySteps")
            .withIndex("by_journey", (q) => q.eq("journeyId", journey._id))
            .collect()
        ).sort((a, b) => a.dayIndex - b.dayIndex);

        const rows = deviceToken
          ? await ctx.db
              .query("journeyProgress")
              .withIndex("by_device_journey", (q) =>
                q.eq("deviceToken", deviceToken).eq("journeyId", journey._id),
              )
              .collect()
          : [];
        const completedDays = [
          ...new Set(rows.flatMap((row) => row.completedDays)),
        ].sort((a, b) => a - b);
        const currentDay =
          steps.find((step) => !completedDays.includes(step.dayIndex))
            ?.dayIndex ?? null;

        return {
          kind: "path" as const,
          _id: journey._id,
          slug: journey.slug,
          title: journey.title,
          description: journey.description,
          benefit: journey.tagline,
          depth: journey.depth ?? "moyen",
          depthRank: depthRank(journey.depth ?? "moyen"),
          themes: ["parcours", journey.ambiance ?? "connexion"],
          estimatedMinutes: journey.durationMinutes ?? 15,
          modes: ["ensemble", "a-distance"] as const,
          type: "parcours" as const,
          adult: (journey.ambiance ?? "").toLowerCase().includes("sensuel"),
          available: steps.length > 0,
          questionCount: steps.length,
          cardCount: 0,
          stepCount: steps.length,
          players: 2,
          formats: ["parcours"] as const,
          category: {
            slug: "parcours",
            title: "Parcours guidés",
            tagline: journey.ambiance ?? "Connexion",
            emoji: journey.emoji,
            accent: "lavender" as const,
          },
          favorite: false,
          ambiance: journey.ambiance ?? "Connexion",
          context: journey.context ?? null,
          conclusion: journey.conclusion ?? null,
          progress: {
            total: steps.length,
            completed: completedDays.length,
            currentDay,
            completedAt:
              completedDays.length >= steps.length ? journey.updatedAt : null,
          },
        };
      }),
    );

    const unavailable = categories
      .filter(
        (category) =>
          (experiencesByCategory.get(category._id) ?? []).length === 0,
      )
      .map((category) => ({
        slug: category.slug,
        title: category.title,
        emoji: category.emoji,
        tagline: category.tagline,
      }));

    return { items, paths, unavailable };
  },
});

/** Contenu complet d'une expérience, pour les moteurs DuoCards / DuoDice. */
export const content = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const experience = await ctx.db
      .query("experiences")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!experience || experience.status !== "published") return null;

    const category = await ctx.db.get(experience.categoryId);
    if (!category) return null;

    const questions = (
      await ctx.db
        .query("questions")
        .withIndex("by_experience", (q) =>
          q.eq("experienceId", experience._id),
        )
        .collect()
    )
      .filter((question) => question.status === "published")
      .sort((a, b) => a.order - b.order);

    const cards = (
      await ctx.db
        .query("cards")
        .withIndex("by_experience", (q) =>
          q.eq("experienceId", experience._id),
        )
        .collect()
    ).filter((card) => card.status === "published");

    return {
      experience: {
        _id: experience._id,
        slug: experience.slug,
        title: experience.title,
        description: experience.description,
        depth: experience.depth,
        themes: experience.themes,
        estimatedMinutes: experience.estimatedMinutes,
        modes: experience.modes,
        type: experience.type,
      },
      category: {
        slug: category.slug,
        title: category.title,
        tagline: category.tagline,
        emoji: category.emoji,
        accent: category.accent,
      },
      adult: isAdultCategory(category.slug),
      questions: questions.map((question) => ({
        _id: question._id,
        kind: question.kind,
        prompt: question.prompt,
        options: question.options ?? null,
        depth: question.depth,
        themes: question.themes,
        order: question.order,
      })),
      cards: cards.map((card) => ({
        _id: card._id,
        category: card.category,
        prompt: card.prompt,
        depth: card.depth,
        tags: card.tags,
        isOptional: card.isOptional,
        order: card.order,
      })),
    };
  },
});
