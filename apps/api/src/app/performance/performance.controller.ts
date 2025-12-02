/**
 * Performance Controller
 *
 * Endpoints for monitoring cache and application performance
 */

import { Controller, Get, Query, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PerformanceService } from './performance.service';

/**
 * Performance Controller
 *
 * Provides endpoints for performance metrics and cache statistics
 */
@ApiTags('performance')
@Controller('performance')
export class PerformanceController {
  private readonly logger = new Logger(PerformanceController.name);

  constructor(private readonly performanceService: PerformanceService) {}

  /**
   * Get cache statistics
   */
  @Get('cache/stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get cache statistics',
    description: 'Retrieve cache hit/miss rates and memory usage',
  })
  @ApiResponse({
    status: 200,
    description: 'Cache statistics retrieved successfully',
  })
  async getCacheStats() {
    this.logger.log('Getting cache statistics');
    return this.performanceService.getCacheStats();
  }

  /**
   * Get performance metrics
   */
  @Get('metrics')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get performance metrics',
    description: 'Retrieve application performance metrics (response times, error rates)',
  })
  @ApiQuery({
    name: 'timeWindow',
    required: false,
    type: Number,
    description: 'Time window in seconds (default: 3600)',
    example: 3600,
  })
  @ApiResponse({
    status: 200,
    description: 'Performance metrics retrieved successfully',
  })
  async getMetrics(@Query('timeWindow') timeWindow?: number) {
    this.logger.log(`Getting performance metrics (window: ${timeWindow || 3600}s)`);
    return this.performanceService.getPerformanceStats(timeWindow);
  }

  /**
   * Get slow requests
   */
  @Get('slow-requests')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get slow requests',
    description: 'Retrieve requests that exceeded the response time threshold',
  })
  @ApiQuery({
    name: 'threshold',
    required: false,
    type: Number,
    description: 'Response time threshold in milliseconds (default: 1000)',
    example: 1000,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of results (default: 100)',
    example: 100,
  })
  @ApiResponse({
    status: 200,
    description: 'Slow requests retrieved successfully',
  })
  async getSlowRequests(
    @Query('threshold') threshold?: number,
    @Query('limit') limit?: number
  ) {
    this.logger.log(`Getting slow requests (threshold: ${threshold || 1000}ms)`);
    return this.performanceService.getSlowRequests(threshold, limit);
  }

  /**
   * Get error requests
   */
  @Get('errors')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get error requests',
    description: 'Retrieve recent requests that resulted in errors (4xx, 5xx)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of results (default: 100)',
    example: 100,
  })
  @ApiResponse({
    status: 200,
    description: 'Error requests retrieved successfully',
  })
  async getErrorRequests(@Query('limit') limit?: number) {
    this.logger.log('Getting error requests');
    return this.performanceService.getErrorRequests(limit);
  }

  /**
   * Clear cache
   */
  @Get('cache/clear')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Clear cache',
    description: 'Clear all cached data (use with caution)',
  })
  @ApiResponse({
    status: 200,
    description: 'Cache cleared successfully',
  })
  async clearCache() {
    this.logger.warn('Clearing cache (manual trigger)');
    await this.performanceService.clearCache();
    return {
      success: true,
      message: 'Cache cleared successfully',
    };
  }

  /**
   * Health check for performance monitoring
   */
  @Get('health')
  @ApiOperation({
    summary: 'Performance service health check',
    description: 'Check if performance monitoring is operational',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
  })
  health() {
    return {
      status: 'ok',
      service: 'performance',
      timestamp: new Date().toISOString(),
    };
  }
}
