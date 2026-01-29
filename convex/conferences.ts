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

        // Fetch national conferences (no stateId)
        const national = await ctx.db
            .query("conferences")
            .filter((q) => q.eq(q.field("level"), "National"))
            .collect();

        // Fetch state-specific ones
        const stateSpecific = await ctx.db
            .query("conferences")
            .withIndex("by_state", (q) => q.eq("stateId", args.stateId))
            .collect();

        // Combine and resolve duplicates by ID
        const combined = [...national, ...stateSpecific];
        const seen = new Set();
        const unique = combined.filter(item => {
            const id = item._id.toString();
            const duplicate = seen.has(id);
            seen.add(id);
            return !duplicate;
        });

        return unique.sort((a, b) => a.date.localeCompare(b.date));
    },
});
