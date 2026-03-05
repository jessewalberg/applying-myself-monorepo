import { STORAGE_SCHEMA_VERSION, type StorageSchemaV1 } from "./schema";

export const setAuthToken = async (token: string): Promise<void> => {
  await chrome.storage.local.set({ authToken: token, schemaVersion: STORAGE_SCHEMA_VERSION });
};

export const getAuthToken = async (): Promise<string | undefined> => {
  const result = (await chrome.storage.local.get(["authToken"])) as Pick<StorageSchemaV1, "authToken">;
  return result.authToken;
};

export const clearAuthToken = async (): Promise<void> => {
  await chrome.storage.local.remove(["authToken"]);
};

export const clearLocalStorage = async (): Promise<void> => {
  await chrome.storage.local.clear();
};
