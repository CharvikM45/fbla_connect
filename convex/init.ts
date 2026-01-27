import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedDatabase = mutation({
    args: {
        type: v.union(v.literal("news"), v.literal("conferences"), v.literal("events")),
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
