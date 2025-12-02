/**
 * AI Library - Main Entry Point
 *
 * Exports all services, types, and utilities for AI-powered gift recommendations
 */

// ============================================================================
// Services
// ============================================================================

export { AIRecommendationService } from './services/ai-recommendation.service';
export { VectorService } from './services/vector.service';

// ============================================================================
// Types
// ============================================================================

export type {
  GiftSearchRequest,
  GiftRecommendation,
  GiftSearchResponse,
  VectorSearchQuery,
  VectorSearchResult,
  ProductEmbedding,
  PromptContext,
  PromptTemplate,
  UserFeedbackData,
  FeedbackAnalytics,
  CacheConfig,
  CachedSearchResult,
  AIModelConfig,
} from './types';

export {
  AIModel,
  EmbeddingModel,
  AIServiceError,
  RateLimitError,
  VectorDatabaseError,
} from './types';

// ============================================================================
// Configuration
// ============================================================================

export type { AIServiceConfig } from './config/ai.config';

export {
  defaultAIConfig,
  MODEL_PRICING,
  RETRY_CONFIG,
  TIMEOUT_CONFIG,
  calculateCost,
  validateAIConfig,
  getAIConfig,
} from './config/ai.config';

// ============================================================================
// Prompts
// ============================================================================

export {
  GiftRecommendationPrompts,
  enhanceProductDescriptionPrompt,
  categorizationPrompt,
} from './prompts/gift-recommendation.prompts';
