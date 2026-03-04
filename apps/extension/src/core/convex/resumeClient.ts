import { api } from "@applyingmyself/convex-client";
import type { GenericId as Id } from "convex/values";
import CONFIG from "@/config";
import type { Resume } from "@/types";
import { convexClient, ConvexResumeDoc, isConvexAuthenticated, safeISOString } from "./client";
import { getUserProfile } from "./authClient";

export const getResumes = async (): Promise<Resume[]> => {
  if (!isConvexAuthenticated()) {
    throw new Error("Authentication required");
  }

  const result = await convexClient.query(api.resumes.getResumes, {
    limit: 50,
  });

  return result.resumes.map((resume: ConvexResumeDoc) => ({
    id: resume._id,
    userId: resume.userProfileId,
    filename: resume.filename,
    url: resume.fileId,
    createdAt: safeISOString(resume._creationTime),
    updatedAt: safeISOString(resume.updatedAt),
  }));
};

export const getResumeDownloadUrl = async (resumeId: string): Promise<string | null> => {
  if (!isConvexAuthenticated()) {
    throw new Error("Authentication required");
  }

  return convexClient.query(api.resumes.getDownloadUrl, {
    resumeId: resumeId as Id<"resumes">,
  });
};

export const uploadResume = async (
  file: File
): Promise<{ resume: Resume; remainingCredits: number }> => {
  if (!isConvexAuthenticated()) {
    throw new Error("Authentication required");
  }

  if (CONFIG.ENVIRONMENT === "development") {
    console.log("📄 Uploading resume:", file.name);
  }

  const uploadResult = await convexClient.mutation(api.resumes.upload, {
    filename: file.name,
    fileSize: file.size,
    mimeType: file.type,
  });

  const uploadFormData = new FormData();
  uploadFormData.append("file", file);

  const uploadResponse = await fetch(uploadResult.uploadUrl, {
    method: "POST",
    body: uploadFormData,
  });

  if (!uploadResponse.ok) {
    throw new Error("Failed to upload file to storage");
  }

  const uploadResponseData = await uploadResponse.json();
  const storageId = uploadResponseData.storageId;

  if (!storageId) {
    throw new Error("No storage ID returned from upload");
  }

  const completeResult = await convexClient.mutation(api.resumes.completeUpload, {
    storageId,
    filename: file.name,
    fileSize: file.size,
    mimeType: file.type,
  });

  const userProfile = await getUserProfile();

  const resumeData: Resume = {
    id: completeResult.resumeId,
    userId: userProfile._id,
    filename: file.name,
    url: `resume_${completeResult.resumeId}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (CONFIG.ENVIRONMENT === "development") {
    console.log("✅ Resume uploaded successfully, text extraction scheduled");
  }

  return {
    resume: resumeData,
    remainingCredits: completeResult.remainingCredits,
  };
};
