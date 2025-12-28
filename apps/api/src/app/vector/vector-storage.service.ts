import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma';
import { Embedding, EmbeddingStatus, ProductWithEmbedding } from './interfaces';
import { EmbeddingService } from './embedding.service';

/**
 * Service for storing and managing vector embeddings in PostgreSQL with pgvector
 */
@Injectable()
export class VectorStorageService {
  private readonly logger = new Logger(VectorStorageService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddingService: EmbeddingService
  ) {}

  /**
   * Store embedding for a product
   */
  async storeProductEmbedding(productId: string, embedding: Embedding): Promise<void> {
    if (!this.embeddingService.validateEmbedding(embedding)) {
      throw new Error(`Invalid embedding for product ${productId}`);
    }

    const vectorString = this.embeddingService.toVectorString(embedding);

    try {
      await this.prisma.$executeRawUnsafe(
        `UPDATE products SET embedding = $1::vector WHERE id = $2`,
        vectorString,
        productId
      );

      this.logger.debug(`Stored embedding for product ${productId}`);
    } catch (error) {
      this.logger.error(`Failed to store embedding for product ${productId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Store embeddings for multiple products in batch
   */
  async storeProductEmbeddingsBatch(
    items: Array<{ productId: string; embedding: Embedding }>
  ): Promise<{ stored: number; failed: number }> {
    let stored = 0;
    let failed = 0;

    // Use transaction for batch operations
    await this.prisma.$transaction(async (tx) => {
      for (const item of items) {
        try {
          if (!this.embeddingService.validateEmbedding(item.embedding)) {
            this.logger.warn(`Invalid embedding for product ${item.productId}`);
            failed++;
            continue;
          }

          const vectorString = this.embeddingService.toVectorString(item.embedding);

          await tx.$executeRawUnsafe(
            `UPDATE products SET embedding = $1::vector WHERE id = $2`,
            vectorString,
            item.productId
          );

          stored++;
        } catch (error) {
          this.logger.error(
            `Failed to store embedding for product ${item.productId}: ${error.message}`
          );
          failed++;
        }
      }
    });

    this.logger.log(`Batch storage complete: ${stored} stored, ${failed} failed`);
    return { stored, failed };
  }

  /**
   * Store embedding for a search query
   */
  async storeSearchEmbedding(searchId: string, embedding: Embedding): Promise<void> {
    if (!this.embeddingService.validateEmbedding(embedding)) {
      throw new Error(`Invalid embedding for search ${searchId}`);
    }

    const vectorString = this.embeddingService.toVectorString(embedding);

    try {
      await this.prisma.$executeRawUnsafe(
        `UPDATE searches SET query_embedding = $1::vector WHERE id = $2`,
        vectorString,
        searchId
      );

      this.logger.debug(`Stored embedding for search ${searchId}`);
    } catch (error) {
      this.logger.error(`Failed to store embedding for search ${searchId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Store preference embedding for a user
   */
  async storeUserPreferenceEmbedding(userId: string, embedding: Embedding): Promise<void> {
    if (!this.embeddingService.validateEmbedding(embedding)) {
      throw new Error(`Invalid embedding for user ${userId}`);
    }

    const vectorString = this.embeddingService.toVectorString(embedding);

    try {
      await this.prisma.$executeRawUnsafe(
        `UPDATE user_profiles SET preference_embedding = $1::vector WHERE user_id = $2`,
        vectorString,
        userId
      );

      this.logger.debug(`Stored preference embedding for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to store preference embedding for user ${userId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get products that need embeddings generated
   */
  async getProductsWithoutEmbeddings(limit = 100): Promise<ProductWithEmbedding[]> {
    try {
      const products = await this.prisma.$queryRaw<
        Array<{ id: string; title: string; description: string | null }>
      >`
        SELECT id, title, description
        FROM products
        WHERE embedding IS NULL AND is_active = true
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;

      return products.map(p => ({
        ...p,
        embedding: null,
        hasEmbedding: false,
      }));
    } catch (error) {
      this.logger.error(`Failed to get products without embeddings: ${error.message}`);
      return [];
    }
  }

  /**
   * Get embedding status statistics
   */
  async getEmbeddingStatus(): Promise<EmbeddingStatus> {
    try {
      const [totalResult, withEmbeddingResult] = await Promise.all([
        this.prisma.$queryRaw<[{ count: bigint }]>`
          SELECT COUNT(*) as count FROM products WHERE is_active = true
        `,
        this.prisma.$queryRaw<[{ count: bigint }]>`
          SELECT COUNT(*) as count FROM products WHERE embedding IS NOT NULL AND is_active = true
        `,
      ]);

      const totalProducts = Number(totalResult[0]?.count ?? 0);
      const productsWithEmbedding = Number(withEmbeddingResult[0]?.count ?? 0);
      const productsMissingEmbedding = totalProducts - productsWithEmbedding;
      const percentComplete = totalProducts > 0
        ? Math.round((productsWithEmbedding / totalProducts) * 100)
        : 0;

      return {
        totalProducts,
        productsWithEmbedding,
        productsMissingEmbedding,
        percentComplete,
      };
    } catch (error) {
      this.logger.error(`Failed to get embedding status: ${error.message}`);
      return {
        totalProducts: 0,
        productsWithEmbedding: 0,
        productsMissingEmbedding: 0,
        percentComplete: 0,
      };
    }
  }

  /**
   * Check if a product has an embedding
   */
  async hasEmbedding(productId: string): Promise<boolean> {
    try {
      const result = await this.prisma.$queryRaw<[{ has_embedding: boolean }]>`
        SELECT embedding IS NOT NULL as has_embedding
        FROM products
        WHERE id = ${productId}
      `;

      return result[0]?.has_embedding ?? false;
    } catch (error) {
      this.logger.error(`Failed to check embedding for product ${productId}: ${error.message}`);
      return false;
    }
  }

  /**
   * Delete embedding for a product
   */
  async deleteProductEmbedding(productId: string): Promise<void> {
    try {
      await this.prisma.$executeRawUnsafe(
        `UPDATE products SET embedding = NULL WHERE id = $1`,
        productId
      );

      this.logger.debug(`Deleted embedding for product ${productId}`);
    } catch (error) {
      this.logger.error(`Failed to delete embedding for product ${productId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get raw embedding for a product (for debugging/testing)
   */
  async getProductEmbedding(productId: string): Promise<Embedding | null> {
    try {
      const result = await this.prisma.$queryRaw<[{ embedding: string | null }]>`
        SELECT embedding::text
        FROM products
        WHERE id = ${productId}
      `;

      const embeddingString = result[0]?.embedding;
      if (!embeddingString) {
        return null;
      }

      return this.embeddingService.fromVectorString(embeddingString);
    } catch (error) {
      this.logger.error(`Failed to get embedding for product ${productId}: ${error.message}`);
      return null;
    }
  }
}
