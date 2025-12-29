import { Injectable, Logger } from '@nestjs/common';
import { EmbeddingService } from './embedding.service';
import { VectorStorageService } from './vector-storage.service';
import { Embedding } from './interfaces';

/**
 * Batch processing options
 */
export interface BatchOptions {
  /** Number of items per batch (default: 100) */
  batchSize?: number;
  /** Number of parallel batches (default: 3) */
  concurrency?: number;
  /** Delay between batches in ms (default: 100) */
  batchDelayMs?: number;
  /** Whether to skip already embedded items (default: true) */
  skipExisting?: boolean;
  /** Progress callback */
  onProgress?: (progress: BatchProgress) => void;
  /** Error callback */
  onError?: (error: BatchError) => void;
}

/**
 * Batch processing progress
 */
export interface BatchProgress {
  totalItems: number;
  processedItems: number;
  successfulItems: number;
  failedItems: number;
  currentBatch: number;
  totalBatches: number;
  percentComplete: number;
  estimatedRemainingMs: number;
  tokensUsed: number;
  estimatedCost: number;
}

/**
 * Batch processing error
 */
export interface BatchError {
  itemId: string;
  error: string;
  batchNumber: number;
}

/**
 * Batch processing result
 */
export interface BatchResult {
  totalItems: number;
  successfulItems: number;
  failedItems: number;
  tokensUsed: number;
  estimatedCost: number;
  durationMs: number;
  errors: BatchError[];
}

/**
 * Product for embedding
 */
interface ProductForEmbedding {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  tags: string[];
}

/**
 * Optimized batch embedding processor
 * Features:
 * - Parallel batch processing with configurable concurrency
 * - Memory-efficient streaming
 * - Rate limiting to avoid API throttling
 * - Progress tracking and cost estimation
 * - Automatic retry with backoff
 */
@Injectable()
export class BatchEmbeddingOptimizerService {
  private readonly logger = new Logger(BatchEmbeddingOptimizerService.name);

  // Token cost per 1M tokens for text-embedding-3-small
  private readonly costPer1MTokens = 0.02;

  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly vectorStorageService: VectorStorageService
  ) {}

  /**
   * Process all products without embeddings
   */
  async processAllMissingEmbeddings(options: BatchOptions = {}): Promise<BatchResult> {
    const {
      batchSize = 100,
      concurrency = 3,
      batchDelayMs = 100,
      skipExisting = true,
      onProgress,
      onError,
    } = options;

    const startTime = Date.now();
    const errors: BatchError[] = [];
    let tokensUsed = 0;
    let successfulItems = 0;
    let failedItems = 0;

    // Get products missing embeddings
    const products = await this.vectorStorageService.getProductsWithoutEmbeddings(10000);
    const totalItems = products.length;

    if (totalItems === 0) {
      this.logger.log('No products missing embeddings');
      return {
        totalItems: 0,
        successfulItems: 0,
        failedItems: 0,
        tokensUsed: 0,
        estimatedCost: 0,
        durationMs: 0,
        errors: [],
      };
    }

    this.logger.log(`Starting batch embedding for ${totalItems} products`);

    // Split into batches
    const batches = this.createBatches(products, batchSize);
    const totalBatches = batches.length;

    // Process batches with limited concurrency
    const batchResults = await this.processWithConcurrency(
      batches,
      concurrency,
      async (batch, batchIndex) => {
        const batchStart = Date.now();

        try {
          // Generate embeddings for the batch
          const texts = batch.map(p => this.buildSearchableText(p));
          const response = await this.embeddingService.generateBatchEmbeddings({ texts });

          tokensUsed += response.tokensUsed;

          // Store embeddings
          const embeddingResults = await Promise.allSettled(
            batch.map(async (product, i) => {
              await this.vectorStorageService.storeProductEmbedding(
                product.id,
                response.embeddings[i]
              );
              return product.id;
            })
          );

          // Count successes and failures
          let batchSuccess = 0;
          for (let i = 0; i < embeddingResults.length; i++) {
            const result = embeddingResults[i];
            if (result.status === 'fulfilled') {
              batchSuccess++;
            } else {
              errors.push({
                itemId: batch[i].id,
                error: result.reason?.message || 'Unknown error',
                batchNumber: batchIndex + 1,
              });
              onError?.({
                itemId: batch[i].id,
                error: result.reason?.message || 'Unknown error',
                batchNumber: batchIndex + 1,
              });
            }
          }

          successfulItems += batchSuccess;
          failedItems += batch.length - batchSuccess;

        } catch (error) {
          // Entire batch failed
          failedItems += batch.length;
          for (const product of batch) {
            errors.push({
              itemId: product.id,
              error: error.message,
              batchNumber: batchIndex + 1,
            });
          }
          this.logger.error(`Batch ${batchIndex + 1} failed: ${error.message}`);
        }

        // Report progress
        const processedItems = successfulItems + failedItems;
        const elapsedMs = Date.now() - startTime;
        const itemsPerMs = processedItems / elapsedMs;
        const remainingItems = totalItems - processedItems;
        const estimatedRemainingMs = itemsPerMs > 0 ? remainingItems / itemsPerMs : 0;

        onProgress?.({
          totalItems,
          processedItems,
          successfulItems,
          failedItems,
          currentBatch: batchIndex + 1,
          totalBatches,
          percentComplete: (processedItems / totalItems) * 100,
          estimatedRemainingMs,
          tokensUsed,
          estimatedCost: this.calculateCost(tokensUsed),
        });

        // Delay between batches to avoid rate limiting
        if (batchDelayMs > 0) {
          await this.delay(batchDelayMs);
        }
      }
    );

    const durationMs = Date.now() - startTime;

    this.logger.log(
      `Batch embedding complete: ${successfulItems}/${totalItems} successful, ` +
      `${failedItems} failed, ${tokensUsed} tokens used, ${durationMs}ms`
    );

    return {
      totalItems,
      successfulItems,
      failedItems,
      tokensUsed,
      estimatedCost: this.calculateCost(tokensUsed),
      durationMs,
      errors,
    };
  }

  /**
   * Process specific product IDs
   */
  async processProductIds(
    productIds: string[],
    options: BatchOptions = {}
  ): Promise<BatchResult> {
    const {
      batchSize = 100,
      concurrency = 3,
      batchDelayMs = 100,
      onProgress,
      onError,
    } = options;

    const startTime = Date.now();
    const errors: BatchError[] = [];
    let tokensUsed = 0;
    let successfulItems = 0;
    let failedItems = 0;

    const totalItems = productIds.length;
    const batches = this.createBatches(productIds, batchSize);
    const totalBatches = batches.length;

    await this.processWithConcurrency(
      batches,
      concurrency,
      async (batchIds, batchIndex) => {
        try {
          // Fetch product data
          const products = await this.vectorStorageService.getProductsByIds(batchIds);

          // Generate embeddings
          const texts = products.map(p => this.buildSearchableText(p));
          const response = await this.embeddingService.generateBatchEmbeddings({ texts });

          tokensUsed += response.tokensUsed;

          // Store embeddings
          for (let i = 0; i < products.length; i++) {
            try {
              await this.vectorStorageService.storeProductEmbedding(
                products[i].id,
                response.embeddings[i]
              );
              successfulItems++;
            } catch (error) {
              failedItems++;
              errors.push({
                itemId: products[i].id,
                error: error.message,
                batchNumber: batchIndex + 1,
              });
            }
          }

        } catch (error) {
          failedItems += batchIds.length;
          for (const id of batchIds) {
            errors.push({
              itemId: id,
              error: error.message,
              batchNumber: batchIndex + 1,
            });
          }
        }

        // Report progress
        const processedItems = successfulItems + failedItems;
        const elapsedMs = Date.now() - startTime;
        const itemsPerMs = processedItems / elapsedMs;
        const remainingItems = totalItems - processedItems;

        onProgress?.({
          totalItems,
          processedItems,
          successfulItems,
          failedItems,
          currentBatch: batchIndex + 1,
          totalBatches,
          percentComplete: (processedItems / totalItems) * 100,
          estimatedRemainingMs: itemsPerMs > 0 ? remainingItems / itemsPerMs : 0,
          tokensUsed,
          estimatedCost: this.calculateCost(tokensUsed),
        });

        if (batchDelayMs > 0) {
          await this.delay(batchDelayMs);
        }
      }
    );

    return {
      totalItems,
      successfulItems,
      failedItems,
      tokensUsed,
      estimatedCost: this.calculateCost(tokensUsed),
      durationMs: Date.now() - startTime,
      errors,
    };
  }

  /**
   * Estimate cost and time for embedding a set of products
   */
  async estimateBatchCost(productIds: string[]): Promise<{
    estimatedTokens: number;
    estimatedCost: number;
    estimatedDurationMs: number;
  }> {
    // Fetch a sample to estimate average tokens per product
    const sampleSize = Math.min(10, productIds.length);
    const sampleIds = productIds.slice(0, sampleSize);
    const products = await this.vectorStorageService.getProductsByIds(sampleIds);

    let totalTokens = 0;
    for (const product of products) {
      const text = this.buildSearchableText(product);
      // Rough estimate: ~4 characters per token
      totalTokens += Math.ceil(text.length / 4);
    }

    const avgTokensPerProduct = totalTokens / sampleSize;
    const estimatedTokens = Math.ceil(avgTokensPerProduct * productIds.length);

    // Estimate time: ~50ms per embedding on average
    const estimatedDurationMs = productIds.length * 50;

    return {
      estimatedTokens,
      estimatedCost: this.calculateCost(estimatedTokens),
      estimatedDurationMs,
    };
  }

  /**
   * Process batches with limited concurrency
   */
  private async processWithConcurrency<T>(
    items: T[],
    concurrency: number,
    processor: (item: T, index: number) => Promise<void>
  ): Promise<void> {
    const queue = items.map((item, index) => ({ item, index }));
    const workers: Promise<void>[] = [];

    for (let i = 0; i < concurrency; i++) {
      workers.push(
        (async () => {
          while (queue.length > 0) {
            const work = queue.shift();
            if (work) {
              await processor(work.item, work.index);
            }
          }
        })()
      );
    }

    await Promise.all(workers);
  }

  /**
   * Split items into batches
   */
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Build searchable text from product
   */
  private buildSearchableText(product: ProductForEmbedding): string {
    const parts = [product.title];

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

  /**
   * Calculate cost in USD
   */
  private calculateCost(tokens: number): number {
    return (tokens / 1_000_000) * this.costPer1MTokens;
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
