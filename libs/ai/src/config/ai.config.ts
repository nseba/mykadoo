/**
 * AI Service Configuration
 *
 * Configuration for OpenAI models, Pinecone, and AI services
 */

import { AIModel, AIModelConfig, EmbeddingModel, CacheConfig } from '../types';

export interface AIServiceConfig {
  openai: {
    apiKey: string;
    organization?: string;
    baseURL?: string;
  };
  pinecone: {
    apiKey: string;
    environment: string;
    indexName: string;
    dimension: number; // 3072 for text-embedding-3-large, 1536 for ada-002
  };
  models: AIModelConfig;
  cache: CacheConfig;
  rateLimiting: {
    enabled: boolean;
    maxRequestsPerMinute: number;
    maxConcurrentRequests: number;
  };
  costTracking: {
    enabled: boolean;
    alertThreshold: number; // Alert when daily cost exceeds this amount in USD
  };
}

/**
 * Default AI configuration
 */
export const defaultAIConfig: AIServiceConfig = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    organization: process.env.OPENAI_ORG_ID,
    baseURL: process.env.OPENAI_BASE_URL,
  },
  pinecone: {
    apiKey: process.env.PINECONE_API_KEY || '',
    environment: process.env.PINECONE_ENVIRONMENT || 'us-east-1-aws',
    indexName: process.env.PINECONE_INDEX_NAME || 'mykadoo-gifts',
    dimension: 3072, // text-embedding-3-large
  },
  models: {
    primary: AIModel.GPT4_TURBO,
    fallback: AIModel.GPT35_TURBO,
    embeddingModel: EmbeddingModel.TEXT_EMBEDDING_3_LARGE,
    temperature: 0.7,
    maxTokens: 2000,
    topP: 1,
  },
  cache: {
    enabled: true,
    ttl: 3600, // 1 hour
    keyPrefix: 'ai:gift:',
  },
  rateLimiting: {
    enabled: true,
    maxRequestsPerMinute: 60,
    maxConcurrentRequests: 10,
  },
  costTracking: {
    enabled: true,
    alertThreshold: 100, // $100/day
  },
};

/**
 * Model pricing (USD per 1K tokens)
 */
export const MODEL_PRICING = {
  [AIModel.GPT4]: {
    input: 0.03,
    output: 0.06,
  },
  [AIModel.GPT4_TURBO]: {
    input: 0.01,
    output: 0.03,
  },
  [AIModel.GPT35_TURBO]: {
    input: 0.0005,
    output: 0.0015,
  },
  [EmbeddingModel.TEXT_EMBEDDING_3_LARGE]: {
    input: 0.00013,
    output: 0, // Embeddings don't have output tokens
  },
  [EmbeddingModel.TEXT_EMBEDDING_3_SMALL]: {
    input: 0.00002,
    output: 0,
  },
  [EmbeddingModel.TEXT_EMBEDDING_ADA_002]: {
    input: 0.0001,
    output: 0,
  },
};

/**
 * Calculate cost for API call
 */
export function calculateCost(
  model: AIModel | EmbeddingModel,
  inputTokens: number,
  outputTokens: number = 0
): number {
  const pricing = MODEL_PRICING[model];
  if (!pricing) {
    return 0;
  }

  const inputCost = (inputTokens / 1000) * pricing.input;
  const outputCost = (outputTokens / 1000) * pricing.output;

  return inputCost + outputCost;
}

/**
 * Retry configuration for API calls
 */
export const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  exponentialBase: 2,
  shouldRetry: (error: any) => {
    // Retry on rate limit, timeout, or server errors
    if (error.status >= 500) return true;
    if (error.status === 429) return true;
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') return true;
    return false;
  },
};

/**
 * Timeout configuration
 */
export const TIMEOUT_CONFIG = {
  recommendation: 30000, // 30 seconds for recommendation requests
  embedding: 10000, // 10 seconds for embedding requests
  vectorSearch: 5000, // 5 seconds for vector search
};

/**
 * Validate AI configuration
 */
export function validateAIConfig(config: AIServiceConfig): void {
  if (!config.openai.apiKey) {
    throw new Error('OPENAI_API_KEY is required in environment variables');
  }

  // Pinecone is optional, but log warning if not configured
  if (!config.pinecone.apiKey) {
    console.warn('PINECONE_API_KEY not configured - vector search will not be available');
  }

  if (config.models.temperature < 0 || config.models.temperature > 2) {
    throw new Error('Temperature must be between 0 and 2');
  }

  if (config.models.maxTokens < 1 || config.models.maxTokens > 4096) {
    throw new Error('Max tokens must be between 1 and 4096');
  }
}

/**
 * Get configuration from environment
 */
export function getAIConfig(): AIServiceConfig {
  const config: AIServiceConfig = {
    ...defaultAIConfig,
    openai: {
      apiKey: process.env.OPENAI_API_KEY || defaultAIConfig.openai.apiKey,
      organization: process.env.OPENAI_ORG_ID || defaultAIConfig.openai.organization,
      baseURL: process.env.OPENAI_BASE_URL || defaultAIConfig.openai.baseURL,
    },
    pinecone: {
      apiKey: process.env.PINECONE_API_KEY || defaultAIConfig.pinecone.apiKey,
      environment: process.env.PINECONE_ENVIRONMENT || defaultAIConfig.pinecone.environment,
      indexName: process.env.PINECONE_INDEX_NAME || defaultAIConfig.pinecone.indexName,
      dimension: parseInt(process.env.PINECONE_DIMENSION || '3072', 10),
    },
  };

  validateAIConfig(config);

  return config;
}
