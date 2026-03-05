import type {
  BackgroundToPopupMessage,
  MessageResponse,
  PopupToBackgroundMessage,
  PopupToContentMessage,
  RuntimeMessage,
} from "@/core/contracts/messages";
import type { StorageSchemaV1 } from "@/core/storage/schema";

export type {
  BackgroundToPopupMessage,
  MessageResponse,
  PopupToBackgroundMessage,
  PopupToContentMessage,
  RuntimeMessage,
};

export interface ChromeTab extends chrome.tabs.Tab {
  id: number;
  url: string;
  title: string;
  active: boolean;
  windowId: number;
}

export interface ChromeStorage {
  get(keys: string | string[] | object | null): Promise<Partial<StorageSchemaV1>>;
  set(items: Partial<StorageSchemaV1>): Promise<void>;
  remove(keys: string | string[]): Promise<void>;
  clear(): Promise<void>;
}

export interface ChromeRuntime {
  sendMessage<TResponse = unknown>(message: RuntimeMessage): Promise<TResponse>;
  onMessage: {
    addListener(
      callback: (message: RuntimeMessage, sender: chrome.runtime.MessageSender) => void
    ): void;
    removeListener(
      callback: (message: RuntimeMessage, sender: chrome.runtime.MessageSender) => void
    ): void;
  };
}

// Backward-compatible aliases during migration.
export type ChromeMessage = RuntimeMessage;
export type ChromeResponse<T = unknown> = MessageResponse<T>;
export type ContentScriptMessage = PopupToContentMessage;
export type BackgroundMessage = PopupToBackgroundMessage;

declare global {
  namespace chrome {
    interface Tabs {
      query(queryInfo: chrome.tabs.QueryInfo): Promise<ChromeTab[]>;
      sendMessage<TResponse = unknown>(tabId: number, message: PopupToContentMessage): Promise<TResponse>;
    }

    interface Storage {
      local: ChromeStorage;
      sync: {
        get(keys: string | string[] | object | null): Promise<Partial<StorageSchemaV1>>;
        set(items: Partial<StorageSchemaV1>): Promise<void>;
        remove(keys: string | string[]): Promise<void>;
        clear(): Promise<void>;
      };
    }

    interface Runtime {
      sendMessage<TResponse = unknown>(message: RuntimeMessage): Promise<TResponse>;
      onMessage: {
        addListener(
          callback: (message: RuntimeMessage, sender: chrome.runtime.MessageSender) => void
        ): void;
        removeListener(
          callback: (message: RuntimeMessage, sender: chrome.runtime.MessageSender) => void
        ): void;
      };
      lastError?: { message: string };
    }
  }
}
