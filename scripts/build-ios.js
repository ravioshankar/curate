#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get version from package.json
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
const version = packageJson.version;

// Create package/ios directory if it doesn't exist
const packageDir = path.join(__dirname, '..', 'package', 'ios');
if (!fs.existsSync(packageDir)) {
  fs.mkdirSync(packageDir, { recursive: true });
  console.log('Created package/ios directory');
}

try {
  console.log('Building iOS app...');
  
  // Build the iOS app
  execSync('npx expo run:ios --configuration Release', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  
  // Find and copy .app bundle to package directory
  const iosBuildDir = path.join(__dirname, '..', 'ios', 'build', 'Build', 'Products', 'Release-iphonesimulator');
  
  if (fs.existsSync(iosBuildDir)) {
    const files = fs.readdirSync(iosBuildDir);
    const appBundle = files.find(file => file.endsWith('.app'));
    
    if (appBundle) {
      const sourcePath = path.join(iosBuildDir, appBundle);
      const destPath = path.join(packageDir, `curate-v${version}.app`);
      
      // Copy entire .app bundle directory
      execSync(`cp -R "${sourcePath}" "${destPath}"`, { stdio: 'inherit' });
      console.log(`✅ iOS app copied to: package/ios/curate-v${version}.app`);
    } else {
      console.log('❌ No .app bundle found in build output');
    }
  } else {
    console.log('❌ iOS build directory not found');
  }
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}