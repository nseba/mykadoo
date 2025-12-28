import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { EmbeddingJobType, MONITORING_THRESHOLDS } from './embedding-pipeline.constants';
import { EmbeddingJobResult, EmbeddingMetrics } from './interfaces';

/**
 * Service for monitoring embedding operations
 * Tracks metrics, success/failure rates, and alerts
 */
@Injectable()
export class EmbeddingMonitoringService {
  private readonly logger = new Logger(EmbeddingMonitoringService.name);
  private readonly metricsKey = 'embedding:metrics';
  private readonly metricsHistoryKey = 'embedding:metrics:history';

  // In-memory metrics for fast access
  private metrics: EmbeddingMetrics = {
    totalJobsProcessed: 0,
    totalJobsFailed: 0,
    totalProductsProcessed: 0,
    totalTokensUsed: 0,
    totalCost: 0,
    averageJobDuration: 0,
    failureRate: 0,
    lastUpdated: new Date().toISOString(),
  };

  private jobDurations: number[] = [];

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {
    this.loadMetricsFromCache();
  }

  /**
   * Record successful job completion
   */
  async recordJobCompletion(
    jobType: EmbeddingJobType,
    result: EmbeddingJobResult
  ): Promise<void> {
    this.metrics.totalJobsProcessed++;
    this.metrics.totalProductsProcessed += result.processedCount;
    this.metrics.totalTokensUsed += result.totalTokensUsed;
    this.metrics.totalCost += result.estimatedCost;

    // Update average duration
    this.jobDurations.push(result.duration);
    if (this.jobDurations.length > 1000) {
      this.jobDurations.shift(); // Keep last 1000 durations
    }
    this.metrics.averageJobDuration =
      this.jobDurations.reduce((a, b) => a + b, 0) / this.jobDurations.length;

    // Update failure rate
    this.metrics.failureRate =
      this.metrics.totalJobsProcessed > 0
        ? this.metrics.totalJobsFailed / this.metrics.totalJobsProcessed
        : 0;

    this.metrics.lastUpdated = new Date().toISOString();

    await this.saveMetricsToCache();

    // Check for alerts
    this.checkAlerts(result);

    this.logger.debug(
      `Job completed: type=${jobType}, processed=${result.processedCount}, tokens=${result.totalTokensUsed}`
    );
  }

  /**
   * Record job failure
   */
  async recordJobFailure(
    jobType: EmbeddingJobType,
    errorMessage: string
  ): Promise<void> {
    this.metrics.totalJobsFailed++;
    this.metrics.failureRate =
      this.metrics.totalJobsProcessed > 0
        ? this.metrics.totalJobsFailed / this.metrics.totalJobsProcessed
        : 1;

    this.metrics.lastUpdated = new Date().toISOString();

    await this.saveMetricsToCache();

    // Check failure rate alert
    if (this.metrics.failureRate >= MONITORING_THRESHOLDS.criticalFailureRate) {
      this.logger.error(
        `CRITICAL: Embedding failure rate at ${(this.metrics.failureRate * 100).toFixed(1)}%`
      );
    } else if (this.metrics.failureRate >= MONITORING_THRESHOLDS.warningFailureRate) {
      this.logger.warn(
        `WARNING: Embedding failure rate at ${(this.metrics.failureRate * 100).toFixed(1)}%`
      );
    }

    this.logger.error(`Job failed: type=${jobType}, error=${errorMessage}`);
  }

  /**
   * Get current metrics
   */
  getMetrics(): EmbeddingMetrics {
    return { ...this.metrics };
  }

  /**
   * Get metrics summary
   */
  getMetricsSummary(): {
    status: 'healthy' | 'warning' | 'critical';
    metrics: EmbeddingMetrics;
    alerts: string[];
  } {
    const alerts: string[] = [];
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    // Check failure rate
    if (this.metrics.failureRate >= MONITORING_THRESHOLDS.criticalFailureRate) {
      status = 'critical';
      alerts.push(
        `High failure rate: ${(this.metrics.failureRate * 100).toFixed(1)}%`
      );
    } else if (this.metrics.failureRate >= MONITORING_THRESHOLDS.warningFailureRate) {
      status = 'warning';
      alerts.push(
        `Elevated failure rate: ${(this.metrics.failureRate * 100).toFixed(1)}%`
      );
    }

    // Check average latency
    if (this.metrics.averageJobDuration >= MONITORING_THRESHOLDS.criticalLatencyMs) {
      status = 'critical';
      alerts.push(
        `High latency: ${Math.round(this.metrics.averageJobDuration)}ms`
      );
    } else if (
      this.metrics.averageJobDuration >= MONITORING_THRESHOLDS.warningLatencyMs
    ) {
      if (status !== 'critical') status = 'warning';
      alerts.push(
        `Elevated latency: ${Math.round(this.metrics.averageJobDuration)}ms`
      );
    }

    return {
      status,
      metrics: this.metrics,
      alerts,
    };
  }

  /**
   * Reset metrics (for testing or maintenance)
   */
  async resetMetrics(): Promise<void> {
    this.metrics = {
      totalJobsProcessed: 0,
      totalJobsFailed: 0,
      totalProductsProcessed: 0,
      totalTokensUsed: 0,
      totalCost: 0,
      averageJobDuration: 0,
      failureRate: 0,
      lastUpdated: new Date().toISOString(),
    };
    this.jobDurations = [];

    await this.cacheManager.del(this.metricsKey);
    this.logger.log('Metrics reset');
  }

  /**
   * Get detailed statistics for a time period
   */
  async getDetailedStats(hours = 24): Promise<{
    metrics: EmbeddingMetrics;
    hourlyBreakdown: Array<{
      hour: string;
      jobsProcessed: number;
      tokensUsed: number;
      cost: number;
    }>;
  }> {
    // For now, return current metrics
    // In production, this would query a time-series database
    return {
      metrics: this.metrics,
      hourlyBreakdown: [],
    };
  }

  /**
   * Check for alerts based on job result
   */
  private checkAlerts(result: EmbeddingJobResult): void {
    // Check for high failure count in batch
    if (result.failedCount > result.processedCount * 0.1) {
      this.logger.warn(
        `High failure rate in batch: ${result.failedCount}/${result.processedCount + result.failedCount}`
      );
    }

    // Check for slow job
    if (result.duration >= MONITORING_THRESHOLDS.criticalLatencyMs) {
      this.logger.warn(`Slow job detected: ${result.duration}ms`);
    }

    // Check for high cost
    if (result.estimatedCost > 1.0) {
      // Alert if single job costs more than $1
      this.logger.warn(`High cost job: $${result.estimatedCost.toFixed(4)}`);
    }
  }

  /**
   * Load metrics from cache on startup
   */
  private async loadMetricsFromCache(): Promise<void> {
    try {
      const cached = await this.cacheManager.get<EmbeddingMetrics>(this.metricsKey);
      if (cached) {
        this.metrics = cached;
        this.logger.debug('Loaded metrics from cache');
      }
    } catch (error) {
      this.logger.debug('No cached metrics found, starting fresh');
    }
  }

  /**
   * Save metrics to cache
   */
  private async saveMetricsToCache(): Promise<void> {
    try {
      // Cache for 24 hours
      await this.cacheManager.set(this.metricsKey, this.metrics, 86400);
    } catch (error) {
      this.logger.error('Failed to cache metrics');
    }
  }
}
