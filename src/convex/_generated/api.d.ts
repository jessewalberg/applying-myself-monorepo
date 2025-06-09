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
import type * as auth from "../auth.js";
import type * as billing from "../billing.js";
import type * as constants from "../constants.js";
import type * as coverLetters from "../coverLetters.js";
import type * as credits from "../credits.js";
import type * as http from "../http.js";
import type * as jobs from "../jobs.js";
import type * as lib_ai from "../lib/ai.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_stripe from "../lib/stripe.js";
import type * as resumes from "../resumes.js";
import type * as types from "../types.js";
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
  auth: typeof auth;
  billing: typeof billing;
  constants: typeof constants;
  coverLetters: typeof coverLetters;
  credits: typeof credits;
  http: typeof http;
  jobs: typeof jobs;
  "lib/ai": typeof lib_ai;
  "lib/auth": typeof lib_auth;
  "lib/stripe": typeof lib_stripe;
  resumes: typeof resumes;
  types: typeof types;
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
