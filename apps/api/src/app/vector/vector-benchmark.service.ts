import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma';
import { EmbeddingService } from './embedding.service';
import { SimilaritySearchService } from './similarity-search.service';
import { SemanticSearchService } from './semantic-search.service';

/**
 * Single benchmark result
 */
export interface BenchmarkResult {
  operation: string;
  datasetSize: number;
  iterations: number;
  avgLatencyMs: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  throughputOpsPerSec: number;
  memoryUsageMb: number;
  timestamp: Date;
}

/**
 * Benchmark suite results
 */
export interface BenchmarkSuiteResult {
  suiteName: string;
  startTime: Date;
  endTime: Date;
  totalDurationMs: number;
  results: BenchmarkResult[];
  indexStats: IndexStatistics;
  recommendations: string[];
}

/**
 * Index statistics for analysis
 */
export interface IndexStatistics {
  totalProducts: number;
  productsWithEmbedding: number;
  indexType: string;
  indexSizeMb: number;
  hnswM: number;
  hnswEfConstruction: number;
  hnswEfSearch: number;
}

/**
 * Service for benchmarking vector search performance
 */
@Injectable()
export class VectorBenchmarkService {
  private readonly logger = new Logger(VectorBenchmarkService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddingService: EmbeddingService,
    private readonly similarityService: SimilaritySearchService,
    private readonly semanticSearchService: SemanticSearchService
  ) {}

  /**
   * Run full benchmark suite
   */
  async runBenchmarkSuite(iterations: number = 100): Promise<BenchmarkSuiteResult> {
    const startTime = new Date();
    this.logger.log(`Starting benchmark suite with ${iterations} iterations`);

    const results: BenchmarkResult[] = [];

    // Get current index stats
    const indexStats = await this.getIndexStatistics();

    // Run individual benchmarks
    results.push(await this.benchmarkSimilaritySearch(iterations));
    results.push(await this.benchmarkHybridSearch(iterations));
    results.push(await this.benchmarkSemanticSearch(iterations));
    results.push(await this.benchmarkEmbeddingGeneration(Math.min(iterations, 50)));
    results.push(await this.benchmarkBatchEmbedding(Math.min(iterations, 10)));
    results.push(await this.benchmarkSimilarProducts(iterations));

    const endTime = new Date();
    const totalDurationMs = endTime.getTime() - startTime.getTime();

    // Generate recommendations based on results
    const recommendations = this.generateRecommendations(results, indexStats);

    this.logger.log(`Benchmark suite completed in ${totalDurationMs}ms`);

    return {
      suiteName: 'Vector Operations Benchmark',
      startTime,
      endTime,
      totalDurationMs,
      results,
      indexStats,
      recommendations,
    };
  }

  /**
   * Benchmark similarity search operations
   */
  async benchmarkSimilaritySearch(iterations: number = 100): Promise<BenchmarkResult> {
    this.logger.debug(`Running similarity search benchmark (${iterations} iterations)`);

    // Generate a random embedding for testing
    const testEmbedding = this.generateRandomEmbedding(1536);
    const latencies: number[] = [];

    const memBefore = process.memoryUsage().heapUsed;

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await this.similarityService.findSimilarProducts(testEmbedding, {
        matchCount: 10,
        matchThreshold: 0.5,
      });
      latencies.push(performance.now() - start);
    }

    const memAfter = process.memoryUsage().heapUsed;
    const indexStats = await this.getIndexStatistics();

    return this.calculateBenchmarkResult(
      'similarity_search',
      indexStats.productsWithEmbedding,
      iterations,
      latencies,
      memAfter - memBefore
    );
  }

  /**
   * Benchmark hybrid search operations
   */
  async benchmarkHybridSearch(iterations: number = 100): Promise<BenchmarkResult> {
    this.logger.debug(`Running hybrid search benchmark (${iterations} iterations)`);

    const testQueries = [
      'birthday gift for mom',
      'christmas present for kids',
      'tech gadget for dad',
      'romantic anniversary gift',
      'outdoor adventure gear',
    ];

    const latencies: number[] = [];
    const memBefore = process.memoryUsage().heapUsed;

    for (let i = 0; i < iterations; i++) {
      const query = testQueries[i % testQueries.length];
      const start = performance.now();
      await this.similarityService.hybridSearchByText(query, {
        matchCount: 20,
      });
      latencies.push(performance.now() - start);
    }

    const memAfter = process.memoryUsage().heapUsed;
    const indexStats = await this.getIndexStatistics();

    return this.calculateBenchmarkResult(
      'hybrid_search',
      indexStats.productsWithEmbedding,
      iterations,
      latencies,
      memAfter - memBefore
    );
  }

  /**
   * Benchmark semantic search operations
   */
  async benchmarkSemanticSearch(iterations: number = 100): Promise<BenchmarkResult> {
    this.logger.debug(`Running semantic search benchmark (${iterations} iterations)`);

    const testQueries = [
      'unique handmade jewelry',
      'smart home devices',
      'eco-friendly products',
      'personalized gifts',
      'luxury watches',
    ];

    const latencies: number[] = [];
    const memBefore = process.memoryUsage().heapUsed;

    for (let i = 0; i < iterations; i++) {
      const query = testQueries[i % testQueries.length];
      const start = performance.now();
      await this.semanticSearchService.search(query, { limit: 10 });
      latencies.push(performance.now() - start);
    }

    const memAfter = process.memoryUsage().heapUsed;
    const indexStats = await this.getIndexStatistics();

    return this.calculateBenchmarkResult(
      'semantic_search',
      indexStats.productsWithEmbedding,
      iterations,
      latencies,
      memAfter - memBefore
    );
  }

  /**
   * Benchmark embedding generation
   */
  async benchmarkEmbeddingGeneration(iterations: number = 50): Promise<BenchmarkResult> {
    this.logger.debug(`Running embedding generation benchmark (${iterations} iterations)`);

    const testTexts = [
      'A beautiful handcrafted wooden jewelry box',
      'High-tech wireless noise-canceling headphones',
      'Organic cotton sustainable clothing collection',
      'Vintage leather messenger bag for professionals',
      'Smart fitness tracker with heart rate monitor',
    ];

    const latencies: number[] = [];
    const memBefore = process.memoryUsage().heapUsed;

    for (let i = 0; i < iterations; i++) {
      const text = testTexts[i % testTexts.length];
      const start = performance.now();
      await this.embeddingService.generateEmbedding({ text });
      latencies.push(performance.now() - start);
    }

    const memAfter = process.memoryUsage().heapUsed;

    return this.calculateBenchmarkResult(
      'embedding_generation',
      0, // Not dataset dependent
      iterations,
      latencies,
      memAfter - memBefore
    );
  }

  /**
   * Benchmark batch embedding generation
   */
  async benchmarkBatchEmbedding(iterations: number = 10): Promise<BenchmarkResult> {
    this.logger.debug(`Running batch embedding benchmark (${iterations} iterations)`);

    const batchSize = 10;
    const testTexts = Array.from({ length: batchSize }, (_, i) =>
      `Test product description ${i} with various attributes and features`
    );

    const latencies: number[] = [];
    const memBefore = process.memoryUsage().heapUsed;

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await this.embeddingService.generateBatchEmbeddings({ texts: testTexts });
      latencies.push(performance.now() - start);
    }

    const memAfter = process.memoryUsage().heapUsed;

    return this.calculateBenchmarkResult(
      `batch_embedding_${batchSize}`,
      batchSize,
      iterations,
      latencies,
      memAfter - memBefore
    );
  }

  /**
   * Benchmark similar products lookup
   */
  async benchmarkSimilarProducts(iterations: number = 100): Promise<BenchmarkResult> {
    this.logger.debug(`Running similar products benchmark (${iterations} iterations)`);

    // Get some product IDs with embeddings
    const products = await this.prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM products WHERE embedding IS NOT NULL LIMIT 10
    `;

    if (products.length === 0) {
      return this.calculateBenchmarkResult('similar_products', 0, 0, [], 0);
    }

    const latencies: number[] = [];
    const memBefore = process.memoryUsage().heapUsed;

    for (let i = 0; i < iterations; i++) {
      const productId = products[i % products.length].id;
      const start = performance.now();
      await this.similarityService.findSimilarToProduct(productId, { matchCount: 10 });
      latencies.push(performance.now() - start);
    }

    const memAfter = process.memoryUsage().heapUsed;
    const indexStats = await this.getIndexStatistics();

    return this.calculateBenchmarkResult(
      'similar_products',
      indexStats.productsWithEmbedding,
      iterations,
      latencies,
      memAfter - memBefore
    );
  }

  /**
   * Get index statistics
   */
  async getIndexStatistics(): Promise<IndexStatistics> {
    try {
      // Get product counts
      const counts = await this.prisma.$queryRaw<[{
        total: bigint;
        with_embedding: bigint;
      }]>`
        SELECT
          COUNT(*) as total,
          COUNT(embedding) as with_embedding
        FROM products
      `;

      // Get index information
      const indexInfo = await this.prisma.$queryRaw<[{
        indexrelname: string;
        pg_size: string;
        indexdef: string;
      }] | []>`
        SELECT
          indexrelname,
          pg_size_pretty(pg_relation_size(indexrelid)) as pg_size,
          indexdef
        FROM pg_stat_user_indexes
        JOIN pg_indexes ON indexname = indexrelname
        WHERE schemaname = 'public'
        AND indexrelname LIKE '%embedding%'
        LIMIT 1
      `;

      // Parse HNSW parameters from index definition
      let hnswM = 16;
      let hnswEfConstruction = 64;
      let indexSizeMb = 0;

      if (indexInfo.length > 0) {
        const indexDef = indexInfo[0].indexdef || '';
        const mMatch = indexDef.match(/m\s*=\s*(\d+)/);
        const efMatch = indexDef.match(/ef_construction\s*=\s*(\d+)/);

        if (mMatch) hnswM = parseInt(mMatch[1], 10);
        if (efMatch) hnswEfConstruction = parseInt(efMatch[1], 10);

        // Parse size (e.g., "12 MB" -> 12)
        const sizeStr = indexInfo[0].pg_size || '0';
        const sizeMatch = sizeStr.match(/(\d+(?:\.\d+)?)/);
        if (sizeMatch) {
          indexSizeMb = parseFloat(sizeMatch[1]);
          if (sizeStr.includes('kB')) indexSizeMb /= 1024;
          if (sizeStr.includes('GB')) indexSizeMb *= 1024;
        }
      }

      // Get ef_search setting
      const efSearch = await this.prisma.$queryRaw<[{ ef_search: number }] | []>`
        SHOW hnsw.ef_search
      `.catch(() => [{ ef_search: 40 }]);

      return {
        totalProducts: Number(counts[0]?.total || 0),
        productsWithEmbedding: Number(counts[0]?.with_embedding || 0),
        indexType: 'HNSW',
        indexSizeMb,
        hnswM,
        hnswEfConstruction,
        hnswEfSearch: efSearch[0]?.ef_search || 40,
      };
    } catch (error) {
      this.logger.error(`Failed to get index statistics: ${error.message}`);
      return {
        totalProducts: 0,
        productsWithEmbedding: 0,
        indexType: 'HNSW',
        indexSizeMb: 0,
        hnswM: 16,
        hnswEfConstruction: 64,
        hnswEfSearch: 40,
      };
    }
  }

  /**
   * Benchmark with different ef_search values to find optimal setting
   */
  async benchmarkEfSearchTuning(
    efValues: number[] = [10, 20, 40, 80, 100, 200]
  ): Promise<Array<{ efSearch: number; avgLatencyMs: number; recall: number }>> {
    this.logger.log('Running ef_search tuning benchmark');

    const testEmbedding = this.generateRandomEmbedding(1536);
    const iterations = 50;
    const results: Array<{ efSearch: number; avgLatencyMs: number; recall: number }> = [];

    // First, get ground truth with high ef_search
    await this.prisma.$executeRaw`SET hnsw.ef_search = 400`;
    const groundTruth = await this.similarityService.findSimilarProducts(testEmbedding, {
      matchCount: 100,
      matchThreshold: 0.3,
    });
    const groundTruthIds = new Set(groundTruth.map(r => r.id));

    for (const ef of efValues) {
      await this.prisma.$executeRaw`SET hnsw.ef_search = ${ef}`;

      const latencies: number[] = [];
      let totalRecall = 0;

      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        const searchResults = await this.similarityService.findSimilarProducts(testEmbedding, {
          matchCount: 10,
          matchThreshold: 0.3,
        });
        latencies.push(performance.now() - start);

        // Calculate recall
        const found = searchResults.filter(r => groundTruthIds.has(r.id)).length;
        totalRecall += found / searchResults.length;
      }

      const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
      const avgRecall = totalRecall / iterations;

      results.push({
        efSearch: ef,
        avgLatencyMs: Math.round(avgLatency * 100) / 100,
        recall: Math.round(avgRecall * 1000) / 1000,
      });
    }

    // Reset to default
    await this.prisma.$executeRaw`SET hnsw.ef_search = 40`;

    return results;
  }

  /**
   * Calculate benchmark result from latencies
   */
  private calculateBenchmarkResult(
    operation: string,
    datasetSize: number,
    iterations: number,
    latencies: number[],
    memoryDelta: number
  ): BenchmarkResult {
    if (latencies.length === 0) {
      return {
        operation,
        datasetSize,
        iterations: 0,
        avgLatencyMs: 0,
        p50LatencyMs: 0,
        p95LatencyMs: 0,
        p99LatencyMs: 0,
        minLatencyMs: 0,
        maxLatencyMs: 0,
        throughputOpsPerSec: 0,
        memoryUsageMb: 0,
        timestamp: new Date(),
      };
    }

    // Sort for percentile calculations
    const sorted = [...latencies].sort((a, b) => a - b);

    const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const p50 = sorted[Math.floor(sorted.length * 0.5)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];
    const min = sorted[0];
    const max = sorted[sorted.length - 1];

    const totalTimeMs = latencies.reduce((a, b) => a + b, 0);
    const throughput = (iterations / totalTimeMs) * 1000;

    return {
      operation,
      datasetSize,
      iterations,
      avgLatencyMs: Math.round(avg * 100) / 100,
      p50LatencyMs: Math.round(p50 * 100) / 100,
      p95LatencyMs: Math.round(p95 * 100) / 100,
      p99LatencyMs: Math.round(p99 * 100) / 100,
      minLatencyMs: Math.round(min * 100) / 100,
      maxLatencyMs: Math.round(max * 100) / 100,
      throughputOpsPerSec: Math.round(throughput * 100) / 100,
      memoryUsageMb: Math.round((memoryDelta / 1024 / 1024) * 100) / 100,
      timestamp: new Date(),
    };
  }

  /**
   * Generate random embedding for testing
   */
  private generateRandomEmbedding(dimensions: number): number[] {
    const embedding: number[] = [];
    for (let i = 0; i < dimensions; i++) {
      embedding.push(Math.random() * 2 - 1);
    }
    // Normalize
    const norm = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
    return embedding.map(v => v / norm);
  }

  /**
   * Generate optimization recommendations based on benchmark results
   */
  private generateRecommendations(
    results: BenchmarkResult[],
    indexStats: IndexStatistics
  ): string[] {
    const recommendations: string[] = [];

    // Check similarity search latency
    const similarityResult = results.find(r => r.operation === 'similarity_search');
    if (similarityResult && similarityResult.p95LatencyMs > 100) {
      recommendations.push(
        `Similarity search p95 latency (${similarityResult.p95LatencyMs}ms) exceeds target (100ms). ` +
        `Consider increasing hnsw.ef_search or adding more memory.`
      );
    }

    // Check hybrid search latency
    const hybridResult = results.find(r => r.operation === 'hybrid_search');
    if (hybridResult && hybridResult.p95LatencyMs > 200) {
      recommendations.push(
        `Hybrid search p95 latency (${hybridResult.p95LatencyMs}ms) exceeds target (200ms). ` +
        `Consider adding caching for common queries.`
      );
    }

    // Check embedding generation
    const embeddingResult = results.find(r => r.operation === 'embedding_generation');
    if (embeddingResult && embeddingResult.avgLatencyMs > 500) {
      recommendations.push(
        `Embedding generation is slow (${embeddingResult.avgLatencyMs}ms avg). ` +
        `Consider caching embeddings or using a faster model.`
      );
    }

    // Check index parameters based on dataset size
    if (indexStats.productsWithEmbedding > 100000 && indexStats.hnswM < 32) {
      recommendations.push(
        `Large dataset (${indexStats.productsWithEmbedding} vectors) may benefit from higher ` +
        `HNSW m parameter (current: ${indexStats.hnswM}, recommended: 32+).`
      );
    }

    if (indexStats.productsWithEmbedding > 50000 && indexStats.hnswEfConstruction < 128) {
      recommendations.push(
        `Consider increasing ef_construction to 128+ for better recall with ` +
        `${indexStats.productsWithEmbedding} vectors.`
      );
    }

    // Check index coverage
    const coverage = indexStats.totalProducts > 0
      ? (indexStats.productsWithEmbedding / indexStats.totalProducts) * 100
      : 0;
    if (coverage < 90) {
      recommendations.push(
        `Only ${coverage.toFixed(1)}% of products have embeddings. ` +
        `Run embedding backfill to improve search coverage.`
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('All metrics within acceptable ranges. No immediate optimizations needed.');
    }

    return recommendations;
  }
}
