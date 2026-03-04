import { HTMLExtractor } from './htmlExtractor';
import { initFAB } from './fab';
import type { ContentScriptMessage, MessageResponse } from '@/types/chrome';

class PageExtractor {
  constructor() {
    this.init();
  }

  private init(): void {
    this.setupMessageListener();
  }

  private setupMessageListener(): void {
    chrome.runtime.onMessage.addListener((message: ContentScriptMessage, _sender, sendResponse) => {
      switch (message.type) {
        case 'GET_PAGE_DATA':
          try {
            const pageData = HTMLExtractor.extractPageData();
            sendResponse({ success: true, data: pageData } as MessageResponse<typeof pageData>);
          } catch (error) {
            console.error('Content script: Failed to extract page data:', error);
            sendResponse({ success: false, error: (error as Error).message } as MessageResponse);
          }
          break;

        case 'PING':
          sendResponse({ success: true, message: 'Content script active' } as MessageResponse);
          break;

        case 'EXTRACT_PAGE_CONTENT':
          sendResponse({ success: false, error: 'Use GET_PAGE_DATA instead' } as MessageResponse);
          break;
      }
    });
  }
}

let extractor: PageExtractor | null = null;

export const startPageExtractor = (): void => {
  if (!extractor) {
    extractor = new PageExtractor();
    initFAB();
  }
};
