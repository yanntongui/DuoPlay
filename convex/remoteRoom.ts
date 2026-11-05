import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { optionalDeviceToken } from "./lib/identity";

function generateRemoteCode(): string {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}

/** Créer une salle à distance. */
export const createRoom = mutation({
  args: {
    deviceToken: v.string(),
    hostName: v.string(),
    experienceId: v.optional(v.id("experiences")),
    maxQuestions: v.number(),
  },
  handler: async (ctx, args) => {
    const deviceToken = optionalDeviceToken(args.deviceToken);
    if (!deviceToken) throw new ConvexError("Device token manquant");

    let pool: Array<Doc<"questions">> = [];

    if (args.experienceId) {
      const experienceId = args.experienceId;
      const rows = await ctx.db
        .query("questions")
        .withIndex("by_experience", (q) => q.eq("experienceId", experienceId))
        .collect();
      pool = rows.filter((question) => question.status === "published");
      if (pool.length === 0) {
        throw new ConvexError("Aucune question disponible pour cette expérience");
      }
    } else {
      pool = await ctx.db
        .query("questions")
        .withIndex("by_status", (q) => q.eq("status", "published"))
        .collect();
      if (pool.length === 0) {
        throw new ConvexError("Aucune question publiée pour le moment");
      }
    }

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(
      0,
      Math.max(1, Math.min(args.maxQuestions, shuffled.length)),
    );

    const roomId = await ctx.db.insert("remoteRooms", {
      hostDeviceToken: deviceToken,
      hostName: args.hostName,
      roomCode: generateRemoteCode(),
      status: "waiting",
      experienceId: args.experienceId,
      questions: selected.map((question) => question._id),
      currentQuestion: 0,
      hostAnswered: false,
      guestAnswered: false,
      createdAt: Date.now(),
    });

    const room = await ctx.db.get(roomId);
    return { roomId, code: room!.roomCode };
  },
});

/** Rejoindre une salle à distance. */
export const joinRoom = mutation({
  args: {
    deviceToken: v.string(),
    code: v.string(),
    guestName: v.string(),
  },
  handler: async (ctx, args) => {
    const deviceToken = optionalDeviceToken(args.deviceToken);
    if (!deviceToken) throw new ConvexError("Device token manquant");

    const room = await ctx.db
      .query("remoteRooms")
      .withIndex("by_code", (q) => q.eq("roomCode", args.code.trim().toUpperCase()))
      .first();

    if (!room) throw new ConvexError("Salle introuvable");
    if (room.guestToken && room.guestToken !== deviceToken) {
      throw new ConvexError("Cette salle est complète");
    }

    await ctx.db.patch(room._id, {
      guestToken: deviceToken,
      guestName: args.guestName,
      status: "in_progress",
    });

    return { roomId: room._id, code: room.roomCode };
  },
});

/**
 * Rejoindre n'importe quelle session à distance (questions, cartes, dés).
 * Le code circule indépendamment du format : on cherche dans les trois tables.
 */
export const joinAnyRoom = mutation({
  args: {
    deviceToken: v.string(),
    code: v.string(),
    guestName: v.string(),
  },
  handler: async (ctx, args) => {
    const deviceToken = optionalDeviceToken(args.deviceToken);
    if (!deviceToken) throw new ConvexError("Device token manquant");

    const code = args.code.trim().toUpperCase();

    const cardGame = await ctx.db
      .query("remoteCardGames")
      .withIndex("by_code", (q) => q.eq("roomCode", code))
      .first();

    if (cardGame) {
      if (cardGame.guestToken && cardGame.guestToken !== deviceToken) {
        throw new ConvexError("Cette partie est complète");
      }
      await ctx.db.patch(cardGame._id, {
        guestToken: deviceToken,
        guestName: args.guestName,
        status: "in_progress",
      });
      return { roomId: cardGame._id, code: cardGame.roomCode, kind: "cartes" as const };
    }

    const diceGame = await ctx.db
      .query("remoteDiceGames")
      .withIndex("by_code", (q) => q.eq("roomCode", code))
      .first();

    if (diceGame) {
      if (diceGame.guestToken && diceGame.guestToken !== deviceToken) {
        throw new ConvexError("Cette partie est complète");
      }
      await ctx.db.patch(diceGame._id, {
        guestToken: deviceToken,
        guestName: args.guestName,
        status: "in_progress",
      });
      return { roomId: diceGame._id, code: diceGame.roomCode, kind: "des" as const };
    }

    const room = await ctx.db
      .query("remoteRooms")
      .withIndex("by_code", (q) => q.eq("roomCode", code))
      .first();

    if (room) {
      if (room.guestToken && room.guestToken !== deviceToken) {
        throw new ConvexError("Cette salle est complète");
      }
      await ctx.db.patch(room._id, {
        guestToken: deviceToken,
        guestName: args.guestName,
        status: "in_progress",
      });
      return { roomId: room._id, code: room.roomCode, kind: "questions" as const };
    }

    throw new ConvexError("Aucune session ne correspond à ce code");
  },
});

/** Soumettre (ou corriger) une réponse pour la question courante. */
export const submitAnswer = mutation({
  args: {
    roomId: v.id("remoteRooms"),
    playerToken: v.string(),
    questionId: v.id("questions"),
    answer: v.string(),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) throw new ConvexError("Salle introuvable");
    if (room.status !== "in_progress") throw new ConvexError("Partie non démarrée");

    const isHost = args.playerToken === room.hostDeviceToken;
    const isGuest = args.playerToken === room.guestToken;
    if (!isHost && !isGuest) throw new ConvexError("Joueur inconnu");

    const existing = await ctx.db
      .query("remoteAnswers")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect()
      .then((rows) =>
        rows.find(
          (row) =>
            row.playerToken === args.playerToken &&
            row.questionId === args.questionId,
        ),
      );

    if (existing) {
      await ctx.db.patch(existing._id, {
        answer: args.answer,
        submittedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("remoteAnswers", {
        roomId: args.roomId,
        playerToken: args.playerToken,
        questionId: args.questionId,
        answer: args.answer,
        submittedAt: Date.now(),
      });
    }

    await ctx.db.patch(args.roomId, {
      hostAnswered: isHost ? true : room.hostAnswered,
      guestAnswered: isGuest ? true : room.guestAnswered,
    });

    return true;
  },
});

/** Passer à la question suivante (une fois la réponse révélée). */
export const advanceQuestion = mutation({
  args: {
    roomId: v.id("remoteRooms"),
    playerToken: v.string(),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) throw new ConvexError("Salle introuvable");

    const isHost = args.playerToken === room.hostDeviceToken;
    const isGuest = args.playerToken === room.guestToken;
    if (!isHost && !isGuest) throw new ConvexError("Joueur inconnu");
    if (!room.hostAnswered || !room.guestAnswered) {
      throw new ConvexError("Les deux joueurs n'ont pas encore répondu");
    }

    const next = room.currentQuestion + 1;
    const finished = next >= room.questions.length;

    await ctx.db.patch(args.roomId, {
      currentQuestion: finished ? room.currentQuestion : next,
      hostAnswered: false,
      guestAnswered: false,
      status: finished ? "completed" : "in_progress",
    });

    return true;
  },
});

/** Liste des salles d'un joueur. */
export const listRooms = query({
  args: { deviceToken: v.string() },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("remoteRooms")
      .withIndex("by_host", (q) => q.eq("hostDeviceToken", args.deviceToken))
      .first();

    return room ? [room] : [];
  },
});

/** Obtenir une salle par code, avec le contenu des questions. */
export const getRoomByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("remoteRooms")
      .withIndex("by_code", (q) => q.eq("roomCode", args.code.trim().toUpperCase()))
      .first();

    if (!room) return null;

    const questions = await Promise.all(
      room.questions.map((id) => ctx.db.get(id)),
    );

    return {
      ...room,
      questionDetails: questions
        .filter(
          (question): question is NonNullable<typeof question> =>
            question !== null,
        )
        .map((question) => ({
          _id: question._id,
          prompt: question.prompt,
          kind: question.kind,
          options: question.options ?? null,
          depth: question.depth,
        })),
    };
  },
});

/** Obtenir les réponses d'une salle. */
export const getAnswers = query({
  args: { roomId: v.id("remoteRooms") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("remoteAnswers")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();
  },
});
