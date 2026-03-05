import { ConvexHttpClient } from "convex/browser";
import type { GenericId as Id } from "convex/values";
import CONFIG from "@/config";

export type CoverLetterTone = "professional" | "casual" | "enthusiastic";
export type CoverLetterLength = "short" | "medium" | "long";

export interface ConvexResumeDoc {
  _id: Id<"resumes">;
  _creationTime: number;
  userProfileId: Id<"userProfiles">;
  filename: string;
  fileId: Id<"_storage">;
  fileSize: number;
  mimeType: string;
  extractedText?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ConvexCoverLetterDoc {
  _id: Id<"coverLetters">;
  _creationTime: number;
  userProfileId: Id<"userProfiles">;
  resumeId: Id<"resumes">;
  extractedJobId?: Id<"extractedJobs">;
  jobTitle?: string;
  company?: string;
  content: string;
  creditsUsed: number;
  preferences?: unknown;
}

export const convexClient = new ConvexHttpClient(CONFIG.CONVEX_URL);

let authToken: string | null = null;

export const setConvexAuthToken = (token: string): void => {
  authToken = token;
  convexClient.setAuth(token);
};

export const clearConvexAuthToken = (): void => {
  authToken = null;
  convexClient.clearAuth();
};

export const getConvexAuthToken = (): string | null => authToken;

export const isConvexAuthenticated = (): boolean => Boolean(authToken);

export const safeISOString = (timestamp: number): string => {
  try {
    if (!timestamp) return new Date().toISOString();
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return new Date().toISOString();
    return date.toISOString();
  } catch {
    return new Date().toISOString();
  }
};

export const isAuthFailureError = (error: unknown): boolean => {
  if (!(error instanceof Error)) return false;

  return (
    error.message?.includes("Unauthenticated") ||
    error.message?.includes("Could not verify token claim")
  );
};
