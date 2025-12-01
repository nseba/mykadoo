/**
 * Throttle Decorator
 *
 * Custom decorator for applying specific rate limits to endpoints
 */

import { Throttle } from '@nestjs/throttler';

/**
 * Apply strict authentication throttling
 * 5 requests per 15 minutes
 */
export const AuthThrottle = () => Throttle({ auth: { limit: 5, ttl: 900000 } });

/**
 * Apply registration throttling
 * 3 requests per hour
 */
export const RegisterThrottle = () => Throttle({ auth: { limit: 3, ttl: 3600000 } });

/**
 * Apply password reset throttling
 * 3 requests per hour per email
 */
export const PasswordResetThrottle = () => Throttle({ auth: { limit: 3, ttl: 3600000 } });

/**
 * Skip throttling for specific endpoints
 */
export { SkipThrottle } from '@nestjs/throttler';
