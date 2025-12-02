/**
 * Performance Monitoring Service
 *
 * Track and measure application performance metrics
 */

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  /** Request ID */
  requestId: string;
  /** Endpoint path */
  endpoint: string;
  /** HTTP method */
  method: string;
  /** Response time in milliseconds */
  responseTime: number;
  /** Status code */
  statusCode: number;
  /** Timestamp */
  timestamp: Date;
  /** User agent */
  userAgent?: string;
  /** User ID */
  userId?: string;
}

/**
 * Performance statistics
 */
export interface PerformanceStats {
  /** Average response time */
  avgResponseTime: number;
  /** P50 (median) response time */
  p50: number;
  /** P95 response time */
  p95: number;
  /** P99 response time */
  p99: number;
  /** Total requests */
  totalRequests: number;
  /** Requests per second */
  requestsPerSecond: number;
  /** Error rate percentage */
  errorRate: number;
}

/**
 * Performance Monitor Service
 */
export class PerformanceService {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 10000; // Keep last 10k requests

  /**
   * Record a request metric
   */
  recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);

    // Keep only the last N metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  /**
   * Get performance statistics
   */
  getStats(timeWindow?: number): PerformanceStats {
    let filteredMetrics = this.metrics;

    // Filter by time window if provided (in seconds)
    if (timeWindow) {
      const cutoff = Date.now() - timeWindow * 1000;
      filteredMetrics = this.metrics.filter(
        (m) => m.timestamp.getTime() >= cutoff
      );
    }

    if (filteredMetrics.length === 0) {
      return {
        avgResponseTime: 0,
        p50: 0,
        p95: 0,
        p99: 0,
        totalRequests: 0,
        requestsPerSecond: 0,
        errorRate: 0,
      };
    }

    // Calculate response time statistics
    const responseTimes = filteredMetrics
      .map((m) => m.responseTime)
      .sort((a, b) => a - b);

    const avgResponseTime =
      responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;

    const p50 = this.percentile(responseTimes, 50);
    const p95 = this.percentile(responseTimes, 95);
    const p99 = this.percentile(responseTimes, 99);

    // Calculate request rate
    const timeRange = timeWindow || 3600; // Default to 1 hour
    const requestsPerSecond = filteredMetrics.length / timeRange;

    // Calculate error rate
    const errorCount = filteredMetrics.filter(
      (m) => m.statusCode >= 400
    ).length;
    const errorRate = (errorCount / filteredMetrics.length) * 100;

    return {
      avgResponseTime,
      p50,
      p95,
      p99,
      totalRequests: filteredMetrics.length,
      requestsPerSecond,
      errorRate,
    };
  }

  /**
   * Get statistics by endpoint
   */
  getStatsByEndpoint(endpoint: string, timeWindow?: number): PerformanceStats {
    const endpointMetrics = this.metrics.filter((m) => m.endpoint === endpoint);

    if (timeWindow) {
      const cutoff = Date.now() - timeWindow * 1000;
      return this.calculateStats(
        endpointMetrics.filter((m) => m.timestamp.getTime() >= cutoff),
        timeWindow
      );
    }

    return this.calculateStats(endpointMetrics, 3600);
  }

  /**
   * Get slow requests (above threshold)
   */
  getSlowRequests(thresholdMs: number = 1000, limit: number = 100): PerformanceMetrics[] {
    return this.metrics
      .filter((m) => m.responseTime >= thresholdMs)
      .sort((a, b) => b.responseTime - a.responseTime)
      .slice(0, limit);
  }

  /**
   * Get error requests
   */
  getErrorRequests(limit: number = 100): PerformanceMetrics[] {
    return this.metrics
      .filter((m) => m.statusCode >= 400)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
  }

  /**
   * Calculate percentile value
   */
  private percentile(sortedArray: number[], p: number): number {
    if (sortedArray.length === 0) return 0;

    const index = Math.ceil((p / 100) * sortedArray.length) - 1;
    return sortedArray[Math.max(0, index)];
  }

  /**
   * Calculate statistics from metrics
   */
  private calculateStats(
    metrics: PerformanceMetrics[],
    timeWindow: number
  ): PerformanceStats {
    if (metrics.length === 0) {
      return {
        avgResponseTime: 0,
        p50: 0,
        p95: 0,
        p99: 0,
        totalRequests: 0,
        requestsPerSecond: 0,
        errorRate: 0,
      };
    }

    const responseTimes = metrics
      .map((m) => m.responseTime)
      .sort((a, b) => a - b);

    const avgResponseTime =
      responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;

    const errorCount = metrics.filter((m) => m.statusCode >= 400).length;

    return {
      avgResponseTime,
      p50: this.percentile(responseTimes, 50),
      p95: this.percentile(responseTimes, 95),
      p99: this.percentile(responseTimes, 99),
      totalRequests: metrics.length,
      requestsPerSecond: metrics.length / timeWindow,
      errorRate: (errorCount / metrics.length) * 100,
    };
  }
}

/**
 * Global performance service instance
 */
let performanceServiceInstance: PerformanceService | null = null;

/**
 * Get global performance service
 */
export function getPerformanceService(): PerformanceService {
  if (!performanceServiceInstance) {
    performanceServiceInstance = new PerformanceService();
  }
  return performanceServiceInstance;
}

/**
 * Performance monitoring decorator
 */
export function measurePerformance(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const startTime = Date.now();
    const perfService = getPerformanceService();

    try {
      const result = await originalMethod.apply(this, args);
      const responseTime = Date.now() - startTime;

      perfService.recordMetric({
        requestId: `${propertyKey}-${Date.now()}`,
        endpoint: propertyKey,
        method: 'FUNCTION',
        responseTime,
        statusCode: 200,
        timestamp: new Date(),
      });

      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;

      perfService.recordMetric({
        requestId: `${propertyKey}-${Date.now()}`,
        endpoint: propertyKey,
        method: 'FUNCTION',
        responseTime,
        statusCode: 500,
        timestamp: new Date(),
      });

      throw error;
    }
  };

  return descriptor;
}
