import type { ExtractedContent, User, UserSettings } from "@/types";

export const STORAGE_SCHEMA_VERSION = 1 as const;

export interface StorageSchemaV1 {
  schemaVersion: typeof STORAGE_SCHEMA_VERSION;
  authToken?: string;
  userData?: User;
  settings?: UserSettings;
  lastExtractedJob?: ExtractedContent;
  extractionTimestamp?: number;
}

export type LocalStorageKey =
  | "schemaVersion"
  | "authToken"
  | "userData"
  | "lastExtractedJob"
  | "extractionTimestamp";

export type SyncStorageKey = "settings";

export const storageDefaults: Pick<StorageSchemaV1, "schemaVersion"> = {
  schemaVersion: STORAGE_SCHEMA_VERSION,
};
