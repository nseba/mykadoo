/**
 * Health Service
 *
 * Monitors service health and dependencies
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    database?: HealthCheck;
    redis?: HealthCheck;
    memory?: HealthCheck;
    disk?: HealthCheck;
    amazon?: HealthCheck;
    shareasale?: HealthCheck;
    cj?: HealthCheck;
  };
}

interface HealthCheck {
  status: 'pass' | 'warn' | 'fail';
  message?: string;
  responseTime?: number;
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly startTime: number;

  constructor(private readonly prisma: PrismaService) {
    this.startTime = Date.now();
  }

  /**
   * Get overall health status
   */
  async getHealthStatus(): Promise<HealthStatus> {
    const checks = await this.performHealthChecks();
    const status = this.determineOverallStatus(checks);

    return {
      status,
      timestamp: new Date().toISOString(),
      uptime: this.getUptime(),
      version: process.env.APP_VERSION || '1.0.0',
      checks,
    };
  }

  /**
   * Readiness check - can service accept traffic?
   */
  async getReadinessStatus() {
    const dbCheck = await this.checkDatabase();
    const redisCheck = await this.checkRedis();

    const isReady = dbCheck.status === 'pass' && redisCheck.status === 'pass';

    if (!isReady) {
      throw new Error('Service not ready');
    }

    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: dbCheck,
        redis: redisCheck,
      },
    };
  }

  /**
   * Liveness check - is service alive?
   */
  async getLivenessStatus() {
    const memoryCheck = this.checkMemory();

    if (memoryCheck.status === 'fail') {
      throw new Error('Service not alive - memory exhausted');
    }

    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: this.getUptime(),
    };
  }

  /**
   * Get Prometheus metrics
   */
  async getMetrics(): Promise<string> {
    const metrics = [];

    // Process metrics
    metrics.push(`# HELP process_uptime_seconds Process uptime in seconds`);
    metrics.push(`# TYPE process_uptime_seconds gauge`);
    metrics.push(`process_uptime_seconds ${this.getUptime()}`);

    // Memory metrics
    const memUsage = process.memoryUsage();
    metrics.push(`# HELP process_resident_memory_bytes Resident memory size in bytes`);
    metrics.push(`# TYPE process_resident_memory_bytes gauge`);
    metrics.push(`process_resident_memory_bytes ${memUsage.rss}`);

    metrics.push(`# HELP process_heap_bytes Process heap size in bytes`);
    metrics.push(`# TYPE process_heap_bytes gauge`);
    metrics.push(`process_heap_bytes ${memUsage.heapUsed}`);

    // Database connection metrics
    const dbCheck = await this.checkDatabase();
    metrics.push(`# HELP database_health Database health status (1=pass, 0=fail)`);
    metrics.push(`# TYPE database_health gauge`);
    metrics.push(`database_health ${dbCheck.status === 'pass' ? 1 : 0}`);

    if (dbCheck.responseTime) {
      metrics.push(`# HELP database_response_time_ms Database response time in milliseconds`);
      metrics.push(`# TYPE database_response_time_ms gauge`);
      metrics.push(`database_response_time_ms ${dbCheck.responseTime}`);
    }

    return metrics.join('\n');
  }

  /**
   * Perform all health checks
   */
  private async performHealthChecks() {
    const [database, redis, memory, amazon, shareasale, cj] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
      Promise.resolve(this.checkMemory()),
      this.checkAmazonAPI(),
      this.checkShareASaleAPI(),
      this.checkCJAPI(),
    ]);

    return { database, redis, memory, amazon, shareasale, cj };
  }

  /**
   * Check Amazon PA-API health
   */
  private async checkAmazonAPI(): Promise<HealthCheck> {
    try {
      // Check if credentials are configured
      if (!process.env.AMAZON_ACCESS_KEY || !process.env.AMAZON_SECRET_KEY) {
        return {
          status: 'warn',
          message: 'Amazon API credentials not configured',
        };
      }

      return {
        status: 'pass',
        message: 'Amazon API credentials configured',
      };
    } catch (error) {
      this.logger.error('Amazon API health check failed', error);
      return {
        status: 'fail',
        message: error.message,
      };
    }
  }

  /**
   * Check ShareASale API health
   */
  private async checkShareASaleAPI(): Promise<HealthCheck> {
    try {
      // Check if credentials are configured
      if (!process.env.SHAREASALE_AFFILIATE_ID || !process.env.SHAREASALE_API_TOKEN) {
        return {
          status: 'warn',
          message: 'ShareASale API credentials not configured',
        };
      }

      return {
        status: 'pass',
        message: 'ShareASale API credentials configured',
      };
    } catch (error) {
      this.logger.error('ShareASale API health check failed', error);
      return {
        status: 'fail',
        message: error.message,
      };
    }
  }

  /**
   * Check CJ Affiliate API health
   */
  private async checkCJAPI(): Promise<HealthCheck> {
    try {
      // Check if credentials are configured
      if (!process.env.CJ_PUBLISHER_ID || !process.env.CJ_API_TOKEN) {
        return {
          status: 'warn',
          message: 'CJ API credentials not configured',
        };
      }

      return {
        status: 'pass',
        message: 'CJ API credentials configured',
      };
    } catch (error) {
      this.logger.error('CJ API health check failed', error);
      return {
        status: 'fail',
        message: error.message,
      };
    }
  }

  /**
   * Check database connectivity
   */
  private async checkDatabase(): Promise<HealthCheck> {
    try {
      const start = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - start;

      return {
        status: 'pass',
        message: 'Database connection successful',
        responseTime,
      };
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return {
        status: 'fail',
        message: error.message,
      };
    }
  }

  /**
   * Check Redis connectivity
   */
  private async checkRedis(): Promise<HealthCheck> {
    // TODO: Implement Redis health check when Redis is configured
    // For now, return a pass status
    return {
      status: 'pass',
      message: 'Redis check not implemented',
    };
  }

  /**
   * Check memory usage
   */
  private checkMemory(): HealthCheck {
    const memUsage = process.memoryUsage();
    const heapUsedPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;

    let status: 'pass' | 'warn' | 'fail' = 'pass';
    let message = `Heap usage: ${heapUsedPercent.toFixed(2)}%`;

    if (heapUsedPercent > 90) {
      status = 'fail';
      message = `Critical: ${message}`;
    } else if (heapUsedPercent > 75) {
      status = 'warn';
      message = `Warning: ${message}`;
    }

    return { status, message };
  }

  /**
   * Determine overall health status
   */
  private determineOverallStatus(
    checks: HealthStatus['checks']
  ): 'healthy' | 'degraded' | 'unhealthy' {
    const statuses = Object.values(checks).map((check) => check?.status);

    if (statuses.includes('fail')) {
      return 'unhealthy';
    }

    if (statuses.includes('warn')) {
      return 'degraded';
    }

    return 'healthy';
  }

  /**
   * Get service uptime in seconds
   */
  private getUptime(): number {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  /**
   * Cleanup
   */
  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
