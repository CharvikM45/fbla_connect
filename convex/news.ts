import { query, mutation } from "./_generated/server";
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

// Create a chapter announcement (for advisors)
export const createAnnouncement = mutation({
    args: {
        title: v.string(),
        content: v.string(),
        summary: v.string(),
        chapterId: v.string(),
        authorName: v.string(),
        category: v.optional(v.string()),
        priority: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
        imageUrl: v.optional(v.string()),
        linkUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Verify user is an advisor (you can add more auth checks here)
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .unique();

        if (!user || user.role !== "adviser") {
            throw new Error("Only advisors can create announcements");
        }

        // Ensure the advisor is creating for their own chapter
        if (user.chapterName !== args.chapterId) {
            throw new Error("You can only create announcements for your own chapter");
        }

        return await ctx.db.insert("news", {
            title: args.title,
            content: args.content,
            summary: args.summary,
            level: "chapter",
            category: args.category || "announcement",
            authorName: args.authorName,
            publishedAt: new Date().toISOString(),
            isPinned: false,
            priority: args.priority || "normal",
            tags: args.tags || [],
            chapterId: args.chapterId,
            imageUrl: args.imageUrl,
            linkUrl: args.linkUrl,
        });
    },
});
