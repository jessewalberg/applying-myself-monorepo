import { api } from "@app/convex-client";
import type { GenericId as Id } from "convex/values";
import CONFIG from "@/config";
import type { ExtractedContent } from "@/types";
import { convexClient, isConvexAuthenticated } from "./client";

export interface CreateJobApplicationOptions {
  status?: "applied" | "interviewing" | "offered" | "rejected" | "withdrawn";
  appliedDate?: number;
  notes?: string;
  resumeId?: string;
  coverLetterId?: string;
}

export const extractJobFromHTML = async (
  htmlContent: string,
  url: string,
  title: string
): Promise<ExtractedContent & { jobId: string; remainingCredits: number }> => {
  if (!isConvexAuthenticated()) {
    throw new Error("Authentication required");
  }

  if (CONFIG.ENVIRONMENT === "development") {
    console.log("🔍 Extracting job from HTML with AI:", { url, title });
  }

  return convexClient.action(api.jobs.extractFromHTML, {
    html: htmlContent,
    url,
    title,
  });
};

export const createJobApplicationFromExtracted = async (
  extractedJobId: string,
  options: CreateJobApplicationOptions = {}
) => {
  if (!isConvexAuthenticated()) {
    throw new Error("Authentication required");
  }

  return convexClient.mutation(api.jobApplications.createFromExtractedJob, {
    extractedJobId: extractedJobId as Id<"extractedJobs">,
    status: options.status,
    appliedDate: options.appliedDate,
    notes: options.notes,
    resumeId: options.resumeId as Id<"resumes"> | undefined,
    coverLetterId: options.coverLetterId as Id<"coverLetters"> | undefined,
  });
};

export const getJobApplications = async () => {
  if (!isConvexAuthenticated()) {
    throw new Error("Authentication required");
  }

  const result = await convexClient.query(api.jobApplications.getJobApplications, {});

  return {
    jobApplications: result.jobApplications || [],
    hasMore: result.hasMore || false,
  };
};

export const getExtractedJobs = async (limit?: number) => {
  if (!isConvexAuthenticated()) {
    throw new Error("Authentication required");
  }

  const result = await convexClient.query(api.jobs.getExtractedJobs, {
    limit: limit || 50,
  });

  return {
    jobs: result.jobs || [],
    hasMore: result.hasMore || false,
  };
};
