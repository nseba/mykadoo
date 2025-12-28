import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { EmbeddingService } from './embedding.service';
import { VectorStorageService } from './vector-storage.service';
import { SimilaritySearchService } from './similarity-search.service';
import {
  Embedding,
  VectorSearchResult,
  HybridSearchResult,
  SimilaritySearchOptions,
  HybridSearchOptions,
  EmbeddingStatus,
  EmbeddingCost,
} from './interfaces';

/**
 * Main facade service for vector operations
 * Combines embedding, storage, and search functionality
 */
@Injectable()
export class VectorService {
  private readonly logger = new Logger(VectorService.name);
  private readonly cachePrefix = 'embedding:';
  private readonly cacheTtl = 3600; // 1 hour

  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly storageService: VectorStorageService,
    private readonly searchService: SimilaritySearchService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  // ==================== Embedding Generation ====================

  /**
   * Generate and store embedding for a product
   */
  async generateProductEmbedding(
    productId: string,
    title: string,
    description?: string | null,
    category?: string | null,
    tags?: string[]
  ): Promise<EmbeddingCost> {
    try {
      // Check cache first
      const cacheKey = this.getProductCacheKey(productId);
      const cached = await this.cacheManager.get<Embedding>(cacheKey);

      if (cached) {
        this.logger.debug(`Using cached embedding for product ${productId}`);
        await this.storageService.storeProductEmbedding(productId, cached);
        return this.embeddingService.calculateCost(0);
      }

      // Generate new embedding
      const response = await this.embeddingService.generateProductEmbedding(
        title,
        description,
        category,
        tags
      );

      // Store in database
      await this.storageService.storeProductEmbedding(productId, response.embedding);

      // Cache for future use
      await this.cacheManager.set(cacheKey, response.embedding, this.cacheTtl);

      return this.embeddingService.calculateCost(response.tokensUsed);
    } catch (error) {
      this.logger.error(`Failed to generate product embedding: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate and store embedding for a search query
   */
  async generateSearchEmbedding(
    searchId: string,
    query: string
  ): Promise<{ embedding: Embedding; cost: EmbeddingCost }> {
    try {
      // Check cache first
      const cacheKey = this.getQueryCacheKey(query);
      const cached = await this.cacheManager.get<Embedding>(cacheKey);

      if (cached) {
        this.logger.debug(`Using cached embedding for query: ${query.substring(0, 30)}...`);
        await this.storageService.storeSearchEmbedding(searchId, cached);
        return {
          embedding: cached,
          cost: this.embeddingService.calculateCost(0),
        };
      }

      // Generate new embedding
      const response = await this.embeddingService.generateQueryEmbedding(query);

      // Store in database
      await this.storageService.storeSearchEmbedding(searchId, response.embedding);

      // Cache for future use
      await this.cacheManager.set(cacheKey, response.embedding, this.cacheTtl);

      return {
        embedding: response.embedding,
        cost: this.embeddingService.calculateCost(response.tokensUsed),
      };
    } catch (error) {
      this.logger.error(`Failed to generate search embedding: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate embeddings for products in batch
   */
  async generateBatchProductEmbeddings(
    products: Array<{
      id: string;
      title: string;
      description?: string | null;
      category?: string | null;
      tags?: string[];
    }>,
    batchSize = 50
  ): Promise<{ processed: number; cost: EmbeddingCost }> {
    let totalTokens = 0;
    let processed = 0;

    // Process in batches
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);

      // Generate texts for embedding
      const texts = batch.map((p) => {
        const parts = [p.title];
        if (p.description) parts.push(p.description.substring(0, 500));
        if (p.category) parts.push(`Category: ${p.category}`);
        if (p.tags?.length) parts.push(`Tags: ${p.tags.slice(0, 10).join(', ')}`);
        return parts.join('. ');
      });

      // Generate embeddings in batch
      const response = await this.embeddingService.generateBatchEmbeddings({ texts });
      totalTokens += response.tokensUsed;

      // Store embeddings
      const items = batch.map((p, idx) => ({
        productId: p.id,
        embedding: response.embeddings[idx],
      }));

      const { stored } = await this.storageService.storeProductEmbeddingsBatch(items);
      processed += stored;

      this.logger.log(
        `Batch ${Math.floor(i / batchSize) + 1}: ${stored}/${batch.length} products processed`
      );
    }

    return {
      processed,
      cost: this.embeddingService.calculateCost(totalTokens),
    };
  }

  // ==================== Similarity Search ====================

  /**
   * Find similar products by text query
   */
  async findSimilarProducts(
    query: string,
    options: SimilaritySearchOptions = {}
  ): Promise<VectorSearchResult[]> {
    return this.searchService.findSimilarProductsByText(query, options);
  }

  /**
   * Find products similar to an existing product
   */
  async findSimilarToProduct(
    productId: string,
    options: SimilaritySearchOptions = {}
  ): Promise<VectorSearchResult[]> {
    return this.searchService.findSimilarToProduct(productId, options);
  }

  /**
   * Perform hybrid search (keyword + semantic)
   */
  async hybridSearch(
    query: string,
    options: HybridSearchOptions = {}
  ): Promise<HybridSearchResult[]> {
    return this.searchService.hybridSearchByText(query, options);
  }

  /**
   * Get personalized recommendations for a user
   */
  async getRecommendations(
    userId: string,
    matchCount = 20
  ): Promise<VectorSearchResult[]> {
    return this.searchService.getPersonalizedRecommendations(userId, matchCount);
  }

  // ==================== Status & Management ====================

  /**
   * Get embedding generation status
   */
  async getEmbeddingStatus(): Promise<EmbeddingStatus> {
    return this.storageService.getEmbeddingStatus();
  }

  /**
   * Check if a product has an embedding
   */
  async hasEmbedding(productId: string): Promise<boolean> {
    return this.storageService.hasEmbedding(productId);
  }

  /**
   * Get products that need embeddings
   */
  async getProductsNeedingEmbeddings(limit = 100) {
    return this.storageService.getProductsWithoutEmbeddings(limit);
  }

  /**
   * Backfill embeddings for products without them
   */
  async backfillEmbeddings(
    limit = 100,
    batchSize = 50
  ): Promise<{ processed: number; cost: EmbeddingCost }> {
    const products = await this.storageService.getProductsWithoutEmbeddings(limit);

    if (products.length === 0) {
      this.logger.log('No products need embeddings');
      return { processed: 0, cost: this.embeddingService.calculateCost(0) };
    }

    this.logger.log(`Backfilling embeddings for ${products.length} products`);

    return this.generateBatchProductEmbeddings(products, batchSize);
  }

  // ==================== Cache Management ====================

  /**
   * Clear embedding cache for a product
   */
  async clearProductCache(productId: string): Promise<void> {
    const cacheKey = this.getProductCacheKey(productId);
    await this.cacheManager.del(cacheKey);
    this.logger.debug(`Cleared cache for product ${productId}`);
  }

  /**
   * Clear all embedding caches
   */
  async clearAllCaches(): Promise<void> {
    // Note: This requires implementation based on cache provider
    this.logger.log('Cache clear requested - implementation depends on cache provider');
  }

  // ==================== Private Helpers ====================

  private getProductCacheKey(productId: string): string {
    return `${this.cachePrefix}product:${productId}`;
  }

  private getQueryCacheKey(query: string): string {
    // Hash the query for consistent cache keys
    const hash = this.simpleHash(query.toLowerCase().trim());
    return `${this.cachePrefix}query:${hash}`;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
}
