import { useCallback, useState } from "react";
import { convexApi } from "@/services/convexApi";
import { executeInTab } from "@/core/chrome/scripting";
import { getCurrentTab, sendTabMessage } from "@/core/chrome/tabs";
import { getExtractedJobSnapshot, setExtractedJobSnapshot } from "@/core/storage/userStorage";
import type { ExtractedContent } from "@/types";
import type { MessageResponse } from "@/core/contracts/messages";

interface PageData {
  html: string;
  url: string;
  title: string;
}

export const useExtractJob = () => {
  const [extractedData, setExtractedData] = useState<ExtractedContent | null>(null);
  const [extractedJobId, setExtractedJobId] = useState<string | null>(null);

  const checkForExtractedContent = useCallback(async () => {
    const result = await getExtractedJobSnapshot();
    if (!result.lastExtractedJob || !result.extractionTimestamp) {
      return null;
    }

    const tenMinutes = 10 * 60 * 1000;
    const isRecent = Date.now() - result.extractionTimestamp < tenMinutes;

    if (!isRecent) {
      return null;
    }

    setExtractedData(result.lastExtractedJob);
    return result.lastExtractedJob;
  }, []);

  const extractFromActiveTab = useCallback(async () => {
    await convexApi.getUserProfile();

    const tab = await getCurrentTab();
    if (!tab.id) {
      throw new Error("No active tab found");
    }

    try {
      await sendTabMessage<MessageResponse>(tab.id, { type: "PING" });
    } catch {
      await executeInTab(tab.id, ["content.js"]);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const pageDataResponse = await sendTabMessage<MessageResponse<PageData>>(tab.id, {
      type: "GET_PAGE_DATA",
    });

    if (!pageDataResponse?.success || !pageDataResponse.data) {
      throw new Error(pageDataResponse?.error || "Failed to extract page data");
    }

    const pageData = pageDataResponse.data;
    const result = await convexApi.extractJobFromHTML(pageData.html, pageData.url, pageData.title);

    const newExtractedData: ExtractedContent = {
      title: result.title,
      company: result.company,
      location: result.location,
      description: result.description,
      requirements: result.requirements,
      salary: result.salary,
      type: result.type,
      postedDate: result.postedDate,
      url: result.url,
      confidence: result.confidence,
      pageType: result.pageType,
      domain: result.domain,
    };

    await setExtractedJobSnapshot({
      lastExtractedJob: newExtractedData,
      extractionTimestamp: Date.now(),
    });

    setExtractedData(newExtractedData);
    setExtractedJobId(result.jobId);

    return {
      extractedData: newExtractedData,
      extractedJobId: result.jobId,
      remainingCredits: result.remainingCredits,
    };
  }, []);

  return {
    extractedData,
    extractedJobId,
    setExtractedData,
    setExtractedJobId,
    checkForExtractedContent,
    extractFromActiveTab,
  };
};
