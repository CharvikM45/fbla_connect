import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getMeetings = query({
    args: { chapterId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("meetings")
            .withIndex("by_chapter", (q) => q.eq("chapterId", args.chapterId))
            .collect();
    },
});

export const createMeeting = mutation({
    args: {
        title: v.string(),
        description: v.string(),
        date: v.string(),
        location: v.string(),
        chapterId: v.string(),
        type: v.union(v.literal("General"), v.literal("Officer"), v.literal("Committee")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .unique();

        if (!user || (user.role !== "adviser" && user.role !== "officer")) {
            throw new Error("Only advisors and officers can create meetings");
        }

        if (user.chapterName !== args.chapterId) {
            throw new Error("You can only create meetings for your own chapter");
        }

        return await ctx.db.insert("meetings", args);
    },
});
