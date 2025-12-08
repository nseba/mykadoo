import CircuitBreaker from 'opossum';
import { Logger } from '@nestjs/common';

export interface CircuitBreakerOptions {
  timeout?: number; // Request timeout in ms (default: 3000)
  errorThresholdPercentage?: number; // Error rate to trip breaker (default: 50)
  resetTimeout?: number; // Time before attempting reset (default: 30000)
  rollingCountTimeout?: number; // Time window for stats (default: 10000)
  volumeThreshold?: number; // Min requests before checking error rate (default: 10)
  name?: string; // Circuit breaker name for logging
}

const circuitBreakers = new Map<string, CircuitBreaker>();
const logger = new Logger('CircuitBreaker');

/**
 * Circuit Breaker Decorator
 *
 * Protects external API calls with circuit breaker pattern
 * Prevents cascading failures by failing fast when service is down
 *
 * Usage:
 * @CircuitBreaker({ timeout: 5000, errorThresholdPercentage: 50 })
 * async callExternalAPI() { ... }
 */
export function WithCircuitBreaker(options: CircuitBreakerOptions = {}) {
  const {
    timeout = 3000,
    errorThresholdPercentage = 50,
    resetTimeout = 30000,
    rollingCountTimeout = 10000,
    volumeThreshold = 10,
    name,
  } = options;

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const breakerName = name || `${target.constructor.name}.${propertyKey}`;
    const cacheKey = breakerName;

    // Create or get existing circuit breaker
    if (!circuitBreakers.has(cacheKey)) {
      const breaker = new CircuitBreaker(async (...args: any[]) => {
        return originalMethod.apply(target, args);
      }, {
        timeout,
        errorThresholdPercentage,
        resetTimeout,
        rollingCountTimeout,
        volumeThreshold,
        name: breakerName,
      });

      // Event handlers
      breaker.on('open', () => {
        logger.warn(`Circuit breaker OPEN: ${breakerName}`);
      });

      breaker.on('halfOpen', () => {
        logger.log(`Circuit breaker HALF-OPEN: ${breakerName}`);
      });

      breaker.on('close', () => {
        logger.log(`Circuit breaker CLOSED: ${breakerName}`);
      });

      breaker.on('timeout', () => {
        logger.warn(`Circuit breaker TIMEOUT: ${breakerName} (>${timeout}ms)`);
      });

      breaker.on('failure', (error) => {
        logger.error(`Circuit breaker FAILURE: ${breakerName}`, error.message);
      });

      circuitBreakers.set(cacheKey, breaker);
    }

    const breaker = circuitBreakers.get(cacheKey)!;

    descriptor.value = async function (...args: any[]) {
      try {
        return await breaker.fire(...args);
      } catch (error) {
        // Re-throw with circuit breaker context
        if (error.message === 'Breaker is open') {
          throw new Error(
            `Service temporarily unavailable: ${breakerName}. Circuit breaker is open.`
          );
        }
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Get circuit breaker statistics
 */
export function getCircuitBreakerStats(): Record<string, any> {
  const stats: Record<string, any> = {};

  circuitBreakers.forEach((breaker, name) => {
    const breakerStats = breaker.stats;

    stats[name] = {
      state: breaker.opened ? 'OPEN' : breaker.halfOpen ? 'HALF_OPEN' : 'CLOSED',
      failures: breakerStats.failures,
      successes: breakerStats.successes,
      timeouts: breakerStats.timeouts,
      fallbacks: breakerStats.fallbacks,
      fires: breakerStats.fires,
      rejects: breakerStats.rejects,
      latencyMean: breakerStats.latencyMean,
      percentiles: breakerStats.percentiles,
    };
  });

  return stats;
}

/**
 * Reset all circuit breakers
 */
export function resetAllCircuitBreakers(): void {
  logger.log('Resetting all circuit breakers');

  circuitBreakers.forEach((breaker, name) => {
    breaker.close();
    logger.log(`Reset circuit breaker: ${name}`);
  });
}
