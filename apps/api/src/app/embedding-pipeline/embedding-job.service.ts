import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, Job, JobsOptions } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';
import {
  EMBEDDING_QUEUE_NAME,
  EmbeddingJobType,
  JOB_PRIORITY,
  RETRY_CONFIG,
  BATCH_CONFIG,
} from './embedding-pipeline.constants';
import {
  GenerateProductEmbeddingJobData,
  GenerateBatchEmbeddingsJobData,
  BackfillEmbeddingsJobData,
  UpdateProductEmbeddingJobData,
  ValidateEmbeddingsJobData,
  EmbeddingJobData,
  EmbeddingJobProgress,
} from './interfaces';

/**
 * Service for managing embedding jobs
 * Provides methods to create and monitor embedding jobs
 */
@Injectable()
export class EmbeddingJobService {
  private readonly logger = new Logger(EmbeddingJobService.name);

  constructor(
    @InjectQueue(EMBEDDING_QUEUE_NAME)
    private readonly embeddingQueue: Queue<EmbeddingJobData>
  ) {}

  /**
   * Create a job to generate embedding for a single product
   */
  async createProductEmbeddingJob(
    productId: string,
    title: string,
    description?: string | null,
    category?: string | null,
    tags?: string[],
    options?: { priority?: number; requestedBy?: string }
  ): Promise<Job<GenerateProductEmbeddingJobData>> {
    const jobData: GenerateProductEmbeddingJobData = {
      jobType: EmbeddingJobType.GENERATE_PRODUCT_EMBEDDING,
      productId,
      title,
      description,
      category,
      tags,
      priority: options?.priority || JOB_PRIORITY.NORMAL,
      createdAt: new Date().toISOString(),
      requestedBy: options?.requestedBy,
    };

    const jobOptions = this.getDefaultJobOptions(options?.priority);

    const job = await this.embeddingQueue.add(
      EmbeddingJobType.GENERATE_PRODUCT_EMBEDDING,
      jobData,
      {
        ...jobOptions,
        jobId: `product-embedding-${productId}`,
      }
    );

    this.logger.log(`Created product embedding job ${job.id} for product ${productId}`);
    return job as Job<GenerateProductEmbeddingJobData>;
  }

  /**
   * Create a job to generate embeddings for multiple products
   */
  async createBatchEmbeddingJob(
    products: Array<{
      id: string;
      title: string;
      description?: string | null;
      category?: string | null;
      tags?: string[];
    }>,
    options?: { priority?: number; requestedBy?: string }
  ): Promise<Job<GenerateBatchEmbeddingsJobData>> {
    const batchId = uuidv4();

    const jobData: GenerateBatchEmbeddingsJobData = {
      jobType: EmbeddingJobType.GENERATE_BATCH_EMBEDDINGS,
      products,
      batchId,
      createdAt: new Date().toISOString(),
      requestedBy: options?.requestedBy,
    };

    const jobOptions = this.getDefaultJobOptions(options?.priority);

    const job = await this.embeddingQueue.add(
      EmbeddingJobType.GENERATE_BATCH_EMBEDDINGS,
      jobData,
      {
        ...jobOptions,
        jobId: `batch-embedding-${batchId}`,
      }
    );

    this.logger.log(
      `Created batch embedding job ${job.id} for ${products.length} products`
    );
    return job as Job<GenerateBatchEmbeddingsJobData>;
  }

  /**
   * Create a job to backfill embeddings for products without them
   */
  async createBackfillJob(
    limit: number = BATCH_CONFIG.maxBatchSize,
    batchSize: number = BATCH_CONFIG.defaultBatchSize,
    resumeFromId?: string,
    options?: { priority?: number; requestedBy?: string }
  ): Promise<Job<BackfillEmbeddingsJobData>> {
    const jobData: BackfillEmbeddingsJobData = {
      jobType: EmbeddingJobType.BACKFILL_EMBEDDINGS,
      limit: Math.min(limit, 1000), // Cap at 1000
      batchSize: Math.min(batchSize, BATCH_CONFIG.maxBatchSize),
      resumeFromId,
      createdAt: new Date().toISOString(),
      requestedBy: options?.requestedBy,
    };

    const jobOptions = this.getDefaultJobOptions(JOB_PRIORITY.BACKGROUND);

    const job = await this.embeddingQueue.add(
      EmbeddingJobType.BACKFILL_EMBEDDINGS,
      jobData,
      {
        ...jobOptions,
        jobId: `backfill-embedding-${Date.now()}`,
      }
    );

    this.logger.log(`Created backfill job ${job.id} for up to ${limit} products`);
    return job as Job<BackfillEmbeddingsJobData>;
  }

  /**
   * Create a job to update an existing product's embedding
   */
  async createUpdateEmbeddingJob(
    productId: string,
    changedFields: string[],
    options?: { priority?: number; requestedBy?: string }
  ): Promise<Job<UpdateProductEmbeddingJobData>> {
    const jobData: UpdateProductEmbeddingJobData = {
      jobType: EmbeddingJobType.UPDATE_PRODUCT_EMBEDDING,
      productId,
      changedFields,
      createdAt: new Date().toISOString(),
      requestedBy: options?.requestedBy,
    };

    const jobOptions = this.getDefaultJobOptions(options?.priority || JOB_PRIORITY.HIGH);

    const job = await this.embeddingQueue.add(
      EmbeddingJobType.UPDATE_PRODUCT_EMBEDDING,
      jobData,
      {
        ...jobOptions,
        jobId: `update-embedding-${productId}-${Date.now()}`,
      }
    );

    this.logger.log(`Created update embedding job ${job.id} for product ${productId}`);
    return job as Job<UpdateProductEmbeddingJobData>;
  }

  /**
   * Create a job to validate embeddings
   */
  async createValidationJob(
    productIds?: string[],
    validateAll?: boolean,
    options?: { priority?: number; requestedBy?: string }
  ): Promise<Job<ValidateEmbeddingsJobData>> {
    const jobData: ValidateEmbeddingsJobData = {
      jobType: EmbeddingJobType.VALIDATE_EMBEDDINGS,
      productIds,
      validateAll,
      createdAt: new Date().toISOString(),
      requestedBy: options?.requestedBy,
    };

    const jobOptions = this.getDefaultJobOptions(JOB_PRIORITY.LOW);

    const job = await this.embeddingQueue.add(
      EmbeddingJobType.VALIDATE_EMBEDDINGS,
      jobData,
      {
        ...jobOptions,
        jobId: `validate-embeddings-${Date.now()}`,
      }
    );

    this.logger.log(`Created validation job ${job.id}`);
    return job as Job<ValidateEmbeddingsJobData>;
  }

  /**
   * Get job by ID
   */
  async getJob(jobId: string): Promise<Job<EmbeddingJobData> | undefined> {
    return this.embeddingQueue.getJob(jobId);
  }

  /**
   * Get job progress
   */
  async getJobProgress(jobId: string): Promise<EmbeddingJobProgress | null> {
    const job = await this.getJob(jobId);
    if (!job) return null;

    const progress = job.progress;
    if (typeof progress === 'object' && progress !== null) {
      return progress as EmbeddingJobProgress;
    }
    return null;
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.embeddingQueue.getWaitingCount(),
      this.embeddingQueue.getActiveCount(),
      this.embeddingQueue.getCompletedCount(),
      this.embeddingQueue.getFailedCount(),
      this.embeddingQueue.getDelayedCount(),
    ]);

    return { waiting, active, completed, failed, delayed };
  }

  /**
   * Get active jobs
   */
  async getActiveJobs(): Promise<Job<EmbeddingJobData>[]> {
    return this.embeddingQueue.getActive();
  }

  /**
   * Get waiting jobs
   */
  async getWaitingJobs(): Promise<Job<EmbeddingJobData>[]> {
    return this.embeddingQueue.getWaiting();
  }

  /**
   * Get failed jobs
   */
  async getFailedJobs(start = 0, end = 10): Promise<Job<EmbeddingJobData>[]> {
    return this.embeddingQueue.getFailed(start, end);
  }

  /**
   * Retry a failed job
   */
  async retryJob(jobId: string): Promise<void> {
    const job = await this.getJob(jobId);
    if (job) {
      await job.retry();
      this.logger.log(`Retried job ${jobId}`);
    }
  }

  /**
   * Remove a job
   */
  async removeJob(jobId: string): Promise<void> {
    const job = await this.getJob(jobId);
    if (job) {
      await job.remove();
      this.logger.log(`Removed job ${jobId}`);
    }
  }

  /**
   * Pause the queue
   */
  async pauseQueue(): Promise<void> {
    await this.embeddingQueue.pause();
    this.logger.log('Embedding queue paused');
  }

  /**
   * Resume the queue
   */
  async resumeQueue(): Promise<void> {
    await this.embeddingQueue.resume();
    this.logger.log('Embedding queue resumed');
  }

  /**
   * Get default job options
   */
  private getDefaultJobOptions(priority?: number): JobsOptions {
    return {
      priority: priority || JOB_PRIORITY.NORMAL,
      attempts: RETRY_CONFIG.maxRetries,
      backoff: {
        type: RETRY_CONFIG.backoffType,
        delay: RETRY_CONFIG.backoffDelay,
      },
      removeOnComplete: {
        age: 3600, // Keep completed jobs for 1 hour
        count: 100, // Keep last 100 completed jobs
      },
      removeOnFail: {
        age: 86400, // Keep failed jobs for 24 hours
        count: 500, // Keep last 500 failed jobs
      },
    };
  }
}
