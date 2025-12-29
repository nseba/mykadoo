import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../common/prisma';
import { EmbeddingService } from './embedding.service';
import { SimilaritySearchService } from './similarity-search.service';
import { SemanticSearchService } from './semantic-search.service';
import {
  Embedding,
  VectorSearchResult,
  HybridSearchResult,
  EmbeddingCost,
} from './interfaces';

/**
 * Product embedding for AI integration
 */
export interface ProductEmbeddingData {
  productId: string;
  productName: string;
  description: string;
  category: string;
  price: number;
  tags: string[];
  embedding?: Embedding;
}

/**
 * Search query for AI integration
 */
export interface AISearchQuery {
  query: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  includeMetadata?: boolean;
  filters?: Record<string, unknown>;
}

/**
 * Search result compatible with libs/ai VectorSearchResult
 */
export interface AISearchResult {
  id: string;
  score: number;
  metadata: {
    productName: string;
    description: string;
    category: string;
    price: number;
    tags: string[];
    imageUrl?: string;
  };
}

/**
 * Index statistics
 */
export interface IndexStats {
  totalProducts: number;
  productsWithEmbedding: number;
  percentIndexed: number;
  embeddingDimensions: number;
  indexType: string;
}

/**
 * Service that integrates pgvector with the AI recommendation system
 * Replaces Pinecone as the vector database backend
 */
@Injectable()
export class AIIntegrationService {
  private readonly logger = new Logger(AIIntegrationService.name);
  private readonly embeddingDimensions = 1536;

  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddingService: EmbeddingService,
    private readonly similarityService: SimilaritySearchService,
    private readonly semanticSearchService: SemanticSearchService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  /**
   * Initialize the vector index (no-op for pgvector, indexes are created via migrations)
   */
  async initializeIndex(): Promise<void> {
    this.logger.log('pgvector index already initialized via database migrations');

    // Verify extension is installed
    try {
      await this.prisma.$queryRaw`SELECT extversion FROM pg_extension WHERE extname = 'vector'`;
      this.logger.log('pgvector extension verified');
    } catch (error) {
      this.logger.error('pgvector extension not found - please run migrations');
      throw new Error('pgvector extension not installed');
    }
  }

  /**
   * Generate embedding for text
   * Compatible with libs/ai VectorService.generateEmbedding
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.embeddingService.generateEmbedding({ text });
    return response.embedding;
  }

  /**
   * Upsert product embeddings
   * Compatible with libs/ai VectorService.upsertProductEmbeddings
   */
  async upsertProductEmbeddings(products: ProductEmbeddingData[]): Promise<void> {
    this.logger.log(`Upserting ${products.length} product embeddings`);

    for (const product of products) {
      try {
        let embedding = product.embedding;

        // Generate embedding if not provided
        if (!embedding) {
          const searchableText = this.buildSearchableText(product);
          const response = await this.embeddingService.generateEmbedding({ text: searchableText });
          embedding = response.embedding;
        }

        const vectorString = this.embeddingService.toVectorString(embedding);

        // Upsert product with embedding
        await this.prisma.$executeRaw`
          UPDATE products
          SET
            embedding = ${vectorString}::vector(1536),
            updated_at = NOW()
          WHERE id = ${product.productId}
        `;
      } catch (error) {
        this.logger.error(`Failed to upsert embedding for product ${product.productId}: ${error.message}`);
      }
    }

    this.logger.log(`Upserted ${products.length} product embeddings`);
  }

  /**
   * Perform semantic search
   * Compatible with libs/ai VectorService.semanticSearch
   */
  async semanticSearch(query: AISearchQuery): Promise<AISearchResult[]> {
    const results = await this.semanticSearchService.search(query.query, {
      limit: query.limit || 10,
      category: query.category,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
    });

    return results.results.map(r => ({
      id: r.id,
      score: r.finalScore,
      metadata: {
        productName: r.title,
        description: r.description || '',
        category: r.category || '',
        price: r.price,
        tags: [], // Tags not in current result structure
        imageUrl: r.imageUrl || undefined,
      },
    }));
  }

  /**
   * Search by category and price range
   * Compatible with libs/ai VectorService.searchByCategoryAndPrice
   */
  async searchByCategoryAndPrice(
    query: string,
    category?: string,
    minPrice?: number,
    maxPrice?: number,
    topK: number = 10
  ): Promise<AISearchResult[]> {
    return this.semanticSearch({
      query,
      category,
      minPrice,
      maxPrice,
      limit: topK,
      includeMetadata: true,
    });
  }

  /**
   * Delete product embeddings
   * Compatible with libs/ai VectorService.deleteProductEmbeddings
   */
  async deleteProductEmbeddings(productIds: string[]): Promise<void> {
    this.logger.log(`Deleting embeddings for ${productIds.length} products`);

    await this.prisma.$executeRaw`
      UPDATE products
      SET embedding = NULL
      WHERE id = ANY(${productIds}::text[])
    `;

    this.logger.log(`Deleted ${productIds.length} product embeddings`);
  }

  /**
   * Get index statistics
   * Compatible with libs/ai VectorService.getIndexStats
   */
  async getIndexStats(): Promise<IndexStats> {
    const stats = await this.prisma.$queryRaw<[{
      total: bigint;
      with_embedding: bigint;
    }]>`
      SELECT
        COUNT(*) as total,
        COUNT(embedding) as with_embedding
      FROM products
    `;

    const total = Number(stats[0]?.total || 0);
    const withEmbedding = Number(stats[0]?.with_embedding || 0);

    return {
      totalProducts: total,
      productsWithEmbedding: withEmbedding,
      percentIndexed: total > 0 ? (withEmbedding / total) * 100 : 0,
      embeddingDimensions: this.embeddingDimensions,
      indexType: 'HNSW (pgvector)',
    };
  }

  /**
   * Generate embeddings for a batch of products
   * Compatible with libs/ai VectorService.generateProductEmbeddings
   */
  async generateProductEmbeddings(
    products: Array<{
      productId: string;
      productName: string;
      description: string;
      category: string;
      price: number;
      tags: string[];
    }>
  ): Promise<ProductEmbeddingData[]> {
    const embeddings: ProductEmbeddingData[] = [];

    // Prepare texts for batch embedding
    const texts = products.map(p => this.buildSearchableText(p));

    // Generate embeddings in batch
    const response = await this.embeddingService.generateBatchEmbeddings({ texts });

    for (let i = 0; i < products.length; i++) {
      embeddings.push({
        ...products[i],
        embedding: response.embeddings[i],
      });
    }

    return embeddings;
  }

  /**
   * Find similar products to a given product
   */
  async findSimilarProducts(
    productId: string,
    limit: number = 10
  ): Promise<AISearchResult[]> {
    const results = await this.similarityService.findSimilarToProduct(productId, {
      matchCount: limit,
      matchThreshold: 0.5,
    });

    return results.map(r => ({
      id: r.id,
      score: r.similarity,
      metadata: {
        productName: r.title,
        description: r.description || '',
        category: r.category || '',
        price: r.price,
        tags: [],
      },
    }));
  }

  /**
   * Get personalized recommendations for a user
   */
  async getPersonalizedRecommendations(
    userId: string,
    limit: number = 20
  ): Promise<AISearchResult[]> {
    const results = await this.similarityService.getPersonalizedRecommendations(userId, limit);

    return results.map(r => ({
      id: r.id,
      score: r.similarity,
      metadata: {
        productName: r.title,
        description: r.description || '',
        category: r.category || '',
        price: r.price,
        tags: [],
      },
    }));
  }

  /**
   * Build searchable text from product data
   */
  private buildSearchableText(product: {
    productName: string;
    description: string;
    category: string;
    tags: string[];
  }): string {
    const parts = [product.productName];

    if (product.description) {
      parts.push(product.description.substring(0, 500));
    }

    if (product.category) {
      parts.push(`Category: ${product.category}`);
    }

    if (product.tags?.length > 0) {
      parts.push(`Tags: ${product.tags.slice(0, 10).join(', ')}`);
    }

    return parts.join('. ');
  }
}
