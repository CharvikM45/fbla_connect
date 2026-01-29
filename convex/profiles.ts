import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get profile by user ID
export const getProfileByUserId = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("profiles")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .unique();
    },
});

// Get current user's profile
export const getCurrentUserProfile = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .unique();

        if (!user) return null;

        return await ctx.db
            .query("profiles")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .unique();
    },
});

// Update profile (XP, level, badges)
export const updateProfile = mutation({
    args: {
        userId: v.id("users"),
        totalXP: v.optional(v.number()),
        level: v.optional(v.number()),
        badges: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("User not found");

        let profile = await ctx.db
            .query("profiles")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .unique();

        if (!profile) {
            // Create profile if it doesn't exist
            const profileId = await ctx.db.insert("profiles", {
                userId: user._id,
                totalXP: args.totalXP ?? 0,
                level: args.level ?? 1,
                badges: args.badges ?? [],
            });
            return profileId;
        }

        const updates: Partial<{ totalXP: number; level: number; badges: string[] }> = {};
        if (args.totalXP !== undefined) updates.totalXP = args.totalXP;
        if (args.level !== undefined) updates.level = args.level;
        if (args.badges !== undefined) updates.badges = args.badges;

        await ctx.db.patch(profile._id, updates);
        return profile._id;
    },
});

// Add XP to current user (with automatic level-up logic)
export const addXP = mutation({
    args: {
        amount: v.number(),
        userId: v.optional(v.id("users")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        const user = args.userId
            ? await ctx.db.get(args.userId)
            : identity
                ? await ctx.db
                    .query("users")
                    .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
                    .unique()
                : null;

        if (!user) throw new Error("Unauthenticated or User not found");

        let profile = await ctx.db
            .query("profiles")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .unique();

        if (!profile) {
            // Create profile if it doesn't exist
            const newXP = args.amount;
            const newLevel = Math.floor(newXP / 100) + 1;
            const profileId = await ctx.db.insert("profiles", {
                userId: user._id,
                totalXP: newXP,
                level: newLevel,
                badges: [],
            });
            return { totalXP: newXP, level: newLevel, leveledUp: newLevel > 1 };
        }

        const newXP = profile.totalXP + args.amount;
        // Simple level-up: every 100 XP = 1 level
        const newLevel = Math.floor(newXP / 100) + 1;

        await ctx.db.patch(profile._id, {
            totalXP: newXP,
            level: newLevel,
        });

        return { totalXP: newXP, level: newLevel, leveledUp: newLevel > profile.level };
    },
});

// Award a badge to the current user
export const awardBadge = mutation({
    args: {
        badgeName: v.string(),
        userId: v.optional(v.id("users")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        const user = args.userId
            ? await ctx.db.get(args.userId)
            : identity
                ? await ctx.db
                    .query("users")
                    .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
                    .unique()
                : null;

        if (!user) throw new Error("Unauthenticated or User not found");

        let profile = await ctx.db
            .query("profiles")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .unique();

        if (!profile) {
            // Create profile if it doesn't exist
            const profileId = await ctx.db.insert("profiles", {
                userId: user._id,
                totalXP: 0,
                level: 1,
                badges: [args.badgeName],
            });
            return { success: true, badge: args.badgeName };
        }

        // Don't add duplicate badges
        if (profile.badges.includes(args.badgeName)) {
            return { success: false, message: "Badge already awarded" };
        }

        await ctx.db.patch(profile._id, {
            badges: [...profile.badges, args.badgeName],
        });

        return { success: true, badge: args.badgeName };
    },
});
