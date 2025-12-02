/**
 * Cache Configuration
 *
 * Configuration for Redis and caching system
 */

import type { CacheConfig } from '../types';

/**
 * Get cache configuration from environment
 */
export function getCacheConfig(): CacheConfig {
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL || '3600', 10), // 1 hour
    keyPrefix: process.env.CACHE_KEY_PREFIX || 'mykadoo:',
    enablePooling: process.env.CACHE_ENABLE_POOLING === 'true',
    maxPoolSize: parseInt(process.env.CACHE_MAX_POOL_SIZE || '10', 10),
  };
}

/**
 * Cache TTL presets (in seconds)
 */
export const CacheTTL = {
  /** 5 minutes */
  SHORT: 300,
  /** 1 hour */
  MEDIUM: 3600,
  /** 24 hours */
  LONG: 86400,
  /** 7 days */
  WEEK: 604800,
  /** 30 days */
  MONTH: 2592000,
} as const;

/**
 * Validate cache configuration
 */
export function validateCacheConfig(config: CacheConfig): void {
  if (!config.host) {
    throw new Error('REDIS_HOST is required for cache configuration');
  }

  if (config.port < 1 || config.port > 65535) {
    throw new Error('REDIS_PORT must be between 1 and 65535');
  }

  if (config.defaultTTL < 0) {
    throw new Error('CACHE_DEFAULT_TTL must be non-negative');
  }

  if (config.enablePooling && config.maxPoolSize! < 1) {
    throw new Error('CACHE_MAX_POOL_SIZE must be at least 1 when pooling is enabled');
  }
}
