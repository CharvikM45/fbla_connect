import { query } from "./_generated/server";
import { v } from "convex/values";

export const getEvents = query({
    args: {
        category: v.optional(v.string()),
        search: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let events = await ctx.db.query("competitive_events").collect();

        if (args.category && args.category !== "All") {
            events = events.filter((e) => e.category === args.category);
        }

        if (args.search) {
            const searchLower = args.search.toLowerCase();
            events = events.filter((e) =>
                e.title.toLowerCase().includes(searchLower) ||
                (e.description && e.description.toLowerCase().includes(searchLower))
            );
        }

        return events.sort((a, b) => a.title.localeCompare(b.title));
    },
});
