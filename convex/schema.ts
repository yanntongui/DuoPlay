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
    answeredAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_session_question", ["sessionId", "questionId"])
    .index("by_player", ["playerId"]),

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

  auditLogs: defineTable({
    action: v.string(),
    target: v.optional(v.any()),
    adminId: v.optional(v.string()),
    reason: v.optional(v.string()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("by_action", ["action"])
    .index("by_admin", ["adminId"])
    .index("by_createdAt", ["createdAt"]),
});
