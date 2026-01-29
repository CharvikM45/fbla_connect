import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedNorthviewChapter = mutation({
    args: {},
    handler: async (ctx) => {
        const chapterName = "Northview High School";
        const schoolName = "Northview High School";
        const state = "GA";

        const mockStudents = [
            {
                displayName: "Alex Rivera",
                email: "alex.rivera@northview.edu",
                role: "officer" as const,
                xp: 1250,
                level: 13,
                interests: ["Leadership", "Public Speaking"],
                competitiveEvents: ["Business Communication", "Management Decision Making"]
            },
            {
                displayName: "Sarah Chen",
                email: "s.chen@northview.edu",
                role: "officer" as const,
                xp: 980,
                level: 10,
                interests: ["Technology", "Coding"],
                competitiveEvents: ["Computer Applications", "Cyber Security"]
            },
            {
                displayName: "Marcus Johnson",
                email: "m.johnson@northview.edu",
                role: "member" as const,
                xp: 450,
                level: 5,
                interests: ["Finance", "Banking"],
                competitiveEvents: ["Accounting I", "Securities and Investments"]
            },
            {
                displayName: "Priya Sharma",
                email: "p.sharma@northview.edu",
                role: "member" as const,
                xp: 720,
                level: 8,
                interests: ["Marketing", "Social Media"],
                competitiveEvents: ["Social Media Strategies", "Digital Video Production"]
            },
            {
                displayName: "Jordan Lee",
                email: "j.lee@northview.edu",
                role: "member" as const,
                xp: 310,
                level: 4,
                interests: ["Entrepreneurship"],
                competitiveEvents: ["Business Plan"]
            },
            {
                displayName: "Emma Wilson",
                email: "e.wilson@northview.edu",
                role: "member" as const,
                xp: 150,
                level: 2,
                interests: ["Management"],
                competitiveEvents: ["Introduction to Business"]
            },
        ];

        for (const student of mockStudents) {
            // Check if user already exists
            const existingUser = await ctx.db
                .query("users")
                .withIndex("by_email", (q) => q.eq("email", student.email))
                .unique();

            let userId;
            if (existingUser) {
                userId = existingUser._id;
                await ctx.db.patch(userId, {
                    displayName: student.displayName,
                    role: student.role,
                    chapterName,
                    schoolName,
                    state,
                    interests: student.interests,
                    competitiveEvents: student.competitiveEvents,
                });
            } else {
                userId = await ctx.db.insert("users", {
                    email: student.email,
                    displayName: student.displayName,
                    role: student.role,
                    chapterName,
                    schoolName,
                    state,
                    interests: student.interests,
                    competitiveEvents: student.competitiveEvents,
                    createdAt: new Date().toISOString(),
                    tokenIdentifier: `mock_${student.email}`,
                });
            }

            // Update or create profile
            const existingProfile = await ctx.db
                .query("profiles")
                .withIndex("by_userId", (q) => q.eq("userId", userId))
                .unique();

            if (existingProfile) {
                await ctx.db.patch(existingProfile._id, {
                    totalXP: student.xp,
                    level: student.level,
                });
            } else {
                await ctx.db.insert("profiles", {
                    userId,
                    totalXP: student.xp,
                    level: student.level,
                    badges: [],
                });
            }
        }

        return { success: true, count: mockStudents.length };
    },
});
