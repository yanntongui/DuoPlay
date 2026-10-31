import type { UniverseSlug } from "@/lib/content";

/**
 * Personnalisation de l'expérience (cf. docs/PRD.md §3.F, §11.2).
 * Le vocabulaire ici est celui montré au couple ; la logique de filtrage vit
 * côté Convex (`convex/lib/personalization.ts`) pour rester la source unique
 * de vérité.
 */

export type MoodSlug = "rire" | "tendresse" | "decouverte" | "surprise";

export type Mood = {
  slug: MoodSlug;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  emoji: string;
  /** Univers mis en avant pour cette ambiance. */
  universes: UniverseSlug[];
};

export const MOODS: Mood[] = [
  {
    slug: "rire",
    title: "On rit",
    titleEn: "Laughing",
    description: "Léger et spontané.",
    descriptionEn: "Light and spontaneous.",
    emoji: "😄",
    universes: ["eclats-de-rire"],
  },
  {
    slug: "tendresse",
    title: "Tendresse",
    titleEn: "Tenderness",
    description: "Se rapprocher, se dire les choses.",
    descriptionEn: "Getting closer, saying things out loud.",
    emoji: "💗",
    universes: ["coeur-a-coeur", "flirt-et-etincelles"],
  },
  {
    slug: "decouverte",
    title: "Découverte",
    titleEn: "Discovery",
    description: "Apprendre à se connaître encore.",
    descriptionEn: "Getting to know each other again.",
    emoji: "🔎",
    universes: ["coeur-a-coeur", "nos-souvenirs", "notre-avenir"],
  },
  {
    slug: "surprise",
    title: "Surprise",
    titleEn: "Surprise",
    description: "Sortir de l'habitude.",
    descriptionEn: "Breaking the habit.",
    emoji: "✨",
    universes: ["sortons-de-la-routine", "eclats-de-rire"],
  },
];

export function findMood(slug?: string | null): Mood | null {
  if (!slug) return null;
  return MOODS.find((mood) => mood.slug === slug) ?? null;
}

export type DepthSlug = "leger" | "moyen" | "profond";

export type DepthOption = {
  slug: DepthSlug;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
};

/** Profondeur choisie = **plafond** : « léger » ne servira jamais du profond. */
export const DEPTHS: DepthOption[] = [
  {
    slug: "leger",
    title: "Léger",
    titleEn: "Light",
    description: "On rit, sans se prendre la tête.",
    descriptionEn: "We laugh, no overthinking.",
  },
  {
    slug: "moyen",
    title: "Moyen",
    titleEn: "Medium",
    description: "On se découvre, en douceur.",
    descriptionEn: "We discover each other, gently.",
  },
  {
    slug: "profond",
    title: "Profond",
    titleEn: "Deep",
    description: "On va à l'essentiel.",
    descriptionEn: "We get to what matters.",
  },
];

export function depthTitle(slug?: string | null): string {
  return DEPTHS.find((depth) => depth.slug === slug)?.title ?? "Tout";
}

/** Durées offertes (cf. §3.F : 5, 10, 15, 20 minutes et plus). */
export const DURATIONS = [5, 10, 15, 20, 30] as const;

export function clampDuration(minutes: number): number {
  if ((DURATIONS as readonly number[]).includes(minutes)) return minutes;
  return DURATIONS.reduce((best, value) =>
    Math.abs(value - minutes) < Math.abs(best - minutes) ? value : best,
  );
}
