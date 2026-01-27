import { ConvexReactClient } from "convex/react";

// The Convex URL usually comes from EXPO_PUBLIC_CONVEX_URL
// For now, we provide a placeholder or use an environment variable
const CONVEX_URL = process.env.EXPO_PUBLIC_CONVEX_URL || "https://your-convex-app.convex.cloud";

export const convex = new ConvexReactClient(CONVEX_URL);
