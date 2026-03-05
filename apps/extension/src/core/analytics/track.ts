import { sendRuntimeMessage } from "@/core/chrome/runtime";
import type { PopupToBackgroundMessage } from "@/core/contracts/messages";

export const trackExtensionEvent = async (
  eventName: string,
  properties: Record<string, string> = {}
): Promise<void> => {
  const message: PopupToBackgroundMessage = {
    type: "ANALYTICS_EVENT",
    eventName,
    properties: {
      source: "chrome_extension_popup",
      timestamp: new Date().toISOString(),
      ...properties,
    },
  };

  try {
    await sendRuntimeMessage(message);
  } catch (error) {
    console.warn("Failed to send analytics runtime message:", error);
  }
};
