/**
 * Rate Limiter Service
 *
 * Token bucket rate limiting with Redis support
 */

import type { CacheService } from './cache.service';
import { CacheKey } from '../types';

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /** Maximum requests per window */
  maxRequests: number;
  /** Time window in seconds */
  windowSeconds: number;
  /** Identifier (IP, user ID, etc.) */
  identifier: string;
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  /** Whether request is allowed */
  allowed: boolean;
  /** Current request count */
  current: number;
  /** Maximum allowed requests */
  limit: number;
  /** Time until reset (seconds) */
  resetIn: number;
  /** Remaining requests */
  remaining: number;
}

/**
 * Rate Limiter Service
 */
export class RateLimiterService {
  constructor(private cacheService: CacheService) {}

  /**
   * Check rate limit and increment counter
   */
  async checkLimit(config: RateLimitConfig): Promise<RateLimitResult> {
    const { maxRequests, windowSeconds, identifier } = config;
    const now = Math.floor(Date.now() / 1000);
    const windowStart = Math.floor(now / windowSeconds) * windowSeconds;
    const key = CacheKey.rateLimit(identifier, windowStart.toString());

    try {
      // Get current count
      const current = (await this.cacheService.get<number>(key)) || 0;

      if (current >= maxRequests) {
        const resetIn = windowStart + windowSeconds - now;
        return {
          allowed: false,
          current,
          limit: maxRequests,
          resetIn,
          remaining: 0,
        };
      }

      // Increment counter
      const newCount = current + 1;
      await this.cacheService.set(key, newCount, { ttl: windowSeconds });

      const resetIn = windowStart + windowSeconds - now;

      return {
        allowed: true,
        current: newCount,
        limit: maxRequests,
        resetIn,
        remaining: maxRequests - newCount,
      };
    } catch (error) {
      console.error('Rate limit check error:', error);
      // Fail open on errors
      return {
        allowed: true,
        current: 0,
        limit: maxRequests,
        resetIn: windowSeconds,
        remaining: maxRequests,
      };
    }
  }

  /**
   * Reset rate limit for identifier
   */
  async reset(identifier: string): Promise<void> {
    try {
      await this.cacheService.clearPrefix(`ratelimit:${identifier}`);
    } catch (error) {
      console.error('Rate limit reset error:', error);
    }
  }

  /**
   * Get current rate limit status
   */
  async getStatus(config: RateLimitConfig): Promise<RateLimitResult> {
    const { maxRequests, windowSeconds, identifier } = config;
    const now = Math.floor(Date.now() / 1000);
    const windowStart = Math.floor(now / windowSeconds) * windowSeconds;
    const key = CacheKey.rateLimit(identifier, windowStart.toString());

    try {
      const current = (await this.cacheService.get<number>(key)) || 0;
      const resetIn = windowStart + windowSeconds - now;

      return {
        allowed: current < maxRequests,
        current,
        limit: maxRequests,
        resetIn,
        remaining: Math.max(0, maxRequests - current),
      };
    } catch (error) {
      console.error('Rate limit status error:', error);
      return {
        allowed: true,
        current: 0,
        limit: maxRequests,
        resetIn: windowSeconds,
        remaining: maxRequests,
      };
    }
  }
}

/**
 * Rate limit presets
 */
export const RateLimitPresets = {
  /** Very strict: 10 requests per minute */
  VERY_STRICT: { maxRequests: 10, windowSeconds: 60 },
  /** Strict: 30 requests per minute */
  STRICT: { maxRequests: 30, windowSeconds: 60 },
  /** Normal: 60 requests per minute */
  NORMAL: { maxRequests: 60, windowSeconds: 60 },
  /** Relaxed: 120 requests per minute */
  RELAXED: { maxRequests: 120, windowSeconds: 60 },
  /** API: 1000 requests per hour */
  API: { maxRequests: 1000, windowSeconds: 3600 },
} as const;
