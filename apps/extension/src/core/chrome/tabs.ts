import type { PopupToContentMessage } from "@/core/contracts/messages";
import type { ChromeTab } from "@/types/chrome";

export const getCurrentTab = async (): Promise<ChromeTab> => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab as ChromeTab;
};

export const sendTabMessage = async <TResponse = unknown>(
  tabId: number,
  message: PopupToContentMessage
): Promise<TResponse> => {
  return chrome.tabs.sendMessage(tabId, message) as Promise<TResponse>;
};
