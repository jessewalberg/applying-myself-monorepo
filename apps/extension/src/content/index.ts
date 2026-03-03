import { HTMLExtractor } from './htmlExtractor';
import type { ContentScriptMessage, MessageResponse } from '@/types/chrome';

class PageExtractor {
  constructor() {
    this.init();
  }

  private init(): void {
    this.setupMessageListener();
  }

  /**
   * Message listener for communication with popup
   */
  private setupMessageListener(): void {
    chrome.runtime.onMessage.addListener((message: ContentScriptMessage, _sender, sendResponse) => {
      switch (message.type) {
        case 'GET_PAGE_DATA':
          try {
            console.log('Content script: Extracting page data...');
            const pageData = HTMLExtractor.extractPageData();
            console.log('Content script: Page data extracted successfully');
            sendResponse({ success: true, data: pageData } as MessageResponse<typeof pageData>);
          } catch (error) {
            console.error('Content script: Failed to extract page data:', error);
            sendResponse({ success: false, error: (error as Error).message } as MessageResponse);
          }
          break;

        case 'PING':
          sendResponse({ success: true, message: 'Content script active' } as MessageResponse);
          break;

        // Legacy support for old extraction method
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
  }
};
