import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { optionalDeviceToken } from "./lib/identity";

function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

/** Créer une nouvelle soirée (mode hôte). */
export const createGame = mutation({
  args: {
    deviceToken: v.string(),
    hostName: v.string(),
    rankingEnabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const deviceToken = optionalDeviceToken(args.deviceToken);
    if (!deviceToken) throw new Error("Device token manquant");

    const code = generateRoomCode();
    const now = Date.now();

    const gameId = await ctx.db.insert("soireeGames", {
      hostDeviceToken: deviceToken,
      hostName: args.hostName,
      roomCode: code,
      status: "waiting",
      rankingEnabled: args.rankingEnabled,
      createdAt: now,
    });

    return { gameId, code };
  },
});

/** Rejoindre une soirée avec le code. */
export const joinGame = mutation({
  args: {
    deviceToken: v.string(),
    code: v.string(),
    teamName: v.string(),
  },
  handler: async (ctx, args) => {
    const deviceToken = optionalDeviceToken(args.deviceToken);
    if (!deviceToken) throw new Error("Device token manquant");

    const game = await ctx.db
      .query("soireeGames")
      .withIndex("by_room_code", (q) => q.eq("roomCode", args.code))
      .first();

    if (!game) throw new Error("Soirée introuvable");
    if (game.status !== "waiting") throw new Error("Cette soirée est déjà en cours");

    // Vérifier si l'appareil a déjà rejoint
    const existing = await ctx.db
      .query("soireeTeams")
      .withIndex("by_game", (q) => q.eq("gameId", game._id))
      .collect();

    const alreadyJoined = existing.some((t) => t.deviceToken === deviceToken);
    if (alreadyJoined) throw new Error("Vous avez déjà rejoint cette soirée");

    const now = Date.now();
    const teamId = await ctx.db.insert("soireeTeams", {
      gameId: game._id,
      deviceToken,
      teamName: args.teamName,
      score: 0,
      joinedAt: now,
    });

    return { gameId: game._id, teamId, rankingEnabled: game.rankingEnabled };
  },
});

/** Lancer la soirée (hôte). */
export const startGame = mutation({
  args: { gameId: v.id("soireeGames"), questions: v.array(v.string()) },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Soirée introuvable");
    if (game.status !== "waiting") throw new Error("Cette soirée est déjà en cours");

    const now = Date.now();
    await ctx.db.patch(args.gameId, { status: "in_progress" });

    // Ajouter les questions à la soirée
    for (const [i, questionId] of args.questions.entries()) {
      await ctx.db.insert("soireeQuestions", {
        gameId: args.gameId,
        questionId: questionId as any,
        order: i,
        points: 1,
      });
    }

    return true;
  },
});

/** Soumettre une réponse pour une équipe. */
export const submitAnswer = mutation({
  args: {
    teamId: v.id("soireeTeams"),
    questionId: v.id("questions"),
    answer: v.string(),
  },
  handler: async (ctx, args) => {
    const team = await ctx.db.get(args.teamId);
    if (!team) throw new Error("Équipe introuvable");

    const now = Date.now();
    await ctx.db.insert("soireeTeamAnswers", {
      teamId: args.teamId,
      questionId: args.questionId,
      answer: args.answer,
      submittedAt: now,
    });

    return true;
  },
});

/** Calculer et enregistrer les scores. */
export const calculateScores = mutation({
  args: { gameId: v.id("soireeGames") },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Soirée introuvable");

    const teams = await ctx.db
      .query("soireeTeams")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .collect();

    const questions = await ctx.db
      .query("soireeQuestions")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .collect();

    // Score simple : une question par équipe = 1 point
    for (const team of teams) {
      const answers = await ctx.db
        .query("soireeTeamAnswers")
        .withIndex("by_team", (q) => q.eq("teamId", team._id))
        .collect();

      const score = answers.length;
      await ctx.db.patch(team._id, { score });
    }

    const now = Date.now();
    await ctx.db.patch(args.gameId, { status: "finished" });

    return teams.sort((a, b) => b.score - a.score);
  },
});

/** Liste des équipes d'une soirée. */
export const getTeams = query({
  args: { gameId: v.id("soireeGames") },
  handler: async (ctx, args) => {
    const teams = await ctx.db
      .query("soireeTeams")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .collect();

    return teams.sort((a, b) => b.score - a.score);
  },
});

/** Questions de la soirée. */
export const getQuestions = query({
  args: { gameId: v.id("soireeGames") },
  handler: async (ctx, args) => {
    const questions = await ctx.db
      .query("soireeQuestions")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .collect();

    return questions.sort((a, b) => a.order - b.order);
  },
});

/** Réponses à une question spécifique. */
export const getAnswersByQuestion = query({
  args: { gameId: v.id("soireeGames"), questionId: v.id("questions") },
  handler: async (ctx, args) => {
    const teams = await ctx.db
      .query("soireeTeams")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .collect();
    const teamIds = teams.map((t) => t._id);
    const answers = await Promise.all(
      teamIds.map((teamId) =>
        ctx.db
          .query("soireeTeamAnswers")
          .withIndex("by_team", (q) => q.eq("teamId", teamId))
          .collect()
      )
    );
    return answers.flat().filter((a) => a.questionId === args.questionId).map((a) => ({
      ...a,
      teamName: teams.find((t) => t._id === a.teamId)?.teamName ?? "",
    }));
  },
});

/** Noter une réponse. */
export const gradeAnswer = mutation({
  args: {
    teamId: v.id("soireeTeams"),
    questionId: v.id("questions"),
    isCorrect: v.boolean(),
  },
  handler: async (ctx, args) => {
    const answers = await ctx.db
      .query("soireeTeamAnswers")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();
    const answer = answers.find((a) => a.questionId === args.questionId);
    if (!answer) throw new Error("Réponse introuvable");
    await ctx.db.patch(answer._id, { correct: args.isCorrect });
    return true;
  },
});

/** Recalculer les scores basés sur les réponses correctes. */
export const finalizeScores = mutation({
  args: { gameId: v.id("soireeGames") },
  handler: async (ctx, args) => {
    const teams = await ctx.db
      .query("soireeTeams")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .collect();

    for (const team of teams) {
      const correctAnswers = await ctx.db
        .query("soireeTeamAnswers")
        .withIndex("by_team", (q) => q.eq("teamId", team._id))
        .collect();
      const score = correctAnswers.filter((a) => a.correct === true).length;
      await ctx.db.patch(team._id, { score });
    }
    return teams.sort((a, b) => b.score - a.score);
  },
});

/** Récupérer une soirée par code. */
export const byCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("soireeGames")
      .withIndex("by_room_code", (q) => q.eq("roomCode", args.code))
      .first();
  },
});

/** Récupérer les équipes d'une soirée par code. */
export const teams = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const game = await ctx.db
      .query("soireeGames")
      .withIndex("by_room_code", (q) => q.eq("roomCode", args.code))
      .first();

    if (!game) return [];

    const teams = await ctx.db
      .query("soireeTeams")
      .withIndex("by_game", (q) => q.eq("gameId", game._id))
      .collect();

    return teams.sort((a, b) => b.score - a.score);
  },
});
