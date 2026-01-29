import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const dumpState = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return { error: "Not authenticated" };

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .unique();

        if (!user) return { error: "User not found in DB", identity };

        const allUsers = await ctx.db.query("users").collect();
        const chapterMembers = user.chapterName
            ? await ctx.db.query("users").withIndex("by_chapter", (q) => q.eq("chapterName", user.chapterName!)).collect()
            : [];

        return {
            currentUser: user,
            totalUsersInDB: allUsers.length,
            usersInChapter: chapterMembers.length,
            chapterMembers: chapterMembers,
            allUsersPreview: allUsers.map(u => ({ name: u.displayName, chapter: u.chapterName, email: u.email })),
        };
    },
});

export const forceResetUser = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return "No identity";

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .unique();

        if (user) {
            await ctx.db.patch(user._id, {
                chapterName: "Northview High School",
                role: "adviser"
            });
            return "Reset user to Northview High School advisor";
        }
        return "User not found";
    },
});
