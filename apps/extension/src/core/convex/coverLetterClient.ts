import { api } from "@app/convex-client";
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

      const isPlaceholder = coverLetter.content.includes("Generating your personalized cover letter");
      if (!isPlaceholder) {
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

  const finalCoverLetter = await pollForCoverLetterCompletion(result.coverLetter._id, onProgress);

  return {
    coverLetter: {
      id: finalCoverLetter._id,
      userId: finalCoverLetter.userProfileId,
      extractedJobId: finalCoverLetter.extractedJobId || null,
      resumeId: finalCoverLetter.resumeId,
      jobTitle: finalCoverLetter.jobTitle || null,
      company: finalCoverLetter.company || null,
      content: finalCoverLetter.content,
      creditsUsed: finalCoverLetter.creditsUsed,
      preferences: finalCoverLetter.preferences ? JSON.stringify(finalCoverLetter.preferences) : null,
      createdAt: safeISOString(finalCoverLetter._creationTime),
    },
    tokensUsed: result.tokensUsed || 0,
    remainingCredits: result.remainingCredits || 0,
  };
};

export const getCoverLetters = async (): Promise<CoverLetter[]> => {
  if (!isConvexAuthenticated()) {
    throw new Error("Authentication required");
  }

  const result = await convexClient.query(api.coverLetters.getCoverLetters, {
    limit: 50,
  });

  return result.coverLetters.map((coverLetter: ConvexCoverLetterDoc) => ({
    id: coverLetter._id,
    userId: coverLetter.userProfileId,
    extractedJobId: coverLetter.extractedJobId || null,
    resumeId: coverLetter.resumeId,
    jobTitle: coverLetter.jobTitle || null,
    company: coverLetter.company || null,
    content: coverLetter.content,
    creditsUsed: coverLetter.creditsUsed,
    preferences: coverLetter.preferences ? JSON.stringify(coverLetter.preferences) : null,
    createdAt: safeISOString(coverLetter._creationTime),
  }));
};
