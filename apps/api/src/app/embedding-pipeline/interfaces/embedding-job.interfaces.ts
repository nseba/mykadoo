import { EmbeddingJobType } from '../embedding-pipeline.constants';

/**
 * Base job data interface
 */
export interface BaseJobData {
  jobType: EmbeddingJobType;
  createdAt: string;
  requestedBy?: string;
}

/**
 * Job data for generating a single product embedding
 */
export interface GenerateProductEmbeddingJobData extends BaseJobData {
  jobType: EmbeddingJobType.GENERATE_PRODUCT_EMBEDDING;
  productId: string;
  title: string;
  description?: string | null;
  category?: string | null;
  tags?: string[];
  priority?: number;
}

/**
 * Job data for batch embedding generation
 */
export interface GenerateBatchEmbeddingsJobData extends BaseJobData {
  jobType: EmbeddingJobType.GENERATE_BATCH_EMBEDDINGS;
  products: Array<{
    id: string;
    title: string;
    description?: string | null;
    category?: string | null;
    tags?: string[];
  }>;
  batchId: string;
}

/**
 * Job data for backfilling embeddings
 */
export interface BackfillEmbeddingsJobData extends BaseJobData {
  jobType: EmbeddingJobType.BACKFILL_EMBEDDINGS;
  limit: number;
  batchSize: number;
  resumeFromId?: string;
}

/**
 * Job data for updating a product embedding
 */
export interface UpdateProductEmbeddingJobData extends BaseJobData {
  jobType: EmbeddingJobType.UPDATE_PRODUCT_EMBEDDING;
  productId: string;
  changedFields: string[];
}

/**
 * Job data for validating embeddings
 */
export interface ValidateEmbeddingsJobData extends BaseJobData {
  jobType: EmbeddingJobType.VALIDATE_EMBEDDINGS;
  productIds?: string[];
  validateAll?: boolean;
}

/**
 * Union type for all job data types
 */
export type EmbeddingJobData =
  | GenerateProductEmbeddingJobData
  | GenerateBatchEmbeddingsJobData
  | BackfillEmbeddingsJobData
  | UpdateProductEmbeddingJobData
  | ValidateEmbeddingsJobData;

/**
 * Job result interface
 */
export interface EmbeddingJobResult {
  success: boolean;
  processedCount: number;
  failedCount: number;
  totalTokensUsed: number;
  estimatedCost: number;
  errors?: string[];
  duration: number;
}

/**
 * Job progress interface
 */
export interface EmbeddingJobProgress {
  processed: number;
  total: number;
  percentage: number;
  currentProductId?: string;
  tokensUsed: number;
  errors: number;
}

/**
 * Embedding metrics interface
 */
export interface EmbeddingMetrics {
  totalJobsProcessed: number;
  totalJobsFailed: number;
  totalProductsProcessed: number;
  totalTokensUsed: number;
  totalCost: number;
  averageJobDuration: number;
  failureRate: number;
  lastUpdated: string;
}

/**
 * Embedding validation result
 */
export interface EmbeddingValidationResult {
  productId: string;
  isValid: boolean;
  hasEmbedding: boolean;
  dimensions?: number;
  expectedDimensions: number;
  issues: string[];
}

/**
 * Cost tracking record
 */
export interface CostTrackingRecord {
  date: string;
  productId?: string;
  batchId?: string;
  tokensUsed: number;
  estimatedCost: number;
  jobType: EmbeddingJobType;
}
