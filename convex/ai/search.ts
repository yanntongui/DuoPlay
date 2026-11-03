/**
 * Recherche en langage naturel — interprétation déterministe.
 *
 * Le texte libre est traité comme une **donnée**, jamais comme une instruction.
 * On en extrait des filtres explicites, affichés à l'utilisateur, puis on
 * interroge le catalogue publié. Une limite enregistrée par le couple ne peut
 * jamais être retirée par la requête : elle est appliquée après l'analyse.
 */

export type SearchFilters = {
  durationMinutes?: number;
  mode?: "ensemble" | "a-distance";
  mood?: string;
  level?: "leger" | "moyen" | "profond";
  exclusions: string[];
  themes: string[];
  keywords: string[];
  understood: string[];
};

const MOOD_WORDS: { mood: string; label: string; words: RegExp }[] = [
  { mood: "tendre", label: "Tendre", words: /\b(tendre|douce?ur?|calme|r[ée]confort|bien-?[êe]tre)\b/i },
  { mood: "romantique", label: "Romantique", words: /\b(romantique|amour|amoureux|magie|bougie)\b/i },
  { mood: "joueur", label: "Joueur", words: /\b(joueur|jouer|rire|dr[ôo]le|taquin|fun)\b/i },
  { mood: "curieux", label: "Curieux", words: /\b(curieu|d[ée]couvrir|nouveaut[ée]|surprendre)\b/i },
  { mood: "sensuel", label: "Sensuel", words: /\b(sensuel|sensuel|frisson|peau|proche|proximit[ée])\b/i },
  { mood: "audacieux", label: "Audacieux", words: /\b(audacieu|oser|nouveau|sortir de l.habitude)\b/i },
];

const THEME_WORDS: { theme: string; label: string; words: RegExp }[] = [
  { theme: "discussion", label: "Discussion", words: /\b(discussion|discuter|parler|conversation|[ée]change)\b/i },
  { theme: "jeu", label: "Jeu", words: /\b(jeu|jouer|d[ée]fi)\b/i },
  { theme: "reconnexion", label: "Reconnexion", words: /\b(reconnect|retrouv|complicit[ée]|lien)\b/i },
  { theme: "surprise", label: "Surprise", words: /\b(surprise|inattendu|attention)\b/i },
];

const EXCLUSION_WORDS: { value: string; label: string; words: RegExp }[] = [
  { value: "photo", label: "Sans photo", words: /\b(sans|pas de)\s+(photo|selfie|images?)\b/i },
  { value: "video", label: "Sans vidéo", words: /\b(sans|pas de)\s+(vid[ée]o|film)\b/i },
  { value: "contact", label: "Sans contact", words: /\b(sans|pas de)\s+(contact|toucher|geste)\b/i },
  { value: "musique", label: "Sans musique", words: /\b(sans|pas de)\s+(musique|chanson)\b/i },
  { value: "accessoires", label: "Sans accessoire", words: /\b(sans|pas de)\s+(accessoire|objet)\b/i },
  { value: "public", label: "À la maison", words: /\b(sans sortir|pas dehors|[àa] la maison|chez nous|canap[ée])\b/i },
];

export function parseQuery(raw: string): SearchFilters {
  const query = (raw ?? "").normalize("NFC").slice(0, 500);
  const filters: SearchFilters = {
    exclusions: [],
    themes: [],
    keywords: [],
    understood: [],
  };

  const duration = query.match(/(\d{1,3})\s*(?:min|minutes?)\b/i);
  if (duration) {
    const minutes = Math.min(120, Math.max(5, Number(duration[1])));
    filters.durationMinutes = minutes;
    filters.understood.push(`${minutes} min`);
  }

  if (/\b([àa]\s+distance|distance|loin|visio|appel|s[ée]par[ée]s?)\b/i.test(query)) {
    filters.mode = "a-distance";
    filters.understood.push("À distance");
  } else if (/\b(maison|soir[ée]e|canap[ée]|chez nous|ensemble|pr[ée]sentiel)\b/i.test(query)) {
    filters.mode = "ensemble";
    filters.understood.push("Au même endroit");
  }

  for (const entry of MOOD_WORDS) {
    if (entry.words.test(query)) {
      filters.mood = entry.mood;
      filters.understood.push(`Humeur ${entry.label.toLowerCase()}`);
      break;
    }
  }

  if (/\b(l[ée]ger|l[ée]g[èe]re|doux|douce|simple|calme|d[ée]buter|commencer)\b/i.test(query)) {
    filters.level = "leger";
    filters.understood.push("Niveau doux");
  } else if (/\b(profond|intime|s[ée]rieux|vrai|parler vraiment)\b/i.test(query)) {
    filters.level = "profond";
    filters.understood.push("Niveau profond");
  }

  for (const entry of THEME_WORDS) {
    if (entry.words.test(query)) {
      filters.themes.push(entry.theme);
      filters.understood.push(entry.label);
    }
  }

  for (const entry of EXCLUSION_WORDS) {
    if (entry.words.test(query)) {
      filters.exclusions.push(entry.value);
      filters.understood.push(entry.label);
    }
  }

  filters.keywords = query
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3)
    .filter(
      (word) =>
        ![
          "trouve",
          "trouver",
          "propose",
          "proposer",
          "veux",
          "vouloir",
          "expérience",
          "experience",
          "quelque",
          "chose",
          "avec",
          "sans",
          "pour",
          "nous",
          "notre",
          "dans",
          "plus",
          "beaucoup",
          "temps",
          "minutes",
        ].includes(word),
    )
    .slice(0, 8);

  if (filters.understood.length === 0) {
    filters.understood.push("Aucun filtre précis — propositions variées");
  }

  return filters;
}

export type ExperienceLike = {
  title: string;
  description: string;
  depth: string;
  themes: string[];
  estimatedMinutes: number;
  modes: string[];
  type: string;
};

export type ScoredExperience<T> = {
  item: T;
  score: number;
  reasons: string[];
};

/**
 * Applique les filtres durs puis calcule un score explicable. Les filtres durs
 * incluent les exclusions du couple et les thèmes évités : ils ne sont jamais
 * contournables par la requête.
 */
export function scoreExperience<T extends ExperienceLike>(
  item: T,
  filters: SearchFilters,
  avoidThemes: string[],
  extraText = "",
): ScoredExperience<T> | null {
  const haystack = `${item.title} ${item.description} ${item.themes.join(" ")} ${extraText}`.toLowerCase();

  for (const avoid of avoidThemes) {
    if (avoid && haystack.includes(avoid.toLowerCase())) return null;
  }

  for (const exclusion of filters.exclusions) {
    if (exclusion === "photo" && /\b(photo|selfie|image)\b/.test(haystack)) return null;
    if (exclusion === "video" && /\b(vid[ée]o|film)\b/.test(haystack)) return null;
    if (exclusion === "contact" && /\b(contact|toucher|massage)\b/.test(haystack)) return null;
    if (exclusion === "musique" && /\b(musique|chanson|playlist)\b/.test(haystack)) return null;
    if (exclusion === "accessoires" && /\b(accessoire|objet)\b/.test(haystack)) return null;
    if (exclusion === "public" && /\b(dehors|ext[ée]rieur|rue|restaurant|bar|public)\b/.test(haystack)) return null;
  }

  if (filters.mode && !item.modes.includes(filters.mode)) return null;
  if (filters.level === "leger" && item.depth === "profond") return null;
  if (filters.durationMinutes && item.estimatedMinutes > filters.durationMinutes + 5) {
    return null;
  }

  let score = 0;
  const reasons: string[] = [];

  if (filters.durationMinutes) {
    score += 1;
    reasons.push(
      item.estimatedMinutes > filters.durationMinutes
        ? `Proche du format de ${filters.durationMinutes} minutes.`
        : `Tient dans le format de ${filters.durationMinutes} minutes.`,
    );
  }

  if (filters.mode) {
    score += 1;
    reasons.push(
      filters.mode === "a-distance"
        ? "Prévue pour être vécue à distance."
        : "Pensée pour un moment au même endroit.",
    );
  }

  if (filters.themes.length > 0) {
    const matches = filters.themes.filter((theme) => item.themes.includes(theme) || haystack.includes(theme));
    if (matches.length > 0) {
      score += matches.length * 2;
      reasons.push(`Correspond à votre envie : ${matches.join(", ")}.`);
    }
  }

  if (filters.mood) {
    const moodText = filters.mood === "tendre" ? "tendre" : filters.mood;
    if (haystack.includes(moodText)) {
      score += 2;
      reasons.push(`Correspond à l’ambiance ${moodText}.`);
    }
  }

  const keywordMatches = filters.keywords.filter((word) => haystack.includes(word));
  if (keywordMatches.length > 0) {
    score += Math.min(4, keywordMatches.length);
    reasons.push(`Proche de votre demande : ${keywordMatches.slice(0, 3).join(", ")}.`);
  }

  if (item.depth === "leger" && filters.level === "leger") {
    score += 1;
    reasons.push("Reste dans un registre léger.");
  }

  if (reasons.length === 0) {
    reasons.push("Sélectionnée pour varier les formats et les ambiances.");
  }

  return { item, score, reasons };
}
