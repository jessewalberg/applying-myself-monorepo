import type { User, UserSettings, ExtractedContent } from "@/types";
import { STORAGE_SCHEMA_VERSION, type StorageSchemaV1 } from "./schema";

export const setUserData = async (userData: User): Promise<void> => {
  await chrome.storage.local.set({ userData, schemaVersion: STORAGE_SCHEMA_VERSION });
};

export const getUserData = async (): Promise<User | undefined> => {
  const result = (await chrome.storage.local.get(["userData"])) as Pick<StorageSchemaV1, "userData">;
  return result.userData;
};

export const setExtractedJobSnapshot = async (payload: {
  lastExtractedJob: ExtractedContent;
  extractionTimestamp: number;
}): Promise<void> => {
  await chrome.storage.local.set({ ...payload, schemaVersion: STORAGE_SCHEMA_VERSION });
};

export const getExtractedJobSnapshot = async (): Promise<{
  lastExtractedJob?: ExtractedContent;
  extractionTimestamp?: number;
}> => {
  const result = (await chrome.storage.local.get([
    "lastExtractedJob",
    "extractionTimestamp",
  ])) as Pick<StorageSchemaV1, "lastExtractedJob" | "extractionTimestamp">;

  return {
    lastExtractedJob: result.lastExtractedJob,
    extractionTimestamp: result.extractionTimestamp,
  };
};

export const setSettings = async (settings: UserSettings): Promise<void> => {
  await chrome.storage.sync.set({ settings });
};

export const getSettings = async (): Promise<UserSettings | undefined> => {
  const result = (await chrome.storage.sync.get(["settings"])) as Pick<StorageSchemaV1, "settings">;
  return result.settings;
};

export const clearAllStorage = async (): Promise<void> => {
  await chrome.storage.local.clear();
  await chrome.storage.sync.clear();
};
