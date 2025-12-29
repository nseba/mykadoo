import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { register, collectDefaultMetrics } from 'prom-client';
import { VectorMetricsService } from './vector-metrics.service';
import { VectorLoggingService, QueryLog } from './vector-logging.service';
import { VectorBenchmarkService } from './vector-benchmark.service';
import { QueryCacheService } from './query-cache.service';
import { VectorPoolService } from './vector-pool.service';

/**
 * DTO for alert threshold configuration
 */
class AlertThresholdsDto {
  slowQueryMs?: number;
  errorRatePercent?: number;
  cacheHitRateMin?: number;
  poolUtilizationMax?: number;
  embeddingCoverageMin?: number;
}

/**
 * Health status for vector subsystem
 */
interface VectorHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    database: boolean;
    cache: boolean;
    pool: boolean;
    index: boolean;
  };
  metrics: {
    embeddingCoverage: number;
    cacheHitRate: number;
    poolUtilization: number;
    avgSearchLatencyMs: number;
  };
  alerts: Array<{
    type: string;
    severity: 'warning' | 'critical';
    message: string;
  }>;
  timestamp: Date;
}

/**
 * Controller for vector monitoring and observability
 */
@ApiTags('Vector Monitoring')
@Controller('vector-monitoring')
export class VectorMonitoringController {
  private readonly logger = new Logger(VectorMonitoringController.name);

  // Default alert thresholds
  private alertThresholds: AlertThresholdsDto = {
    slowQueryMs: 500,
    errorRatePercent: 5,
    cacheHitRateMin: 50,
    poolUtilizationMax: 80,
    embeddingCoverageMin: 80,
  };

  constructor(
    private readonly metricsService: VectorMetricsService,
    private readonly loggingService: VectorLoggingService,
    private readonly benchmarkService: VectorBenchmarkService,
    private readonly cacheService: QueryCacheService,
    private readonly poolService: VectorPoolService
  ) {
    // Collect default metrics on startup
    collectDefaultMetrics({ prefix: 'mykadoo_' });
  }

  /**
   * Get Prometheus metrics
   */
  @Get('metrics')
  @ApiOperation({ summary: 'Get Prometheus metrics for vector operations' })
  @ApiResponse({
    status: 200,
    description: 'Prometheus metrics in text format',
  })
  async getMetrics(): Promise<string> {
    // Update gauges with current state before returning metrics
    await this.updateGauges();
    return register.metrics();
  }

  /**
   * Get vector subsystem health
   */
  @Get('health')
  @ApiOperation({ summary: 'Get vector subsystem health status' })
  @ApiResponse({
    status: 200,
    description: 'Returns health status with checks and alerts',
  })
  async getHealth(): Promise<VectorHealth> {
    const [indexStats, cacheStats, poolStats, poolHealth] = await Promise.all([
      this.benchmarkService.getIndexStatistics(),
      this.cacheService.getStats(),
      this.poolService.getStats(),
      this.poolService.healthCheck(),
    ]);

    const embeddingCoverage =
      indexStats.totalProducts > 0
        ? (indexStats.productsWithEmbedding / indexStats.totalProducts) * 100
        : 0;

    const poolUtilization =
      poolStats.maxConnections > 0
        ? (poolStats.acquiredConnections / poolStats.maxConnections) * 100
        : 0;

    const checks = {
      database: poolHealth.healthy,
      cache: true, // Cache is always "up" even if empty
      pool: poolUtilization < (this.alertThresholds.poolUtilizationMax || 80),
      index: indexStats.productsWithEmbedding > 0,
    };

    const alerts: VectorHealth['alerts'] = [];

    // Check for alert conditions
    if (embeddingCoverage < (this.alertThresholds.embeddingCoverageMin || 80)) {
      alerts.push({
        type: 'low_embedding_coverage',
        severity: embeddingCoverage < 50 ? 'critical' : 'warning',
        message: `Embedding coverage is ${embeddingCoverage.toFixed(1)}% (threshold: ${this.alertThresholds.embeddingCoverageMin}%)`,
      });
    }

    if (cacheStats.hitRate * 100 < (this.alertThresholds.cacheHitRateMin || 50)) {
      alerts.push({
        type: 'low_cache_hit_rate',
        severity: 'warning',
        message: `Cache hit rate is ${(cacheStats.hitRate * 100).toFixed(1)}% (threshold: ${this.alertThresholds.cacheHitRateMin}%)`,
      });
    }

    if (poolUtilization > (this.alertThresholds.poolUtilizationMax || 80)) {
      alerts.push({
        type: 'high_pool_utilization',
        severity: poolUtilization > 95 ? 'critical' : 'warning',
        message: `Pool utilization is ${poolUtilization.toFixed(1)}% (threshold: ${this.alertThresholds.poolUtilizationMax}%)`,
      });
    }

    if (!poolHealth.healthy) {
      alerts.push({
        type: 'pool_unhealthy',
        severity: 'critical',
        message: poolHealth.message || 'Connection pool is unhealthy',
      });
    }

    // Determine overall status
    let status: VectorHealth['status'] = 'healthy';
    if (alerts.some((a) => a.severity === 'critical')) {
      status = 'unhealthy';
    } else if (alerts.length > 0) {
      status = 'degraded';
    }

    // Log alerts
    for (const alert of alerts) {
      this.loggingService.logAlert(alert.type, alert.severity, {
        message: alert.message,
      });
    }

    return {
      status,
      checks,
      metrics: {
        embeddingCoverage,
        cacheHitRate: cacheStats.hitRate * 100,
        poolUtilization,
        avgSearchLatencyMs: 0, // Would come from histogram if available
      },
      alerts,
      timestamp: new Date(),
    };
  }

  /**
   * Get detailed monitoring dashboard data
   */
  @Get('dashboard')
  @ApiOperation({ summary: 'Get monitoring dashboard data' })
  @ApiResponse({
    status: 200,
    description: 'Returns comprehensive monitoring data',
  })
  async getDashboardData() {
    const [indexStats, cacheStats, poolStats] = await Promise.all([
      this.benchmarkService.getIndexStatistics(),
      this.cacheService.getStats(),
      this.poolService.getStats(),
    ]);

    return {
      index: {
        totalProducts: indexStats.totalProducts,
        productsWithEmbedding: indexStats.productsWithEmbedding,
        coveragePercent:
          indexStats.totalProducts > 0
            ? (indexStats.productsWithEmbedding / indexStats.totalProducts) * 100
            : 0,
        indexType: indexStats.indexType,
        indexSizeMb: indexStats.indexSizeMb,
        hnswParameters: {
          m: indexStats.hnswM,
          efConstruction: indexStats.hnswEfConstruction,
          efSearch: indexStats.hnswEfSearch,
        },
      },
      cache: {
        hitRate: cacheStats.hitRate * 100,
        totalEntries: cacheStats.totalEntries,
        hitCount: cacheStats.hitCount,
        missCount: cacheStats.missCount,
        avgHitsPerQuery: cacheStats.avgHitsPerQuery,
        memoryUsageMb: cacheStats.memoryUsageMb,
        dbCacheEntries: cacheStats.dbCacheEntries,
      },
      pool: {
        totalConnections: poolStats.totalConnections,
        acquiredConnections: poolStats.acquiredConnections,
        idleConnections: poolStats.idleConnections,
        waitingRequests: poolStats.waitingRequests,
        maxConnections: poolStats.maxConnections,
        utilizationPercent:
          poolStats.maxConnections > 0
            ? (poolStats.acquiredConnections / poolStats.maxConnections) * 100
            : 0,
      },
      queryLogs: {
        bufferedCount: this.loggingService.getBufferSize(),
      },
      timestamp: new Date(),
    };
  }

  /**
   * Get recent query logs
   */
  @Get('logs')
  @ApiOperation({ summary: 'Get recent query logs' })
  @ApiQuery({ name: 'limit', required: false, description: 'Max logs to return' })
  @ApiResponse({
    status: 200,
    description: 'Returns buffered query logs',
  })
  getQueryLogs(@Query('limit') limit?: number): QueryLog[] {
    const logs = this.loggingService.flushQueryLogs();
    return limit ? logs.slice(-limit) : logs;
  }

  /**
   * Configure alert thresholds
   */
  @Post('alerts/thresholds')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Configure alert thresholds' })
  @ApiResponse({
    status: 200,
    description: 'Thresholds updated successfully',
  })
  updateAlertThresholds(@Body() thresholds: AlertThresholdsDto): AlertThresholdsDto {
    this.alertThresholds = { ...this.alertThresholds, ...thresholds };
    this.logger.log(`Alert thresholds updated: ${JSON.stringify(this.alertThresholds)}`);
    return this.alertThresholds;
  }

  /**
   * Get current alert thresholds
   */
  @Get('alerts/thresholds')
  @ApiOperation({ summary: 'Get current alert thresholds' })
  @ApiResponse({
    status: 200,
    description: 'Returns current alert thresholds',
  })
  getAlertThresholds(): AlertThresholdsDto {
    return this.alertThresholds;
  }

  /**
   * Update gauge metrics with current state
   */
  private async updateGauges(): Promise<void> {
    try {
      const [indexStats, cacheStats, poolStats] = await Promise.all([
        this.benchmarkService.getIndexStatistics(),
        this.cacheService.getStats(),
        this.poolService.getStats(),
      ]);

      this.metricsService.setEmbeddingCoverage(
        indexStats.productsWithEmbedding,
        indexStats.totalProducts
      );

      this.metricsService.setPoolUtilization(
        poolStats.acquiredConnections,
        poolStats.maxConnections
      );

      this.metricsService.setCacheHitRate(cacheStats.hitRate);
      this.metricsService.setCacheEntries(0, cacheStats.dbCacheEntries);
      this.metricsService.setIndexSize(indexStats.indexSizeMb * 1024 * 1024);
    } catch (error) {
      this.logger.error(`Failed to update gauges: ${error.message}`);
    }
  }
}
