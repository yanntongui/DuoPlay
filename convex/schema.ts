import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * DuoPlay — modèle de données (cf. docs/PRD.md §10)
 *
 * Tables d'authentification (@convex-dev/auth) incluses pour éviter une
 * migration ultérieure lorsque Convex Auth sera activé.
 */

export const sessionMode = v.union(
  v.literal("ensemble"),
  v.literal("a-distance"),
  v.literal("differe"),
  v.literal("defi-individuel"),
);

export const experienceType = v.union(
  v.literal("questions"),
  v.literal("cartes"),
  v.literal("des"),
  v.literal("parcours"),
);

export const cardCategory = v.union(
  v.literal("connexion"),
  v.literal("sensations"),
  v.literal("defis"),
  v.literal("fantasmes"),
);

export const cardResponseKind = v.union(
  v.literal("jaime"),
  v.literal("a_discuter"),
  v.literal("pas_maintenant"),
  v.literal("passer"),
);

export const questionKind = v.union(
  v.literal("choice"),
  v.literal("open"),
  v.literal("challenge"),
);

export const depth = v.union(
  v.literal("leger"),
  v.literal("moyen"),
  v.literal("profond"),
);

export const publishStatus = v.union(
  v.literal("draft"),
  v.literal("published"),
  v.literal("archived"),
);

export const sessionStatus = v.union(
  v.literal("lobby"),
  v.literal("en_cours"),
  v.literal("en_attente"),
  v.literal("revelee"),
  v.literal("terminee"),
  v.literal("expiree"),
  v.literal("abandonnee"),
);

export default defineSchema({
  /* ---------------------------------------------------------------- */
  /* Comptes & couples                                                 */
  /* ---------------------------------------------------------------- */

  users: defineTable({
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  profiles: defineTable({
    userId: v.id("users"),
    displayName: v.string(),
    role: v.union(v.literal("member"), v.literal("admin")),
    plan: v.union(v.literal("free"), v.literal("premium")),
    status: v.union(v.literal("active"), v.literal("suspended"), v.literal("deleted")),
    mood: v.optional(v.union(v.literal("joyeux"), v.literal("curieux"), v.literal("calme"), v.literal("fatigué"), v.literal("romantique"))),
    moodUpdatedAt: v.optional(v.number()),
    analyticsConsent: v.optional(v.boolean()),
    notificationsConsent: v.optional(v.boolean()),
    lastActiveAt: v.number(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  adminAccess: defineTable({
    userId: v.id("users"),
    role: v.union(
      v.literal("super_admin"),
      v.literal("admin_produit"),
      v.literal("admin_support"),
      v.literal("admin_finance"),
      v.literal("admin_moderateur"),
      v.literal("admin_analyste"),
    ),
    permissions: v.array(v.string()),
    canViewSensitive: v.boolean(),
    twoFactorEnabled: v.boolean(),
    lastLoginAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_role", ["role"]),

  /* ---------------------------------------------------------------- */
  /* Soirée DuoPlay (multi-couples)                                     */
  /* ---------------------------------------------------------------- */

  soireeGames: defineTable({
    hostDeviceToken: v.string(),
    hostName: v.string(),
    roomCode: v.string(),
    status: v.union(
      v.literal("waiting"),
      v.literal("in_progress"),
      v.literal("finished"),
    ),
    rankingEnabled: v.boolean(),
    createdAt: v.number(),
  }).index("by_room_code", ["roomCode"]),

  soireeTeams: defineTable({
    gameId: v.id("soireeGames"),
    deviceToken: v.string(),
    coupleId: v.optional(v.id("couples")),
    teamName: v.string(),
    score: v.number(),
    joinedAt: v.number(),
  }).index("by_game", ["gameId"]),

  soireeQuestions: defineTable({
    gameId: v.id("soireeGames"),
    questionId: v.id("questions"),
    order: v.number(),
    points: v.number(),
  }).index("by_game", ["gameId"]),

  soireeTeamAnswers: defineTable({
    teamId: v.id("soireeTeams"),
    questionId: v.id("questions"),
    answer: v.string(),
    submittedAt: v.optional(v.number()),
    correct: v.optional(v.boolean()),
  }).index("by_team", ["teamId"]).index("by_question", ["questionId"]),

  /* ---------------------------------------------------------------- */
  /* Mode à distance - Questions                                       */
  /* ---------------------------------------------------------------- */

  remoteRooms: defineTable({
    hostDeviceToken: v.string(),
    hostName: v.string(),
    guestToken: v.optional(v.string()),
    guestName: v.optional(v.string()),
    roomCode: v.string(),
    status: v.union(
      v.literal("waiting"),
      v.literal("ready"),
      v.literal("in_progress"),
      v.literal("completed"),
    ),
    experienceId: v.optional(v.id("experiences")),
    questions: v.array(v.id("questions")),
    currentQuestion: v.number(),
    hostAnswered: v.boolean(),
    guestAnswered: v.boolean(),
    createdAt: v.number(),
  }).index("by_host", ["hostDeviceToken"]).index("by_code", ["roomCode"]),

  remoteAnswers: defineTable({
    roomId: v.id("remoteRooms"),
    playerToken: v.string(),
    questionId: v.id("questions"),
    answer: v.string(),
    submittedAt: v.number(),
  }).index("by_room", ["roomId"]).index("by_player", ["playerToken"]),

  /* ---------------------------------------------------------------- */
  /* Mode à distance - Cartes                                          */
  /* ---------------------------------------------------------------- */

  remoteCardGames: defineTable({
    hostDeviceToken: v.string(),
    hostName: v.string(),
    guestToken: v.optional(v.string()),
    guestName: v.optional(v.string()),
    roomCode: v.string(),
    status: v.union(
      v.literal("waiting"),
      v.literal("ready"),
      v.literal("in_progress"),
      v.literal("completed"),
    ),
    experienceId: v.id("experiences"),
    questions: v.array(v.id("questions")),
    currentCard: v.number(),
    hostResponded: v.boolean(),
    guestResponded: v.boolean(),
    createdAt: v.number(),
  }).index("by_host", ["hostDeviceToken"]).index("by_code", ["roomCode"]),

  remoteCardResponses: defineTable({
    roomId: v.id("remoteCardGames"),
    playerToken: v.string(),
    questionId: v.id("questions"),
    response: v.union(
      v.literal("jaime"),
      v.literal("a_discuter"),
      v.literal("pas_maintenant"),
      v.literal("passer")
    ),
    submittedAt: v.number(),
  }).index("by_room", ["roomId"]).index("by_player", ["playerToken"]),

  /* ---------------------------------------------------------------- */
  /* Mode à distance - Dés                                             */
  /* ---------------------------------------------------------------- */

  remoteDiceGames: defineTable({
    hostDeviceToken: v.string(),
    hostName: v.string(),
    guestToken: v.optional(v.string()),
    guestName: v.optional(v.string()),
    roomCode: v.string(),
    status: v.union(
      v.literal("waiting"),
      v.literal("ready"),
      v.literal("in_progress"),
      v.literal("completed"),
    ),
    ambiance: v.optional(v.string()),
    durationMinutes: v.number(),
    category: v.optional(v.string()),
    hostRolled: v.boolean(),
    guestRolled: v.boolean(),
    createdAt: v.number(),
  }).index("by_host", ["hostDeviceToken"]).index("by_code", ["roomCode"]),

  remoteDiceResults: defineTable({
    roomId: v.id("remoteDiceGames"),
    playerToken: v.string(),
    category: v.string(),
    result: v.number(),
    rolledAt: v.number(),
  }).index("by_room", ["roomId"]).index("by_player", ["playerToken"]),

  couples: defineTable({
    deviceA: v.string(),
    deviceB: v.optional(v.string()),
    nameA: v.optional(v.string()),
    nameB: v.optional(v.string()),
    photoA: v.optional(v.string()),
    photoB: v.optional(v.string()),
    userIdA: v.optional(v.id("users")),
    userIdB: v.optional(v.id("users")),
    status: v.union(
      v.literal("temporaire"),
      v.literal("actif"),
      v.literal("dissous"),
    ),
    label: v.optional(v.string()),
    relationshipDays: v.optional(v.number()),
    streakCurrent: v.optional(v.number()),
    streakBest: v.optional(v.number()),
    sharedMood: v.optional(v.union(v.literal("joyeux"), v.literal("curieux"), v.literal("calme"), v.literal("fatigué"), v.literal("romantique"))),
    milestones: v.optional(v.array(v.object({
      name: v.string(),
      reachedAt: v.number(),
      icon: v.string(),
    }))),
    createdAt: v.number(),
    lastActivityAt: v.number(),
    dissolvedAt: v.optional(v.number()),
  })
    .index("by_deviceA", ["deviceA"])
    .index("by_deviceB", ["deviceB"]),

  /* ---------------------------------------------------------------- */
  /* Couple & espace personnel                                         */
  /* ---------------------------------------------------------------- */

  coupleCustomItems: defineTable({
    coupleId: v.optional(v.id("couples")),
    userId: v.optional(v.id("users")),
    deviceToken: v.optional(v.string()),
    kind: v.union(
      v.literal("desire"),
      v.literal("memory"),
      v.literal("favorite"),
      v.literal("upcoming"),
      v.literal("date"),
      v.literal("custom_experience"),
    ),
    title: v.string(),
    description: v.optional(v.string()),
    data: v.optional(v.any()),
    visibility: v.union(
      v.literal("private"),
      v.literal("shared"),
      v.literal("common"),
      v.literal("to_discuss"),
      v.literal("deleted"),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_couple", ["coupleId"])
    .index("by_user", ["userId"])
    .index("by_kind", ["kind"]),

  customExperienceDrafts: defineTable({
    coupleId: v.optional(v.id("couples")),
    userId: v.optional(v.id("users")),
    title: v.string(),
    theme: v.string(),
    mood: v.optional(v.string()),
    durationMinutes: v.number(),
    depth: v.optional(v.union(v.literal("leger"), v.literal("moyen"), v.literal("profond"))),
    questionIds: v.optional(v.array(v.id("questions"))),
    customQuestions: v.optional(v.array(v.any())),
    excludedCategories: v.optional(v.array(v.string())),
    savedTo: v.optional(v.union(v.literal("favorites"), v.literal("space"), v.literal("none"))),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_couple", ["coupleId"])
    .index("by_user", ["userId"]),

  /* ---------------------------------------------------------------- */
  /* Contenu éditorial                                                 */
  /* ---------------------------------------------------------------- */

  categories: defineTable({
    slug: v.string(),
    title: v.string(),
    tagline: v.string(),
    description: v.string(),
    emoji: v.string(),
    accent: v.union(
      v.literal("coral"),
      v.literal("lavender"),
      v.literal("graphite"),
    ),
    order: v.number(),
    mvp: v.boolean(),
    status: publishStatus,
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"]),

  experiences: defineTable({
    categoryId: v.id("categories"),
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    depth,
    themes: v.array(v.string()),
    estimatedMinutes: v.number(),
    modes: v.array(sessionMode),
    type: experienceType,
    status: publishStatus,
    order: v.number(),
  })
    .index("by_category", ["categoryId"])
    .index("by_slug", ["slug"])
    .index("by_status", ["status"]),

  questions: defineTable({
    experienceId: v.id("experiences"),
    kind: questionKind,
    prompt: v.string(),
    options: v.optional(v.array(v.string())),
    depth,
    themes: v.array(v.string()),
    order: v.number(),
    status: publishStatus,
    skipCount: v.optional(v.number()),
    answerCount: v.optional(v.number()),
  })
    .index("by_experience", ["experienceId"])
    .index("by_status", ["status"]),

  /* ---------------------------------------------------------------- */
  /* Formats de jeu : cartes, dés                                      */
  /* ---------------------------------------------------------------- */

  cards: defineTable({
    experienceId: v.id("experiences"),
    category: cardCategory,
    prompt: v.string(),
    depth,
    tags: v.array(v.string()),
    isOptional: v.boolean(),
    order: v.number(),
    status: publishStatus,
  })
    .index("by_experience", ["experienceId"])
    .index("by_status", ["status"]),

  cardResponses: defineTable({
    cardId: v.id("cards"),
    sessionId: v.optional(v.id("sessions")),
    playerId: v.optional(v.id("sessionPlayers")),
    kind: cardResponseKind,
    note: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_card", ["cardId"])
    .index("by_session", ["sessionId"]),

  /* ---------------------------------------------------------------- */
  /* Dés & génération de contenu                                      */
  /* ---------------------------------------------------------------- */

  diceResults: defineTable({
    sessionId: v.optional(v.id("sessions")),
    coupleId: v.optional(v.id("couples")),
    deviceId: v.optional(v.string()),
    category: v.string(), // connexion, sensations, defis, fantasmes
    ambiance: v.string(), // tendre, romantique, ...
    durationMinutes: v.number(),
    customText: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_couple", ["coupleId"])
    .index("by_device", ["deviceId"]),

  /* ---------------------------------------------------------------- */
  /* Sessions de jeu                                                   */
  /* ---------------------------------------------------------------- */

  sessions: defineTable({
    coupleId: v.optional(v.id("couples")),
    experienceId: v.id("experiences"),
    categoryId: v.id("categories"),
    createdBy: v.optional(v.id("users")),
    mode: sessionMode,
    status: sessionStatus,
    durationMinutes: v.number(),
    questionIds: v.array(v.id("questions")),
    token: v.string(),
    tokenExpiresAt: v.number(),
    lastActivityAt: v.number(),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
    journeyId: v.optional(v.id("journeys")),
    journeyDayIndex: v.optional(v.number()),
    maxDepth: v.optional(depth),
    avoidThemes: v.optional(v.array(v.string())),
  })
    .index("by_token", ["token"])
    .index("by_couple", ["coupleId"])
    .index("by_status", ["status"]),

  sessionPlayers: defineTable({
    sessionId: v.id("sessions"),
    role: v.union(v.literal("A"), v.literal("B")),
    name: v.string(),
    playerToken: v.string(),
    deviceToken: v.optional(v.string()),
    joinedAt: v.number(),
    finishedAt: v.optional(v.number()),
  })
    .index("by_session", ["sessionId"])
    .index("by_token", ["playerToken"])
    .index("by_device", ["deviceToken"]),

  answers: defineTable({
    sessionId: v.id("sessions"),
    playerId: v.id("sessionPlayers"),
    questionId: v.id("questions"),
    value: v.string(),
    skipped: v.boolean(),
    revealed: v.boolean(),
    /** DuoReveal : le joueur a appuyé sur « Découvrir ensemble ». */
    revealReady: v.optional(v.boolean()),
    answeredAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_session_question", ["sessionId", "questionId"])
    .index("by_player", ["playerId"]),

  /* DuoReveal : décision du couple après la révélation. Jamais publique. */
  revealOutcomes: defineTable({
    sessionId: v.id("sessions"),
    questionId: v.id("questions"),
    kind: v.union(
      v.literal("meme_reponse"),
      v.literal("a_discuter"),
      v.literal("envie"),
      v.literal("prive"),
      v.literal("supprime"),
    ),
    createdBy: v.optional(v.id("sessionPlayers")),
    createdAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_session_question", ["sessionId", "questionId"]),

  /* ---------------------------------------------------------------- */
  /* Défi du jour                                                      */
  /* ---------------------------------------------------------------- */

  dailyChallenges: defineTable({
    date: v.string(),
    kind: v.union(v.literal("question"), v.literal("mission")),
    title: v.string(),
    prompt: v.string(),
    options: v.optional(v.array(v.string())),
    questionId: v.optional(v.id("questions")),
    categorySlug: v.optional(v.string()),
    publishedAt: v.number(),
  }).index("by_date", ["date"]),

  challengeCompletions: defineTable({
    challengeId: v.id("dailyChallenges"),
    deviceToken: v.string(),
    coupleId: v.optional(v.id("couples")),
    userId: v.optional(v.id("users")),
    value: v.optional(v.string()),
    skipped: v.boolean(),
    doneAt: v.number(),
  })
    .index("by_challenge", ["challengeId"])
    .index("by_challenge_device", ["challengeId", "deviceToken"])
    .index("by_device", ["deviceToken"]),

  /* ---------------------------------------------------------------- */
  /* Roue du hasard                                                    */
  /* ---------------------------------------------------------------- */

  forfeits: defineTable({
    text: v.string(),
    intensity: depth,
    theme: v.optional(v.string()),
    order: v.number(),
    status: publishStatus,
  }).index("by_status", ["status"]),

  /* ---------------------------------------------------------------- */
  /* Parcours guidés                                                   */
  /* ---------------------------------------------------------------- */

  journeys: defineTable({
    slug: v.string(),
    title: v.string(),
    tagline: v.string(),
    description: v.string(),
    emoji: v.string(),
    lengthDays: v.number(),
    order: v.number(),
    status: publishStatus,
    /** Métadonnées éditoriales DuoPath. */
    ambiance: v.optional(v.string()),
    durationMinutes: v.optional(v.number()),
    depth: v.optional(depth),
    context: v.optional(v.string()),
    conclusion: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"]),

  journeySteps: defineTable({
    journeyId: v.id("journeys"),
    dayIndex: v.number(),
    title: v.string(),
    prompt: v.optional(v.string()),
    experienceId: v.optional(v.id("experiences")),
    mission: v.optional(v.string()),
    /** Nature de l'étape, pour le chemin visuel DuoPath. */
    kind: v.optional(
      v.union(
        v.literal("depart"),
        v.literal("connexion"),
        v.literal("question"),
        v.literal("carte"),
        v.literal("defi"),
        v.literal("souvenir"),
        v.literal("surprise"),
        v.literal("pause"),
        v.literal("arrivee"),
      ),
    ),
    durationMinutes: v.optional(v.number()),
  })
    .index("by_journey", ["journeyId"])
    .index("by_journey_day", ["journeyId", "dayIndex"]),

  journeyProgress: defineTable({
    journeyId: v.id("journeys"),
    deviceToken: v.string(),
    coupleId: v.optional(v.id("couples")),
    userId: v.optional(v.id("users")),
    completedDays: v.array(v.number()),
    startedAt: v.number(),
    lastActivityAt: v.number(),
    completedAt: v.optional(v.number()),
    recapSeenAt: v.optional(v.number()),
  })
    .index("by_device", ["deviceToken"])
    .index("by_device_journey", ["deviceToken", "journeyId"])
    .index("by_journey", ["journeyId"]),

  /* ---------------------------------------------------------------- */
  /* Compléments                                                       */
  /* ---------------------------------------------------------------- */

  favorites: defineTable({
    deviceToken: v.string(),
    experienceId: v.id("experiences"),
    collectionId: v.optional(v.id("collections")),
    position: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_device", ["deviceToken"])
    .index("by_device_experience", ["deviceToken", "experienceId"]),

  collections: defineTable({
    deviceToken: v.string(),
    name: v.string(),
    emoji: v.string(),
    position: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
    removedAt: v.optional(v.number()),
  })
    .index("by_device", ["deviceToken"])
    .index("by_device_position", ["deviceToken", "position"]),

  journalEntries: defineTable({
    deviceToken: v.string(),
    authorName: v.optional(v.string()),
    kind: v.union(v.literal("moment"), v.literal("note")),
    source: v.union(
      v.literal("partie"),
      v.literal("parcours"),
      v.literal("favori"),
      v.literal("libre"),
    ),
    title: v.string(),
    note: v.optional(v.string()),
    sessionId: v.optional(v.id("sessions")),
    journeyId: v.optional(v.id("journeys")),
    experienceId: v.optional(v.id("experiences")),
    mediaId: v.optional(v.id("_storage")),
    mediaType: v.optional(v.string()),
    occurredAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
    removedAt: v.optional(v.number()),
  })
    .index("by_device", ["deviceToken"])
    .index("by_device_occurredAt", ["deviceToken", "occurredAt"])
    .index("by_session", ["sessionId"])
    .index("by_journey", ["journeyId"]),

  events: defineTable({
    deviceToken: v.string(),
    authorName: v.optional(v.string()),
    title: v.string(),
    kind: v.union(
      v.literal("rendez-vous"),
      v.literal("anniversaire"),
      v.literal("activite"),
      v.literal("surprise"),
    ),
    note: v.optional(v.string()),
    experienceId: v.optional(v.id("experiences")),
    startAt: v.number(),
    allDay: v.optional(v.boolean()),
    status: v.union(
      v.literal("prevu"),
      v.literal("fait"),
      v.literal("annule"),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
    removedAt: v.optional(v.number()),
  })
    .index("by_device", ["deviceToken"])
    .index("by_device_startAt", ["deviceToken", "startAt"]),

  reports: defineTable({
    targetType: v.union(v.literal("experience"), v.literal("question")),
    targetId: v.string(),
    reason: v.string(),
    status: v.union(
      v.literal("nouveau"),
      v.literal("traite"),
      v.literal("rejete"),
    ),
    createdAt: v.number(),
  }).index("by_status", ["status"]),

  /* ---------------------------------------------------------------- */
  /* Personnalisation (cf. PRD §3.F)                                   */
  /* ---------------------------------------------------------------- */

  preferences: defineTable({
    deviceToken: v.string(),
    mood: v.optional(v.string()),
    maxDepth: v.optional(depth),
    avoidThemes: v.array(v.string()),
    durationMinutes: v.optional(v.number()),
    mode: v.optional(sessionMode),
    updatedAt: v.number(),
  }).index("by_device", ["deviceToken"]),

  /* ---------------------------------------------------------------- */
  /* Limites de couple (filtres pour cartes et dés)                   */
  /* ---------------------------------------------------------------- */

  coupleLimits: defineTable({
    coupleId: v.id("couples"),
    withoutPhoto: v.boolean(),
    withoutVideo: v.boolean(),
    withoutPublic: v.boolean(),
    withoutContact: v.boolean(),
    maxDepth: depth,
    updatedAt: v.number(),
  }).index("by_couple", ["coupleId"]),

  /* ---------------------------------------------------------------- */
  /* Compte léger (cf. PRD §12, §14.1 — Phase 6)                       */
  /* ---------------------------------------------------------------- */

  accounts: defineTable({
    displayName: v.string(),
    contact: v.optional(v.string()),
    contactKind: v.union(
      v.literal("email"),
      v.literal("phone"),
      v.literal("none"),
    ),
    recoveryCode: v.string(),
    verificationCode: v.optional(v.string()),
    verificationCodeSentAt: v.optional(v.number()),
    primaryDeviceToken: v.string(),
    plan: v.union(v.literal("free"), v.literal("premium")),
    analyticsConsent: v.boolean(),
    notificationsConsent: v.boolean(),
    consentsAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastSeenAt: v.number(),
  })
    .index("by_contact", ["contact"])
    .index("by_device", ["primaryDeviceToken"])
    .index("by_recovery", ["recoveryCode"]),

  accountDevices: defineTable({
    accountId: v.id("accounts"),
    deviceToken: v.string(),
    linkedAt: v.number(),
  })
    .index("by_device", ["deviceToken"])
    .index("by_account", ["accountId"]),

  presence: defineTable({
    deviceToken: v.string(),
    lastSeenAt: v.number(),
  }).index("by_device", ["deviceToken"]),

  /* ---------------------------------------------------------------- */
  /* Consentements & sécurité (cf. PRD §15 — Phase 7)                  */
  /* ---------------------------------------------------------------- */

  consents: defineTable({
    deviceToken: v.string(),
    analytics: v.boolean(),
    notifications: v.boolean(),
    version: v.number(),
    decidedAt: v.number(),
  }).index("by_device", ["deviceToken"]),

  rateLimits: defineTable({
    key: v.string(),
    windowStart: v.number(),
    count: v.number(),
  }).index("by_key", ["key"]),

  /* ---------------------------------------------------------------- */
  /* Notifications & cycle de vie des sessions (cf. PRD §13, §14)      */
  /* ---------------------------------------------------------------- */

  notifications: defineTable({
    deviceToken: v.string(),
    kind: v.union(
      v.literal("differe_relance"),
      v.literal("differe_expiree"),
    ),
    title: v.string(),
    body: v.string(),
    sessionId: v.optional(v.id("sessions")),
    level: v.optional(v.number()),
    readAt: v.optional(v.number()),
    dismissedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_device", ["deviceToken"])
    .index("by_session", ["sessionId"]),

  /* ---------------------------------------------------------------- */
  /* Mesure (cf. PRD §19)                                              */
  /* ---------------------------------------------------------------- */

  analyticsEvents: defineTable({
    name: v.string(),
    userId: v.optional(v.id("users")),
    coupleId: v.optional(v.id("couples")),
    sessionId: v.optional(v.id("sessions")),
    props: v.optional(v.any()),
    at: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_session", ["sessionId"]),

  /* ---------------------------------------------------------------- */
  /* Audit Logs pour la console d'administration                      */
  /* ---------------------------------------------------------------- */

  /* ---------------------------------------------------------------- */
  /* Admin Console - Segments & Incidents                               */
  /* ---------------------------------------------------------------- */

  segments: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    type: v.string(), // Cycle de vie, Engagement, Rétention, Revenus, etc.
    size: v.number(),
    growthRate: v.optional(v.number()),
    status: v.union(
      v.literal("published"),
      v.literal("draft"),
      v.literal("review"),
    ),
    updatedAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_type", ["type"]),

  incidents: defineTable({
    title: v.string(),
    severity: v.union(
      v.literal("critical"),
      v.literal("major"),
      v.literal("minor"),
    ),
    status: v.union(
      v.literal("in_progress"),
      v.literal("resolved"),
    ),
    service: v.string(),
    startedAt: v.number(),
    resolvedAt: v.optional(v.number()),
    durationMinutes: v.number(),
    owner: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_severity", ["severity"])
    .index("by_startedAt", ["startedAt"]),

  /* ---------------------------------------------------------------- */
  /* DuoPlay AI (cf. docs/AI-DUOPLAY.md)                              */
  /*                                                                  */
  /* Règle de base : aucune réponse intime, note privée, conversation  */
  /* privée, média sensible ou donnée de santé n'entre ici. Seules    */
  /* les métadonnées nécessaires à l'orchestration sont conservées.    */
  /* ---------------------------------------------------------------- */

  aiConsents: defineTable({
    deviceToken: v.string(),
    feature: v.string(), // "global" | "generation" | "communication" | "recommendations" | "search"
    granted: v.boolean(),
    version: v.string(),
    grantedAt: v.optional(v.number()),
    revokedAt: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_device", ["deviceToken"])
    .index("by_device_feature", ["deviceToken", "feature"]),

  aiSessions: defineTable({
    deviceToken: v.string(),
    title: v.string(),
    subtitle: v.string(),
    mood: v.string(),
    level: v.string(),
    mode: v.string(),
    durationMinutes: v.number(),
    exclusions: v.array(v.string()),
    source: v.string(), // "generated" | "search" | "recommendation"
    status: v.string(), // "draft" | "active" | "paused" | "completed" | "ended" | "deleted"
    steps: v.array(
      v.object({
        title: v.string(),
        body: v.string(),
        minutes: v.number(),
        kind: v.string(),
        intensity: v.string(),
      }),
    ),
    finalQuestion: v.string(),
    alternatives: v.array(
      v.object({
        label: v.string(),
        description: v.string(),
      }),
    ),
    rationale: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    expiresAt: v.number(),
    startedAt: v.optional(v.number()),
    pausedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    deletedAt: v.optional(v.number()),
    deletionHistory: v.optional(v.array(v.number())),
  })
    .index("by_device", ["deviceToken"])
    .index("by_device_created", ["deviceToken", "createdAt"])
    .index("by_expires", ["expiresAt"]),

  aiEvents: defineTable({
    deviceToken: v.string(),
    sessionId: v.optional(v.id("aiSessions")),
    kind: v.string(), // "generation" | "step" | "session" | "communication" | "search" | "consent" | "deletion"
    action: v.string(), // accept | modify | skip | replace | pause | resume | finish | generate | delete | revoke
    stepIndex: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_device", ["deviceToken"])
    .index("by_session", ["sessionId"])
    .index("by_created", ["createdAt"]),

  aiRecommendationDismissals: defineTable({
    deviceToken: v.string(),
    kind: v.string(), // "mood" | "theme" | "experience" | "duration" | "mode"
    value: v.string(),
    createdAt: v.number(),
  }).index("by_device", ["deviceToken"]),

  aiUsageDaily: defineTable({
    deviceToken: v.string(),
    day: v.string(), // YYYY-MM-DD (UTC)
    generations: v.number(),
    accepted: v.number(),
    skipped: v.number(),
    paused: v.number(),
    completed: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_device", ["deviceToken"])
    .index("by_device_day", ["deviceToken", "day"]),

  aiSafetyEvents: defineTable({
    deviceToken: v.optional(v.string()),
    category: v.string(),
    severity: v.string(), // "critique" | "eleve" | "moyen" | "faible"
    action: v.string(), // "refus" | "reformulation" | "escalade"
    excerptHash: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_created", ["createdAt"])
    .index("by_category", ["category"]),

  aiFeatureFlags: defineTable({
    key: v.string(),
    enabled: v.boolean(),
    note: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),
});
