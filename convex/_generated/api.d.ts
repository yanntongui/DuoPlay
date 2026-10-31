/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as accounts from "../accounts.js";
import type * as activity from "../activity.js";
import type * as analytics from "../analytics.js";
import type * as cards from "../cards.js";
import type * as categories from "../categories.js";
import type * as collections from "../collections.js";
import type * as consents from "../consents.js";
import type * as couples from "../couples.js";
import type * as crons from "../crons.js";
import type * as daily from "../daily.js";
import type * as dice from "../dice.js";
import type * as events from "../events.js";
import type * as experiences from "../experiences.js";
import type * as favorites from "../favorites.js";
import type * as history from "../history.js";
import type * as journal from "../journal.js";
import type * as journeys from "../journeys.js";
import type * as lib_admin from "../lib/admin.js";
import type * as lib_dates from "../lib/dates.js";
import type * as lib_events from "../lib/events.js";
import type * as lib_identity from "../lib/identity.js";
import type * as lib_notify from "../lib/notify.js";
import type * as lib_personalization from "../lib/personalization.js";
import type * as lib_ratelimit from "../lib/ratelimit.js";
import type * as maintenance from "../maintenance.js";
import type * as notifications from "../notifications.js";
import type * as preferences from "../preferences.js";
import type * as presence from "../presence.js";
import type * as profiles from "../profiles.js";
import type * as questions from "../questions.js";
import type * as reports from "../reports.js";
import type * as roue from "../roue.js";
import type * as sessions from "../sessions.js";
import type * as stats from "../stats.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  accounts: typeof accounts;
  activity: typeof activity;
  analytics: typeof analytics;
  cards: typeof cards;
  categories: typeof categories;
  collections: typeof collections;
  consents: typeof consents;
  couples: typeof couples;
  crons: typeof crons;
  daily: typeof daily;
  dice: typeof dice;
  events: typeof events;
  experiences: typeof experiences;
  favorites: typeof favorites;
  history: typeof history;
  journal: typeof journal;
  journeys: typeof journeys;
  "lib/admin": typeof lib_admin;
  "lib/dates": typeof lib_dates;
  "lib/events": typeof lib_events;
  "lib/identity": typeof lib_identity;
  "lib/notify": typeof lib_notify;
  "lib/personalization": typeof lib_personalization;
  "lib/ratelimit": typeof lib_ratelimit;
  maintenance: typeof maintenance;
  notifications: typeof notifications;
  preferences: typeof preferences;
  presence: typeof presence;
  profiles: typeof profiles;
  questions: typeof questions;
  reports: typeof reports;
  roue: typeof roue;
  sessions: typeof sessions;
  stats: typeof stats;
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
