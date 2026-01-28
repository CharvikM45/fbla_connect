import { ConvexReactClient } from "convex/react";

// Get Convex URL from environment variables
// Set EXPO_PUBLIC_CONVEX_URL in your .env file
// For Expo, environment variables prefixed with EXPO_PUBLIC_ are available at build time
const CONVEX_URL = process.env.EXPO_PUBLIC_CONVEX_URL || "https://your-convex-app.convex.cloud";

if (!CONVEX_URL || CONVEX_URL === "https://your-convex-app.convex.cloud") {
    console.warn(
        "⚠️  Convex URL not configured. Please set EXPO_PUBLIC_CONVEX_URL in your .env file."
    );
}

export const convex = new ConvexReactClient(CONVEX_URL);
