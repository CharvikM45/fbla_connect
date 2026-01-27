import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        email: v.string(),
        displayName: v.string(),
        role: v.union(v.literal("member"), v.literal("officer"), v.literal("adviser")),
        avatarUrl: v.optional(v.string()),
        schoolName: v.optional(v.string()),
        chapterName: v.optional(v.string()),
        state: v.optional(v.string()),
        interests: v.optional(v.array(v.string())),
        clerkId: v.optional(v.string()), // For future Clerk integration
        tokenIdentifier: v.optional(v.string()), // For built-in auth
        createdAt: v.string(),
    }).index("by_token", ["tokenIdentifier"]).index("by_email", ["email"]),

    profiles: defineTable({
        userId: v.id("users"),
        totalXP: v.number(),
        level: v.number(),
        badges: v.array(v.string()),
    }).index("by_userId", ["userId"]),

    news: defineTable({
        title: v.string(),
        content: v.string(),
        summary: v.string(),
        level: v.union(v.literal("national"), v.literal("state"), v.literal("chapter")),
        category: v.string(),
        authorName: v.string(),
        publishedAt: v.string(),
        isPinned: v.boolean(),
        priority: v.string(),
        tags: v.array(v.string()),
        stateId: v.optional(v.string()),
        chapterId: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
        linkUrl: v.optional(v.string()),
    }).index("by_level", ["level"]),

    conferences: defineTable({
        name: v.string(),
        level: v.string(),
        stateId: v.optional(v.string()),
        date: v.string(),
        endDate: v.string(),
        location: v.string(),
        type: v.string(),
    }).index("by_state", ["stateId"]),

    competitive_events: defineTable({
        title: v.string(),
        category: v.string(),
        division: v.string(),
        description: v.optional(v.string()),
        linkUrl: v.optional(v.string()),
    }),
});
