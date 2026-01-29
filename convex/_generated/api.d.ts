/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai from "../ai.js";
import type * as competitive_events from "../competitive_events.js";
import type * as conferences from "../conferences.js";
import type * as init from "../init.js";
import type * as meetings from "../meetings.js";
import type * as news from "../news.js";
import type * as profiles from "../profiles.js";
import type * as seed from "../seed.js";
import type * as seed_all_events from "../seed_all_events.js";
import type * as seed_data from "../seed_data.js";
import type * as update_event_urls from "../update_event_urls.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  competitive_events: typeof competitive_events;
  conferences: typeof conferences;
  init: typeof init;
  meetings: typeof meetings;
  news: typeof news;
  profiles: typeof profiles;
  seed: typeof seed;
  seed_all_events: typeof seed_all_events;
  seed_data: typeof seed_data;
  update_event_urls: typeof update_event_urls;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
