import { Injectable, Logger, Inject, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { createHash } from 'crypto';
import { PrismaService } from '../common/prisma';
import { EmbeddingService } from './embedding.service';
import { VectorSearchResult, Embedding } from './interfaces';

/**
 * Cached query result
 */
export interface CachedQueryResult {
  results: VectorSearchResult[];
  cachedAt: Date;
  hitCount: number;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  totalEntries: number;
  hitCount: number;
  missCount: number;
  hitRate: number;
  avgHitsPerQuery: number;
  memoryUsageMb: number;
  dbCacheEntries: number;
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  /** TTL in seconds for L1 (memory) cache */
  l1TtlSeconds: number;
  /** TTL in seconds for L2 (database) cache */
  l2TtlSeconds: number;
  /** Maximum entries in L1 cache */
  l1MaxEntries: number;
  /** Minimum hit count to promote to L2 */
  l2PromotionThreshold: number;
}

const DEFAULT_CONFIG: CacheConfig = {
  l1TtlSeconds: 300, // 5 minutes
  l2TtlSeconds: 3600, // 1 hour
  l1MaxEntries: 1000,
  l2PromotionThreshold: 3,
};

/**
 * Two-level query cache service
 * L1: In-memory cache for hot queries
 * L2: Database cache for warm queries with persistence
 */
@Injectable()
export class QueryCacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QueryCacheService.name);
  private readonly cachePrefix = 'qcache:';
  private config: CacheConfig = DEFAULT_CONFIG;

  // Statistics tracking
  private hitCount = 0;
  private missCount = 0;

  // Cleanup interval
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddingService: EmbeddingService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  onModuleInit() {
    // Run cache cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredEntries().catch(err =>
        this.logger.error(`Cache cleanup failed: ${err.message}`)
      );
    }, 5 * 60 * 1000);
  }

  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  /**
   * Configure cache settings
   */
  configure(config: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get cached results or execute query
   */
  async getOrExecute(
    query: string,
    embedding: Embedding,
    options: { matchCount?: number; category?: string },
    executor: () => Promise<VectorSearchResult[]>
  ): Promise<VectorSearchResult[]> {
    const cacheKey = this.generateCacheKey(query, options);

    // Check L1 (memory) cache first
    const l1Result = await this.getFromL1(cacheKey);
    if (l1Result) {
      this.hitCount++;
      this.logger.debug(`L1 cache hit for query: ${query.substring(0, 30)}...`);
      return l1Result.results;
    }

    // Check L2 (database) cache
    const l2Result = await this.getFromL2(cacheKey);
    if (l2Result) {
      this.hitCount++;
      this.logger.debug(`L2 cache hit for query: ${query.substring(0, 30)}...`);

      // Promote to L1 cache
      await this.setL1(cacheKey, l2Result);

      return l2Result.results;
    }

    // Cache miss - execute query
    this.missCount++;
    this.logger.debug(`Cache miss for query: ${query.substring(0, 30)}...`);

    const results = await executor();

    // Store in L1 cache
    await this.setL1(cacheKey, { results, cachedAt: new Date(), hitCount: 1 });

    // Optionally store in L2 for persistence (async)
    this.promoteToL2(cacheKey, query, embedding, results).catch(err =>
      this.logger.error(`L2 promotion failed: ${err.message}`)
    );

    return results;
  }

  /**
   * Generate cache key from query and options
   */
  generateCacheKey(query: string, options: Record<string, unknown>): string {
    const normalized = query.toLowerCase().trim();
    const optionsStr = JSON.stringify(options, Object.keys(options).sort());
    const hash = createHash('sha256')
      .update(`${normalized}:${optionsStr}`)
      .digest('hex')
      .substring(0, 16);
    return `${this.cachePrefix}${hash}`;
  }

  /**
   * Get from L1 (memory) cache
   */
  private async getFromL1(cacheKey: string): Promise<CachedQueryResult | null> {
    try {
      const cached = await this.cacheManager.get<CachedQueryResult>(cacheKey);
      return cached || null;
    } catch (error) {
      this.logger.error(`L1 cache get failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Set in L1 (memory) cache
   */
  private async setL1(cacheKey: string, result: CachedQueryResult): Promise<void> {
    try {
      await this.cacheManager.set(cacheKey, result, this.config.l1TtlSeconds);
    } catch (error) {
      this.logger.error(`L1 cache set failed: ${error.message}`);
    }
  }

  /**
   * Get from L2 (database) cache
   */
  private async getFromL2(cacheKey: string): Promise<CachedQueryResult | null> {
    try {
      const cached = await this.prisma.$queryRaw<[{
        result_ids: string[];
        result_scores: number[];
        hit_count: number;
        created_at: Date;
      }] | []>`
        SELECT result_ids, result_scores, hit_count, created_at
        FROM query_cache
        WHERE cache_key = ${cacheKey}
        AND expires_at > NOW()
      `;

      if (cached.length === 0) {
        return null;
      }

      // Update hit count
      await this.prisma.$executeRaw`
        UPDATE query_cache
        SET hit_count = hit_count + 1, last_hit_at = NOW()
        WHERE cache_key = ${cacheKey}
      `;

      // Reconstruct results (minimal data for performance)
      const results: VectorSearchResult[] = cached[0].result_ids.map((id, i) => ({
        id,
        title: '', // Will be filled by caller if needed
        description: null,
        price: 0,
        category: null,
        similarity: cached[0].result_scores[i],
      }));

      return {
        results,
        cachedAt: cached[0].created_at,
        hitCount: cached[0].hit_count,
      };
    } catch (error) {
      this.logger.error(`L2 cache get failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Promote result to L2 (database) cache
   */
  private async promoteToL2(
    cacheKey: string,
    queryText: string,
    embedding: Embedding,
    results: VectorSearchResult[]
  ): Promise<void> {
    try {
      const vectorString = this.embeddingService.toVectorString(embedding);
      const resultIds = results.map(r => r.id);
      const resultScores = results.map(r => r.similarity);

      await this.prisma.$executeRaw`
        INSERT INTO query_cache (
          cache_key,
          query_text,
          query_embedding,
          result_ids,
          result_scores,
          expires_at
        ) VALUES (
          ${cacheKey},
          ${queryText},
          ${vectorString}::vector(1536),
          ${resultIds}::text[],
          ${resultScores}::float[],
          NOW() + ${this.config.l2TtlSeconds}::integer * interval '1 second'
        )
        ON CONFLICT (cache_key) DO UPDATE SET
          result_ids = EXCLUDED.result_ids,
          result_scores = EXCLUDED.result_scores,
          hit_count = query_cache.hit_count + 1,
          last_hit_at = NOW(),
          expires_at = EXCLUDED.expires_at
      `;
    } catch (error) {
      this.logger.error(`L2 cache promotion failed: ${error.message}`);
    }
  }

  /**
   * Invalidate cache entries by product ID
   */
  async invalidateByProductId(productId: string): Promise<number> {
    try {
      const result = await this.prisma.$executeRaw`
        DELETE FROM query_cache
        WHERE ${productId} = ANY(result_ids)
      `;

      this.logger.debug(`Invalidated ${result} cache entries for product ${productId}`);
      return result;
    } catch (error) {
      this.logger.error(`Cache invalidation failed: ${error.message}`);
      return 0;
    }
  }

  /**
   * Invalidate all cache entries
   */
  async invalidateAll(): Promise<void> {
    try {
      await this.prisma.$executeRaw`DELETE FROM query_cache`;
      // Clear L1 memory cache by deleting all keys with our prefix
      // Note: cache-manager v5 uses store.reset() but v4/v3 don't have it
      // We rely on TTL expiration for L1 cache cleanup
      this.hitCount = 0;
      this.missCount = 0;
      this.logger.log('All cache entries invalidated');
    } catch (error) {
      this.logger.error(`Full cache invalidation failed: ${error.message}`);
    }
  }

  /**
   * Cleanup expired cache entries
   */
  async cleanupExpiredEntries(): Promise<number> {
    try {
      const result = await this.prisma.$queryRaw<[{ cleanup_expired_cache: number }]>`
        SELECT cleanup_expired_cache()
      `;
      const deleted = result[0]?.cleanup_expired_cache || 0;
      if (deleted > 0) {
        this.logger.debug(`Cleaned up ${deleted} expired cache entries`);
      }
      return deleted;
    } catch (error) {
      this.logger.error(`Cache cleanup failed: ${error.message}`);
      return 0;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    try {
      const dbStats = await this.prisma.$queryRaw<[{
        total_entries: bigint;
        total_hits: bigint;
        avg_hits: number;
      }]>`
        SELECT
          COUNT(*) as total_entries,
          SUM(hit_count) as total_hits,
          AVG(hit_count)::float as avg_hits
        FROM query_cache
        WHERE expires_at > NOW()
      `;

      const totalRequests = this.hitCount + this.missCount;

      return {
        totalEntries: Number(dbStats[0]?.total_entries || 0),
        hitCount: this.hitCount,
        missCount: this.missCount,
        hitRate: totalRequests > 0 ? this.hitCount / totalRequests : 0,
        avgHitsPerQuery: dbStats[0]?.avg_hits || 0,
        memoryUsageMb: process.memoryUsage().heapUsed / 1024 / 1024,
        dbCacheEntries: Number(dbStats[0]?.total_entries || 0),
      };
    } catch (error) {
      this.logger.error(`Failed to get cache stats: ${error.message}`);
      return {
        totalEntries: 0,
        hitCount: this.hitCount,
        missCount: this.missCount,
        hitRate: 0,
        avgHitsPerQuery: 0,
        memoryUsageMb: 0,
        dbCacheEntries: 0,
      };
    }
  }

  /**
   * Get top cached queries for cache warming
   */
  async getTopQueries(limit: number = 100): Promise<Array<{ query: string; hitCount: number }>> {
    try {
      const results = await this.prisma.$queryRaw<Array<{
        query_text: string;
        hit_count: number;
      }>>`
        SELECT query_text, hit_count
        FROM query_cache
        WHERE expires_at > NOW()
        ORDER BY hit_count DESC
        LIMIT ${limit}
      `;

      return results.map(r => ({
        query: r.query_text,
        hitCount: r.hit_count,
      }));
    } catch (error) {
      this.logger.error(`Failed to get top queries: ${error.message}`);
      return [];
    }
  }

  /**
   * Warm cache with top queries
   */
  async warmCache(
    queries: string[],
    executor: (query: string) => Promise<{ embedding: Embedding; results: VectorSearchResult[] }>
  ): Promise<number> {
    let warmed = 0;

    for (const query of queries) {
      try {
        const { embedding, results } = await executor(query);
        const cacheKey = this.generateCacheKey(query, {});

        await this.setL1(cacheKey, { results, cachedAt: new Date(), hitCount: 0 });
        await this.promoteToL2(cacheKey, query, embedding, results);

        warmed++;
      } catch (error) {
        this.logger.error(`Failed to warm cache for query "${query}": ${error.message}`);
      }
    }

    this.logger.log(`Warmed cache with ${warmed}/${queries.length} queries`);
    return warmed;
  }
}
