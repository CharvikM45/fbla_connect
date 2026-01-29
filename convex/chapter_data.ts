import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Seed chapter data for Northview High School
export const seedChapterData = mutation({
    args: {
        chapterName: v.string(),
    },
    handler: async (ctx, args) => {
        // Check if data already exists to avoid duplicates
        const existingData = await ctx.db
            .query("chapter_data")
            .withIndex("by_chapter", (q) => q.eq("chapterName", args.chapterName))
            .first();

        if (existingData) {
            console.log("Data already exists for chapter:", args.chapterName);
            return;
        }

        let mockMembers;

        if (args.chapterName === "Chattahoochee County High School") {
            mockMembers = [
                { firstName: "Liam", lastName: "Wilson", role: "officer", grade: "12", email: "liam.w@example.com", chapterName: args.chapterName },
                { firstName: "Olivia", lastName: "Martin", role: "officer", grade: "11", email: "olivia.m@example.com", chapterName: args.chapterName },
                { firstName: "Noah", lastName: "Thompson", role: "member", grade: "10", email: "noah.t@example.com", chapterName: args.chapterName },
                { firstName: "Emma", lastName: "White", role: "member", grade: "9", email: "emma.w@example.com", chapterName: args.chapterName },
                { firstName: "Ava", lastName: "Lopez", role: "member", grade: "12", email: "ava.l@example.com", chapterName: args.chapterName },
                { firstName: "Elijah", lastName: "Lee", role: "member", grade: "11", email: "elijah.l@example.com", chapterName: args.chapterName },
                { firstName: "Charlotte", lastName: "Gonzalez", role: "member", grade: "10", email: "charlotte.g@example.com", chapterName: args.chapterName },
                { firstName: "William", lastName: "Harris", role: "officer", grade: "12", email: "william.h@example.com", chapterName: args.chapterName },
                { firstName: "Sophia", lastName: "Clark", role: "member", grade: "9", email: "sophia.c@example.com", chapterName: args.chapterName },
                { firstName: "James", lastName: "Lewis", role: "member", grade: "11", email: "james.l@example.com", chapterName: args.chapterName },
            ];
        } else {
            mockMembers = [
                { firstName: "John", lastName: "Doe", role: "officer", grade: "12", email: "john.doe@example.com", chapterName: args.chapterName },
                { firstName: "Jane", lastName: "Smith", role: "officer", grade: "11", email: "jane.smith@example.com", chapterName: args.chapterName },
                { firstName: "Alice", lastName: "Johnson", role: "member", grade: "10", email: "alice.j@example.com", chapterName: args.chapterName },
                { firstName: "Bob", lastName: "Brown", role: "member", grade: "9", email: "bob.b@example.com", chapterName: args.chapterName },
                { firstName: "Charlie", lastName: "Davis", role: "member", grade: "12", email: "charlie.d@example.com", chapterName: args.chapterName },
                { firstName: "Diana", lastName: "Evans", role: "member", grade: "11", email: "diana.e@example.com", chapterName: args.chapterName },
                { firstName: "Ethan", lastName: "Foster", role: "member", grade: "10", email: "ethan.f@example.com", chapterName: args.chapterName },
                { firstName: "Fiona", lastName: "Green", role: "officer", grade: "12", email: "fiona.g@example.com", chapterName: args.chapterName },
                { firstName: "George", lastName: "Harris", role: "member", grade: "9", email: "george.h@example.com", chapterName: args.chapterName },
                { firstName: "Hannah", lastName: "Irwin", role: "member", grade: "11", email: "hannah.i@example.com", chapterName: args.chapterName },
            ];
        }

        for (const member of mockMembers) {
            await ctx.db.insert("chapter_data", {
                ...member,
                role: member.role as "member" | "officer" | "advisor"
            });
        }

        console.log(`Seeded ${mockMembers.length} members for ${args.chapterName}`);
    },
});

// Get chapter data
export const getChapterData = query({
    args: {
        chapterName: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("chapter_data")
            .withIndex("by_chapter", (q) => q.eq("chapterName", args.chapterName))
            .collect();
    },
});

// Update a chapter member
export const updateChapterMember = mutation({
    args: {
        id: v.id("chapter_data"),
        firstName: v.string(),
        lastName: v.string(),
        grade: v.string(),
        role: v.union(v.literal("member"), v.literal("officer"), v.literal("advisor")),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        await ctx.db.patch(id, updates);
    },
});

// Remove a chapter member
export const removeChapterMember = mutation({
    args: {
        id: v.id("chapter_data"),
    },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});

// Cleanup chapter data (for development/reset)
export const cleanupChapter = mutation({
    args: {
        chapterName: v.string(),
    },
    handler: async (ctx, args) => {
        const members = await ctx.db
            .query("chapter_data")
            .withIndex("by_chapter", (q) => q.eq("chapterName", args.chapterName))
            .collect();

        for (const member of members) {
            await ctx.db.delete(member._id);
        }
        console.log(`Deleted ${members.length} members from ${args.chapterName}`);
    },
});
