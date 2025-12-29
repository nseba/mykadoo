import { Injectable, Logger } from '@nestjs/common';
import { VectorOperationType } from './vector-metrics.service';

/**
 * Structured log entry for vector operations
 */
export interface VectorLogEntry {
  // Operation context
  operation: VectorOperationType;
  correlationId?: string;
  userId?: string;
  sessionId?: string;

  // Timing
  startTime: Date;
  endTime?: Date;
  durationMs?: number;

  // Query details
  query?: string;
  queryLength?: number;
  embeddingDimensions?: number;

  // Search parameters
  matchCount?: number;
  matchThreshold?: number;
  categoryFilter?: string;
  priceRange?: { min?: number; max?: number };

  // Results
  resultCount?: number;
  topSimilarity?: number;
  cached?: boolean;
  cacheLevel?: 'l1' | 'l2';

  // Resource usage
  tokensUsed?: number;
  estimatedCost?: number;

  // Error details
  error?: {
    type: string;
    message: string;
    stack?: string;
    retryable?: boolean;
  };

  // Performance indicators
  queryPlanTime?: number;
  indexScanTime?: number;
  rerankingTime?: number;

  // Additional context
  metadata?: Record<string, unknown>;
}

/**
 * Structured query log for analytics
 */
export interface QueryLog {
  timestamp: Date;
  operation: VectorOperationType;
  query: string;
  userId?: string;
  durationMs: number;
  resultCount: number;
  cached: boolean;
  success: boolean;
}

/**
 * Service for structured logging of vector operations
 * Provides JSON-formatted logs for aggregation and analysis
 */
@Injectable()
export class VectorLoggingService {
  private readonly logger = new Logger('VectorOperations');

  // In-memory buffer for query logs (for batch writing)
  private queryLogBuffer: QueryLog[] = [];
  private readonly maxBufferSize = 100;

  /**
   * Log a vector search operation
   */
  logSearch(entry: Partial<VectorLogEntry> & { operation: VectorOperationType }): void {
    const enrichedEntry = this.enrichLogEntry(entry);

    if (entry.error) {
      this.logger.error(
        this.formatLogMessage(enrichedEntry),
        this.formatStructuredLog(enrichedEntry)
      );
    } else if (enrichedEntry.durationMs && enrichedEntry.durationMs > 500) {
      // Log slow queries as warnings
      this.logger.warn(
        `Slow ${entry.operation}: ${enrichedEntry.durationMs}ms`,
        this.formatStructuredLog(enrichedEntry)
      );
    } else {
      this.logger.debug(
        this.formatLogMessage(enrichedEntry),
        this.formatStructuredLog(enrichedEntry)
      );
    }

    // Add to query log buffer for analytics
    if (!entry.error) {
      this.addToQueryLogBuffer(enrichedEntry);
    }
  }

  /**
   * Log embedding generation
   */
  logEmbedding(entry: Partial<VectorLogEntry>): void {
    const enrichedEntry = this.enrichLogEntry({
      ...entry,
      operation: entry.operation || 'embedding_generation',
    });

    if (entry.error) {
      this.logger.error(
        `Embedding generation failed: ${entry.error.message}`,
        this.formatStructuredLog(enrichedEntry)
      );
    } else {
      this.logger.debug(
        `Embedding generated: ${entry.tokensUsed} tokens, ${enrichedEntry.durationMs}ms`,
        this.formatStructuredLog(enrichedEntry)
      );
    }
  }

  /**
   * Log cache operation
   */
  logCacheOperation(
    operation: 'hit' | 'miss' | 'invalidation' | 'write',
    level: 'l1' | 'l2',
    details?: {
      cacheKey?: string;
      query?: string;
      entryCount?: number;
    }
  ): void {
    this.logger.debug(
      `Cache ${operation} (${level})`,
      JSON.stringify({
        event: 'cache_operation',
        timestamp: new Date().toISOString(),
        operation,
        level,
        ...details,
      })
    );
  }

  /**
   * Log pool operation
   */
  logPoolOperation(
    operation: 'acquire' | 'release' | 'timeout' | 'error',
    details: {
      waitTimeMs?: number;
      acquiredCount?: number;
      maxConnections?: number;
      error?: string;
    }
  ): void {
    const level = operation === 'error' || operation === 'timeout' ? 'warn' : 'debug';
    const logFn = level === 'warn' ? this.logger.warn.bind(this.logger) : this.logger.debug.bind(this.logger);

    logFn(
      `Pool ${operation}`,
      JSON.stringify({
        event: 'pool_operation',
        timestamp: new Date().toISOString(),
        operation,
        ...details,
      })
    );
  }

  /**
   * Log a batch operation
   */
  logBatchOperation(
    operation: 'start' | 'progress' | 'complete' | 'error',
    details: {
      batchId?: string;
      totalItems?: number;
      processedItems?: number;
      successfulItems?: number;
      failedItems?: number;
      durationMs?: number;
      tokensUsed?: number;
      estimatedCost?: number;
      error?: string;
    }
  ): void {
    const level = operation === 'error' ? 'error' : operation === 'complete' ? 'log' : 'debug';

    const logFn =
      level === 'error'
        ? this.logger.error.bind(this.logger)
        : level === 'log'
          ? this.logger.log.bind(this.logger)
          : this.logger.debug.bind(this.logger);

    logFn(
      `Batch ${operation}: ${details.processedItems || 0}/${details.totalItems || 0} items`,
      JSON.stringify({
        event: 'batch_operation',
        timestamp: new Date().toISOString(),
        operation,
        ...details,
      })
    );
  }

  /**
   * Log an alert condition
   */
  logAlert(
    alertType: string,
    severity: 'warning' | 'critical',
    details: {
      threshold?: number;
      currentValue?: number;
      message: string;
      metadata?: Record<string, unknown>;
    }
  ): void {
    const logFn = severity === 'critical' ? this.logger.error.bind(this.logger) : this.logger.warn.bind(this.logger);

    logFn(
      `[ALERT:${severity.toUpperCase()}] ${alertType}: ${details.message}`,
      JSON.stringify({
        event: 'alert',
        timestamp: new Date().toISOString(),
        alertType,
        severity,
        ...details,
      })
    );
  }

  /**
   * Get buffered query logs and clear buffer
   */
  flushQueryLogs(): QueryLog[] {
    const logs = [...this.queryLogBuffer];
    this.queryLogBuffer = [];
    return logs;
  }

  /**
   * Get current buffer size
   */
  getBufferSize(): number {
    return this.queryLogBuffer.length;
  }

  /**
   * Enrich log entry with computed fields
   */
  private enrichLogEntry(entry: Partial<VectorLogEntry> & { operation: VectorOperationType }): VectorLogEntry {
    const now = new Date();
    const enriched: VectorLogEntry = {
      ...entry,
      operation: entry.operation,
      startTime: entry.startTime || now,
      endTime: entry.endTime || now,
    };

    // Calculate duration if not provided
    if (!enriched.durationMs && enriched.startTime && enriched.endTime) {
      enriched.durationMs = enriched.endTime.getTime() - enriched.startTime.getTime();
    }

    // Calculate query length
    if (entry.query && !entry.queryLength) {
      enriched.queryLength = entry.query.length;
    }

    return enriched;
  }

  /**
   * Format log message for human readability
   */
  private formatLogMessage(entry: VectorLogEntry): string {
    const parts: string[] = [entry.operation];

    if (entry.query) {
      parts.push(`"${entry.query.substring(0, 50)}${entry.query.length > 50 ? '...' : ''}"`);
    }

    if (entry.durationMs !== undefined) {
      parts.push(`${entry.durationMs}ms`);
    }

    if (entry.resultCount !== undefined) {
      parts.push(`${entry.resultCount} results`);
    }

    if (entry.cached) {
      parts.push(`(cached:${entry.cacheLevel || 'unknown'})`);
    }

    return parts.join(' - ');
  }

  /**
   * Format structured log for JSON output
   */
  private formatStructuredLog(entry: VectorLogEntry): string {
    return JSON.stringify({
      event: 'vector_operation',
      timestamp: entry.startTime.toISOString(),
      ...entry,
      // Exclude stack traces from structured logs (keep them in error logs)
      error: entry.error
        ? {
            type: entry.error.type,
            message: entry.error.message,
            retryable: entry.error.retryable,
          }
        : undefined,
    });
  }

  /**
   * Add entry to query log buffer
   */
  private addToQueryLogBuffer(entry: VectorLogEntry): void {
    this.queryLogBuffer.push({
      timestamp: entry.startTime,
      operation: entry.operation,
      query: entry.query || '',
      userId: entry.userId,
      durationMs: entry.durationMs || 0,
      resultCount: entry.resultCount || 0,
      cached: entry.cached || false,
      success: !entry.error,
    });

    // Auto-flush if buffer is full
    if (this.queryLogBuffer.length >= this.maxBufferSize) {
      this.logger.debug(`Query log buffer full, auto-flushing ${this.queryLogBuffer.length} entries`);
      // In production, this would write to a database or analytics service
      this.queryLogBuffer = [];
    }
  }
}
