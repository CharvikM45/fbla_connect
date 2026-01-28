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
        bio: v.optional(v.string()),
        contactPreferences: v.optional(v.object({
            push: v.boolean(),
            email: v.boolean(),
            sms: v.boolean(),
        })),
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

    meetings: defineTable({
        title: v.string(),
        description: v.string(),
        date: v.string(),
        location: v.string(),
        chapterId: v.string(),
        type: v.union(v.literal("General"), v.literal("Officer"), v.literal("Committee")),
    }).index("by_chapter", ["chapterId"]),

    competitive_events: defineTable({
        title: v.string(),
        category: v.string(),
        division: v.union(v.literal("High School"), v.literal("Middle School"), v.literal("Collegiate"), v.literal("9th & 10th Grade")),
        description: v.optional(v.string()),
        pdfUrl: v.optional(v.string()),
        competitionTypes: v.optional(v.array(v.string())),
        requirements: v.optional(v.string()),
        linkUrl: v.optional(v.string()),
        studyLinks: v.optional(v.array(v.object({
            title: v.string(),
            url: v.string(),
        }))),
    }).index("by_category", ["category"]),

    event_results: defineTable({
        eventId: v.id("competitive_events"),
        year: v.number(),
        rank: v.number(),
        winnerName: v.string(),
        schoolName: v.string(),
        state: v.string(),
        level: v.union(v.literal("National"), v.literal("State")),
    }).index("by_event", ["eventId"]).index("by_year", ["year"]),
});
