import { query } from "./_generated/server";
import { v } from "convex/values";

// Fetch news with localization filtering
export const getFilteredNews = query({
    args: {
        stateId: v.optional(v.string()),
        chapterId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const allNews = await ctx.db.query("news").collect();

        return allNews.filter((item) => {
            // Always show national
            if (item.level === "national") return true;

            // Filter by state
            if (item.level === "state" && args.stateId) {
                return item.stateId === args.stateId;
            }

            // Filter by chapter
            if (item.level === "chapter" && args.chapterId) {
                return item.chapterId === args.chapterId;
            }

            return false;
        }).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    },
});
