import { internalMutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { CATALOGUE } from "./data/catalogue";

/**
 * Réamorçage idempotent du catalogue éditorial.
 *
 * Les univers, expériences, questions et parcours sont référencés par slug
 * (ou par jour pour les parcours), jamais par identifiant technique : la
 * fonction peut être relancée sans créer de doublons et sans casser les
 * références existantes.
 *
 * Utilisation :
 *   npx convex run seed:seedCatalogue
 */
export const seedCatalogue = internalMutation({
  args: {},
  handler: async (ctx) => {
    const counts = {
      categories: { created: 0, updated: 0 },
      experiences: { created: 0, updated: 0 },
      questions: { created: 0, updated: 0, deleted: 0 },
      journeys: { created: 0, updated: 0 },
      journeySteps: { created: 0, updated: 0, deleted: 0 },
    };

    /* -------------------------------------------------------------- */
    /* Univers                                                         */
    /* -------------------------------------------------------------- */
    const categoryIdBySlug = new Map<string, Id<"categories">>();

    for (const category of CATALOGUE.categories) {
      const existing = await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", category.slug))
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, category);
        categoryIdBySlug.set(category.slug, existing._id);
        counts.categories.updated += 1;
      } else {
        const id = await ctx.db.insert("categories", category);
        categoryIdBySlug.set(category.slug, id);
        counts.categories.created += 1;
      }
    }

    /* -------------------------------------------------------------- */
    /* Expériences                                                     */
    /* -------------------------------------------------------------- */
    const experienceIdBySlug = new Map<string, Id<"experiences">>();

    for (const experience of CATALOGUE.experiences) {
      const categoryId = categoryIdBySlug.get(experience.categorySlug);
      if (!categoryId) continue;

      const { categorySlug: _categorySlug, ...fields } = experience;
      const existing = await ctx.db
        .query("experiences")
        .withIndex("by_slug", (q) => q.eq("slug", experience.slug))
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, { ...fields, categoryId });
        experienceIdBySlug.set(experience.slug, existing._id);
        counts.experiences.updated += 1;
      } else {
        const id = await ctx.db.insert("experiences", { ...fields, categoryId });
        experienceIdBySlug.set(experience.slug, id);
        counts.experiences.created += 1;
      }
    }

    /* -------------------------------------------------------------- */
    /* Questions                                                       */
    /* -------------------------------------------------------------- */
    const questionsByExperience = new Map<string, typeof CATALOGUE.questions>();
    for (const question of CATALOGUE.questions) {
      const list = questionsByExperience.get(question.experienceSlug) ?? [];
      list.push(question);
      questionsByExperience.set(question.experienceSlug, list);
    }

    for (const [experienceSlug, questions] of questionsByExperience) {
      const experienceId = experienceIdBySlug.get(experienceSlug);
      if (!experienceId) continue;

      const existing = await ctx.db
        .query("questions")
        .withIndex("by_experience", (q) => q.eq("experienceId", experienceId))
        .collect();
      const byOrder = new Map(existing.map((question) => [question.order, question]));
      const seededOrders = new Set(questions.map((question) => question.order));

      for (const question of questions) {
        const { experienceSlug: _experienceSlug, ...fields } = question;
        const match = byOrder.get(question.order);
        if (match) {
          await ctx.db.patch(match._id, { ...fields, experienceId });
          counts.questions.updated += 1;
        } else {
          await ctx.db.insert("questions", { ...fields, experienceId });
          counts.questions.created += 1;
        }
      }

      for (const question of existing) {
        if (!seededOrders.has(question.order)) {
          await ctx.db.delete(question._id);
          counts.questions.deleted += 1;
        }
      }
    }

    /* -------------------------------------------------------------- */
    /* Parcours                                                        */
    /* -------------------------------------------------------------- */
    const journeyIdBySlug = new Map<string, Id<"journeys">>();

    for (const journey of CATALOGUE.journeys) {
      const existing = await ctx.db
        .query("journeys")
        .withIndex("by_slug", (q) => q.eq("slug", journey.slug))
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, journey);
        journeyIdBySlug.set(journey.slug, existing._id);
        counts.journeys.updated += 1;
      } else {
        const id = await ctx.db.insert("journeys", journey);
        journeyIdBySlug.set(journey.slug, id);
        counts.journeys.created += 1;
      }
    }

    const stepsByJourney = new Map<string, typeof CATALOGUE.journeySteps>();
    for (const step of CATALOGUE.journeySteps) {
      const list = stepsByJourney.get(step.journeySlug) ?? [];
      list.push(step);
      stepsByJourney.set(step.journeySlug, list);
    }

    for (const [journeySlug, steps] of stepsByJourney) {
      const journeyId = journeyIdBySlug.get(journeySlug);
      if (!journeyId) continue;

      const existing = await ctx.db
        .query("journeySteps")
        .withIndex("by_journey", (q) => q.eq("journeyId", journeyId))
        .collect();
      const byDay = new Map(existing.map((step) => [step.dayIndex, step]));
      const seededDays = new Set(steps.map((step) => step.dayIndex));

      for (const step of steps) {
        const experienceId = step.experienceSlug
          ? experienceIdBySlug.get(step.experienceSlug)
          : undefined;
        const { journeySlug: _journeySlug, experienceSlug: _experienceSlug, ...fields } = step;
        const row = {
          ...fields,
          journeyId,
          ...(experienceId ? { experienceId } : {}),
        };

        const match = byDay.get(step.dayIndex);
        if (match) {
          await ctx.db.patch(match._id, row);
          counts.journeySteps.updated += 1;
        } else {
          await ctx.db.insert("journeySteps", row);
          counts.journeySteps.created += 1;
        }
      }

      for (const step of existing) {
        if (!seededDays.has(step.dayIndex)) {
          await ctx.db.delete(step._id);
          counts.journeySteps.deleted += 1;
        }
      }
    }

    return counts;
  },
});
