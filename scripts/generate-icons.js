const fs = require('fs');
const path = require('path');

// Create directories if they don't exist
const createDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Three-circle logo SVG template
const createSVG = (size) => `<svg width="${size}" height="${size}" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  <!-- Red circle -->
  <circle cx="45" cy="45" r="25" fill="#DC2626" opacity="0.8"/>
  
  <!-- Blue circle -->
  <circle cx="75" cy="45" r="25" fill="#2563EB" opacity="0.8"/>
  
  <!-- Green circle -->
  <circle cx="60" cy="75" r="25" fill="#16A34A" opacity="0.8"/>
</svg>`;

// Icon configurations
const icons = [
  { name: 'icon.png', size: 1024 },
  { name: 'adaptive-icon.png', size: 1024 },
  { name: 'splash-icon.png', size: 1024 },
  { name: 'favicon.png', size: 48 }
];

// Generate all icons
icons.forEach(({ name, size }) => {
  const svgContent = createSVG(size);
  const svgPath = path.join(__dirname, '..', 'assets', 'images', `${name.replace('.png', '.svg')}`);
  
  createDir(path.dirname(svgPath));
  fs.writeFileSync(svgPath, svgContent);
  console.log(`Generated ${svgPath}`);
});

console.log('All icon SVGs generated successfully!');