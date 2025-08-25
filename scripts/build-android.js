#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get version from package.json
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
const version = packageJson.version;

// Create package/android directory if it doesn't exist
const packageDir = path.join(__dirname, '..', 'package', 'android');
if (!fs.existsSync(packageDir)) {
  fs.mkdirSync(packageDir, { recursive: true });
  console.log('Created package/android directory');
}

try {
  console.log('Building Android APK...');
  
  // Build the APK
  execSync('npx expo run:android --variant release', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  
  // Find and copy APK to package directory
  const androidBuildDir = path.join(__dirname, '..', 'android', 'app', 'build', 'outputs', 'apk', 'release');
  
  if (fs.existsSync(androidBuildDir)) {
    const files = fs.readdirSync(androidBuildDir);
    const apkFile = files.find(file => file.endsWith('.apk'));
    
    if (apkFile) {
      const sourcePath = path.join(androidBuildDir, apkFile);
      const destPath = path.join(packageDir, `curate-v${version}.apk`);
      
      fs.copyFileSync(sourcePath, destPath);
      console.log(`✅ APK copied to: package/android/curate-v${version}.apk`);
    } else {
      console.log('❌ No APK file found in build output');
    }
  } else {
    console.log('❌ Android build directory not found');
  }
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}