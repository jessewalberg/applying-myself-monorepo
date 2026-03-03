export const executeInTab = async (
  tabId: number,
  files: string[]
): Promise<void> => {
  await chrome.scripting.executeScript({
    target: { tabId },
    files,
  });
};
