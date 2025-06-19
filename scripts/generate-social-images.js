const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function generateSocialImages() {
  try {
    const logoPath = path.join(__dirname, '../public/logo.png');
    
    // Check if logo exists
    if (!fs.existsSync(logoPath)) {
      console.error('❌ Logo PNG not found. Run generate-logo-png.js first');
      return;
    }

    console.log('🎨 Generating social media images...');

    // Create OG Image (1200x630)
    await createOGImage(logoPath);
    
    // Create Twitter Image (1200x675)
    await createTwitterImage(logoPath);
    
    console.log('✅ All social media images generated successfully!');
    
  } catch (error) {
    console.error('❌ Error generating social images:', error.message);
  }
}

async function createOGImage(logoPath) {
  const outputPath = path.join(__dirname, '../public/og-image.png');
  
  // Create a gradient background
  const background = await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 4,
      background: { r: 99, g: 102, b: 241, alpha: 1 } // Purple gradient start
    }
  })
  .png()
  .toBuffer();

  // Load and resize logo
  const logo = await sharp(logoPath)
    .resize(200, 200, { fit: 'contain' })
    .toBuffer();

  // Create SVG text overlay
  const textSvg = `
    <svg width="1200" height="630">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#grad)"/>
      <text x="600" y="450" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="48" font-weight="bold">Applying Myself</text>
      <text x="600" y="500" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24" opacity="0.9">AI-powered cover letter generator</text>
      <text x="600" y="540" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="20" opacity="0.8">and job application assistant</text>
    </svg>
  `;

  await sharp(Buffer.from(textSvg))
    .composite([
      { input: logo, top: 180, left: 500 }
    ])
    .png()
    .toFile(outputPath);

  const stats = fs.statSync(outputPath);
  console.log(`✅ OG Image created: ${(stats.size / 1024).toFixed(1)} KB`);
}

async function createTwitterImage(logoPath) {
  const outputPath = path.join(__dirname, '../public/twitter-image.png');
  
  // Load and resize logo
  const logo = await sharp(logoPath)
    .resize(180, 180, { fit: 'contain' })
    .toBuffer();

  // Create SVG for Twitter (16:9 ratio)
  const textSvg = `
    <svg width="1200" height="675">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="1200" height="675" fill="url(#grad)"/>
      <text x="600" y="480" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="46" font-weight="bold">Applying Myself</text>
      <text x="600" y="530" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="22" opacity="0.9">AI-powered cover letter generator</text>
      <text x="600" y="570" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="18" opacity="0.8">and job application assistant</text>
    </svg>
  `;

  await sharp(Buffer.from(textSvg))
    .composite([
      { input: logo, top: 200, left: 510 }
    ])
    .png()
    .toFile(outputPath);

  const stats = fs.statSync(outputPath);
  console.log(`✅ Twitter Image created: ${(stats.size / 1024).toFixed(1)} KB`);
}

generateSocialImages(); 