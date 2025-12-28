/**
 * Constants for the embedding pipeline
 */

// Queue names
export const EMBEDDING_QUEUE_NAME = 'embedding-queue';

// Job types
export enum EmbeddingJobType {
  GENERATE_PRODUCT_EMBEDDING = 'generate-product-embedding',
  GENERATE_BATCH_EMBEDDINGS = 'generate-batch-embeddings',
  BACKFILL_EMBEDDINGS = 'backfill-embeddings',
  UPDATE_PRODUCT_EMBEDDING = 'update-product-embedding',
  VALIDATE_EMBEDDINGS = 'validate-embeddings',
}

// Job priorities (lower number = higher priority)
export const JOB_PRIORITY = {
  CRITICAL: 1,
  HIGH: 2,
  NORMAL: 3,
  LOW: 4,
  BACKGROUND: 5,
} as const;

// Retry configuration
export const RETRY_CONFIG = {
  maxRetries: 3,
  backoffType: 'exponential' as const,
  backoffDelay: 1000, // Start with 1 second
};

// Rate limiting
export const RATE_LIMIT = {
  maxJobsPerMinute: 60, // OpenAI rate limit consideration
  maxConcurrentJobs: 5,
};

// Batch processing
export const BATCH_CONFIG = {
  defaultBatchSize: 50,
  maxBatchSize: 100,
  minBatchSize: 1,
};

// Monitoring thresholds
export const MONITORING_THRESHOLDS = {
  warningFailureRate: 0.05, // 5%
  criticalFailureRate: 0.1, // 10%
  warningLatencyMs: 5000, // 5 seconds
  criticalLatencyMs: 10000, // 10 seconds
};

// Cost tracking
export const EMBEDDING_COST = {
  // OpenAI text-embedding-3-small pricing per 1M tokens
  pricePerMillionTokens: 0.02,
  // Average tokens per product (title + description)
  avgTokensPerProduct: 100,
};
