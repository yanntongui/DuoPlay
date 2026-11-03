/**
 * Politique de sécurité de DuoPlay AI (cf. docs/AI-DUOPLAY.md §7 et §10).
 *
 * Ce module est volontairement **déterministe** : il s'exécute avant toute
 * génération. Une demande interdite ne doit jamais atteindre un modèle, même
 * local. Les messages de refus sont tactueux, jamais moralisateurs, et
 * proposent toujours une alternative sûre.
 */

export type SafetyCategory =
  | "mineur"
  | "coercition"
  | "violence"
  | "non-consentement"
  | "exploitation"
  | "harcelement"
  | "vie-privee"
  | "illegal"
  | "image-intime"
  | "franchir-limite"
  | "diagnostic"
  | "urgence";

export type SafetyVerdict = {
  blocked: boolean;
  category?: SafetyCategory;
  severity: "critique" | "eleve" | "moyen" | "faible";
  message: string;
  alternative: string;
};

const ALLOWED: SafetyVerdict = {
  blocked: false,
  severity: "faible",
  message: "",
  alternative: "",
};

type Rule = {
  category: SafetyCategory;
  severity: SafetyVerdict["severity"];
  patterns: RegExp[];
};

/**
 * Les expressions sont ancrées sur des formulations explicites. On préfère
 * laisser passer une maladresse que bloquer une demande légitime : le filtre
 * de sortie et la revue humaine restent les garde-fous suivants.
 */
const RULES: Rule[] = [
  {
    category: "mineur",
    severity: "critique",
    patterns: [
      /\b(mineur|mineure|mineurs|mineures)\b/i,
      /\b(moins de|pas encore|à peine)\s*(18|dix-huit|17|16|seize)\s*ans?\b/i,
      /\b(ado|adolescent|adolescente|lyc[ée]e[n]?|coll[ée]gien)\b/i,
    ],
  },
  {
    category: "coercition",
    severity: "critique",
    patterns: [
      /\b(forc[ée]?e?r?|contrain[dt]re|obliger|imposer|pousser)\b.*\b(partenaire|copain|copine|elle|lui|il)\b/i,
      /\b(elle|il)\s+(doit|devra|n['’]a pas le choix)\b/i,
      /\bsans (son|sa) (accord|consentement)\b/i,
      /\bmanipuler?\b.*\b(partenaire|couple)\b/i,
    ],
  },
  {
    category: "violence",
    severity: "critique",
    patterns: [
      /\b(frapper|battre|gifler|étrangler|violenter|violence physique|menacer?)\b/i,
      /\b(arme|couteau|poignard)\b.*\b(partenaire|couple)\b/i,
    ],
  },
  {
    category: "non-consentement",
    severity: "critique",
    patterns: [
      /\b(pas|sans)\s+(vouloir|envie|accord|consentement)\b/i,
      /\b(refuse|refusera|dit non)\b.*\b(quand m[êe]me|malgr[ée]|forcer?)\b/i,
      /\b(dormir|endormie|ivre|saoul)\b.*\b(partenaire|avec (elle|lui|toi)|profiter)\b/i,
    ],
  },
  {
    category: "exploitation",
    severity: "critique",
    patterns: [
      /\b(prostitu|traite|esclav|exploit)\w*/i,
      /\b(payer|argent|dette)\b.*\b(faveur|sexe|corps|photo)\b/i,
    ],
  },
  {
    category: "harcelement",
    severity: "eleve",
    patterns: [
      /\b(harceler|harc[èe]lement|insulter|humilier|menacer|intimider)\b/i,
      /\b(envoyer|spammer)\b.*\b(insistance|sans arr[êe]t|plusieurs fois)\b/i,
    ],
  },
  {
    category: "vie-privee",
    severity: "eleve",
    patterns: [
      /\b(espionner|surveiller|traquer|localiser|g[ée]olocaliser)\b.*\b(partenaire|sans (son|sa) accord)\b/i,
      /\b(pirater|voler|acc[ée]der)\b.*\b(compte|t[ée]l[ée]phone|messages)\b/i,
      /\b(diffuser|partager|publier)\b.*\b(photo|vid[ée]o|image|conversation)\b.*\b(sans|priv[ée])\b/i,
    ],
  },
  {
    category: "illegal",
    severity: "critique",
    patterns: [
      /\b(drogue|stup[ée]fiant|droguer)\b.*\b(partenaire|elle|lui|il)\b/i,
      /\b(mineur|enfant)\b.*\b(photo|image|vid[ée]o|nu)\b/i,
      /\b(non consenti|illegal|ill[ée]gal)\b/i,
    ],
  },
  {
    category: "image-intime",
    severity: "critique",
    patterns: [
      /\b(envoyer|partager|diffuser)\b.*\b(nu|nue|photo intime|vid[ée]o intime|image intime)\b.*\b(sans|non sollicit|de force)\b/i,
      /\brevenge porn\b/i,
    ],
  },
  {
    category: "franchir-limite",
    severity: "critique",
    patterns: [
      /\b(faire|pousser|obliger)\b.*\b(d[ée]passer|franchir)\b.*\b(limite|interdit)\b/i,
      /\b(elle|il) a dit non\b.*\b(insister|quand m[êe]me|encore)\b/i,
    ],
  },
  {
    category: "diagnostic",
    severity: "moyen",
    patterns: [
      /\b(diagnostic|diagnostiquer|soigner|gu[ée]rir|th[ée]rapie|th[ée]rapeute)\b/i,
      /\b(est-ce que|suis-je|sommes-nous)\b.*\b(normal|anormal|malade|toxique|narcissique|d[ée]pressif)\b/i,
      /\bmon couple\b.*\b(malade|foutu|toxique|bris[ée]|condamn[ée])\b/i,
    ],
  },
  {
    category: "urgence",
    severity: "critique",
    patterns: [
      /\b(suicid|me tuer|mourir|passer [àa] l['’]acte|en finir)\b/i,
      /\b(urgence vitale|viol[ée]e?|agress[ée]e?|en danger)\b/i,
    ],
  },
];

const REFUSALS: Record<
  SafetyCategory,
  { message: string; alternative: string }
> = {
  mineur: {
    message:
      "DuoPlay est réservé aux adultes. Je ne peux pas créer de contenu impliquant une personne mineure, même de façon indirecte.",
    alternative:
      "Je peux vous proposer un moment de complicité entre adultes, sans référence à l’âge ni à la jeunesse.",
  },
  coercition: {
    message:
      "Une proposition ne devient jamais une obligation. Je ne peux pas aider à obtenir un accord par la pression.",
    alternative:
      "Je peux vous aider à formuler une envie de façon ouverte, en laissant à l’autre la liberté de dire non.",
  },
  violence: {
    message:
      "Je ne peux pas accompagner une situation de violence réelle. Votre sécurité passe avant tout.",
    alternative:
      "Si vous êtes en danger, contactez les services d’urgence de votre pays. Je peux sinon vous proposer une activité calme et sans contact.",
  },
  "non-consentement": {
    message:
      "Le consentement doit être libre, explicite et réversible. Je ne peux pas construire une expérience qui en fait abstraction.",
    alternative:
      "Je peux vous proposer une discussion douce pour comprendre ce que chacun souhaite, sans aucune attente de résultat.",
  },
  exploitation: {
    message:
      "Je ne peux pas créer de contenu fondé sur l’exploitation ou la contrainte d’une personne.",
    alternative:
      "Je peux vous proposer un moment égalitaire, où chacun choisit ce qu’il partage.",
  },
  harcelement: {
    message:
      "Je ne peux pas aider à insister, humilier ou mettre la pression sur quelqu’un.",
    alternative:
      "Je peux vous aider à exprimer votre besoin une fois, clairement, puis à respecter la réponse.",
  },
  "vie-privee": {
    message:
      "Je ne peux pas aider à surveiller, espionner ou partager des informations privées sans accord.",
    alternative:
      "Je peux vous proposer un moment qui respecte la vie privée de chacun et ne demande aucun accès.",
  },
  illegal: {
    message:
      "Cette demande ne respecte pas les règles de sécurité de DuoPlay.",
    alternative:
      "Je peux vous proposer une activité légale, douce et consensuelle.",
  },
  "image-intime": {
    message:
      "Je ne peux pas aider à envoyer ou partager une image intime non sollicitée.",
    alternative:
      "Je peux vous proposer un échange de mots, sans photo ni vidéo.",
  },
  "franchir-limite": {
    message:
      "Une limite posée s’applique immédiatement et pour toute la session. Je ne peux pas aider à la contourner.",
    alternative:
      "Je peux vous proposer une version plus douce, ou une étape de discussion pour reparler des limites.",
  },
  diagnostic: {
    message:
      "Je ne suis pas un professionnel de santé et je ne peux pas poser de diagnostic sur votre couple ou sur vous.",
    alternative:
      "Je peux vous proposer une question ouverte pour explorer ce que vous ressentez, sans conclusion.",
  },
  urgence: {
    message:
      "Ce que vous décrivez semble grave. DuoPlay AI n’est pas un service d’urgence et ne peut pas intervenir.",
    alternative:
      "Contactez immédiatement les services d’urgence ou une ligne d’écoute de votre pays. Prenez soin de vous.",
  },
};

/** Analyse une demande libre avant toute génération. */
export function screenRequest(text: string): SafetyVerdict {
  const value = (text ?? "").normalize("NFC").slice(0, 2000);
  if (!value.trim()) return ALLOWED;

  for (const rule of RULES) {
    if (rule.patterns.some((pattern) => pattern.test(value))) {
      return {
        blocked: true,
        category: rule.category,
        severity: rule.severity,
        ...REFUSALS[rule.category],
      };
    }
  }

  return ALLOWED;
}

/**
 * Vérifie qu'une sortie ne contredit pas les exclusions déclarées. On ne
 * cherche pas à juger le ton : on bloque les marqueurs objectifs (photo,
 * vidéo, contact, lieu public, intensité).
 */
export function violatesExclusions(
  text: string,
  exclusions: string[],
): boolean {
  const value = text.toLowerCase();
  const checks: Record<string, RegExp> = {
    photo: /\b(photo|selfie|appareil photo|poser pour)\b/,
    video: /\b(vid[ée]o|filmer|enregistrer)\b/,
    contact: /\b(toucher|caresser|massage|contact physique|se blottir)\b/,
    public: /\b(dehors|ext[ée]rieur|public|rue|restaurant|bar)\b/,
    accessoires: /\b(accessoire|menotte|foulard|bougie parfum[ée]e)\b/,
  };

  return exclusions.some((exclusion) => {
    const rule = checks[exclusion];
    return rule ? rule.test(value) : false;
  });
}

/** Nettoie et déduplique les exclusions connues. */
export function cleanExclusions(input: string[] | undefined): string[] {
  const allowed = new Set([
    "photo",
    "video",
    "contact",
    "public",
    "accessoires",
    "audacieux",
    "musique",
  ]);
  return [
    ...new Set(
      (input ?? [])
        .map((item) => item.trim().toLowerCase())
        .filter((item) => allowed.has(item)),
    ),
  ];
}

/** Libellés français des exclusions, utilisés dans les récapitulatifs. */
export const EXCLUSION_LABELS: Record<string, string> = {
  photo: "Photo",
  video: "Vidéo",
  contact: "Contact physique",
  public: "Lieu public",
  accessoires: "Accessoires",
  audacieux: "Contenu audacieux",
  musique: "Musique",
};
