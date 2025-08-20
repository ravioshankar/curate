const { getDefaultConfig } = require('@expo/metro-config');

/**
 * Metro by default doesn't treat `.wasm` as an asset which causes imports like
 * `./wa-sqlite/wa-sqlite.wasm` to fail to resolve. Add `wasm` to assetExts so
 * the bundler will include the file and allow `expo-sqlite`'s web worker to load it.
 */
const defaultConfig = getDefaultConfig(__dirname);

if (!defaultConfig.resolver) defaultConfig.resolver = {};
defaultConfig.resolver.assetExts = defaultConfig.resolver.assetExts || [];
if (!defaultConfig.resolver.assetExts.includes('wasm')) {
  defaultConfig.resolver.assetExts.push('wasm');
}

module.exports = defaultConfig;
