/**
 * Rate Limit Guard
 *
 * Protects endpoints from abuse with configurable rate limiting
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const RATE_LIMIT_KEY = 'rateLimit';

export interface RateLimitOptions {
  ttl: number; // Time window in milliseconds
  limit: number; // Max requests in time window
}

/**
 * Decorator to set rate limit on endpoints
 */
export const RateLimit = (options: RateLimitOptions) => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    if (propertyKey && descriptor) {
      Reflect.defineMetadata(RATE_LIMIT_KEY, options, descriptor.value);
    } else {
      Reflect.defineMetadata(RATE_LIMIT_KEY, options, target);
    }
  };
};

@Injectable()
export class RateLimitGuard implements CanActivate {
  private requestCounts = new Map<string, { count: number; resetTime: number }>();

  constructor(private reflector: Reflector) {
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.get<RateLimitOptions>(
      RATE_LIMIT_KEY,
      context.getHandler()
    );

    if (!options) {
      return true; // No rate limit configured
    }

    const request = context.switchToHttp().getRequest();
    const key = this.generateKey(request);
    const now = Date.now();

    let record = this.requestCounts.get(key);

    if (!record || now > record.resetTime) {
      // New window
      record = {
        count: 0,
        resetTime: now + options.ttl,
      };
      this.requestCounts.set(key, record);
    }

    record.count++;

    // Set rate limit headers
    const response = context.switchToHttp().getResponse();
    response.setHeader('X-RateLimit-Limit', options.limit);
    response.setHeader('X-RateLimit-Remaining', Math.max(0, options.limit - record.count));
    response.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString());

    if (record.count > options.limit) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      response.setHeader('Retry-After', retryAfter);

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests',
          error: 'Rate limit exceeded',
          retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    return true;
  }

  /**
   * Generate unique key for rate limiting
   * Uses IP address and user ID if available
   */
  private generateKey(request: any): string {
    const ip = this.getClientIp(request);
    const userId = request.user?.id || 'anonymous';
    const route = request.route?.path || request.url;

    return `${ip}:${userId}:${route}`;
  }

  /**
   * Get client IP address (handles proxies)
   */
  private getClientIp(request: any): string {
    const forwarded = request.headers['x-forwarded-for'];
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }

    return (
      request.headers['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      'unknown'
    );
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.requestCounts.entries()) {
      if (now > record.resetTime) {
        this.requestCounts.delete(key);
      }
    }
  }
}
