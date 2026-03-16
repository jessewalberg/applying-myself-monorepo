import { api } from "@applyingmyself/convex-client";
import type { GenericId as Id } from "convex/values";
import CONFIG from "@/config";
import type { CoverLetter, GenerateCoverLetterFromContentRequest, GenerateCoverLetterResponse } from "@/types";
import {
  convexClient,
  ConvexCoverLetterDoc,
  CoverLetterLength,
  CoverLetterTone,
  isConvexAuthenticated,
  safeISOString,
} from "./client";

const mapCoverLetter = (coverLetter: ConvexCoverLetterDoc): CoverLetter => ({
  id: coverLetter._id,
  userId: coverLetter.userProfileId,
  extractedJobId: coverLetter.extractedJobId || null,
  resumeId: coverLetter.resumeId,
  jobTitle: coverLetter.jobTitle || null,
  company: coverLetter.company || null,
  jobDescription: coverLetter.jobDescription || null,
  content: coverLetter.content,
  generationStatus: coverLetter.generationStatus,
  generationError: coverLetter.generationError || null,
  generationAttempts: coverLetter.generationAttempts,
  lastGenerationAttemptAt: coverLetter.lastGenerationAttemptAt
    ? safeISOString(coverLetter.lastGenerationAttemptAt)
    : null,
  tokensUsed: coverLetter.tokensUsed ?? null,
  creditsUsed: coverLetter.creditsUsed,
  preferences: coverLetter.preferences ? JSON.stringify(coverLetter.preferences) : null,
  createdAt: safeISOString(coverLetter._creationTime),
});

export class CoverLetterGenerationError extends Error {
  coverLetterId: string | null;

  constructor(message: string, coverLetterId: string | null = null) {
    super(message);
    this.name = "CoverLetterGenerationError";
    this.coverLetterId = coverLetterId;
  }
}

const pollForCoverLetterCompletion = async (
  coverLetterId: string,
  onProgress?: (content: string) => void,
  maxAttempts = 20
): Promise<ConvexCoverLetterDoc> => {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const coverLetter = await convexClient.query(api.coverLetters.getCoverLetter, {
        coverLetterId: coverLetterId as Id<"coverLetters">,
      });

      if (!coverLetter) {
        throw new Error("Cover letter not found");
      }

      if (coverLetter.generationStatus === "failed") {
        throw new Error(coverLetter.generationError || "Cover letter generation failed");
      }

      const isPlaceholder = coverLetter.content.includes("Generating your personalized cover letter");
      if (coverLetter.generationStatus === "completed" && !isPlaceholder) {
        if (CONFIG.ENVIRONMENT === "development") {
          console.log("✅ Cover letter generation completed after", attempt + 1, "attempts");
        }
        return coverLetter;
      }

      onProgress?.(coverLetter.content);
      const delay = Math.min(1000 + attempt * 500, 3000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    } catch (error) {
      console.error(`❌ Polling attempt ${attempt + 1} failed:`, error);
      if (attempt === maxAttempts - 1) {
        throw error;
      }
    }
  }

  throw new Error("Cover letter generation timed out. Please try again.");
};

export const generateCoverLetterFromContent = async (
  data: GenerateCoverLetterFromContentRequest,
  onProgress?: (content: string) => void
): Promise<GenerateCoverLetterResponse> => {
  if (!isConvexAuthenticated()) {
    throw new Error("Authentication required");
  }

  if (CONFIG.ENVIRONMENT === "development") {
    console.log("✍️ Generating cover letter for:", data.extractedContent.company);
  }

  const result = await convexClient.mutation(api.coverLetters.generate, {
    resumeId: data.resumeId as Id<"resumes">,
    extractedContent: data.extractedContent,
    preferences: {
      tone: (data.tone as CoverLetterTone) || "professional",
      length: (data.length as CoverLetterLength) || "medium",
    },
  });

  if (!result.coverLetter) {
    throw new Error("Cover letter generation failed");
  }

  onProgress?.(result.coverLetter.content);

  let finalCoverLetter: ConvexCoverLetterDoc;
  try {
    finalCoverLetter = await pollForCoverLetterCompletion(result.coverLetter._id, onProgress);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Cover letter generation failed";
    throw new CoverLetterGenerationError(message, result.coverLetter._id);
  }

  return {
    coverLetter: mapCoverLetter(finalCoverLetter),
    tokensUsed: result.tokensUsed || 0,
    remainingCredits: result.remainingCredits || 0,
  };
};

export const retryCoverLetterGeneration = async (
  coverLetterId: string,
  onProgress?: (content: string) => void
): Promise<GenerateCoverLetterResponse> => {
  if (!isConvexAuthenticated()) {
    throw new Error("Authentication required");
  }

  const result = await convexClient.mutation(api.coverLetters.retryGeneration, {
    coverLetterId: coverLetterId as Id<"coverLetters">,
  });

  let finalCoverLetter: ConvexCoverLetterDoc;
  try {
    finalCoverLetter = await pollForCoverLetterCompletion(result.coverLetter._id, onProgress);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Cover letter generation failed";
    throw new CoverLetterGenerationError(message, result.coverLetter._id);
  }

  return {
    coverLetter: mapCoverLetter(finalCoverLetter),
    tokensUsed: finalCoverLetter.tokensUsed || 0,
    remainingCredits: 0,
  };
};

export const getCoverLetters = async (): Promise<CoverLetter[]> => {
  if (!isConvexAuthenticated()) {
    throw new Error("Authentication required");
  }

  const result = await convexClient.query(api.coverLetters.getCoverLetters, {
    limit: 50,
  });

  return result.coverLetters.map((coverLetter: ConvexCoverLetterDoc) => mapCoverLetter(coverLetter));
};
