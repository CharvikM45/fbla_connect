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
                displayName: "Alex Rivera",
                email: "alex.rivera@northview.edu",
                role: "officer" as const,
                xp: 1250,
                level: 13,
                competitiveEvents: ["Business Communication", "Management Decision Making"]
            },
            {
                displayName: "Sarah Chen",
                email: "s.chen@northview.edu",
                role: "officer" as const,
                xp: 980,
                level: 10,
                competitiveEvents: ["Computer Applications", "Cyber Security"]
            },
            {
                displayName: "Marcus Johnson",
                email: "m.johnson@northview.edu",
                role: "member" as const,
                xp: 450,
                level: 5,
                competitiveEvents: ["Accounting I", "Securities and Investments"]
            },
            {
                displayName: "Priya Sharma",
                email: "p.sharma@northview.edu",
                role: "member" as const,
                xp: 720,
                level: 8,
                competitiveEvents: ["Social Media Strategies", "Digital Video Production"]
            },
            {
                displayName: "Jordan Lee",
                email: "j.lee@northview.edu",
                role: "member" as const,
                xp: 310,
                level: 4,
                competitiveEvents: ["Business Plan"]
            },
        ];

        for (const member of mockMembers) {
            // Check if user already exists
            const existing = await ctx.db
                .query("users")
                .withIndex("by_email", (q) => q.eq("email", member.email))
                .unique();

            let userId;
            if (!existing) {
                userId = await ctx.db.insert("users", {
                    email: member.email,
                    displayName: member.displayName,
                    role: member.role,
                    chapterName: args.chapterName,
                    schoolName: args.schoolName,
                    state: args.state,
                    competitiveEvents: member.competitiveEvents,
                    createdAt: new Date().toISOString(),
                    tokenIdentifier: `mock_${member.email}`,
                });
            } else {
                userId = existing._id;
                await ctx.db.patch(userId, {
                    chapterName: args.chapterName,
                    schoolName: args.schoolName,
                    state: args.state,
                    role: member.role,
                    competitiveEvents: member.competitiveEvents,
                });
            }

            // Update or create profile
            const existingProfile = await ctx.db
                .query("profiles")
                .withIndex("by_userId", (q) => q.eq("userId", userId))
                .unique();

            if (existingProfile) {
                await ctx.db.patch(existingProfile._id, {
                    totalXP: member.xp,
                    level: member.level,
                });
            } else {
                await ctx.db.insert("profiles", {
                    userId,
                    totalXP: member.xp,
                    level: member.level,
                    badges: ["Chapter Founder"],
                });
            } else {
                // If they exist, update their chapter details to match the current advisor
                await ctx.db.patch(existing._id, {
                    chapterName: args.chapterName,
                    schoolName: args.schoolName,
                    state: args.state,
                });
            }
        }

        // Also update the current user (advisor) to be in this chapter
        const identity = await ctx.auth.getUserIdentity();
        if (identity) {
            const advisor = await ctx.db
                .query("users")
                .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
                .unique();

            if (advisor) {
                // Force update the chapter for the caller to ensure they see the data
                await ctx.db.patch(advisor._id, {
                    chapterName: args.chapterName,
                    schoolName: args.schoolName,
                    state: args.state,
                });
            }
        }
    },
});
