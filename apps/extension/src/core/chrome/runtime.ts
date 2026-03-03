export const sendRuntimeMessage = async <TResponse = unknown>(message: unknown): Promise<TResponse> => {
  return chrome.runtime.sendMessage(message) as Promise<TResponse>;
};

export const addRuntimeMessageListener = (
  listener: Parameters<typeof chrome.runtime.onMessage.addListener>[0]
): void => {
  chrome.runtime.onMessage.addListener(listener);
};
