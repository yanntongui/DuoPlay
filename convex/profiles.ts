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
      await ctx.db.patch(activeCouple.userIdA, { lastActiveAt: Date.now() });
    }
  },
});
