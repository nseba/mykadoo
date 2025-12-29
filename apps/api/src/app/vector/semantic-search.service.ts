import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../common/prisma';
import { EmbeddingService } from './embedding.service';
import { SimilaritySearchService } from './similarity-search.service';
import {
  Embedding,
  VectorSearchResult,
  HybridSearchResult,
  EmbeddingCost,
} from './interfaces';

/**
 * Semantic search result with RRF scoring
 */
export interface SemanticSearchResult {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string | null;
  imageUrl?: string | null;
  /** Keyword-based score (0-1) */
  keywordScore: number;
  /** Semantic similarity score (0-1) */
  semanticScore: number;
  /** RRF combined score */
  rrfScore: number;
  /** Final score after re-ranking */
  finalScore: number;
  /** Position in keyword results (null if not in keyword results) */
  keywordRank: number | null;
  /** Position in semantic results (null if not in semantic results) */
  semanticRank: number | null;
}

/**
 * Query expansion result
 */
export interface ExpandedQuery {
  original: string;
  expanded: string[];
  synonyms: string[];
}

/**
 * Search quality metrics for a single query
 */
export interface QueryMetrics {
  queryId: string;
  query: string;
  timestamp: Date;
  latencyMs: number;
  totalResults: number;
  embeddingCost: EmbeddingCost;
  keywordResultCount: number;
  semanticResultCount: number;
  overlapCount: number;
  expansionUsed: boolean;
  rerankingApplied: boolean;
}

/**
 * Options for semantic search
 */
export interface SemanticSearchOptions {
  /** Maximum number of results (default 20) */
  limit?: number;
  /** Category filter */
  category?: string;
  /** Minimum price filter */
  minPrice?: number;
  /** Maximum price filter */
  maxPrice?: number;
  /** RRF constant k (default 60) */
  rrfK?: number;
  /** Enable query expansion (default true) */
  enableExpansion?: boolean;
  /** Enable re-ranking (default true) */
  enableReranking?: boolean;
  /** User ID for personalization */
  userId?: string;
  /** Session ID for tracking */
  sessionId?: string;
  /** Minimum similarity threshold (default 0.5) */
  minSimilarity?: number;
}

/**
 * Service for advanced semantic search with RRF, query expansion, and re-ranking
 */
@Injectable()
export class SemanticSearchService {
  private readonly logger = new Logger(SemanticSearchService.name);
  private readonly queryCachePrefix = 'semantic:query:';
  private readonly queryCacheTtl = 3600; // 1 hour

  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddingService: EmbeddingService,
    private readonly similarityService: SimilaritySearchService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  /**
   * Perform semantic search with RRF ranking
   */
  async search(
    query: string,
    options: SemanticSearchOptions = {}
  ): Promise<{
    results: SemanticSearchResult[];
    metrics: QueryMetrics;
    expandedQuery?: ExpandedQuery;
  }> {
    const startTime = Date.now();
    const queryId = this.generateQueryId();

    const {
      limit = 20,
      category,
      minPrice,
      maxPrice,
      rrfK = 60,
      enableExpansion = true,
      enableReranking = true,
      userId,
      minSimilarity = 0.5,
    } = options;

    try {
      // Step 1: Expand query if enabled
      let expandedQuery: ExpandedQuery | undefined;
      let searchQueries = [query];

      if (enableExpansion) {
        expandedQuery = await this.expandQuery(query);
        searchQueries = [query, ...expandedQuery.expanded.slice(0, 2)];
      }

      // Step 2: Generate embedding for the query (with caching)
      const { embedding, cost: embeddingCost } = await this.getQueryEmbedding(query);

      // Step 3: Run keyword search and semantic search in parallel
      const [keywordResults, semanticResults] = await Promise.all([
        this.keywordSearch(searchQueries, { category, minPrice, maxPrice, limit: limit * 2 }),
        this.semanticSearchByEmbedding(embedding, {
          category,
          minPrice,
          maxPrice,
          limit: limit * 2,
          minSimilarity,
        }),
      ]);

      // Step 4: Apply RRF to combine results
      const combinedResults = this.applyRRF(keywordResults, semanticResults, rrfK);

      // Step 5: Re-rank if enabled
      let finalResults = combinedResults;
      if (enableReranking && userId) {
        finalResults = await this.rerankWithPersonalization(combinedResults, userId);
      }

      // Step 6: Take top results
      const topResults = finalResults.slice(0, limit);

      // Step 7: Store query embedding for future analysis
      await this.storeQueryEmbedding(queryId, query, embedding);

      const latencyMs = Date.now() - startTime;

      const metrics: QueryMetrics = {
        queryId,
        query,
        timestamp: new Date(),
        latencyMs,
        totalResults: topResults.length,
        embeddingCost,
        keywordResultCount: keywordResults.length,
        semanticResultCount: semanticResults.length,
        overlapCount: this.countOverlap(keywordResults, semanticResults),
        expansionUsed: enableExpansion,
        rerankingApplied: enableReranking && !!userId,
      };

      this.logger.log(
        `Semantic search "${query.substring(0, 30)}..." returned ${topResults.length} results in ${latencyMs}ms`
      );

      return {
        results: topResults,
        metrics,
        expandedQuery,
      };
    } catch (error) {
      this.logger.error(`Semantic search failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get or generate embedding for a query with caching
   */
  async getQueryEmbedding(
    query: string
  ): Promise<{ embedding: Embedding; cost: EmbeddingCost; cached: boolean }> {
    const cacheKey = this.getQueryCacheKey(query);

    // Try cache first
    const cached = await this.cacheManager.get<Embedding>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for query: ${query.substring(0, 30)}...`);
      return {
        embedding: cached,
        cost: this.embeddingService.calculateCost(0),
        cached: true,
      };
    }

    // Generate new embedding
    const response = await this.embeddingService.generateQueryEmbedding(query);

    // Cache the embedding
    await this.cacheManager.set(cacheKey, response.embedding, this.queryCacheTtl);

    return {
      embedding: response.embedding,
      cost: this.embeddingService.calculateCost(response.tokensUsed),
      cached: false,
    };
  }

  /**
   * Expand query with related terms and synonyms
   */
  async expandQuery(query: string): Promise<ExpandedQuery> {
    // Simple query expansion using common patterns
    // In production, this could use an LLM or thesaurus service
    const words = query.toLowerCase().split(/\s+/);
    const expanded: string[] = [];
    const synonyms: string[] = [];

    // Gift-related expansions
    const giftSynonyms: Record<string, string[]> = {
      gift: ['present', 'surprise', 'treat'],
      birthday: ['bday', 'birth day'],
      christmas: ['xmas', 'holiday', 'festive'],
      anniversary: ['celebration', 'milestone'],
      wedding: ['marriage', 'bridal', 'nuptial'],
      mom: ['mother', 'mum', 'mama'],
      dad: ['father', 'papa'],
      kids: ['children', 'child', 'kid'],
      cheap: ['affordable', 'budget', 'inexpensive'],
      expensive: ['luxury', 'premium', 'high-end'],
      unique: ['unusual', 'special', 'one-of-a-kind'],
      funny: ['humorous', 'fun', 'amusing'],
      practical: ['useful', 'functional', 'handy'],
      creative: ['artistic', 'crafty', 'imaginative'],
    };

    for (const word of words) {
      if (giftSynonyms[word]) {
        synonyms.push(...giftSynonyms[word]);
      }
    }

    // Create expanded queries
    if (synonyms.length > 0) {
      // Replace main keywords with synonyms
      for (const synonym of synonyms.slice(0, 3)) {
        const expandedQuery = words
          .map(w => (giftSynonyms[w]?.includes(synonym) ? synonym : w))
          .join(' ');
        if (expandedQuery !== query) {
          expanded.push(expandedQuery);
        }
      }
    }

    // Add category-based expansions
    if (query.toLowerCase().includes('tech') || query.toLowerCase().includes('gadget')) {
      expanded.push(`${query} electronics`);
    }
    if (query.toLowerCase().includes('outdoor') || query.toLowerCase().includes('camping')) {
      expanded.push(`${query} adventure gear`);
    }

    return {
      original: query,
      expanded: [...new Set(expanded)], // Remove duplicates
      synonyms: [...new Set(synonyms)],
    };
  }

  /**
   * Perform keyword-based search
   */
  private async keywordSearch(
    queries: string[],
    options: { category?: string; minPrice?: number; maxPrice?: number; limit: number }
  ): Promise<Array<{ id: string; rank: number; score: number } & Partial<VectorSearchResult>>> {
    const { category, minPrice, maxPrice, limit } = options;

    // Build the search query with all expanded terms
    const searchTerms = queries.join(' | ');

    try {
      const results = await this.prisma.$queryRaw<
        Array<{
          id: string;
          title: string;
          description: string | null;
          price: number;
          category: string | null;
          image_url: string | null;
          rank: number;
        }>
      >`
        SELECT
          p.id,
          p.title,
          p.description,
          p.price,
          p.category,
          p.image_url,
          ts_rank(
            to_tsvector('english', COALESCE(p.title, '') || ' ' || COALESCE(p.description, '')),
            plainto_tsquery('english', ${queries[0]})
          ) AS rank
        FROM products p
        WHERE
          to_tsvector('english', COALESCE(p.title, '') || ' ' || COALESCE(p.description, ''))
          @@ plainto_tsquery('english', ${queries[0]})
          ${category ? this.prisma.$queryRaw`AND p.category = ${category}` : this.prisma.$queryRaw``}
          ${minPrice !== undefined ? this.prisma.$queryRaw`AND p.price >= ${minPrice}` : this.prisma.$queryRaw``}
          ${maxPrice !== undefined ? this.prisma.$queryRaw`AND p.price <= ${maxPrice}` : this.prisma.$queryRaw``}
        ORDER BY rank DESC
        LIMIT ${limit}
      `;

      return results.map((r, idx) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        price: r.price,
        category: r.category,
        imageUrl: r.image_url,
        rank: idx + 1,
        score: r.rank,
      }));
    } catch (error) {
      this.logger.warn(`Keyword search failed, returning empty: ${error.message}`);
      return [];
    }
  }

  /**
   * Perform semantic search using embedding
   */
  private async semanticSearchByEmbedding(
    embedding: Embedding,
    options: {
      category?: string;
      minPrice?: number;
      maxPrice?: number;
      limit: number;
      minSimilarity: number;
    }
  ): Promise<Array<{ id: string; rank: number; score: number } & Partial<VectorSearchResult>>> {
    try {
      const results = await this.similarityService.findSimilarProducts(embedding, {
        matchThreshold: options.minSimilarity,
        matchCount: options.limit,
        categoryFilter: options.category,
        minPrice: options.minPrice,
        maxPrice: options.maxPrice,
      });

      return results.map((r, idx) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        price: r.price,
        category: r.category,
        rank: idx + 1,
        score: r.similarity,
      }));
    } catch (error) {
      this.logger.warn(`Semantic search failed, returning empty: ${error.message}`);
      return [];
    }
  }

  /**
   * Apply Reciprocal Rank Fusion (RRF) to combine keyword and semantic results
   * RRF(d) = Σ 1 / (k + rank(d))
   */
  private applyRRF(
    keywordResults: Array<{ id: string; rank: number; score: number } & Partial<VectorSearchResult>>,
    semanticResults: Array<{ id: string; rank: number; score: number } & Partial<VectorSearchResult>>,
    k: number = 60
  ): SemanticSearchResult[] {
    const resultMap = new Map<string, SemanticSearchResult>();

    // Process keyword results
    for (const result of keywordResults) {
      const rrfScore = 1 / (k + result.rank);
      resultMap.set(result.id, {
        id: result.id,
        title: result.title || '',
        description: result.description || null,
        price: result.price || 0,
        category: result.category || null,
        imageUrl: result.imageUrl || null,
        keywordScore: result.score,
        semanticScore: 0,
        rrfScore,
        finalScore: rrfScore,
        keywordRank: result.rank,
        semanticRank: null,
      });
    }

    // Process semantic results
    for (const result of semanticResults) {
      const rrfScore = 1 / (k + result.rank);
      const existing = resultMap.get(result.id);

      if (existing) {
        // Combine scores for documents in both result sets
        existing.semanticScore = result.score;
        existing.semanticRank = result.rank;
        existing.rrfScore += rrfScore;
        existing.finalScore = existing.rrfScore;
      } else {
        resultMap.set(result.id, {
          id: result.id,
          title: result.title || '',
          description: result.description || null,
          price: result.price || 0,
          category: result.category || null,
          imageUrl: result.imageUrl || null,
          keywordScore: 0,
          semanticScore: result.score,
          rrfScore,
          finalScore: rrfScore,
          keywordRank: null,
          semanticRank: result.rank,
        });
      }
    }

    // Sort by final score (RRF score)
    const combined = Array.from(resultMap.values());
    combined.sort((a, b) => b.finalScore - a.finalScore);

    return combined;
  }

  /**
   * Re-rank results with user personalization
   */
  private async rerankWithPersonalization(
    results: SemanticSearchResult[],
    userId: string
  ): Promise<SemanticSearchResult[]> {
    try {
      // Get user preference embedding
      const userPrefs = await this.prisma.$queryRaw<[{ preference_embedding: string | null }]>`
        SELECT preference_embedding::text
        FROM user_profiles
        WHERE user_id = ${userId}
      `;

      const prefEmbeddingStr = userPrefs[0]?.preference_embedding;
      if (!prefEmbeddingStr) {
        // No user preferences, return original order
        return results;
      }

      const userEmbedding = this.embeddingService.fromVectorString(prefEmbeddingStr);

      // Get embeddings for result products
      const productIds = results.map(r => r.id);
      const productEmbeddings = await this.prisma.$queryRaw<
        Array<{ id: string; embedding: string }>
      >`
        SELECT id, embedding::text
        FROM products
        WHERE id = ANY(${productIds}::text[])
        AND embedding IS NOT NULL
      `;

      const embeddingMap = new Map<string, Embedding>();
      for (const pe of productEmbeddings) {
        embeddingMap.set(pe.id, this.embeddingService.fromVectorString(pe.embedding));
      }

      // Calculate personalization boost
      const personalizedResults = results.map(result => {
        const productEmbedding = embeddingMap.get(result.id);
        let personalizationBoost = 0;

        if (productEmbedding) {
          const similarity = this.similarityService.calculateSimilarity(
            userEmbedding,
            productEmbedding
          );
          // Boost score by up to 20% based on user preference match
          personalizationBoost = similarity * 0.2;
        }

        return {
          ...result,
          finalScore: result.rrfScore * (1 + personalizationBoost),
        };
      });

      // Re-sort by final score
      personalizedResults.sort((a, b) => b.finalScore - a.finalScore);

      return personalizedResults;
    } catch (error) {
      this.logger.warn(`Personalization failed, using original ranking: ${error.message}`);
      return results;
    }
  }

  /**
   * Store query embedding for future analysis
   */
  private async storeQueryEmbedding(
    queryId: string,
    query: string,
    embedding: Embedding
  ): Promise<void> {
    try {
      const vectorString = this.embeddingService.toVectorString(embedding);

      await this.prisma.$executeRaw`
        INSERT INTO searches (id, query, query_embedding, created_at)
        VALUES (${queryId}, ${query}, ${vectorString}::vector(1536), NOW())
        ON CONFLICT (id) DO NOTHING
      `;
    } catch (error) {
      // Non-critical, just log
      this.logger.debug(`Failed to store query embedding: ${error.message}`);
    }
  }

  /**
   * Count overlap between two result sets
   */
  private countOverlap(
    results1: Array<{ id: string }>,
    results2: Array<{ id: string }>
  ): number {
    const ids1 = new Set(results1.map(r => r.id));
    return results2.filter(r => ids1.has(r.id)).length;
  }

  /**
   * Generate unique query ID
   */
  private generateQueryId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 9);
    return `q_${timestamp}_${random}`;
  }

  /**
   * Get cache key for query
   */
  private getQueryCacheKey(query: string): string {
    const normalized = query.toLowerCase().trim();
    const hash = this.simpleHash(normalized);
    return `${this.queryCachePrefix}${hash}`;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
}
