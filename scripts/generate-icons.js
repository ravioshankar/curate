const fs = require('fs');
const path = require('path');

// Icon specifications
const RUBY_RED = '#B91C1C';
const WHITE = '#FFFFFF';

// Icon sizes for different platforms
const ICON_SIZES = {
  // iOS App Icons
  ios: [
    { size: 20, name: 'icon-20.svg' },
    { size: 29, name: 'icon-29.svg' },
    { size: 40, name: 'icon-40.svg' },
    { size: 58, name: 'icon-58.svg' },
    { size: 60, name: 'icon-60.svg' },
    { size: 80, name: 'icon-80.svg' },
    { size: 87, name: 'icon-87.svg' },
    { size: 120, name: 'icon-120.svg' },
    { size: 180, name: 'icon-180.svg' },
    { size: 1024, name: 'icon-1024.svg' }
  ],
  
  // Android Icons
  android: [
    { size: 36, name: 'icon-36.svg' },
    { size: 48, name: 'icon-48.svg' },
    { size: 72, name: 'icon-72.svg' },
    { size: 96, name: 'icon-96.svg' },
    { size: 144, name: 'icon-144.svg' },
    { size: 192, name: 'icon-192.svg' },
    { size: 512, name: 'icon-512.svg' }
  ],
  
  // Web Icons
  web: [
    { size: 16, name: 'favicon-16.svg' },
    { size: 32, name: 'favicon-32.svg' },
    { size: 96, name: 'favicon-96.svg' },
    { size: 192, name: 'icon-192.svg' },
    { size: 512, name: 'icon-512.svg' }
  ],
  
  // Main App Icons
  main: [
    { size: 1024, name: 'icon.svg' },
    { size: 1024, name: 'adaptive-icon.svg' },
    { size: 400, name: 'splash-icon.svg' },
    { size: 32, name: 'favicon.svg' }
  ]
};

function generateSVGIcon(size, isAdaptive = false) {
  const diamondSize = size * (isAdaptive ? 0.25 : 0.3);
  const fontSize = size * (isAdaptive ? 0.15 : 0.18);
  const centerX = size / 2;
  const centerY = size / 2;
  const diamondY = centerY - fontSize * 0.3;
  const textY = centerY + diamondSize * 0.4;
  
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${RUBY_RED}"/>
  <polygon points="${centerX},${diamondY - diamondSize/2} ${centerX + diamondSize*0.6/2},${diamondY} ${centerX},${diamondY + diamondSize/2} ${centerX - diamondSize*0.6/2},${diamondY}" fill="${WHITE}"/>
  <text x="${centerX}" y="${textY}" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" text-anchor="middle" dominant-baseline="middle" fill="${WHITE}">C</text>
</svg>`;
}

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function generateAllIcons() {
  const assetsDir = path.join(__dirname, '..', 'assets', 'images');
  ensureDirectoryExists(assetsDir);
  
  // Generate main icons
  console.log('Generating main icons...');
  ICON_SIZES.main.forEach(({ size, name }) => {
    const isAdaptive = name.includes('adaptive');
    const svgContent = generateSVGIcon(size, isAdaptive);
    const filePath = path.join(assetsDir, name);
    fs.writeFileSync(filePath, svgContent);
    console.log(`✓ Generated ${name} (${size}x${size})`);
  });
  
  // Generate platform-specific icons
  Object.entries(ICON_SIZES).forEach(([platform, sizes]) => {
    if (platform === 'main') return;
    
    const platformDir = path.join(assetsDir, platform);
    ensureDirectoryExists(platformDir);
    
    console.log(`\nGenerating ${platform} icons...`);
    sizes.forEach(({ size, name }) => {
      const svgContent = generateSVGIcon(size);
      const filePath = path.join(platformDir, name);
      fs.writeFileSync(filePath, svgContent);
      console.log(`✓ Generated ${platform}/${name} (${size}x${size})`);
    });
  });
  
  console.log('\n🎉 All SVG icons generated successfully!');
  console.log('\nTo convert to PNG, use an online converter or ImageMagick:');
  console.log('convert icon.svg icon.png');
}

// Run the generator
try {
  generateAllIcons();
} catch (error) {
  console.error('Error generating icons:', error);
  process.exit(1);
}