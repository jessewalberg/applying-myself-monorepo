const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function generateFavicon() {
  try {
    const logoPath = path.join(__dirname, '../components/icons/logo.svg');
    const faviconPath = path.join(__dirname, '../public/favicon.ico');
    
    // Check if logo exists
    if (!fs.existsSync(logoPath)) {
      console.error('❌ Logo SVG not found at:', logoPath);
      return;
    }

    console.log('🔖 Generating favicon...');
    console.log('Input:', logoPath);
    console.log('Output:', faviconPath);

    // Generate favicon - 32x32 is the standard size for ICO format
    // We'll create a PNG first, then convert to ICO
    const faviconBuffer = await sharp(logoPath)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
      })
      .png()
      .toBuffer();

    // For better browser compatibility, let's also create multiple sizes
    // and save as PNG (many browsers prefer PNG favicons now)
    const faviconPngPath = path.join(__dirname, '../public/favicon.png');
    
    await sharp(logoPath)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(faviconPngPath);

    // For ICO format, we'll use the PNG buffer and save as ICO
    // Note: Sharp doesn't directly support ICO, so we'll save as PNG with .ico extension
    // Most modern browsers will handle this fine
    fs.writeFileSync(faviconPath, faviconBuffer);

    // Also generate a 16x16 version for older browsers
    const favicon16Path = path.join(__dirname, '../public/favicon-16x16.png');
    await sharp(logoPath)
      .resize(16, 16, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(favicon16Path);

    // Generate 32x32 version
    const favicon32Path = path.join(__dirname, '../public/favicon-32x32.png');
    await sharp(logoPath)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(favicon32Path);

    console.log('✅ Favicon generated successfully!');
    
    // Get file sizes
    const icoStats = fs.statSync(faviconPath);
    const pngStats = fs.statSync(faviconPngPath);
    const png16Stats = fs.statSync(favicon16Path);
    const png32Stats = fs.statSync(favicon32Path);
    
    console.log(`📁 favicon.ico: ${(icoStats.size / 1024).toFixed(1)} KB`);
    console.log(`📁 favicon.png: ${(pngStats.size / 1024).toFixed(1)} KB`);
    console.log(`📁 favicon-16x16.png: ${(png16Stats.size / 1024).toFixed(1)} KB`);
    console.log(`📁 favicon-32x32.png: ${(png32Stats.size / 1024).toFixed(1)} KB`);
    
  } catch (error) {
    console.error('❌ Error generating favicon:', error.message);
  }
}

generateFavicon(); 