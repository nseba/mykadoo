import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import {
  Counter,
  Histogram,
  Gauge,
  Registry,
  collectDefaultMetrics,
} from 'prom-client';

/**
 * Vector operation types for metrics labeling
 */
export type VectorOperationType =
  | 'similarity_search'
  | 'semantic_search'
  | 'hybrid_search'
  | 'embedding_generation'
  | 'batch_embedding'
  | 'similar_products'
  | 'recommendations'
  | 'user_preference_update';

/**
 * Cache operation types
 */
export type CacheOperationType = 'l1_hit' | 'l1_miss' | 'l2_hit' | 'l2_miss' | 'invalidation';

/**
 * Error types for vector operations
 */
export type VectorErrorType =
  | 'embedding_generation_failed'
  | 'search_failed'
  | 'storage_failed'
  | 'cache_failed'
  | 'pool_exhausted'
  | 'timeout';

/**
 * Service for collecting Prometheus metrics for vector operations
 * Provides histograms for latency, counters for operations, and gauges for status
 */
@Injectable()
export class VectorMetricsService implements OnModuleInit {
  // Latency histograms
  private readonly searchLatencyHistogram: Histogram<string>;
  private readonly embeddingLatencyHistogram: Histogram<string>;

  // Operation counters
  private readonly operationsCounter: Counter<string>;
  private readonly errorsCounter: Counter<string>;
  private readonly cacheOperationsCounter: Counter<string>;

  // Gauges for current state
  private readonly embeddingCoverageGauge: Gauge<string>;
  private readonly poolUtilizationGauge: Gauge<string>;
  private readonly cacheEntriesGauge: Gauge<string>;
  private readonly cacheHitRateGauge: Gauge<string>;
  private readonly indexSizeGauge: Gauge<string>;

  // Token and cost tracking
  private readonly tokensUsedCounter: Counter<string>;
  private readonly embeddingCostCounter: Counter<string>;

  constructor() {
    const registry = new Registry();

    // Search latency histogram (in seconds)
    this.searchLatencyHistogram = new Histogram({
      name: 'vector_search_duration_seconds',
      help: 'Duration of vector search operations in seconds',
      labelNames: ['operation', 'status', 'cached'],
      buckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
      registers: [registry],
    });

    // Embedding generation latency histogram
    this.embeddingLatencyHistogram = new Histogram({
      name: 'vector_embedding_duration_seconds',
      help: 'Duration of embedding generation in seconds',
      labelNames: ['operation', 'status', 'model'],
      buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10, 30],
      registers: [registry],
    });

    // Operations counter
    this.operationsCounter = new Counter({
      name: 'vector_operations_total',
      help: 'Total number of vector operations',
      labelNames: ['operation', 'status'],
      registers: [registry],
    });

    // Errors counter
    this.errorsCounter = new Counter({
      name: 'vector_errors_total',
      help: 'Total number of vector operation errors',
      labelNames: ['operation', 'error_type'],
      registers: [registry],
    });

    // Cache operations counter
    this.cacheOperationsCounter = new Counter({
      name: 'vector_cache_operations_total',
      help: 'Total number of cache operations',
      labelNames: ['operation', 'level'],
      registers: [registry],
    });

    // Embedding coverage gauge
    this.embeddingCoverageGauge = new Gauge({
      name: 'vector_embedding_coverage_ratio',
      help: 'Ratio of products with embeddings to total products',
      registers: [registry],
    });

    // Pool utilization gauge
    this.poolUtilizationGauge = new Gauge({
      name: 'vector_pool_utilization_ratio',
      help: 'Ratio of acquired connections to max connections',
      labelNames: ['pool'],
      registers: [registry],
    });

    // Cache entries gauge
    this.cacheEntriesGauge = new Gauge({
      name: 'vector_cache_entries',
      help: 'Number of entries in vector cache',
      labelNames: ['level'],
      registers: [registry],
    });

    // Cache hit rate gauge
    this.cacheHitRateGauge = new Gauge({
      name: 'vector_cache_hit_rate',
      help: 'Cache hit rate for vector queries',
      registers: [registry],
    });

    // Index size gauge
    this.indexSizeGauge = new Gauge({
      name: 'vector_index_size_bytes',
      help: 'Size of the vector index in bytes',
      registers: [registry],
    });

    // Tokens used counter
    this.tokensUsedCounter = new Counter({
      name: 'vector_embedding_tokens_total',
      help: 'Total tokens used for embedding generation',
      labelNames: ['model'],
      registers: [registry],
    });

    // Embedding cost counter
    this.embeddingCostCounter = new Counter({
      name: 'vector_embedding_cost_usd',
      help: 'Total cost of embedding generation in USD',
      labelNames: ['model'],
      registers: [registry],
    });

    // Register metrics with default registry
    registry.registerMetric(this.searchLatencyHistogram);
    registry.registerMetric(this.embeddingLatencyHistogram);
    registry.registerMetric(this.operationsCounter);
    registry.registerMetric(this.errorsCounter);
    registry.registerMetric(this.cacheOperationsCounter);
    registry.registerMetric(this.embeddingCoverageGauge);
    registry.registerMetric(this.poolUtilizationGauge);
    registry.registerMetric(this.cacheEntriesGauge);
    registry.registerMetric(this.cacheHitRateGauge);
    registry.registerMetric(this.indexSizeGauge);
    registry.registerMetric(this.tokensUsedCounter);
    registry.registerMetric(this.embeddingCostCounter);
  }

  onModuleInit() {
    // Collect default Node.js metrics
    collectDefaultMetrics({ prefix: 'vector_' });
  }

  /**
   * Record a search operation with timing
   */
  recordSearchLatency(
    operation: VectorOperationType,
    durationSeconds: number,
    status: 'success' | 'error' = 'success',
    cached = false
  ): void {
    this.searchLatencyHistogram.observe(
      { operation, status, cached: String(cached) },
      durationSeconds
    );
    this.operationsCounter.inc({ operation, status });
  }

  /**
   * Record embedding generation with timing
   */
  recordEmbeddingLatency(
    durationSeconds: number,
    status: 'success' | 'error' = 'success',
    model = 'text-embedding-3-small',
    isBatch = false
  ): void {
    const operation = isBatch ? 'batch_embedding' : 'embedding_generation';
    this.embeddingLatencyHistogram.observe(
      { operation, status, model },
      durationSeconds
    );
    this.operationsCounter.inc({ operation, status });
  }

  /**
   * Record an error
   */
  recordError(operation: VectorOperationType, errorType: VectorErrorType): void {
    this.errorsCounter.inc({ operation, error_type: errorType });
    this.operationsCounter.inc({ operation, status: 'error' });
  }

  /**
   * Record cache operation
   */
  recordCacheOperation(operation: CacheOperationType): void {
    const level = operation.startsWith('l1') ? 'l1' : 'l2';
    const opType = operation.includes('hit') ? 'hit' : operation.includes('miss') ? 'miss' : 'invalidation';
    this.cacheOperationsCounter.inc({ operation: opType, level });
  }

  /**
   * Update embedding coverage gauge
   */
  setEmbeddingCoverage(productsWithEmbedding: number, totalProducts: number): void {
    const coverage = totalProducts > 0 ? productsWithEmbedding / totalProducts : 0;
    this.embeddingCoverageGauge.set(coverage);
  }

  /**
   * Update pool utilization gauge
   */
  setPoolUtilization(acquired: number, max: number, poolName = 'vector'): void {
    const utilization = max > 0 ? acquired / max : 0;
    this.poolUtilizationGauge.set({ pool: poolName }, utilization);
  }

  /**
   * Update cache entries gauge
   */
  setCacheEntries(l1Entries: number, l2Entries: number): void {
    this.cacheEntriesGauge.set({ level: 'l1' }, l1Entries);
    this.cacheEntriesGauge.set({ level: 'l2' }, l2Entries);
  }

  /**
   * Update cache hit rate gauge
   */
  setCacheHitRate(hitRate: number): void {
    this.cacheHitRateGauge.set(hitRate);
  }

  /**
   * Update index size gauge
   */
  setIndexSize(sizeBytes: number): void {
    this.indexSizeGauge.set(sizeBytes);
  }

  /**
   * Record tokens used for embedding
   */
  recordTokensUsed(tokens: number, model = 'text-embedding-3-small'): void {
    this.tokensUsedCounter.inc({ model }, tokens);
  }

  /**
   * Record embedding cost
   */
  recordEmbeddingCost(costUsd: number, model = 'text-embedding-3-small'): void {
    this.embeddingCostCounter.inc({ model }, costUsd);
  }

  /**
   * Create a timer for measuring operation duration
   */
  startTimer(): () => number {
    const start = process.hrtime.bigint();
    return () => {
      const end = process.hrtime.bigint();
      return Number(end - start) / 1e9; // Convert to seconds
    };
  }

  /**
   * Helper to wrap async operations with metrics
   */
  async withSearchMetrics<T>(
    operation: VectorOperationType,
    fn: () => Promise<T>,
    cached = false
  ): Promise<T> {
    const stopTimer = this.startTimer();
    try {
      const result = await fn();
      this.recordSearchLatency(operation, stopTimer(), 'success', cached);
      return result;
    } catch (error) {
      this.recordSearchLatency(operation, stopTimer(), 'error', cached);
      throw error;
    }
  }

  /**
   * Helper to wrap embedding operations with metrics
   */
  async withEmbeddingMetrics<T>(
    fn: () => Promise<T>,
    isBatch = false,
    model = 'text-embedding-3-small'
  ): Promise<T> {
    const stopTimer = this.startTimer();
    try {
      const result = await fn();
      this.recordEmbeddingLatency(stopTimer(), 'success', model, isBatch);
      return result;
    } catch (error) {
      this.recordEmbeddingLatency(stopTimer(), 'error', model, isBatch);
      throw error;
    }
  }
}
