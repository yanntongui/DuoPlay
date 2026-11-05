import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { optionalDeviceToken } from "./lib/identity";

function generateCode(): string {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}

/**
 * Créer une partie de cartes à distance.
 *
 * Le contenu des cartes provient des questions publiées de l'expérience :
 * c'est la seule source de contenu alimentée aujourd'hui (la table `cards`
 * n'est pas seedée).
 */
export const createCardGame = mutation({
  args: {
    deviceToken: v.string(),
    hostName: v.string(),
    experienceId: v.optional(v.id("experiences")),
    maxCards: v.number(),
  },
  handler: async (ctx, args) => {
    const deviceToken = optionalDeviceToken(args.deviceToken);
    if (!deviceToken) throw new ConvexError("Device token manquant");

    let pool: Array<Doc<"questions">> = [];

    if (args.experienceId) {
      const experienceId = args.experienceId;
      const questions = await ctx.db
        .query("questions")
        .withIndex("by_experience", (q) => q.eq("experienceId", experienceId))
        .collect();
      pool = questions.filter((question) => question.status === "published");
      if (pool.length === 0) {
        throw new ConvexError("Aucune carte disponible pour cette expérience");
      }
    } else {
      pool = await ctx.db
        .query("questions")
        .withIndex("by_status", (q) => q.eq("status", "published"))
        .collect();
      if (pool.length === 0) {
        throw new ConvexError("Aucune carte publiée pour le moment");
      }
    }

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(
      0,
      Math.max(1, Math.min(args.maxCards, shuffled.length)),
    );

    const roomId = await ctx.db.insert("remoteCardGames", {
      hostDeviceToken: deviceToken,
      hostName: args.hostName,
      roomCode: generateCode(),
      status: "waiting",
      experienceId: args.experienceId ?? selected[0].experienceId,
      questions: selected.map((question) => question._id),
      currentCard: 0,
      hostResponded: false,
      guestResponded: false,
      createdAt: Date.now(),
    });

    const room = await ctx.db.get(roomId);
    return { roomId, code: room!.roomCode };
  },
});

/** Rejoindre une partie de cartes à distance. */
export const joinCardGame = mutation({
  args: {
    deviceToken: v.string(),
    code: v.string(),
    guestName: v.string(),
  },
  handler: async (ctx, args) => {
    const deviceToken = optionalDeviceToken(args.deviceToken);
    if (!deviceToken) throw new ConvexError("Device token manquant");

    const room = await ctx.db
      .query("remoteCardGames")
      .withIndex("by_code", (q) =>
        q.eq("roomCode", args.code.trim().toUpperCase()),
      )
      .first();

    if (!room) throw new ConvexError("Partie introuvable");
    if (room.guestToken && room.guestToken !== deviceToken) {
      throw new ConvexError("Cette partie est complète");
    }

    await ctx.db.patch(room._id, {
      guestToken: deviceToken,
      guestName: args.guestName,
      status: "in_progress",
    });

    return { roomId: room._id, code: room.roomCode };
  },
});

/** Soumettre (ou corriger) une réponse pour la carte courante. */
export const submitCardResponse = mutation({
  args: {
    roomId: v.id("remoteCardGames"),
    playerToken: v.string(),
    questionId: v.id("questions"),
    response: v.union(
      v.literal("jaime"),
      v.literal("a_discuter"),
      v.literal("pas_maintenant"),
      v.literal("passer"),
    ),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) throw new ConvexError("Partie introuvable");
    if (room.status !== "in_progress") throw new ConvexError("Partie non démarrée");

    const isHost = args.playerToken === room.hostDeviceToken;
    const isGuest = args.playerToken === room.guestToken;
    if (!isHost && !isGuest) throw new ConvexError("Joueur inconnu");

    const existing = await ctx.db
      .query("remoteCardResponses")
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
        response: args.response,
        submittedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("remoteCardResponses", {
        roomId: args.roomId,
        playerToken: args.playerToken,
        questionId: args.questionId,
        response: args.response,
        submittedAt: Date.now(),
      });
    }

    const hostResponded = isHost ? true : room.hostResponded;
    const guestResponded = isGuest ? true : room.guestResponded;

    await ctx.db.patch(args.roomId, { hostResponded, guestResponded });

    return true;
  },
});

/** Passer à la carte suivante (une fois la manche révélée). */
export const advanceCard = mutation({
  args: {
    roomId: v.id("remoteCardGames"),
    playerToken: v.string(),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) throw new ConvexError("Partie introuvable");

    const isHost = args.playerToken === room.hostDeviceToken;
    const isGuest = args.playerToken === room.guestToken;
    if (!isHost && !isGuest) throw new ConvexError("Joueur inconnu");
    if (!room.hostResponded || !room.guestResponded) {
      throw new ConvexError("Les deux joueurs n'ont pas encore répondu");
    }

    const next = room.currentCard + 1;
    const finished = next >= room.questions.length;

    await ctx.db.patch(args.roomId, {
      currentCard: finished ? room.currentCard : next,
      hostResponded: false,
      guestResponded: false,
      status: finished ? "completed" : "in_progress",
    });

    return true;
  },
});

/** Obtenir une partie de cartes par code, avec le contenu des cartes. */
export const getCardGameByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("remoteCardGames")
      .withIndex("by_code", (q) =>
        q.eq("roomCode", args.code.trim().toUpperCase()),
      )
      .first();

    if (!room) return null;

    const questions = await Promise.all(
      room.questions.map((id) => ctx.db.get(id)),
    );

    return {
      ...room,
      cardDetails: questions
        .filter(
          (question): question is NonNullable<typeof question> =>
            question !== null,
        )
        .map((question) => ({
          _id: question._id,
          prompt: question.prompt,
          depth: question.depth,
          themes: question.themes,
          isOptional: question.kind === "challenge",
        })),
    };
  },
});

/** Obtenir les réponses d'une partie. */
export const getCardResponses = query({
  args: { roomId: v.id("remoteCardGames") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("remoteCardResponses")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();
  },
});
