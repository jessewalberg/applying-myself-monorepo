#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ENVIRONMENTS = ['development', 'staging', 'production'];

function printUsage() {
  console.log(`
🚀 Chrome Extension Deployment Script

Usage: node scripts/deploy.js <environment> [options]

Environments:
  development  - Build for development with hot reload
  staging      - Build for staging environment
  production   - Build for production release

Options:
  --zip        - Create a zip file after building
  --clean      - Clean dist directory before building

Examples:
  node scripts/deploy.js staging --zip
  node scripts/deploy.js production --clean --zip
  node scripts/deploy.js development
`);
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printUsage();
    process.exit(0);
  }

  const environment = args[0];
  const shouldZip = args.includes('--zip');
  const shouldClean = args.includes('--clean');

  if (!ENVIRONMENTS.includes(environment)) {
    console.error(`❌ Invalid environment: ${environment}`);
    console.error(`   Valid environments: ${ENVIRONMENTS.join(', ')}`);
    process.exit(1);
  }

  try {
    console.log(`🔧 Building Chrome Extension for ${environment}...`);
    
    // Clean if requested
    if (shouldClean) {
      console.log('🧹 Cleaning dist directory...');
      execSync('npm run clean', { stdio: 'inherit' });
    }

    // Build for the specified environment
    const buildCommand = `npm run build:${environment}`;
    console.log(`📦 Running: ${buildCommand}`);
    execSync(buildCommand, { stdio: 'inherit' });

    // Create zip if requested
    if (shouldZip) {
      const zipName = `extension-${environment}.zip`;
      console.log(`📦 Creating ${zipName}...`);
      
      // Remove old zip if exists
      if (fs.existsSync(zipName)) {
        fs.unlinkSync(zipName);
      }
      
      execSync(`npm run zip:${environment}`, { stdio: 'inherit' });
      console.log(`✅ Created ${zipName}`);
    }

    console.log(`✅ Successfully built extension for ${environment}`);
    
    // Show next steps
    if (environment === 'development') {
      console.log(`
📝 Next steps for development:
   1. Open Chrome and go to chrome://extensions/
   2. Enable "Developer mode"
   3. Click "Load unpacked" and select the dist/ folder
   4. The extension will auto-reload when you make changes
`);
    } else if (environment === 'staging') {
      console.log(`
📝 Next steps for staging:
   1. Upload extension-staging.zip to Chrome Web Store (staging)
   2. Test on dev.applyingmyself.com
   3. Verify staging Convex deployment integration
`);
    } else if (environment === 'production') {
      console.log(`
📝 Next steps for production:
   1. Upload extension-production.zip to Chrome Web Store
   2. Test on applyingmyself.com
   3. Monitor production metrics
`);
    }

  } catch (error) {
    console.error(`❌ Build failed:`, error.message);
    process.exit(1);
  }
}

main(); 