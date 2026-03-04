/**
 * Floating Action Button (FAB) for job posting pages.
 * Detects job sites and shows an amber-accented button that
 * triggers extraction via the background script / popup.
 */

const JOB_SITE_PATTERNS: Array<{
  hostname: RegExp;
  pathPattern?: RegExp;
}> = [
  // LinkedIn job postings
  { hostname: /linkedin\.com$/i, pathPattern: /\/jobs\/view\//i },
  { hostname: /linkedin\.com$/i, pathPattern: /\/jobs\/collections\//i },
  // Indeed
  { hostname: /indeed\.com$/i, pathPattern: /\/viewjob/i },
  { hostname: /indeed\.com$/i, pathPattern: /\/jobs\?/i },
  // Greenhouse
  { hostname: /greenhouse\.io$/i, pathPattern: /\/jobs\//i },
  { hostname: /boards\.greenhouse\.io$/i },
  // Lever
  { hostname: /lever\.co$/i, pathPattern: /\/[^/]+\/[a-f0-9-]+/i },
  { hostname: /jobs\.lever\.co$/i },
  // Workday
  { hostname: /myworkdayjobs\.com$/i },
  { hostname: /wd\d+\.myworkday\.com$/i },
  // Glassdoor
  { hostname: /glassdoor\.com$/i, pathPattern: /\/job-listing\//i },
  // AngelList / Wellfound
  { hostname: /wellfound\.com$/i, pathPattern: /\/jobs/i },
  { hostname: /angel\.co$/i, pathPattern: /\/jobs/i },
  // Company career pages (common patterns)
  { hostname: /.+/i, pathPattern: /\/careers?\//i },
  { hostname: /.+/i, pathPattern: /\/jobs?\//i },
  { hostname: /.+/i, pathPattern: /\/openings?\//i },
  { hostname: /.+/i, pathPattern: /\/positions?\//i },
];

function isJobPage(): boolean {
  const { hostname, pathname, search } = window.location;
  const fullPath = pathname + search;

  return JOB_SITE_PATTERNS.some(({ hostname: hostRe, pathPattern }) => {
    if (!hostRe.test(hostname)) return false;
    if (pathPattern && !pathPattern.test(fullPath)) return false;
    return true;
  });
}

let fabElement: HTMLElement | null = null;
let tooltipElement: HTMLElement | null = null;

function createFAB(): void {
  if (fabElement) return;

  // Create shadow host for style isolation
  const host = document.createElement("div");
  host.id = "applying-myself-fab-host";
  host.style.cssText = "all: initial; position: fixed; z-index: 2147483647;";
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: "closed" });

  // Inject styles inside shadow DOM
  const style = document.createElement("style");
  style.textContent = `
    :host {
      all: initial;
    }
    .am-fab {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: hsl(38, 92%, 50%);
      color: hsl(20, 14%, 4%);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(217, 119, 6, 0.35), 0 2px 8px rgba(0,0,0,0.2);
      transition: all 0.2s ease;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .am-fab:hover {
      transform: scale(1.08) translateY(-2px);
      box-shadow: 0 6px 28px rgba(217, 119, 6, 0.45), 0 4px 12px rgba(0,0,0,0.3);
    }
    .am-fab:active {
      transform: scale(0.95);
    }
    .am-fab svg {
      width: 22px;
      height: 22px;
    }
    .am-tooltip {
      position: fixed;
      bottom: 80px;
      right: 24px;
      background: hsl(20, 10%, 8%);
      color: hsl(40, 20%, 95%);
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 500;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      border: 1px solid hsl(20, 10%, 16%);
      opacity: 0;
      transform: translateY(4px);
      transition: all 0.15s ease;
      pointer-events: none;
      white-space: nowrap;
      z-index: 2147483647;
    }
    .am-tooltip.visible {
      opacity: 1;
      transform: translateY(0);
    }
    .am-fab-enter {
      animation: fabSlideIn 0.3s ease-out;
    }
    @keyframes fabSlideIn {
      from {
        opacity: 0;
        transform: scale(0.8) translateY(16px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
  `;
  shadow.appendChild(style);

  // Create tooltip
  tooltipElement = document.createElement("div");
  tooltipElement.className = "am-tooltip";
  tooltipElement.textContent = "Generate cover letter";
  shadow.appendChild(tooltipElement);

  // Create button
  const fab = document.createElement("button");
  fab.className = "am-fab am-fab-enter";
  fab.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>`;
  fab.title = "Applying Myself - Generate Cover Letter";

  fab.addEventListener("mouseenter", () => {
    if (tooltipElement) tooltipElement.classList.add("visible");
  });
  fab.addEventListener("mouseleave", () => {
    if (tooltipElement) tooltipElement.classList.remove("visible");
  });

  fab.addEventListener("click", () => {
    // Send message to background to open popup
    chrome.runtime.sendMessage({ type: "OPEN_POPUP" });
  });

  shadow.appendChild(fab);
  fabElement = host;
}

function removeFAB(): void {
  if (fabElement) {
    fabElement.remove();
    fabElement = null;
    tooltipElement = null;
  }
}

export function initFAB(): void {
  // Check on initial load
  if (isJobPage()) {
    // Small delay to let page settle
    setTimeout(createFAB, 800);
  }

  // Watch for SPA navigation (LinkedIn, etc.)
  let lastUrl = window.location.href;
  const observer = new MutationObserver(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      if (isJobPage()) {
        createFAB();
      } else {
        removeFAB();
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}
