import type { anyApi } from "convex/server";

export declare const api: typeof anyApi;
export declare const internal: typeof anyApi;

// Re-exported from convex generated types.
// The sync-convex-client script copies real types from apps/convex.
// These fallback types are used when generated types aren't available.
export type { GenericId as Id } from "convex/values";
export type { GenericDocument as Doc } from "convex/server";
