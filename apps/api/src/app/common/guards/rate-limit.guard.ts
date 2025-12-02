/**
 * Rate Limit Guard
 *
 * NestJS guard for rate limiting requests
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  CacheService,
  RateLimiterService,
  RateLimitPresets,
  getCacheConfig,
} from '@mykadoo/cache';

/**
 * Rate limit metadata key
 */
export const RATE_LIMIT_KEY = 'rateLimit';

/**
 * Rate limit configuration
 */
export interface RateLimitOptions {
  /** Maximum requests per window */
  maxRequests: number;
  /** Time window in seconds */
  windowSeconds: number;
}

/**
 * Rate limit decorator
 */
export const RateLimit = (options: RateLimitOptions) => {
  return (target: any, key?: string, descriptor?: PropertyDescriptor) => {
    if (descriptor) {
      // Method decorator
      Reflect.defineMetadata(RATE_LIMIT_KEY, options, descriptor.value);
      return descriptor;
    }
    // Class decorator
    Reflect.defineMetadata(RATE_LIMIT_KEY, options, target);
    return target;
  };
};

/**
 * Common rate limit presets as decorators
 */
export const RateLimitStrict = () => RateLimit(RateLimitPresets.STRICT);
export const RateLimitNormal = () => RateLimit(RateLimitPresets.NORMAL);
export const RateLimitRelaxed = () => RateLimit(RateLimitPresets.RELAXED);
export const RateLimitAPI = () => RateLimit(RateLimitPresets.API);

/**
 * Rate Limit Guard
 *
 * Applies rate limiting to routes based on IP address
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);
  private rateLimiter: RateLimiterService;

  constructor(private reflector: Reflector) {
    const cacheService = new CacheService(getCacheConfig());
    this.rateLimiter = new RateLimiterService(cacheService);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Get rate limit configuration from decorator
    const options = this.reflector.get<RateLimitOptions>(
      RATE_LIMIT_KEY,
      context.getHandler()
    ) || this.reflector.get<RateLimitOptions>(
      RATE_LIMIT_KEY,
      context.getClass()
    );

    if (!options) {
      // No rate limit configured, allow request
      return true;
    }

    // Get identifier (IP address or user ID if authenticated)
    const identifier = this.getIdentifier(request);

    // Check rate limit
    const result = await this.rateLimiter.checkLimit({
      maxRequests: options.maxRequests,
      windowSeconds: options.windowSeconds,
      identifier,
    });

    // Add rate limit headers to response
    const response = context.switchToHttp().getResponse();
    response.setHeader('X-RateLimit-Limit', result.limit);
    response.setHeader('X-RateLimit-Remaining', result.remaining);
    response.setHeader('X-RateLimit-Reset', result.resetIn);

    if (!result.allowed) {
      this.logger.warn(
        `Rate limit exceeded for ${identifier} (${result.current}/${result.limit})`
      );

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests, please try again later',
          retryAfter: result.resetIn,
        },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    return true;
  }

  /**
   * Get request identifier (IP or user ID)
   */
  private getIdentifier(request: any): string {
    // Try to get user ID from request (if authenticated)
    if (request.user?.id) {
      return `user:${request.user.id}`;
    }

    // Fallback to IP address
    const ip =
      request.headers['x-forwarded-for']?.split(',')[0] ||
      request.headers['x-real-ip'] ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress;

    return `ip:${ip}`;
  }
}
