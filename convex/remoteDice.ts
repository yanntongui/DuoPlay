import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { optionalDeviceToken } from "./lib/identity";

function generateCode(): string {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}

/** Créer une partie de dés à distance. */
export const createDiceGame = mutation({
  args: {
    deviceToken: v.string(),
    hostName: v.string(),
    ambiance: v.optional(v.string()),
    durationMinutes: v.number(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const deviceToken = optionalDeviceToken(args.deviceToken);
    if (!deviceToken) throw new ConvexError("Device token manquant");

    const roomId = await ctx.db.insert("remoteDiceGames", {
      hostDeviceToken: deviceToken,
      hostName: args.hostName,
      roomCode: generateCode(),
      status: "waiting",
      ambiance: args.ambiance,
      durationMinutes: args.durationMinutes,
      category: args.category,
      hostRolled: false,
      guestRolled: false,
      createdAt: Date.now(),
    });

    const room = await ctx.db.get(roomId);
    return { roomId, code: room!.roomCode };
  },
});

/** Rejoindre une partie de dés à distance. */
export const joinDiceGame = mutation({
  args: {
    deviceToken: v.string(),
    code: v.string(),
    guestName: v.string(),
  },
  handler: async (ctx, args) => {
    const deviceToken = optionalDeviceToken(args.deviceToken);
    if (!deviceToken) throw new ConvexError("Device token manquant");

    const room = await ctx.db
      .query("remoteDiceGames")
      .withIndex("by_code", (q) => q.eq("roomCode", args.code.toUpperCase()))
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

/** Lancer le dé pour le joueur courant. */
export const rollDice = mutation({
  args: {
    roomId: v.id("remoteDiceGames"),
    playerToken: v.string(),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) throw new ConvexError("Partie introuvable");
    if (room.status !== "in_progress") throw new ConvexError("Partie non démarrée");

    const isHost = args.playerToken === room.hostDeviceToken;
    const isGuest = args.playerToken === room.guestToken;
    if (!isHost && !isGuest) throw new ConvexError("Joueur inconnu");

    const result = Math.floor(Math.random() * 6) + 1;

    const existing = await ctx.db
      .query("remoteDiceResults")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect()
      .then((rows) =>
        rows.find((row) => row.playerToken === args.playerToken),
      );

    if (existing) {
      await ctx.db.patch(existing._id, {
        category: args.category,
        result,
        rolledAt: Date.now(),
      });
    } else {
      await ctx.db.insert("remoteDiceResults", {
        roomId: args.roomId,
        playerToken: args.playerToken,
        category: args.category,
        result,
        rolledAt: Date.now(),
      });
    }

    const hostRolled = isHost ? true : room.hostRolled;
    const guestRolled = isGuest ? true : room.guestRolled;

    await ctx.db.patch(args.roomId, {
      hostRolled,
      guestRolled,
      category: args.category,
      status: hostRolled && guestRolled ? "completed" : "in_progress",
    });

    return { result };
  },
});

/** Obtenir une partie de dés par code. */
export const getDiceGameByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("remoteDiceGames")
      .withIndex("by_code", (q) => q.eq("roomCode", args.code.toUpperCase()))
      .first();
  },
});

/** Obtenir les résultats d'une partie de dés. */
export const getDiceResults = query({
  args: { roomId: v.id("remoteDiceGames") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("remoteDiceResults")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();
  },
});
