import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma';
import { EmbeddingService } from './embedding.service';
import {
  Embedding,
  VectorSearchResult,
  QuerySearchResult,
  HybridSearchResult,
  SimilaritySearchOptions,
  HybridSearchOptions,
} from './interfaces';

/**
 * Service for performing vector similarity searches using pgvector
 */
@Injectable()
export class SimilaritySearchService {
  private readonly logger = new Logger(SimilaritySearchService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddingService: EmbeddingService
  ) {}

  /**
   * Find products similar to a given embedding vector
   */
  async findSimilarProducts(
    embedding: Embedding,
    options: SimilaritySearchOptions = {}
  ): Promise<VectorSearchResult[]> {
    const {
      matchThreshold = 0.7,
      matchCount = 10,
      categoryFilter = null,
      minPrice = null,
      maxPrice = null,
    } = options;

    if (!this.embeddingService.validateEmbedding(embedding)) {
      throw new Error('Invalid embedding provided');
    }

    const vectorString = this.embeddingService.toVectorString(embedding);

    try {
      const results = await this.prisma.$queryRaw<VectorSearchResult[]>`
        SELECT * FROM find_similar_products(
          ${vectorString}::vector(1536),
          ${matchThreshold}::float,
          ${matchCount}::int,
          ${categoryFilter}::text,
          ${minPrice}::float,
          ${maxPrice}::float
        )
      `;

      this.logger.debug(
        `Found ${results.length} similar products (threshold: ${matchThreshold})`
      );

      return results;
    } catch (error) {
      this.logger.error(`Similarity search failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find products similar to a text query
   */
  async findSimilarProductsByText(
    queryText: string,
    options: SimilaritySearchOptions = {}
  ): Promise<VectorSearchResult[]> {
    try {
      // Generate embedding for the query
      const embeddingResponse = await this.embeddingService.generateQueryEmbedding(queryText);

      return this.findSimilarProducts(embeddingResponse.embedding, options);
    } catch (error) {
      this.logger.error(`Text-based similarity search failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find products similar to an existing product
   */
  async findSimilarToProduct(
    productId: string,
    options: SimilaritySearchOptions = {}
  ): Promise<VectorSearchResult[]> {
    try {
      // Get the product's embedding
      const result = await this.prisma.$queryRaw<[{ embedding: string | null }]>`
        SELECT embedding::text
        FROM products
        WHERE id = ${productId}
      `;

      const embeddingString = result[0]?.embedding;
      if (!embeddingString) {
        this.logger.warn(`Product ${productId} has no embedding`);
        return [];
      }

      const embedding = this.embeddingService.fromVectorString(embeddingString);

      // Find similar products, excluding the source product
      const similarProducts = await this.findSimilarProducts(embedding, {
        ...options,
        matchCount: (options.matchCount || 10) + 1, // Get one extra to account for self
      });

      // Filter out the source product
      return similarProducts.filter(p => p.id !== productId).slice(0, options.matchCount || 10);
    } catch (error) {
      this.logger.error(`Failed to find similar products for ${productId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find similar search queries
   */
  async findSimilarQueries(
    embedding: Embedding,
    matchThreshold = 0.8,
    matchCount = 5
  ): Promise<QuerySearchResult[]> {
    if (!this.embeddingService.validateEmbedding(embedding)) {
      throw new Error('Invalid embedding provided');
    }

    const vectorString = this.embeddingService.toVectorString(embedding);

    try {
      const results = await this.prisma.$queryRaw<QuerySearchResult[]>`
        SELECT * FROM find_similar_queries(
          ${vectorString}::vector(1536),
          ${matchThreshold}::float,
          ${matchCount}::int
        )
      `;

      this.logger.debug(
        `Found ${results.length} similar queries (threshold: ${matchThreshold})`
      );

      return results;
    } catch (error) {
      this.logger.error(`Query similarity search failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Hybrid search combining keyword and semantic matching
   */
  async hybridSearch(
    queryText: string,
    embedding: Embedding,
    options: HybridSearchOptions = {}
  ): Promise<HybridSearchResult[]> {
    const {
      keywordWeight = 0.3,
      semanticWeight = 0.7,
      matchCount = 20,
    } = options;

    if (!this.embeddingService.validateEmbedding(embedding)) {
      throw new Error('Invalid embedding provided');
    }

    const vectorString = this.embeddingService.toVectorString(embedding);

    try {
      const results = await this.prisma.$queryRaw<HybridSearchResult[]>`
        SELECT * FROM hybrid_search_products(
          ${queryText}::text,
          ${vectorString}::vector(1536),
          ${keywordWeight}::float,
          ${semanticWeight}::float,
          ${matchCount}::int
        )
      `;

      this.logger.debug(
        `Hybrid search returned ${results.length} results ` +
        `(keyword: ${keywordWeight}, semantic: ${semanticWeight})`
      );

      return results;
    } catch (error) {
      this.logger.error(`Hybrid search failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Hybrid search with automatic embedding generation
   */
  async hybridSearchByText(
    queryText: string,
    options: HybridSearchOptions = {}
  ): Promise<HybridSearchResult[]> {
    try {
      // Generate embedding for the query
      const embeddingResponse = await this.embeddingService.generateQueryEmbedding(queryText);

      return this.hybridSearch(queryText, embeddingResponse.embedding, options);
    } catch (error) {
      this.logger.error(`Text-based hybrid search failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Calculate similarity between two embeddings (cosine similarity)
   */
  calculateSimilarity(embedding1: Embedding, embedding2: Embedding): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embeddings must have the same dimensions');
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);
    if (magnitude === 0) return 0;

    return dotProduct / magnitude;
  }

  /**
   * Find users with similar preferences
   */
  async findUsersWithSimilarPreferences(
    userId: string,
    matchThreshold = 0.7,
    matchCount = 10
  ): Promise<Array<{ userId: string; similarity: number }>> {
    try {
      // Get the user's preference embedding
      const result = await this.prisma.$queryRaw<[{ preference_embedding: string | null }]>`
        SELECT preference_embedding::text
        FROM user_profiles
        WHERE user_id = ${userId}
      `;

      const embeddingString = result[0]?.preference_embedding;
      if (!embeddingString) {
        this.logger.warn(`User ${userId} has no preference embedding`);
        return [];
      }

      const embedding = this.embeddingService.fromVectorString(embeddingString);
      const vectorString = this.embeddingService.toVectorString(embedding);

      const similarUsers = await this.prisma.$queryRaw<
        Array<{ user_id: string; similarity: number }>
      >`
        SELECT
          user_id,
          (1 - (preference_embedding <=> ${vectorString}::vector(1536)))::float AS similarity
        FROM user_profiles
        WHERE
          preference_embedding IS NOT NULL
          AND user_id != ${userId}
          AND (1 - (preference_embedding <=> ${vectorString}::vector(1536))) > ${matchThreshold}
        ORDER BY preference_embedding <=> ${vectorString}::vector(1536)
        LIMIT ${matchCount}
      `;

      return similarUsers.map(u => ({
        userId: u.user_id,
        similarity: u.similarity,
      }));
    } catch (error) {
      this.logger.error(`Failed to find similar users: ${error.message}`);
      return [];
    }
  }

  /**
   * Get personalized product recommendations based on user preference vector
   */
  async getPersonalizedRecommendations(
    userId: string,
    matchCount = 20
  ): Promise<VectorSearchResult[]> {
    try {
      // Get the user's preference embedding
      const result = await this.prisma.$queryRaw<[{ preference_embedding: string | null }]>`
        SELECT preference_embedding::text
        FROM user_profiles
        WHERE user_id = ${userId}
      `;

      const embeddingString = result[0]?.preference_embedding;
      if (!embeddingString) {
        this.logger.warn(`User ${userId} has no preference embedding`);
        return [];
      }

      const embedding = this.embeddingService.fromVectorString(embeddingString);

      return this.findSimilarProducts(embedding, {
        matchThreshold: 0.5, // Lower threshold for recommendations
        matchCount,
      });
    } catch (error) {
      this.logger.error(`Failed to get personalized recommendations: ${error.message}`);
      return [];
    }
  }
}
