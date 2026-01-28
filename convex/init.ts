import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedDatabase = mutation({
    args: {
        type: v.union(v.literal("news"), v.literal("conferences"), v.literal("events"), v.literal("results"), v.literal("meetings")),
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
