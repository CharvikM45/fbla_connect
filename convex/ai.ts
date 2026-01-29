import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

export const chat = action({
    args: {
        message: v.string(),
        history: v.array(v.object({
            role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
            content: v.string(),
        })),
        mode: v.union(v.literal("standard"), v.literal("practice"), v.literal("grade")),
        eventContext: v.optional(v.string()), // e.g., "Mobile Application Development"
    },
    handler: async (ctx, args) => {
        let systemPrompt = "You are the FBLA Connect AI Assistant, an expert on Future Business Leaders of America (FBLA). ";
        systemPrompt += "Your goal is to help students succeed in competitions, learn about FBLA guidelines, and prepare for events. ";
        systemPrompt += "Be professional, encouraging, and accurate.\n\n";

        // Inject General FBLA Context
        systemPrompt += "### General FBLA Knowledge\n";
        systemPrompt += "- **Dress Code**: Professional business attire is required for all competitions. ";
        systemPrompt += "For males: Business suit with collar shirt, and necktie or sport coat, dress slacks, collar shirt, and necktie. ";
        systemPrompt += "For females: Business suit with blouse, business pantsuit with blouse, or skirt/dress with blouse.\n";
        systemPrompt += "- **National Conferences**: \n";
        systemPrompt += "  - NFLC: Nov 7-8, 2025 in Phoenix, AZ\n";
        systemPrompt += "  - NLC: June 29 - July 2, 2026 in San Antonio, TX\n\n";

        if (args.mode === "standard") {
            systemPrompt += "### Mode: Standard Information\n";
            systemPrompt += "Answer user questions about FBLA guidelines, events, and chapter operations. ";
            systemPrompt += "If they ask about specific events, refer to your general knowledge of FBLA competitions like Accounting, Business Law, Mobile App Dev, etc.\n";
        } else if (args.mode === "practice") {
            systemPrompt += `### Mode: Practice Preparation\n`;
            systemPrompt += `The user wants to practice for: ${args.eventContext || 'General FBLA Knowledge'}. `;
            systemPrompt += "Generate 3 high-quality multiple-choice questions (MCQs) related to this event. ";
            systemPrompt += "Include options A, B, C, D for each. ";
            systemPrompt += "Crucially, provide the Correct Answers and a brief explanation at the very end of your message.\n";
        } else if (args.mode === "grade") {
            systemPrompt += `### Mode: Presentation Grading\n`;
            systemPrompt += `The user is submitting a transcript/summary for: ${args.eventContext || 'a presentation event'}. `;
            systemPrompt += "Evaluate the submission against FBLA standards: content relevance, structure, and professional tone. ";
            systemPrompt += "Assign a score out of 100 and provide 3 specific points of feedback for improvement.\n";
        }

        const messages = [
            { role: "system", content: systemPrompt },
            ...args.history,
            { role: "user", content: args.message },
        ];

        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: messages as any,
                temperature: 0.7,
            });

            const content = response.choices[0].message.content || "I'm sorry, I couldn't generate a response.";

            // Generate suggestions based on the response
            const suggestionResponse = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "Generate 2-3 short follow-up suggestions for the user as a JSON array of strings under the key 'suggestions'. Example: { 'suggestions': ['How do I join?', 'Show deadlines'] }" },
                    { role: "user", content: content }
                ],
                response_format: { type: "json_object" }
            });

            let suggestions = [];
            try {
                const parsed = JSON.parse(suggestionResponse.choices[0].message.content || '{"suggestions": []}');
                suggestions = parsed.suggestions || [];
            } catch (e) {
                suggestions = ["Tell me more", "How do I start?"];
            }

            return {
                content,
                suggestions,
            };
        } catch (error) {
            console.error("OpenAI Error:", error);
            throw new Error("Failed to communicate with AI service.");
        }
    },
});
