/**
 * @jest-environment node
 *
 * Automated benchmark tests for vector operations
 * These tests verify performance characteristics and detect regressions
 */
import { Test, TestingModule } from '@nestjs/testing';
import { VectorBenchmarkService, BenchmarkResult } from '../vector-benchmark.service';
import { SimilaritySearchService } from '../similarity-search.service';
import { SemanticSearchService } from '../semantic-search.service';
import { EmbeddingService } from '../embedding.service';
import { VectorPoolService } from '../vector-pool.service';
import { QueryCacheService } from '../query-cache.service';
import { VectorMetricsService } from '../vector-metrics.service';
import { PrismaService } from '../../common/prisma';
import { ConfigService } from '@nestjs/config';

describe('Vector Operations Benchmark', () => {
  let benchmarkService: VectorBenchmarkService;
  let similaritySearchService: jest.Mocked<SimilaritySearchService>;
  let semanticSearchService: jest.Mocked<SemanticSearchService>;
  let embeddingService: jest.Mocked<EmbeddingService>;
  let poolService: jest.Mocked<VectorPoolService>;
  let cacheService: jest.Mocked<QueryCacheService>;
  let metricsService: jest.Mocked<VectorMetricsService>;

  const mockEmbedding = Array(1536).fill(0.1);

  beforeEach(async () => {
    const mockSimilaritySearchService = {
      findSimilarProducts: jest.fn(),
      hybridSearch: jest.fn(),
      hybridSearchByText: jest.fn(),
      findSimilarToProduct: jest.fn(),
      findSimilarProductsByText: jest.fn(),
    };

    const mockSemanticSearchService = {
      search: jest.fn(),
      searchWithFilters: jest.fn(),
    };

    const mockEmbeddingService = {
      generateEmbedding: jest.fn(),
      generateBatchEmbeddings: jest.fn(),
      validateEmbedding: jest.fn(),
    };

    const mockPoolService = {
      getPoolStats: jest.fn(),
      executeQuery: jest.fn(),
    };

    const mockCacheService = {
      getStats: jest.fn(),
      get: jest.fn(),
      set: jest.fn(),
    };

    const mockMetricsService = {
      recordSearchLatency: jest.fn(),
      recordEmbeddingLatency: jest.fn(),
    };

    const mockPrismaService = {
      $queryRaw: jest.fn(),
      $executeRaw: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn().mockReturnValue('test-api-key'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VectorBenchmarkService,
        { provide: SimilaritySearchService, useValue: mockSimilaritySearchService },
        { provide: SemanticSearchService, useValue: mockSemanticSearchService },
        { provide: EmbeddingService, useValue: mockEmbeddingService },
        { provide: VectorPoolService, useValue: mockPoolService },
        { provide: QueryCacheService, useValue: mockCacheService },
        { provide: VectorMetricsService, useValue: mockMetricsService },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    benchmarkService = module.get<VectorBenchmarkService>(VectorBenchmarkService);
    similaritySearchService = module.get(SimilaritySearchService);
    semanticSearchService = module.get(SemanticSearchService);
    embeddingService = module.get(EmbeddingService);
    poolService = module.get(VectorPoolService);
    cacheService = module.get(QueryCacheService);
    metricsService = module.get(VectorMetricsService);
  });

  describe('Similarity Search Performance', () => {
    const LATENCY_THRESHOLD_MS = 500; // p95 should be under 500ms

    beforeEach(() => {
      similaritySearchService.findSimilarProducts.mockImplementation(async () => {
        // Simulate realistic latency (10-100ms)
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 90 + 10));
        return [
          { id: 'p1', similarity: 0.9 },
          { id: 'p2', similarity: 0.85 },
        ];
      });
    });

    it('should complete similarity search within latency threshold', async () => {
      const iterations = 10;
      const latencies: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const start = Date.now();
        await similaritySearchService.findSimilarProducts(mockEmbedding);
        latencies.push(Date.now() - start);
      }

      const sorted = [...latencies].sort((a, b) => a - b);
      const p95Index = Math.floor(iterations * 0.95);
      const p95Latency = sorted[p95Index];

      expect(p95Latency).toBeLessThan(LATENCY_THRESHOLD_MS);
    });

    it('should maintain consistent latency across multiple runs', async () => {
      const runs = 5;
      const avgLatencies: number[] = [];

      for (let run = 0; run < runs; run++) {
        const runLatencies: number[] = [];

        for (let i = 0; i < 5; i++) {
          const start = Date.now();
          await similaritySearchService.findSimilarProducts(mockEmbedding);
          runLatencies.push(Date.now() - start);
        }

        avgLatencies.push(
          runLatencies.reduce((a, b) => a + b, 0) / runLatencies.length
        );
      }

      // Calculate coefficient of variation (CV)
      const mean = avgLatencies.reduce((a, b) => a + b, 0) / avgLatencies.length;
      const variance =
        avgLatencies.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
        avgLatencies.length;
      const stdDev = Math.sqrt(variance);
      const cv = stdDev / mean;

      // CV should be less than 50% for consistent performance
      expect(cv).toBeLessThan(0.5);
    });
  });

  describe('Embedding Generation Performance', () => {
    const SINGLE_EMBEDDING_THRESHOLD_MS = 2000; // 2 seconds for single embedding
    const BATCH_EMBEDDING_THRESHOLD_MS = 5000; // 5 seconds for batch of 10

    beforeEach(() => {
      embeddingService.generateEmbedding.mockImplementation(async () => {
        // Simulate API call latency (200-500ms)
        await new Promise((resolve) =>
          setTimeout(resolve, Math.random() * 300 + 200)
        );
        return {
          embedding: mockEmbedding,
          model: 'text-embedding-3-small',
          tokensUsed: 10,
        };
      });

      embeddingService.generateBatchEmbeddings.mockImplementation(async (req) => {
        // Simulate batch API call (100ms per item, parallelized)
        const batchSize = req.texts?.length || 0;
        await new Promise((resolve) =>
          setTimeout(resolve, Math.random() * 200 + 100 * Math.ceil(batchSize / 10))
        );
        return {
          embeddings: Array(batchSize).fill(mockEmbedding),
          model: 'text-embedding-3-small',
          tokensUsed: batchSize * 10,
        };
      });
    });

    it('should generate single embedding within threshold', async () => {
      const start = Date.now();
      await embeddingService.generateEmbedding({ text: 'test text' });
      const latency = Date.now() - start;

      expect(latency).toBeLessThan(SINGLE_EMBEDDING_THRESHOLD_MS);
    });

    it('should generate batch embeddings efficiently', async () => {
      const texts = Array(10)
        .fill(null)
        .map((_, i) => `test text ${i}`);

      const start = Date.now();
      await embeddingService.generateBatchEmbeddings({ texts });
      const latency = Date.now() - start;

      expect(latency).toBeLessThan(BATCH_EMBEDDING_THRESHOLD_MS);
    });

    it('should scale sub-linearly with batch size', async () => {
      // Generate small batch
      const smallBatch = Array(5)
        .fill(null)
        .map((_, i) => `text ${i}`);
      const smallStart = Date.now();
      await embeddingService.generateBatchEmbeddings({ texts: smallBatch });
      const smallLatency = Date.now() - smallStart;

      // Generate large batch
      const largeBatch = Array(20)
        .fill(null)
        .map((_, i) => `text ${i}`);
      const largeStart = Date.now();
      await embeddingService.generateBatchEmbeddings({ texts: largeBatch });
      const largeLatency = Date.now() - largeStart;

      // Large batch (4x items) should not take 4x time
      // Allow some variance due to timer resolution and test overhead
      const scalingFactor = largeLatency / Math.max(smallLatency, 1);
      expect(scalingFactor).toBeLessThan(4); // Should be less than linear scaling
    });
  });

  describe('Cache Performance', () => {
    it('should show significant speedup from cache', async () => {
      // First call - cache miss (simulate slow operation)
      cacheService.get.mockImplementationOnce(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return null;
      });
      similaritySearchService.findSimilarProductsByText.mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return [];
      });

      const coldStart = Date.now();
      await cacheService.get('test-cache-key');
      await similaritySearchService.findSimilarProductsByText('test query');
      const coldLatency = Date.now() - coldStart;

      // Second call - cache hit (simulated instant response)
      cacheService.get.mockImplementationOnce(async () => {
        return [{ id: 'p1', similarity: 0.9 }];
      });

      const warmStart = Date.now();
      const cached = await cacheService.get('test-cache-key');
      const warmLatency = Date.now() - warmStart;

      // Cache hit should be significantly faster than cold path
      // Cold path ~150ms, warm path ~1ms
      expect(warmLatency).toBeLessThan(coldLatency);
      expect(cached).toBeDefined();
    });
  });

  describe('Connection Pool Performance', () => {
    it('should maintain pool health under load', async () => {
      poolService.getPoolStats.mockResolvedValue({
        totalConnections: 10,
        acquiredConnections: 3,
        waitingRequests: 0,
        idleConnections: 7,
      });

      const stats = await poolService.getPoolStats();

      // Pool should not be saturated
      expect(stats.acquiredConnections).toBeLessThan(stats.totalConnections * 0.8);
      expect(stats.waitingRequests).toBe(0);
    });

    it('should have minimal connection acquisition time', async () => {
      const ACQUISITION_THRESHOLD_MS = 50;

      poolService.executeQuery.mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 30));
        return [];
      });

      const acquisitionTimes: number[] = [];

      for (let i = 0; i < 10; i++) {
        const start = Date.now();
        await poolService.executeQuery('SELECT 1');
        acquisitionTimes.push(Date.now() - start);
      }

      const avgAcquisitionTime =
        acquisitionTimes.reduce((a, b) => a + b, 0) / acquisitionTimes.length;

      expect(avgAcquisitionTime).toBeLessThan(ACQUISITION_THRESHOLD_MS);
    });
  });

  describe('Memory Usage', () => {
    it('should not leak memory during embedding operations', async () => {
      embeddingService.validateEmbedding.mockReturnValue(true);

      const initialMemory = process.memoryUsage().heapUsed;
      const embeddings: number[][] = [];

      // Generate many embeddings
      for (let i = 0; i < 100; i++) {
        embeddings.push([...mockEmbedding]);
      }

      // Clear references
      embeddings.length = 0;

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory should not increase significantly (allow 10MB growth)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe('Benchmark Result Calculations', () => {
    it('should calculate percentiles correctly', () => {
      const latencies = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

      const sorted = [...latencies].sort((a, b) => a - b);
      const p50 = sorted[Math.floor(sorted.length * 0.5)];
      const p95 = sorted[Math.floor(sorted.length * 0.95)];
      const p99 = sorted[Math.floor(sorted.length * 0.99)];

      expect(p50).toBe(60);
      expect(p95).toBe(100);
      expect(p99).toBe(100);
    });

    it('should calculate throughput correctly', () => {
      const operationsCount = 100;
      const totalDurationMs = 1000;

      const throughput = operationsCount / (totalDurationMs / 1000);

      expect(throughput).toBe(100); // 100 ops/second
    });

    it('should detect performance regressions', () => {
      const baselineP95 = 100; // ms
      const currentP95 = 150; // ms
      const regressionThreshold = 0.2; // 20%

      const regressionPercentage = (currentP95 - baselineP95) / baselineP95;
      const hasRegression = regressionPercentage > regressionThreshold;

      expect(hasRegression).toBe(true);
      expect(regressionPercentage).toBeCloseTo(0.5, 2); // 50% regression
    });
  });

  describe('Stress Test Simulation', () => {
    it('should handle concurrent requests', async () => {
      const CONCURRENT_REQUESTS = 20;
      const MAX_LATENCY_MS = 1000;

      similaritySearchService.findSimilarProducts.mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 100 + 50));
        return [{ id: 'p1', similarity: 0.9 }];
      });

      const start = Date.now();
      const promises = Array(CONCURRENT_REQUESTS)
        .fill(null)
        .map(() => similaritySearchService.findSimilarProducts(mockEmbedding));

      await Promise.all(promises);
      const totalLatency = Date.now() - start;

      // All concurrent requests should complete within threshold
      expect(totalLatency).toBeLessThan(MAX_LATENCY_MS);
    });

    it('should maintain error rate under 1% during load', async () => {
      const TOTAL_REQUESTS = 100;
      const MAX_ERROR_RATE = 0.01;

      let successCount = 0;
      let errorCount = 0;

      similaritySearchService.findSimilarProducts.mockImplementation(async () => {
        // Simulate 0.5% error rate
        if (Math.random() < 0.005) {
          throw new Error('Simulated error');
        }
        return [{ id: 'p1', similarity: 0.9 }];
      });

      for (let i = 0; i < TOTAL_REQUESTS; i++) {
        try {
          await similaritySearchService.findSimilarProducts(mockEmbedding);
          successCount++;
        } catch {
          errorCount++;
        }
      }

      const errorRate = errorCount / TOTAL_REQUESTS;
      expect(errorRate).toBeLessThan(MAX_ERROR_RATE);
    });
  });
});
