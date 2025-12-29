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
import { VectorBenchmarkService, BenchmarkSuiteResult } from './vector-benchmark.service';
import { QueryCacheService, CacheStats } from './query-cache.service';
import { VectorPoolService, PoolStats } from './vector-pool.service';
import { BatchEmbeddingOptimizerService, BatchResult } from './batch-embedding-optimizer.service';

/**
 * DTO for batch embedding request
 */
class BatchEmbeddingDto {
  productIds?: string[];
  batchSize?: number;
  concurrency?: number;
}

/**
 * DTO for ef_search tuning request
 */
class EfSearchTuningDto {
  efValues?: number[];
}

@ApiTags('Performance')
@Controller('performance')
export class PerformanceController {
  private readonly logger = new Logger(PerformanceController.name);

  constructor(
    private readonly benchmarkService: VectorBenchmarkService,
    private readonly cacheService: QueryCacheService,
    private readonly poolService: VectorPoolService,
    private readonly batchOptimizer: BatchEmbeddingOptimizerService
  ) {}

  /**
   * Run full benchmark suite
   */
  @Post('benchmark')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Run full vector operations benchmark suite' })
  @ApiQuery({ name: 'iterations', required: false, description: 'Number of iterations per test' })
  @ApiResponse({
    status: 200,
    description: 'Returns benchmark results with recommendations',
  })
  async runBenchmark(
    @Query('iterations') iterations?: number
  ): Promise<BenchmarkSuiteResult> {
    this.logger.log(`Starting benchmark with ${iterations || 100} iterations`);
    return this.benchmarkService.runBenchmarkSuite(iterations || 100);
  }

  /**
   * Get index statistics
   */
  @Get('index-stats')
  @ApiOperation({ summary: 'Get vector index statistics' })
  @ApiResponse({
    status: 200,
    description: 'Returns index statistics including HNSW parameters',
  })
  async getIndexStats() {
    return this.benchmarkService.getIndexStatistics();
  }

  /**
   * Run ef_search tuning benchmark
   */
  @Post('tune-ef-search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Run ef_search parameter tuning benchmark' })
  @ApiResponse({
    status: 200,
    description: 'Returns latency and recall for different ef_search values',
  })
  async tuneEfSearch(@Body() dto: EfSearchTuningDto) {
    const efValues = dto.efValues || [10, 20, 40, 80, 100, 200];
    this.logger.log(`Running ef_search tuning with values: ${efValues.join(', ')}`);
    return this.benchmarkService.benchmarkEfSearchTuning(efValues);
  }

  /**
   * Get cache statistics
   */
  @Get('cache/stats')
  @ApiOperation({ summary: 'Get query cache statistics' })
  @ApiResponse({
    status: 200,
    description: 'Returns cache hit rate and statistics',
  })
  async getCacheStats(): Promise<CacheStats> {
    return this.cacheService.getStats();
  }

  /**
   * Get top cached queries
   */
  @Get('cache/top-queries')
  @ApiOperation({ summary: 'Get most frequently cached queries' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of queries to return' })
  @ApiResponse({
    status: 200,
    description: 'Returns top cached queries by hit count',
  })
  async getTopQueries(@Query('limit') limit?: number) {
    return this.cacheService.getTopQueries(limit || 100);
  }

  /**
   * Invalidate all cache entries
   */
  @Post('cache/invalidate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Invalidate all cache entries' })
  @ApiResponse({
    status: 200,
    description: 'Cache invalidated successfully',
  })
  async invalidateCache(): Promise<{ success: boolean }> {
    await this.cacheService.invalidateAll();
    return { success: true };
  }

  /**
   * Cleanup expired cache entries
   */
  @Post('cache/cleanup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clean up expired cache entries' })
  @ApiResponse({
    status: 200,
    description: 'Returns number of entries cleaned up',
  })
  async cleanupCache(): Promise<{ deletedCount: number }> {
    const deleted = await this.cacheService.cleanupExpiredEntries();
    return { deletedCount: deleted };
  }

  /**
   * Get connection pool statistics
   */
  @Get('pool/stats')
  @ApiOperation({ summary: 'Get vector connection pool statistics' })
  @ApiResponse({
    status: 200,
    description: 'Returns pool utilization statistics',
  })
  getPoolStats(): PoolStats {
    return this.poolService.getStats();
  }

  /**
   * Health check for connection pool
   */
  @Get('pool/health')
  @ApiOperation({ summary: 'Check connection pool health' })
  @ApiResponse({
    status: 200,
    description: 'Returns pool health status',
  })
  async checkPoolHealth() {
    return this.poolService.healthCheck();
  }

  /**
   * Run batch embedding for all missing products
   */
  @Post('batch-embed/all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate embeddings for all products missing them' })
  @ApiResponse({
    status: 200,
    description: 'Returns batch processing results',
  })
  async batchEmbedAll(
    @Body() dto: BatchEmbeddingDto
  ): Promise<BatchResult> {
    this.logger.log('Starting batch embedding for all missing products');
    return this.batchOptimizer.processAllMissingEmbeddings({
      batchSize: dto.batchSize || 100,
      concurrency: dto.concurrency || 3,
      onProgress: (progress) => {
        if (progress.currentBatch % 10 === 0) {
          this.logger.log(
            `Batch ${progress.currentBatch}/${progress.totalBatches}: ` +
            `${progress.percentComplete.toFixed(1)}% complete`
          );
        }
      },
    });
  }

  /**
   * Run batch embedding for specific products
   */
  @Post('batch-embed/products')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate embeddings for specific products' })
  @ApiResponse({
    status: 200,
    description: 'Returns batch processing results',
  })
  async batchEmbedProducts(
    @Body() dto: BatchEmbeddingDto
  ): Promise<BatchResult> {
    if (!dto.productIds || dto.productIds.length === 0) {
      return {
        totalItems: 0,
        successfulItems: 0,
        failedItems: 0,
        tokensUsed: 0,
        estimatedCost: 0,
        durationMs: 0,
        errors: [],
      };
    }

    this.logger.log(`Starting batch embedding for ${dto.productIds.length} products`);
    return this.batchOptimizer.processProductIds(dto.productIds, {
      batchSize: dto.batchSize || 100,
      concurrency: dto.concurrency || 3,
    });
  }

  /**
   * Estimate cost for batch embedding
   */
  @Post('batch-embed/estimate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Estimate cost and time for batch embedding' })
  @ApiResponse({
    status: 200,
    description: 'Returns cost and time estimates',
  })
  async estimateBatchCost(@Body() dto: BatchEmbeddingDto) {
    if (!dto.productIds || dto.productIds.length === 0) {
      return {
        estimatedTokens: 0,
        estimatedCost: 0,
        estimatedDurationMs: 0,
      };
    }

    return this.batchOptimizer.estimateBatchCost(dto.productIds);
  }

  /**
   * Get performance summary
   */
  @Get('summary')
  @ApiOperation({ summary: 'Get overall performance summary' })
  @ApiResponse({
    status: 200,
    description: 'Returns combined performance metrics',
  })
  async getPerformanceSummary() {
    const [indexStats, cacheStats, poolStats, poolHealth] = await Promise.all([
      this.benchmarkService.getIndexStatistics(),
      this.cacheService.getStats(),
      this.poolService.getStats(),
      this.poolService.healthCheck(),
    ]);

    return {
      index: {
        totalProducts: indexStats.totalProducts,
        productsWithEmbedding: indexStats.productsWithEmbedding,
        percentIndexed: indexStats.totalProducts > 0
          ? (indexStats.productsWithEmbedding / indexStats.totalProducts) * 100
          : 0,
        indexType: indexStats.indexType,
        hnswM: indexStats.hnswM,
        hnswEfConstruction: indexStats.hnswEfConstruction,
        hnswEfSearch: indexStats.hnswEfSearch,
      },
      cache: {
        hitRate: cacheStats.hitRate * 100,
        totalEntries: cacheStats.totalEntries,
        memoryUsageMb: cacheStats.memoryUsageMb,
      },
      pool: {
        ...poolStats,
        healthy: poolHealth.healthy,
        utilizationPercent: poolStats.maxConnections > 0
          ? (poolStats.acquiredConnections / poolStats.maxConnections) * 100
          : 0,
      },
    };
  }
}
