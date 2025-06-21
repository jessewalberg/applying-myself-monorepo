const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function generateLogoPng() {
  try {
    const inputPath = path.join(__dirname, '../components/icons/logo.svg');
    const outputPath = path.join(__dirname, '../public/logo.png');
    
    console.log('Converting SVG logo to PNG...');
    console.log('Input:', inputPath);
    console.log('Output:', outputPath);
    
    // Check if input file exists
    if (!fs.existsSync(inputPath)) {
      console.error('❌ SVG logo not found at:', inputPath);
      return;
    }
    
    // Convert SVG to PNG
    await sharp(inputPath)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
      })
      .png()
      .toFile(outputPath);
    
    console.log('✅ Successfully generated logo.png (512x512) with transparent background');
    
    // Get file size for confirmation
    const stats = fs.statSync(outputPath);
    console.log(`📁 File size: ${(stats.size / 1024).toFixed(1)} KB`);
    
  } catch (error) {
    console.error('❌ Error generating logo PNG:', error.message);
  }
}

generateLogoPng(); 