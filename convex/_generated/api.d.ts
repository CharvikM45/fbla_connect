/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as competitive_events from "../competitive_events.js";
import type * as conferences from "../conferences.js";
import type * as init from "../init.js";
import type * as meetings from "../meetings.js";
import type * as news from "../news.js";
import type * as profiles from "../profiles.js";
import type * as seed_data from "../seed_data.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  competitive_events: typeof competitive_events;
  conferences: typeof conferences;
  init: typeof init;
  meetings: typeof meetings;
  news: typeof news;
  profiles: typeof profiles;
  seed_data: typeof seed_data;
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
