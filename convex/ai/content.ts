/**
 * Bibliothèque éditoriale déterministe de DuoPlay AI.
 *
 * Le générateur de la phase 1 n'appelle aucun modèle : il compose une session
 * à partir de fragments rédigés, contrôlés et versionnés. C'est volontaire :
 * la promesse (un moment utile, sûr, personnalisé) est tenue sans envoyer la
 * moindre donnée intime à un fournisseur. Le jour où une passerelle modèle est
 * branchée, ce module devient le jeu de repli et le garde-fou de style.
 */

export type AiMood =
  | "tendre"
  | "romantique"
  | "joueur"
  | "curieux"
  | "sensuel"
  | "audacieux";

export type AiLevel = "leger" | "moyen" | "profond";
export type AiMode = "ensemble" | "a-distance";

export type AiBrief = {
  mood: AiMood;
  level: AiLevel;
  mode: AiMode;
  durationMinutes: number;
  exclusions: string[];
  wish?: string;
};

export type GeneratedStep = {
  title: string;
  body: string;
  minutes: number;
  kind: string;
  intensity: string;
};

export type GeneratedSession = {
  title: string;
  subtitle: string;
  steps: GeneratedStep[];
  finalQuestion: string;
  alternatives: { label: string; description: string }[];
  rationale: string[];
};

export const MOODS: {
  value: AiMood;
  label: string;
  hint: string;
}[] = [
  { value: "tendre", label: "Tendre", hint: "Se retrouver en douceur" },
  { value: "romantique", label: "Romantique", hint: "Un peu de magie" },
  { value: "joueur", label: "Joueur", hint: "Rire ensemble" },
  { value: "curieux", label: "Curieux", hint: "Se découvrir autrement" },
  { value: "sensuel", label: "Sensuel", hint: "Se rapprocher sans se presser" },
  { value: "audacieux", label: "Audacieux", hint: "Sortir de l’habitude" },
];

export const LEVELS: { value: AiLevel; label: string; hint: string }[] = [
  { value: "leger", label: "Doux", hint: "Sans profondeur particulière" },
  { value: "moyen", label: "Complice", hint: "Un peu plus personnel" },
  { value: "profond", label: "Profond", hint: "Pour un vrai temps de parole" },
];

export const DURATIONS = [10, 15, 20, 30] as const;

export const MOOD_LABELS: Record<AiMood, string> = {
  tendre: "Tendre",
  romantique: "Romantique",
  joueur: "Joueur",
  curieux: "Curieux",
  sensuel: "Sensuel",
  audacieux: "Audacieux",
};

export const LEVEL_LABELS: Record<AiLevel, string> = {
  leger: "Doux",
  moyen: "Complice",
  profond: "Profond",
};

const TITLES: Record<AiMood, { title: string; subtitle: string }> = {
  tendre: {
    title: "Un moment rien qu’à vous",
    subtitle: "Un temps doux, sans attente, pour vous retrouver.",
  },
  romantique: {
    title: "Deux voix, une soirée",
    subtitle: "Un peu de magie simple, à la mesure de votre soirée.",
  },
  joueur: {
    title: "À vous de jouer",
    subtitle: "Rire, se taquiner, et se retrouver sans se prendre au sérieux.",
  },
  curieux: {
    title: "La découverte du soir",
    subtitle: "Quelques questions pour se surprendre encore.",
  },
  sensuel: {
    title: "Tout près, autrement",
    subtitle: "Se rapprocher à votre rythme, sans rien précipiter.",
  },
  audacieux: {
    title: "Un pas de plus",
    subtitle: "Sortir un peu de l’habitude, en restant à l’écoute.",
  },
};

const DISTANCE_TITLE = "À distance, tout près";
const DISTANCE_SUBTITLE =
  "Quinze minutes pour se retrouver, même quand la distance est là.";

const FINAL_QUESTION = "Qu’aimeriez-vous refaire ensemble cette semaine ?";

function minutesFor(duration: number, base: number): number {
  if (duration <= 10) return Math.max(1, Math.round(base * 0.7));
  if (duration >= 30) return Math.max(2, Math.round(base * 1.6));
  if (duration >= 20) return Math.max(2, Math.round(base * 1.25));
  return base;
}

/** Étape d'ouverture, toujours très légère et sans piège. */
function openingStep(mode: AiMode): GeneratedStep {
  if (mode === "a-distance") {
    return {
      title: "Le premier mot",
      body: "Envoyez chacun un mot qui décrit votre état d’esprit maintenant. Rien de plus. L’autre le reçoit, sans commentaire obligatoire.",
      minutes: 1,
      kind: "ouverture",
      intensity: "leger",
    };
  }
  return {
    title: "Le premier regard",
    body: "Posez votre téléphone. Prenez trente secondes pour vous regarder, sans rien dire. Puis échangez un seul mot chacun sur ce que vous ressentez là, maintenant.",
    minutes: 1,
    kind: "ouverture",
    intensity: "leger",
  };
}

/** Étape de souvenir, déclinée par humeur et par niveau. */
function memoryStep(mood: AiMood, level: AiLevel, mode: AiMode): GeneratedStep {
  const bodyByMood: Record<AiMood, string> = {
    tendre:
      "Racontez chacun un souvenir récent qui vous a fait sourire, même minuscule. L’autre écoute jusqu’au bout, sans interrompre.",
    romantique:
      "Racontez le moment où vous avez senti que l’autre était vraiment là pour vous. Une image suffit, pas besoin d’une grande histoire.",
    joueur:
      "Racontez un fou rire que vous avez partagé. Celui dont vous vous souvenez encore. L’autre doit deviner à quel moment c’était.",
    curieux:
      "Partagez un détail de l’autre que vous avez remarqué récemment et que vous ne lui avez jamais dit. Rien de négatif, seulement une découverte.",
    sensuel:
      "Racontez un moment où vous vous êtes sentis proches sans qu’il se passe rien de particulier. Une voix, un geste, une présence.",
    audacieux:
      "Racontez une fois où l’un de vous a osé quelque chose de simple qui vous a surpris. L’autre peut poser une seule question.",
  };

  const deeper =
    level === "profond"
      ? " Prenez le temps de dire ce que ce souvenir a changé pour vous."
      : level === "moyen"
        ? " Terminez par un mot sur ce que vous avez ressenti."
        : "";

  const distanceHint =
    mode === "a-distance"
      ? " Envoyez-le en message vocal ou écrit, comme vous préférez."
      : "";

  return {
    title: "Le souvenir qui reste",
    body: `${bodyByMood[mood]}${deeper}${distanceHint}`,
    minutes: minutesFor(15, 3),
    kind: "souvenir",
    intensity: level,
  };
}

/** Étape centrale : discussion, jeu ou découverte selon l'humeur. */
function coreStep(
  mood: AiMood,
  level: AiLevel,
  mode: AiMode,
  allowMusic: boolean,
): GeneratedStep {
  if (mode === "a-distance" && allowMusic && (mood === "romantique" || mood === "tendre")) {
    return {
      title: "La chanson de l’instant",
      body: "Choisissez chacun une chanson qui représente votre humeur actuelle, puis partagez-la. Écoutez au moins trente secondes de celle de l’autre, sans commenter tout de suite.",
      minutes: minutesFor(15, 4),
      kind: "jeu",
      intensity: "leger",
    };
  }

  const questions: Record<AiMood, string> = {
    tendre:
      "Posez-vous une question simple : « Qu’est-ce qui te ferait te sentir aimé cette semaine ? » Chacun répond, l’autre ne cherche pas à corriger.",
    romantique:
      "Imaginez ensemble un rendez-vous qui n’existe pas encore. Où serait-il, à quelle heure, et qu’est-ce qui le rendrait doux ?",
    joueur:
      "Faites deviner à l’autre trois choses que vous aimez chez lui ou chez elle. Il ou elle doit deviner laquelle est la plus vraie pour vous.",
    curieux:
      "Chacun choisit une question qu’il n’a jamais osé poser à l’autre, mais qui reste douce. Répondez seulement si vous en avez envie.",
    sensuel:
      "Décrivez à l’autre, avec des mots simples, ce qui vous fait vous sentir proche de lui ou d’elle. Aucun geste n’est attendu.",
    audacieux:
      "Proposez chacun une petite chose que vous aimeriez essayer ensemble, sans la réaliser ce soir. L’autre peut dire oui, non, ou peut-être.",
  };

  const deeper =
    level === "profond"
      ? " Laissez une minute de silence après chaque réponse avant de reprendre."
      : "";

  return {
    title:
      mood === "joueur"
        ? "Le jeu des trois vérités"
        : mood === "curieux"
          ? "La question qui ouvre"
          : mood === "romantique"
            ? "Le rendez-vous imaginé"
            : mood === "sensuel"
              ? "Les mots qui rapprochent"
              : mood === "audacieux"
                ? "La petite audace"
                : "La question qui ouvre",
    body: `${questions[mood]}${deeper}`,
    minutes: minutesFor(15, 4),
    kind: mood === "joueur" ? "jeu" : "discussion",
    intensity: level,
  };
}

/** Gratitude : toujours présente, toujours précise. */
function gratitudeStep(mode: AiMode): GeneratedStep {
  return {
    title: "Merci, précisément",
    body:
      mode === "a-distance"
        ? "Envoyez à votre partenaire un message de gratitude précis. Pas un « merci » général : quelque chose qu’il ou elle a fait récemment et que vous avez remarqué."
        : "Dites à l’autre une chose précise que vous appréciez chez lui ou chez elle, sans ajouter de « mais ». L’autre reçoit, sans devoir répondre tout de suite.",
    minutes: minutesFor(15, 3),
    kind: "gratitude",
    intensity: "leger",
  };
}

/** Projection ou surprise : jamais une obligation, toujours une imagination. */
function projectionStep(mode: AiMode): GeneratedStep {
  return {
    title: "La surprise à préparer",
    body:
      mode === "a-distance"
        ? "Imaginez chacun une petite surprise à préparer pour vos prochaines retrouvailles. Elle doit coûter moins de quinze minutes et ne rien exiger de l’autre."
        : "Imaginez chacun une petite surprise à préparer pour cette semaine. Rien d’ambitieux : un mot, une attention, un moment réservé.",
    minutes: minutesFor(15, 3),
    kind: "projection",
    intensity: "leger",
  };
}

function closingStep(): GeneratedStep {
  return {
    title: "La conclusion calme",
    body: "Reprenez chacun une phrase de ce que vous avez entendu. Pas de bilan, pas de note : juste ce que vous emportez.",
    minutes: 1,
    kind: "cloture",
    intensity: "leger",
  };
}

/**
 * Compose une session. L'ordre et le nombre d'étapes dépendent de la durée,
 * jamais d'un compte à rebours. Aucune étape ne mentionne de photo, de vidéo
 * ou de contact si l'exclusion correspondante est posée.
 */
export function composeSession(brief: AiBrief): GeneratedSession {
  const exclusions = brief.exclusions;
  const allowMusic = !exclusions.includes("musique");
  const safeMood: AiMood =
    brief.mood === "audacieux" && exclusions.includes("audacieux")
      ? "romantique"
      : brief.mood;

  const steps: GeneratedStep[] = [openingStep(brief.mode)];

  if (brief.durationMinutes >= 10) {
    steps.push(memoryStep(safeMood, brief.level, brief.mode));
  }

  steps.push(coreStep(safeMood, brief.level, brief.mode, allowMusic));

  if (brief.durationMinutes >= 15) {
    steps.push(gratitudeStep(brief.mode));
  }

  if (brief.durationMinutes >= 20) {
    steps.push(projectionStep(brief.mode));
  }

  if (brief.durationMinutes >= 30) {
    steps.push(closingStep());
  }

  // Ajuste les minutes pour rester dans l'enveloppe annoncée, en répartissant
  // l'écart plutôt qu'en gonflant une seule étape.
  let delta = brief.durationMinutes - steps.reduce((sum, step) => sum + step.minutes, 0);
  while (delta !== 0) {
    let progressed = false;
    for (let index = 0; index < steps.length && delta !== 0; index += 1) {
      if (delta > 0) {
        steps[index] = { ...steps[index], minutes: steps[index].minutes + 1 };
        delta -= 1;
        progressed = true;
      } else if (steps[index].minutes > 1) {
        steps[index] = { ...steps[index], minutes: steps[index].minutes - 1 };
        delta += 1;
        progressed = true;
      }
    }
    if (!progressed) break;
  }

  const base = TITLES[safeMood];
  const title = brief.mode === "a-distance" ? DISTANCE_TITLE : base.title;
  const subtitle =
    brief.mode === "a-distance"
      ? DISTANCE_SUBTITLE
      : `${base.subtitle} ${brief.durationMinutes} minutes, sans obligation.`;

  const rationale = [
    `Cette session tient en ${brief.durationMinutes} minutes, comme vous l’avez demandé.`,
    brief.mode === "a-distance"
      ? "Elle est pensée pour deux personnes qui ne sont pas au même endroit : messages, voix et imagination, sans contact physique."
      : "Elle alterne parole et petits gestes, sans jamais imposer de contact.",
    exclusions.length > 0
      ? `Elle respecte vos exclusions : ${exclusions
          .map((item) => EXCLUSION_LABEL(item))
          .join(", ")}.`
      : "Vous n’avez posé aucune exclusion ; vous pouvez en ajouter à tout moment.",
  ];

  if (safeMood !== brief.mood) {
    rationale.push(
      "L’humeur audacieuse a été adoucie parce que vous avez exclu le contenu audacieux.",
    );
  }

  const alternatives = [
    {
      label: "Version plus douce",
      description: "Les mêmes étapes, avec des questions plus légères.",
    },
  ];

  if (brief.durationMinutes > 10) {
    alternatives.push({
      label: "Version 10 minutes",
      description: "On garde l’essentiel et on retire la dernière étape.",
    });
  }

  if (!exclusions.includes("musique")) {
    alternatives.push({
      label: "Sans la chanson",
      description: "Une variante entièrement parlée, si la musique ne vous dit rien.",
    });
  }

  return {
    title,
    subtitle,
    steps,
    finalQuestion: FINAL_QUESTION,
    alternatives,
    rationale,
  };
}

export function EXCLUSION_LABEL(value: string): string {
  const labels: Record<string, string> = {
    photo: "photo",
    video: "vidéo",
    contact: "contact physique",
    public: "lieu public",
    accessoires: "accessoires",
    audacieux: "contenu audacieux",
    musique: "musique",
  };
  return labels[value] ?? value;
}
