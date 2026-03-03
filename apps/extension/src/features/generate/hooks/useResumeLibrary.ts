import { useCallback, useState } from "react";
import { convexApi } from "@/services/convexApi";
import type { Resume } from "@/types";

export const useResumeLibrary = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);

  const loadResumes = useCallback(async () => {
    const resumeList = await convexApi.getResumes();
    setResumes(resumeList);

    if (resumeList.length > 0 && !selectedResume) {
      setSelectedResume(resumeList[0]);
    }

    return resumeList;
  }, [selectedResume]);

  const uploadResume = useCallback(async (file: File) => {
    const result = await convexApi.uploadResume(file);
    const updated = await convexApi.getResumes();
    setResumes(updated);

    if (result.resume) {
      setSelectedResume(result.resume);
    }

    return result;
  }, []);

  const getDownloadUrl = useCallback(async (resumeId: string) => {
    return convexApi.getResumeDownloadUrl(resumeId);
  }, []);

  return {
    resumes,
    selectedResume,
    setSelectedResume,
    loadResumes,
    uploadResume,
    getDownloadUrl,
  };
};
