/**
 * Performance Service
 *
 * Aggregates performance and cache metrics
 */

import { Injectable, Logger } from '@nestjs/common';
import {
  CacheService,
  PerformanceService as PerfService,
  getPerformanceService,
  getCacheConfig,
} from '@mykadoo/cache';

@Injectable()
export class PerformanceService {
  private readonly logger = new Logger(PerformanceService.name);
  private cacheService: CacheService;
  private perfService: PerfService;

  constructor() {
    this.cacheService = new CacheService(getCacheConfig());
    this.perfService = getPerformanceService();
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    return this.cacheService.getStats();
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(timeWindow?: number) {
    return this.perfService.getStats(timeWindow);
  }

  /**
   * Get slow requests
   */
  getSlowRequests(thresholdMs?: number, limit?: number) {
    return this.perfService.getSlowRequests(thresholdMs, limit);
  }

  /**
   * Get error requests
   */
  getErrorRequests(limit?: number) {
    return this.perfService.getErrorRequests(limit);
  }

  /**
   * Clear cache
   */
  async clearCache() {
    await this.cacheService.clear();
    this.logger.log('Cache cleared');
  }
}
