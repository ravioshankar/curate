#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const keystorePath = path.join(__dirname, '..', 'android', 'app', 'curate-release-key.keystore');

// Check if keystore already exists
if (fs.existsSync(keystorePath)) {
  console.log('✅ Keystore already exists at:', keystorePath);
  process.exit(0);
}

try {
  console.log('Generating Android release keystore...');
  
  // Generate keystore
  execSync(`keytool -genkeypair -v -storetype PKCS12 -keystore ${keystorePath} -alias curate-key-alias -keyalg RSA -keysize 2048 -validity 10000 -storepass curateapp123 -keypass curateapp123 -dname "CN=Curate, OU=Development, O=Curate, L=City, ST=State, C=US"`, {
    stdio: 'inherit'
  });
  
  console.log('✅ Keystore generated successfully at:', keystorePath);
  console.log('Store Password: curateapp123');
  console.log('Key Password: curateapp123');
  console.log('Alias: curate-key-alias');
  
} catch (error) {
  console.error('❌ Failed to generate keystore:', error.message);
  process.exit(1);
}