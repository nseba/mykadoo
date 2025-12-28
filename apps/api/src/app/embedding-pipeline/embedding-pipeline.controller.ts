import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { EmbeddingJobService } from './embedding-job.service';
import { EmbeddingValidationService } from './embedding-validation.service';
import { EmbeddingMonitoringService } from './embedding-monitoring.service';
import { EmbeddingCostService } from './embedding-cost.service';
import { BATCH_CONFIG } from './embedding-pipeline.constants';

/**
 * Controller for embedding pipeline management
 * Provides API endpoints for job management, monitoring, and cost tracking
 */
@Controller('api/embeddings')
export class EmbeddingPipelineController {
  private readonly logger = new Logger(EmbeddingPipelineController.name);

  constructor(
    private readonly jobService: EmbeddingJobService,
    private readonly validationService: EmbeddingValidationService,
    private readonly monitoringService: EmbeddingMonitoringService,
    private readonly costService: EmbeddingCostService
  ) {}

  // ==================== Job Management ====================

  /**
   * POST /api/embeddings/jobs/backfill
   * Start a backfill job for products without embeddings
   */
  @Post('jobs/backfill')
  @HttpCode(HttpStatus.ACCEPTED)
  async startBackfillJob(
    @Body() body: { limit?: number; batchSize?: number }
  ) {
    const limit = body.limit || BATCH_CONFIG.maxBatchSize;
    const batchSize = body.batchSize || BATCH_CONFIG.defaultBatchSize;

    const job = await this.jobService.createBackfillJob(limit, batchSize);

    return {
      jobId: job.id,
      status: 'queued',
      message: `Backfill job created for up to ${limit} products`,
    };
  }

  /**
   * POST /api/embeddings/jobs/batch
   * Create a batch embedding job
   */
  @Post('jobs/batch')
  @HttpCode(HttpStatus.ACCEPTED)
  async createBatchJob(
    @Body()
    body: {
      products: Array<{
        id: string;
        title: string;
        description?: string;
        category?: string;
        tags?: string[];
      }>;
    }
  ) {
    if (!body.products || body.products.length === 0) {
      return { error: 'No products provided' };
    }

    const job = await this.jobService.createBatchEmbeddingJob(body.products);

    return {
      jobId: job.id,
      status: 'queued',
      productCount: body.products.length,
      message: `Batch job created for ${body.products.length} products`,
    };
  }

  /**
   * POST /api/embeddings/jobs/validate
   * Create a validation job
   */
  @Post('jobs/validate')
  @HttpCode(HttpStatus.ACCEPTED)
  async createValidationJob(
    @Body() body: { productIds?: string[]; validateAll?: boolean }
  ) {
    const job = await this.jobService.createValidationJob(
      body.productIds,
      body.validateAll
    );

    return {
      jobId: job.id,
      status: 'queued',
      message: body.validateAll
        ? 'Validation job created for all products'
        : `Validation job created for ${body.productIds?.length || 0} products`,
    };
  }

  /**
   * GET /api/embeddings/jobs/:id
   * Get job status and progress
   */
  @Get('jobs/:id')
  async getJobStatus(@Param('id') jobId: string) {
    const job = await this.jobService.getJob(jobId);

    if (!job) {
      return { error: 'Job not found' };
    }

    const state = await job.getState();
    const progress = await this.jobService.getJobProgress(jobId);

    return {
      jobId: job.id,
      state,
      progress,
      data: {
        jobType: job.data.jobType,
        createdAt: job.data.createdAt,
      },
      failedReason: job.failedReason,
    };
  }

  /**
   * GET /api/embeddings/jobs
   * Get queue statistics
   */
  @Get('jobs')
  async getQueueStats() {
    const stats = await this.jobService.getQueueStats();
    const activeJobs = await this.jobService.getActiveJobs();

    return {
      stats,
      activeJobs: activeJobs.map((job) => ({
        id: job.id,
        jobType: job.data.jobType,
        createdAt: job.data.createdAt,
      })),
    };
  }

  /**
   * POST /api/embeddings/jobs/:id/retry
   * Retry a failed job
   */
  @Post('jobs/:id/retry')
  @HttpCode(HttpStatus.OK)
  async retryJob(@Param('id') jobId: string) {
    await this.jobService.retryJob(jobId);
    return { message: `Job ${jobId} queued for retry` };
  }

  /**
   * POST /api/embeddings/queue/pause
   * Pause the embedding queue
   */
  @Post('queue/pause')
  @HttpCode(HttpStatus.OK)
  async pauseQueue() {
    await this.jobService.pauseQueue();
    return { message: 'Embedding queue paused' };
  }

  /**
   * POST /api/embeddings/queue/resume
   * Resume the embedding queue
   */
  @Post('queue/resume')
  @HttpCode(HttpStatus.OK)
  async resumeQueue() {
    await this.jobService.resumeQueue();
    return { message: 'Embedding queue resumed' };
  }

  // ==================== Validation ====================

  /**
   * GET /api/embeddings/validation/coverage
   * Get embedding coverage statistics
   */
  @Get('validation/coverage')
  async getEmbeddingCoverage() {
    return this.validationService.getEmbeddingCoverage();
  }

  /**
   * GET /api/embeddings/validation/invalid
   * Get products with invalid embeddings
   */
  @Get('validation/invalid')
  async getInvalidEmbeddings(@Query('limit') limit?: number) {
    return this.validationService.getProductsWithInvalidEmbeddings(limit || 100);
  }

  /**
   * GET /api/embeddings/validation/:productId
   * Validate a specific product's embedding
   */
  @Get('validation/:productId')
  async validateProduct(@Param('productId') productId: string) {
    return this.validationService.validateProductEmbedding(productId);
  }

  // ==================== Monitoring ====================

  /**
   * GET /api/embeddings/metrics
   * Get embedding metrics
   */
  @Get('metrics')
  async getMetrics() {
    return this.monitoringService.getMetrics();
  }

  /**
   * GET /api/embeddings/metrics/summary
   * Get metrics summary with health status
   */
  @Get('metrics/summary')
  async getMetricsSummary() {
    return this.monitoringService.getMetricsSummary();
  }

  /**
   * POST /api/embeddings/metrics/reset
   * Reset metrics (admin only)
   */
  @Post('metrics/reset')
  @HttpCode(HttpStatus.OK)
  async resetMetrics() {
    await this.monitoringService.resetMetrics();
    return { message: 'Metrics reset successfully' };
  }

  // ==================== Cost Tracking ====================

  /**
   * GET /api/embeddings/cost/session
   * Get current session cost
   */
  @Get('cost/session')
  async getSessionCost() {
    return this.costService.getSessionCost();
  }

  /**
   * GET /api/embeddings/cost/daily
   * Get daily cost summary
   */
  @Get('cost/daily')
  async getDailyCost() {
    return this.costService.getDailyCost();
  }

  /**
   * GET /api/embeddings/cost/monthly
   * Get monthly cost summary
   */
  @Get('cost/monthly')
  async getMonthlyCost() {
    return this.costService.getMonthlyCost();
  }

  /**
   * GET /api/embeddings/cost/breakdown
   * Get cost breakdown by job type
   */
  @Get('cost/breakdown')
  async getCostBreakdown() {
    return this.costService.getCostByJobType();
  }

  /**
   * GET /api/embeddings/cost/projection
   * Get monthly cost projection
   */
  @Get('cost/projection')
  async getCostProjection() {
    return this.costService.getMonthlyProjection();
  }

  /**
   * GET /api/embeddings/cost/budget
   * Check if within budget
   */
  @Get('cost/budget')
  async checkBudget() {
    return this.costService.isWithinBudget();
  }

  /**
   * POST /api/embeddings/cost/budget
   * Set budget limits
   */
  @Post('cost/budget')
  @HttpCode(HttpStatus.OK)
  async setBudget(@Body() body: { daily: number; monthly: number }) {
    await this.costService.setBudgets(body.daily, body.monthly);
    return { message: 'Budget limits updated' };
  }

  /**
   * GET /api/embeddings/cost/estimate
   * Estimate cost for a batch
   */
  @Get('cost/estimate')
  async estimateCost(@Query('productCount') productCount: number) {
    return this.costService.estimateBatchCost(productCount || 100);
  }
}
