/**
 * Performance Interceptor
 *
 * Tracks request performance metrics
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { getPerformanceService } from '@mykadoo/cache';

/**
 * Performance Monitoring Interceptor
 *
 * Automatically tracks response times and status codes
 */
@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PerformanceInterceptor.name);
  private perfService = getPerformanceService();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    return next.handle().pipe(
      tap({
        next: () => {
          this.recordMetric(context, requestId, startTime, 200);
        },
        error: (error) => {
          const statusCode = error.status || 500;
          this.recordMetric(context, requestId, startTime, statusCode);
        },
      })
    );
  }

  /**
   * Record performance metric
   */
  private recordMetric(
    context: ExecutionContext,
    requestId: string,
    startTime: number,
    statusCode: number
  ): void {
    const request = context.switchToHttp().getRequest();
    const responseTime = Date.now() - startTime;

    this.perfService.recordMetric({
      requestId,
      endpoint: request.url,
      method: request.method,
      responseTime,
      statusCode,
      timestamp: new Date(),
      userAgent: request.headers['user-agent'],
      userId: request.user?.id,
    });

    if (responseTime > 1000) {
      this.logger.warn(
        `Slow request: ${request.method} ${request.url} (${responseTime}ms)`
      );
    }
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }
}
