#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../src/config.ts');

function checkConfiguration() {
  try {
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    // Extract development config
    const devMatch = configContent.match(/const developmentConfig.*?CONVEX_URL: ['"`]([^'"`]*)['"`]/s);
    const devUrl = devMatch ? devMatch[1] : 'Not found';
    
    // Extract production config
    const prodMatch = configContent.match(/const productionConfig.*?CONVEX_URL: ['"`]([^'"`]*)['"`]/s);
    const prodUrl = prodMatch ? prodMatch[1] : 'Not found';
    
    console.log('🔧 CoverCraft Extension Configuration Status');
    console.log('=' .repeat(50));
    console.log();
    console.log('📍 Development Environment:');
    console.log(`   Convex URL: ${devUrl}`);
    console.log(`   Status: ${devUrl.includes('dazzling-badger-1') ? '✅ Configured' : '⚠️  Needs Update'}`);
    console.log();
    console.log('📍 Production Environment:');
    console.log(`   Convex URL: ${prodUrl}`);
    console.log(`   Status: ${prodUrl.includes('your-production') ? '⚠️  Needs Configuration' : '✅ Configured'}`);
    console.log();
    
    // Check if manifest files exist
    const devManifestExists = fs.existsSync(path.join(__dirname, '../src/manifest.dev.json'));
    const prodManifestExists = fs.existsSync(path.join(__dirname, '../src/manifest.prod.json'));
    
    console.log('📄 Manifest Files:');
    console.log(`   manifest.dev.json: ${devManifestExists ? '✅ Exists' : '❌ Missing'}`);
    console.log(`   manifest.prod.json: ${prodManifestExists ? '✅ Exists' : '❌ Missing'}`);
    console.log();
    
    // Quick commands
    console.log('🚀 Quick Commands:');
    console.log('   Build Development: npm run build:dev');
    console.log('   Build Production:  npm run build:prod');
    console.log('   Update Dev URL:    npm run update-config <url> development');
    console.log('   Update Prod URL:   npm run update-config <url> production');
    console.log();
    
    // Environment detection test
    console.log('🧪 Environment Detection:');
    console.log('   Current NODE_ENV:', process.env.NODE_ENV || 'undefined');
    console.log('   Will use:', process.env.NODE_ENV === 'production' ? 'Production Config' : 'Development Config');
    
  } catch (error) {
    console.error('❌ Error reading configuration:', error.message);
    process.exit(1);
  }
}

checkConfiguration(); 