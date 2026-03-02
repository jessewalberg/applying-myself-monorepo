interface Config {
  CONVEX_URL: string;
  API_BASE_URL: string;
  ANALYTICS_ENDPOINT: string;
  SITE_URL: string;
  MAX_RETRIES: number;
  REQUEST_TIMEOUT: number;
  EXTENSION: {
    KEY: string;
    ID: string;
    VERSION: string;
  };
  ENVIRONMENT: 'development' | 'staging' | 'production';
}

// Environment-specific configurations
const developmentConfig: Config = {
  CONVEX_URL: 'https://dazzling-badger-1.convex.cloud',
  API_BASE_URL: 'https://dazzling-badger-1.convex.cloud/api',
  ANALYTICS_ENDPOINT: 'https://dazzling-badger-1.convex.cloud/api/analytics',
  SITE_URL: 'https://dev.applyingmyself.com',
  MAX_RETRIES: 3,
  REQUEST_TIMEOUT: 30000,
  EXTENSION: {
    KEY: 'dev-extension-key-12345',
    ID: 'development-extension-id',
    VERSION: '1.0.0-dev'
  },
  ENVIRONMENT: 'development'
};

const stagingConfig: Config = {
  CONVEX_URL: 'https://staging-deployment.convex.cloud',
  API_BASE_URL: 'https://staging-deployment.convex.cloud/api',
  ANALYTICS_ENDPOINT: 'https://staging-deployment.convex.cloud/api/analytics',
  SITE_URL: 'https://dev.applyingmyself.com',
  MAX_RETRIES: 2,
  REQUEST_TIMEOUT: 20000,
  EXTENSION: {
    KEY: 'staging-extension-key-67890',
    ID: 'staging-extension-id',
    VERSION: '1.0.0-staging'
  },
  ENVIRONMENT: 'staging'
};

const productionConfig: Config = {
  CONVEX_URL: 'https://oceanic-retriever-344.convex.site',
  API_BASE_URL: 'https://oceanic-retriever-344.convex.site/api',
  ANALYTICS_ENDPOINT: 'https://oceanic-retriever-344.convex.site/api/analytics',
  SITE_URL: 'https://applyingmyself.com',
  MAX_RETRIES: 2,
  REQUEST_TIMEOUT: 15000,
  EXTENSION: {
    KEY: 'prod-extension-key-abcdef',
    ID: 'production-extension-id',
    VERSION: '1.0.0'
  },
  ENVIRONMENT: 'production'
};

const configs = {
  development: developmentConfig,
  staging: stagingConfig,
  production: productionConfig,
};

// Auto-detect environment or use explicit override
const getEnvironment = (): keyof typeof configs => {
  // Use build-time environment first
  if (typeof process !== 'undefined' && process.env.BUILD_ENV) {
    return process.env.BUILD_ENV as keyof typeof configs;
  }

  if (typeof process !== 'undefined' && process.env.NODE_ENV) {
    return process.env.NODE_ENV as keyof typeof configs;
  }

  // Chrome extension environment detection
  if (typeof chrome !== 'undefined' && chrome.runtime?.getManifest) {
    const manifest = chrome.runtime.getManifest();
    if (manifest.name?.includes('Development')) return 'development';
    if (manifest.name?.includes('Staging')) return 'staging';
    return 'production';
  }

  // Browser detection fallback
  if (typeof window !== 'undefined') {
    const hostname = window.location?.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') return 'development';
    if (hostname === 'dev.applyingmyself.com') return 'staging';
    if (hostname === 'applyingmyself.com') return 'production';
  }

  return 'development';
};

// Select configuration based on environment
const config: Config = configs[getEnvironment()];

// Log current environment (only in development)
if (config.ENVIRONMENT === 'development' && typeof console !== 'undefined') {
  console.log('🔧 Applying Myself Extension - Development Mode');
  console.log('📡 Convex URL:', config.CONVEX_URL);
  console.log('🔗 Site URL:', config.SITE_URL);
}

export default config; 