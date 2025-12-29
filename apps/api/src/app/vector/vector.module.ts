import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { PrismaModule } from '../common/prisma';
import { VectorController } from './vector.controller';
import { SimilarityAnalyticsController } from './similarity-analytics.controller';
import { SemanticSearchController } from './semantic-search.controller';
import { RecommendationController } from './recommendation.controller';
import { PerformanceController } from './performance.controller';
import { VectorMonitoringController } from './vector-monitoring.controller';
import { VectorService } from './vector.service';
import { EmbeddingService } from './embedding.service';
import { VectorStorageService } from './vector-storage.service';
import { SimilaritySearchService } from './similarity-search.service';
import { SimilarityAnalyticsService } from './similarity-analytics.service';
import { SemanticSearchService } from './semantic-search.service';
import { SearchQualityService } from './search-quality.service';
import { AIIntegrationService } from './ai-integration.service';
import { UserPreferenceService } from './user-preference.service';
import { RecommendationEngineService } from './recommendation-engine.service';
import { VectorBenchmarkService } from './vector-benchmark.service';
import { QueryCacheService } from './query-cache.service';
import { VectorPoolService } from './vector-pool.service';
import { BatchEmbeddingOptimizerService } from './batch-embedding-optimizer.service';
import { VectorMetricsService } from './vector-metrics.service';
import { VectorLoggingService } from './vector-logging.service';

/**
 * Vector Module for semantic search, embeddings, and AI-powered recommendations
 *
 * Provides:
 * - Text embedding generation using OpenAI
 * - Vector storage in PostgreSQL with pgvector
 * - Similarity search and hybrid search
 * - Semantic search with RRF ranking
 * - Query expansion and re-ranking
 * - Personalized recommendations with explanations
 * - User preference learning from interactions
 * - AI agent integration (replaces Pinecone)
 * - Recommendation diversity via MMR algorithm
 * - Similarity analytics and A/B testing
 * - Search quality metrics (precision, recall, NDCG)
 * - Performance benchmarking and optimization
 * - Two-level query caching (L1: memory, L2: database)
 * - Dedicated connection pooling for vector queries
 * - Optimized batch embedding generation
 * - Prometheus metrics and monitoring
 * - Structured logging for vector operations
 */
@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    CacheModule.register({
      ttl: 3600, // 1 hour default TTL
      max: 1000, // Maximum number of items in cache
    }),
  ],
  controllers: [
    VectorController,
    SimilarityAnalyticsController,
    SemanticSearchController,
    RecommendationController,
    PerformanceController,
    VectorMonitoringController,
  ],
  providers: [
    VectorService,
    EmbeddingService,
    VectorStorageService,
    SimilaritySearchService,
    SimilarityAnalyticsService,
    SemanticSearchService,
    SearchQualityService,
    AIIntegrationService,
    UserPreferenceService,
    RecommendationEngineService,
    VectorBenchmarkService,
    QueryCacheService,
    VectorPoolService,
    BatchEmbeddingOptimizerService,
    VectorMetricsService,
    VectorLoggingService,
  ],
  exports: [
    VectorService,
    EmbeddingService,
    VectorStorageService,
    SimilaritySearchService,
    SimilarityAnalyticsService,
    SemanticSearchService,
    SearchQualityService,
    AIIntegrationService,
    UserPreferenceService,
    RecommendationEngineService,
    VectorBenchmarkService,
    QueryCacheService,
    VectorPoolService,
    BatchEmbeddingOptimizerService,
    VectorMetricsService,
    VectorLoggingService,
  ],
})
export class VectorModule {}
