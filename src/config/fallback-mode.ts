/**
 * Fallback Mode Configuration (Fallback Mode)
 * 
 * Defines fallback behavior for iQRate storage layer.
 * When enabled, the system gracefully degrades from primary storage
 * to AsyncStorage when failures occur.
 */

export interface FallbackModeOptions {
  /** Enable fallback mode (graceful degradation) */
  enabled: boolean;
  
  /** Enable AsyncStorage fallback when primary fails */
  enableAsyncStorageFallback: boolean;
  
  /** Maximum retry attempts before using fallback */
  maxRetries: number;
  
  /** Delay between retries in milliseconds */
  retryDelayMs: number;
  
  /** Maximum time to wait before switching storage backends */
  failoverTimeoutMs: number;
  
  /** Enable verbose logging for debugging */
  verboseLogging: boolean;
  
  /** Log fallback events to console */
  logFallbackEvents: boolean;
  
  /** Health check interval in milliseconds */
  healthCheckIntervalMs: number;
}

/**
 * Default fallback mode configuration
 */
export const defaultFallbackModeOptions: FallbackModeOptions = {
  enabled: true,
  enableAsyncStorageFallback: true,
  maxRetries: 3,
  retryDelayMs: 1000,
  failoverTimeoutMs: 30000,
  verboseLogging: false,
  logFallbackEvents: true,
  healthCheckIntervalMs: 60000 // Check health every minute in background
};

/**
 * Environment-specific fallback configuration overrides
 */
export const getFallbackModeConfig = (environment: string): FallbackModeOptions & {
  fallbackEnabled: boolean;
} => {
  
  switch (environment) {
    case 'development':
      return {
        ...defaultFallbackModeOptions,
        verboseLogging: true,
        logFallbackEvents: true,
        maxRetries: 5, // More retries in dev
        retryDelayMs: 500, // Faster retries in dev
        fallbackEnabled: true
      };
      
    case 'test':
      return {
        ...defaultFallbackModeOptions,
        verboseLogging: true,
        maxRetries: 10, // Extra retries for test stability
        retryDelayMs: 250,
        fallbackEnabled: true
      };
      
    default: // production
      return {
        ...defaultFallbackModeOptions,
        verboseLogging: false,
        logFallbackEvents: true, // Always log fallback events in prod
        maxRetries: 2,
        retryDelayMs: 2000,
        fallbackEnabled: true
      };
  }
};

/**
 * Fallback mode status enum
 */
export enum FallbackModeStatus {
  HEALTHY = 'healthy',    // Primary storage working normally
  DEGRADED = 'degraded',  // Primary struggling, using fallback
  FAILOVER = 'failover',  // Switched to AsyncStorage only
  UNHEALTHY = 'unhealthy' // All backends failed
}

/**
 * Fallback mode status object
 */
export interface FallbackModeStatusResult {
  status: FallbackModeStatus;
  currentBackend: 'primary' | 'asyncStorage';
  fallbackUsed: boolean;
  lastError?: string;
  retryCount?: number;
  healthScore: number; // 0-100, higher is better
}

/**
 * Initialize and configure fallback mode
 */
export function initFallbackMode(): FallbackModeConfig {
  const environment = process.env.EXPO_PUBLIC_ENVIRONMENT || 'development';
  return {
    config: getFallbackModeConfig(environment),
    initializedAt: new Date().toISOString(),
    version: '1.0.0'
  };
}

/**
 * Fallback mode configuration class
 */
export interface FallbackModeConfig {
  config: FallbackModeOptions;
  initializedAt: string;
  version: string;
}

export default initFallbackMode;
