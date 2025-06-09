/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as ai from "../ai.js";
import type * as auth from "../auth.js";
import type * as billing from "../billing.js";
import type * as constants from "../constants.js";
import type * as coverLetters from "../coverLetters.js";
import type * as credits from "../credits.js";
import type * as http from "../http.js";
import type * as jobs from "../jobs.js";
import type * as resumes from "../resumes.js";
import type * as types from "../types.js";
import type * as userHelpers from "../userHelpers.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  auth: typeof auth;
  billing: typeof billing;
  constants: typeof constants;
  coverLetters: typeof coverLetters;
  credits: typeof credits;
  http: typeof http;
  jobs: typeof jobs;
  resumes: typeof resumes;
  types: typeof types;
  userHelpers: typeof userHelpers;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
