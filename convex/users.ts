import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create or update a user record
export const storeUser = mutation({
    args: {
        email: v.string(),
        displayName: v.string(),
        role: v.union(v.literal("member"), v.literal("officer"), v.literal("adviser")),
        schoolName: v.optional(v.string()),
        chapterName: v.optional(v.string()),
        state: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        const tokenIdentifier = identity?.tokenIdentifier ?? "guest";

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
            .unique();

        if (user !== null) {
            // Update existing user
            await ctx.db.patch(user._id, {
                ...args,
            });
            return user._id;
        }

        // Create new user
        const userId = await ctx.db.insert("users", {
            ...args,
            tokenIdentifier,
            createdAt: new Date().toISOString(),
        });

        // Create associated profile
        await ctx.db.insert("profiles", {
            userId,
            totalXP: 0,
            level: 1,
            badges: [],
        });

        return userId;
    },
});

// Get current user data
export const currentUser = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        return await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .unique();
    },
});
// Update a user record
export const updateUser = mutation({
    args: {
        schoolName: v.optional(v.string()),
        chapterName: v.optional(v.string()),
        state: v.optional(v.string()),
        interests: v.optional(v.array(v.string())),
        displayName: v.optional(v.string()),
        role: v.optional(v.union(v.literal("member"), v.literal("officer"), v.literal("adviser"))),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        const tokenIdentifier = identity?.tokenIdentifier ?? "guest";

        if (!identity) throw new Error("Unauthenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
            .unique();

        if (!user) throw new Error("User not found");

        await ctx.db.patch(user._id, args);
        return user._id;
    },
});
