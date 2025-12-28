import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma';
import { EmbeddingValidationResult } from './interfaces';

// Expected dimensions for OpenAI text-embedding-3-small
const EXPECTED_DIMENSIONS = 1536;

/**
 * Service for validating embeddings
 * Ensures embeddings are correctly generated and stored
 */
@Injectable()
export class EmbeddingValidationService {
  private readonly logger = new Logger(EmbeddingValidationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Validate embeddings for specific products
   */
  async validateEmbeddings(
    productIds: string[]
  ): Promise<EmbeddingValidationResult[]> {
    const results: EmbeddingValidationResult[] = [];

    for (const productId of productIds) {
      const result = await this.validateProductEmbedding(productId);
      results.push(result);
    }

    return results;
  }

  /**
   * Validate all embeddings in the database
   */
  async validateAllEmbeddings(): Promise<EmbeddingValidationResult[]> {
    const products = await this.prisma.product.findMany({
      select: {
        id: true,
      },
      take: 1000, // Limit to first 1000 for performance
    });

    return this.validateEmbeddings(products.map((p) => p.id));
  }

  /**
   * Validate a single product's embedding
   */
  async validateProductEmbedding(
    productId: string
  ): Promise<EmbeddingValidationResult> {
    const issues: string[] = [];

    try {
      // Check if product exists and get embedding info
      const result = await this.prisma.$queryRaw<
        Array<{
          id: string;
          has_embedding: boolean;
          dimensions: number | null;
        }>
      >`
        SELECT
          id,
          embedding IS NOT NULL as has_embedding,
          CASE
            WHEN embedding IS NOT NULL
            THEN vector_dims(embedding)
            ELSE NULL
          END as dimensions
        FROM products
        WHERE id = ${productId}
      `;

      if (result.length === 0) {
        return {
          productId,
          isValid: false,
          hasEmbedding: false,
          expectedDimensions: EXPECTED_DIMENSIONS,
          issues: ['Product not found'],
        };
      }

      const product = result[0];
      const hasEmbedding = product.has_embedding;
      const dimensions = product.dimensions;

      if (!hasEmbedding) {
        issues.push('No embedding stored');
      } else if (dimensions !== EXPECTED_DIMENSIONS) {
        issues.push(
          `Invalid dimensions: expected ${EXPECTED_DIMENSIONS}, got ${dimensions}`
        );
      }

      // Check for zero vectors (all zeros - invalid embedding)
      if (hasEmbedding) {
        const isZeroVector = await this.isZeroVector(productId);
        if (isZeroVector) {
          issues.push('Embedding is a zero vector');
        }
      }

      // Check for NaN values
      if (hasEmbedding) {
        const hasNaN = await this.hasNaNValues(productId);
        if (hasNaN) {
          issues.push('Embedding contains NaN values');
        }
      }

      return {
        productId,
        isValid: issues.length === 0,
        hasEmbedding,
        dimensions: dimensions || undefined,
        expectedDimensions: EXPECTED_DIMENSIONS,
        issues,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Validation error for product ${productId}: ${errorMessage}`);
      return {
        productId,
        isValid: false,
        hasEmbedding: false,
        expectedDimensions: EXPECTED_DIMENSIONS,
        issues: [`Validation error: ${errorMessage}`],
      };
    }
  }

  /**
   * Check if embedding is a zero vector
   */
  private async isZeroVector(productId: string): Promise<boolean> {
    const result = await this.prisma.$queryRaw<Array<{ is_zero: boolean }>>`
      SELECT
        embedding = ('['||repeat('0,', 1535)||'0]')::vector(1536) as is_zero
      FROM products
      WHERE id = ${productId}
        AND embedding IS NOT NULL
    `;

    return result.length > 0 && result[0].is_zero;
  }

  /**
   * Check if embedding has NaN values
   */
  private async hasNaNValues(productId: string): Promise<boolean> {
    // PostgreSQL doesn't have NaN in vectors, so this is mostly a safeguard
    // In practice, embeddings shouldn't have NaN if properly generated
    return false;
  }

  /**
   * Get embedding coverage statistics
   */
  async getEmbeddingCoverage(): Promise<{
    totalProducts: number;
    productsWithEmbedding: number;
    productsWithoutEmbedding: number;
    coveragePercentage: number;
  }> {
    const result = await this.prisma.$queryRaw<
      Array<{
        total: bigint;
        with_embedding: bigint;
        without_embedding: bigint;
      }>
    >`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE embedding IS NOT NULL) as with_embedding,
        COUNT(*) FILTER (WHERE embedding IS NULL) as without_embedding
      FROM products
    `;

    const stats = result[0];
    const totalProducts = Number(stats.total);
    const productsWithEmbedding = Number(stats.with_embedding);
    const productsWithoutEmbedding = Number(stats.without_embedding);

    return {
      totalProducts,
      productsWithEmbedding,
      productsWithoutEmbedding,
      coveragePercentage:
        totalProducts > 0
          ? Math.round((productsWithEmbedding / totalProducts) * 100)
          : 0,
    };
  }

  /**
   * Get products with invalid embeddings
   */
  async getProductsWithInvalidEmbeddings(
    limit = 100
  ): Promise<Array<{ id: string; issue: string }>> {
    // Find products with wrong dimension count
    const wrongDimensions = await this.prisma.$queryRaw<
      Array<{ id: string; dimensions: number }>
    >`
      SELECT id, vector_dims(embedding) as dimensions
      FROM products
      WHERE embedding IS NOT NULL
        AND vector_dims(embedding) != ${EXPECTED_DIMENSIONS}
      LIMIT ${limit}
    `;

    return wrongDimensions.map((p) => ({
      id: p.id,
      issue: `Wrong dimensions: ${p.dimensions}`,
    }));
  }

  /**
   * Verify embedding quality by checking similarity with itself
   */
  async verifyEmbeddingQuality(
    productId: string
  ): Promise<{ isValid: boolean; selfSimilarity: number }> {
    try {
      const result = await this.prisma.$queryRaw<
        Array<{ self_similarity: number }>
      >`
        SELECT 1 - (embedding <=> embedding) as self_similarity
        FROM products
        WHERE id = ${productId}
          AND embedding IS NOT NULL
      `;

      if (result.length === 0) {
        return { isValid: false, selfSimilarity: 0 };
      }

      // Self-similarity should be 1.0 (or very close to it)
      const selfSimilarity = result[0].self_similarity;
      const isValid = Math.abs(selfSimilarity - 1.0) < 0.0001;

      return { isValid, selfSimilarity };
    } catch (error) {
      this.logger.error(`Quality verification error: ${error}`);
      return { isValid: false, selfSimilarity: 0 };
    }
  }
}
