import { mutation, action } from "./_generated/server";
import { api } from "./_generated/api";

// Helper to convert event title to PDF filename
function titleToPdfFilename(title: string): string {
    // Handle special cases first
    const specialMappings: Record<string, string> = {
        "Accounting": "Accounting-I.pdf",
        "Advanced Accounting": "Accounting-II.pdf",
        "Accounting I": "Accounting-I.pdf",
        "Accounting II": "Accounting-II.pdf",
        "Data Science and AI": "Artificial-Intelligence-and-Machine-Learning.pdf",
    };

    if (specialMappings[title]) {
        return specialMappings[title];
    }

    // Default: convert spaces to hyphens, replace & with "and"
    return title.replace(/&/g, "and").replace(/\s+/g, "-") + ".pdf";
}

// Determine PDF category folder based on event category
function getCategoryFolder(category: string, title: string): string {
    const cat = category.toLowerCase();

    // Chapter events have their own folder
    if (cat.includes("chapter")) {
        return "Chapter%20Events";
    }

    // Role play events
    if (cat.includes("role play") && !cat.includes("objective")) {
        return "Role%20Play%20Events";
    }

    // Mixed events - determine by primary type
    if (cat.includes("objective") && cat.includes("role play")) {
        return "Role%20Play%20Events";
    }

    // Production events
    if (cat.includes("production") && !cat.includes("presentation")) {
        return "Production%20Events";
    }

    // Presentation events (including interview, production & presentation)
    if (cat.includes("presentation") || cat.includes("interview")) {
        return "Presentation%20Events";
    }

    // Default to objective tests
    return "Objective%20Tests";
}

// Get base URL for division
function getDivisionBaseUrl(division: string): string {
    if (division === "Middle School") {
        return "https://connect.fbla.org/headquarters/files/Middle%20School%20Competitive%20Events%20Resources/Individual%20Guidelines";
    }
    // Both High School and 9th & 10th Grade use High School resources
    return "https://connect.fbla.org/headquarters/files/High%20School%20Competitive%20Events%20Resources/Individual%20Guidelines";
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

    if (title.includes("Coding") || title.includes("Programming") || title.includes("Mobile Application") ||
        title.includes("Website") || title.includes("Computer") || title.includes("Technology")) {
        links.push({
            title: "Codecademy Resources",
            url: "https://www.codecademy.com/"
        });
    }

    if (title.includes("Accounting") || title.includes("Finance") || title.includes("Economics") ||
        title.includes("Securities") || title.includes("Banking")) {
        links.push({
            title: "Khan Academy: Finance & Economics",
            url: "https://www.khanacademy.org/economics-finance-domain"
        });
    }

    if (title.includes("Business") || title.includes("Management") || title.includes("Marketing") ||
        title.includes("Entrepreneur")) {
        links.push({
            title: "Khan Academy: Entrepreneurship",
            url: "https://www.khanacademy.org/college-careers-more/entrepreneurship2"
        });
    }

    return links.slice(0, 3); // Return max 3 links
}

// All competitive events data
const ALL_EVENTS = [
    // ==================== HIGH SCHOOL EVENTS ====================
    { title: "Accounting", category: "Objective Test", division: "High School", description: "Individual event focused on fundamental accounting principles." },
    { title: "Advanced Accounting", category: "Objective Test", division: "High School", description: "Individual event covering corporate and managerial accounting." },
    { title: "Advertising", category: "Objective Test", division: "High School", description: "Individual event covering the principles and practices of advertising." },
    { title: "Agribusiness", category: "Objective Test", division: "High School", description: "Individual event focused on the business aspects of agriculture." },
    { title: "Banking & Financial Systems", category: "Objective Test & Role Play", division: "High School", description: "Team event testing knowledge of banking and finance through a performance and test." },
    { title: "Broadcast Journalism", category: "Presentation", division: "High School", description: "Delivering news stories in a broadcast format." },
    { title: "Business Communication", category: "Objective Test", division: "High School", description: "Individual event testing written and oral communication skills in business." },
    { title: "Business Ethics", category: "Presentation", division: "High School", description: "Team event involving the presentation of an ethical solution to a business problem." },
    { title: "Business Law", category: "Objective Test", division: "High School", description: "Individual event focused on legal principles affecting business." },
    { title: "Business Management", category: "Objective Test", division: "High School", description: "Individual event covering management theories and applications." },
    { title: "Business Plan", category: "Presentation", division: "High School", description: "Team event involving the development and presentation of a business plan." },
    { title: "Career Portfolio", category: "Presentation", division: "High School", description: "Individual event showcasing professional assets and career planning." },
    { title: "Coding & Programming", category: "Production & Presentation", division: "High School", description: "Individual or team event testing software development and programming skills." },
    { title: "Community Service Project", category: "Chapter", division: "High School", description: "Showcase a service that addresses a need within a school or community." },
    { title: "Computer Applications", category: "Production & Objective Test", division: "High School", description: "Individual event demonstrating proficiency in word processing and spreadsheets." },
    { title: "Computer Game & Simulation Programming", category: "Presentation", division: "High School", description: "Design and develop interactive simulation." },
    { title: "Computer Problem Solving", category: "Objective Test", division: "High School", description: "Individual event solving hardware and software problems." },
    { title: "Customer Service", category: "Objective Test & Role Play", division: "High School", description: "Demonstrate ability to deliver exceptional service in a professional setting." },
    { title: "Cybersecurity", category: "Objective Test", division: "High School", description: "Individual event testing knowledge of security threats and data protection." },
    { title: "Data Analysis", category: "Presentation", division: "High School", description: "Individual or team event analyzing data to solve a business problem." },
    { title: "Data Science and AI", category: "Objective Test", division: "High School", description: "Demonstrate understanding of data analysis, machine learning, and AI." },
    { title: "Digital Animation", category: "Presentation", division: "High School", description: "Creating animated content for business." },
    { title: "Digital Video Production", category: "Presentation", division: "High School", description: "Producing video content for a specific topic." },
    { title: "Economics", category: "Objective Test", division: "High School", description: "Individual event covering micro and macro economics." },
    { title: "Entrepreneurship", category: "Objective Test & Role Play", division: "High School", description: "Team event simulating the creation and management of a new business venture." },
    { title: "Event Planning", category: "Presentation", division: "High School", description: "Demonstrate knowledge of event planning industry." },
    { title: "Financial Planning", category: "Presentation", division: "High School", description: "Analyze a family scenario and develop a plan to help them meet financial goals." },
    { title: "Financial Statement Analysis", category: "Objective Test", division: "High School", description: "Analyzing financial reports." },
    { title: "Future Business Educator", category: "Presentation", division: "High School", description: "Explore a career in business by teaching information about the career." },
    { title: "Future Business Leader", category: "Objective Test & Interview", division: "High School", description: "FBLA's premier event recognizing leadership and business knowledge." },
    { title: "Graphic Design", category: "Presentation", division: "High School", description: "Individual or team event focused on visual communication and layout." },
    { title: "Healthcare Administration", category: "Objective Test", division: "High School", description: "Individual event on managing healthcare facilities and systems." },
    { title: "Hospitality & Event Management", category: "Objective Test & Role Play", division: "High School", description: "Team event testing knowledge of the hospitality industry and event planning." },
    { title: "Human Resource Management", category: "Objective Test", division: "High School", description: "Individual event on hiring, training, and managing employees." },
    { title: "Impromptu Speaking", category: "Presentation", division: "High School", description: "Individual event delivering a speech on a randomly selected topic." },
    { title: "Insurance & Risk Management", category: "Objective Test", division: "High School", description: "Individual event covering types of insurance and risk assessment." },
    { title: "International Business", category: "Objective Test & Role Play", division: "High School", description: "Team event focused on global business concepts and cultural awareness." },
    { title: "Job Interview", category: "Presentation & Interview", division: "High School", description: "Individual event simulating the job application and interview process." },
    { title: "Journalism", category: "Objective Test", division: "High School", description: "Individual event testing knowledge of media history, ethics, and writing." },
    { title: "Local Chapter Annual Business Report", category: "Chapter", division: "High School", description: "Present program of work and accomplishments for the year." },
    { title: "Management Information Systems", category: "Objective Test & Role Play", division: "High School", description: "Team event testing technical and management skills in information systems." },
    { title: "Marketing", category: "Objective Test & Role Play", division: "High School", description: "Team event simulating marketing strategy and presentation." },
    { title: "Mobile Application Development", category: "Production & Presentation", division: "High School", description: "Individual or team event to design and develop a mobile app." },
    { title: "Network Design", category: "Objective Test & Role Play", division: "High School", description: "Team event resolving network infrastructure problems." },
    { title: "Networking Infrastructures", category: "Objective Test", division: "High School", description: "Individual event focused on computer networks and technical troubleshooting." },
    { title: "Organizational Leadership", category: "Objective Test", division: "High School", description: "Individual event on leadership theories and practices." },
    { title: "Parliamentary Procedure", category: "Objective Test & Role Play", division: "High School", description: "Team event demonstrating proper meeting conduct." },
    { title: "Personal Finance", category: "Objective Test", division: "High School", description: "Individual event on managing personal finances." },
    { title: "Project Management", category: "Objective Test", division: "High School", description: "Demonstrate understanding of key project management concepts." },
    { title: "Public Administration & Management", category: "Objective Test", division: "High School", description: "Demonstrate understanding of how government functions and its role in society." },
    { title: "Public Service Announcement", category: "Presentation", division: "High School", description: "Video presentation on a social issue." },
    { title: "Public Speaking", category: "Presentation", division: "High School", description: "Individual event involving a prepared speech on business-related topics." },
    { title: "Real Estate", category: "Objective Test", division: "High School", description: "Demonstrate understanding of real estate industry." },
    { title: "Retail Management", category: "Objective Test", division: "High School", description: "Demonstrate understanding of core retail operations." },
    { title: "Sales Presentation", category: "Presentation", division: "High School", description: "Individual event focused on selling a product or service." },
    { title: "Securities & Investments", category: "Objective Test", division: "High School", description: "Individual event on investment vehicles and markets." },
    { title: "Social Media Strategies", category: "Presentation", division: "High School", description: "Team event focused on creating and presenting a social media campaign." },
    { title: "Sports & Entertainment Management", category: "Objective Test & Role Play", division: "High School", description: "Team event covering management in the sports and entertainment industries." },
    { title: "Supply Chain Management", category: "Objective Test", division: "High School", description: "Individual event on the logistics and movement of goods." },
    { title: "Technology Support & Services", category: "Objective Test & Role Play", division: "High School", description: "Demonstrate understanding of the business aspects of technology support." },
    { title: "Use of Data in Business", category: "Objective Test", division: "High School", description: "Understanding data utility." },
    { title: "Visual Design", category: "Presentation", division: "High School", description: "Event focused on design principles." },
    { title: "Website Coding & Development", category: "Presentation", division: "High School", description: "Design and build a website based on a specific topic." },
    { title: "Website Design", category: "Production & Presentation", division: "High School", description: "Individual or team event to design and build a functional website." },

    // ==================== 9TH & 10TH GRADE EVENTS ====================
    { title: "Introduction to Business Concepts", category: "Objective Test", division: "9th & 10th Grade", description: "Introductory event covering basic business principles." },
    { title: "Introduction to Business Communication", category: "Objective Test", division: "9th & 10th Grade", description: "Introductory event for younger members on business communication." },
    { title: "Introduction to Business Presentation", category: "Presentation", division: "9th & 10th Grade", description: "Develop a business-focused presentation using presentation software." },
    { title: "Introduction to Business Procedures", category: "Objective Test", division: "9th & 10th Grade", description: "Introductory event on office procedures and etiquette." },
    { title: "Introduction to FBLA", category: "Objective Test", division: "9th & 10th Grade", description: "Test on FBLA history, bylaws, and programs." },
    { title: "Introduction to Information Technology", category: "Objective Test", division: "9th & 10th Grade", description: "Introductory event on IT concepts." },
    { title: "Introduction to Marketing Concepts", category: "Objective Test", division: "9th & 10th Grade", description: "Basics of marketing." },
    { title: "Introduction to Parliamentary Procedure", category: "Objective Test", division: "9th & 10th Grade", description: "Introductory event on rules of order." },
    { title: "Introduction to Programming", category: "Objective Test", division: "9th & 10th Grade", description: "Basics of coding." },
    { title: "Introduction to Public Speaking", category: "Presentation", division: "9th & 10th Grade", description: "Prepared speech for younger members." },
    { title: "Introduction to Retail & Merchandising", category: "Objective Test", division: "9th & 10th Grade", description: "Demonstrate understanding of basic principles in retail operations." },
    { title: "Introduction to Social Media Strategy", category: "Presentation", division: "9th & 10th Grade", description: "Develop a marketing strategy centered around a single social media platform." },
    { title: "Introduction to Supply Chain Management", category: "Objective Test", division: "9th & 10th Grade", description: "Demonstrate understanding of processes in flow of goods and supply chain." },

    // ==================== MIDDLE SCHOOL EVENTS ====================
    { title: "Annual Chapter Activities Presentation", category: "Chapter", division: "Middle School", description: "Present chapter activities and accomplishments." },
    { title: "Career Exploration", category: "Objective Test", division: "Middle School", description: "Explore career options and planning." },
    { title: "Career Research", category: "Presentation", division: "Middle School", description: "Research and present a business career." },
    { title: "Community Service Presentation", category: "Chapter", division: "Middle School", description: "Showcase community service projects." },
    { title: "Digital Citizenship", category: "Objective Test", division: "Middle School", description: "Understanding digital rights and responsibilities." },
    { title: "Exploring Accounting & Finance", category: "Objective Test", division: "Middle School", description: "Introduction to accounting and finance concepts." },
    { title: "Exploring Agribusiness", category: "Objective Test", division: "Middle School", description: "Introduction to agricultural business." },
    { title: "Exploring Animation", category: "Presentation", division: "Middle School", description: "Create animated content." },
    { title: "Exploring Business Communication", category: "Objective Test", division: "Middle School", description: "Introduction to business communication skills." },
    { title: "Exploring Business Concepts", category: "Objective Test", division: "Middle School", description: "Introduction to basic business principles." },
    { title: "Exploring Business Ethics", category: "Presentation", division: "Middle School", description: "Understanding ethical business practices." },
    { title: "Exploring Coding & Programming", category: "Presentation", division: "Middle School", description: "Introduction to coding skills." },
    { title: "Exploring Computer Science", category: "Objective Test", division: "Middle School", description: "Introduction to computer science concepts." },
    { title: "Exploring Customer Service", category: "Role Play", division: "Middle School", description: "Practice customer service skills." },
    { title: "Exploring Digital Video Production", category: "Presentation", division: "Middle School", description: "Create video content." },
    { title: "Exploring Economics", category: "Objective Test", division: "Middle School", description: "Introduction to economic concepts." },
    { title: "Exploring FBLA", category: "Objective Test", division: "Middle School", description: "Learn about FBLA organization and history." },
    { title: "Exploring Leadership", category: "Objective Test", division: "Middle School", description: "Introduction to leadership concepts." },
    { title: "Exploring Management & Entrepreneurship", category: "Role Play", division: "Middle School", description: "Practice management and entrepreneurship skills." },
    { title: "Exploring Marketing Concepts", category: "Objective Test", division: "Middle School", description: "Introduction to marketing principles." },
    { title: "Exploring Marketing Strategies", category: "Presentation", division: "Middle School", description: "Develop marketing strategy presentations." },
    { title: "Exploring Parliamentary Procedure", category: "Objective Test", division: "Middle School", description: "Introduction to rules of order." },
    { title: "Exploring Personal Finance", category: "Objective Test", division: "Middle School", description: "Introduction to personal finance management." },
    { title: "Exploring Professionalism", category: "Objective Test", division: "Middle School", description: "Understanding professional behavior and etiquette." },
    { title: "Exploring Public Speaking", category: "Presentation", division: "Middle School", description: "Develop public speaking skills." },
    { title: "Exploring Technology", category: "Objective Test", division: "Middle School", description: "Introduction to technology concepts." },
    { title: "Exploring Website Design", category: "Presentation", division: "Middle School", description: "Create website designs." },
    { title: "Interpersonal Communication", category: "Objective Test", division: "Middle School", description: "Understanding interpersonal communication skills." },
    { title: "Slide Deck Applications", category: "Production", division: "Middle School", description: "Create presentation slide decks." },
    { title: "Spreadsheet Applications", category: "Production", division: "Middle School", description: "Demonstrate spreadsheet proficiency." },
    { title: "Word Processing", category: "Production", division: "Middle School", description: "Demonstrate word processing skills." },
];

// Mutation to insert a single event
const insertEvent = async (ctx: any, event: typeof ALL_EVENTS[0]) => {
    const baseUrl = getDivisionBaseUrl(event.division);
    const categoryFolder = getCategoryFolder(event.category, event.title);
    const pdfFilename = titleToPdfFilename(event.title);

    const pdfUrl = `${baseUrl}/${categoryFolder}/${pdfFilename}`;
    const linkUrl = `https://www.fbla.org/competitive-events/${event.title.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "")}/`;
    const studyLinks = getStudyLinks(event.title, event.category);

    return ctx.db.insert("competitive_events", {
        title: event.title,
        category: event.category,
        division: event.division,
        description: event.description,
        pdfUrl,
        linkUrl,
        studyLinks,
    });
};

// Main seed mutation - clears and repopulates all events
export const seedAllEvents = mutation({
    args: {},
    handler: async (ctx) => {
        console.log("Starting to seed all competitive events...");

        // First, delete all existing events
        const existingEvents = await ctx.db.query("competitive_events").collect();
        for (const event of existingEvents) {
            await ctx.db.delete(event._id);
        }
        console.log(`Deleted ${existingEvents.length} existing events`);

        // Insert all events
        let insertedCount = 0;
        for (const event of ALL_EVENTS) {
            await insertEvent(ctx, event);
            insertedCount++;
        }

        console.log(`Successfully seeded ${insertedCount} competitive events!`);
        return { success: true, insertedCount };
    },
});
