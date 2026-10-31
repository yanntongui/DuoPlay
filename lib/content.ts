import type { Locale } from "@/lib/i18n/store";

export type UniverseSlug =
  | "eclats-de-rire"
  | "coeur-a-coeur"
  | "flirt-et-etincelles"
  | "nos-souvenirs"
  | "sortons-de-la-routine"
  | "notre-avenir"
  | "entre-nous";

export type JourneySlug = "decouverte" | "reconnection" | "aventure";

export type Journey = {
  slug: JourneySlug;
  title: string;
  description: string;
  emoji: string;
  lengthDays: number;
  intensity: "leger" | "moyen" | "profond";
  mvp: boolean;
};

export type Universe = {
  slug: UniverseSlug;
  title: string;
  titleEn: string;
  tagline: string;
  taglineEn: string;
  description: string;
  descriptionEn: string;
  emoji: string;
  /** Couleur d'accent (token Tailwind) */
  accent: "coral" | "lavender" | "graphite";
  /** Présent dès le MVP */
  mvp: boolean;
  /** Durée typique d'une session, en minutes. */
  durationMinutes: number;
  /** Intensité la plus haute atteignable dans cet univers. */
  intensity: "leger" | "moyen" | "profond";
};

export const UNIVERSES: Universe[] = [
  {
    slug: "eclats-de-rire",
    title: "Éclats de rire",
    titleEn: "Roars of laughter",
    tagline: "Rire ensemble",
    taglineEn: "Laughing together",
    description:
      "Des jeux légers pour s'amuser, rire et retrouver de la spontanéité.",
    descriptionEn:
      "Light games to have fun, laugh and find your spontaneity again.",
    emoji: "😄",
    accent: "coral",
    mvp: true,
    durationMinutes: 10,
    intensity: "leger",
  },
  {
    slug: "coeur-a-coeur",
    title: "Cœur à cœur",
    titleEn: "Heart to heart",
    tagline: "Mieux se comprendre",
    taglineEn: "Understanding each other better",
    description:
      "Des expériences pour approfondir les échanges et se redécouvrir.",
    descriptionEn:
      "Experiences to go deeper in conversation and rediscover each other.",
    emoji: "💬",
    accent: "lavender",
    mvp: true,
    durationMinutes: 15,
    intensity: "profond",
  },
  {
    slug: "flirt-et-etincelles",
    title: "Flirt & Étincelles",
    titleEn: "Flirt & Sparks",
    tagline: "Entretenir la tendresse",
    taglineEn: "Keeping the tenderness alive",
    description:
      "Des jeux romantiques et non explicites pour raviver la séduction.",
    descriptionEn:
      "Romantic, non-explicit games to rekindle the spark.",
    emoji: "💗",
    accent: "coral",
    mvp: true,
    durationMinutes: 10,
    intensity: "moyen",
  },
  {
    slug: "nos-souvenirs",
    title: "Nos souvenirs",
    titleEn: "Our memories",
    tagline: "Célébrer son histoire",
    taglineEn: "Celebrating your story",
    description:
      "Des jeux qui mettent en valeur l'histoire commune du couple.",
    descriptionEn:
      "Games that celebrate the story you share as a couple.",
    emoji: "📸",
    accent: "lavender",
    mvp: false,
    durationMinutes: 15,
    intensity: "moyen",
  },
  {
    slug: "sortons-de-la-routine",
    title: "Sortons de la routine",
    titleEn: "Out of the routine",
    tagline: "Passer à l'action",
    taglineEn: "Moving to action",
    description:
      "Des défis qui transforment les jeux numériques en activités réelles.",
    descriptionEn:
      "Challenges that turn digital games into real activities.",
    emoji: "🌿",
    accent: "graphite",
    mvp: true,
    durationMinutes: 20,
    intensity: "moyen",
  },
  {
    slug: "notre-avenir",
    title: "Notre avenir",
    titleEn: "Our future",
    tagline: "Rêver à deux",
    taglineEn: "Dreaming together",
    description:
      "Des activités pour nourrir les projets et les rêves partagés.",
    descriptionEn:
      "Activities to feed your shared plans and dreams.",
    emoji: "✨",
    accent: "lavender",
    mvp: true,
    durationMinutes: 15,
    intensity: "profond",
  },
  {
    slug: "entre-nous",
    title: "Entre nous",
    titleEn: "Between us",
    tagline: "Complicité, romantisme, sensualité",
    taglineEn: "Complicity, romance, sensuality",
    description:
      "Des jeux complices, tendres et sensuels pour les couples adultes consentants.",
    descriptionEn:
      "Complicit, tender and sensual games for consenting adult couples.",
    emoji: "💞",
    accent: "coral",
    mvp: true,
    durationMinutes: 15,
    intensity: "moyen",
  },
];

export const JOURNEYS: Journey[] = [
  {
    slug: "decouverte",
    title: "Découverte",
    description: "Découvrez-vous jour après jour",
    emoji: "🗺️",
    lengthDays: 7,
    intensity: "leger",
    mvp: true,
  },
  {
    slug: "reconnection",
    title: "Reconnexion",
    description: "Retrouvez-vous ensemble",
    emoji: "🔗",
    lengthDays: 14,
    intensity: "moyen",
    mvp: true,
  },
  {
    slug: "aventure",
    title: "Aventure",
    description: "Osez de nouveaux horizons",
    emoji: "🌟",
    lengthDays: 21,
    intensity: "profond",
    mvp: false,
  },
];

export const GAME_MODES = [
  {
    slug: "ensemble",
    title: "Ensemble",
    titleEn: "Together",
    description: "Les deux joueurs jouent en même temps, sur le même moment.",
    descriptionEn: "Both players play at the same time, in the same moment.",
  },
  {
    slug: "a-distance",
    title: "À distance",
    titleEn: "Long distance",
    description: "Chacun depuis son appareil, même dans une autre ville.",
    descriptionEn: "Each on their own device, even in another city.",
  },
  {
    slug: "differe",
    title: "Différé",
    titleEn: "Deferred",
    description: "Un joueur répond, l'autre plus tard. Révélation ensuite.",
    descriptionEn: "One answers, the other later. Then the reveal.",
  },
  {
    slug: "defi-individuel",
    title: "Défi individuel",
    titleEn: "Solo challenge",
    description: "Une mission à réaliser pour son partenaire.",
    descriptionEn: "A mission to carry out for your partner.",
  },
] as const;

/* ------------------------------------------------------------------ */
/* Sélecteurs de langue (§22)                                          */
/* ------------------------------------------------------------------ */

/** Titre d'un mode de jeu dans la langue active. */
export function modeTitle(
  slug: string,
  locale: Locale,
  modes: readonly { slug: string; title: string; titleEn: string }[] = GAME_MODES,
): string {
  const mode = modes.find((item) => item.slug === slug);
  if (!mode) return slug;
  return locale === "en" ? mode.titleEn : mode.title;
}

/** Description d'un mode de jeu dans la langue active. */
export function modeDescription(slug: string, locale: Locale): string {
  const mode = GAME_MODES.find((item) => item.slug === slug);
  if (!mode) return slug;
  return locale === "en" ? mode.descriptionEn : mode.description;
}
