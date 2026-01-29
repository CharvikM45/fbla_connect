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
        competitiveEvents: v.optional(v.array(v.string())),
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
        competitiveEvents: v.optional(v.array(v.string())),
        displayName: v.optional(v.string()),
        role: v.optional(v.union(v.literal("member"), v.literal("officer"), v.literal("adviser"))),
        bio: v.optional(v.string()),
        contactPreferences: v.optional(v.object({
            push: v.boolean(),
            email: v.boolean(),
            sms: v.boolean(),
        })),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        const tokenIdentifier = identity?.tokenIdentifier ?? "guest";

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
            .unique();

        if (!user) throw new Error("User not found");

        await ctx.db.patch(user._id, args);
        return user._id;
    },
});

// Get user by email
export const getUserByEmail = query({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("email"), args.email))
            .unique();
    },
});
// Get members of the authenticated advisor's chapter with their XP
export const getChapterMembers = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .unique();

        if (!user || (user.role !== "adviser" && user.role !== "officer") || !user.chapterName) {
            return [];
        }

        // Get all users in the chapter using the index
        const members = await ctx.db
            .query("users")
            .withIndex("by_chapter", (q) => q.eq("chapterName", user.chapterName))
            .collect();

        // Join with profiles to get XP
        const membersWithXP = await Promise.all(
            members.map(async (member) => {
                const profile = await ctx.db
                    .query("profiles")
                    .withIndex("by_userId", (q) => q.eq("userId", member._id))
                    .unique();
                return {
                    ...member,
                    totalXP: profile?.totalXP || 0,
                    level: profile?.level || 1,
                };
            })
        );

        return membersWithXP;
    },
});

// Aggregate competitive event status for a chapter
export const getChapterEventsStatus = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .unique();

        if (!user || user.role !== "adviser" || !user.chapterName) {
            return [];
        }

        const members = await ctx.db
            .query("users")
            .withIndex("by_chapter", (q) => q.eq("chapterName", user.chapterName))
            .collect();

        const eventCounts: Record<string, number> = {};
        members.forEach(member => {
            if (member.competitiveEvents) {
                member.competitiveEvents.forEach(event => {
                    eventCounts[event] = (eventCounts[event] || 0) + 1;
                });
            }
        });

        // Convert to sorted array
        return Object.entries(eventCounts)
            .map(([title, count]) => ({ title, count }))
            .sort((a, b) => b.count - a.count);
    },
});

// Add a member to a chapter (by email)
export const addMemberToChapter = mutation({
    args: {
        email: v.string(),
        chapterName: v.string(),
        schoolName: v.string(),
        state: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const advisor = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .unique();

        if (!advisor || advisor.role !== "adviser") {
            throw new Error("Only advisors can add members");
        }

        if (advisor.chapterName !== args.chapterName) {
            throw new Error("You can only add members to your own chapter");
        }

        const userToAdd = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .unique();

        if (!userToAdd) throw new Error("User not found with that email");

        await ctx.db.patch(userToAdd._id, {
            chapterName: args.chapterName,
            schoolName: args.schoolName,
            state: args.state,
        });

        return userToAdd._id;
    },
});

// Remove a member from a chapter
export const removeMemberFromChapter = mutation({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const advisor = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .unique();

        if (!advisor || advisor.role !== "adviser") {
            throw new Error("Only advisors can remove members");
        }

        const userToRemove = await ctx.db.get(args.userId);
        if (!userToRemove) throw new Error("Member not found");

        if (userToRemove.chapterName !== advisor.chapterName) {
            throw new Error("You can only remove members from your own chapter");
        }

        // Using ctx.db.patch doesn't allow unsetting a field by passing undefined in literal,
        // but it works if the field is omitted. Since we want to clear it, 
        // we'll explicitly clear chapterName and schoolName.
        await ctx.db.patch(userToRemove._id, {
            chapterName: undefined,
            schoolName: undefined
        });

        return userToRemove._id;
    },
});
