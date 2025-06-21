const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function generatePWAIcons() {
  try {
    const logoPath = path.join(__dirname, '../components/icons/logo.svg');
    const iconsDir = path.join(__dirname, '../public/icons');
    
    // Create icons directory if it doesn't exist
    if (!fs.existsSync(iconsDir)) {
      fs.mkdirSync(iconsDir, { recursive: true });
    }
    
    // Check if logo exists
    if (!fs.existsSync(logoPath)) {
      console.error('❌ Logo SVG not found at:', logoPath);
      return;
    }

    console.log('📱 Generating PWA icons...');

    const iconSizes = [
      { size: 152, name: 'icon-152x152.png', description: 'iOS Safari' },
      { size: 192, name: 'icon-192x192.png', description: 'Android Chrome' },
      { size: 512, name: 'icon-512x512.png', description: 'Android Chrome Large' }
    ];

    // Generate icons with solid background for better mobile compatibility
    for (const icon of iconSizes) {
      const outputPath = path.join(iconsDir, icon.name);
      
      await sharp(logoPath)
        .resize(icon.size, icon.size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 } // White background for iOS compatibility
        })
        .png()
        .toFile(outputPath);
      
      const stats = fs.statSync(outputPath);
      console.log(`✅ ${icon.description}: ${icon.name} (${(stats.size / 1024).toFixed(1)} KB)`);
    }

    // Generate Android Chrome icons (can have transparent background)
    const androidIconSizes = [
      { size: 192, name: 'android-chrome-192x192.png' },
      { size: 512, name: 'android-chrome-512x512.png' }
    ];

    for (const icon of androidIconSizes) {
      const outputPath = path.join(__dirname, '../public', icon.name);
      
      await sharp(logoPath)
        .resize(icon.size, icon.size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background for Android
        })
        .png()
        .toFile(outputPath);
      
      const stats = fs.statSync(outputPath);
      console.log(`✅ Android Chrome: ${icon.name} (${(stats.size / 1024).toFixed(1)} KB)`);
    }
    
    console.log('✅ All PWA icons generated successfully!');
    
  } catch (error) {
    console.error('❌ Error generating PWA icons:', error.message);
  }
}

generatePWAIcons(); 