/**
 * Personnalisation de l'expérience (cf. docs/PRD.md §3.F et §22 phase 5).
 *
 * Les préférences sont des **contraintes**, jamais des suggestions : on ne sert
 * jamais une question plus profonde que demandé, ni une question sur un thème
 * que le couple a explicitement écarté. Si le filtre ne laisse plus rien, la
 * partie ne démarre pas : la plateforme **n'impose jamais** une activité
 * (règle produit fondamentale, §3.F).
 */

export const DEPTH_LEVELS = ["leger", "moyen", "profond"] as const;

export type DepthLevel = (typeof DEPTH_LEVELS)[number];

/** Rythme moyen d'une question, utilisé pour convertir une durée en volume. */
export const MINUTES_PER_QUESTION = 1.5;

/** En dessous, la partie n'a plus de sens — on le signale à l'utilisateur. */
export const MIN_QUESTIONS = 3;

export type Preferences = {
  /** Profondeur maximale acceptée (`profond` = tout est permis). */
  maxDepth?: DepthLevel;
  /** Thèmes à ne jamais aborder. */
  avoidThemes?: string[];
};

/** Profondeurs autorisées par un plafond : `moyen` → léger et moyen. */
export function depthsUpTo(maxDepth?: DepthLevel): DepthLevel[] {
  if (!maxDepth) return [...DEPTH_LEVELS];
  return DEPTH_LEVELS.slice(0, DEPTH_LEVELS.indexOf(maxDepth) + 1);
}

/** Nombre de questions visé pour une durée donnée. */
export function wantedQuestions(durationMinutes: number): number {
  return Math.max(
    MIN_QUESTIONS,
    Math.round(durationMinutes / MINUTES_PER_QUESTION),
  );
}

/** Une question passe-t-elle les préférences du couple ? */
export function matchesPreferences(
  question: { depth: DepthLevel; themes: string[] },
  preferences: Preferences,
): boolean {
  if (!depthsUpTo(preferences.maxDepth).includes(question.depth)) return false;
  const avoid = preferences.avoidThemes ?? [];
  return !question.themes.some((theme) => avoid.includes(theme));
}

/**
 * Questions retenues pour une partie : le pool filtré, dans l'ordre éditorial,
 * tronqué au volume visé. Ne complète **jamais** avec une question écartée.
 */
export function selectQuestions<
  T extends { depth: DepthLevel; themes: string[] },
>(pool: T[], options: Preferences & { durationMinutes: number }): T[] {
  return pool
    .filter((question) => matchesPreferences(question, options))
    .slice(0, wantedQuestions(options.durationMinutes));
}
