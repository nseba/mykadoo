/**
 * Cache Service
 *
 * Redis-based caching service with in-memory fallback
 */

import type {
  ICacheService,
  CacheConfig,
  CacheOptions,
  CacheStats,
} from '../types';

/**
 * Cache Service Implementation
 *
 * Provides Redis caching with automatic fallback to in-memory cache
 */
export class CacheService implements ICacheService {
  private config: CacheConfig;
  private redis: any = null; // Will be Redis client when available
  private memoryCache: Map<string, { value: any; expiresAt: number; tags: string[] }>;
  private stats = {
    hits: 0,
    misses: 0,
  };

  constructor(config: CacheConfig) {
    this.config = config;
    this.memoryCache = new Map();

    // NOTE: Redis client initialization will be added when Redis is available
    // For now, using in-memory cache as fallback
    console.warn('Cache: Using in-memory fallback (Redis not initialized)');

    // Clean up expired entries every minute
    setInterval(() => this.cleanupExpired(), 60000);
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const fullKey = this.buildKey(key);

    // Try Redis first (when available)
    if (this.redis) {
      try {
        const value = await this.redis.get(fullKey);
        if (value) {
          this.stats.hits++;
          return JSON.parse(value) as T;
        }
      } catch (error) {
        console.error('Cache get error (Redis):', error);
      }
    }

    // Fallback to memory cache
    const cached = this.memoryCache.get(fullKey);
    if (cached && cached.expiresAt > Date.now()) {
      this.stats.hits++;
      return cached.value as T;
    }

    if (cached && cached.expiresAt <= Date.now()) {
      this.memoryCache.delete(fullKey);
    }

    this.stats.misses++;
    return null;
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    const fullKey = this.buildKey(key);
    const ttl = options?.ttl || this.config.defaultTTL;
    const tags = options?.tags || [];

    // Try Redis first (when available)
    if (this.redis) {
      try {
        await this.redis.setex(fullKey, ttl, JSON.stringify(value));
        if (tags.length > 0) {
          await this.tagKey(fullKey, tags);
        }
        return;
      } catch (error) {
        console.error('Cache set error (Redis):', error);
      }
    }

    // Fallback to memory cache
    this.memoryCache.set(fullKey, {
      value,
      expiresAt: Date.now() + ttl * 1000,
      tags,
    });
  }

  /**
   * Delete value from cache
   */
  async del(key: string): Promise<void> {
    const fullKey = this.buildKey(key);

    if (this.redis) {
      try {
        await this.redis.del(fullKey);
        return;
      } catch (error) {
        console.error('Cache del error (Redis):', error);
      }
    }

    this.memoryCache.delete(fullKey);
  }

  /**
   * Delete multiple keys
   */
  async delMany(keys: string[]): Promise<void> {
    const fullKeys = keys.map((k) => this.buildKey(k));

    if (this.redis) {
      try {
        await this.redis.del(...fullKeys);
        return;
      } catch (error) {
        console.error('Cache delMany error (Redis):', error);
      }
    }

    fullKeys.forEach((key) => this.memoryCache.delete(key));
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    const fullKey = this.buildKey(key);

    if (this.redis) {
      try {
        const exists = await this.redis.exists(fullKey);
        return exists === 1;
      } catch (error) {
        console.error('Cache exists error (Redis):', error);
      }
    }

    const cached = this.memoryCache.get(fullKey);
    return cached !== undefined && cached.expiresAt > Date.now();
  }

  /**
   * Get remaining TTL for a key
   */
  async ttl(key: string): Promise<number> {
    const fullKey = this.buildKey(key);

    if (this.redis) {
      try {
        return await this.redis.ttl(fullKey);
      } catch (error) {
        console.error('Cache ttl error (Redis):', error);
      }
    }

    const cached = this.memoryCache.get(fullKey);
    if (cached && cached.expiresAt > Date.now()) {
      return Math.floor((cached.expiresAt - Date.now()) / 1000);
    }

    return -2; // Key doesn't exist
  }

  /**
   * Clear all keys with a specific prefix
   */
  async clearPrefix(prefix: string): Promise<void> {
    const fullPrefix = this.buildKey(prefix);

    if (this.redis) {
      try {
        const keys = await this.redis.keys(`${fullPrefix}*`);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
        return;
      } catch (error) {
        console.error('Cache clearPrefix error (Redis):', error);
      }
    }

    // Memory cache fallback
    const keysToDelete: string[] = [];
    this.memoryCache.forEach((_, key) => {
      if (key.startsWith(fullPrefix)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => this.memoryCache.delete(key));
  }

  /**
   * Clear all keys
   */
  async clear(): Promise<void> {
    if (this.redis) {
      try {
        await this.redis.flushdb();
        return;
      } catch (error) {
        console.error('Cache clear error (Redis):', error);
      }
    }

    this.memoryCache.clear();
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;

    let totalKeys = 0;
    let memoryUsage = 0;

    if (this.redis) {
      try {
        totalKeys = await this.redis.dbsize();
        const info = await this.redis.info('memory');
        const match = info.match(/used_memory:(\d+)/);
        if (match) {
          memoryUsage = parseInt(match[1], 10);
        }
      } catch (error) {
        console.error('Cache getStats error (Redis):', error);
      }
    } else {
      totalKeys = this.memoryCache.size;
      // Rough estimate of memory usage
      memoryUsage = totalKeys * 1024; // Assume 1KB per entry
    }

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate,
      totalKeys,
      memoryUsage,
    };
  }

  /**
   * Invalidate cache by tags
   */
  async invalidateByTags(tags: string[]): Promise<void> {
    if (this.redis) {
      try {
        for (const tag of tags) {
          const keys = await this.redis.smembers(`tag:${tag}`);
          if (keys.length > 0) {
            await this.redis.del(...keys);
            await this.redis.del(`tag:${tag}`);
          }
        }
        return;
      } catch (error) {
        console.error('Cache invalidateByTags error (Redis):', error);
      }
    }

    // Memory cache fallback
    const keysToDelete: string[] = [];
    this.memoryCache.forEach((cached, key) => {
      if (cached.tags.some((tag) => tags.includes(tag))) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => this.memoryCache.delete(key));
  }

  /**
   * Build full cache key with prefix
   */
  private buildKey(key: string): string {
    return `${this.config.keyPrefix || ''}${key}`;
  }

  /**
   * Tag a key for invalidation
   */
  private async tagKey(key: string, tags: string[]): Promise<void> {
    if (!this.redis) return;

    try {
      for (const tag of tags) {
        await this.redis.sadd(`tag:${tag}`, key);
      }
    } catch (error) {
      console.error('Cache tagKey error:', error);
    }
  }

  /**
   * Clean up expired entries from memory cache
   */
  private cleanupExpired(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.memoryCache.forEach((cached, key) => {
      if (cached.expiresAt <= now) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.memoryCache.delete(key));

    if (keysToDelete.length > 0) {
      console.log(`Cache: Cleaned up ${keysToDelete.length} expired entries`);
    }
  }

  /**
   * Get or set pattern (cache-aside)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, options);
    return value;
  }

  /**
   * Wrap a function with caching
   */
  cached<TArgs extends any[], TResult>(
    keyFactory: (...args: TArgs) => string,
    fn: (...args: TArgs) => Promise<TResult>,
    options?: CacheOptions
  ): (...args: TArgs) => Promise<TResult> {
    return async (...args: TArgs): Promise<TResult> => {
      const key = keyFactory(...args);
      return this.getOrSet(key, () => fn(...args), options);
    };
  }
}

/**
 * Create cache service instance
 */
export function createCacheService(config: CacheConfig): CacheService {
  return new CacheService(config);
}
