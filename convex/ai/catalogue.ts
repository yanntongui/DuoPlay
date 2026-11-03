import type { AiLevel, AiMode, AiMood } from "./content";

/**
 * Catalogue éditorial de repli de DuoPlay AI.
 *
 * Il ne remplace pas le catalogue DuoPlay : il sert lorsque la base ne contient
 * encore aucune expérience publiée, afin que les recommandations et la
 * recherche ne restent jamais vides. Chaque entrée est une proposition de
 * session, rédigée et contrôlée, qui renvoie vers le composeur — jamais vers
 * une fiche inexistante.
 */

export type AiCatalogueEntry = {
  slug: string;
  title: string;
  description: string;
  emoji: string;
  category: string;
  durationMinutes: number;
  depth: AiLevel;
  themes: string[];
  modes: AiMode[];
  mood: AiMood;
};

export const AI_CATALOGUE: AiCatalogueEntry[] = [
  {
    slug: "ai-le-premier-mot",
    title: "Le premier mot",
    description:
      "Un mot chacun sur l’état d’esprit du moment, sans commentaire obligatoire. Une entrée en matière douce, même à distance.",
    emoji: "💬",
    category: "Idées DuoPlay AI",
    durationMinutes: 10,
    depth: "leger",
    themes: ["discussion", "reconnexion"],
    modes: ["ensemble", "a-distance"],
    mood: "tendre",
  },
  {
    slug: "ai-le-souvenir-qui-reste",
    title: "Le souvenir qui reste",
    description:
      "Raconter chacun un souvenir récent qui a fait sourire, et dire ce qu’il a laissé. Une base simple pour se retrouver.",
    emoji: "🌿",
    category: "Idées DuoPlay AI",
    durationMinutes: 15,
    depth: "moyen",
    themes: ["souvenir", "reconnexion"],
    modes: ["ensemble", "a-distance"],
    mood: "tendre",
  },
  {
    slug: "ai-la-chanson-de-l-instant",
    title: "La chanson de l’instant",
    description:
      "Choisir chacun une chanson qui dit l’humeur du soir, l’écouter ensemble. Aucun geste attendu, juste un partage.",
    emoji: "🎵",
    category: "Idées DuoPlay AI",
    durationMinutes: 15,
    depth: "leger",
    themes: ["musique", "romantique"],
    modes: ["ensemble", "a-distance"],
    mood: "romantique",
  },
  {
    slug: "ai-le-jeu-des-trois-verites",
    title: "Le jeu des trois vérités",
    description:
      "Faire deviner trois choses que vous aimez chez l’autre, et laquelle est la plus vraie. Un jeu léger, sans enjeu.",
    emoji: "😄",
    category: "Idées DuoPlay AI",
    durationMinutes: 10,
    depth: "leger",
    themes: ["jeu", "rire"],
    modes: ["ensemble", "a-distance"],
    mood: "joueur",
  },
  {
    slug: "ai-la-question-qui-ouvre",
    title: "La question qui ouvre",
    description:
      "Poser une question encore jamais osée, mais douce. Chacun répond seulement s’il en a envie.",
    emoji: "🔎",
    category: "Idées DuoPlay AI",
    durationMinutes: 20,
    depth: "moyen",
    themes: ["discussion", "decouverte"],
    modes: ["ensemble", "a-distance"],
    mood: "curieux",
  },
  {
    slug: "ai-le-rendez-vous-imagine",
    title: "Le rendez-vous imaginé",
    description:
      "Imaginer ensemble un rendez-vous qui n’existe pas encore : le lieu, l’heure, ce qui le rendrait doux.",
    emoji: "✨",
    category: "Idées DuoPlay AI",
    durationMinutes: 20,
    depth: "moyen",
    themes: ["romantique", "projection"],
    modes: ["ensemble", "a-distance"],
    mood: "romantique",
  },
  {
    slug: "ai-les-mots-qui-rapprochent",
    title: "Les mots qui rapprochent",
    description:
      "Dire avec des mots simples ce qui fait se sentir proche de l’autre. Aucun geste n’est attendu, aucune suite non plus.",
    emoji: "💗",
    category: "Idées DuoPlay AI",
    durationMinutes: 20,
    depth: "moyen",
    themes: ["proximite", "discussion"],
    modes: ["ensemble"],
    mood: "sensuel",
  },
  {
    slug: "ai-merci-precisement",
    title: "Merci, précisément",
    description:
      "Dire merci pour une chose précise, remarquée récemment. Pas un merci général, pas de « mais ».",
    emoji: "🤍",
    category: "Idées DuoPlay AI",
    durationMinutes: 10,
    depth: "leger",
    themes: ["gratitude", "reconnexion"],
    modes: ["ensemble", "a-distance"],
    mood: "tendre",
  },
  {
    slug: "ai-la-petite-audace",
    title: "La petite audace",
    description:
      "Proposer chacun une petite chose à essayer ensemble, sans la réaliser ce soir. L’autre peut dire oui, non, ou peut-être.",
    emoji: "🔥",
    category: "Idées DuoPlay AI",
    durationMinutes: 30,
    depth: "moyen",
    themes: ["audace", "nouveaute"],
    modes: ["ensemble"],
    mood: "audacieux",
  },
  {
    slug: "ai-la-surprise-a-preparer",
    title: "La surprise à préparer",
    description:
      "Imaginer une attention de moins de quinze minutes pour cette semaine, sans rien exiger en retour.",
    emoji: "🎁",
    category: "Idées DuoPlay AI",
    durationMinutes: 15,
    depth: "leger",
    themes: ["surprise", "projection"],
    modes: ["ensemble", "a-distance"],
    mood: "curieux",
  },
];

/** Quelques cartes proposées quand aucun catalogue n’est encore publié. */
export const AI_CARDS: {
  id: string;
  prompt: string;
  category: string;
  depth: AiLevel;
  experienceTitle: string;
  themes: string[];
}[] = [
  {
    id: "ai-card-1",
    prompt: "Quel petit geste de l’autre vous a fait vous sentir vu cette semaine ?",
    category: "discussion",
    depth: "leger",
    experienceTitle: "Le premier mot",
    themes: ["reconnexion"],
  },
  {
    id: "ai-card-2",
    prompt: "Racontez un moment où vous avez ri ensemble, sans raison sérieuse.",
    category: "discussion",
    depth: "leger",
    experienceTitle: "Le jeu des trois vérités",
    themes: ["rire", "jeu"],
  },
  {
    id: "ai-card-3",
    prompt: "Qu’aimeriez-vous que l’autre remarque davantage, sans le lui reprocher ?",
    category: "discussion",
    depth: "moyen",
    experienceTitle: "La question qui ouvre",
    themes: ["discussion", "decouverte"],
  },
  {
    id: "ai-card-4",
    prompt: "Si vous réserviez dix minutes ce soir, à quoi les consacreriez-vous ?",
    category: "projection",
    depth: "moyen",
    experienceTitle: "La surprise à préparer",
    themes: ["projection", "surprise"],
  },
];
