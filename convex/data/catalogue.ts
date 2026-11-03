/**
 * Catalogue DuoPlay restauré — données éditoriales des univers, des
 * expériences, des questions et des parcours.
 *
 * Source : sauvegarde locale de la base Convex, dédupliquée par slug /
 * expérience / jour. Ce fichier est la référence versionnée du catalogue :
 * il permet de réamorcer un déploiement vide sans dépendre d'une sauvegarde
 * externe. Modifier les textes ici, puis lancer `seed:seedCatalogue`.
 */

export type SeedCategory = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  emoji: string;
  accent: "coral" | "lavender" | "graphite";
  mvp: boolean;
  order: number;
  status: "draft" | "published" | "archived";
};

export type SeedExperience = {
  categorySlug: string;
  slug: string;
  title: string;
  description: string;
  depth: "leger" | "moyen" | "profond";
  themes: string[];
  estimatedMinutes: number;
  modes: Array<"ensemble" | "a-distance" | "differe" | "defi-individuel">;
  type: "questions" | "cartes" | "des" | "parcours";
  status: "draft" | "published" | "archived";
  order: number;
};

export type SeedQuestion = {
  experienceSlug: string;
  kind: "choice" | "open" | "challenge";
  prompt: string;
  options?: string[];
  depth: "leger" | "moyen" | "profond";
  themes: string[];
  order: number;
  status: "draft" | "published" | "archived";
};

export type SeedJourney = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  emoji: string;
  lengthDays: number;
  order: number;
  status: "draft" | "published" | "archived";
  createdAt: number;
  updatedAt: number;
};

export type SeedJourneyStep = {
  journeySlug: string;
  dayIndex: number;
  title: string;
  prompt?: string;
  mission?: string;
  experienceSlug?: string;
};

export type SeedCatalogue = {
  categories: SeedCategory[];
  experiences: SeedExperience[];
  questions: SeedQuestion[];
  journeys: SeedJourney[];
  journeySteps: SeedJourneyStep[];
};

export const CATALOGUE: SeedCatalogue = {
  "categories": [
    {
      "slug": "eclats-de-rire",
      "title": "Éclats de rire",
      "tagline": "Rire ensemble",
      "description": "Des jeux légers pour s'amuser, rire et retrouver de la spontanéité.",
      "emoji": "😄",
      "accent": "coral",
      "mvp": true,
      "order": 1,
      "status": "published"
    },
    {
      "slug": "coeur-a-coeur",
      "title": "Cœur à cœur",
      "tagline": "Mieux se comprendre",
      "description": "Des expériences pour approfondir les échanges et se redécouvrir.",
      "emoji": "💬",
      "accent": "lavender",
      "mvp": true,
      "order": 2,
      "status": "published"
    },
    {
      "slug": "flirt-et-etincelles",
      "title": "Flirt & Étincelles",
      "tagline": "Entretenir la tendresse",
      "description": "Des jeux romantiques et non explicites pour raviver la séduction.",
      "emoji": "💗",
      "accent": "coral",
      "mvp": true,
      "order": 3,
      "status": "published"
    },
    {
      "slug": "nos-souvenirs",
      "title": "Nos souvenirs",
      "tagline": "Célébrer son histoire",
      "description": "Des jeux qui mettent en valeur l'histoire commune du couple.",
      "emoji": "📸",
      "accent": "lavender",
      "mvp": true,
      "order": 4,
      "status": "published"
    },
    {
      "slug": "sortons-de-la-routine",
      "title": "Sortons de la routine",
      "tagline": "Passer à l'action",
      "description": "Des défis qui transforment les jeux numériques en activités réelles.",
      "emoji": "🌿",
      "accent": "graphite",
      "mvp": true,
      "order": 5,
      "status": "published"
    },
    {
      "slug": "notre-avenir",
      "title": "Notre avenir",
      "tagline": "Rêver à deux",
      "description": "Des activités pour nourrir les projets et les rêves partagés.",
      "emoji": "✨",
      "accent": "lavender",
      "mvp": true,
      "order": 6,
      "status": "published"
    },
    {
      "slug": "entre-nous",
      "title": "Entre nous",
      "tagline": "Complicité, romantisme, sensualité",
      "description": "Des jeux complices, tendres et sensuels pour les couples adultes consentants.",
      "emoji": "💞",
      "accent": "coral",
      "mvp": true,
      "order": 7,
      "status": "published"
    }
  ],
  "experiences": [
    {
      "categorySlug": "eclats-de-rire",
      "slug": "qui-de-nous-deux",
      "title": "Qui de nous deux… ?",
      "description": "Chacun répond de son côté, puis vous comparez. Simple, drôle et souvent révélateur.",
      "depth": "leger",
      "themes": [
        "personnalité",
        "quotidien"
      ],
      "estimatedMinutes": 10,
      "modes": [
        "ensemble",
        "a-distance",
        "differe"
      ],
      "type": "questions",
      "status": "published",
      "order": 1
    },
    {
      "categorySlug": "eclats-de-rire",
      "slug": "devine-ma-reponse",
      "title": "Devine ma réponse",
      "description": "Répondez honnêtement, puis essayez de deviner ce que l'autre a répondu.",
      "depth": "leger",
      "themes": [
        "humour",
        "personnalité"
      ],
      "estimatedMinutes": 10,
      "modes": [
        "ensemble",
        "a-distance",
        "differe"
      ],
      "type": "questions",
      "status": "published",
      "order": 2
    },
    {
      "categorySlug": "eclats-de-rire",
      "slug": "defis-rigolos",
      "title": "Défis rigolos",
      "description": "Des défis simples à réaliser ici et maintenant pour faire rire l'autre.",
      "depth": "leger",
      "themes": [
        "défi",
        "rythme"
      ],
      "estimatedMinutes": 5,
      "modes": [
        "defi-individuel",
        "differe"
      ],
      "type": "questions",
      "status": "published",
      "order": 3
    },
    {
      "categorySlug": "eclats-de-rire",
      "slug": "fou-rire-garanti",
      "title": "Fou rire garanti",
      "description": "Des questions absurdes, sans conséquence : le seul but est de rire franchement.",
      "depth": "leger",
      "themes": [
        "humour",
        "complicité"
      ],
      "estimatedMinutes": 10,
      "modes": [
        "ensemble",
        "a-distance",
        "differe"
      ],
      "type": "questions",
      "status": "published",
      "order": 4
    },
    {
      "categorySlug": "eclats-de-rire",
      "slug": "imitation-express",
      "title": "Imitation express",
      "description": "Trois gestes, trente secondes, et l'autre doit deviner. Rien de plus.",
      "depth": "leger",
      "themes": [
        "imitation",
        "jeu"
      ],
      "estimatedMinutes": 5,
      "modes": [
        "defi-individuel",
        "differe"
      ],
      "type": "questions",
      "status": "published",
      "order": 5
    },
    {
      "categorySlug": "eclats-de-rire",
      "slug": "aveux-rigolos",
      "title": "Aveux rigolos",
      "description": "Des petites vérités drôles, à raconter à voix haute — sans se prendre au sérieux.",
      "depth": "leger",
      "themes": [
        "humour",
        "récit"
      ],
      "estimatedMinutes": 10,
      "modes": [
        "ensemble",
        "a-distance",
        "differe"
      ],
      "type": "questions",
      "status": "published",
      "order": 6
    },
    {
      "categorySlug": "eclats-de-rire",
      "slug": "si-j-etais-toi",
      "title": "Si j'étais toi",
      "description": "Répondez à la place de l'autre, puis vérifiez si vous vous connaissez vraiment.",
      "depth": "leger",
      "themes": [
        "personnalité",
        "découverte"
      ],
      "estimatedMinutes": 10,
      "modes": [
        "ensemble",
        "a-distance",
        "differe"
      ],
      "type": "questions",
      "status": "published",
      "order": 7
    },
    {
      "categorySlug": "eclats-de-rire",
      "slug": "souvenirs-d-ecole",
      "title": "Souvenirs d'école",
      "description": "Les surnoms, les excuses et les bêtises de cour de récré. On en rit encore.",
      "depth": "leger",
      "themes": [
        "récit",
        "humour"
      ],
      "estimatedMinutes": 10,
      "modes": [
        "ensemble",
        "a-distance",
        "differe"
      ],
      "type": "questions",
      "status": "published",
      "order": 8
    },
    {
      "categorySlug": "eclats-de-rire",
      "slug": "trente-secondes-chrono",
      "title": "Trente secondes chrono",
      "description": "Un défi, un chronomètre, et aucune excuse. Rire autorisé pendant l'épreuve.",
      "depth": "leger",
      "themes": [
        "défi",
        "rythme"
      ],
      "estimatedMinutes": 5,
      "modes": [
        "defi-individuel",
        "differe",
        "ensemble"
      ],
      "type": "questions",
      "status": "published",
      "order": 9
    },
    {
      "categorySlug": "eclats-de-rire",
      "slug": "vrai-ou-faux",
      "title": "Vrai ou faux",
      "description": "Trois affirmations, un seul mensonge. À l'autre de le débusquer.",
      "depth": "leger",
      "themes": [
        "humour",
        "complicité"
      ],
      "estimatedMinutes": 10,
      "modes": [
        "ensemble",
        "a-distance",
        "differe"
      ],
      "type": "questions",
      "status": "published",
      "order": 10
    },
    {
      "categorySlug": "coeur-a-coeur",
      "slug": "nos-reves",
      "title": "Nos rêves",
      "description": "Vos aspirations, grandes et petites. L'occasion de découvrir ce que l'autre n'a pas encore dit.",
      "depth": "moyen",
      "themes": [
        "rêves",
        "futur"
      ],
      "estimatedMinutes": 15,
      "modes": [
        "ensemble",
        "a-distance",
        "differe"
      ],
      "type": "questions",
      "status": "published",
      "order": 1
    },
    {
      "categorySlug": "coeur-a-coeur",
      "slug": "valeurs-et-habitudes",
      "title": "Valeurs et habitudes",
      "description": "Ce qui compte vraiment pour vous, et ce que vous faites sans y penser.",
      "depth": "moyen",
      "themes": [
        "valeurs",
        "quotidien"
      ],
      "estimatedMinutes": 15,
      "modes": [
        "ensemble",
        "a-distance",
        "differe"
      ],
      "type": "questions",
      "status": "published",
      "order": 2
    },
    {
      "categorySlug": "coeur-a-coeur",
      "slug": "besoins-affectifs",
      "title": "Besoins affectifs",
      "description": "Un espace doux pour exprimer ce dont vous avez besoin, sans jugement.",
      "depth": "profond",
      "themes": [
        "affection",
        "écoute"
      ],
      "estimatedMinutes": 15,
      "modes": [
        "ensemble",
        "a-distance",
        "differe"
      ],
      "type": "questions",
      "status": "published",
      "order": 3
    },
    {
      "categorySlug": "coeur-a-coeur",
      "slug": "nos-petits-rituels",
      "title": "Nos petits rituels",
      "description": "Ce qu'on fait sans y penser, et qui nous tient ensemble. À nommer, à garder, à réinventer.",
      "depth": "moyen",
      "themes": [
        "tendresse",
        "rituels"
      ],
      "estimatedMinutes": 10,
      "modes": [
        "ensemble",
        "a-distance",
        "differe"
      ],
      "type": "questions",
      "status": "published",
      "order": 4
    },
    {
      "categorySlug": "coeur-a-coeur",
      "slug": "ce-qui-nous-fait-du-bien",
      "title": "Ce qui nous fait du bien",
      "description": "Les petites attentions qui comptent vraiment, et celles qui vous manquent encore.",
      "depth": "moyen",
      "themes": [
        "affection",
        "écoute"
      ],
      "estimatedMinutes": 10,
      "modes": [
        "ensemble",
        "a-distance",
        "differe"
      ],
      "type": "questions",
      "status": "published",
      "order": 5
    },
    {
      "categorySlug": "coeur-a-coeur",
      "slug": "dans-un-an-dans-cinq-ans",
      "title": "Dans un an, dans cinq ans",
      "description": "Regarder devant, sans pression : ce qu'on espère, ce qu'on protège, ce qu'on se promet.",
      "depth": "moyen",
      "themes": [
        "futur",
        "rêves"
      ],
      "estimatedMinutes": 15,
      "modes": [
        "ensemble",
        "a-distance",
        "differe"
      ],
      "type": "questions",
      "status": "published",
      "order": 6
    },
    {
      "categorySlug": "coeur-a-coeur",
      "slug": "ce-que-je-ne-t-ai-jamais-dit",
      "title": "Ce que je ne t'ai jamais dit",
      "description": "Des mots gardés trop longtemps. Rien n'est obligatoire, tout est accueilli.",
      "depth": "profond",
      "themes": [
        "relation",
        "écoute"
      ],
      "estimatedMinutes": 15,
      "modes": [
        "ensemble",
        "a-distance",
        "differe"
      ],
      "type": "questions",
      "status": "published",
      "order": 7
    },
    {
      "categorySlug": "coeur-a-coeur",
      "slug": "nos-accords-silencieux",
      "title": "Nos accords silencieux",
      "description": "Ce sur quoi vous êtes d'accord sans jamais en parler — et ce qui mérite d'être dit à voix haute.",
      "depth": "moyen",
      "themes": [
        "valeurs",
        "sécurité"
      ],
      "estimatedMinutes": 10,
      "modes": [
        "ensemble",
        "a-distance",
        "differe"
      ],
      "type": "questions",
      "status": "published",
      "order": 8
    },
    {
      "categorySlug": "coeur-a-coeur",
      "slug": "merci-pour",
      "title": "Merci pour…",
      "description": "Dire merci pour ce qui passe inaperçu. Un des gestes les plus simples, et les plus rares.",
      "depth": "moyen",
      "themes": [
        "attentions",
        "affection"
      ],
      "estimatedMinutes": 10,
      "modes": [
        "ensemble",
        "a-distance",
        "differe"
      ],
      "type": "questions",
      "status": "published",
      "order": 9
    },
    {
      "categorySlug": "coeur-a-coeur",
      "slug": "quand-je-pense-a-nous",
      "title": "Quand je pense à nous",
      "description": "Ce que votre histoire a changé, en vous et entre vous. Une conversation lente.",
      "depth": "profond",
      "themes": [
        "tendresse",
        "relation"
      ],
      "estimatedMinutes": 15,
      "modes": [
        "ensemble",
        "a-distance",
        "differe"
      ],
      "type": "questions",
      "status": "published",
      "order": 10
    },
    {
      "categorySlug": "flirt-et-etincelles",
      "slug": "compliments-mysteres",
      "title": "Compliments mystères",
      "description": "Un compliment sincère, révélé au même moment. Non explicite, toujours tendre.",
      "depth": "leger",
      "themes": [
        "tendresse"
      ],
      "estimatedMinutes": 10,
      "modes": [
        "ensemble",
        "a-distance",
        "differe",
        "defi-individuel"
      ],
      "type": "questions",
      "status": "published",
      "order": 1
    },
    {
      "categorySlug": "flirt-et-etincelles",
      "slug": "tu-preferes-romantique",
      "title": "Tu préfères ? (version romantique)",
      "description": "Des dilemmes doux pour découvrir vos envies et vos goûts.",
      "depth": "leger",
      "themes": [
        "romantisme",
        "préférences"
      ],
      "estimatedMinutes": 10,
      "modes": [
        "ensemble",
        "a-distance",
        "differe"
      ],
      "type": "questions",
      "status": "published",
      "order": 2
    },
    {
      "categorySlug": "flirt-et-etincelles",
      "slug": "petites-attentions",
      "title": "Petites attentions",
      "description": "Une mission toute simple à préparer pour l'autre, à réaliser dans les prochains jours.",
      "depth": "leger",
      "themes": [
        "attentions",
        "défi"
      ],
      "estimatedMinutes": 5,
      "modes": [
        "defi-individuel",
        "differe"
      ],
      "type": "questions",
      "status": "published",
      "order": 3
    },
    {
      "categorySlug": "flirt-et-etincelles",
      "slug": "etincelles-du-quotidien",
      "title": "Étincelles du quotidien",
      "description": "Le flirt ne vit pas que dans les grands moments. Il se glisse partout, même entre deux courses.",
      "depth": "leger",
      "themes": [
        "séduction",
        "quotidien"
      ],
      "estimatedMinutes": 10,
      "modes": [
        "ensemble",
        "a-distance",
        "differe"
      ],
      "type": "questions",
      "status": "published",
      "order": 4
    },
    {
      "categorySlug": "flirt-et-etincelles",
      "slug": "messages-qui-font-battre-le-coeur",
      "title": "Messages qui font battre le cœur",
      "description": "Écrire, sans se cacher derrière l'habitude. Ce que vous vous diriez si vous osiez.",
      "depth": "leger",
      "themes": [
        "tendresse",
        "séduction"
      ],
      "estimatedMinutes": 10,
      "modes": [
        "ensemble",
        "a-distance",
        "differe"
      ],
      "type": "questions",
      "status": "published",
      "order": 5
    },
    {
      "categorySlug": "flirt-et-etincelles",
      "slug": "rendez-vous-secret",
      "title": "Rendez-vous secret",
      "description": "Imaginer le prochain moment rien qu'à vous deux, sans logistique ni excuse.",
      "depth": "leger",
      "themes": [
        "rendez-vous",
        "surprise"
      ],
      "estimatedMinutes": 10,
      "modes": [
        "ensemble",
        "a-distance",
        "differe"
      ],
      "type": "questions",
      "status": "published",
      "order": 6
    },
    {
      "categorySlug": "flirt-et-etincelles",
      "slug": "jeu-du-regard",
      "title": "Le jeu du regard",
      "description": "Cinq minutes d'audace douce : se regarder, se parler, se faire sourire.",
      "depth": "leger",
      "themes": [
        "séduction",
        "jeu"
      ],
      "estimatedMinutes": 5,
      "modes": [
        "defi-individuel",
        "differe",
        "ensemble"
      ],
      "type": "questions",
      "status": "published",
      "order": 7
    },
    {
      "categorySlug": "flirt-et-etincelles",
      "slug": "ce-qui-me-seduit-chez-toi",
      "title": "Ce qui me séduit chez toi",
      "description": "Le dire clairement, une fois, sans détour. Cela change tout.",
      "depth": "moyen",
      "themes": [
        "séduction",
        "tendresse"
      ],
      "estimatedMinutes": 10,
      "modes": [
        "ensemble",
        "a-distance",
        "differe"
      ],
      "type": "questions",
      "status": "published",
      "order": 8
    },
    {
      "categorySlug": "flirt-et-etincelles",
      "slug": "nos-premiers-instants",
      "title": "Nos premiers instants",
      "description": "Revenir au début, quand tout était incertain. Ce qui vous a plu avant tout le reste.",
      "depth": "leger",
      "themes": [
        "récit",
        "romantisme"
      ],
      "estimatedMinutes": 10,
      "modes": [
        "ensemble",
        "a-distance",
        "differe"
      ],
      "type": "questions",
      "status": "published",
      "order": 9
    },
    {
      "categorySlug": "flirt-et-etincelles",
      "slug": "audace-douce",
      "title": "Audace douce",
      "description": "Des défis tendres, jamais explicites : juste ce qu'il faut pour faire battre le cœur.",
      "depth": "moyen",
      "themes": [
        "séduction",
        "surprise"
      ],
      "estimatedMinutes": 10,
      "modes": [
        "defi-individuel",
        "differe"
      ],
      "type": "questions",
      "status": "published",
      "order": 10
    },
    {
      "categorySlug": "nos-souvenirs",
      "slug": "premier-baiser",
      "title": "Premier baiser",
      "description": "Revivez ce moment qui a tout changé. Comment ça s'est passé, ce que vous ressentez aujourd'hui.",
      "depth": "moyen",
      "themes": [
        "tendresse",
        "romantisme"
      ],
      "estimatedMinutes": 10,
      "modes": [
        "ensemble",
        "a-distance",
        "differe"
      ],
      "type": "questions",
      "status": "published",
      "order": 1
    },
    {
      "categorySlug": "nos-souvenirs",
      "slug": "voyage-dont-on-reve",
      "title": "Le voyage dont on rêve",
      "description": "Ce voyage qu'on ne fera peut-être jamais, mais qu'on se plaît à imaginer ensemble.",
      "depth": "leger",
      "themes": [
        "futur",
        "rêves"
      ],
      "estimatedMinutes": 10,
      "modes": [
        "ensemble",
        "a-distance",
        "differe"
      ],
      "type": "questions",
      "status": "published",
      "order": 2
    },
    {
      "categorySlug": "nos-souvenirs",
      "slug": "jour-ou-tout-a-change",
      "title": "Le jour où tout a changé",
      "description": "Ce jour précis où quelque chose dans notre relation a basculé, pour le meilleur.",
      "depth": "profond",
      "themes": [
        "relation",
        "tendresse"
      ],
      "estimatedMinutes": 15,
      "modes": [
        "ensemble",
        "a-distance",
        "differe"
      ],
      "type": "questions",
      "status": "published",
      "order": 3
    },
    {
      "categorySlug": "nos-souvenirs",
      "slug": "ce-qui-nous-rapproche",
      "title": "Ce qui nous rapproche",
      "description": "Les moments où vous vous sentez plus proches que jamais. À rappeler, à reproduire.",
      "depth": "moyen",
      "themes": [
        "relation",
        "complicité"
      ],
      "estimatedMinutes": 10,
      "modes": [
        "ensemble",
        "a-distance",
        "differe"
      ],
      "type": "questions",
      "status": "published",
      "order": 4
    },
    {
      "categorySlug": "nos-souvenirs",
      "slug": "lhistoire-quon-raconte",
      "title": "L'histoire qu'on raconte",
      "description": "Cette anecdote qu'on ressort à chaque fois, celle qu'on raconte à nos proches.",
      "depth": "leger",
      "themes": [
        "récit",
        "complicité"
      ],
      "estimatedMinutes": 10,
      "modes": [
        "ensemble",
        "a-distance",
        "differe"
      ],
      "type": "questions",
      "status": "published",
      "order": 5
    },
    {
      "categorySlug": "nos-souvenirs",
      "slug": "notre-premier",
      "title": "Notre premier…",
      "description": "Le premier repas, le premier weekend, le premier cadeau. Les petites fois.",
      "depth": "moyen",
      "themes": [
        "récit",
        "tendresse"
      ],
      "estimatedMinutes": 10,
      "modes": [
        "ensemble",
        "a-distance",
        "differe"
      ],
      "type": "questions",
      "status": "published",
      "order": 6
    },
    {
      "categorySlug": "nos-souvenirs",
      "slug": "notre-premiere-dispute",
      "title": "Notre première dispute",
      "description": "Quand le doute est venu. Comment vous l'avez traversée, et ce qu'elle a appris.",
      "depth": "profond",
      "themes": [
        "relation",
        "écoute"
      ],
      "estimatedMinutes": 15,
      "modes": [
        "ensemble",
        "a-distance",
        "differe"
      ],
      "type": "questions",
      "status": "published",
      "order": 7
    },
    {
      "categorySlug": "nos-souvenirs",
      "slug": "le-cadeau-le-plus-moyen",
      "title": "Le cadeau le plus marquant",
      "description": "Pas forcément le plus cher, mais celui qui a vraiment touché.",
      "depth": "moyen",
      "themes": [
        "attentions",
        "tendresse"
      ],
      "estimatedMinutes": 10,
      "modes": [
        "ensemble",
        "a-distance",
        "differe"
      ],
      "type": "questions",
      "status": "published",
      "order": 8
    },
    {
      "categorySlug": "nos-souvenirs",
      "slug": "le-rire-qui-nous-unis",
      "title": "Le rire qui nous a unis",
      "description": "Ce moment où vous avez éclaté de rire ensemble, sans contrôle.",
      "depth": "leger",
      "themes": [
        "humour",
        "complicité"
      ],
      "estimatedMinutes": 10,
      "modes": [
        "ensemble",
        "a-distance",
        "differe"
      ],
      "type": "questions",
      "status": "published",
      "order": 9
    },
    {
      "categorySlug": "nos-souvenirs",
      "slug": "ce-que-tu-veux-quon-garde",
      "title": "Ce que tu veux qu'on garde",
      "description": "Les souvenirs, les habitudes, les petites choses qu'on ne veut pas perdre.",
      "depth": "profond",
      "themes": [
        "relation",
        "futur"
      ],
      "estimatedMinutes": 15,
      "modes": [
        "ensemble",
        "a-distance",
        "differe"
      ],
      "type": "questions",
      "status": "published",
      "order": 10
    },
    {
      "categorySlug": "sortons-de-la-routine",
      "slug": "surprises-simples",
      "title": "Surprises simples",
      "description": "Des idées concrètes de surprises faciles à organiser, sans budget important.",
      "depth": "leger",
      "themes": [
        "surprise",
        "concret"
      ],
      "estimatedMinutes": 5,
      "modes": [
        "defi-individuel",
        "differe"
      ],
      "type": "questions",
      "status": "published",
      "order": 1
    },
    {
      "categorySlug": "sortons-de-la-routine",
      "slug": "nouvelle-activite",
      "title": "Nouvelle activité",
      "description": "Sortir de l'ordinaire en essayant quelque chose que vous n'avez jamais fait.",
      "depth": "leger",
      "themes": [
        "découverte"
      ],
      "estimatedMinutes": 5,
      "modes": [
        "defi-individuel",
        "differe",
        "ensemble"
      ],
      "type": "questions",
      "status": "published",
      "order": 2
    },
    {
      "categorySlug": "sortons-de-la-routine",
      "slug": "rendez-vous-a-tour-de-role",
      "title": "Rendez-vous à tour de rôle",
      "description": "Chacun prépare un rendez-vous pour l'autre, à son tour, avec un budget libre.",
      "depth": "moyen",
      "themes": [
        "rendez-vous",
        "organisation"
      ],
      "estimatedMinutes": 10,
      "modes": [
        "ensemble",
        "a-distance",
        "differe"
      ],
      "type": "questions",
      "status": "published",
      "order": 3
    },
    {
      "categorySlug": "entre-nous",
      "slug": "questions-intimes",
      "title": "Questions intimes",
      "description": "Des questions simples pour se révéler, à chaque niveau.",
      "depth": "moyen",
      "themes": [
        "relation",
        "tendresse"
      ],
      "estimatedMinutes": 10,
      "modes": [
        "ensemble",
        "a-distance",
        "differe"
      ],
      "type": "questions",
      "status": "published",
      "order": 1
    },
    {
      "categorySlug": "entre-nous",
      "slug": "compliments-guides",
      "title": "Compliments guidés",
      "description": "Des compliments précis, pas génériques. Apparence, personnalité, désir, gratitude.",
      "depth": "moyen",
      "themes": [
        "tendresse",
        "affection"
      ],
      "estimatedMinutes": 10,
      "modes": [
        "ensemble",
        "a-distance",
        "differe"
      ],
      "type": "questions",
      "status": "published",
      "order": 2
    },
    {
      "categorySlug": "entre-nous",
      "slug": "souvenirs-sensuels",
      "title": "Souvenirs sensuels",
      "description": "Revivez les moments où les sens étaient en éveil.",
      "depth": "profond",
      "themes": [
        "tendresse",
        "relation"
      ],
      "estimatedMinutes": 15,
      "modes": [
        "ensemble",
        "a-distance",
        "differe"
      ],
      "type": "questions",
      "status": "published",
      "order": 3
    },
    {
      "categorySlug": "entre-nous",
      "slug": "defis-tendresse",
      "title": "Défis de tendresse",
      "description": "Des petits gestes doux pour se rapprocher.",
      "depth": "moyen",
      "themes": [
        "affection",
        "tendresse"
      ],
      "estimatedMinutes": 5,
      "modes": [
        "defi-individuel",
        "differe"
      ],
      "type": "questions",
      "status": "published",
      "order": 4
    },
    {
      "categorySlug": "entre-nous",
      "slug": "fantasme-a-raconter",
      "title": "Fantasme à raconter",
      "description": "Un fantasme, une envie, un rêve. À partager ou à garder pour soi.",
      "depth": "profond",
      "themes": [
        "relation",
        "tendresse"
      ],
      "estimatedMinutes": 10,
      "modes": [
        "ensemble",
        "a-distance",
        "differe"
      ],
      "type": "questions",
      "status": "published",
      "order": 5
    },
    {
      "categorySlug": "entre-nous",
      "slug": "scene-a-deux",
      "title": "Scène à deux",
      "description": "Créez un moment ensemble : lieu, ambiance, musique, rôle.",
      "depth": "profond",
      "themes": [
        "relation",
        "tendresse"
      ],
      "estimatedMinutes": 15,
      "modes": [
        "ensemble",
        "a-distance",
        "differe"
      ],
      "type": "questions",
      "status": "published",
      "order": 6
    },
    {
      "categorySlug": "entre-nous",
      "slug": "marche-envies",
      "title": "Marché aux envies",
      "description": "Choisissons ensemble ce qu'on veut vivre ensemble.",
      "depth": "moyen",
      "themes": [
        "relation",
        "affection"
      ],
      "estimatedMinutes": 10,
      "modes": [
        "ensemble",
        "a-distance",
        "differe"
      ],
      "type": "questions",
      "status": "published",
      "order": 7
    },
    {
      "categorySlug": "entre-nous",
      "slug": "rencontre-myster",
      "title": "Rendez-vous mystère",
      "description": "Un programme surprise, organisé par l'un des deux.",
      "depth": "moyen",
      "themes": [
        "relation",
        "surprise"
      ],
      "estimatedMinutes": 15,
      "modes": [
        "ensemble",
        "a-distance",
        "differe"
      ],
      "type": "questions",
      "status": "published",
      "order": 8
    },
    {
      "categorySlug": "entre-nous",
      "slug": "distance-intimite",
      "title": "Intimité à distance",
      "description": "Se retrouver quand on n'est pas ensemble.",
      "depth": "moyen",
      "themes": [
        "relation",
        "tendresse"
      ],
      "estimatedMinutes": 10,
      "modes": [
        "defi-individuel",
        "ensemble"
      ],
      "type": "questions",
      "status": "published",
      "order": 9
    },
    {
      "categorySlug": "entre-nous",
      "slug": "questions-oui-non-peut-etre",
      "title": "Oui, non, peut-être",
      "description": "Des questions simples, des réponses franches.",
      "depth": "moyen",
      "themes": [
        "relation",
        "préférences"
      ],
      "estimatedMinutes": 10,
      "modes": [
        "ensemble",
        "a-distance",
        "differe"
      ],
      "type": "questions",
      "status": "published",
      "order": 10
    }
  ],
  "questions": [
    {
      "experienceSlug": "nos-reves",
      "kind": "open",
      "prompt": "Quel rêve n'as-tu jamais osé réaliser, et pourquoi ?",
      "depth": "moyen",
      "themes": [
        "rêves"
      ],
      "order": 1,
      "status": "published"
    },
    {
      "experienceSlug": "nos-reves",
      "kind": "open",
      "prompt": "Si tu pouvais apprendre une seule chose, ce serait quoi ?",
      "depth": "leger",
      "themes": [
        "apprentissage"
      ],
      "order": 2,
      "status": "published"
    },
    {
      "experienceSlug": "nos-reves",
      "kind": "open",
      "prompt": "Quel voyage t'habite depuis longtemps ?",
      "depth": "leger",
      "themes": [
        "voyage"
      ],
      "order": 3,
      "status": "published"
    },
    {
      "experienceSlug": "nos-reves",
      "kind": "open",
      "prompt": "Dans dix ans, à quoi ressemble ta journée idéale avec moi ?",
      "depth": "profond",
      "themes": [
        "futur"
      ],
      "order": 4,
      "status": "published"
    },
    {
      "experienceSlug": "nos-reves",
      "kind": "choice",
      "prompt": "Selon toi, qu'est-ce qui nous rapprocherait le plus ?",
      "depth": "moyen",
      "themes": [
        "relation"
      ],
      "order": 5,
      "status": "published",
      "options": [
        "Plus de temps ensemble",
        "De nouveaux projets",
        "Plus de douceur au quotidien",
        "Voyager davantage"
      ]
    },
    {
      "experienceSlug": "tu-preferes-romantique",
      "kind": "choice",
      "prompt": "Tu préfères…",
      "depth": "leger",
      "themes": [
        "rendez-vous"
      ],
      "order": 1,
      "status": "published",
      "options": [
        "Un dîner aux chandelles",
        "Une soirée sur un toit",
        "Un pique-nique improvisé",
        "Un moment cosy à la maison"
      ]
    },
    {
      "experienceSlug": "tu-preferes-romantique",
      "kind": "choice",
      "prompt": "Tu préfères recevoir…",
      "depth": "leger",
      "themes": [
        "affection"
      ],
      "order": 2,
      "status": "published",
      "options": [
        "Un compliment sincère",
        "Une attention préparée",
        "Du temps rien qu'à deux",
        "Une surprise spontanée"
      ]
    },
    {
      "experienceSlug": "defis-rigolos",
      "kind": "challenge",
      "prompt": "Imite le rire de ton partenaire pendant 10 secondes, sans parler.",
      "depth": "leger",
      "themes": [
        "imitation"
      ],
      "order": 1,
      "status": "published"
    },
    {
      "experienceSlug": "defis-rigolos",
      "kind": "challenge",
      "prompt": "Fais une imitation de ton animal préféré pendant 30 secondes",
      "depth": "leger",
      "themes": [
        "humour",
        "jeu"
      ],
      "order": 2,
      "status": "published"
    },
    {
      "experienceSlug": "defis-rigolos",
      "kind": "challenge",
      "prompt": "Raconte un souvenir en exagérant énormément les détails.",
      "depth": "leger",
      "themes": [
        "récit"
      ],
      "order": 3,
      "status": "published"
    },
    {
      "experienceSlug": "defis-rigolos",
      "kind": "challenge",
      "prompt": "Danse ta chanson préférée sans musique",
      "depth": "leger",
      "themes": [
        "humour",
        "jeu"
      ],
      "order": 4,
      "status": "published"
    },
    {
      "experienceSlug": "defis-rigolos",
      "kind": "challenge",
      "prompt": "Chante une chanson que tu connais mal, en étant très sérieux.",
      "depth": "leger",
      "themes": [
        "imitation"
      ],
      "order": 5,
      "status": "published"
    },
    {
      "experienceSlug": "defis-rigolos",
      "kind": "challenge",
      "prompt": "Dis ton prénom avec l'accent de ton choix",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 6,
      "status": "published"
    },
    {
      "experienceSlug": "defis-rigolos",
      "kind": "challenge",
      "prompt": "Fais deviner un film en trois gestes seulement.",
      "depth": "leger",
      "themes": [
        "jeu"
      ],
      "order": 7,
      "status": "published"
    },
    {
      "experienceSlug": "defis-rigolos",
      "kind": "challenge",
      "prompt": "Imite un robot pendant une minute",
      "depth": "leger",
      "themes": [
        "humour",
        "jeu"
      ],
      "order": 8,
      "status": "published"
    },
    {
      "experienceSlug": "defis-rigolos",
      "kind": "choice",
      "prompt": "Qui va réussir le mieux le défi ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 9,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On est pareils"
      ]
    },
    {
      "experienceSlug": "defis-rigolos",
      "kind": "choice",
      "prompt": "Qui va rire le plus pendant le défi ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 10,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On est pareils"
      ]
    },
    {
      "experienceSlug": "defis-rigolos",
      "kind": "choice",
      "prompt": "Qui va abandonner le premier ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 11,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On est pareils"
      ]
    },
    {
      "experienceSlug": "defis-rigolos",
      "kind": "challenge",
      "prompt": "Fais rire l'autre en 30 secondes",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 12,
      "status": "published"
    },
    {
      "experienceSlug": "defis-rigolos",
      "kind": "challenge",
      "prompt": "Parle uniquement en questions pendant 1 minute",
      "depth": "leger",
      "themes": [
        "humour",
        "jeu"
      ],
      "order": 13,
      "status": "published"
    },
    {
      "experienceSlug": "defis-rigolos",
      "kind": "challenge",
      "prompt": "Crée un texte de rap sur place",
      "depth": "leger",
      "themes": [
        "humour",
        "jeu"
      ],
      "order": 14,
      "status": "published"
    },
    {
      "experienceSlug": "defis-rigolos",
      "kind": "choice",
      "prompt": "Qui est le meilleur comédien ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 15,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On est pareils"
      ]
    },
    {
      "experienceSlug": "defis-rigolos",
      "kind": "choice",
      "prompt": "Qui a le rire le plus bizarre ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 16,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On est pareils"
      ]
    },
    {
      "experienceSlug": "defis-rigolos",
      "kind": "challenge",
      "prompt": "Fais semblant de recevoir un appel téléphonique",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 17,
      "status": "published"
    },
    {
      "experienceSlug": "defis-rigolos",
      "kind": "challenge",
      "prompt": "Montre un mimétisme d'animal au choix",
      "depth": "leger",
      "themes": [
        "humour",
        "jeu"
      ],
      "order": 18,
      "status": "published"
    },
    {
      "experienceSlug": "defis-rigolos",
      "kind": "choice",
      "prompt": "Qui va faire la meilleure performance ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 19,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On est pareils"
      ]
    },
    {
      "experienceSlug": "defis-rigolos",
      "kind": "challenge",
      "prompt": "Dis un discours de 30 secondes sur un sujet au hasard",
      "depth": "leger",
      "themes": [
        "humour",
        "jeu"
      ],
      "order": 20,
      "status": "published"
    },
    {
      "experienceSlug": "defis-rigolos",
      "kind": "challenge",
      "prompt": "Crée une nouvelle chanson avec n'importe quels mots",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 21,
      "status": "published"
    },
    {
      "experienceSlug": "defis-rigolos",
      "kind": "choice",
      "prompt": "Qui a le plus d'imagination ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 22,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On est pareils"
      ]
    },
    {
      "experienceSlug": "defis-rigolos",
      "kind": "choice",
      "prompt": "Qui va choisir le prochain défi ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 23,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On est pareils"
      ]
    },
    {
      "experienceSlug": "defis-rigolos",
      "kind": "challenge",
      "prompt": "Fais une statue vivante pendant 1 minute",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 24,
      "status": "published"
    },
    {
      "experienceSlug": "defis-rigolos",
      "kind": "challenge",
      "prompt": "Raconte une blague que personne n'a encore entendue",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 25,
      "status": "published"
    },
    {
      "experienceSlug": "surprises-simples",
      "kind": "challenge",
      "prompt": "Organise une surprise qui coûte moins que le prix d'un café.",
      "depth": "leger",
      "themes": [
        "budget"
      ],
      "order": 1,
      "status": "published"
    },
    {
      "experienceSlug": "surprises-simples",
      "kind": "challenge",
      "prompt": "Range un espace de la maison que l'autre n'aime pas ranger.",
      "depth": "leger",
      "themes": [
        "quotidien"
      ],
      "order": 2,
      "status": "published"
    },
    {
      "experienceSlug": "surprises-simples",
      "kind": "challenge",
      "prompt": "Prépare le repas préféré de l'autre sans le lui dire à l'avance.",
      "depth": "leger",
      "themes": [
        "attention"
      ],
      "order": 3,
      "status": "published"
    },
    {
      "experienceSlug": "surprises-simples",
      "kind": "choice",
      "prompt": "Quelle surprise aimerais-tu recevoir en priorité ?",
      "depth": "leger",
      "themes": [
        "préférences"
      ],
      "order": 4,
      "status": "published",
      "options": [
        "Un moment improvisé",
        "Une attention préparée",
        "Une sortie inattendue",
        "Un cadeau symbolique"
      ]
    },
    {
      "experienceSlug": "qui-de-nous-deux",
      "kind": "choice",
      "prompt": "Qui de nous deux est le plus matinal ?",
      "depth": "leger",
      "themes": [
        "quotidien"
      ],
      "order": 1,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On se ressemble",
        "Aucun des deux"
      ]
    },
    {
      "experienceSlug": "qui-de-nous-deux",
      "kind": "choice",
      "prompt": "Qui oublie le plus souvent ses affaires ?",
      "depth": "leger",
      "themes": [
        "quotidien"
      ],
      "order": 2,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On se ressemble",
        "Aucun des deux"
      ]
    },
    {
      "experienceSlug": "qui-de-nous-deux",
      "kind": "choice",
      "prompt": "Qui est le plus susceptible de parler à un inconnu ?",
      "depth": "leger",
      "themes": [
        "personnalité"
      ],
      "order": 3,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On se ressemble",
        "Aucun des deux"
      ]
    },
    {
      "experienceSlug": "qui-de-nous-deux",
      "kind": "choice",
      "prompt": "Qui prend le plus de temps pour se préparer ?",
      "depth": "leger",
      "themes": [
        "quotidien"
      ],
      "order": 4,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On se ressemble",
        "Aucun des deux"
      ]
    },
    {
      "experienceSlug": "qui-de-nous-deux",
      "kind": "choice",
      "prompt": "Qui craque en premier devant une envie de sucré ?",
      "depth": "leger",
      "themes": [
        "quotidien"
      ],
      "order": 5,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On se ressemble",
        "Aucun des deux"
      ]
    },
    {
      "experienceSlug": "qui-de-nous-deux",
      "kind": "choice",
      "prompt": "Qui gagne le plus souvent quand vous êtes en désaccord ?",
      "depth": "leger",
      "themes": [
        "complicité"
      ],
      "order": 6,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On se ressemble",
        "Aucun des deux"
      ]
    },
    {
      "experienceSlug": "qui-de-nous-deux",
      "kind": "choice",
      "prompt": "Qui a le rire le plus contagieux ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 7,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On se ressemble",
        "Aucun des deux"
      ]
    },
    {
      "experienceSlug": "qui-de-nous-deux",
      "kind": "choice",
      "prompt": "Qui est le plus susceptible de s'enfermer dans un placard ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 8,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On se ressemble",
        "Aucun des deux"
      ]
    },
    {
      "experienceSlug": "qui-de-nous-deux",
      "kind": "choice",
      "prompt": "Qui fait le plus de fautes de frappe ?",
      "depth": "leger",
      "themes": [
        "quotidien"
      ],
      "order": 9,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On se ressemble",
        "Aucun des deux"
      ]
    },
    {
      "experienceSlug": "qui-de-nous-deux",
      "kind": "choice",
      "prompt": "Qui est le plus susceptible de s'endormir devant la télé ?",
      "depth": "leger",
      "themes": [
        "quotidien"
      ],
      "order": 10,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On se ressemble",
        "Aucun des deux"
      ]
    },
    {
      "experienceSlug": "qui-de-nous-deux",
      "kind": "choice",
      "prompt": "Qui est le plus susceptible d'acheter des vêtements trop grands ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 11,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On se ressemble",
        "Aucun des deux"
      ]
    },
    {
      "experienceSlug": "qui-de-nous-deux",
      "kind": "choice",
      "prompt": "Qui est le plus susceptible de se perdre en voiture ?",
      "depth": "leger",
      "themes": [
        "quotidien"
      ],
      "order": 12,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On se ressemble",
        "Aucun des deux"
      ]
    },
    {
      "experienceSlug": "qui-de-nous-deux",
      "kind": "choice",
      "prompt": "Qui est le plus susceptible de faire la sieste ?",
      "depth": "leger",
      "themes": [
        "quotidien"
      ],
      "order": 13,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On se ressemble",
        "Aucun des deux"
      ]
    },
    {
      "experienceSlug": "qui-de-nous-deux",
      "kind": "choice",
      "prompt": "Qui est le plus susceptible de regarder la télé en mangeant ?",
      "depth": "leger",
      "themes": [
        "quotidien"
      ],
      "order": 14,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On se ressemble",
        "Aucun des deux"
      ]
    },
    {
      "experienceSlug": "qui-de-nous-deux",
      "kind": "choice",
      "prompt": "Qui est le plus susceptible de parler dans son sommeil ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 15,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On se ressemble",
        "Aucun des deux"
      ]
    },
    {
      "experienceSlug": "qui-de-nous-deux",
      "kind": "choice",
      "prompt": "Qui est le plus susceptible de s'excuser même quand ce n'est pas de sa faute ?",
      "depth": "leger",
      "themes": [
        "personnalité"
      ],
      "order": 16,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On se ressemble",
        "Aucun des deux"
      ]
    },
    {
      "experienceSlug": "qui-de-nous-deux",
      "kind": "choice",
      "prompt": "Qui est le plus susceptible de chanter dans la douche ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 17,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On se ressemble",
        "Aucun des deux"
      ]
    },
    {
      "experienceSlug": "qui-de-nous-deux",
      "kind": "choice",
      "prompt": "Qui est le plus susceptible de se plaindre d'avoir mal dormi ?",
      "depth": "leger",
      "themes": [
        "quotidien"
      ],
      "order": 18,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On se ressemble",
        "Aucun des deux"
      ]
    },
    {
      "experienceSlug": "qui-de-nous-deux",
      "kind": "choice",
      "prompt": "Qui est le plus susceptible de faire les magasins sans rien acheter ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 19,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On se ressemble",
        "Aucun des deux"
      ]
    },
    {
      "experienceSlug": "qui-de-nous-deux",
      "kind": "choice",
      "prompt": "Qui est le plus susceptible de s'endormir sur le canapé ?",
      "depth": "leger",
      "themes": [
        "quotidien"
      ],
      "order": 20,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On se ressemble",
        "Aucun des deux"
      ]
    },
    {
      "experienceSlug": "qui-de-nous-deux",
      "kind": "choice",
      "prompt": "Qui est le plus susceptible de faire des grimaces ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 21,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On se ressemble",
        "Aucun des deux"
      ]
    },
    {
      "experienceSlug": "petites-attentions",
      "kind": "challenge",
      "prompt": "Prépare un message inattendu qui commence par « Je pensais à toi parce que… ».",
      "depth": "leger",
      "themes": [
        "attentions"
      ],
      "order": 1,
      "status": "published"
    },
    {
      "experienceSlug": "petites-attentions",
      "kind": "challenge",
      "prompt": "Prépare cette semaine un petit déjeuner surprise.",
      "depth": "leger",
      "themes": [
        "attentions"
      ],
      "order": 2,
      "status": "published"
    },
    {
      "experienceSlug": "petites-attentions",
      "kind": "challenge",
      "prompt": "Mets un mot doux dans un endroit que l'autre découvrira par hasard.",
      "depth": "leger",
      "themes": [
        "attentions"
      ],
      "order": 3,
      "status": "published"
    },
    {
      "experienceSlug": "devine-ma-reponse",
      "kind": "choice",
      "prompt": "Si on partait demain sans préparer, où irais-tu ?",
      "depth": "leger",
      "themes": [
        "voyage"
      ],
      "order": 1,
      "status": "published",
      "options": [
        "La plage",
        "La montagne",
        "Une grande ville",
        "Rien, j'aime être à la maison"
      ]
    },
    {
      "experienceSlug": "devine-ma-reponse",
      "kind": "choice",
      "prompt": "Quel est ton petit plaisir coupable ?",
      "depth": "leger",
      "themes": [
        "quotidien"
      ],
      "order": 2,
      "status": "published",
      "options": [
        "Les séries jusqu'à tard",
        "Un dessert",
        "Les longs bains",
        "Ne rien faire du tout"
      ]
    },
    {
      "experienceSlug": "devine-ma-reponse",
      "kind": "choice",
      "prompt": "Quel est le pire cadeau à te faire ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 3,
      "status": "published",
      "options": [
        "Une chaussette",
        "Un appareil de cuisine",
        "Un livre que je ne lirai jamais",
        "Rien du tout"
      ]
    },
    {
      "experienceSlug": "devine-ma-reponse",
      "kind": "open",
      "prompt": "Quelle chanson te fait immédiatement danser ?",
      "depth": "leger",
      "themes": [
        "musique"
      ],
      "order": 4,
      "status": "published"
    },
    {
      "experienceSlug": "devine-ma-reponse",
      "kind": "open",
      "prompt": "Quel est ton plus grand talent caché ?",
      "depth": "leger",
      "themes": [
        "personnalité"
      ],
      "order": 5,
      "status": "published"
    },
    {
      "experienceSlug": "devine-ma-reponse",
      "kind": "choice",
      "prompt": "Qui va répondre le plus vite ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 6,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On est pareils"
      ]
    },
    {
      "experienceSlug": "devine-ma-reponse",
      "kind": "choice",
      "prompt": "Qui va choisir la réponse la plus folle ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 7,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On est pareils"
      ]
    },
    {
      "experienceSlug": "devine-ma-reponse",
      "kind": "choice",
      "prompt": "Qui va répondre le plus sérieusement ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 8,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On est pareils"
      ]
    },
    {
      "experienceSlug": "devine-ma-reponse",
      "kind": "choice",
      "prompt": "Qui va inventer une réponse complètement absurde ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 9,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On est pareils"
      ]
    },
    {
      "experienceSlug": "devine-ma-reponse",
      "kind": "choice",
      "prompt": "Qui va essayer de piéger l'autre ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 10,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On est pareils"
      ]
    },
    {
      "experienceSlug": "devine-ma-reponse",
      "kind": "choice",
      "prompt": "Qui va donner la réponse la plus inattendue ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 11,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On est pareils"
      ]
    },
    {
      "experienceSlug": "devine-ma-reponse",
      "kind": "choice",
      "prompt": "Qui va essayer de deviner ce que l'autre va répondre ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 12,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On est pareils"
      ]
    },
    {
      "experienceSlug": "devine-ma-reponse",
      "kind": "choice",
      "prompt": "Qui va choisir la réponse la plus safe ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 13,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On est pareils"
      ]
    },
    {
      "experienceSlug": "devine-ma-reponse",
      "kind": "choice",
      "prompt": "Qui va avoir le meilleur timing ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 14,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On est pareils"
      ]
    },
    {
      "experienceSlug": "devine-ma-reponse",
      "kind": "choice",
      "prompt": "Qui va rire le plus fort de sa propre réponse ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 15,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On est pareils"
      ]
    },
    {
      "experienceSlug": "devine-ma-reponse",
      "kind": "choice",
      "prompt": "Qui va essayer d'imiter l'autre ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 16,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On est pareils"
      ]
    },
    {
      "experienceSlug": "devine-ma-reponse",
      "kind": "choice",
      "prompt": "Qui va surprendre l'autre ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 17,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On est pareils"
      ]
    },
    {
      "experienceSlug": "devine-ma-reponse",
      "kind": "choice",
      "prompt": "Qui va être le plus stratégique ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 18,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On est pareils"
      ]
    },
    {
      "experienceSlug": "devine-ma-reponse",
      "kind": "choice",
      "prompt": "Qui va choisir la réponse la plus mignonne ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 19,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On est pareils"
      ]
    },
    {
      "experienceSlug": "devine-ma-reponse",
      "kind": "choice",
      "prompt": "Qui va choisir la réponse la plus drôle ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 20,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On est pareils"
      ]
    },
    {
      "experienceSlug": "devine-ma-reponse",
      "kind": "choice",
      "prompt": "Qui va rire le plus de l'histoire ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 21,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On est pareils"
      ]
    },
    {
      "experienceSlug": "compliments-mysteres",
      "kind": "open",
      "prompt": "Quel détail physique chez l'autre te fait encore sourire ?",
      "depth": "leger",
      "themes": [
        "tendresse"
      ],
      "order": 1,
      "status": "published"
    },
    {
      "experienceSlug": "compliments-mysteres",
      "kind": "open",
      "prompt": "Qu'est-ce que l'autre fait sans s'en rendre compte mais qui te séduit ?",
      "depth": "leger",
      "themes": [
        "séduction"
      ],
      "order": 2,
      "status": "published"
    },
    {
      "experienceSlug": "compliments-mysteres",
      "kind": "open",
      "prompt": "Quel trait de son caractère admires-tu le plus ?",
      "depth": "moyen",
      "themes": [
        "admiration"
      ],
      "order": 3,
      "status": "published"
    },
    {
      "experienceSlug": "compliments-mysteres",
      "kind": "open",
      "prompt": "À quel moment t'es-tu senti·e le plus fier·e de nous deux ?",
      "depth": "moyen",
      "themes": [
        "fierté"
      ],
      "order": 4,
      "status": "published"
    },
    {
      "experienceSlug": "nouvelle-activite",
      "kind": "challenge",
      "prompt": "Proposez une activité que ni l'un ni l'autre n'a jamais essayée.",
      "depth": "leger",
      "themes": [
        "découverte"
      ],
      "order": 1,
      "status": "published"
    },
    {
      "experienceSlug": "nouvelle-activite",
      "kind": "choice",
      "prompt": "Quelle nouveauté vous tente le plus ?",
      "depth": "leger",
      "themes": [
        "découverte"
      ],
      "order": 2,
      "status": "published",
      "options": [
        "Un cours de cuisine",
        "Une randonnée",
        "Un atelier créatif",
        "Un sport en duo"
      ]
    },
    {
      "experienceSlug": "nouvelle-activite",
      "kind": "challenge",
      "prompt": "Bloquez ensemble un créneau « activité surprise » cette semaine.",
      "depth": "leger",
      "themes": [
        "planification"
      ],
      "order": 3,
      "status": "published"
    },
    {
      "experienceSlug": "besoins-affectifs",
      "kind": "open",
      "prompt": "De quoi as-tu besoin quand tu es fatigué·e en fin de journée ?",
      "depth": "moyen",
      "themes": [
        "écoute"
      ],
      "order": 1,
      "status": "published"
    },
    {
      "experienceSlug": "besoins-affectifs",
      "kind": "open",
      "prompt": "Quel mot aimerais-tu entendre plus souvent de moi ?",
      "depth": "moyen",
      "themes": [
        "affection"
      ],
      "order": 2,
      "status": "published"
    },
    {
      "experienceSlug": "besoins-affectifs",
      "kind": "open",
      "prompt": "Qu'est-ce qui t'aide à te sentir en sécurité avec moi ?",
      "depth": "profond",
      "themes": [
        "sécurité"
      ],
      "order": 3,
      "status": "published"
    },
    {
      "experienceSlug": "besoins-affectifs",
      "kind": "open",
      "prompt": "Comment préfères-tu que je m'y prenne quand ça ne va pas chez toi ?",
      "depth": "profond",
      "themes": [
        "écoute"
      ],
      "order": 4,
      "status": "published"
    },
    {
      "experienceSlug": "rendez-vous-a-tour-de-role",
      "kind": "choice",
      "prompt": "Quel budget te semble raisonnable pour un rendez-vous réussi ?",
      "depth": "leger",
      "themes": [
        "budget"
      ],
      "order": 1,
      "status": "published",
      "options": [
        "Aucun, l'essentiel est ailleurs",
        "Petit budget",
        "Budget moyen",
        "On se fait plaisir"
      ]
    },
    {
      "experienceSlug": "rendez-vous-a-tour-de-role",
      "kind": "open",
      "prompt": "Décris le rendez-vous dont tu rêves, en trois mots.",
      "depth": "leger",
      "themes": [
        "rendez-vous"
      ],
      "order": 2,
      "status": "published"
    },
    {
      "experienceSlug": "rendez-vous-a-tour-de-role",
      "kind": "choice",
      "prompt": "Quel moment te conviendrait le mieux ?",
      "depth": "leger",
      "themes": [
        "organisation"
      ],
      "order": 3,
      "status": "published",
      "options": [
        "Un matin tranquille",
        "Un après-midi",
        "Un dîner",
        "Une soirée tardive"
      ]
    },
    {
      "experienceSlug": "rendez-vous-a-tour-de-role",
      "kind": "challenge",
      "prompt": "Note une date pour organiser ton prochain rendez-vous.",
      "depth": "leger",
      "themes": [
        "planification"
      ],
      "order": 4,
      "status": "published"
    },
    {
      "experienceSlug": "valeurs-et-habitudes",
      "kind": "choice",
      "prompt": "Pour toi, quelle valeur est la plus importante dans un couple ?",
      "depth": "moyen",
      "themes": [
        "valeurs"
      ],
      "order": 1,
      "status": "published",
      "options": [
        "La confiance",
        "La tendresse",
        "La liberté",
        "Les projets communs"
      ]
    },
    {
      "experienceSlug": "valeurs-et-habitudes",
      "kind": "open",
      "prompt": "Quelle habitude de l'autre te touche profondément ?",
      "depth": "moyen",
      "themes": [
        "quotidien"
      ],
      "order": 2,
      "status": "published"
    },
    {
      "experienceSlug": "valeurs-et-habitudes",
      "kind": "open",
      "prompt": "Qu'est-ce qui te fait te sentir aimé·e sans qu'on te le dise ?",
      "depth": "profond",
      "themes": [
        "affection"
      ],
      "order": 3,
      "status": "published"
    },
    {
      "experienceSlug": "valeurs-et-habitudes",
      "kind": "choice",
      "prompt": "Comment exprimes-tu le mieux ton affection ?",
      "depth": "moyen",
      "themes": [
        "affection"
      ],
      "order": 4,
      "status": "published",
      "options": [
        "Par des mots",
        "Par des gestes",
        "Par du temps passé ensemble",
        "Par des attentions"
      ]
    },
    {
      "experienceSlug": "valeurs-et-habitudes",
      "kind": "open",
      "prompt": "Quel petit rituel aimerais-tu inventer à deux ?",
      "depth": "leger",
      "themes": [
        "rituels"
      ],
      "order": 5,
      "status": "published"
    },
    {
      "experienceSlug": "souvenirs-d-ecole",
      "kind": "open",
      "prompt": "Quel surnom avais-tu à l'école, et d'où venait-il ?",
      "depth": "leger",
      "themes": [
        "récit"
      ],
      "order": 1,
      "status": "published"
    },
    {
      "experienceSlug": "souvenirs-d-ecole",
      "kind": "choice",
      "prompt": "Quel était ton cours préféré à l'école ?",
      "depth": "leger",
      "themes": [
        "humour",
        "école"
      ],
      "order": 2,
      "status": "published",
      "options": [
        "Les maths",
        "La français",
        "L'histoire",
        "La géographie"
      ]
    },
    {
      "experienceSlug": "souvenirs-d-ecole",
      "kind": "open",
      "prompt": "Quelle excuse avais-tu inventée pour éviter un cours ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 3,
      "status": "published"
    },
    {
      "experienceSlug": "souvenirs-d-ecole",
      "kind": "choice",
      "prompt": "Quel était ton professeur préféré ?",
      "depth": "leger",
      "themes": [
        "humour",
        "école"
      ],
      "order": 4,
      "status": "published",
      "options": [
        "Le prof de maths",
        "Le prof de français",
        "Le prof d'histoire",
        "Le prof de géographie"
      ]
    },
    {
      "experienceSlug": "souvenirs-d-ecole",
      "kind": "open",
      "prompt": "Quel professeur te faisait le plus rire, et pourquoi ?",
      "depth": "leger",
      "themes": [
        "récit"
      ],
      "order": 5,
      "status": "published"
    },
    {
      "experienceSlug": "souvenirs-d-ecole",
      "kind": "choice",
      "prompt": "Quel était ton jouet préféré ?",
      "depth": "leger",
      "themes": [
        "humour",
        "école"
      ],
      "order": 6,
      "status": "published",
      "options": [
        "Les Lego",
        "Les peluches",
        "Les cartes",
        "Les livres"
      ]
    },
    {
      "experienceSlug": "souvenirs-d-ecole",
      "kind": "open",
      "prompt": "Quelle bêtise de récréation est restée célèbre dans ta classe ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 7,
      "status": "published"
    },
    {
      "experienceSlug": "souvenirs-d-ecole",
      "kind": "choice",
      "prompt": "Quel était ton jeu vidéo préféré ?",
      "depth": "leger",
      "themes": [
        "humour",
        "école"
      ],
      "order": 8,
      "status": "published",
      "options": [
        "Mario",
        "Zelda",
        "Fortnite",
        "Call of Duty"
      ]
    },
    {
      "experienceSlug": "souvenirs-d-ecole",
      "kind": "open",
      "prompt": "Quel goûter n'aurais-tu jamais échangé contre un autre ?",
      "depth": "leger",
      "themes": [
        "quotidien"
      ],
      "order": 9,
      "status": "published"
    },
    {
      "experienceSlug": "souvenirs-d-ecole",
      "kind": "choice",
      "prompt": "Quel était ton sport préféré ?",
      "depth": "leger",
      "themes": [
        "humour",
        "école"
      ],
      "order": 10,
      "status": "published",
      "options": [
        "Le football",
        "Le tennis",
        "La natation",
        "Le vélo"
      ]
    },
    {
      "experienceSlug": "souvenirs-d-ecole",
      "kind": "open",
      "prompt": "Quelle chanson de ton enfance connais-tu encore par cœur ?",
      "depth": "leger",
      "themes": [
        "musique"
      ],
      "order": 11,
      "status": "published"
    },
    {
      "experienceSlug": "souvenirs-d-ecole",
      "kind": "choice",
      "prompt": "Quel était ton voyage préféré ?",
      "depth": "leger",
      "themes": [
        "humour",
        "école"
      ],
      "order": 12,
      "status": "published",
      "options": [
        "Un voyage à la plage",
        "Un voyage à la montagne",
        "Un voyage à la ville",
        "Un voyage à la campagne"
      ]
    },
    {
      "experienceSlug": "souvenirs-d-ecole",
      "kind": "choice",
      "prompt": "Quel était ton color préféré ?",
      "depth": "leger",
      "themes": [
        "humour",
        "école"
      ],
      "order": 13,
      "status": "published",
      "options": [
        "Le bleu",
        "Le vert",
        "Le rouge",
        "Le jaune"
      ]
    },
    {
      "experienceSlug": "souvenirs-d-ecole",
      "kind": "choice",
      "prompt": "Quel était ton franchise préféré ?",
      "depth": "leger",
      "themes": [
        "humour",
        "école"
      ],
      "order": 14,
      "status": "published",
      "options": [
        "Star Wars",
        "Harry Potter",
        "Marvel",
        "DC"
      ]
    },
    {
      "experienceSlug": "souvenirs-d-ecole",
      "kind": "choice",
      "prompt": "Quel était ton super-héros préféré ?",
      "depth": "leger",
      "themes": [
        "humour",
        "école"
      ],
      "order": 15,
      "status": "published",
      "options": [
        "Superman",
        "Batman",
        "Spiderman",
        "Wonder Woman"
      ]
    },
    {
      "experienceSlug": "souvenirs-d-ecole",
      "kind": "choice",
      "prompt": "Quel était ton série préférée ?",
      "depth": "leger",
      "themes": [
        "humour",
        "école"
      ],
      "order": 16,
      "status": "published",
      "options": [
        "Stranger Things",
        "Breaking Bad",
        "Game of Thrones",
        "Friends"
      ]
    },
    {
      "experienceSlug": "souvenirs-d-ecole",
      "kind": "choice",
      "prompt": "Quel était ton musique préférée ?",
      "depth": "leger",
      "themes": [
        "humour",
        "école"
      ],
      "order": 17,
      "status": "published",
      "options": [
        "La pop",
        "Le rock",
        "L'hip-hop",
        "Le jazz"
      ]
    },
    {
      "experienceSlug": "souvenirs-d-ecole",
      "kind": "choice",
      "prompt": "Quel était ton moment préféré de la journée ?",
      "depth": "leger",
      "themes": [
        "humour",
        "école"
      ],
      "order": 18,
      "status": "published",
      "options": [
        "Le matin",
        "L'après-midi",
        "Le soir",
        "La nuit"
      ]
    },
    {
      "experienceSlug": "souvenirs-d-ecole",
      "kind": "choice",
      "prompt": "Quel était ton animal préféré ?",
      "depth": "leger",
      "themes": [
        "humour",
        "école"
      ],
      "order": 19,
      "status": "published",
      "options": [
        "Le lion",
        "Le tigre",
        "Le léopard",
        "Le guépard"
      ]
    },
    {
      "experienceSlug": "souvenirs-d-ecole",
      "kind": "choice",
      "prompt": "Quel était ton film préféré ?",
      "depth": "leger",
      "themes": [
        "humour",
        "école"
      ],
      "order": 20,
      "status": "published",
      "options": [
        "Un film d'horreur",
        "Un film d'animation",
        "Un film d'action",
        "Un film romantique"
      ]
    },
    {
      "experienceSlug": "souvenirs-d-ecole",
      "kind": "choice",
      "prompt": "Quel était ton plat préféré ?",
      "depth": "leger",
      "themes": [
        "humour",
        "école"
      ],
      "order": 21,
      "status": "published",
      "options": [
        "La pizza",
        "Les pâtes",
        "Le sushi",
        "Le fromage"
      ]
    },
    {
      "experienceSlug": "vrai-ou-faux",
      "kind": "open",
      "prompt": "Raconte trois choses sur toi : deux vraies, une fausse.",
      "depth": "leger",
      "themes": [
        "personnalité"
      ],
      "order": 1,
      "status": "published"
    },
    {
      "experienceSlug": "vrai-ou-faux",
      "kind": "choice",
      "prompt": "Est-ce vrai ou faux ?",
      "depth": "leger",
      "themes": [
        "humour",
        "mensonge"
      ],
      "order": 2,
      "status": "published",
      "options": [
        "Vrai",
        "Faux",
        "Je ne sais pas"
      ]
    },
    {
      "experienceSlug": "vrai-ou-faux",
      "kind": "open",
      "prompt": "Raconte trois souvenirs : deux que vous avez vécus ensemble, un que tu inventes.",
      "depth": "leger",
      "themes": [
        "récit"
      ],
      "order": 3,
      "status": "published"
    },
    {
      "experienceSlug": "vrai-ou-faux",
      "kind": "open",
      "prompt": "Cite trois plats que tu adores : l'un d'eux, en réalité, tu ne le supportes pas.",
      "depth": "leger",
      "themes": [
        "quotidien"
      ],
      "order": 4,
      "status": "published"
    },
    {
      "experienceSlug": "vrai-ou-faux",
      "kind": "open",
      "prompt": "Cite trois films : un seul, tu ne l'as jamais vu.",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 5,
      "status": "published"
    },
    {
      "experienceSlug": "vrai-ou-faux",
      "kind": "open",
      "prompt": "Raconte trois voyages : l'un est complètement inventé.",
      "depth": "leger",
      "themes": [
        "voyage"
      ],
      "order": 6,
      "status": "published"
    },
    {
      "experienceSlug": "vrai-ou-faux",
      "kind": "open",
      "prompt": "Cite trois habitudes : deux vraies, une que tu n'as jamais eue.",
      "depth": "leger",
      "themes": [
        "complicité"
      ],
      "order": 7,
      "status": "published"
    },
    {
      "experienceSlug": "aveux-rigolos",
      "kind": "open",
      "prompt": "Quelle est la chose la plus absurde que tu aies faite par amour ?",
      "depth": "leger",
      "themes": [
        "récit"
      ],
      "order": 1,
      "status": "published"
    },
    {
      "experienceSlug": "aveux-rigolos",
      "kind": "choice",
      "prompt": "Quel est ton péché mignon ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 2,
      "status": "published",
      "options": [
        "Manger du chocolat",
        "Regarder des séries",
        "Dormir",
        "Acheter des vêtements"
      ]
    },
    {
      "experienceSlug": "aveux-rigolos",
      "kind": "open",
      "prompt": "Quel petit mensonge racontes-tu encore aujourd'hui, sans aucune mauvaise intention ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 3,
      "status": "published"
    },
    {
      "experienceSlug": "aveux-rigolos",
      "kind": "choice",
      "prompt": "Quel est ton vice secret ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 4,
      "status": "published",
      "options": [
        "Les chips",
        "Les bonbons",
        "La pizza",
        "Les glaces"
      ]
    },
    {
      "experienceSlug": "aveux-rigolos",
      "kind": "open",
      "prompt": "Quelle bêtise d'enfance ta famille raconte-t-elle encore à ton sujet ?",
      "depth": "leger",
      "themes": [
        "récit"
      ],
      "order": 5,
      "status": "published"
    },
    {
      "experienceSlug": "aveux-rigolos",
      "kind": "choice",
      "prompt": "Quel est ton plaisir coupable ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 6,
      "status": "published",
      "options": [
        "Les livres",
        "Les films",
        "Les jeux vidéo",
        "Les réseaux sociaux"
      ]
    },
    {
      "experienceSlug": "aveux-rigolos",
      "kind": "open",
      "prompt": "Qu'as-tu déjà fait semblant de comprendre, sans rien capter du tout ?",
      "depth": "leger",
      "themes": [
        "quotidien"
      ],
      "order": 7,
      "status": "published"
    },
    {
      "experienceSlug": "aveux-rigolos",
      "kind": "choice",
      "prompt": "Quel est ton moment préféré ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 8,
      "status": "published",
      "options": [
        "Le matin",
        "L'après-midi",
        "Le soir",
        "La nuit"
      ]
    },
    {
      "experienceSlug": "aveux-rigolos",
      "kind": "open",
      "prompt": "Quel achat t'a fait le plus regretter… et te fait rire aujourd'hui ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 9,
      "status": "published"
    },
    {
      "experienceSlug": "aveux-rigolos",
      "kind": "choice",
      "prompt": "Quel est ton activité préférée ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 10,
      "status": "published",
      "options": [
        "Lire",
        "Regarder des séries",
        "Jouer",
        "Dormir"
      ]
    },
    {
      "experienceSlug": "aveux-rigolos",
      "kind": "open",
      "prompt": "Quelle aventure t'est arrivée et personne ne veut te croire ?",
      "depth": "leger",
      "themes": [
        "récit"
      ],
      "order": 11,
      "status": "published"
    },
    {
      "experienceSlug": "aveux-rigolos",
      "kind": "choice",
      "prompt": "Quel est ton souvenir préféré ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 12,
      "status": "published",
      "options": [
        "Un voyage",
        "Un anniversaire",
        "Une fête",
        "Une sortie"
      ]
    },
    {
      "experienceSlug": "aveux-rigolos",
      "kind": "open",
      "prompt": "Quel détail chez ton partenaire te fait rire à chaque fois ?",
      "depth": "leger",
      "themes": [
        "complicité"
      ],
      "order": 13,
      "status": "published"
    },
    {
      "experienceSlug": "aveux-rigolos",
      "kind": "choice",
      "prompt": "Quel est ton endroit préféré ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 14,
      "status": "published",
      "options": [
        "La plage",
        "La montagne",
        "La ville",
        "La campagne"
      ]
    },
    {
      "experienceSlug": "aveux-rigolos",
      "kind": "choice",
      "prompt": "Quel est ton objet préféré ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 15,
      "status": "published",
      "options": [
        "Un téléphone",
        "Une voiture",
        "Une maison",
        "Un animal"
      ]
    },
    {
      "experienceSlug": "aveux-rigolos",
      "kind": "choice",
      "prompt": "Quel est ton film préféré ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 16,
      "status": "published",
      "options": [
        "Un film d'horreur",
        "Un film d'animation",
        "Un film d'action",
        "Un film romantique"
      ]
    },
    {
      "experienceSlug": "aveux-rigolos",
      "kind": "choice",
      "prompt": "Quel est ton plat préféré ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 17,
      "status": "published",
      "options": [
        "La pizza",
        "Les pâtes",
        "Le sushi",
        "Le fromage"
      ]
    },
    {
      "experienceSlug": "aveux-rigolos",
      "kind": "choice",
      "prompt": "Quel est ton animal préféré ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 18,
      "status": "published",
      "options": [
        "Le lion",
        "Le tigre",
        "Le léopard",
        "Le guépard"
      ]
    },
    {
      "experienceSlug": "aveux-rigolos",
      "kind": "choice",
      "prompt": "Quel est ton sport préféré ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 19,
      "status": "published",
      "options": [
        "Le football",
        "Le tennis",
        "La natation",
        "Le vélo"
      ]
    },
    {
      "experienceSlug": "aveux-rigolos",
      "kind": "choice",
      "prompt": "Quel est ton voyage préféré ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 20,
      "status": "published",
      "options": [
        "Un voyage à la plage",
        "Un voyage à la montagne",
        "Un voyage à la ville",
        "Un voyage à la campagne"
      ]
    },
    {
      "experienceSlug": "aveux-rigolos",
      "kind": "choice",
      "prompt": "Quel est ton color préféré ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 21,
      "status": "published",
      "options": [
        "Le bleu",
        "Le vert",
        "Le rouge",
        "Le jaune"
      ]
    },
    {
      "experienceSlug": "aveux-rigolos",
      "kind": "choice",
      "prompt": "Quel est ton franchise préféré ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 22,
      "status": "published",
      "options": [
        "Star Wars",
        "Harry Potter",
        "Marvel",
        "DC"
      ]
    },
    {
      "experienceSlug": "aveux-rigolos",
      "kind": "choice",
      "prompt": "Quel est ton super-héros préféré ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 23,
      "status": "published",
      "options": [
        "Superman",
        "Batman",
        "Spiderman",
        "Wonder Woman"
      ]
    },
    {
      "experienceSlug": "aveux-rigolos",
      "kind": "choice",
      "prompt": "Quel est ton série préférée ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 24,
      "status": "published",
      "options": [
        "Stranger Things",
        "Breaking Bad",
        "Game of Thrones",
        "Friends"
      ]
    },
    {
      "experienceSlug": "aveux-rigolos",
      "kind": "choice",
      "prompt": "Quel est ton jeu vidéo préféré ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 25,
      "status": "published",
      "options": [
        "Call of Duty",
        "Fortnite",
        "Mario",
        "The Legend of Zelda"
      ]
    },
    {
      "experienceSlug": "aveux-rigolos",
      "kind": "choice",
      "prompt": "Quel est ton musique préférée ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 26,
      "status": "published",
      "options": [
        "La pop",
        "Le rock",
        "L'hip-hop",
        "Le jazz"
      ]
    },
    {
      "experienceSlug": "aveux-rigolos",
      "kind": "choice",
      "prompt": "Quel est ton moment préféré de la journée ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 27,
      "status": "published",
      "options": [
        "Le matin",
        "L'après-midi",
        "Le soir",
        "La nuit"
      ]
    },
    {
      "experienceSlug": "trente-secondes-chrono",
      "kind": "challenge",
      "prompt": "Cite dix choses que tu aimes chez ton partenaire, en trente secondes.",
      "depth": "leger",
      "themes": [
        "affection"
      ],
      "order": 1,
      "status": "published"
    },
    {
      "experienceSlug": "trente-secondes-chrono",
      "kind": "challenge",
      "prompt": "Dis ton prénom en 30 secondes",
      "depth": "leger",
      "themes": [
        "humour",
        "jeu"
      ],
      "order": 2,
      "status": "published"
    },
    {
      "experienceSlug": "trente-secondes-chrono",
      "kind": "challenge",
      "prompt": "En trente secondes, fais-lui deviner cinq objets de la pièce sans les nommer.",
      "depth": "leger",
      "themes": [
        "jeu"
      ],
      "order": 3,
      "status": "published"
    },
    {
      "experienceSlug": "trente-secondes-chrono",
      "kind": "challenge",
      "prompt": "Fais 10 pompes en 30 secondes",
      "depth": "leger",
      "themes": [
        "humour",
        "jeu"
      ],
      "order": 4,
      "status": "published"
    },
    {
      "experienceSlug": "trente-secondes-chrono",
      "kind": "challenge",
      "prompt": "En trente secondes, raconte votre meilleur fou rire avec l'accent choisi par l'autre.",
      "depth": "leger",
      "themes": [
        "défi"
      ],
      "order": 5,
      "status": "published"
    },
    {
      "experienceSlug": "trente-secondes-chrono",
      "kind": "challenge",
      "prompt": "Dis ton nom complet en 30 secondes",
      "depth": "leger",
      "themes": [
        "humour",
        "jeu"
      ],
      "order": 6,
      "status": "published"
    },
    {
      "experienceSlug": "trente-secondes-chrono",
      "kind": "challenge",
      "prompt": "Dis ton adresse en 30 secondes",
      "depth": "leger",
      "themes": [
        "humour",
        "jeu"
      ],
      "order": 7,
      "status": "published"
    },
    {
      "experienceSlug": "trente-secondes-chrono",
      "kind": "challenge",
      "prompt": "Fais 10 squats en 30 secondes",
      "depth": "leger",
      "themes": [
        "humour",
        "jeu"
      ],
      "order": 8,
      "status": "published"
    },
    {
      "experienceSlug": "trente-secondes-chrono",
      "kind": "challenge",
      "prompt": "Fais 10 sauts en 30 secondes",
      "depth": "leger",
      "themes": [
        "humour",
        "jeu"
      ],
      "order": 9,
      "status": "published"
    },
    {
      "experienceSlug": "trente-secondes-chrono",
      "kind": "challenge",
      "prompt": "Dis 10 choses en 30 secondes",
      "depth": "leger",
      "themes": [
        "humour",
        "jeu"
      ],
      "order": 10,
      "status": "published"
    },
    {
      "experienceSlug": "trente-secondes-chrono",
      "kind": "challenge",
      "prompt": "Dis 20 choses en 30 secondes",
      "depth": "leger",
      "themes": [
        "humour",
        "jeu"
      ],
      "order": 11,
      "status": "published"
    },
    {
      "experienceSlug": "trente-secondes-chrono",
      "kind": "challenge",
      "prompt": "Fais 20 pompes en 30 secondes",
      "depth": "leger",
      "themes": [
        "humour",
        "jeu"
      ],
      "order": 12,
      "status": "published"
    },
    {
      "experienceSlug": "trente-secondes-chrono",
      "kind": "challenge",
      "prompt": "Fais 20 squats en 30 secondes",
      "depth": "leger",
      "themes": [
        "humour",
        "jeu"
      ],
      "order": 13,
      "status": "published"
    },
    {
      "experienceSlug": "trente-secondes-chrono",
      "kind": "challenge",
      "prompt": "Fais 20 sauts en 30 secondes",
      "depth": "leger",
      "themes": [
        "humour",
        "jeu"
      ],
      "order": 14,
      "status": "published"
    },
    {
      "experienceSlug": "trente-secondes-chrono",
      "kind": "challenge",
      "prompt": "Dis 30 choses en 30 secondes",
      "depth": "leger",
      "themes": [
        "humour",
        "jeu"
      ],
      "order": 15,
      "status": "published"
    },
    {
      "experienceSlug": "trente-secondes-chrono",
      "kind": "challenge",
      "prompt": "Fais 30 pompes en 30 secondes",
      "depth": "leger",
      "themes": [
        "humour",
        "jeu"
      ],
      "order": 16,
      "status": "published"
    },
    {
      "experienceSlug": "trente-secondes-chrono",
      "kind": "challenge",
      "prompt": "Fais 30 squats en 30 secondes",
      "depth": "leger",
      "themes": [
        "humour",
        "jeu"
      ],
      "order": 17,
      "status": "published"
    },
    {
      "experienceSlug": "trente-secondes-chrono",
      "kind": "challenge",
      "prompt": "Fais 30 sauts en 30 secondes",
      "depth": "leger",
      "themes": [
        "humour",
        "jeu"
      ],
      "order": 18,
      "status": "published"
    },
    {
      "experienceSlug": "trente-secondes-chrono",
      "kind": "challenge",
      "prompt": "Dis 40 choses en 30 secondes",
      "depth": "leger",
      "themes": [
        "humour",
        "jeu"
      ],
      "order": 19,
      "status": "published"
    },
    {
      "experienceSlug": "trente-secondes-chrono",
      "kind": "challenge",
      "prompt": "Fais 40 pompes en 30 secondes",
      "depth": "leger",
      "themes": [
        "humour",
        "jeu"
      ],
      "order": 20,
      "status": "published"
    },
    {
      "experienceSlug": "trente-secondes-chrono",
      "kind": "challenge",
      "prompt": "Fais 40 squats en 30 secondes",
      "depth": "leger",
      "themes": [
        "humour",
        "jeu"
      ],
      "order": 21,
      "status": "published"
    },
    {
      "experienceSlug": "trente-secondes-chrono",
      "kind": "challenge",
      "prompt": "Fais 40 sauts en 30 secondes",
      "depth": "leger",
      "themes": [
        "humour",
        "jeu"
      ],
      "order": 22,
      "status": "published"
    },
    {
      "experienceSlug": "trente-secondes-chrono",
      "kind": "challenge",
      "prompt": "Dis 50 choses en 30 secondes",
      "depth": "leger",
      "themes": [
        "humour",
        "jeu"
      ],
      "order": 23,
      "status": "published"
    },
    {
      "experienceSlug": "trente-secondes-chrono",
      "kind": "challenge",
      "prompt": "Fais 50 pompes en 30 secondes",
      "depth": "leger",
      "themes": [
        "humour",
        "jeu"
      ],
      "order": 24,
      "status": "published"
    },
    {
      "experienceSlug": "si-j-etais-toi",
      "kind": "choice",
      "prompt": "Si tu étais à ma place, qu'est-ce que tu commanderais pour moi au restaurant ?",
      "depth": "leger",
      "themes": [
        "quotidien"
      ],
      "order": 1,
      "status": "published",
      "options": [
        "Le plat le plus épicé",
        "Ce que je prends toujours",
        "Quelque chose que je n'ai jamais goûté",
        "Rien, je grignote dans ton assiette"
      ]
    },
    {
      "experienceSlug": "si-j-etais-toi",
      "kind": "choice",
      "prompt": "Si tu étais moi, que ferais-tu ?",
      "depth": "leger",
      "themes": [
        "humour",
        "perspective"
      ],
      "order": 2,
      "status": "published",
      "options": [
        "Je travaillerai plus",
        "Je prendrais plus de vacances",
        "Je voyagerais plus",
        "Je resterais à la maison"
      ]
    },
    {
      "experienceSlug": "si-j-etais-toi",
      "kind": "choice",
      "prompt": "Si tu devais m'offrir un cadeau aujourd'hui, ce serait…",
      "depth": "leger",
      "themes": [
        "préférences"
      ],
      "order": 3,
      "status": "published",
      "options": [
        "Quelque chose d'utile",
        "Une surprise qui ne sert à rien",
        "Un moment, quelque part",
        "De quoi manger à deux"
      ]
    },
    {
      "experienceSlug": "si-j-etais-toi",
      "kind": "choice",
      "prompt": "Si tu étais moi, que changerais-tu ?",
      "depth": "leger",
      "themes": [
        "humour",
        "perspective"
      ],
      "order": 4,
      "status": "published",
      "options": [
        "Je travaillerais plus",
        "Je prendrais plus de temps",
        "Je voyagerais plus",
        "Je resterais à la maison"
      ]
    },
    {
      "experienceSlug": "si-j-etais-toi",
      "kind": "choice",
      "prompt": "Quelle serait ma réaction si on m'annonçait un voyage demain matin ?",
      "depth": "leger",
      "themes": [
        "voyage"
      ],
      "order": 5,
      "status": "published",
      "options": [
        "Je prépare ma valise tout de suite",
        "Je demande combien ça coûte",
        "Je panique un peu",
        "Je dors d'abord, on verra"
      ]
    },
    {
      "experienceSlug": "si-j-etais-toi",
      "kind": "choice",
      "prompt": "Si tu étais moi, comment réagirais-tu ?",
      "depth": "leger",
      "themes": [
        "humour",
        "perspective"
      ],
      "order": 6,
      "status": "published",
      "options": [
        "Je réagirais différemment",
        "Je réagirais de la même manière",
        "Je réagirais avec humour",
        "Je réagirais avec sérieux"
      ]
    },
    {
      "experienceSlug": "si-j-etais-toi",
      "kind": "choice",
      "prompt": "Quel est mon plaisir simple que tu ne comprends pas ?",
      "depth": "leger",
      "themes": [
        "personnalité"
      ],
      "order": 7,
      "status": "published",
      "options": [
        "Les grasses matinées",
        "Les séries en boucle",
        "Ranger pendant des heures",
        "Les longues discussions"
      ]
    },
    {
      "experienceSlug": "si-j-etais-toi",
      "kind": "choice",
      "prompt": "Si tu étais moi, que choisirais-tu ?",
      "depth": "leger",
      "themes": [
        "humour",
        "perspective"
      ],
      "order": 8,
      "status": "published",
      "options": [
        "Je choisirais le bleu",
        "Je choisirais le rouge",
        "Je choisirais le vert",
        "Je choisirais le jaune"
      ]
    },
    {
      "experienceSlug": "si-j-etais-toi",
      "kind": "choice",
      "prompt": "Si je devais choisir entre les deux, je préférerais…",
      "depth": "leger",
      "themes": [
        "personnalité"
      ],
      "order": 9,
      "status": "published",
      "options": [
        "Une soirée avec plein d'amis",
        "Une soirée rien qu'à deux",
        "Un moment seul",
        "Ça dépend de la musique"
      ]
    },
    {
      "experienceSlug": "si-j-etais-toi",
      "kind": "choice",
      "prompt": "Si tu étais moi, que préférerais-tu ?",
      "depth": "leger",
      "themes": [
        "humour",
        "perspective"
      ],
      "order": 10,
      "status": "published",
      "options": [
        "Je préférerais le matin",
        "Je préférerais l'après-midi",
        "Je préférerais le soir",
        "Je préférerais la nuit"
      ]
    },
    {
      "experienceSlug": "si-j-etais-toi",
      "kind": "choice",
      "prompt": "Quelle est la première chose que je fais en rentrant ?",
      "depth": "leger",
      "themes": [
        "quotidien"
      ],
      "order": 11,
      "status": "published",
      "options": [
        "Je retire mes chaussures et je m'affale",
        "Je vais manger un truc",
        "Je raconte ma journée",
        "Je prends mon téléphone"
      ]
    },
    {
      "experienceSlug": "si-j-etais-toi",
      "kind": "choice",
      "prompt": "Quel compliment me toucherait le plus ?",
      "depth": "leger",
      "themes": [
        "affection"
      ],
      "order": 12,
      "status": "published",
      "options": [
        "Sur ce que je fais",
        "Sur ce que je suis",
        "Sur mon rire",
        "Sur un détail que personne ne remarque"
      ]
    },
    {
      "experienceSlug": "si-j-etais-toi",
      "kind": "choice",
      "prompt": "Si tu étais moi, que dirais-tu ?",
      "depth": "leger",
      "themes": [
        "humour",
        "perspective"
      ],
      "order": 13,
      "status": "published",
      "options": [
        "Je dirais quelque chose de drôle",
        "Je dirais quelque chose de sérieux",
        "Je dirais quelque chose de romantique",
        "Je dirais quelque chose d'émouvant"
      ]
    },
    {
      "experienceSlug": "imitation-express",
      "kind": "challenge",
      "prompt": "Imite quelqu'un de la famille de ton partenaire, sans dire son nom. Il doit deviner qui.",
      "depth": "leger",
      "themes": [
        "imitation"
      ],
      "order": 1,
      "status": "published"
    },
    {
      "experienceSlug": "imitation-express",
      "kind": "challenge",
      "prompt": "Imite le rire de ton partenaire",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 2,
      "status": "published"
    },
    {
      "experienceSlug": "imitation-express",
      "kind": "challenge",
      "prompt": "Fais deviner une chanson uniquement en sifflant, sans prononcer un mot.",
      "depth": "leger",
      "themes": [
        "imitation"
      ],
      "order": 3,
      "status": "published"
    },
    {
      "experienceSlug": "imitation-express",
      "kind": "challenge",
      "prompt": "Imite l'accent de ton choix",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 4,
      "status": "published"
    },
    {
      "experienceSlug": "imitation-express",
      "kind": "challenge",
      "prompt": "Raconte votre rencontre comme un présentateur de journal télévisé.",
      "depth": "leger",
      "themes": [
        "récit"
      ],
      "order": 5,
      "status": "published"
    },
    {
      "experienceSlug": "imitation-express",
      "kind": "challenge",
      "prompt": "Imite un animal pendant 30 secondes",
      "depth": "leger",
      "themes": [
        "humour",
        "jeu"
      ],
      "order": 6,
      "status": "published"
    },
    {
      "experienceSlug": "imitation-express",
      "kind": "challenge",
      "prompt": "Imite le bruit de ta journée préférée, et fais-le deviner à l'autre.",
      "depth": "leger",
      "themes": [
        "jeu"
      ],
      "order": 7,
      "status": "published"
    },
    {
      "experienceSlug": "imitation-express",
      "kind": "challenge",
      "prompt": "Imite un personnage célèbre",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 8,
      "status": "published"
    },
    {
      "experienceSlug": "imitation-express",
      "kind": "choice",
      "prompt": "Qui va imiter le mieux ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 9,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On est pareils"
      ]
    },
    {
      "experienceSlug": "imitation-express",
      "kind": "challenge",
      "prompt": "Imite un robot",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 10,
      "status": "published"
    },
    {
      "experienceSlug": "imitation-express",
      "kind": "challenge",
      "prompt": "Imite un singe",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 11,
      "status": "published"
    },
    {
      "experienceSlug": "imitation-express",
      "kind": "challenge",
      "prompt": "Imite un oiseau",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 12,
      "status": "published"
    },
    {
      "experienceSlug": "imitation-express",
      "kind": "choice",
      "prompt": "Qui a le talent d'imitation ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 13,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On est pareils"
      ]
    },
    {
      "experienceSlug": "imitation-express",
      "kind": "challenge",
      "prompt": "Imite un film",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 14,
      "status": "published"
    },
    {
      "experienceSlug": "imitation-express",
      "kind": "challenge",
      "prompt": "Imite une chanson",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 15,
      "status": "published"
    },
    {
      "experienceSlug": "imitation-express",
      "kind": "challenge",
      "prompt": "Imite un métier",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 16,
      "status": "published"
    },
    {
      "experienceSlug": "imitation-express",
      "kind": "choice",
      "prompt": "Qui va faire la meilleure imitation ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 17,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On est pareils"
      ]
    },
    {
      "experienceSlug": "imitation-express",
      "kind": "challenge",
      "prompt": "Imite un sport",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 18,
      "status": "published"
    },
    {
      "experienceSlug": "imitation-express",
      "kind": "challenge",
      "prompt": "Imite un instrument de musique",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 19,
      "status": "published"
    },
    {
      "experienceSlug": "imitation-express",
      "kind": "choice",
      "prompt": "Qui a le plus d'humour ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 20,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On est pareils"
      ]
    },
    {
      "experienceSlug": "imitation-express",
      "kind": "challenge",
      "prompt": "Imite un objet",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 21,
      "status": "published"
    },
    {
      "experienceSlug": "imitation-express",
      "kind": "challenge",
      "prompt": "Imite un sentiment",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 22,
      "status": "published"
    },
    {
      "experienceSlug": "imitation-express",
      "kind": "choice",
      "prompt": "Qui va gagner ce défi ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 23,
      "status": "published",
      "options": [
        "C'est moi",
        "C'est toi",
        "On est pareils"
      ]
    },
    {
      "experienceSlug": "imitation-express",
      "kind": "challenge",
      "prompt": "Imite une personne de la famille",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 24,
      "status": "published"
    },
    {
      "experienceSlug": "imitation-express",
      "kind": "challenge",
      "prompt": "Imite un souvenir",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 25,
      "status": "published"
    },
    {
      "experienceSlug": "fou-rire-garanti",
      "kind": "choice",
      "prompt": "Quel super-pouvoir totalement inutile choisirais-tu ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 1,
      "status": "published",
      "options": [
        "Voler, mais à trente centimètres du sol",
        "Devenir invisible, sauf les pieds",
        "Parler aux poulets",
        "Téléporter uniquement tes chaussettes"
      ]
    },
    {
      "experienceSlug": "fou-rire-garanti",
      "kind": "choice",
      "prompt": "Quelle est la chose la plus drôle qui te soit arrivée ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 2,
      "status": "published",
      "options": [
        "Un accident de voiture",
        "Une situation embarrassante",
        "Une blague ratée",
        "Une mauvaise interprétation"
      ]
    },
    {
      "experienceSlug": "fou-rire-garanti",
      "kind": "choice",
      "prompt": "Si ta vie avait une bande-son, ce serait plutôt…",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 3,
      "status": "published",
      "options": [
        "Une fanfare de mariage",
        "Le générique d'une série policière",
        "Une chorale qui chante faux",
        "Un bruit de casseroles"
      ]
    },
    {
      "experienceSlug": "fou-rire-garanti",
      "kind": "choice",
      "prompt": "Quel est ton rire le plus contagieux ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 4,
      "status": "published",
      "options": [
        "Le mien",
        "Celui de l'autre",
        "On a le même rire"
      ]
    },
    {
      "experienceSlug": "fou-rire-garanti",
      "kind": "choice",
      "prompt": "Quel animal te ressemble le plus au réveil ?",
      "depth": "leger",
      "themes": [
        "quotidien"
      ],
      "order": 5,
      "status": "published",
      "options": [
        "Un chat qui ignore tout le monde",
        "Un coq toujours en retard",
        "Un koala accroché à l'oreiller",
        "Un poisson sorti de l'eau"
      ]
    },
    {
      "experienceSlug": "fou-rire-garanti",
      "kind": "choice",
      "prompt": "Quel est ton souvenir le plus drôle d'enfance ?",
      "depth": "leger",
      "themes": [
        "humour",
        "souvenirs"
      ],
      "order": 6,
      "status": "published",
      "options": [
        "Une dispute d'école",
        "Un jeu d'extérieur",
        "Une blague de famille",
        "Une sortie scolaire"
      ]
    },
    {
      "experienceSlug": "fou-rire-garanti",
      "kind": "choice",
      "prompt": "Quel serait le pire métier pour toi ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 7,
      "status": "published",
      "options": [
        "Goûteur de piments",
        "Compteur de moutons",
        "Testeur de réveils",
        "Chanteur devant la belle-famille"
      ]
    },
    {
      "experienceSlug": "fou-rire-garanti",
      "kind": "choice",
      "prompt": "Quelle est la blague la plus mauvaise que tu connaisse ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 8,
      "status": "published",
      "options": [
        "Une blague de père",
        "Une blague de copain",
        "Une blague de télé",
        "Une blague de livre"
      ]
    },
    {
      "experienceSlug": "fou-rire-garanti",
      "kind": "choice",
      "prompt": "Si vous échangiez vos téléphones une journée, qu'est-ce qui te ferait le plus rire ?",
      "depth": "leger",
      "themes": [
        "complicité"
      ],
      "order": 9,
      "status": "published",
      "options": [
        "Mes notes vocales",
        "Mes photos ratées",
        "Mes recherches bizarres",
        "Mes conversations avec moi-même"
      ]
    },
    {
      "experienceSlug": "fou-rire-garanti",
      "kind": "choice",
      "prompt": "Quel est ton animal de prédilection ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 10,
      "status": "published",
      "options": [
        "Le chat",
        "Le chien",
        "Le lapin",
        "Le poisson"
      ]
    },
    {
      "experienceSlug": "fou-rire-garanti",
      "kind": "choice",
      "prompt": "Quelle excuse la plus ridicule as-tu déjà utilisée pour arriver en retard ?",
      "depth": "leger",
      "themes": [
        "quotidien"
      ],
      "order": 11,
      "status": "published",
      "options": [
        "Le taxi avait un passager fantôme",
        "Mon réveil a fait la grève",
        "Je cherchais mes clés en les ayant en main",
        "J'ai dit « presque là » pendant une heure"
      ]
    },
    {
      "experienceSlug": "fou-rire-garanti",
      "kind": "choice",
      "prompt": "Quelle est ta chose préférée à faire ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 12,
      "status": "published",
      "options": [
        "Lire",
        "Regarder des séries",
        "Jouer",
        "Dormir"
      ]
    },
    {
      "experienceSlug": "fou-rire-garanti",
      "kind": "choice",
      "prompt": "Quel est ton talent le plus inutile… et le plus impressionnant ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 13,
      "status": "published",
      "options": [
        "Siffler avec les doigts",
        "Plier un t-shirt en quatre secondes",
        "Reconnaître une chanson en deux notes",
        "Dormir assis sans tomber"
      ]
    },
    {
      "experienceSlug": "fou-rire-garanti",
      "kind": "choice",
      "prompt": "Quel est ton plat préféré ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 14,
      "status": "published",
      "options": [
        "La pizza",
        "Les pâtes",
        "Le sushi",
        "Le fromage"
      ]
    },
    {
      "experienceSlug": "fou-rire-garanti",
      "kind": "choice",
      "prompt": "Quelle est ta chanson préférée ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 15,
      "status": "published",
      "options": [
        "Une chanson pop",
        "Une chanson rock",
        "Une chanson classique",
        "Une chanson d'opéra"
      ]
    },
    {
      "experienceSlug": "fou-rire-garanti",
      "kind": "choice",
      "prompt": "Quel est ton film préféré ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 16,
      "status": "published",
      "options": [
        "Un film d'horreur",
        "Un film d'animation",
        "Un film d'action",
        "Un film romantique"
      ]
    },
    {
      "experienceSlug": "fou-rire-garanti",
      "kind": "choice",
      "prompt": "Quelle est ta boisson préférée ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 17,
      "status": "published",
      "options": [
        "L'eau",
        "Le café",
        "Le thé",
        "Le jus de fruit"
      ]
    },
    {
      "experienceSlug": "fou-rire-garanti",
      "kind": "choice",
      "prompt": "Quel est ton sport préféré ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 18,
      "status": "published",
      "options": [
        "Le football",
        "Le tennis",
        "La natation",
        "Le vélo"
      ]
    },
    {
      "experienceSlug": "fou-rire-garanti",
      "kind": "choice",
      "prompt": "Quelle est ta saison préférée ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 19,
      "status": "published",
      "options": [
        "Le printemps",
        "L'été",
        "L'automne",
        "L'hiver"
      ]
    },
    {
      "experienceSlug": "fou-rire-garanti",
      "kind": "choice",
      "prompt": "Quel est ton voyage préféré ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 20,
      "status": "published",
      "options": [
        "Un voyage à la plage",
        "Un voyage à la montagne",
        "Un voyage à la ville",
        "Un voyage à la campagne"
      ]
    },
    {
      "experienceSlug": "fou-rire-garanti",
      "kind": "choice",
      "prompt": "Quelle est ta couleur préférée ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 21,
      "status": "published",
      "options": [
        "Le bleu",
        "Le vert",
        "Le rouge",
        "Le jaune"
      ]
    },
    {
      "experienceSlug": "fou-rire-garanti",
      "kind": "choice",
      "prompt": "Quel est ton animal préféré ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 22,
      "status": "published",
      "options": [
        "Le lion",
        "Le tigre",
        "Le léopard",
        "Le guépard"
      ]
    },
    {
      "experienceSlug": "fou-rire-garanti",
      "kind": "choice",
      "prompt": "Quelle est ta franchise préférée ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 23,
      "status": "published",
      "options": [
        "Star Wars",
        "Harry Potter",
        "Marvel",
        "DC"
      ]
    },
    {
      "experienceSlug": "fou-rire-garanti",
      "kind": "choice",
      "prompt": "Quel est ton super-héros préféré ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 24,
      "status": "published",
      "options": [
        "Superman",
        "Batman",
        "Spiderman",
        "Wonder Woman"
      ]
    },
    {
      "experienceSlug": "fou-rire-garanti",
      "kind": "choice",
      "prompt": "Quelle est ta série préférée ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 25,
      "status": "published",
      "options": [
        "Stranger Things",
        "Breaking Bad",
        "Game of Thrones",
        "Friends"
      ]
    },
    {
      "experienceSlug": "fou-rire-garanti",
      "kind": "choice",
      "prompt": "Quel est ton jeu vidéo préféré ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 26,
      "status": "published",
      "options": [
        "Call of Duty",
        "Fortnite",
        "Mario",
        "The Legend of Zelda"
      ]
    },
    {
      "experienceSlug": "fou-rire-garanti",
      "kind": "choice",
      "prompt": "Quelle est ta musique préférée ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 27,
      "status": "published",
      "options": [
        "La pop",
        "Le rock",
        "L'hip-hop",
        "Le jazz"
      ]
    },
    {
      "experienceSlug": "fou-rire-garanti",
      "kind": "choice",
      "prompt": "Quel est ton moment préféré de la journée ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 28,
      "status": "published",
      "options": [
        "Le matin",
        "L'après-midi",
        "Le soir",
        "La nuit"
      ]
    },
    {
      "experienceSlug": "quand-je-pense-a-nous",
      "kind": "open",
      "prompt": "Quelle image de nous deux te revient le plus souvent ?",
      "depth": "moyen",
      "themes": [
        "tendresse"
      ],
      "order": 1,
      "status": "published"
    },
    {
      "experienceSlug": "quand-je-pense-a-nous",
      "kind": "open",
      "prompt": "Qu'est-ce que tu aimes chez nous que tu ne retrouverais nulle part ailleurs ?",
      "depth": "moyen",
      "themes": [
        "relation"
      ],
      "order": 2,
      "status": "published"
    },
    {
      "experienceSlug": "quand-je-pense-a-nous",
      "kind": "open",
      "prompt": "Quelle part de toi s'est apaisée depuis que nous sommes ensemble ?",
      "depth": "profond",
      "themes": [
        "relation"
      ],
      "order": 3,
      "status": "published"
    },
    {
      "experienceSlug": "quand-je-pense-a-nous",
      "kind": "open",
      "prompt": "De quoi avons-nous besoin pour que cette tendresse traverse les années ?",
      "depth": "profond",
      "themes": [
        "tendresse"
      ],
      "order": 4,
      "status": "published"
    },
    {
      "experienceSlug": "quand-je-pense-a-nous",
      "kind": "open",
      "prompt": "Qu'aimerais-tu que je sache, et que je n'oublie jamais ?",
      "depth": "profond",
      "themes": [
        "affection"
      ],
      "order": 5,
      "status": "published"
    },
    {
      "experienceSlug": "ce-qui-nous-fait-du-bien",
      "kind": "open",
      "prompt": "Qu'est-ce qui te fait te sentir aimé·e, concrètement, dans une journée ordinaire ?",
      "depth": "moyen",
      "themes": [
        "affection"
      ],
      "order": 1,
      "status": "published"
    },
    {
      "experienceSlug": "ce-qui-nous-fait-du-bien",
      "kind": "open",
      "prompt": "Quelle attention te touche plus que les grands gestes ?",
      "depth": "moyen",
      "themes": [
        "attentions"
      ],
      "order": 2,
      "status": "published"
    },
    {
      "experienceSlug": "ce-qui-nous-fait-du-bien",
      "kind": "open",
      "prompt": "Quand tu as besoin de calme, comment puis-je t'aider sans en faire trop ?",
      "depth": "moyen",
      "themes": [
        "écoute"
      ],
      "order": 3,
      "status": "published"
    },
    {
      "experienceSlug": "ce-qui-nous-fait-du-bien",
      "kind": "open",
      "prompt": "Quel compliment n'oses-tu jamais demander, mais qui te ferait du bien ?",
      "depth": "moyen",
      "themes": [
        "affection"
      ],
      "order": 4,
      "status": "published"
    },
    {
      "experienceSlug": "ce-qui-nous-fait-du-bien",
      "kind": "open",
      "prompt": "Qu'est-ce que je fais qui t'apaise, même sans le vouloir ?",
      "depth": "moyen",
      "themes": [
        "tendresse"
      ],
      "order": 5,
      "status": "published"
    },
    {
      "experienceSlug": "ce-qui-nous-fait-du-bien",
      "kind": "open",
      "prompt": "De quoi aurions-nous besoin, rien qu'à nous deux, cette semaine ?",
      "depth": "moyen",
      "themes": [
        "relation"
      ],
      "order": 6,
      "status": "published"
    },
    {
      "experienceSlug": "merci-pour",
      "kind": "open",
      "prompt": "Merci pour quoi, aujourd'hui, même si c'est minuscule ?",
      "depth": "leger",
      "themes": [
        "attentions"
      ],
      "order": 1,
      "status": "published"
    },
    {
      "experienceSlug": "merci-pour",
      "kind": "open",
      "prompt": "Quelle chose que je fais sans y penser t'a aidé·e récemment ?",
      "depth": "moyen",
      "themes": [
        "attentions"
      ],
      "order": 2,
      "status": "published"
    },
    {
      "experienceSlug": "merci-pour",
      "kind": "open",
      "prompt": "Quel effort de l'autre as-tu remarqué sans jamais le dire ?",
      "depth": "moyen",
      "themes": [
        "affection"
      ],
      "order": 3,
      "status": "published"
    },
    {
      "experienceSlug": "merci-pour",
      "kind": "open",
      "prompt": "Pour quoi aimerais-tu qu'on te dise merci plus souvent ?",
      "depth": "moyen",
      "themes": [
        "écoute"
      ],
      "order": 4,
      "status": "published"
    },
    {
      "experienceSlug": "merci-pour",
      "kind": "open",
      "prompt": "Quelle qualité chez ton partenaire mérite plus de reconnaissance ?",
      "depth": "moyen",
      "themes": [
        "affection"
      ],
      "order": 5,
      "status": "published"
    },
    {
      "experienceSlug": "merci-pour",
      "kind": "open",
      "prompt": "Qu'est-ce que tu veux remercier chez toi, aussi ?",
      "depth": "moyen",
      "themes": [
        "relation"
      ],
      "order": 6,
      "status": "published"
    },
    {
      "experienceSlug": "ce-que-je-ne-t-ai-jamais-dit",
      "kind": "open",
      "prompt": "Quelle peur ne t'ai-je jamais vraiment avouée ?",
      "depth": "profond",
      "themes": [
        "relation"
      ],
      "order": 1,
      "status": "published"
    },
    {
      "experienceSlug": "ce-que-je-ne-t-ai-jamais-dit",
      "kind": "open",
      "prompt": "Quel moment de nous deux t'a le plus bouleversé·e, sans que je le sache ?",
      "depth": "profond",
      "themes": [
        "tendresse"
      ],
      "order": 2,
      "status": "published"
    },
    {
      "experienceSlug": "ce-que-je-ne-t-ai-jamais-dit",
      "kind": "open",
      "prompt": "Quelle fierté gardes-tu secrète, même auprès de moi ?",
      "depth": "profond",
      "themes": [
        "relation"
      ],
      "order": 3,
      "status": "published"
    },
    {
      "experienceSlug": "ce-que-je-ne-t-ai-jamais-dit",
      "kind": "open",
      "prompt": "Qu'est-ce que tu attends de moi et que tu n'as jamais osé demander ?",
      "depth": "profond",
      "themes": [
        "écoute"
      ],
      "order": 4,
      "status": "published"
    },
    {
      "experienceSlug": "ce-que-je-ne-t-ai-jamais-dit",
      "kind": "open",
      "prompt": "Quelle phrase aimerais-tu que je te dise, même une seule fois ?",
      "depth": "profond",
      "themes": [
        "affection"
      ],
      "order": 5,
      "status": "published"
    },
    {
      "experienceSlug": "dans-un-an-dans-cinq-ans",
      "kind": "choice",
      "prompt": "Dans un an, qu'est-ce qui aurait le plus changé pour toi ?",
      "depth": "moyen",
      "themes": [
        "futur"
      ],
      "order": 1,
      "status": "published",
      "options": [
        "Mon travail",
        "Mon quotidien",
        "Mes projets",
        "Rien, et c'est très bien"
      ]
    },
    {
      "experienceSlug": "dans-un-an-dans-cinq-ans",
      "kind": "open",
      "prompt": "Où aimerais-tu que nous soyons dans cinq ans ?",
      "depth": "moyen",
      "themes": [
        "futur"
      ],
      "order": 2,
      "status": "published"
    },
    {
      "experienceSlug": "dans-un-an-dans-cinq-ans",
      "kind": "open",
      "prompt": "Qu'est-ce qu'on devrait commencer maintenant pour y arriver ?",
      "depth": "moyen",
      "themes": [
        "planification"
      ],
      "order": 3,
      "status": "published"
    },
    {
      "experienceSlug": "dans-un-an-dans-cinq-ans",
      "kind": "open",
      "prompt": "Quel rêve aimerais-tu que nous protégions, même quand la vie bouscule ?",
      "depth": "moyen",
      "themes": [
        "rêves"
      ],
      "order": 4,
      "status": "published"
    },
    {
      "experienceSlug": "dans-un-an-dans-cinq-ans",
      "kind": "open",
      "prompt": "Qu'est-ce qui te ferait dire, dans quelques années : « on a réussi » ?",
      "depth": "moyen",
      "themes": [
        "futur"
      ],
      "order": 5,
      "status": "published"
    },
    {
      "experienceSlug": "dans-un-an-dans-cinq-ans",
      "kind": "open",
      "prompt": "Qu'aimerais-tu qu'on se promette aujourd'hui, sans en faire une contrainte ?",
      "depth": "moyen",
      "themes": [
        "relation"
      ],
      "order": 6,
      "status": "published"
    },
    {
      "experienceSlug": "nos-petits-rituels",
      "kind": "choice",
      "prompt": "Quel est notre rituel qui compte le plus pour toi ?",
      "depth": "leger",
      "themes": [
        "rituels"
      ],
      "order": 1,
      "status": "published",
      "options": [
        "Le message du matin",
        "Le moment du repas",
        "L'appel du soir",
        "Le silence, côte à côte"
      ]
    },
    {
      "experienceSlug": "nos-petits-rituels",
      "kind": "open",
      "prompt": "Qu'est-ce que nous faisons déjà que tu voudrais garder pour toujours ?",
      "depth": "moyen",
      "themes": [
        "rituels"
      ],
      "order": 2,
      "status": "published"
    },
    {
      "experienceSlug": "nos-petits-rituels",
      "kind": "open",
      "prompt": "Quel petit rituel aimerais-tu qu'on invente, rien qu'à nous deux ?",
      "depth": "moyen",
      "themes": [
        "tendresse"
      ],
      "order": 3,
      "status": "published"
    },
    {
      "experienceSlug": "nos-petits-rituels",
      "kind": "open",
      "prompt": "Comment sais-tu, dès le matin, que la journée va bien se passer entre nous ?",
      "depth": "moyen",
      "themes": [
        "relation"
      ],
      "order": 4,
      "status": "published"
    },
    {
      "experienceSlug": "nos-petits-rituels",
      "kind": "open",
      "prompt": "Qu'est-ce qui te rassure le plus quand je suis loin ?",
      "depth": "moyen",
      "themes": [
        "sécurité"
      ],
      "order": 5,
      "status": "published"
    },
    {
      "experienceSlug": "nos-petits-rituels",
      "kind": "open",
      "prompt": "Quel geste simple te fait te sentir attendu·e ?",
      "depth": "moyen",
      "themes": [
        "attentions"
      ],
      "order": 6,
      "status": "published"
    },
    {
      "experienceSlug": "nos-accords-silencieux",
      "kind": "choice",
      "prompt": "Sur lequel de ces sujets sommes-nous d'accord sans en parler ?",
      "depth": "moyen",
      "themes": [
        "valeurs"
      ],
      "order": 1,
      "status": "published",
      "options": [
        "Le temps pour soi",
        "L'argent",
        "La famille",
        "Les sorties et les amis"
      ]
    },
    {
      "experienceSlug": "nos-accords-silencieux",
      "kind": "open",
      "prompt": "Qu'est-ce qui est non négociable pour toi, même au cœur d'un désaccord ?",
      "depth": "moyen",
      "themes": [
        "valeurs"
      ],
      "order": 2,
      "status": "published"
    },
    {
      "experienceSlug": "nos-accords-silencieux",
      "kind": "open",
      "prompt": "Comment veux-tu qu'on se parle quand l'un de nous est en colère ?",
      "depth": "moyen",
      "themes": [
        "écoute"
      ],
      "order": 3,
      "status": "published"
    },
    {
      "experienceSlug": "nos-accords-silencieux",
      "kind": "open",
      "prompt": "Quelle promesse nous a le plus rapprochés ?",
      "depth": "moyen",
      "themes": [
        "sécurité"
      ],
      "order": 4,
      "status": "published"
    },
    {
      "experienceSlug": "nos-accords-silencieux",
      "kind": "open",
      "prompt": "Qu'est-ce qui te fait te sentir respecté·e dans notre couple ?",
      "depth": "moyen",
      "themes": [
        "sécurité"
      ],
      "order": 5,
      "status": "published"
    },
    {
      "experienceSlug": "nos-accords-silencieux",
      "kind": "open",
      "prompt": "Qu'est-ce qu'on devrait décider ensemble plus souvent ?",
      "depth": "moyen",
      "themes": [
        "relation"
      ],
      "order": 6,
      "status": "published"
    },
    {
      "experienceSlug": "rendez-vous-secret",
      "kind": "choice",
      "prompt": "Le rendez-vous idéal, ce serait plutôt…",
      "depth": "leger",
      "themes": [
        "rendez-vous"
      ],
      "order": 1,
      "status": "published",
      "options": [
        "Un dîner à la maison, sans téléphone",
        "Une sortie improvisée",
        "Une marche au coucher du soleil",
        "Un endroit que personne ne connaît"
      ]
    },
    {
      "experienceSlug": "rendez-vous-secret",
      "kind": "choice",
      "prompt": "À quel moment de la semaine te sens-tu le plus disponible pour moi ?",
      "depth": "leger",
      "themes": [
        "rythme"
      ],
      "order": 2,
      "status": "published",
      "options": [
        "Le matin, tôt",
        "Le soir, après tout",
        "Le week-end",
        "Quand ça arrive, sans prévoir"
      ]
    },
    {
      "experienceSlug": "rendez-vous-secret",
      "kind": "open",
      "prompt": "Quel lieu te fait penser à nous deux, même sans y être allés ?",
      "depth": "leger",
      "themes": [
        "romantisme"
      ],
      "order": 3,
      "status": "published"
    },
    {
      "experienceSlug": "rendez-vous-secret",
      "kind": "open",
      "prompt": "Qu'est-ce qui pourrait rendre notre prochain rendez-vous inoubliable ?",
      "depth": "moyen",
      "themes": [
        "surprise"
      ],
      "order": 4,
      "status": "published"
    },
    {
      "experienceSlug": "rendez-vous-secret",
      "kind": "open",
      "prompt": "Quelle attention préparerais-tu si tu avais une soirée entière ?",
      "depth": "moyen",
      "themes": [
        "attentions"
      ],
      "order": 5,
      "status": "published"
    },
    {
      "experienceSlug": "rendez-vous-secret",
      "kind": "open",
      "prompt": "Qu'est-ce qui te ferait sourire dès le début de la soirée ?",
      "depth": "leger",
      "themes": [
        "tendresse"
      ],
      "order": 6,
      "status": "published"
    },
    {
      "experienceSlug": "messages-qui-font-battre-le-coeur",
      "kind": "open",
      "prompt": "Quel message aimerais-tu recevoir de moi, un matin sans occasion ?",
      "depth": "leger",
      "themes": [
        "tendresse"
      ],
      "order": 1,
      "status": "published"
    },
    {
      "experienceSlug": "messages-qui-font-battre-le-coeur",
      "kind": "open",
      "prompt": "Écris la phrase que tu n'envoies jamais par pudeur.",
      "depth": "moyen",
      "themes": [
        "séduction"
      ],
      "order": 2,
      "status": "published"
    },
    {
      "experienceSlug": "messages-qui-font-battre-le-coeur",
      "kind": "open",
      "prompt": "Quel souvenir de nous deux mériterait d'être raconté encore une fois ?",
      "depth": "leger",
      "themes": [
        "romantisme"
      ],
      "order": 3,
      "status": "published"
    },
    {
      "experienceSlug": "messages-qui-font-battre-le-coeur",
      "kind": "open",
      "prompt": "Quel compliment te ferait sourire toute la journée ?",
      "depth": "leger",
      "themes": [
        "séduction"
      ],
      "order": 4,
      "status": "published"
    },
    {
      "experienceSlug": "messages-qui-font-battre-le-coeur",
      "kind": "open",
      "prompt": "Qu'est-ce que tu aimes dans la façon dont je t'écris ?",
      "depth": "leger",
      "themes": [
        "tendresse"
      ],
      "order": 5,
      "status": "published"
    },
    {
      "experienceSlug": "messages-qui-font-battre-le-coeur",
      "kind": "open",
      "prompt": "Quel mot préfères-tu quand je le prononce ?",
      "depth": "moyen",
      "themes": [
        "séduction"
      ],
      "order": 6,
      "status": "published"
    },
    {
      "experienceSlug": "audace-douce",
      "kind": "challenge",
      "prompt": "Chuchotez à l'autre la chose la plus tendre que vous n'ayez jamais dite à voix haute.",
      "depth": "moyen",
      "themes": [
        "séduction"
      ],
      "order": 1,
      "status": "published"
    },
    {
      "experienceSlug": "audace-douce",
      "kind": "challenge",
      "prompt": "Offrez à l'autre un compliment qui ne parle ni du physique ni des vêtements.",
      "depth": "moyen",
      "themes": [
        "tendresse"
      ],
      "order": 2,
      "status": "published"
    },
    {
      "experienceSlug": "audace-douce",
      "kind": "challenge",
      "prompt": "Prenez la main de l'autre et décrivez, en trois mots, ce que vous ressentez maintenant.",
      "depth": "moyen",
      "themes": [
        "séduction"
      ],
      "order": 3,
      "status": "published"
    },
    {
      "experienceSlug": "audace-douce",
      "kind": "challenge",
      "prompt": "Dites une chose que vous aimeriez faire à deux, et que vous n'avez jamais osé proposer.",
      "depth": "moyen",
      "themes": [
        "surprise"
      ],
      "order": 4,
      "status": "published"
    },
    {
      "experienceSlug": "audace-douce",
      "kind": "challenge",
      "prompt": "Racontez à l'autre votre premier souvenir de lui ou d'elle, avec ses détails.",
      "depth": "moyen",
      "themes": [
        "romantisme"
      ],
      "order": 5,
      "status": "published"
    },
    {
      "experienceSlug": "audace-douce",
      "kind": "challenge",
      "prompt": "Inventez ensemble un surnom tendre, et utilisez-le jusqu'à la fin de la soirée.",
      "depth": "leger",
      "themes": [
        "complicité"
      ],
      "order": 6,
      "status": "published"
    },
    {
      "experienceSlug": "jeu-du-regard",
      "kind": "challenge",
      "prompt": "Regardez-vous dans les yeux pendant vingt secondes, sans parler ni rire.",
      "depth": "leger",
      "themes": [
        "séduction"
      ],
      "order": 1,
      "status": "published"
    },
    {
      "experienceSlug": "jeu-du-regard",
      "kind": "challenge",
      "prompt": "Dites à l'autre une chose que vous n'aviez jamais remarquée chez lui, à voix basse.",
      "depth": "leger",
      "themes": [
        "séduction"
      ],
      "order": 2,
      "status": "published"
    },
    {
      "experienceSlug": "jeu-du-regard",
      "kind": "challenge",
      "prompt": "Imitez la façon dont l'autre vous regarde quand il ou elle est heureux·se.",
      "depth": "leger",
      "themes": [
        "jeu"
      ],
      "order": 3,
      "status": "published"
    },
    {
      "experienceSlug": "nos-premiers-instants",
      "kind": "choice",
      "prompt": "Qu'est-ce qui t'a plu en premier chez moi ?",
      "depth": "leger",
      "themes": [
        "récit"
      ],
      "order": 1,
      "status": "published",
      "options": [
        "Le regard",
        "La voix",
        "L'humour",
        "La façon d'écouter"
      ]
    },
    {
      "experienceSlug": "nos-premiers-instants",
      "kind": "open",
      "prompt": "Quel moment précis as-tu su que je te plaisais ?",
      "depth": "leger",
      "themes": [
        "récit"
      ],
      "order": 2,
      "status": "published"
    },
    {
      "experienceSlug": "nos-premiers-instants",
      "kind": "open",
      "prompt": "Qu'est-ce qui te rendait nerveux·se au début, et te fait rire maintenant ?",
      "depth": "leger",
      "themes": [
        "romantisme"
      ],
      "order": 3,
      "status": "published"
    },
    {
      "experienceSlug": "nos-premiers-instants",
      "kind": "open",
      "prompt": "Quelle phrase de nos débuts te revient encore parfois ?",
      "depth": "leger",
      "themes": [
        "romantisme"
      ],
      "order": 4,
      "status": "published"
    },
    {
      "experienceSlug": "nos-premiers-instants",
      "kind": "open",
      "prompt": "Qu'est-ce qui a changé entre nous, en mieux, depuis ce premier jour ?",
      "depth": "moyen",
      "themes": [
        "relation"
      ],
      "order": 5,
      "status": "published"
    },
    {
      "experienceSlug": "nos-premiers-instants",
      "kind": "open",
      "prompt": "Que voudrais-tu revivre une seule fois, exactement comme la première fois ?",
      "depth": "moyen",
      "themes": [
        "tendresse"
      ],
      "order": 6,
      "status": "published"
    },
    {
      "experienceSlug": "etincelles-du-quotidien",
      "kind": "choice",
      "prompt": "Quel petit geste de l'autre te fait encore de l'effet ?",
      "depth": "leger",
      "themes": [
        "séduction"
      ],
      "order": 1,
      "status": "published",
      "options": [
        "Un regard en coin",
        "Une main posée au bon moment",
        "Un mot glissé à l'oreille",
        "Un sourire sans raison"
      ]
    },
    {
      "experienceSlug": "etincelles-du-quotidien",
      "kind": "open",
      "prompt": "Quel moment banal de la journée aimerais-tu transformer en moment à deux ?",
      "depth": "leger",
      "themes": [
        "quotidien"
      ],
      "order": 2,
      "status": "published"
    },
    {
      "experienceSlug": "etincelles-du-quotidien",
      "kind": "open",
      "prompt": "Quelle tenue de l'autre te fait te retourner, à chaque fois ?",
      "depth": "moyen",
      "themes": [
        "séduction"
      ],
      "order": 3,
      "status": "published"
    },
    {
      "experienceSlug": "etincelles-du-quotidien",
      "kind": "open",
      "prompt": "Quel détail chez moi remarques-tu alors que je crois que personne ne le voit ?",
      "depth": "moyen",
      "themes": [
        "tendresse"
      ],
      "order": 4,
      "status": "published"
    },
    {
      "experienceSlug": "etincelles-du-quotidien",
      "kind": "open",
      "prompt": "Qu'est-ce qui rend une soirée ordinaire soudainement spéciale entre nous ?",
      "depth": "leger",
      "themes": [
        "complicité"
      ],
      "order": 5,
      "status": "published"
    },
    {
      "experienceSlug": "etincelles-du-quotidien",
      "kind": "open",
      "prompt": "Quelle petite surprise aimerais-tu recevoir cette semaine ?",
      "depth": "leger",
      "themes": [
        "surprise"
      ],
      "order": 6,
      "status": "published"
    },
    {
      "experienceSlug": "ce-qui-me-seduit-chez-toi",
      "kind": "open",
      "prompt": "Quelle chose chez moi te plaît et que tu n'as jamais dite clairement ?",
      "depth": "moyen",
      "themes": [
        "séduction"
      ],
      "order": 1,
      "status": "published"
    },
    {
      "experienceSlug": "ce-qui-me-seduit-chez-toi",
      "kind": "open",
      "prompt": "Qu'est-ce qui te séduit dans ma façon d'être, pas seulement dans mon apparence ?",
      "depth": "moyen",
      "themes": [
        "séduction"
      ],
      "order": 2,
      "status": "published"
    },
    {
      "experienceSlug": "ce-qui-me-seduit-chez-toi",
      "kind": "open",
      "prompt": "Quand est-ce que tu m'as trouvé·e le plus beau ou la plus belle ?",
      "depth": "moyen",
      "themes": [
        "tendresse"
      ],
      "order": 3,
      "status": "published"
    },
    {
      "experienceSlug": "ce-qui-me-seduit-chez-toi",
      "kind": "open",
      "prompt": "Quelle voix, quelle intonation de moi te fait sourire ?",
      "depth": "moyen",
      "themes": [
        "tendresse"
      ],
      "order": 4,
      "status": "published"
    },
    {
      "experienceSlug": "ce-qui-me-seduit-chez-toi",
      "kind": "open",
      "prompt": "Quel geste de moi te donne envie de te rapprocher ?",
      "depth": "moyen",
      "themes": [
        "séduction"
      ],
      "order": 5,
      "status": "published"
    },
    {
      "experienceSlug": "ce-qui-me-seduit-chez-toi",
      "kind": "open",
      "prompt": "Qu'est-ce que tu aimes dans le fait que je sois toi, tout simplement ?",
      "depth": "moyen",
      "themes": [
        "tendresse"
      ],
      "order": 6,
      "status": "published"
    },
    {
      "experienceSlug": "voyage-dont-on-reve",
      "kind": "choice",
      "prompt": "Ce serait plutôt…",
      "depth": "leger",
      "themes": [
        "préférences"
      ],
      "order": 1,
      "status": "published",
      "options": [
        "Une plage isolée",
        "Une grande ville",
        "La montagne",
        "L'aventure"
      ]
    },
    {
      "experienceSlug": "voyage-dont-on-reve",
      "kind": "open",
      "prompt": "Qu'est-ce qu'on ferait là-bas, le matin, le soir ?",
      "depth": "moyen",
      "themes": [
        "futur"
      ],
      "order": 2,
      "status": "published"
    },
    {
      "experienceSlug": "voyage-dont-on-reve",
      "kind": "open",
      "prompt": "Qu'est-ce qui nous empêcherait de rentrer ?",
      "depth": "moyen",
      "themes": [
        "romantisme"
      ],
      "order": 3,
      "status": "published"
    },
    {
      "experienceSlug": "ce-que-tu-veux-quon-garde",
      "kind": "open",
      "prompt": "Quel souvenir veux-tu qu'on ne perde jamais ?",
      "depth": "profond",
      "themes": [
        "relation"
      ],
      "order": 1,
      "status": "published"
    },
    {
      "experienceSlug": "ce-que-tu-veux-quon-garde",
      "kind": "open",
      "prompt": "Quelle habitude veux-tu qu'on garde ?",
      "depth": "moyen",
      "themes": [
        "relation"
      ],
      "order": 2,
      "status": "published"
    },
    {
      "experienceSlug": "ce-que-tu-veux-quon-garde",
      "kind": "open",
      "prompt": "Qu'est-ce que tu veux qu'on continue à faire ensemble ?",
      "depth": "profond",
      "themes": [
        "futur"
      ],
      "order": 3,
      "status": "published"
    },
    {
      "experienceSlug": "jour-ou-tout-a-change",
      "kind": "open",
      "prompt": "Quel est le jour où tu as su que tu m'aimais vraiment ?",
      "depth": "profond",
      "themes": [
        "relation"
      ],
      "order": 1,
      "status": "published"
    },
    {
      "experienceSlug": "jour-ou-tout-a-change",
      "kind": "open",
      "prompt": "Qu'est-ce qui a changé dans ton attitude après ce jour ?",
      "depth": "profond",
      "themes": [
        "relation"
      ],
      "order": 2,
      "status": "published"
    },
    {
      "experienceSlug": "jour-ou-tout-a-change",
      "kind": "open",
      "prompt": "Ce jour a-t-il influencé la suite de notre histoire ?",
      "depth": "profond",
      "themes": [
        "relation"
      ],
      "order": 3,
      "status": "published"
    },
    {
      "experienceSlug": "notre-premiere-dispute",
      "kind": "open",
      "prompt": "Qu'est-ce qui a déclenché notre première vraie dispute ?",
      "depth": "moyen",
      "themes": [
        "relation"
      ],
      "order": 1,
      "status": "published"
    },
    {
      "experienceSlug": "notre-premiere-dispute",
      "kind": "open",
      "prompt": "Comment as-tu vécu ce moment ?",
      "depth": "profond",
      "themes": [
        "relation"
      ],
      "order": 2,
      "status": "published"
    },
    {
      "experienceSlug": "notre-premiere-dispute",
      "kind": "open",
      "prompt": "Qu'est-ce qu'elle nous a appris ?",
      "depth": "profond",
      "themes": [
        "relation"
      ],
      "order": 3,
      "status": "published"
    },
    {
      "experienceSlug": "premier-baiser",
      "kind": "open",
      "prompt": "Quel souvenir précis gardes-tu de notre premier baiser ?",
      "depth": "moyen",
      "themes": [
        "récit"
      ],
      "order": 1,
      "status": "published"
    },
    {
      "experienceSlug": "premier-baiser",
      "kind": "open",
      "prompt": "Où étions-nous exactement ? Ce que tu portais, ce que je portais ?",
      "depth": "moyen",
      "themes": [
        "récit"
      ],
      "order": 2,
      "status": "published"
    },
    {
      "experienceSlug": "premier-baiser",
      "kind": "open",
      "prompt": "Qu'est-ce que ce moment t'a fait penser à propos de nous ?",
      "depth": "profond",
      "themes": [
        "relation"
      ],
      "order": 3,
      "status": "published"
    },
    {
      "experienceSlug": "notre-premier",
      "kind": "choice",
      "prompt": "Le premier dont tu te souviens le mieux ?",
      "depth": "leger",
      "themes": [
        "préférences"
      ],
      "order": 1,
      "status": "published",
      "options": [
        "Repas",
        "Weekend",
        "Cadeau",
        "Séjour"
      ]
    },
    {
      "experienceSlug": "notre-premier",
      "kind": "open",
      "prompt": "Quel est le détail marquant de ce moment ?",
      "depth": "moyen",
      "themes": [
        "récit"
      ],
      "order": 2,
      "status": "published"
    },
    {
      "experienceSlug": "notre-premier",
      "kind": "open",
      "prompt": "Est-ce qu'on recommence souvent ce genre de moment ?",
      "depth": "moyen",
      "themes": [
        "relation"
      ],
      "order": 3,
      "status": "published"
    },
    {
      "experienceSlug": "ce-qui-nous-rapproche",
      "kind": "open",
      "prompt": "Quand est-ce que tu t'es senti·e le plus proche de moi ?",
      "depth": "moyen",
      "themes": [
        "relation"
      ],
      "order": 1,
      "status": "published"
    },
    {
      "experienceSlug": "ce-qui-nous-rapproche",
      "kind": "open",
      "prompt": "Qu'est-ce qu'on fait ensemble qui te rapproche de moi ?",
      "depth": "moyen",
      "themes": [
        "relation"
      ],
      "order": 2,
      "status": "published"
    },
    {
      "experienceSlug": "ce-qui-nous-rapproche",
      "kind": "open",
      "prompt": "Qu'est-ce qui te fait dire « on est vraiment ensemble » ?",
      "depth": "profond",
      "themes": [
        "relation"
      ],
      "order": 3,
      "status": "published"
    },
    {
      "experienceSlug": "lhistoire-quon-raconte",
      "kind": "open",
      "prompt": "Quelle histoire raconte-t-on le plus sur nous ?",
      "depth": "leger",
      "themes": [
        "récit"
      ],
      "order": 1,
      "status": "published"
    },
    {
      "experienceSlug": "lhistoire-quon-raconte",
      "kind": "open",
      "prompt": "Pourquoi cette histoire te plaît-elle ?",
      "depth": "leger",
      "themes": [
        "tendresse"
      ],
      "order": 2,
      "status": "published"
    },
    {
      "experienceSlug": "lhistoire-quon-raconte",
      "kind": "open",
      "prompt": "Y a-t-il un détail qu'on oublie de raconter ?",
      "depth": "moyen",
      "themes": [
        "récit"
      ],
      "order": 3,
      "status": "published"
    },
    {
      "experienceSlug": "le-rire-qui-nous-unis",
      "kind": "open",
      "prompt": "Quel est le moment où tu as le plus ri avec moi ?",
      "depth": "leger",
      "themes": [
        "humour"
      ],
      "order": 1,
      "status": "published"
    },
    {
      "experienceSlug": "le-rire-qui-nous-unis",
      "kind": "open",
      "prompt": "Pourquoi est-ce que ça te revient souvent ?",
      "depth": "moyen",
      "themes": [
        "complicité"
      ],
      "order": 2,
      "status": "published"
    },
    {
      "experienceSlug": "le-rire-qui-nous-unis",
      "kind": "open",
      "prompt": "Est-ce qu'on rit encore comme ça ?",
      "depth": "moyen",
      "themes": [
        "relation"
      ],
      "order": 3,
      "status": "published"
    },
    {
      "experienceSlug": "le-cadeau-le-plus-moyen",
      "kind": "open",
      "prompt": "Quel cadeau m'as-tu offert que tu as préféré ?",
      "depth": "moyen",
      "themes": [
        "attentions"
      ],
      "order": 1,
      "status": "published"
    },
    {
      "experienceSlug": "le-cadeau-le-plus-moyen",
      "kind": "open",
      "prompt": "Quel cadeau m'as-tu donné que tu as préféré ?",
      "depth": "moyen",
      "themes": [
        "attentions"
      ],
      "order": 2,
      "status": "published"
    },
    {
      "experienceSlug": "le-cadeau-le-plus-moyen",
      "kind": "open",
      "prompt": "Qu'est-ce qui rend ce cadeau spécial ?",
      "depth": "moyen",
      "themes": [
        "tendresse"
      ],
      "order": 3,
      "status": "published"
    },
    {
      "experienceSlug": "scene-a-deux",
      "kind": "choice",
      "prompt": "Où serait-ce ?",
      "depth": "leger",
      "themes": [
        "préférences"
      ],
      "order": 1,
      "status": "published",
      "options": [
        "À la maison",
        "À l'hôtel",
        "En extérieur",
        "Partout"
      ]
    },
    {
      "experienceSlug": "scene-a-deux",
      "kind": "choice",
      "prompt": "Quelle ambiance ?",
      "depth": "moyen",
      "themes": [
        "préférences"
      ],
      "order": 2,
      "status": "published",
      "options": [
        "Romantique",
        "Joueuse",
        "Sensuelle",
        "Audacieuse"
      ]
    },
    {
      "experienceSlug": "scene-a-deux",
      "kind": "open",
      "prompt": "Quel serait le premier geste ?",
      "depth": "profond",
      "themes": [
        "relation"
      ],
      "order": 3,
      "status": "published"
    },
    {
      "experienceSlug": "scene-a-deux",
      "kind": "open",
      "prompt": "Quelle durée souhaites-tu ?",
      "depth": "moyen",
      "themes": [
        "préférences"
      ],
      "order": 4,
      "status": "published"
    },
    {
      "experienceSlug": "defis-tendresse",
      "kind": "challenge",
      "prompt": "Fais un câlin de deux minutes sans rien dire.",
      "depth": "leger",
      "themes": [
        "affection"
      ],
      "order": 1,
      "status": "published"
    },
    {
      "experienceSlug": "defis-tendresse",
      "kind": "challenge",
      "prompt": "Masse les épaules de l'autre pendant trois minutes.",
      "depth": "moyen",
      "themes": [
        "tendresse"
      ],
      "order": 2,
      "status": "published"
    },
    {
      "experienceSlug": "defis-tendresse",
      "kind": "challenge",
      "prompt": "Bisous le front de l'autre en silence.",
      "depth": "leger",
      "themes": [
        "affection"
      ],
      "order": 3,
      "status": "published"
    },
    {
      "experienceSlug": "defis-tendresse",
      "kind": "challenge",
      "prompt": "Tenez-vous la main pendant cinq minutes.",
      "depth": "leger",
      "themes": [
        "affection"
      ],
      "order": 4,
      "status": "published"
    },
    {
      "experienceSlug": "defis-tendresse",
      "kind": "challenge",
      "prompt": "Étreignez-vous pendant deux minutes.",
      "depth": "leger",
      "themes": [
        "affection"
      ],
      "order": 5,
      "status": "published"
    },
    {
      "experienceSlug": "defis-tendresse",
      "kind": "challenge",
      "prompt": "Faites-vous un massage aux pieds.",
      "depth": "moyen",
      "themes": [
        "tendresse"
      ],
      "order": 6,
      "status": "published"
    },
    {
      "experienceSlug": "defis-tendresse",
      "kind": "challenge",
      "prompt": "Étreignez-vous pendant trois minutes.",
      "depth": "leger",
      "themes": [
        "affection"
      ],
      "order": 7,
      "status": "published"
    },
    {
      "experienceSlug": "defis-tendresse",
      "kind": "challenge",
      "prompt": "Massez les épaules de l'autre.",
      "depth": "moyen",
      "themes": [
        "tendresse"
      ],
      "order": 8,
      "status": "published"
    },
    {
      "experienceSlug": "questions-intimes",
      "kind": "open",
      "prompt": "Quel souvenir de nous te fait encore sourire ?",
      "depth": "leger",
      "themes": [
        "récit"
      ],
      "order": 1,
      "status": "published"
    },
    {
      "experienceSlug": "questions-intimes",
      "kind": "open",
      "prompt": "Qu'est-ce qui te fait te sentir aimé·e ?",
      "depth": "moyen",
      "themes": [
        "affection"
      ],
      "order": 2,
      "status": "published"
    },
    {
      "experienceSlug": "questions-intimes",
      "kind": "open",
      "prompt": "Quelle qualité admires-tu le plus chez moi ?",
      "depth": "moyen",
      "themes": [
        "affection"
      ],
      "order": 3,
      "status": "published"
    },
    {
      "experienceSlug": "questions-intimes",
      "kind": "open",
      "prompt": "Quel moment aimerais-tu revivre ?",
      "depth": "profond",
      "themes": [
        "récit"
      ],
      "order": 4,
      "status": "published"
    },
    {
      "experienceSlug": "questions-intimes",
      "kind": "open",
      "prompt": "Qu'est-ce qui t'a fait dire « c'est lui/elle » ?",
      "depth": "moyen",
      "themes": [
        "relation"
      ],
      "order": 5,
      "status": "published"
    },
    {
      "experienceSlug": "questions-intimes",
      "kind": "open",
      "prompt": "Quand as-tu su que tu me manquerais ?",
      "depth": "profond",
      "themes": [
        "relation"
      ],
      "order": 6,
      "status": "published"
    },
    {
      "experienceSlug": "questions-intimes",
      "kind": "open",
      "prompt": "Quelle petite chose fait ta journée plus belle ?",
      "depth": "leger",
      "themes": [
        "affection"
      ],
      "order": 7,
      "status": "published"
    },
    {
      "experienceSlug": "questions-intimes",
      "kind": "open",
      "prompt": "Qu'est-ce que tu n'oses pas me dire ?",
      "depth": "profond",
      "themes": [
        "relation"
      ],
      "order": 8,
      "status": "published"
    },
    {
      "experienceSlug": "questions-intimes",
      "kind": "open",
      "prompt": "Quel est notre meilleur souvenir ?",
      "depth": "moyen",
      "themes": [
        "récit"
      ],
      "order": 9,
      "status": "published"
    },
    {
      "experienceSlug": "questions-intimes",
      "kind": "open",
      "prompt": "Qu'est-ce qui te rend fier·ère de nous ?",
      "depth": "moyen",
      "themes": [
        "relation"
      ],
      "order": 10,
      "status": "published"
    },
    {
      "experienceSlug": "questions-intimes",
      "kind": "open",
      "prompt": "Qu'est-ce qui te rendrait jaloux·se ?",
      "depth": "profond",
      "themes": [
        "relation"
      ],
      "order": 11,
      "status": "published"
    },
    {
      "experienceSlug": "questions-intimes",
      "kind": "open",
      "prompt": "Qu'est-ce qui te ferait pleurer de bonheur ?",
      "depth": "profond",
      "themes": [
        "relation"
      ],
      "order": 12,
      "status": "published"
    },
    {
      "experienceSlug": "questions-intimes",
      "kind": "open",
      "prompt": "Quel conseil me donnerais-tu ?",
      "depth": "moyen",
      "themes": [
        "relation"
      ],
      "order": 13,
      "status": "published"
    },
    {
      "experienceSlug": "questions-intimes",
      "kind": "open",
      "prompt": "Qu'est-ce qui nous rend uniques ?",
      "depth": "profond",
      "themes": [
        "relation"
      ],
      "order": 14,
      "status": "published"
    },
    {
      "experienceSlug": "questions-intimes",
      "kind": "open",
      "prompt": "Quel est ton souvenir de nous le plus touchant ?",
      "depth": "profond",
      "themes": [
        "relation"
      ],
      "order": 15,
      "status": "published"
    },
    {
      "experienceSlug": "questions-intimes",
      "kind": "open",
      "prompt": "Qu'est-ce que tu aimerais qu'on fasse plus souvent ?",
      "depth": "moyen",
      "themes": [
        "relation"
      ],
      "order": 16,
      "status": "published"
    },
    {
      "experienceSlug": "questions-intimes",
      "kind": "open",
      "prompt": "Quel est ton plus beau souvenir de nous ?",
      "depth": "profond",
      "themes": [
        "récit"
      ],
      "order": 17,
      "status": "published"
    },
    {
      "experienceSlug": "questions-intimes",
      "kind": "open",
      "prompt": "Qu'est-ce que tu veux qu'on ne change jamais ?",
      "depth": "profond",
      "themes": [
        "relation"
      ],
      "order": 18,
      "status": "published"
    },
    {
      "experienceSlug": "questions-intimes",
      "kind": "open",
      "prompt": "Qu'est-ce que tu espères pour nous ?",
      "depth": "profond",
      "themes": [
        "futur"
      ],
      "order": 19,
      "status": "published"
    },
    {
      "experienceSlug": "questions-intimes",
      "kind": "open",
      "prompt": "Qu'est-ce que tu m'aimes pour ?",
      "depth": "profond",
      "themes": [
        "relation"
      ],
      "order": 20,
      "status": "published"
    },
    {
      "experienceSlug": "fantasme-a-raconter",
      "kind": "open",
      "prompt": "Y a-t-il un fantasme que tu aimerais partager ?",
      "depth": "profond",
      "themes": [
        "relation"
      ],
      "order": 1,
      "status": "published"
    },
    {
      "experienceSlug": "fantasme-a-raconter",
      "kind": "open",
      "prompt": "Qu'est-ce qui te fait fantasmer ?",
      "depth": "profond",
      "themes": [
        "relation"
      ],
      "order": 2,
      "status": "published"
    },
    {
      "experienceSlug": "fantasme-a-raconter",
      "kind": "open",
      "prompt": "Quel serait ton fantasme idéal ?",
      "depth": "profond",
      "themes": [
        "relation"
      ],
      "order": 3,
      "status": "published"
    },
    {
      "experienceSlug": "fantasme-a-raconter",
      "kind": "open",
      "prompt": "Qu'est-ce qui te fait rêver ?",
      "depth": "profond",
      "themes": [
        "relation"
      ],
      "order": 4,
      "status": "published"
    },
    {
      "experienceSlug": "fantasme-a-raconter",
      "kind": "open",
      "prompt": "Quel serait ton fantasme ?",
      "depth": "profond",
      "themes": [
        "relation"
      ],
      "order": 5,
      "status": "published"
    },
    {
      "experienceSlug": "distance-intimite",
      "kind": "open",
      "prompt": "Qu'est-ce qui te manque le plus de moi ?",
      "depth": "moyen",
      "themes": [
        "relation"
      ],
      "order": 1,
      "status": "published"
    },
    {
      "experienceSlug": "distance-intimite",
      "kind": "open",
      "prompt": "Qu'est-ce que tu aimerais partager à distance ?",
      "depth": "profond",
      "themes": [
        "relation"
      ],
      "order": 2,
      "status": "published"
    },
    {
      "experienceSlug": "distance-intimite",
      "kind": "open",
      "prompt": "Quel souvenir de nous te fait sourire ?",
      "depth": "leger",
      "themes": [
        "récit"
      ],
      "order": 3,
      "status": "published"
    },
    {
      "experienceSlug": "distance-intimite",
      "kind": "open",
      "prompt": "Quelle envie à réaliser ensemble bientôt ?",
      "depth": "moyen",
      "themes": [
        "relation"
      ],
      "order": 4,
      "status": "published"
    },
    {
      "experienceSlug": "marche-envies",
      "kind": "choice",
      "prompt": "Qu'est-ce qui te tente le plus ?",
      "depth": "leger",
      "themes": [
        "préférences"
      ],
      "order": 1,
      "status": "published",
      "options": [
        "Un massage",
        "Une soirée sans téléphone",
        "Un long câlin",
        "Une surprise"
      ]
    },
    {
      "experienceSlug": "marche-envies",
      "kind": "choice",
      "prompt": "Qu'est-ce qui te ferait du bien ?",
      "depth": "moyen",
      "themes": [
        "préférences"
      ],
      "order": 2,
      "status": "published",
      "options": [
        "Une discussion",
        "Une ambiance nouvelle",
        "Un rendez-vous",
        "Une activité sensorielle"
      ]
    },
    {
      "experienceSlug": "marche-envies",
      "kind": "open",
      "prompt": "Quelle envie aimerais-tu voir réalisée ?",
      "depth": "profond",
      "themes": [
        "relation"
      ],
      "order": 3,
      "status": "published"
    },
    {
      "experienceSlug": "souvenirs-sensuels",
      "kind": "open",
      "prompt": "Quel souvenir te fait encore frémir ?",
      "depth": "moyen",
      "themes": [
        "récit"
      ],
      "order": 1,
      "status": "published"
    },
    {
      "experienceSlug": "souvenirs-sensuels",
      "kind": "open",
      "prompt": "Quelle odeur, quel son, quel goût te rappelle nos moments ensemble ?",
      "depth": "profond",
      "themes": [
        "relation"
      ],
      "order": 2,
      "status": "published"
    },
    {
      "experienceSlug": "souvenirs-sensuels",
      "kind": "open",
      "prompt": "Quel geste de ma part te fait encore vibrer ?",
      "depth": "profond",
      "themes": [
        "affection"
      ],
      "order": 3,
      "status": "published"
    },
    {
      "experienceSlug": "souvenirs-sensuels",
      "kind": "open",
      "prompt": "Quel souvenir veux-tu qu'on garde ?",
      "depth": "profond",
      "themes": [
        "relation"
      ],
      "order": 4,
      "status": "published"
    },
    {
      "experienceSlug": "souvenirs-sensuels",
      "kind": "open",
      "prompt": "Quel est ton moment préféré ensemble ?",
      "depth": "moyen",
      "themes": [
        "relation"
      ],
      "order": 5,
      "status": "published"
    },
    {
      "experienceSlug": "souvenirs-sensuels",
      "kind": "open",
      "prompt": "Qu'est-ce qui t'excite le plus chez moi ?",
      "depth": "profond",
      "themes": [
        "affection"
      ],
      "order": 6,
      "status": "published"
    },
    {
      "experienceSlug": "souvenirs-sensuels",
      "kind": "open",
      "prompt": "Quel est ton souvenir le plus sensuel ?",
      "depth": "profond",
      "themes": [
        "relation"
      ],
      "order": 7,
      "status": "published"
    },
    {
      "experienceSlug": "souvenirs-sensuels",
      "kind": "open",
      "prompt": "Qu'est-ce qui t'attire le plus ?",
      "depth": "profond",
      "themes": [
        "affection"
      ],
      "order": 8,
      "status": "published"
    },
    {
      "experienceSlug": "souvenirs-sensuels",
      "kind": "open",
      "prompt": "Qu'est-ce qui te fait vibrer le plus ?",
      "depth": "profond",
      "themes": [
        "relation"
      ],
      "order": 9,
      "status": "published"
    },
    {
      "experienceSlug": "souvenirs-sensuels",
      "kind": "open",
      "prompt": "Quel est ton souvenir le plus beau ?",
      "depth": "profond",
      "themes": [
        "relation"
      ],
      "order": 10,
      "status": "published"
    },
    {
      "experienceSlug": "souvenirs-sensuels",
      "kind": "open",
      "prompt": "Qu'est-ce qui te fait sourire le plus ?",
      "depth": "moyen",
      "themes": [
        "relation"
      ],
      "order": 11,
      "status": "published"
    },
    {
      "experienceSlug": "souvenirs-sensuels",
      "kind": "open",
      "prompt": "Quel est ton souvenir le plus touchant ?",
      "depth": "profond",
      "themes": [
        "relation"
      ],
      "order": 12,
      "status": "published"
    },
    {
      "experienceSlug": "souvenirs-sensuels",
      "kind": "open",
      "prompt": "Qu'est-ce qui te fait le plus vibrer ?",
      "depth": "profond",
      "themes": [
        "relation"
      ],
      "order": 13,
      "status": "published"
    },
    {
      "experienceSlug": "souvenirs-sensuels",
      "kind": "open",
      "prompt": "Quel est ton plus beau souvenir ?",
      "depth": "profond",
      "themes": [
        "relation"
      ],
      "order": 14,
      "status": "published"
    },
    {
      "experienceSlug": "souvenirs-sensuels",
      "kind": "open",
      "prompt": "Qu'est-ce qui t'excite le plus ?",
      "depth": "profond",
      "themes": [
        "affection"
      ],
      "order": 15,
      "status": "published"
    },
    {
      "experienceSlug": "rencontre-myster",
      "kind": "choice",
      "prompt": "Quelle ambiance ?",
      "depth": "leger",
      "themes": [
        "préférences"
      ],
      "order": 1,
      "status": "published",
      "options": [
        "Romantique",
        "Joueuse",
        "Sensuelle",
        "Audacieuse"
      ]
    },
    {
      "experienceSlug": "rencontre-myster",
      "kind": "open",
      "prompt": "Quelle durée ?",
      "depth": "moyen",
      "themes": [
        "préférences"
      ],
      "order": 2,
      "status": "published"
    },
    {
      "experienceSlug": "rencontre-myster",
      "kind": "open",
      "prompt": "Quelle surprise aimerais-tu ?",
      "depth": "profond",
      "themes": [
        "relation"
      ],
      "order": 3,
      "status": "published"
    },
    {
      "experienceSlug": "rencontre-myster",
      "kind": "open",
      "prompt": "Quelle limite à ne pas dépasser ?",
      "depth": "profond",
      "themes": [
        "relation"
      ],
      "order": 4,
      "status": "published"
    },
    {
      "experienceSlug": "questions-oui-non-peut-etre",
      "kind": "choice",
      "prompt": "Essayer une nouvelle ambiance pour une soirée à deux ?",
      "depth": "leger",
      "themes": [
        "préférences"
      ],
      "order": 1,
      "status": "published",
      "options": [
        "Oui",
        "Peut-être",
        "Non"
      ]
    },
    {
      "experienceSlug": "questions-oui-non-peut-etre",
      "kind": "choice",
      "prompt": "Organiser un rendez-vous surprise ?",
      "depth": "leger",
      "themes": [
        "préférences"
      ],
      "order": 2,
      "status": "published",
      "options": [
        "Oui",
        "Peut-être",
        "Non"
      ]
    },
    {
      "experienceSlug": "questions-oui-non-peut-etre",
      "kind": "choice",
      "prompt": "Recevoir un massage ?",
      "depth": "moyen",
      "themes": [
        "préférences"
      ],
      "order": 3,
      "status": "published",
      "options": [
        "Oui",
        "Peut-être",
        "Non"
      ]
    },
    {
      "experienceSlug": "questions-oui-non-peut-etre",
      "kind": "choice",
      "prompt": "Jouer un rôle romantique ?",
      "depth": "moyen",
      "themes": [
        "préférences"
      ],
      "order": 4,
      "status": "published",
      "options": [
        "Oui",
        "Peut-être",
        "Non"
      ]
    },
    {
      "experienceSlug": "compliments-guides",
      "kind": "open",
      "prompt": "Quel détail de ton apparence m'attire le plus ?",
      "depth": "leger",
      "themes": [
        "affection"
      ],
      "order": 1,
      "status": "published"
    },
    {
      "experienceSlug": "compliments-guides",
      "kind": "open",
      "prompt": "Quelle qualité de ma personnalité admires-tu ?",
      "depth": "moyen",
      "themes": [
        "affection"
      ],
      "order": 2,
      "status": "published"
    },
    {
      "experienceSlug": "compliments-guides",
      "kind": "open",
      "prompt": "Quel moment d'intimité m'a le plus touché·e ?",
      "depth": "profond",
      "themes": [
        "relation"
      ],
      "order": 3,
      "status": "published"
    },
    {
      "experienceSlug": "compliments-guides",
      "kind": "open",
      "prompt": "Pourquoi es-tu reconnaissant·e envers moi ?",
      "depth": "moyen",
      "themes": [
        "relation"
      ],
      "order": 4,
      "status": "published"
    },
    {
      "experienceSlug": "compliments-guides",
      "kind": "open",
      "prompt": "Quel est ton sourire préféré sur moi ?",
      "depth": "leger",
      "themes": [
        "affection"
      ],
      "order": 5,
      "status": "published"
    },
    {
      "experienceSlug": "compliments-guides",
      "kind": "open",
      "prompt": "Qu'est-ce qui t'attire chez moi ?",
      "depth": "moyen",
      "themes": [
        "affection"
      ],
      "order": 6,
      "status": "published"
    },
    {
      "experienceSlug": "compliments-guides",
      "kind": "open",
      "prompt": "Quelle est ta préférée de mes qualités ?",
      "depth": "moyen",
      "themes": [
        "affection"
      ],
      "order": 7,
      "status": "published"
    },
    {
      "experienceSlug": "compliments-guides",
      "kind": "open",
      "prompt": "Quel est ton souvenir de moi le plus beau ?",
      "depth": "profond",
      "themes": [
        "relation"
      ],
      "order": 8,
      "status": "published"
    },
    {
      "experienceSlug": "compliments-guides",
      "kind": "open",
      "prompt": "Qu'est-ce qui te rend fier·ère d'être avec moi ?",
      "depth": "moyen",
      "themes": [
        "relation"
      ],
      "order": 9,
      "status": "published"
    },
    {
      "experienceSlug": "compliments-guides",
      "kind": "open",
      "prompt": "Quel est ton compliment pour moi ?",
      "depth": "moyen",
      "themes": [
        "affection"
      ],
      "order": 10,
      "status": "published"
    },
    {
      "experienceSlug": "compliments-guides",
      "kind": "open",
      "prompt": "Qu'est-ce que tu apprécies chez moi ?",
      "depth": "moyen",
      "themes": [
        "affection"
      ],
      "order": 11,
      "status": "published"
    },
    {
      "experienceSlug": "compliments-guides",
      "kind": "open",
      "prompt": "Quel est ton moment préféré avec moi ?",
      "depth": "moyen",
      "themes": [
        "relation"
      ],
      "order": 12,
      "status": "published"
    },
    {
      "experienceSlug": "compliments-guides",
      "kind": "open",
      "prompt": "Qu'est-ce qui te fait dire « je t'aime » ?",
      "depth": "profond",
      "themes": [
        "relation"
      ],
      "order": 13,
      "status": "published"
    },
    {
      "experienceSlug": "compliments-guides",
      "kind": "open",
      "prompt": "Quel est ton plus beau souvenir de moi ?",
      "depth": "profond",
      "themes": [
        "relation"
      ],
      "order": 14,
      "status": "published"
    },
    {
      "experienceSlug": "compliments-guides",
      "kind": "open",
      "prompt": "Qu'est-ce que tu admires chez moi ?",
      "depth": "moyen",
      "themes": [
        "affection"
      ],
      "order": 15,
      "status": "published"
    },
    {
      "experienceSlug": "compliments-guides",
      "kind": "open",
      "prompt": "Quel est ton plus grand compliment pour moi ?",
      "depth": "profond",
      "themes": [
        "affection"
      ],
      "order": 16,
      "status": "published"
    },
    {
      "experienceSlug": "compliments-guides",
      "kind": "open",
      "prompt": "Qu'est-ce que tu veux qu'on garde de nous ?",
      "depth": "profond",
      "themes": [
        "relation"
      ],
      "order": 17,
      "status": "published"
    },
    {
      "experienceSlug": "compliments-guides",
      "kind": "open",
      "prompt": "Qu'est-ce que tu veux qu'on n'oublie jamais ?",
      "depth": "profond",
      "themes": [
        "relation"
      ],
      "order": 18,
      "status": "published"
    },
    {
      "experienceSlug": "compliments-guides",
      "kind": "open",
      "prompt": "Quel est ton plus beau souvenir de nous ?",
      "depth": "profond",
      "themes": [
        "relation"
      ],
      "order": 19,
      "status": "published"
    },
    {
      "experienceSlug": "compliments-guides",
      "kind": "open",
      "prompt": "Qu'est-ce que tu veux qu'on fasse pour le futur ?",
      "depth": "profond",
      "themes": [
        "futur"
      ],
      "order": 20,
      "status": "published"
    }
  ],
  "journeys": [
    {
      "slug": "redecouvrons-nous",
      "title": "Redécouvrons-nous",
      "tagline": "Mieux se connaître",
      "description": "Sept jours de questions progressives pour retrouver ce qui vous relie, sans forcer.",
      "emoji": "💬",
      "order": 1.0,
      "status": "published",
      "lengthDays": 7,
      "createdAt": 1792244501957,
      "updatedAt": 1792244501957
    },
    {
      "slug": "ravivons-la-flamme",
      "title": "Ravivons la flamme",
      "tagline": "Retrouver du temps de qualité",
      "description": "Sept jours d'attentions et de rendez-vous pour remettre de la tendresse au premier plan.",
      "emoji": "💗",
      "order": 2.0,
      "status": "published",
      "lengthDays": 7,
      "createdAt": 1792244501957,
      "updatedAt": 1792244501957
    },
    {
      "slug": "une-semaine-sans-routine",
      "title": "Une semaine sans routine",
      "tagline": "Sortir de l'ordinaire",
      "description": "Un petit pas concret par jour pour casser les automatismes, sans se mettre la pression.",
      "emoji": "🌿",
      "order": 3.0,
      "status": "published",
      "lengthDays": 7,
      "createdAt": 1792244501957,
      "updatedAt": 1792244501957
    },
    {
      "slug": "nos-plus-beaux-souvenirs",
      "title": "Nos plus beaux souvenirs",
      "tagline": "Célébrer son histoire",
      "description": "Trois jours pour revisiter votre histoire commune et ce qu'elle dit de vous.",
      "emoji": "📸",
      "order": 4.0,
      "status": "published",
      "lengthDays": 3,
      "createdAt": 1792244501957,
      "updatedAt": 1792244501957
    },
    {
      "slug": "a-distance-mais-proches",
      "title": "À distance, mais proches",
      "tagline": "Quand la distance s'invite",
      "description": "Sept jours d'expériences pensées pour être vécues chacun chez soi, au même rythme.",
      "emoji": "✈️",
      "order": 5.0,
      "status": "published",
      "lengthDays": 7,
      "createdAt": 1792244501957,
      "updatedAt": 1792244501957
    }
  ],
  "journeySteps": [
    {
      "journeySlug": "redecouvrons-nous",
      "dayIndex": 1,
      "title": "On commence en douceur",
      "prompt": "Une partie légère pour se remettre dans le bain.",
      "experienceSlug": "qui-de-nous-deux"
    },
    {
      "journeySlug": "redecouvrons-nous",
      "dayIndex": 2,
      "title": "Nos rêves",
      "prompt": "Ce que l'autre n'a pas encore dit.",
      "experienceSlug": "nos-reves"
    },
    {
      "journeySlug": "redecouvrons-nous",
      "dayIndex": 3,
      "title": "Un compliment, à voix haute",
      "mission": "Dites-vous chacun un compliment sincère, là, maintenant."
    },
    {
      "journeySlug": "redecouvrons-nous",
      "dayIndex": 4,
      "title": "Ce qui compte vraiment",
      "prompt": "Vos valeurs, et ce que vous faites sans y penser.",
      "experienceSlug": "valeurs-et-habitudes"
    },
    {
      "journeySlug": "redecouvrons-nous",
      "dayIndex": 5,
      "title": "Votre premier rendez-vous",
      "mission": "Racontez chacun votre premier rendez-vous, avec un détail que l'autre ignore."
    },
    {
      "journeySlug": "redecouvrons-nous",
      "dayIndex": 6,
      "title": "Ce dont on a besoin",
      "prompt": "Un espace doux pour dire ce dont vous avez besoin.",
      "experienceSlug": "besoins-affectifs"
    },
    {
      "journeySlug": "redecouvrons-nous",
      "dayIndex": 7,
      "title": "Ce qu'on a découvert",
      "prompt": "Terminez sur une note légère et complice.",
      "experienceSlug": "devine-ma-reponse"
    },
    {
      "journeySlug": "ravivons-la-flamme",
      "dayIndex": 1,
      "title": "Compliments mystères",
      "prompt": "Un compliment sincère, révélé au même moment.",
      "experienceSlug": "compliments-mysteres"
    },
    {
      "journeySlug": "ravivons-la-flamme",
      "dayIndex": 2,
      "title": "Un message inattendu",
      "mission": "Envoyez un message qui commence par « Je pensais à toi parce que… »."
    },
    {
      "journeySlug": "ravivons-la-flamme",
      "dayIndex": 3,
      "title": "Tu préfères ?",
      "prompt": "Des dilemmes doux pour découvrir vos envies.",
      "experienceSlug": "tu-preferes-romantique"
    },
    {
      "journeySlug": "ravivons-la-flamme",
      "dayIndex": 4,
      "title": "30 minutes rien qu'à vous",
      "mission": "Bloquez un créneau de 30 minutes cette semaine, rien qu'à vous deux."
    },
    {
      "journeySlug": "ravivons-la-flamme",
      "dayIndex": 5,
      "title": "Petites attentions",
      "prompt": "Une mission toute simple à préparer pour l'autre.",
      "experienceSlug": "petites-attentions"
    },
    {
      "journeySlug": "ravivons-la-flamme",
      "dayIndex": 6,
      "title": "Rendez-vous à tour de rôle",
      "prompt": "Chacun prépare un rendez-vous pour l'autre, à son tour.",
      "experienceSlug": "rendez-vous-a-tour-de-role"
    },
    {
      "journeySlug": "ravivons-la-flamme",
      "dayIndex": 7,
      "title": "Refaire le meilleur moment",
      "mission": "Rejouez, en vrai, votre meilleur moment de la semaine."
    },
    {
      "journeySlug": "une-semaine-sans-routine",
      "dayIndex": 1,
      "title": "Surprises simples",
      "prompt": "Des idées concrètes, sans budget important.",
      "experienceSlug": "surprises-simples"
    },
    {
      "journeySlug": "une-semaine-sans-routine",
      "dayIndex": 2,
      "title": "Changez un détail",
      "mission": "Modifiez un petit automatisme : un trajet, une recette, une place à table."
    },
    {
      "journeySlug": "une-semaine-sans-routine",
      "dayIndex": 3,
      "title": "Nouvelle activité",
      "prompt": "Quelque chose que vous n'avez jamais essayé.",
      "experienceSlug": "nouvelle-activite"
    },
    {
      "journeySlug": "une-semaine-sans-routine",
      "dayIndex": 4,
      "title": "La chose remise à plus tard",
      "mission": "Faites enfin cette chose que vous repoussez depuis des mois."
    },
    {
      "journeySlug": "une-semaine-sans-routine",
      "dayIndex": 5,
      "title": "Défis rigolos",
      "prompt": "Des défis simples à faire ici et maintenant.",
      "experienceSlug": "defis-rigolos"
    },
    {
      "journeySlug": "une-semaine-sans-routine",
      "dayIndex": 6,
      "title": "20 minutes de marche",
      "mission": "Sortez marcher 20 minutes ensemble, sans téléphone."
    },
    {
      "journeySlug": "une-semaine-sans-routine",
      "dayIndex": 7,
      "title": "On garde le rythme",
      "mission": "Choisissez ensemble la prochaine chose à essayer."
    },
    {
      "journeySlug": "nos-plus-beaux-souvenirs",
      "dayIndex": 1,
      "title": "Votre photo préférée",
      "mission": "Choisissez chacun votre photo préférée de vous deux et racontez pourquoi."
    },
    {
      "journeySlug": "nos-plus-beaux-souvenirs",
      "dayIndex": 2,
      "title": "On se connaît bien ?",
      "prompt": "Un jeu pour vérifier ce que vous croyez savoir de l'autre.",
      "experienceSlug": "qui-de-nous-deux"
    },
    {
      "journeySlug": "nos-plus-beaux-souvenirs",
      "dayIndex": 3,
      "title": "Ce qu'on veut garder",
      "mission": "Notez à deux trois choses de votre histoire que vous voulez garder vivantes."
    },
    {
      "journeySlug": "a-distance-mais-proches",
      "dayIndex": 1,
      "title": "Compliments mystères",
      "prompt": "Un compliment sincère, révélé au même moment.",
      "experienceSlug": "compliments-mysteres"
    },
    {
      "journeySlug": "a-distance-mais-proches",
      "dayIndex": 2,
      "title": "Une photo de votre journée",
      "mission": "Envoyez-vous une photo de votre journée, sans commentaire."
    },
    {
      "journeySlug": "a-distance-mais-proches",
      "dayIndex": 3,
      "title": "Devine ma réponse",
      "prompt": "Répondez honnêtement, puis devinez ce que l'autre a répondu.",
      "experienceSlug": "devine-ma-reponse"
    },
    {
      "journeySlug": "a-distance-mais-proches",
      "dayIndex": 4,
      "title": "10 minutes au téléphone",
      "mission": "Appelez-vous 10 minutes, sans parler de logistique."
    },
    {
      "journeySlug": "a-distance-mais-proches",
      "dayIndex": 5,
      "title": "Tu préfères ?",
      "prompt": "Des dilemmes doux pour découvrir vos envies.",
      "experienceSlug": "tu-preferes-romantique"
    },
    {
      "journeySlug": "a-distance-mais-proches",
      "dayIndex": 6,
      "title": "Le même film, en même temps",
      "mission": "Regardez le même film chacun de son côté, en même temps, puis comparez."
    },
    {
      "journeySlug": "a-distance-mais-proches",
      "dayIndex": 7,
      "title": "Nos rêves",
      "prompt": "Vos aspirations, grandes et petites.",
      "experienceSlug": "nos-reves"
    }
  ]
};
