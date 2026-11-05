/**
 * Les quatre formats de jeu, les filtres « moment » et les aides d'affichage
 * partagées par le catalogue et les écrans de jeu.
 */

export type FormatSlug = "cartes" | "des" | "parcours" | "reveal";

export type FormatDefinition = {
  slug: FormatSlug;
  title: string;
  description: string;
  emoji: string;
  accent: "coral" | "lavender" | "graphite";
};

export const FORMATS: FormatDefinition[] = [
  {
    slug: "cartes",
    title: "DuoCards",
    description: "Une carte à la fois, à votre rythme.",
    emoji: "🃏",
    accent: "coral",
  },
  {
    slug: "des",
    title: "DuoDice",
    description: "Laissez le hasard guider votre prochaine étape.",
    emoji: "🎲",
    accent: "lavender",
  },
  {
    slug: "parcours",
    title: "DuoPath",
    description: "Vivez une expérience complète en plusieurs étapes.",
    emoji: "🧭",
    accent: "lavender",
  },
  {
    slug: "reveal",
    title: "DuoReveal",
    description: "Répondez séparément et découvrez ensemble.",
    emoji: "🫣",
    accent: "coral",
  },
];

export function findFormat(value: string | null | undefined) {
  return FORMATS.find((format) => format.slug === value) ?? null;
}

export function formatTitle(slug: FormatSlug): string {
  return findFormat(slug)?.title ?? "DuoPlay";
}

export function formatRoute(
  format: FormatSlug,
  slug: string,
  mood?: string | null,
): string {
  const suffix = mood ? `?ambiance=${encodeURIComponent(mood)}` : "";
  if (format === "parcours") return `/jouer/parcours/${slug}`;
  if (format === "cartes") return `/jouer/cartes/${slug}${suffix}`;
  if (format === "des") return `/jouer/des/${slug}${suffix}`;
  return `/nouvelle/${slug}${suffix}`;
}

/* ------------------------------------------------------------------ */
/* Filtres « Quel moment vivez-vous ? »                                */
/* ------------------------------------------------------------------ */

export type ContextSlug =
  | "a-deux"
  | "a-distance"
  | "differe"
  | "sans-photo"
  | "sans-video";

export const CONTEXT_FILTERS: Array<{
  slug: ContextSlug;
  label: string;
  emoji: string;
}> = [
  { slug: "a-deux", label: "À deux", emoji: "👥" },
  { slug: "a-distance", label: "À distance", emoji: "🛰️" },
  { slug: "differe", label: "Différé", emoji: "⏳" },
  { slug: "sans-photo", label: "Sans photo", emoji: "🚫" },
  { slug: "sans-video", label: "Sans vidéo", emoji: "📵" },
];

export type MoodFilterSlug =
  | "discussion"
  | "rire"
  | "reconnexion"
  | "souvenir"
  | "routine"
  | "sensuel";

export const MOMENT_FILTERS: Array<{
  slug: MoodFilterSlug;
  label: string;
  emoji: string;
  adult?: boolean;
}> = [
  { slug: "discussion", label: "Discussion", emoji: "💬" },
  { slug: "rire", label: "Rire", emoji: "😄" },
  { slug: "reconnexion", label: "Reconnexion", emoji: "🤍" },
  { slug: "souvenir", label: "Souvenir", emoji: "📷" },
  { slug: "routine", label: "Routine", emoji: "🌿" },
  { slug: "sensuel", label: "Sensuel 18+", emoji: "🔥", adult: true },
];

export const DURATION_FILTERS = [5, 15, 30, 60] as const;

const CONTEXT_MODE: Record<ContextSlug, string> = {
  "a-deux": "ensemble",
  "a-distance": "a-distance",
  differe: "differe",
  "sans-photo": "sans-photo",
  "sans-video": "sans-video",
};

export type MomentState = {
  duration: number | null;
  contexts: ContextSlug[];
  mood: MoodFilterSlug | null;
};

export const EMPTY_MOMENT: MomentState = {
  duration: null,
  contexts: [],
  mood: null,
};

export type CatalogueLike = {
  estimatedMinutes: number;
  modes: readonly string[];
  themes: readonly string[];
  adult: boolean;
  category: { slug: string; title: string };
  depth: string;
  description: string;
  title: string;
};

const PATH_AMBIANCE_MOODS: Record<string, MoodFilterSlug[]> = {
  reconnexion: ["reconnexion"],
  tendre: ["reconnexion"],
  souvenir: ["souvenir"],
  routine: ["routine"],
  "à distance": ["discussion", "reconnexion"],
  aventure: ["discussion", "routine"],
  sensuel: ["sensuel", "reconnexion"],
};

/** Ambiances proposées pour une expérience, sans jamais exposer l'adulte. */
export function moodsFor(item: CatalogueLike): MoodFilterSlug[] {
  const moods = new Set<MoodFilterSlug>();
  const category = item.category.slug;

  if (category === "eclats-de-rire") moods.add("rire");
  if (category === "coeur-a-coeur") moods.add("discussion");
  if (category === "nos-souvenirs") moods.add("souvenir");
  if (category === "sortons-de-la-routine") moods.add("routine");
  if (category === "flirt-et-etincelles") moods.add("reconnexion");
  if (category === "entre-nous") {
    moods.add("reconnexion");
    moods.add("sensuel");
  }
  if (category === "notre-avenir") {
    moods.add("discussion");
    moods.add("reconnexion");
  }
  if (category === "parcours") {
    const ambiance = `${item.category.title} ${item.title} ${item.description}`
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    for (const [key, values] of Object.entries(PATH_AMBIANCE_MOODS)) {
      const normalized = key.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (ambiance.includes(normalized)) {
        for (const value of values) moods.add(value);
      }
    }
  }

  const themes = item.themes.map((theme) => theme.toLowerCase());
  if (themes.some((theme) => theme.includes("humour"))) moods.add("rire");
  if (themes.some((theme) => theme.includes("souvenir"))) moods.add("souvenir");
  if (themes.some((theme) => theme.includes("routine"))) moods.add("routine");
  if (
    themes.some(
      (theme) =>
        theme.includes("tendresse") ||
        theme.includes("séduction") ||
        theme.includes("seduction"),
    )
  ) {
    moods.add("reconnexion");
  }
  if (
    themes.some(
      (theme) =>
        theme.includes("relation") ||
        theme.includes("préférences") ||
        theme.includes("preferences"),
    )
  ) {
    moods.add("discussion");
  }

  if (moods.size === 0) moods.add("discussion");
  if (item.adult) moods.add("sensuel");
  return [...moods];
}

export function matchesContext(item: CatalogueLike, context: ContextSlug) {
  const mode = CONTEXT_MODE[context];
  if (mode === "sans-photo") {
    return !item.themes.some((theme) => theme.toLowerCase().includes("photo"));
  }
  if (mode === "sans-video") {
    return !item.themes.some((theme) => theme.toLowerCase().includes("video"));
  }
  return item.modes.includes(mode);
}

export function matchesMoment(item: CatalogueLike, moment: MomentState) {
  if (moment.duration !== null && item.estimatedMinutes > moment.duration) {
    return false;
  }
  if (!moment.contexts.every((context) => matchesContext(item, context))) {
    return false;
  }
  if (moment.mood && !moodsFor(item).includes(moment.mood)) {
    return false;
  }
  return true;
}

export function momentIsActive(moment: MomentState) {
  return (
    moment.duration !== null ||
    moment.contexts.length > 0 ||
    moment.mood !== null
  );
}

/* ------------------------------------------------------------------ */
/* Affichage                                                           */
/* ------------------------------------------------------------------ */

export const DEPTH_LABEL: Record<string, string> = {
  leger: "Léger",
  moyen: "Moyen",
  profond: "Profond",
};

export const DEPTH_RANK: Record<string, number> = {
  leger: 1,
  moyen: 2,
  profond: 3,
};

export function modalityLabel(mode: string): string {
  if (mode === "ensemble") return "À deux";
  if (mode === "a-distance") return "À distance";
  if (mode === "differe") return "Différé";
  return "Défi individuel";
}

export function modeList(modes: readonly string[]): string {
  return modes.map(modalityLabel).join(" ou ");
}

export function adultLabel(adult: boolean): string | null {
  return adult ? "18+" : null;
}

/** Visuel déterministe : une teinte et un emoji, sans image à télécharger. */
export function visualFor(item: {
  adult: boolean;
  depth: string;
  category: { accent: string; emoji: string };
  kind: string;
}): { emoji: string; className: string } {
  if (item.kind === "path") {
    return {
      emoji: item.category.emoji || "🧭",
      className:
        "from-lavender-200/60 via-blush-200/30 to-coral-100/40",
    };
  }
  if (item.adult) {
    return {
      emoji: item.category.emoji || "💞",
      className: "from-coral-200/50 via-coral-100/30 to-lavender-200/40",
    };
  }
  if (item.depth === "profond") {
    return {
      emoji: item.category.emoji || "💬",
      className: "from-lavender-200/50 via-blush-200/20 to-coral-100/30",
    };
  }
  return {
    emoji: item.category.emoji || "✨",
    className:
      item.category.accent === "coral"
        ? "from-coral-100/50 via-blush-200/30 to-lavender-100/30"
        : "from-lavender-100/50 via-blush-200/20 to-coral-100/20",
  };
}
