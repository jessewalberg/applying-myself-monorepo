#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ENVIRONMENTS = ['development', 'staging', 'production'];
const BUILD_SCRIPT_BY_ENV = {
  development: 'build:dev',
  staging: 'build:staging',
  production: 'build:prod',
};
const ZIP_SCRIPT_BY_ENV = {
  development: 'zip',
  staging: 'zip:staging',
  production: 'zip:prod',
};

function printUsage() {
  console.log(`
🚀 Chrome Extension Deployment Script

Usage: bun scripts/deploy.js <environment> [options]

Environments:
  development  - Build for development with hot reload
  staging      - Build for staging environment
  production   - Build for production release

Options:
  --zip        - Create a zip file after building
  --clean      - Clean dist directory before building

Examples:
  bun scripts/deploy.js staging --zip
  bun scripts/deploy.js production --clean --zip
  bun scripts/deploy.js development
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
      execSync('bun run clean', { stdio: 'inherit' });
    }

    // Build for the specified environment
    const buildCommand = `bun run ${BUILD_SCRIPT_BY_ENV[environment]}`;
    console.log(`📦 Running: ${buildCommand}`);
    execSync(buildCommand, { stdio: 'inherit' });

    // Create zip if requested
    if (shouldZip) {
      const zipName = `extension-${environment}.zip`;
      const zipPath = path.join(process.cwd(), zipName);
      console.log(`📦 Creating ${zipName}...`);
      
      // Remove old zip if exists
      if (fs.existsSync(zipPath)) {
        fs.unlinkSync(zipPath);
      }
      
      execSync(`bun run ${ZIP_SCRIPT_BY_ENV[environment]}`, { stdio: 'inherit' });
      const distDir = path.join(process.cwd(), 'dist');
      const generatedZip = fs
        .readdirSync(distDir)
        .find((file) => file.endsWith('.zip'));

      if (generatedZip) {
        fs.copyFileSync(path.join(distDir, generatedZip), zipPath);
      }

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
