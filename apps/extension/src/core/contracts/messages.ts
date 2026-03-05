export type ExtractPageContentMessage = { type: "GET_PAGE_DATA" };
export type PingMessage = { type: "PING" };
export type LegacyExtractMessage = { type: "EXTRACT_PAGE_CONTENT" };

export type PopupToContentMessage =
  | ExtractPageContentMessage
  | PingMessage
  | LegacyExtractMessage;

export type AnalyticsEventMessage = {
  type: "ANALYTICS_EVENT";
  eventName: string;
  properties?: Record<string, unknown>;
};

export type PopupToBackgroundMessage =
  | { type: "OPEN_POPUP" }
  | { type: "OPEN_POPUP_WITH_CONTENT" }
  | { type: "GET_CURRENT_TAB" }
  | { type: "EXTRACT_JOB"; tabId?: number }
  | { type: "RELOAD_EXTENSION" }
  | AnalyticsEventMessage;

export type BackgroundToPopupMessage =
  | { type: "CURRENT_TAB"; tabId: number; url?: string; title?: string }
  | { type: "EXTRACT_RESULT"; data: unknown }
  | { type: "ERROR"; error: string };

export type MessageResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type RuntimeMessage = PopupToBackgroundMessage | BackgroundToPopupMessage;

export const isAnalyticsEventMessage = (
  message: RuntimeMessage | PopupToBackgroundMessage
): message is AnalyticsEventMessage => message.type === "ANALYTICS_EVENT";
