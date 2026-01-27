import { query } from "./_generated/server";
import { v } from "convex/values";

export const getConferences = query({
    args: {
        stateId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        if (!args.stateId) {
            return await ctx.db.query("conferences").collect();
        }

        // Fetch national conferences and state-specific ones
        const national = await ctx.db
            .query("conferences")
            .filter((q) => q.eq(q.field("stateId"), args.stateId))
            .collect();

        const stateSpecific = await ctx.db
            .query("conferences")
            .withIndex("by_state", (q) => q.eq("stateId", args.stateId))
            .collect();

        return [...national, ...stateSpecific].sort((a, b) => a.date.localeCompare(b.date));
    },
});
