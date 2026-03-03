/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as adminSetup from "../adminSetup.js";
import type * as ai from "../ai.js";
import type * as billing from "../billing.js";
import type * as constants from "../constants.js";
import type * as coverLetters from "../coverLetters.js";
import type * as credits from "../credits.js";
import type * as emailResend from "../emailResend.js";
import type * as http from "../http.js";
import type * as jobApplications from "../jobApplications.js";
import type * as jobs from "../jobs.js";
import type * as resumes from "../resumes.js";
import type * as userHelpers from "../userHelpers.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  adminSetup: typeof adminSetup;
  ai: typeof ai;
  billing: typeof billing;
  constants: typeof constants;
  coverLetters: typeof coverLetters;
  credits: typeof credits;
  emailResend: typeof emailResend;
  http: typeof http;
  jobApplications: typeof jobApplications;
  jobs: typeof jobs;
  resumes: typeof resumes;
  userHelpers: typeof userHelpers;
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
