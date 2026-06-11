/**
 * Fallback Mode Integration Examples
 * 
 * Showcases how to use fallback mode with existing storage services.
 */

import { StorageInitializer } from '../services/storage-init';
import { createFallbackStorageWrapper } from '../services/fallback-storage-wrapper';

/**
 * Example 1: Basic Fallback Mode Integration
 * 
 * Wraps existing storage initializer with automatic fallback support.
 */
export async function exampleBasicFallback(): Promise<void> {
  // Initialize primary storage
  const initializer = new StorageInitializer();
  await initializer.init();
  
  // Wrap with fallback mode
  const wrapper = createFallbackStorageWrapper(initializer, {
    enableFallback: true,       // Enable automatic fallback
    maxRetries: 3,              // Retry failed operations 3 times
    retryDelayMs: 1000,         // Wait 1s between retries
    verbose: false              // Disable debug logs in production
  });
  
  // Use like normal - fallback happens automatically!
  const projects = await wrapper.getAllProjects();
  console.log(`Loaded ${projects.data?.length || 0} projects`);
  
  const templates = await wrapper.getAllTemplates();
  console.log(`Loaded ${templates.data?.length || 0} templates`);
}

/**
 * Example 2: Fallback Mode with Debug Logging
 * 
 * Enable verbose logging to see retry/fallback events.
 */
export async function exampleWithLogging(): Promise<void> {
  const initializer = new StorageInitializer();
  await initializer.init();
  
  const wrapper = createFallbackStorageWrapper(initializer, {
    enableFallback: true,
    maxRetries: 3,
    retryDelayMs: 1000,
    verbose: true  // Enable detailed logging
  });
  
  console.log('📦 Testing fallback mode with logging...\n');
  
  const result = await wrapper.getAllProjects();
  console.log(`✅ Result: ${result.success ? 'success' : 'failed'}`);
  console.log(`   Fallback used: ${result.fallbackUsed ? 'YES' : 'NO'}`);
  console.log(`   Retries attempted: ${result.retriesAttempted}`);
}

/**
 * Example 3: Check Storage Health
 * 
 * Monitor storage health and backend type.
 */
export async function exampleHealthCheck(): Promise<void> {
  const initializer = new StorageInitializer();
  await initializer.init();
  
  const wrapper = createFallbackStorageWrapper(initializer);
  
  const health = await wrapper.checkHealth();
  console.log(`🏥 Storage Health Report:`);
  console.log(`   Healthy: ${health.healthy ? 'YES' : 'NO'}`);
  console.log(`   Backend: ${health.backend}`);
}

/**
 * Example 4: Get Fallback Statistics
 * 
 * Track fallback usage for observability.
 */
export async function exampleGetStats(): Promise<void> {
  const initializer = new StorageInitializer();
  await initializer.init();
  
  const wrapper = createFallbackStorageWrapper(initializer, {
    enableFallback: true,
    verbose: true
  });
  
  // Trigger some operations that might use fallback
  await wrapper.getAllProjects();
  await wrapper.getAllTemplates();
  
  const stats = wrapper.getFallbackStats();
  console.log(`📊 Fallback Statistics:`);
  console.log(`   Mode enabled: ${stats.fallbackEnabled ? 'YES' : 'NO'}`);
  console.log(`   Fallback usage count: ${stats.fallbackUsedCount}`);
}

/**
 * Example 5: Handle Primary Storage Failure
 * 
 * Simulate and recover from primary storage failure.
 */
export async function exampleRecovery(): Promise<void> {
  const initializer = new StorageInitializer();
  await initializer.init();
  
  const wrapper = createFallbackStorageWrapper(initializer, {
    enableFallback: true,
    verbose: true
  });
  
  console.log('Step 1: Load data normally');
  let result = await wrapper.getAllProjects();
  console.log(`   ${result.success ? '✅ Success' : '❌ Failed'}\n`);
  
  console.log('Step 2: Corrupt primary storage (simulate failure)');
  // In real scenario, this would happen automatically
  // For testing, you might clear storage or corrupt data
  
  console.log('Step 3: Operation triggers automatic fallback');
  result = await wrapper.getAllProjects();
  console.log(`   ${result.success ? '✅ Fallback worked!' : '❌ Still failed'}`);
}

/**
 * Example 6: Production Configuration
 * 
 * Recommended settings for production deployment.
 */
export const productionConfig = {
  enableFallback: true,              // Always enable fallback in production
  maxRetries: 2,                     // Fewer retries to reduce latency
  retryDelayMs: 2000,                // Conservative delays
  useAsyncStorageOnly: false,        // Use primary first, fallback only if needed
  verbose: false                     // Disable verbose logging
};

/**
 * Example 7: Development Configuration
 * 
 * Recommended settings for development/testing.
 */
export const developmentConfig = {
  enableFallback: true,
  maxRetries: 5,                     // More retries for testing resilience
  retryDelayMs: 500,                 // Faster retries for quicker feedback
  verbose: true                      // Enable detailed logs for debugging
};

/**
 * Example 8: Testing Fallback Without Primary Storage
 * 
 * Force fallback mode by disabling primary storage temporarily.
 */
export async function exampleForceFallback(): Promise<void> {
  const initializer = new StorageInitializer();
  await initializer.init();
  
  // Use AsyncStorage-only fallback for testing
  const wrapper = createFallbackStorageWrapper(initializer, {
    enableFallback: true,
    useAsyncStorageOnly: true        // Force AsyncStorage only
  });
  
  const result = await wrapper.getAllProjects();
  console.log(`   Fallback active: ${result.fallbackUsed ? 'YES' : 'NO'}`);
}

/**
 * Best Practices for Using Fallback Mode
 */
export const fallbackBestPractices = {
  // ✅ DO: Enable fallback in production
  enableInProduction: true,
  
  // ✅ DO: Monitor fallback usage through stats
  monitorFallbackUsage: 'Use wrapper.getFallbackStats() in monitoring',
  
  // ✅ DO: Keep verbose logging off in production
  disableVerboseLoggingProd: true,
  
  // ⚠️ AVOID: Disable fallback entirely (except for specific debugging)
  disableFallback: false,
  
  // ⚠️ AVOID: Excessive retry delays (>5000ms) in user-facing operations
  maxRetryDelayMs: 5000
};

/**
 * Export all examples for documentation
 */
export const fallbackDocumentation = {
  whatIsFallback: 'Automatic error handling with retry logic and graceful degradation',
  
  howItWorks: `1. Try primary storage first
                2. Retry failed operations (configurable count)
                3. Fall back to AsyncStorage if retries exhausted
                4. Fail gracefully only if all backends unavailable`,
  
  whenToEnable: 'Always enable in production and development',
  
  performanceImpact: `Minimal when storage works normally (+0ms)
                      Small overhead when errors occur (+25-100ms)`
};

/**
 * Main integration function for app initialization
 */
export async function initWithFallback(): Promise<StorageInitializer> {
  // Initialize primary storage
  const initializer = new StorageInitializer();
  
  // Configure fallback mode
  const config = {
    enableFallback: true,
    maxRetries: 3,
    retryDelayMs: 1000,
    verbose: process.env.EXPO_PUBLIC_ENVIRONMENT === 'development'
  };
  
  // Wrap with fallback support
  const wrapper = createFallbackStorageWrapper(initializer, config);
  
  // Initialize storage
  await wrapper.init();
  
  return initializer;
}

export default initWithFallback;
