import CONFIG from "@/config";

const DISTINCT_ID_KEY = "posthog_distinct_id";
let cachedDistinctId: string | null = null;

const getStorageArea = () => chrome?.storage?.local;

const getDistinctId = async (): Promise<string> => {
  if (cachedDistinctId) return cachedDistinctId;

  const storage = getStorageArea();
  if (!storage) {
    cachedDistinctId = crypto.randomUUID();
    return cachedDistinctId;
  }

  const existing = await storage.get(DISTINCT_ID_KEY);
  const distinctId = typeof existing[DISTINCT_ID_KEY] === "string" && existing[DISTINCT_ID_KEY]
    ? existing[DISTINCT_ID_KEY]
    : crypto.randomUUID();

  if (existing[DISTINCT_ID_KEY] !== distinctId) {
    await storage.set({ [DISTINCT_ID_KEY]: distinctId });
  }

  cachedDistinctId = distinctId;
  return distinctId;
};

const isConfigured = (): boolean => Boolean(CONFIG.POSTHOG.HOST && CONFIG.POSTHOG.API_KEY);

export const capturePosthogEvent = async (
  eventName: string,
  properties: Record<string, unknown> = {}
): Promise<void> => {
  if (!isConfigured()) return;

  const distinctId = await getDistinctId();
  const endpoint = `${CONFIG.POSTHOG.HOST}/capture/`;
  const payload = {
    api_key: CONFIG.POSTHOG.API_KEY,
    event: eventName,
    distinct_id: distinctId,
    properties: {
      distinct_id: distinctId,
      source: "chrome_extension",
      extension_id: chrome.runtime?.id || "",
      extension_version: chrome.runtime?.getManifest?.().version || "",
      environment: CONFIG.ENVIRONMENT,
      site_url: CONFIG.SITE_URL,
      ...properties,
    },
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok && CONFIG.ENVIRONMENT === "development") {
    const text = await response.text().catch(() => "");
    console.warn("PostHog capture failed:", response.status, text);
  }
};
