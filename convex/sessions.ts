import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { linkCouplePair } from "./couples";
import { completeJourneyDay } from "./journeys";
import { recordSessionMoment } from "./journal";
import { assertAdmin } from "./lib/admin";
import { logEvent as logEventShared } from "./lib/events";
import { optionalDeviceToken } from "./lib/identity";
import { dismissSessionNotifications, ensureNotification } from "./lib/notify";
import { clearRateLimit, enforceRateLimit } from "./lib/ratelimit";
import {
  matchesPreferences,
  selectQuestions,
} from "./lib/personalization";
import { savePreferences } from "./preferences";

/**
 * Boucle de jeu (cf. docs/PRD.md §6 et §11)
 *
 * Un joueur crée une partie : on tire un `token` (lien privé) et on fige la
 * liste des questions dans la session, ce qui garantit que les deux
 * partenaires voient exactement le même parcours, même en mode différé.
 *
 * Chaque joueur reçoit un `playerToken` (secret, conservé dans le navigateur)
 * qui sert de preuve d'identité — aucune inscription requise.
 */

const sessionMode = v.union(
  v.literal("ensemble"),
  v.literal("a-distance"),
  v.literal("differe"),
  v.literal("defi-individuel"),
);

const depth = v.union(
  v.literal("leger"),
  v.literal("moyen"),
  v.literal("profond"),
);

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const RELANCE_TTL_MS = 3 * 24 * 60 * 60 * 1000;
const MAX_PLAYERS = 2;

/** Cadences anti-abus (cf. PRD §15.4). */
const CREATE_LIMIT = 20;
const CREATE_WINDOW_MS = 60 * 60 * 1000;
const JOIN_LIMIT = 30;
const JOIN_WINDOW_MS = 10 * 60 * 1000;
const JOIN_FAIL_LIMIT = 10;

/** Seuils du cycle de vie différé (cf. PRD §13.2). */
const RELANCE_1_MS = 1 * 24 * 60 * 60 * 1000;
const RELANCE_2_MS = 3 * 24 * 60 * 60 * 1000;

/** Nettoie une liste de thèmes écartés (dédoublonnée, sans vide). */
function normalizeThemes(themes?: string[]): string[] {
  if (!themes || themes.length === 0) return [];
  return [...new Set(themes.map((theme) => theme.trim()).filter(Boolean))];
}

/* ------------------------------------------------------------------ */
/* Utilitaires                                                         */
/* ------------------------------------------------------------------ */

function randomToken(bytes: number): string {
  const buffer = new Uint8Array(bytes);
  crypto.getRandomValues(buffer);
  let out = "";
  for (const byte of buffer) out += byte.toString(16).padStart(2, "0");
  return out;
}

function cleanName(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").slice(0, 24);
}

async function findSession(ctx: QueryCtx | MutationCtx, token: string) {
  return await ctx.db
    .query("sessions")
    .withIndex("by_token", (q) => q.eq("token", token))
    .unique();
}

async function findPlayers(
  ctx: QueryCtx | MutationCtx,
  sessionId: Id<"sessions">,
) {
  return await ctx.db
    .query("sessionPlayers")
    .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
    .collect();
}

async function logEvent(
  ctx: MutationCtx,
  name: string,
  at: number,
  sessionId?: Id<"sessions">,
  props?: Record<string, unknown>,
) {
  await logEventShared(ctx, name, at, { sessionId, props });
}

/* ------------------------------------------------------------------ */
/* Créer / rejoindre                                                   */
/* ------------------------------------------------------------------ */

export const create = mutation({
  args: {
    experienceId: v.id("experiences"),
    mode: sessionMode,
    durationMinutes: v.number(),
    creatorName: v.string(),
    deviceToken: v.optional(v.string()),
    /** Partie lancée depuis une étape de parcours (cf. §3.E). */
    journeySlug: v.optional(v.string()),
    journeyDayIndex: v.optional(v.number()),
    /** Personnalisation : ambiance, profondeur maximale, thèmes à éviter (§3.F). */
    mood: v.optional(v.string()),
    maxDepth: v.optional(depth),
    avoidThemes: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const experience = await ctx.db.get(args.experienceId);
    if (!experience || experience.status !== "published") {
      throw new Error("Cette expérience n'est pas disponible.");
    }
    if (!experience.modes.includes(args.mode)) {
      throw new Error("Ce mode n'est pas disponible pour cette expérience.");
    }

    const name = cleanName(args.creatorName);
    if (name.length < 2) throw new Error("Merci d'indiquer un prénom.");

    // Anti-spam d'invitations (cf. PRD §15.4) : on compte par appareil.
    await enforceRateLimit(
      ctx,
      `session_create:${optionalDeviceToken(args.deviceToken) ?? "anon"}`,
      CREATE_LIMIT,
      CREATE_WINDOW_MS,
    );

    const all = await ctx.db
      .query("questions")
      .withIndex("by_experience", (q) =>
        q.eq("experienceId", args.experienceId),
      )
      .collect();
    const published = all
      .filter((question) => question.status === "published")
      .sort((a, b) => a.order - b.order);

    if (published.length === 0) {
      throw new Error("Cette expérience n'a pas encore de questions.");
    }

    const durationMinutes = Math.min(
      Math.max(Math.round(args.durationMinutes), 5),
      60,
    );

    // Personnalisation : les préférences filtrent le pool, elles ne le
    // complètent jamais (cf. §3.F — la plateforme n'impose aucune activité).
    const personalization = {
      maxDepth: args.maxDepth,
      avoidThemes: normalizeThemes(args.avoidThemes),
    };
    const eligible = published.filter((question) =>
      matchesPreferences(question, personalization),
    );

    if (eligible.length === 0) {
      throw new Error(
        "Aucune question ne correspond à ces préférences : retirez un thème écarté ou élargissez la profondeur.",
      );
    }

    const questionIds = selectQuestions(eligible, {
      ...personalization,
      durationMinutes,
    }).map((question) => question._id);

    const now = Date.now();

    // Étape de parcours : on ne rattache que si l'étape pointe bien vers
    // cette expérience (garde-fou éditorial, cf. §3.E).
    let journeyId: Id<"journeys"> | undefined;
    let journeyDayIndex: number | undefined;
    if (args.journeySlug && args.journeyDayIndex !== undefined) {
      const journey = await ctx.db
        .query("journeys")
        .withIndex("by_slug", (q) => q.eq("slug", args.journeySlug!))
        .unique();
      if (journey && journey.status === "published") {
        const dayIndex = Math.round(args.journeyDayIndex);
        const step = (
          await ctx.db
            .query("journeySteps")
            .withIndex("by_journey", (q) => q.eq("journeyId", journey._id))
            .collect()
        ).find((row) => row.dayIndex === dayIndex);
        if (step && step.experienceId === args.experienceId) {
          journeyId = journey._id;
          journeyDayIndex = dayIndex;
        }
      }
    }

    const sessionId = await ctx.db.insert("sessions", {
      experienceId: args.experienceId,
      categoryId: experience.categoryId,
      mode: args.mode,
      status: args.mode === "defi-individuel" ? "en_cours" : "lobby",
      durationMinutes,
      questionIds,
      token: randomToken(16),
      tokenExpiresAt: now + SESSION_TTL_MS,
      lastActivityAt: now,
      createdAt: now,
      journeyId,
      journeyDayIndex,
      maxDepth: personalization.maxDepth,
      avoidThemes:
        personalization.avoidThemes.length > 0
          ? personalization.avoidThemes
          : undefined,
    });

    const deviceToken = optionalDeviceToken(args.deviceToken);
    const playerToken = randomToken(24);
    await ctx.db.insert("sessionPlayers", {
      sessionId,
      role: "A",
      name,
      playerToken,
      deviceToken,
      joinedAt: now,
    });

    // On retient les préférences de cet appareil : la prochaine fois, le
    // formulaire est déjà ajusté (cf. §3.F).
    if (deviceToken) {
      await savePreferences(ctx, deviceToken, {
        mood: args.mood,
        maxDepth: personalization.maxDepth,
        avoidThemes: personalization.avoidThemes,
        durationMinutes,
        mode: args.mode,
      });
    }

    await logEvent(ctx, "session_created", now, sessionId, {
      mode: args.mode,
      experienceSlug: experience.slug,
      questionCount: questionIds.length,
    });

    const session = await ctx.db.get(sessionId);
    return { token: session!.token, playerToken };
  },
});

export const join = mutation({
  args: {
    token: v.string(),
    name: v.string(),
    deviceToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const device = optionalDeviceToken(args.deviceToken) ?? "anon";
    const session = await findSession(ctx, args.token);
    if (!session) {
      // Anti-brute-force de tokens (cf. PRD §15.4) : seules les tentatives
      // ratées consomment le compteur — un usage légitime n'est jamais freiné.
      await enforceRateLimit(
        ctx,
        `session_join_fail:${device}`,
        JOIN_FAIL_LIMIT,
        JOIN_WINDOW_MS,
      );
      throw new Error("Cette partie est introuvable.");
    }
    await clearRateLimit(ctx, `session_join_fail:${device}`);
    await enforceRateLimit(
      ctx,
      `session_join:${device}`,
      JOIN_LIMIT,
      JOIN_WINDOW_MS,
    );

    if (Date.now() > session.tokenExpiresAt) {
      throw new Error("Ce lien d'invitation a expiré.");
    }
    if (session.status === "terminee") {
      throw new Error("Cette partie est déjà terminée.");
    }
    if (session.status === "abandonnee" || session.status === "expiree") {
      throw new Error("Cette partie n'est plus ouverte.");
    }

    const players = await findPlayers(ctx, session._id);
    if (players.length >= MAX_PLAYERS) {
      throw new Error("Cette partie est déjà complète.");
    }

    const name = cleanName(args.name);
    if (name.length < 2) throw new Error("Merci d'indiquer un prénom.");

    const now = Date.now();
    const role = players.some((player) => player.role === "A") ? "B" : "A";
    const playerToken = randomToken(24);
    const deviceToken = optionalDeviceToken(args.deviceToken);
    await ctx.db.insert("sessionPlayers", {
      sessionId: session._id,
      role,
      name,
      playerToken,
      deviceToken,
      joinedAt: now,
    });

    // Un couple naît de la première partie commune (PRD §12.1).
    const host = players[0];
    if (deviceToken && host?.deviceToken) {
      await linkCouplePair(ctx, {
        deviceA: host.deviceToken,
        nameA: host.name,
        deviceB: deviceToken,
        nameB: name,
      });
    }

    await ctx.db.patch(session._id, { status: "en_cours", lastActivityAt: now });
    await logEvent(ctx, "guest_joined", now, session._id, { role });

    return { playerToken, role };
  },
});

/* ------------------------------------------------------------------ */
/* État temps réel de la salle                                         */
/* ------------------------------------------------------------------ */

export const roomState = query({
  args: { token: v.string(), playerToken: v.string() },
  handler: async (ctx, args) => {
    const session = await findSession(ctx, args.token);
    if (!session) return { found: false as const };

    const [experience, category, players] = await Promise.all([
      ctx.db.get(session.experienceId),
      ctx.db.get(session.categoryId),
      findPlayers(ctx, session._id),
    ]);

    const expired = Date.now() > session.tokenExpiresAt;
    const base = {
      found: true as const,
      session: {
        token: session.token,
        mode: session.mode,
        status: session.status,
        durationMinutes: session.durationMinutes,
        createdAt: session.createdAt,
        completedAt: session.completedAt ?? null,
        expired,
        /** Cycle de vie (§13) : la partie est-elle clôturée, peut-on la relancer ? */
        closed: session.status === "abandonnee",
        canRelance:
          session.status !== "terminee" && session.status !== "abandonnee",
        canClose:
          session.status !== "terminee" && session.status !== "abandonnee",
        /** Personnalisation appliquée au tirage (cf. §3.F). Les thèmes écartés
         *  restent privés : on n'en expose que le nombre (cf. §15). */
        maxDepth: session.maxDepth ?? null,
        avoidedThemeCount: (session.avoidThemes ?? []).length,
      },
      experience: experience
        ? {
            title: experience.title,
            description: experience.description,
            estimatedMinutes: experience.estimatedMinutes,
          }
        : null,
      category: category
        ? {
            slug: category.slug,
            title: category.title,
            emoji: category.emoji,
            accent: category.accent,
          }
        : null,
      players: players.map((player) => ({
        id: player._id,
        role: player.role,
        name: player.name,
        finished: player.finishedAt ?? null,
      })),
    };

    const me = players.find((player) => player.playerToken === args.playerToken);
    if (!me) {
      return {
        ...base,
        needsJoin: true as const,
        canJoin:
          !expired &&
          session.status !== "terminee" &&
          players.length < MAX_PLAYERS,
      };
    }

    const partner =
      players.find((player) => player._id !== me._id) ?? (null as null);

    const questionDocs = (
      await Promise.all(session.questionIds.map((id) => ctx.db.get(id)))
    ).filter((question): question is Doc<"questions"> => question !== null);

    const answers = await ctx.db
      .query("answers")
      .withIndex("by_session", (q) => q.eq("sessionId", session._id))
      .collect();

    const outcomes = await ctx.db
      .query("revealOutcomes")
      .withIndex("by_session", (q) => q.eq("sessionId", session._id))
      .collect();

    const outcomeOf = (questionId: string) =>
      outcomes.find((outcome) => outcome.questionId === questionId)?.kind ?? null;

    const answerOf = (playerId: Id<"sessionPlayers">, questionId: string) =>
      answers.find(
        (answer) =>
          answer.playerId === playerId && answer.questionId === questionId,
      );

    const questions = questionDocs.map((question, index) => {
      const mine = answerOf(me._id, question._id);
      const theirs = partner ? answerOf(partner._id, question._id) : undefined;

      const myAnswered = Boolean(mine && !mine.skipped);
      const theirAnswered = Boolean(theirs && !theirs.skipped);
      const anySkipped = Boolean(
        (mine && mine.skipped) || (theirs && theirs.skipped),
      );
      const bothAnswered = myAnswered && theirAnswered;
      const isRevealed = Boolean(mine?.revealed && theirs?.revealed);

      let status:
        | "a_repondre"
        | "attente_partenaire"
        | "revelee"
        | "passee";

      if (!partner) {
        status = myAnswered ? "revelee" : "a_repondre";
      } else if (anySkipped) {
        status = "passee";
      } else if (bothAnswered && isRevealed) {
        status = "revelee";
      } else if (myAnswered) {
        status = "attente_partenaire";
      } else {
        status = "a_repondre";
      }

      const same =
        status === "revelee" && question.kind === "choice" && mine && theirs
          ? mine.value === theirs.value
          : null;

      return {
        index,
        id: question._id,
        kind: question.kind,
        prompt: question.prompt,
        options: question.options ?? null,
        depth: question.depth,
        myValue: mine && !mine.skipped ? mine.value : null,
        mySkipped: Boolean(mine && mine.skipped),
        partnerValue: status === "revelee" && theirs ? theirs.value : null,
        status,
        same,
        bothAnswered,
        myRevealReady: Boolean(mine?.revealReady),
        partnerRevealReady: Boolean(theirs?.revealReady),
        outcome: outcomeOf(question._id),
      };
    });

    const revealed = questions.filter((question) => question.status === "revelee");
    const comparable = revealed.filter((question) => question.same !== null);
    const similarity =
      comparable.length > 0
        ? comparable.filter((question) => question.same).length /
          comparable.length
        : null;

    return {
      ...base,
      needsJoin: false as const,
      me: {
        id: me._id,
        role: me.role,
        name: me.name,
        finished: me.finishedAt ?? null,
      },
      partner: partner
        ? {
            id: partner._id,
            role: partner.role,
            name: partner.name,
            finished: partner.finishedAt ?? null,
          }
        : null,
      questions,
      progress: {
        total: questions.length,
        mine: answers.filter((answer) => answer.playerId === me._id).length,
        partner: partner
          ? answers.filter((answer) => answer.playerId === partner._id).length
          : 0,
      },
      similarity,
      allResolved: questions.every(
        (question) => question.status === "revelee" || question.status === "passee",
      ),
    };
  },
});

/* ------------------------------------------------------------------ */
/* Jouer                                                               */
/* ------------------------------------------------------------------ */

async function requirePlayer(
  ctx: MutationCtx,
  token: string,
  playerToken: string,
  mode: "edit" | "manage" = "edit",
) {
  const session = await findSession(ctx, token);
  if (!session) throw new Error("Cette partie est introuvable.");
  if (session.status === "terminee") {
    throw new Error("Cette partie est terminée.");
  }

  // En mode « gestion » (relancer / clôturer), on autorise une partie expirée
  // ou déjà clôturée : c'est justement le sauvetage assisté du §13.2.
  if (mode === "edit") {
    if (Date.now() > session.tokenExpiresAt) {
      throw new Error("Cette partie a expiré.");
    }
    if (session.status === "abandonnee") {
      throw new Error("Cette partie a été clôturée.");
    }
  }

  const players = await findPlayers(ctx, session._id);
  const me = players.find((player) => player.playerToken === playerToken);
  if (!me) throw new Error("Vous n'êtes pas un joueur de cette partie.");

  return { session, players, me };
}

export const submitAnswer = mutation({
  args: {
    token: v.string(),
    playerToken: v.string(),
    questionId: v.id("questions"),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    const { session, players, me } = await requirePlayer(
      ctx,
      args.token,
      args.playerToken,
    );

    if (!session.questionIds.includes(args.questionId)) {
      throw new Error("Cette question ne fait pas partie de la partie.");
    }

    const value = args.value.trim().slice(0, 600);
    if (value.length === 0) throw new Error("Votre réponse est vide.");

    const now = Date.now();
    const existing = (
      await ctx.db
        .query("answers")
        .withIndex("by_player", (q) => q.eq("playerId", me._id))
        .collect()
    ).find((answer) => answer.questionId === args.questionId);

    let answerId: Id<"answers">;
    if (existing) {
      await ctx.db.patch(existing._id, {
        value,
        skipped: false,
        answeredAt: now,
      });
      answerId = existing._id;
    } else {
      answerId = await ctx.db.insert("answers", {
        sessionId: session._id,
        playerId: me._id,
        questionId: args.questionId,
        value,
        skipped: false,
        revealed: false,
        answeredAt: now,
      });
      const question = await ctx.db.get(args.questionId);
      if (question) {
        await ctx.db.patch(args.questionId, {
          answerCount: (question.answerCount ?? 0) + 1,
        });
      }
    }

    const sessionAnswers = await ctx.db
      .query("answers")
      .withIndex("by_session", (q) => q.eq("sessionId", session._id))
      .collect();

    const partner = players.find((player) => player._id !== me._id);
    const theirs = partner
      ? sessionAnswers.find(
          (answer) =>
            answer.playerId === partner._id &&
            answer.questionId === args.questionId,
        )
      : undefined;

    // DuoReveal : les deux réponses restent masquées tant que chacun n'a pas
    // appuyé sur « Découvrir ensemble » (cf. confirmReveal ci-dessous).
    if (!partner) {
      await ctx.db.patch(answerId, { revealed: true });
    } else if (theirs && !theirs.skipped) {
      await ctx.db.patch(answerId, { revealReady: false, revealed: false });
    }

    await ctx.db.patch(session._id, { lastActivityAt: now });
    await logEvent(ctx, "question_answered", now, session._id, {
      mode: session.mode,
    });

    return { ok: true };
  },
});

/**
 * DuoReveal — révélation consentie.
 *
 * Chaque partenaire confirme explicitement. Les deux réponses n'apparaissent
 * qu'au moment où la seconde personne a appuyé : aucune réponse n'est dévoilée
 * par le simple fait que l'autre ait répondu.
 */
export const confirmReveal = mutation({
  args: {
    token: v.string(),
    playerToken: v.string(),
    questionId: v.id("questions"),
  },
  handler: async (ctx, args) => {
    const { session, players, me } = await requirePlayer(
      ctx,
      args.token,
      args.playerToken,
    );

    if (!session.questionIds.includes(args.questionId)) {
      throw new Error("Cette question ne fait pas partie de la partie.");
    }

    const partner = players.find((player) => player._id !== me._id);
    if (!partner) throw new Error("Votre partenaire n'a pas encore rejoint.");

    const answers = await ctx.db
      .query("answers")
      .withIndex("by_session", (q) => q.eq("sessionId", session._id))
      .collect();

    const mine = answers.find(
      (answer) =>
        answer.playerId === me._id && answer.questionId === args.questionId,
    );
    const theirs = answers.find(
      (answer) =>
        answer.playerId === partner._id &&
        answer.questionId === args.questionId,
    );

    if (!mine || mine.skipped || !theirs || theirs.skipped) {
      throw new Error("Les deux réponses doivent être prêtes.");
    }

    const now = Date.now();
    await ctx.db.patch(mine._id, { revealReady: true });

    if (theirs.revealReady) {
      await ctx.db.patch(mine._id, { revealed: true });
      await ctx.db.patch(theirs._id, { revealed: true });
      await logEvent(ctx, "game_revealed", now, session._id, {
        mode: session.mode,
      });
    }

    await ctx.db.patch(session._id, { lastActivityAt: now });
    return { revealed: Boolean(theirs.revealReady) };
  },
});

/**
 * DuoReveal — décision du couple après la révélation. « Supprimer » efface
 * réellement les deux réponses de la partie : rien n'est conservé.
 */
export const setRevealOutcome = mutation({
  args: {
    token: v.string(),
    playerToken: v.string(),
    questionId: v.id("questions"),
    kind: v.union(
      v.literal("meme_reponse"),
      v.literal("a_discuter"),
      v.literal("envie"),
      v.literal("prive"),
      v.literal("supprime"),
    ),
  },
  handler: async (ctx, args) => {
    const { session, players, me } = await requirePlayer(
      ctx,
      args.token,
      args.playerToken,
    );

    if (!session.questionIds.includes(args.questionId)) {
      throw new Error("Cette question ne fait pas partie de la partie.");
    }

    const partner = players.find((player) => player._id !== me._id);
    const answers = await ctx.db
      .query("answers")
      .withIndex("by_session", (q) => q.eq("sessionId", session._id))
      .collect();
    const mine = answers.find(
      (answer) =>
        answer.playerId === me._id && answer.questionId === args.questionId,
    );
    const theirs = partner
      ? answers.find(
          (answer) =>
            answer.playerId === partner._id &&
            answer.questionId === args.questionId,
        )
      : undefined;

    if (!mine?.revealed || (partner && !theirs?.revealed)) {
      throw new Error("La révélation n'a pas encore eu lieu.");
    }

    const existing = await ctx.db
      .query("revealOutcomes")
      .withIndex("by_session_question", (q) =>
        q.eq("sessionId", session._id).eq("questionId", args.questionId),
      )
      .unique();

    if (args.kind === "supprime") {
      if (existing) await ctx.db.delete(existing._id);
      await ctx.db.delete(mine._id);
      if (theirs) await ctx.db.delete(theirs._id);
      await ctx.db.patch(session._id, {
        questionIds: session.questionIds.filter(
          (id) => id !== args.questionId,
        ),
        lastActivityAt: Date.now(),
      });
      await logEvent(ctx, "reveal_deleted", Date.now(), session._id);
      return { ok: true, deleted: true };
    }

    if (existing) {
      await ctx.db.patch(existing._id, {
        kind: args.kind,
        createdBy: me._id,
        createdAt: Date.now(),
      });
    } else {
      await ctx.db.insert("revealOutcomes", {
        sessionId: session._id,
        questionId: args.questionId,
        kind: args.kind,
        createdBy: me._id,
        createdAt: Date.now(),
      });
    }

    await ctx.db.patch(session._id, { lastActivityAt: Date.now() });
    await logEvent(ctx, "reveal_outcome", Date.now(), session._id, {
      kind: args.kind,
    });
    return { ok: true, deleted: false };
  },
});

export const skipQuestion = mutation({
  args: {
    token: v.string(),
    playerToken: v.string(),
    questionId: v.id("questions"),
  },
  handler: async (ctx, args) => {
    const { session, me } = await requirePlayer(
      ctx,
      args.token,
      args.playerToken,
    );

    if (!session.questionIds.includes(args.questionId)) {
      throw new Error("Cette question ne fait pas partie de la partie.");
    }

    const now = Date.now();
    const existing = (
      await ctx.db
        .query("answers")
        .withIndex("by_player", (q) => q.eq("playerId", me._id))
        .collect()
    ).find((answer) => answer.questionId === args.questionId);

    if (existing) {
      if (!existing.skipped) {
        await ctx.db.patch(existing._id, {
          value: "",
          skipped: true,
          answeredAt: now,
        });
      }
    } else {
      await ctx.db.insert("answers", {
        sessionId: session._id,
        playerId: me._id,
        questionId: args.questionId,
        value: "",
        skipped: true,
        revealed: false,
        answeredAt: now,
      });
      const question = await ctx.db.get(args.questionId);
      if (question) {
        await ctx.db.patch(args.questionId, {
          skipCount: (question.skipCount ?? 0) + 1,
        });
      }
    }

    await ctx.db.patch(session._id, { lastActivityAt: now });
    await logEvent(ctx, "question_skipped", now, session._id);
    return { ok: true };
  },
});

export const finish = mutation({
  args: { token: v.string(), playerToken: v.string() },
  handler: async (ctx, args) => {
    const { session, players, me } = await requirePlayer(
      ctx,
      args.token,
      args.playerToken,
    );

    const now = Date.now();
    if (!me.finishedAt) {
      await ctx.db.patch(me._id, { finishedAt: now });
    }

    const others = players.filter((player) => player._id !== me._id);
    const solo = others.length === 0;
    const soloComplete = solo && session.mode === "defi-individuel";
    const everyoneDone =
      others.length > 0 && others.every((player) => player.finishedAt);

    if (!soloComplete && !everyoneDone) {
      await ctx.db.patch(session._id, { lastActivityAt: now });
      return { completed: false, waitingForPartner: true };
    }

    await ctx.db.patch(session._id, {
      status: "terminee",
      completedAt: now,
      lastActivityAt: now,
    });
    await logEvent(ctx, "game_completed", now, session._id, {
      mode: session.mode,
    });

    // Un moment partagé rejoint le journal du couple (une seule fois).
    const author = players.find((player) => player.role === "A") ?? players[0];
    const authorDevice = optionalDeviceToken(author?.deviceToken);
    if (authorDevice) {
      await recordSessionMoment(ctx, {
        sessionId: session._id,
        experienceId: session.experienceId,
        journeyId: session.journeyId,
        deviceToken: authorDevice,
        authorName: author?.name,
        occurredAt: now,
      });
    }

    // Une partie terminée vaut étape de parcours réussie, pour chacun des
    // appareils engagés (y compris le partenaire invité).
    if (session.journeyId && session.journeyDayIndex !== undefined) {
      for (const player of players) {
        const deviceToken = optionalDeviceToken(player.deviceToken);
        if (!deviceToken) continue;
        await completeJourneyDay(ctx, {
          deviceToken,
          journeyId: session.journeyId,
          dayIndex: session.journeyDayIndex,
        });
      }
    }

    return { completed: true, waitingForPartner: false };
  },
});

/* ------------------------------------------------------------------ */
/* Cycle de vie différé (cf. PRD §13)                                  */
/* ------------------------------------------------------------------ */

/**
 * Clôture assistée (§13.2) : l'auteur garde ses propres réponses, celles du
 * partenaire ne sont jamais exposées. Idempotent.
 */
export const close = mutation({
  args: { token: v.string(), playerToken: v.string() },
  handler: async (ctx, args) => {
    const { session } = await requirePlayer(
      ctx,
      args.token,
      args.playerToken,
      "manage",
    );
    if (session.status === "abandonnee") {
      return { ok: true, alreadyClosed: true };
    }

    const now = Date.now();
    await ctx.db.patch(session._id, {
      status: "abandonnee",
      lastActivityAt: now,
    });
    await dismissSessionNotifications(ctx, session._id);
    await logEvent(ctx, "session_closed", now, session._id, {
      mode: session.mode,
    });
    return { ok: true, alreadyClosed: false };
  },
});

/**
 * Relance douce (§13.2) : prolonge le lien de 3 jours et rend de nouveau
 * possible le partage. Remet la partie expirée dans le flux.
 */
export const relance = mutation({
  args: { token: v.string(), playerToken: v.string() },
  handler: async (ctx, args) => {
    const { session } = await requirePlayer(
      ctx,
      args.token,
      args.playerToken,
      "manage",
    );
    if (session.status === "abandonnee") {
      throw new Error("Cette partie a été clôturée.");
    }

    const now = Date.now();
    const tokenExpiresAt =
      Math.max(session.tokenExpiresAt, now) + RELANCE_TTL_MS;
    await ctx.db.patch(session._id, {
      status: session.status === "expiree" ? "en_attente" : session.status,
      tokenExpiresAt,
      lastActivityAt: now,
    });
    await dismissSessionNotifications(ctx, session._id);
    await logEvent(ctx, "invite_link_shared", now, session._id, {
      mode: session.mode,
      relance: true,
    });
    return { ok: true, token: session.token, tokenExpiresAt };
  },
});

/** Corps du balayage, partagé par le cron et la commande d'exploitation. */
async function sweepSessions(ctx: MutationCtx, now: number) {
  const sessions = await ctx.db.query("sessions").collect();
  let expired = 0;
  let nudged = 0;

  for (const session of sessions) {
    if (session.status === "terminee" || session.status === "abandonnee") {
      continue;
    }

    const players = await findPlayers(ctx, session._id);
    const author = players.find((player) => player.role === "A");

    // Expiration : matérialisée puis signalée à l'auteur (§13.2).
    if (now > session.tokenExpiresAt) {
      if (session.status !== "expiree") {
        await ctx.db.patch(session._id, { status: "expiree" });
      }
      if (author?.deviceToken) {
        const created = await ensureNotification(
          ctx,
          {
            deviceToken: author.deviceToken,
            kind: "differe_expiree",
            title: "Une partie a expiré",
            body: "Votre partenaire n'a pas rejoint à temps. Vous pouvez la relancer ou la clôturer en gardant vos réponses.",
            sessionId: session._id,
          },
          now,
        );
        if (created) nudged += 1;
      }
      expired += 1;
      continue;
    }

    // Relances douces : seulement les modes où l'on attend l'autre (§13.2).
    const isAsync =
      session.mode === "differe" || session.mode === "a-distance";
    if (!isAsync || !author?.deviceToken) continue;

    const partner = players.find((player) => player._id !== author._id);
    if (partner?.finishedAt) continue;

    const idle = now - session.lastActivityAt;
    const existing = await ctx.db
      .query("notifications")
      .withIndex("by_session", (q) => q.eq("sessionId", session._id))
      .collect();
    const relances = existing.filter(
      (row) => row.kind === "differe_relance",
    ).length;

    let level = 0;
    if (idle >= RELANCE_2_MS && relances < 2) level = 2;
    else if (idle >= RELANCE_1_MS && relances < 1) level = 1;
    if (level === 0) continue;

    const created = await ensureNotification(
      ctx,
      {
        deviceToken: author.deviceToken,
        kind: "differe_relance",
        level,
        title: "Votre partenaire n'a pas encore répondu",
        body:
          level === 1
            ? "Un petit rappel suffit parfois : relancez la partie quand vous voulez."
            : "Toujours en attente. Vous pouvez relancer ou clôturer la partie en gardant vos réponses.",
        sessionId: session._id,
      },
      now,
    );
    if (created) nudged += 1;
  }

  return { expired, nudged };
}

/** Balayage quotidien (cron) — cf. PRD §13. */
export const lifecycleInternal = internalMutation({
  args: { now: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await sweepSessions(ctx, args.now ?? Date.now());
  },
});

/**
 * Déclenchement manuel du balayage — outil d'exploitation et de test :
 * vérifier l'expiration et les relances J+1/J+3 sans attendre. `now` autorise
 * l'injection d'une horloge pour un test déterministe.
 */
export const lifecycleSweep = mutation({
  args: { adminKey: v.string(), now: v.optional(v.number()) },
  handler: async (ctx, args) => {
    assertAdmin(args.adminKey);
    return await sweepSessions(ctx, args.now ?? Date.now());
  },
});
