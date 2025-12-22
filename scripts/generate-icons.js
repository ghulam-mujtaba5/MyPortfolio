/**
 * GM Logo Icon Generator
 * Generates PNG icons at various sizes following UI/UX best practices
 * 
 * Icon Sizes (following Apple, Google, and Microsoft guidelines):
 * - 16x16: Browser favicon (tab icon)
 * - 32x32: Browser favicon (retina, taskbar)
 * - 48x48: Windows desktop icon
 * - 64x64: Browser favicon (high-res)
 * - 128x128: Chrome Web Store, small touch icon
 * - 180x180: Apple Touch Icon
 * - 192x192: Android Chrome (PWA)
 * - 256x256: Windows 10 medium tile
 * - 384x384: Android Chrome (PWA splash)
 * - 512x512: PWA icon, Google Play Store
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '../public');

// Icon sizes following platform guidelines
const ICON_SIZES = [16, 32, 48, 64, 128, 180, 192, 256, 384, 512];

// Optimized SVG with proper scaling for each size
function generateSVG(size) {
  // Adjust stroke width and node sizes based on target size
  // Smaller icons need thicker strokes relative to size for visibility
  const strokeWidth = size <= 32 ? 4 : size <= 64 ? 3.5 : 3.2;
  const nodeOuter = size <= 32 ? 3.5 : size <= 64 ? 3 : 2.5;
  const nodeInner = size <= 32 ? 2.5 : size <= 64 ? 2.2 : 1.8;
  const nodeHighlight = size <= 32 ? 1.2 : size <= 64 ? 1 : 0.8;
  const cornerRadius = Math.round(size * 0.25); // 25% corner radius

  return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs>
  <linearGradient id="gmStroke" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
    <stop stop-color="white"/>
    <stop offset="0.5" stop-color="#EAF6FF"/>
    <stop offset="1" stop-color="#CFE8EF"/>
  </linearGradient>
  <linearGradient id="gmAccent" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
    <stop stop-color="#4573DF"/>
    <stop offset="1" stop-color="#2D4FA2"/>
  </linearGradient>
  <linearGradient id="bgGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
    <stop stop-color="#23272F"/>
    <stop offset="1" stop-color="#181C22"/>
  </linearGradient>
</defs>
<rect width="64" height="64" rx="${cornerRadius}" fill="url(#bgGrad)"/>
<g transform="translate(6, 6) scale(0.8125)">
  <path d="M22 32 L32 32 L32 52 L10 52 L10 12 L32 12 L43 32 L54 12 L54 52" stroke="url(#gmStroke)" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>
  ${size >= 32 ? `
  <circle opacity="0.6" cx="22" cy="32" r="${nodeOuter}" fill="url(#gmAccent)"/>
  <circle cx="22" cy="32" r="${nodeInner}" fill="url(#gmAccent)"/>
  <circle opacity="0.9" cx="22" cy="32" r="${nodeHighlight}" fill="url(#gmStroke)"/>
  <circle opacity="0.6" cx="32" cy="12" r="${nodeOuter}" fill="url(#gmAccent)"/>
  <circle cx="32" cy="12" r="${nodeInner}" fill="url(#gmAccent)"/>
  <circle opacity="0.9" cx="32" cy="12" r="${nodeHighlight}" fill="url(#gmStroke)"/>
  <circle opacity="0.6" cx="43" cy="32" r="${nodeOuter}" fill="url(#gmAccent)"/>
  <circle cx="43" cy="32" r="${nodeInner}" fill="url(#gmAccent)"/>
  <circle opacity="0.9" cx="43" cy="32" r="${nodeHighlight}" fill="url(#gmStroke)"/>
  <circle opacity="0.6" cx="54" cy="12" r="${nodeOuter}" fill="url(#gmAccent)"/>
  <circle cx="54" cy="12" r="${nodeInner}" fill="url(#gmAccent)"/>
  <circle opacity="0.9" cx="54" cy="12" r="${nodeHighlight}" fill="url(#gmStroke)"/>
  <circle opacity="0.6" cx="54" cy="52" r="${nodeOuter}" fill="url(#gmAccent)"/>
  <circle cx="54" cy="52" r="${nodeInner}" fill="url(#gmAccent)"/>
  <circle opacity="0.9" cx="54" cy="52" r="${nodeHighlight}" fill="url(#gmStroke)"/>` : ''}
</g>
</svg>`;
}

async function generateIcons() {
  console.log('🎨 GM Logo Icon Generator\n');
  console.log('Generating optimized PNG icons...\n');

  for (const size of ICON_SIZES) {
    const svg = generateSVG(size);
    const outputPath = path.join(PUBLIC_DIR, `gm-icon-${size}.png`);
    
    try {
      await sharp(Buffer.from(svg))
        .resize(size, size)
        .png({ quality: 100, compressionLevel: 9 })
        .toFile(outputPath);
      
      console.log(`✅ Generated: gm-icon-${size}.png`);
    } catch (error) {
      console.error(`❌ Failed to generate ${size}x${size}: ${error.message}`);
    }
  }

  // Generate Apple Touch Icon with proper naming
  const appleTouchSvg = generateSVG(180);
  await sharp(Buffer.from(appleTouchSvg))
    .resize(180, 180)
    .png({ quality: 100 })
    .toFile(path.join(PUBLIC_DIR, 'apple-touch-icon.png'));
  console.log('✅ Generated: apple-touch-icon.png');

  // Generate favicon.ico compatible sizes (multi-resolution not supported by sharp, use 32x32)
  const favicon32Svg = generateSVG(32);
  await sharp(Buffer.from(favicon32Svg))
    .resize(32, 32)
    .png({ quality: 100 })
    .toFile(path.join(PUBLIC_DIR, 'favicon.png'));
  console.log('✅ Generated: favicon.png (32x32)');

  // Generate maskable icon (with safe zone padding)
  const maskableSvg = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs>
  <linearGradient id="gmStroke" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
    <stop stop-color="white"/>
    <stop offset="0.5" stop-color="#EAF6FF"/>
    <stop offset="1" stop-color="#CFE8EF"/>
  </linearGradient>
  <linearGradient id="gmAccent" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
    <stop stop-color="#4573DF"/>
    <stop offset="1" stop-color="#2D4FA2"/>
  </linearGradient>
  <linearGradient id="bgGrad" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
    <stop stop-color="#23272F"/>
    <stop offset="1" stop-color="#181C22"/>
  </linearGradient>
</defs>
<rect width="512" height="512" fill="url(#bgGrad)"/>
<g transform="translate(128, 128) scale(4)">
  <path d="M22 32 L32 32 L32 52 L10 52 L10 12 L32 12 L43 32 L54 12 L54 52" stroke="url(#gmStroke)" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
  <circle opacity="0.6" cx="22" cy="32" r="2.5" fill="url(#gmAccent)"/>
  <circle cx="22" cy="32" r="1.8" fill="url(#gmAccent)"/>
  <circle opacity="0.9" cx="22" cy="32" r="0.8" fill="url(#gmStroke)"/>
  <circle opacity="0.6" cx="32" cy="12" r="2.5" fill="url(#gmAccent)"/>
  <circle cx="32" cy="12" r="1.8" fill="url(#gmAccent)"/>
  <circle opacity="0.9" cx="32" cy="12" r="0.8" fill="url(#gmStroke)"/>
  <circle opacity="0.6" cx="43" cy="32" r="2.5" fill="url(#gmAccent)"/>
  <circle cx="43" cy="32" r="1.8" fill="url(#gmAccent)"/>
  <circle opacity="0.9" cx="43" cy="32" r="0.8" fill="url(#gmStroke)"/>
  <circle opacity="0.6" cx="54" cy="12" r="2.5" fill="url(#gmAccent)"/>
  <circle cx="54" cy="12" r="1.8" fill="url(#gmAccent)"/>
  <circle opacity="0.9" cx="54" cy="12" r="0.8" fill="url(#gmStroke)"/>
  <circle opacity="0.6" cx="54" cy="52" r="2.5" fill="url(#gmAccent)"/>
  <circle cx="54" cy="52" r="1.8" fill="url(#gmAccent)"/>
  <circle opacity="0.9" cx="54" cy="52" r="0.8" fill="url(#gmStroke)"/>
</g>
</svg>`;

  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png({ quality: 100 })
    .toFile(path.join(PUBLIC_DIR, 'gm-icon-maskable-512.png'));
  console.log('✅ Generated: gm-icon-maskable-512.png (with safe zone)');

  console.log('\n🎉 Icon generation complete!\n');
  console.log('Generated icons:');
  ICON_SIZES.forEach(size => console.log(`  • gm-icon-${size}.png`));
  console.log('  • apple-touch-icon.png');
  console.log('  • favicon.png');
  console.log('  • gm-icon-maskable-512.png');
}

generateIcons().catch(console.error);
