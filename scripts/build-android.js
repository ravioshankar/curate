#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const versionType = process.argv[2] || 'patch';

// Get version from app.json
const appJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'app.json'), 'utf8'));
let version = appJson.expo.version;

// Parse semVer and increment based on type
let [major, minor, patch] = version.split('.').map(Number);

switch (versionType) {
  case 'major':
    major += 1;
    minor = 0;
    patch = 0;
    break;
  case 'minor':
    minor += 1;
    patch = 0;
    break;
  case 'patch':
  default:
    patch += 1;
    break;
}

version = `${major}.${minor}.${patch}`;

// Calculate version code from semVer (major*10000 + minor*100 + patch)
const versionCode = major * 10000 + minor * 100 + patch;

// Update app.json
appJson.expo.version = version;
appJson.expo.android.versionCode = versionCode;
fs.writeFileSync(path.join(__dirname, '..', 'app.json'), JSON.stringify(appJson, null, 2));
console.log(`📱 Updated ${versionType} version: ${version} (code: ${versionCode})`);

// Update build.gradle
const buildGradlePath = path.join(__dirname, '..', 'android', 'app', 'build.gradle');
let buildGradleContent = fs.readFileSync(buildGradlePath, 'utf8');
buildGradleContent = buildGradleContent.replace(/versionCode \d+/, `versionCode ${versionCode}`);
buildGradleContent = buildGradleContent.replace(/versionName "[^"]+"/, `versionName "${version}"`);
fs.writeFileSync(buildGradlePath, buildGradleContent);
console.log(`🔧 Updated build.gradle: ${version} (code: ${versionCode})`);

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('\nUsage: node build-android.js [patch|minor|major]');
  console.log('  patch: 1.0.0 -> 1.0.1 (default)');
  console.log('  minor: 1.0.0 -> 1.1.0');
  console.log('  major: 1.0.0 -> 2.0.0');
  process.exit(0);
}


// Create package/android directory if it doesn't exist
const packageDir = path.join(__dirname, '..', 'package', 'android');
if (!fs.existsSync(packageDir)) {
  fs.mkdirSync(packageDir, { recursive: true });
  console.log('Created package/android directory');
}

try {
  // Check if keystore exists, generate if missing
  const keystorePath = path.join(__dirname, '..', 'android', 'app', 'iQRate-release-key.keystore');
  if (!fs.existsSync(keystorePath)) {
    console.log('Keystore not found, generating...');
    execSync('npm run generate-keystore', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
  }
  
  console.log('Building Android APK...');
  
  // Build the APK using gradle directly
  execSync('cd android && ./gradlew assembleRelease', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  
  // Build the AAB
  console.log('Building AAB...');
  execSync('cd android && ./gradlew bundleRelease', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  
  // Find and copy APK
  const apkBuildDir = path.join(__dirname, '..', 'android', 'app', 'build', 'outputs', 'apk', 'release');
  
  if (fs.existsSync(apkBuildDir)) {
    const files = fs.readdirSync(apkBuildDir);
    const apkFile = files.find(file => file.endsWith('.apk'));
    
    if (apkFile) {
      const sourcePath = path.join(apkBuildDir, apkFile);
      const destPath = path.join(packageDir, `iQRate-v${version}-${versionCode}.apk`);
      
      fs.copyFileSync(sourcePath, destPath);
      console.log(`✅ APK copied to: package/android/iQRate-v${version}-${versionCode}.apk`);
    } else {
      console.log('❌ No APK file found in build output');
    }
  } else {
    console.log('❌ Android APK build directory not found');
  }
  
  // Find and copy AAB
  const aabBuildDir = path.join(__dirname, '..', 'android', 'app', 'build', 'outputs', 'bundle', 'release');
  
  if (fs.existsSync(aabBuildDir)) {
    const files = fs.readdirSync(aabBuildDir);
    const aabFile = files.find(file => file.endsWith('.aab'));
    
    if (aabFile) {
      const sourcePath = path.join(aabBuildDir, aabFile);
      const destPath = path.join(packageDir, `iQRate-v${version}-${versionCode}.aab`);
      
      fs.copyFileSync(sourcePath, destPath);
      console.log(`✅ AAB copied to: package/android/iQRate-v${version}-${versionCode}.aab`);
    } else {
      console.log('❌ No AAB file found in build output');
    }
  } else {
    console.log('❌ Android AAB build directory not found');
  }
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}