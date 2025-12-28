/**
 * Vector Store Interfaces
 * Type definitions for vector operations using pgvector
 */

/**
 * Raw embedding vector (1536 dimensions for OpenAI text-embedding-3-small)
 */
export type Embedding = number[];

/**
 * Result from a vector similarity search
 */
export interface VectorSearchResult {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string | null;
  similarity: number;
}

/**
 * Result from a query similarity search
 */
export interface QuerySearchResult {
  id: string;
  query: string;
  similarity: number;
}

/**
 * Hybrid search result combining keyword and semantic scores
 */
export interface HybridSearchResult {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string | null;
  keywordScore: number;
  semanticScore: number;
  combinedScore: number;
}

/**
 * Options for similarity search
 */
export interface SimilaritySearchOptions {
  /** Minimum similarity threshold (0-1, default 0.7) */
  matchThreshold?: number;
  /** Maximum number of results (default 10) */
  matchCount?: number;
  /** Filter by category */
  categoryFilter?: string;
  /** Minimum price filter */
  minPrice?: number;
  /** Maximum price filter */
  maxPrice?: number;
}

/**
 * Options for hybrid search
 */
export interface HybridSearchOptions {
  /** Weight for keyword matching (0-1, default 0.3) */
  keywordWeight?: number;
  /** Weight for semantic matching (0-1, default 0.7) */
  semanticWeight?: number;
  /** Maximum number of results (default 20) */
  matchCount?: number;
}

/**
 * Embedding generation request
 */
export interface EmbeddingRequest {
  /** Text to embed */
  text: string;
  /** Model to use (default: text-embedding-3-small) */
  model?: string;
}

/**
 * Batch embedding request
 */
export interface BatchEmbeddingRequest {
  /** Array of texts to embed */
  texts: string[];
  /** Model to use (default: text-embedding-3-small) */
  model?: string;
}

/**
 * Embedding response
 */
export interface EmbeddingResponse {
  /** Generated embedding vector */
  embedding: Embedding;
  /** Model used */
  model: string;
  /** Number of tokens used */
  tokensUsed: number;
}

/**
 * Batch embedding response
 */
export interface BatchEmbeddingResponse {
  /** Generated embedding vectors */
  embeddings: Embedding[];
  /** Model used */
  model: string;
  /** Total tokens used */
  tokensUsed: number;
}

/**
 * Product with embedding data
 */
export interface ProductWithEmbedding {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  tags: string[];
  embedding: Embedding | null;
  hasEmbedding: boolean;
}

/**
 * Embedding generation status
 */
export interface EmbeddingStatus {
  /** Total products in database */
  totalProducts: number;
  /** Products with embeddings */
  productsWithEmbedding: number;
  /** Products without embeddings */
  productsMissingEmbedding: number;
  /** Percentage complete */
  percentComplete: number;
}

/**
 * Embedding cost tracking
 */
export interface EmbeddingCost {
  /** Total tokens used */
  tokensUsed: number;
  /** Estimated cost in USD */
  estimatedCost: number;
  /** Model used */
  model: string;
  /** Timestamp */
  timestamp: Date;
}

/**
 * Cache entry for embeddings
 */
export interface EmbeddingCacheEntry {
  /** Cached embedding */
  embedding: Embedding;
  /** Cache timestamp */
  cachedAt: Date;
  /** Time-to-live in seconds */
  ttl: number;
}
