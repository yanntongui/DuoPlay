import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const me = query({
  args: { deviceToken: v.string() },
  handler: async (ctx, args) => {
    const couple = await ctx.db
      .query("couples")
      .withIndex("by_deviceA", (q) => q.eq("deviceA", args.deviceToken))
      .first();
    
    const coupleB = await ctx.db
      .query("couples")
      .withIndex("by_deviceB", (q) => q.eq("deviceB", args.deviceToken))
      .first();
    
    const activeCouple = couple || coupleB;
    if (!activeCouple) return null;
    
    const iAmA = activeCouple.deviceA === args.deviceToken;
    const userId = iAmA ? activeCouple.userIdA : activeCouple.userIdB;
    
    if (!userId) return null;
    
    return await ctx.db.get(userId);
  },
});

export const touchActivity = mutation({
  args: { deviceToken: v.string() },
  handler: async (ctx, args) => {
    const couple = await ctx.db
      .query("couples")
      .withIndex("by_deviceA", (q) => q.eq("deviceA", args.deviceToken))
      .first();
    
    const coupleB = await ctx.db
      .query("couples")
      .withIndex("by_deviceB", (q) => q.eq("deviceB", args.deviceToken))
      .first();
    
    const activeCouple = couple || coupleB;
    if (activeCouple && activeCouple.userIdA) {
      const userIdA = activeCouple.userIdA;
      const profile = await ctx.db
        .query("profiles")
        .withIndex("by_user", (q) => q.eq("userId", userIdA))
        .first();
      if (profile) {
        await ctx.db.patch(profile._id, { lastActiveAt: Date.now() });
      }
    }
  },
});

export const updateMood = mutation({
  args: { 
    userId: v.id("users"),
    mood: v.union(
      v.literal("joyeux"),
      v.literal("curieux"),
      v.literal("calme"),
      v.literal("fatigué"),
      v.literal("romantique")
    )
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    if (!profile) return;
    
    const now = Date.now();
    await ctx.db.patch(profile._id, { 
      mood: args.mood, 
      moodUpdatedAt: now 
    });
  },
});
