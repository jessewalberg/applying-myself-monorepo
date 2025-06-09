#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../src/config.ts');

function updateConvexUrl(newUrl, environment = 'development') {
  try {
    let configContent = fs.readFileSync(configPath, 'utf8');
    
    const configVar = environment === 'development' ? 'developmentConfig' : 'productionConfig';
    
    // Replace the CONVEX_URL in the appropriate config
    const convexUrlRegex = new RegExp(`(const ${configVar}[\\s\\S]*?CONVEX_URL: )['"\`][^'"\`]*['"\`]`);
    configContent = configContent.replace(convexUrlRegex, `$1'${newUrl}'`);
    
    // Also update API_BASE_URL to match
    const apiUrlRegex = new RegExp(`(const ${configVar}[\\s\\S]*?API_BASE_URL: )['"\`][^'"\`]*['"\`]`);
    configContent = configContent.replace(apiUrlRegex, `$1'${newUrl}/api'`);
    
    // Update ANALYTICS_ENDPOINT too
    const analyticsUrlRegex = new RegExp(`(const ${configVar}[\\s\\S]*?ANALYTICS_ENDPOINT: )['"\`][^'"\`]*['"\`]`);
    configContent = configContent.replace(analyticsUrlRegex, `$1'${newUrl}/api/analytics'`);
    
    fs.writeFileSync(configPath, configContent);
    console.log(`✅ Updated ${environment} Convex URL to: ${newUrl}`);
    console.log(`✅ Updated ${environment} API_BASE_URL to: ${newUrl}/api`);
    console.log(`✅ Updated ${environment} ANALYTICS_ENDPOINT to: ${newUrl}/api/analytics`);
    console.log('\n🔧 Next steps:');
    console.log(`1. Run: npm run build:${environment === 'development' ? 'dev' : 'prod'}`);
    console.log('2. Reload the extension in Chrome');
    
  } catch (error) {
    console.error('❌ Error updating config:', error.message);
    process.exit(1);
  }
}

// Get URL and environment from command line arguments
const newUrl = process.argv[2];
const environment = process.argv[3] || 'development';

if (!newUrl) {
  console.log('Usage: node scripts/update-config.js <convex-url> [environment]');
  console.log('Example: node scripts/update-config.js https://my-deployment.convex.cloud development');
  console.log('Example: node scripts/update-config.js https://my-prod-deployment.convex.cloud production');
  process.exit(1);
}

if (!['development', 'production'].includes(environment)) {
  console.error('❌ Environment must be either "development" or "production"');
  process.exit(1);
}

// Validate URL format
try {
  new URL(newUrl);
} catch (error) {
  console.error('❌ Invalid URL format:', newUrl);
  process.exit(1);
}

updateConvexUrl(newUrl, environment); 