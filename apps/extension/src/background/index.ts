import type { ChromeTab } from '@/types/chrome';
import type { PopupToBackgroundMessage, PopupToContentMessage } from '@/core/contracts/messages';
import { isAnalyticsEventMessage } from '@/core/contracts/messages';
import { createClerkClient } from '@clerk/chrome-extension/background';
import { capturePosthogEvent } from '@/core/analytics/posthog';
import CONFIG from '@/config';

type JobDetectorWindow = Window & {
  jobDetector?: {
    extractJobData: () => unknown;
  };
};

class BackgroundService {
  constructor() {
    try {
      this.init();
    } catch (error) {
      console.error('Background init failed:', error);
    }

    try {
      this.setupAutoReload();
    } catch (error) {
      console.error('Background auto-reload setup failed:', error);
    }
  }

  private clerkInitPromise: Promise<void> | null = null;

  private init(): void {
    void this.ensureClerkBackground();
    this.setupMessageListeners();
    this.setupContextMenus();
    this.setupTabUpdateListener();
  }

  private ensureClerkBackground(): Promise<void> {
    if (this.clerkInitPromise) {
      return this.clerkInitPromise;
    }

    this.clerkInitPromise = (async () => {
      if (!CONFIG.CLERK.PUBLISHABLE_KEY) {
        console.warn('Clerk background init skipped: missing publishable key');
        return;
      }

      try {
        await createClerkClient(
          CONFIG.CLERK.SYNC_HOST
            ? {
                publishableKey: CONFIG.CLERK.PUBLISHABLE_KEY,
                syncHost: CONFIG.CLERK.SYNC_HOST,
                __experimental_syncHostListener: true,
              }
            : {
                publishableKey: CONFIG.CLERK.PUBLISHABLE_KEY,
              }
        );
      } catch (error) {
        console.error('Clerk background init failed:', error);
      }
    })();

    return this.clerkInitPromise;
  }

  private setupAutoReload(): void {
    if (!chrome?.runtime?.getManifest || !chrome?.runtime?.onMessage?.addListener) return;

    // Only enable in development
    const manifest = chrome.runtime.getManifest();
    if (!manifest?.name?.includes('Development')) return;

    console.log('🔄 Auto-reload enabled for development');
    chrome.runtime.onMessage.addListener((message: PopupToBackgroundMessage, _sender, _sendResponse) => {
      if (message.type === 'RELOAD_EXTENSION') {
        console.log('🔄 Reloading extension...');
        chrome.runtime.reload();
        return true;
      }
    });
  }

  private setupMessageListeners(): void {
    if (!chrome?.runtime?.onMessage?.addListener) return;

    chrome.runtime.onMessage.addListener((message: PopupToBackgroundMessage, _sender, sendResponse) => {
      switch (message.type) {
        case 'OPEN_POPUP':
          this.openPopup();
          break;
        case 'OPEN_POPUP_WITH_CONTENT':
          this.openPopup();
          break;
        case 'GET_CURRENT_TAB':
          this.getCurrentTab().then(sendResponse);
          return true;
        case 'EXTRACT_JOB':
          this.extractJobFromTab(message.tabId).then(sendResponse);
          return true;
        case 'ANALYTICS_EVENT':
          if (isAnalyticsEventMessage(message)) {
            this.trackEvent(message.eventName, message.properties);
          }
          break;
        default:
          break;
      }
    });
  }

  private setupContextMenus(): void {
    if (!chrome?.contextMenus?.remove || !chrome?.contextMenus?.create || !chrome?.contextMenus?.onClicked?.addListener) {
      return;
    }

    chrome.contextMenus.remove('applying-myself-extract', () => {
      void chrome.runtime.lastError;
      chrome.contextMenus.create(
        {
          id: 'applying-myself-extract',
          title: 'Extract content with Applying Myself',
          contexts: ['page']
        },
        () => {
          const createError = chrome.runtime.lastError;
          if (createError) {
            console.error('Failed to create context menu:', createError.message);
          }
        }
      );
    });

    chrome.contextMenus.onClicked.addListener((info, tab) => {
      if (info.menuItemId === 'applying-myself-extract') {
        // Send message to content script to extract
        if (tab?.id) {
          const message: PopupToContentMessage = { type: 'EXTRACT_PAGE_CONTENT' };
          chrome.tabs.sendMessage(tab.id, message);
        }
      }
    });
  }

  private setupTabUpdateListener(): void {
    if (!chrome?.tabs?.onUpdated?.addListener) return;

    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('https://')) {
        // Inject content script on all HTTPS pages
        this.injectContentScript(tabId);
      }
    });
  }

  private async openPopup(): Promise<void> {
    try {
      await chrome.action.openPopup();
    } catch (error) {
      console.error('Failed to open popup:', error);
    }
  }

  private async getCurrentTab(): Promise<ChromeTab> {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab as ChromeTab;
  }

  private async extractJobFromTab(tabId?: number): Promise<unknown> {
    try {
      const targetTabId = tabId || (await this.getCurrentTab()).id;
      const results = await chrome.scripting.executeScript({
        target: { tabId: targetTabId },
        func: () => {
          // This function runs in the context of the webpage
          const pageWindow = window as JobDetectorWindow;
          if (pageWindow.jobDetector) {
            return pageWindow.jobDetector.extractJobData();
          }
          return null;
        }
      });

      return results[0]?.result;
    } catch (error) {
      console.error('Failed to extract job data:', error);
      return null;
    }
  }

  private async injectContentScript(tabId: number): Promise<void> {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content.js']
      });
    } catch (error) {
      // Silently fail - some pages don't allow script injection
      console.log('Could not inject content script:', error instanceof Error ? error.message : String(error));
    }
  }

  private trackEvent(eventName: string, properties: Record<string, unknown> = {}): void {
    void capturePosthogEvent(eventName, {
      ...properties,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    }).catch((error) => {
      if (CONFIG.ENVIRONMENT === 'development') {
        console.warn('Failed to capture PostHog event:', error);
      }
    });
  }
}

let backgroundService: BackgroundService | null = null;

export const startBackgroundService = (): void => {
  if (!backgroundService) {
    backgroundService = new BackgroundService();
  }
};
