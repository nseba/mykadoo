import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { VectorService } from '../vector/vector.service';
import { EmbeddingMonitoringService } from './embedding-monitoring.service';
import { EmbeddingCostService } from './embedding-cost.service';
import {
  EMBEDDING_QUEUE_NAME,
  EmbeddingJobType,
  BATCH_CONFIG,
} from './embedding-pipeline.constants';
import {
  EmbeddingJobData,
  EmbeddingJobResult,
  EmbeddingJobProgress,
  GenerateProductEmbeddingJobData,
  GenerateBatchEmbeddingsJobData,
  BackfillEmbeddingsJobData,
  UpdateProductEmbeddingJobData,
  ValidateEmbeddingsJobData,
} from './interfaces';
import { EmbeddingValidationService } from './embedding-validation.service';

/**
 * Processor for embedding generation jobs
 * Handles all embedding-related background tasks
 */
@Processor(EMBEDDING_QUEUE_NAME)
export class EmbeddingJobProcessor extends WorkerHost {
  private readonly logger = new Logger(EmbeddingJobProcessor.name);

  constructor(
    private readonly vectorService: VectorService,
    private readonly monitoringService: EmbeddingMonitoringService,
    private readonly costService: EmbeddingCostService,
    private readonly validationService: EmbeddingValidationService
  ) {
    super();
  }

  /**
   * Main job processing method
   */
  async process(job: Job<EmbeddingJobData>): Promise<EmbeddingJobResult> {
    const startTime = Date.now();
    this.logger.log(`Processing job ${job.id} of type ${job.data.jobType}`);

    try {
      let result: EmbeddingJobResult;

      switch (job.data.jobType) {
        case EmbeddingJobType.GENERATE_PRODUCT_EMBEDDING:
          result = await this.processProductEmbedding(
            job as Job<GenerateProductEmbeddingJobData>
          );
          break;

        case EmbeddingJobType.GENERATE_BATCH_EMBEDDINGS:
          result = await this.processBatchEmbeddings(
            job as Job<GenerateBatchEmbeddingsJobData>
          );
          break;

        case EmbeddingJobType.BACKFILL_EMBEDDINGS:
          result = await this.processBackfill(
            job as Job<BackfillEmbeddingsJobData>
          );
          break;

        case EmbeddingJobType.UPDATE_PRODUCT_EMBEDDING:
          result = await this.processUpdateEmbedding(
            job as Job<UpdateProductEmbeddingJobData>
          );
          break;

        case EmbeddingJobType.VALIDATE_EMBEDDINGS:
          result = await this.processValidation(
            job as Job<ValidateEmbeddingsJobData>
          );
          break;

        default:
          throw new Error(`Unknown job type: ${(job.data as EmbeddingJobData).jobType}`);
      }

      const duration = Date.now() - startTime;
      result.duration = duration;

      // Track metrics
      await this.monitoringService.recordJobCompletion(job.data.jobType, result);

      // Track cost
      if (result.totalTokensUsed > 0) {
        await this.costService.recordCost({
          date: new Date().toISOString(),
          tokensUsed: result.totalTokensUsed,
          estimatedCost: result.estimatedCost,
          jobType: job.data.jobType,
        });
      }

      this.logger.log(
        `Job ${job.id} completed: ${result.processedCount} processed, ${result.failedCount} failed, ${duration}ms`
      );

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Job ${job.id} failed: ${errorMessage}`);

      await this.monitoringService.recordJobFailure(job.data.jobType, errorMessage);

      return {
        success: false,
        processedCount: 0,
        failedCount: 1,
        totalTokensUsed: 0,
        estimatedCost: 0,
        errors: [errorMessage],
        duration,
      };
    }
  }

  /**
   * Process a single product embedding job
   */
  private async processProductEmbedding(
    job: Job<GenerateProductEmbeddingJobData>
  ): Promise<EmbeddingJobResult> {
    const { productId, title, description, category, tags } = job.data;

    const cost = await this.vectorService.generateProductEmbedding(
      productId,
      title,
      description,
      category,
      tags
    );

    return {
      success: true,
      processedCount: 1,
      failedCount: 0,
      totalTokensUsed: cost.tokensUsed,
      estimatedCost: cost.estimatedCost,
      duration: 0,
    };
  }

  /**
   * Process batch embedding generation
   */
  private async processBatchEmbeddings(
    job: Job<GenerateBatchEmbeddingsJobData>
  ): Promise<EmbeddingJobResult> {
    const { products, batchId } = job.data;
    const total = products.length;
    let processed = 0;
    let failed = 0;
    let totalTokens = 0;
    const errors: string[] = [];

    this.logger.log(`Processing batch ${batchId} with ${total} products`);

    // Process in smaller batches
    const batchSize = BATCH_CONFIG.defaultBatchSize;
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);

      try {
        const result = await this.vectorService.generateBatchProductEmbeddings(
          batch,
          batchSize
        );
        processed += result.processed;
        totalTokens += result.cost.tokensUsed;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push(`Batch ${i / batchSize}: ${errorMessage}`);
        failed += batch.length;
      }

      // Update job progress
      await this.updateProgress(job, {
        processed: i + batch.length,
        total,
        percentage: Math.round(((i + batch.length) / total) * 100),
        tokensUsed: totalTokens,
        errors: failed,
      });
    }

    return {
      success: failed === 0,
      processedCount: processed,
      failedCount: failed,
      totalTokensUsed: totalTokens,
      estimatedCost: this.costService.calculateCost(totalTokens),
      errors: errors.length > 0 ? errors : undefined,
      duration: 0,
    };
  }

  /**
   * Process backfill job for products without embeddings
   */
  private async processBackfill(
    job: Job<BackfillEmbeddingsJobData>
  ): Promise<EmbeddingJobResult> {
    const { limit, batchSize } = job.data;

    this.logger.log(`Starting backfill: limit=${limit}, batchSize=${batchSize}`);

    const result = await this.vectorService.backfillEmbeddings(limit, batchSize);

    return {
      success: true,
      processedCount: result.processed,
      failedCount: 0,
      totalTokensUsed: result.cost.tokensUsed,
      estimatedCost: result.cost.estimatedCost,
      duration: 0,
    };
  }

  /**
   * Process update embedding job
   */
  private async processUpdateEmbedding(
    job: Job<UpdateProductEmbeddingJobData>
  ): Promise<EmbeddingJobResult> {
    const { productId } = job.data;

    // Get product data from database
    const products = await this.vectorService.getProductsNeedingEmbeddings(1);
    const product = products.find((p) => p.id === productId);

    if (!product) {
      return {
        success: false,
        processedCount: 0,
        failedCount: 1,
        totalTokensUsed: 0,
        estimatedCost: 0,
        errors: [`Product ${productId} not found`],
        duration: 0,
      };
    }

    // Clear cache and regenerate
    await this.vectorService.clearProductCache(productId);
    const cost = await this.vectorService.generateProductEmbedding(
      productId,
      product.title,
      product.description,
      product.category,
      product.tags
    );

    return {
      success: true,
      processedCount: 1,
      failedCount: 0,
      totalTokensUsed: cost.tokensUsed,
      estimatedCost: cost.estimatedCost,
      duration: 0,
    };
  }

  /**
   * Process validation job
   */
  private async processValidation(
    job: Job<ValidateEmbeddingsJobData>
  ): Promise<EmbeddingJobResult> {
    const { productIds, validateAll } = job.data;

    let results;
    if (validateAll) {
      results = await this.validationService.validateAllEmbeddings();
    } else if (productIds && productIds.length > 0) {
      results = await this.validationService.validateEmbeddings(productIds);
    } else {
      return {
        success: false,
        processedCount: 0,
        failedCount: 0,
        totalTokensUsed: 0,
        estimatedCost: 0,
        errors: ['No products specified for validation'],
        duration: 0,
      };
    }

    const invalidCount = results.filter((r) => !r.isValid).length;

    return {
      success: invalidCount === 0,
      processedCount: results.length,
      failedCount: invalidCount,
      totalTokensUsed: 0,
      estimatedCost: 0,
      errors: results
        .filter((r) => !r.isValid)
        .map((r) => `${r.productId}: ${r.issues.join(', ')}`),
      duration: 0,
    };
  }

  /**
   * Update job progress
   */
  private async updateProgress(
    job: Job<EmbeddingJobData>,
    progress: EmbeddingJobProgress
  ): Promise<void> {
    await job.updateProgress(progress);
  }

  /**
   * Event handler for job completion
   */
  @OnWorkerEvent('completed')
  onCompleted(job: Job<EmbeddingJobData>) {
    this.logger.debug(`Job ${job.id} completed successfully`);
  }

  /**
   * Event handler for job failure
   */
  @OnWorkerEvent('failed')
  onFailed(job: Job<EmbeddingJobData>, error: Error) {
    this.logger.error(`Job ${job.id} failed: ${error.message}`);
  }

  /**
   * Event handler for job progress
   */
  @OnWorkerEvent('progress')
  onProgress(job: Job<EmbeddingJobData>, progress: EmbeddingJobProgress) {
    this.logger.debug(
      `Job ${job.id} progress: ${progress.percentage}% (${progress.processed}/${progress.total})`
    );
  }
}
