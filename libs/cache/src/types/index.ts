/**
 * Cache Types
 *
 * Type definitions for caching system
 */

/**
 * Cache configuration options
 */
export interface CacheConfig {
  /** Redis host */
  host: string;
  /** Redis port */
  port: number;
  /** Redis password (optional) */
  password?: string;
  /** Redis database number */
  db?: number;
  /** Default TTL in seconds */
  defaultTTL: number;
  /** Key prefix for namespacing */
  keyPrefix?: string;
  /** Enable connection pooling */
  enablePooling?: boolean;
  /** Maximum number of connections in pool */
  maxPoolSize?: number;
}

/**
 * Cache options for individual operations
 */
export interface CacheOptions {
  /** Time to live in seconds */
  ttl?: number;
  /** Cache key prefix */
  prefix?: string;
  /** Tags for cache invalidation */
  tags?: string[];
}

/**
 * Cache statistics
 */
export interface CacheStats {
  /** Total cache hits */
  hits: number;
  /** Total cache misses */
  misses: number;
  /** Hit rate percentage */
  hitRate: number;
  /** Total keys in cache */
  totalKeys: number;
  /** Memory usage in bytes */
  memoryUsage: number;
}

/**
 * Cache service interface
 */
export interface ICacheService {
  /**
   * Get value from cache
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Set value in cache
   */
  set<T>(key: string, value: T, options?: CacheOptions): Promise<void>;

  /**
   * Delete value from cache
   */
  del(key: string): Promise<void>;

  /**
   * Delete multiple keys
   */
  delMany(keys: string[]): Promise<void>;

  /**
   * Check if key exists
   */
  exists(key: string): Promise<boolean>;

  /**
   * Get remaining TTL for a key
   */
  ttl(key: string): Promise<number>;

  /**
   * Clear all keys with a specific prefix
   */
  clearPrefix(prefix: string): Promise<void>;

  /**
   * Clear all keys
   */
  clear(): Promise<void>;

  /**
   * Get cache statistics
   */
  getStats(): Promise<CacheStats>;

  /**
   * Invalidate cache by tags
   */
  invalidateByTags(tags: string[]): Promise<void>;
}

/**
 * Cache key builder helper
 */
export class CacheKey {
  /**
   * Build search result cache key
   */
  static search(params: {
    occasion: string;
    relationship: string;
    ageRange: string;
    budgetMin: number;
    budgetMax: number;
  }): string {
    const { occasion, relationship, ageRange, budgetMin, budgetMax } = params;
    return `search:${occasion}:${relationship}:${ageRange}:${budgetMin}-${budgetMax}`;
  }

  /**
   * Build user profile cache key
   */
  static userProfile(userId: string): string {
    return `user:profile:${userId}`;
  }

  /**
   * Build recipient profile cache key
   */
  static recipientProfile(userId: string, profileId: string): string {
    return `recipient:${userId}:${profileId}`;
  }

  /**
   * Build feedback analytics cache key
   */
  static analytics(startDate?: string, endDate?: string): string {
    const dateRange = startDate && endDate ? `:${startDate}:${endDate}` : '';
    return `analytics${dateRange}`;
  }

  /**
   * Build AI model response cache key
   */
  static aiResponse(model: string, promptHash: string): string {
    return `ai:${model}:${promptHash}`;
  }

  /**
   * Build rate limit cache key
   */
  static rateLimit(identifier: string, window: string): string {
    return `ratelimit:${identifier}:${window}`;
  }
}
