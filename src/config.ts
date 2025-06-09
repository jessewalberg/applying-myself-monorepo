interface Config {
  CONVEX_URL: string;
  API_BASE_URL: string;
  ANALYTICS_ENDPOINT: string;
  MAX_RETRIES: number;
  REQUEST_TIMEOUT: number;
  EXTENSION: {
    KEY: string;
    ID: string;
    VERSION: string;
  };
  ENVIRONMENT: 'development' | 'production';
}

// Environment detection for Chrome extension
const isDevelopment = typeof chrome !== 'undefined' && 
                     chrome.runtime?.getManifest?.()?.name?.includes('Development') ||
                     // Fallback detection method
                     globalThis.location?.hostname === 'localhost' ||
                     globalThis.navigator?.userAgent?.includes('webpack');

// Environment-specific configurations
const developmentConfig: Config = {
  CONVEX_URL: 'https://dazzling-badger-1.convex.cloud',
  API_BASE_URL: 'https://dazzling-badger-1.convex.cloud/api',
  ANALYTICS_ENDPOINT: 'https://dazzling-badger-1.convex.cloud/api/analytics',
  MAX_RETRIES: 3,
  REQUEST_TIMEOUT: 30000,
  EXTENSION: {
    KEY: 'dev-extension-key-12345',
    ID: 'development-extension-id',
    VERSION: '1.0.0-dev'
  },
  ENVIRONMENT: 'development'
};

const productionConfig: Config = {
  // TODO: Update this with your production Convex deployment URL
  CONVEX_URL: 'https://dazzling-badger-1.convex.cloud', // Using same for now
  API_BASE_URL: 'https://dazzling-badger-1.convex.cloud/api',
  ANALYTICS_ENDPOINT: 'https://dazzling-badger-1.convex.cloud/api/analytics',
  MAX_RETRIES: 2,
  REQUEST_TIMEOUT: 15000,
  EXTENSION: {
    KEY: 'prod-extension-key-abcdef',
    ID: 'production-extension-id',
    VERSION: '1.0.0'
  },
  ENVIRONMENT: 'production'
};

// Select configuration based on environment
const config: Config = isDevelopment ? developmentConfig : productionConfig;

// Log current environment (only in development)
if (isDevelopment && typeof console !== 'undefined') {
  console.log('🔧 CoverCraft Extension - Development Mode');
  console.log('📡 Convex URL:', config.CONVEX_URL);
}

export default config; 