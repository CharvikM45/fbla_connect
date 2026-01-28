import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";

export const seed = action({
    args: {},
    handler: async (ctx) => {
        console.log("Starting master seed...");

        // 1. Seed News
        const newsData = [
            {
                title: "National Leadership Conference 2025",
                content: "The 2025 NLC will be held in Anaheim, California. Join thousands of members for competition and networking.",
                summary: "Join us in Anaheim for NLC 2025!",
                level: "national",
                category: "announcement",
                authorName: "FBLA National",
                publishedAt: new Date().toISOString(),
                isPinned: true,
                priority: "high",
                tags: ["NLC", "Anaheim"],
                imageUrl: "https://www.fbla.org/wp-content/uploads/2024/05/NLC24-Logo-Web.png"
            },
            {
                title: "Nebraska SLC Registration Open",
                content: "Registration for the 2025 State Leadership Conference in Omaha is now open. Coordinate with your advisor for deadlines.",
                summary: "Omaha SLC registration is live!",
                level: "state",
                category: "announcement",
                authorName: "Nebraska FBLA",
                publishedAt: new Date().toISOString(),
                isPinned: true,
                priority: "high",
                tags: ["SLC", "Nebraska"],
            }
        ];
        await ctx.runMutation(api.init.seedDatabase, { type: "news", data: newsData });

        // 2. Seed Conferences (Nebraska Specific)
        const conferenceData = [
            {
                name: "Fall Leadership Conference (FLC)",
                level: "State",
                stateId: "NE",
                date: "2024-09-24",
                endDate: "2024-09-25",
                location: "Kearney, NE",
                type: "Leadership"
            },
            {
                name: "Regional Leadership Conference (RLC)",
                level: "Regional",
                stateId: "NE",
                date: "2025-01-15",
                endDate: "2025-01-15",
                location: "Varies by District",
                type: "Competition"
            },
            {
                name: "State Leadership Conference (SLC)",
                level: "State",
                stateId: "NE",
                date: "2025-04-03",
                endDate: "2025-04-05",
                location: "Omaha, NE",
                type: "Competition"
            }
        ];
        await ctx.runMutation(api.init.seedDatabase, { type: "conferences", data: conferenceData });

        // 3. Clear existing events/results/meetings to avoid duplicates
        await ctx.runMutation(api.init.deleteTable, { table: "competitive_events" });
        await ctx.runMutation(api.init.deleteTable, { table: "event_results" });

        // 4. Seed Events (High-fidelity data with Rubrics and Study Links)
        const eventsData = [
            {
                title: "Accounting I",
                category: "Objective Test",
                division: "High School",
                description: "Individual event focused on fundamental accounting principles.",
                pdfUrl: "https://connect.fbla.org/headquarters/files/High%20School%20Competitive%20Events%20Resources/Individual%20Guidelines/Objective%20Tests/Accounting-I.pdf",
                competitionTypes: ["Objective Test"],
                requirements: "50-minute test, 100 multiple-choice questions.",
                linkUrl: "https://www.fbla.org/competitive-events/accounting-i/",
                studyLinks: [
                    { title: "Quizlet: Accounting I", url: "https://quizlet.com/search?query=fbla-accounting-i&type=sets" },
                    { title: "FBLA Practice Tests", url: "https://www.fbla-pbl.org/competitive-event-study-guides/" },
                    { title: "Khan Academy: Finance & Economics", url: "https://www.khanacademy.org/economics-finance-domain" }
                ]
            },
            {
                title: "Mobile Application Development",
                category: "Production & Presentation",
                division: "High School",
                description: "Create a mobile app project and present it to judges.",
                pdfUrl: "https://connect.fbla.org/headquarters/files/High%20School%20Competitive%20Events%20Resources/Individual%20Guidelines/Presentation%20Events/Mobile-Application-Development.pdf",
                competitionTypes: ["Project", "Presentation"],
                requirements: "Pre-judged project + live presentation.",
                linkUrl: "https://www.fbla.org/competitive-events/mobile-application-development/",
                studyLinks: [
                    { title: "Quizlet: Mobile Application Development", url: "https://quizlet.com/search?query=fbla-mobile-application-development&type=sets" },
                    { title: "Codecademy Resources", url: "https://www.codecademy.com/" }
                ]
            },
            {
                title: "Business Communication",
                category: "Objective Test",
                division: "High School",
                description: "Test your skills in written and oral business communication.",
                pdfUrl: "https://connect.fbla.org/headquarters/files/High%20School%20Competitive%20Events%20Resources/Individual%20Guidelines/Objective%20Tests/Business-Communication.pdf",
                competitionTypes: ["Objective Test"],
                requirements: "100 multiple-choice questions.",
                linkUrl: "https://www.fbla.org/competitive-events/business-communication/",
                studyLinks: [
                    { title: "Quizlet: Business Communication", url: "https://quizlet.com/search?query=fbla-business-communication&type=sets" },
                    { title: "FBLA Practice Tests", url: "https://www.fbla-pbl.org/competitive-event-study-guides/" },
                    { title: "Khan Academy: Business", url: "https://www.khanacademy.org/college-careers-more/entrepreneurship2" }
                ]
            }
        ];
        await ctx.runMutation(api.init.seedDatabase, { type: "events", data: eventsData });

        // 5. Seed Chapter Meetings
        const meetingData = [
            {
                title: "January General Meeting",
                description: "Discussion of RLC results and preparation for SLC. Guest speaker from local bank.",
                date: "2025-01-20T15:30:00Z",
                location: "Room 104 / Media Center",
                chapterId: "lincoln-high",
                type: "General"
            },
            {
                title: "Officer Board Meeting",
                description: "Planning for the FBLA Week events and fundraising goals.",
                date: "2025-02-05T07:30:00Z",
                location: "Advisor's Office",
                chapterId: "lincoln-high",
                type: "Officer"
            }
        ];
        await ctx.runMutation(api.init.seedDatabase, { type: "meetings", data: meetingData });

        // 6. Seed Results (Archives)
        const events = await ctx.runQuery(api.competitive_events.getEvents, {});
        const resultsData = [];
        for (const event of events) {
            resultsData.push(
                {
                    eventId: event._id,
                    year: 2024,
                    rank: 1,
                    winnerName: "Jane Doe",
                    schoolName: "Lincoln High School",
                    state: "NE",
                    level: "National"
                }
            );
        }
        await ctx.runMutation(api.init.seedDatabase, { type: "results", data: resultsData });

        console.log("Seeding complete!");
    },
});
