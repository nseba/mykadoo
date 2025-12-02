/**
 * AI Library Types
 *
 * Type definitions for AI services, recommendations, and search
 */

// ============================================================================
// Gift Search Types
// ============================================================================

export interface GiftSearchRequest {
  occasion: string;
  relationship: string;
  ageRange: string;
  gender?: string;
  budgetMin: number;
  budgetMax: number;
  interests: string[];
  recipientName?: string;
}

export interface GiftRecommendation {
  productName: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  tags: string[];
  matchReason: string;
  imageUrl?: string;
  purchaseUrl?: string;
  retailer?: string;
  relevanceScore: number;
}

export interface GiftSearchResponse {
  recommendations: GiftRecommendation[];
  searchId?: string;
  model: string;
  cost: number;
  latency: number;
  totalResults: number;
}

// ============================================================================
// AI Model Types
// ============================================================================

export enum AIModel {
  GPT4 = 'gpt-4',
  GPT4_TURBO = 'gpt-4-turbo-preview',
  GPT35_TURBO = 'gpt-3.5-turbo',
  CLAUDE_OPUS = 'claude-3-opus-20240229',
  CLAUDE_SONNET = 'claude-3-sonnet-20240229',
}

export enum EmbeddingModel {
  TEXT_EMBEDDING_3_LARGE = 'text-embedding-3-large',
  TEXT_EMBEDDING_3_SMALL = 'text-embedding-3-small',
  TEXT_EMBEDDING_ADA_002 = 'text-embedding-ada-002',
}

export interface AIModelConfig {
  primary: AIModel;
  fallback: AIModel;
  embeddingModel: EmbeddingModel;
  temperature: number;
  maxTokens: number;
  topP: number;
}

// ============================================================================
// Vector Search Types
// ============================================================================

export interface VectorSearchQuery {
  query: string;
  filters?: Record<string, any>;
  topK?: number;
  includeMetadata?: boolean;
}

export interface VectorSearchResult {
  id: string;
  score: number;
  metadata?: Record<string, any>;
}

export interface ProductEmbedding {
  productId: string;
  productName: string;
  description: string;
  category: string;
  price: number;
  tags: string[];
  embedding: number[];
}

// ============================================================================
// Prompt Types
// ============================================================================

export interface PromptContext {
  occasion: string;
  relationship: string;
  ageRange: string;
  gender?: string;
  budgetMin: number;
  budgetMax: number;
  interests: string[];
  previousRecommendations?: string[];
}

export interface PromptTemplate {
  system: string;
  user: string;
  examples?: {
    input: string;
    output: string;
  }[];
}

// ============================================================================
// Feedback Types
// ============================================================================

export interface UserFeedbackData {
  userId: string;
  searchId: string;
  recommendationId: string;
  rating?: number; // 1-5 stars
  action: 'purchased' | 'saved' | 'dismissed' | 'clicked';
  timestamp: Date;
}

export interface FeedbackAnalytics {
  totalFeedback: number;
  averageRating: number;
  clickThroughRate: number;
  conversionRate: number;
  topCategories: string[];
  topInterests: string[];
}

// ============================================================================
// Cache Types
// ============================================================================

export interface CacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in seconds
  keyPrefix: string;
}

export interface CachedSearchResult {
  query: string;
  results: GiftRecommendation[];
  timestamp: number;
  expiresAt: number;
}

// ============================================================================
// Error Types
// ============================================================================

export class AIServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AIServiceError';
  }
}

export class RateLimitError extends AIServiceError {
  constructor(message: string, public retryAfter?: number) {
    super(message, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
  }
}

export class VectorDatabaseError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'VectorDatabaseError';
  }
}
