import { ConvexReactClient } from "convex/react";

// Get Convex URL from environment variables
// Expo automatically loads .env.local files
// Set EXPO_PUBLIC_CONVEX_URL in your .env.local file
// For Expo, environment variables prefixed with EXPO_PUBLIC_ are available at build time
const CONVEX_URL = process.env.EXPO_PUBLIC_CONVEX_URL || "https://your-convex-app.convex.cloud";

// Only warn in development
if (__DEV__ && (!CONVEX_URL || CONVEX_URL === "https://your-convex-app.convex.cloud")) {
    console.warn(
        "⚠️  Convex URL not configured. Please set EXPO_PUBLIC_CONVEX_URL in your .env.local file."
    );
}

export const convex = new ConvexReactClient(CONVEX_URL);
