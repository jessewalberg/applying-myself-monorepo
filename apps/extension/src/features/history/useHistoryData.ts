import { useCallback, useState } from "react";
import { convexApi } from "@/services/convexApi";
import type { CoverLetter, ExtractedJob, JobApplication } from "@/types";

export const useHistoryData = () => {
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [extractedJobs, setExtractedJobs] = useState<ExtractedJob[]>([]);

  const loadHistory = useCallback(async () => {
    const [letters, jobAppsResult, extractedJobsResult] = await Promise.all([
      convexApi.getCoverLetters(),
      convexApi.getJobApplications(),
      convexApi.getExtractedJobs(),
    ]);

    setCoverLetters(letters);
    setJobApplications(jobAppsResult.jobApplications);
    setExtractedJobs(extractedJobsResult.jobs);

    return {
      coverLetters: letters,
      jobApplications: jobAppsResult.jobApplications,
      extractedJobs: extractedJobsResult.jobs,
    };
  }, []);

  return {
    coverLetters,
    jobApplications,
    extractedJobs,
    setCoverLetters,
    setJobApplications,
    setExtractedJobs,
    loadHistory,
  };
};
