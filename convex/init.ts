import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedDatabase = mutation({
    args: {
        type: v.union(v.literal("news"), v.literal("conferences"), v.literal("events"), v.literal("results"), v.literal("meetings"), v.literal("users")),
        data: v.array(v.any()),
    },
    handler: async (ctx, args) => {
        // Only allow seeding if the table is empty or for specific admin use
        if (args.type === "events") {
            for (const item of args.data) {
                await ctx.db.insert("competitive_events", {
                    title: item.title,
                    category: item.category,
                    division: item.division,
                    description: item.description,
                    pdfUrl: item.pdfUrl,
                    competitionTypes: item.competitionTypes,
                    requirements: item.requirements,
                    linkUrl: item.linkUrl,
                    studyLinks: item.studyLinks,
                });
            }
        } else if (args.type === "meetings") {
            for (const item of args.data) {
                await ctx.db.insert("meetings", {
                    ...item,
                });
            }
        } else if (args.type === "results") {
            for (const item of args.data) {
                await ctx.db.insert("event_results", {
                    ...item,
                });
            }
        } else if (args.type === "conferences") {
            for (const item of args.data) {
                await ctx.db.insert("conferences", {
                    name: item.name,
                    level: item.level,
                    stateId: item.stateId,
                    date: item.date,
                    endDate: item.endDate,
                    location: item.location,
                    type: item.type,
                });
            }
        } else if (args.type === "news") {
            for (const item of args.data) {
                await ctx.db.insert("news", {
                    ...item,
                });
            }
        }
    },
});

export const deleteTable = mutation({
    args: {
        table: v.union(v.literal("competitive_events"), v.literal("event_results")),
    },
    handler: async (ctx, args) => {
        const docs = await ctx.db.query(args.table).collect();
        for (const doc of docs) {
            await ctx.db.delete(doc._id);
        }
    },
});

export const seedChapterMembers = mutation({
    args: {
        chapterName: v.string(),
        schoolName: v.string(),
        state: v.string(),
    },
    handler: async (ctx, args) => {
        const mockMembers = [
            {
                email: "alex.rivera@fbla.org",
                displayName: "Alex Rivera",
                role: "officer" as const,
                competitiveEvents: ["Accounting I", "Business Communication"],
            },
            {
                email: "sam.chen@fbla.org",
                displayName: "Sam Chen",
                role: "officer" as const,
                competitiveEvents: ["Mobile Application Development"],
            },
            {
                email: "jordan.smith@fbla.org",
                displayName: "Jordan Smith",
                role: "member" as const,
                competitiveEvents: ["Accounting I"],
            },
            {
                email: "taylor.jones@fbla.org",
                displayName: "Taylor Jones",
                role: "member" as const,
                competitiveEvents: ["Business Communication"],
            },
            {
                email: "riley.brown@fbla.org",
                displayName: "Riley Brown",
                role: "member" as const,
                competitiveEvents: ["Mobile Application Development", "Accounting I"],
            },
        ];

        for (const member of mockMembers) {
            // Check if user already exists
            const existing = await ctx.db
                .query("users")
                .withIndex("by_email", (q) => q.eq("email", member.email))
                .unique();

            if (!existing) {
                const userId = await ctx.db.insert("users", {
                    ...member,
                    chapterName: args.chapterName,
                    schoolName: args.schoolName,
                    state: args.state,
                    createdAt: new Date().toISOString(),
                    tokenIdentifier: `mock_${member.email}`,
                });

                await ctx.db.insert("profiles", {
                    userId,
                    totalXP: Math.floor(Math.random() * 500),
                    level: Math.floor(Math.random() * 5) + 1,
                    badges: ["Early Adopter"],
                });
            }
        }
    },
});
