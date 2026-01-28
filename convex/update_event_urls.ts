import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Helper to convert event title to PDF filename
function titleToPdfFilename(title: string): string {
    // Handle special cases first
    const specialMappings: Record<string, string> = {
        "Accounting": "Accounting.pdf",
        "Advanced Accounting": "Accounting-II.pdf",
        "Advertising": "Advertising.pdf",
        "Agribusiness": "Agribusiness.pdf",
        "Banking & Financial Systems": "Banking-and-Financial-Systems.pdf",
        "Broadcast Journalism": "Broadcast-Journalism.pdf",
        "Business Communication": "Business-Communication.pdf",
        "Business Ethics": "Business-Ethics.pdf",
        "Business Law": "Business-Law.pdf",
        "Business Management": "Business-Management.pdf",
        "Business Plan": "Business-Plan.pdf",
        "Career Portfolio": "Career-Portfolio.pdf",
        "Coding & Programming": "Coding-and-Programming.pdf",
        "Community Service Project": "Community-Service-Project.pdf",
        "Computer Applications": "Computer-Applications.pdf",
        "Computer Game & Simulation Programming": "Computer-Game-and-Simulation-Programming.pdf",
        "Computer Problem Solving": "Computer-Problem-Solving.pdf",
        "Customer Service": "Customer-Service.pdf",
        "Cybersecurity": "Cybersecurity.pdf",
        "Data Analysis": "Data-Analysis.pdf",
        "Data Science and AI": "Artificial-Intelligence-and-Machine-Learning.pdf",
        "Digital Animation": "Digital-Animation.pdf",
        "Digital Video Production": "Digital-Video-Production.pdf",
        "Economics": "Economics.pdf",
        "Entrepreneurship": "Entrepreneurship.pdf",
        "Event Planning": "Event-Planning.pdf",
        "Financial Planning": "Financial-Planning.pdf",
        "Financial Statement Analysis": "Financial-Statement-Analysis.pdf",
        "Future Business Educator": "Future-Business-Educator.pdf",
        "Future Business Leader": "Future-Business-Leader.pdf",
        "Graphic Design": "Graphic-Design.pdf",
        "Healthcare Administration": "Healthcare-Administration.pdf",
        "Hospitality & Event Management": "Hospitality-and-Event-Management.pdf",
        "Human Resource Management": "Human-Resource-Management.pdf",
        "Impromptu Speaking": "Impromptu-Speaking.pdf",
        "Insurance & Risk Management": "Insurance-and-Risk-Management.pdf",
        "International Business": "International-Business.pdf",
        "Job Interview": "Job-Interview.pdf",
        "Journalism": "Journalism.pdf",
        "Local Chapter Annual Business Report": "Local-Chapter-Annual-Business-Report.pdf",
        "Management Information Systems": "Management-Information-Systems.pdf",
        "Marketing": "Marketing.pdf",
        "Mobile Application Development": "Mobile-Application-Development.pdf",
        "Network Design": "Network-Design.pdf",
        "Networking Infrastructures": "Networking-Infrastructures.pdf",
        "Organizational Leadership": "Organizational-Leadership.pdf",
        "Parliamentary Procedure": "Parliamentary-Procedure.pdf",
        "Personal Finance": "Personal-Finance.pdf",
        "Project Management": "Project-Management.pdf",
        "Public Administration & Management": "Public-Administration-and-Management.pdf",
        "Public Service Announcement": "Public-Service-Announcement.pdf",
        "Public Speaking": "Public-Speaking.pdf",
        "Real Estate": "Real-Estate.pdf",
        "Retail Management": "Retail-Management.pdf",
        "Sales Presentation": "Sales-Presentation.pdf",
        "Securities & Investments": "Securities-and-Investments.pdf",
        "Social Media Strategies": "Social-Media-Strategies.pdf",
        "Sports & Entertainment Management": "Sports-and-Entertainment-Management.pdf",
        "Supply Chain Management": "Supply-Chain-Management.pdf",
        "Technology Support & Services": "Technology-Support-and-Services.pdf",
        "Use of Data in Business": "Use-of-Data-in-Business.pdf",
        "Visual Design": "Visual-Design.pdf",
        "Website Coding & Development": "Website-Coding-and-Development.pdf",
        "Website Design": "Website-Design.pdf",
        // 9th & 10th Grade events
        "Introduction to Business Concepts": "Introduction-to-Business-Concepts.pdf",
        "Introduction to Business Communication": "Introduction-to-Business-Communication.pdf",
        "Introduction to Business Presentation": "Introduction-to-Business-Presentation.pdf",
        "Introduction to Business Procedures": "Introduction-to-Business-Procedures.pdf",
        "Introduction to FBLA": "Introduction-to-FBLA.pdf",
        "Introduction to Information Technology": "Introduction-to-Information-Technology.pdf",
        "Introduction to Marketing Concepts": "Introduction-to-Marketing-Concepts.pdf",
        "Introduction to Parliamentary Procedure": "Introduction-to-Parliamentary-Procedure.pdf",
        "Introduction to Programming": "Introduction-to-Programming.pdf",
        "Introduction to Public Speaking": "Introduction-to-Public-Speaking.pdf",
        "Introduction to Retail & Merchandising": "Introduction-to-Retail-and-Merchandising.pdf",
        "Introduction to Social Media Strategy": "Introduction-to-Social-Media-Strategy.pdf",
        "Introduction to Supply Chain Management": "Introduction-to-Supply-Chain-Management.pdf",
    };

    if (specialMappings[title]) {
        return specialMappings[title];
    }

    // Default: convert spaces to hyphens, replace & with "and"
    return title.replace(/&/g, "and").replace(/\s+/g, "-") + ".pdf";
}

// Determine PDF category folder based on event category
function getCategoryFolder(category: string): string {
    const cat = category.toLowerCase();
    if (cat.includes("objective")) {
        return "Objective%20Tests";
    } else if (cat.includes("presentation") || cat.includes("interview")) {
        return "Presentation%20Events";
    } else if (cat.includes("role play")) {
        return "Role%20Play%20Events";
    } else if (cat.includes("production")) {
        return "Production%20Events";
    } else if (cat.includes("chapter")) {
        return "Chapter%20Events";
    }
    return "Objective%20Tests"; // Default fallback
}

// Generate study links based on event type
function getStudyLinks(title: string, category: string): { title: string; url: string }[] {
    const eventSlug = title.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "and");
    const links: { title: string; url: string }[] = [];

    // Quizlet link for most events
    links.push({
        title: `Quizlet: ${title}`,
        url: `https://quizlet.com/search?query=fbla-${eventSlug}&type=sets`
    });

    // Category-specific resources
    if (category.toLowerCase().includes("objective")) {
        links.push({
            title: "FBLA Practice Tests",
            url: "https://www.fbla-pbl.org/competitive-event-study-guides/"
        });
    }

    if (title.includes("Coding") || title.includes("Programming") || title.includes("Mobile Application") || title.includes("Website") || title.includes("Computer")) {
        links.push({
            title: "Codecademy Resources",
            url: "https://www.codecademy.com/"
        });
    }

    if (title.includes("Accounting") || title.includes("Finance") || title.includes("Economics")) {
        links.push({
            title: "Khan Academy: Finance & Economics",
            url: "https://www.khanacademy.org/economics-finance-domain"
        });
    }

    if (title.includes("Business") || title.includes("Management") || title.includes("Marketing")) {
        links.push({
            title: "Khan Academy: Business",
            url: "https://www.khanacademy.org/college-careers-more/entrepreneurship2"
        });
    }

    return links.slice(0, 3); // Return max 3 links
}

export const migrateEventUrls = mutation({
    args: {},
    handler: async (ctx) => {
        console.log("Starting event URL migration...");

        const events = await ctx.db.query("competitive_events").collect();
        let updatedCount = 0;

        for (const event of events) {
            // Skip Middle School events (different URL structure)
            if (event.division === "Middle School") {
                continue;
            }

            const categoryFolder = getCategoryFolder(event.category);
            const pdfFilename = titleToPdfFilename(event.title);

            const pdfUrl = `https://connect.fbla.org/headquarters/files/High%20School%20Competitive%20Events%20Resources/Individual%20Guidelines/${categoryFolder}/${pdfFilename}`;

            const linkUrl = `https://www.fbla.org/competitive-events/${event.title.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "")}/`;

            const studyLinks = getStudyLinks(event.title, event.category);

            await ctx.db.patch(event._id, {
                pdfUrl,
                linkUrl,
                studyLinks,
            });

            updatedCount++;
        }

        console.log(`Migration complete! Updated ${updatedCount} events.`);
        return { success: true, updatedCount };
    },
});

// Allow updating a single event's URLs manually if needed
export const updateEventUrl = mutation({
    args: {
        eventId: v.id("competitive_events"),
        pdfUrl: v.optional(v.string()),
        linkUrl: v.optional(v.string()),
        studyLinks: v.optional(v.array(v.object({
            title: v.string(),
            url: v.string(),
        }))),
    },
    handler: async (ctx, args) => {
        const { eventId, ...updates } = args;
        const filtered = Object.fromEntries(
            Object.entries(updates).filter(([_, v]) => v !== undefined)
        );
        await ctx.db.patch(eventId, filtered);
        return { success: true };
    },
});
