import { useCallback } from "react";
import { convexApi } from "@/services/convexApi";
import type { ExtractedContent, Resume } from "@/types";
import type { CreateJobApplicationOptions } from "@/core/convex/jobsClient";

export const useGenerateCoverLetter = () => {
  const generate = useCallback(
    async (params: {
      selectedResume: Resume;
      extractedData: ExtractedContent;
      extractedJobId?: string | null;
      trackApplication?: boolean;
      applicationOptions?: CreateJobApplicationOptions;
      onProgress?: (content: string) => void;
    }) => {
      const response = await convexApi.generateCoverLetterFromContent(
        {
          resumeId: params.selectedResume.id,
          extractedContent: params.extractedData,
          tone: "professional",
          length: "medium",
        },
        params.onProgress
      );

      if (params.trackApplication && params.extractedJobId) {
        await convexApi.createJobApplicationFromExtracted(
          params.extractedJobId,
          params.applicationOptions || {}
        );
      }

      return response;
    },
    []
  );

  const retry = useCallback(
    async (coverLetterId: string, onProgress?: (content: string) => void) => {
      return await convexApi.retryCoverLetterGeneration(coverLetterId, onProgress);
    },
    []
  );

  return {
    generate,
    retry,
  };
};
