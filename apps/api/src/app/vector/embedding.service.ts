import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  Embedding,
  EmbeddingRequest,
  EmbeddingResponse,
  BatchEmbeddingRequest,
  BatchEmbeddingResponse,
  EmbeddingCost,
} from './interfaces';

/**
 * Service for generating text embeddings using OpenAI API
 * Uses text-embedding-3-small model (1536 dimensions) for cost efficiency
 */
@Injectable()
export class EmbeddingService implements OnModuleInit {
  private readonly logger = new Logger(EmbeddingService.name);
  private openai: OpenAI;
  private readonly defaultModel = 'text-embedding-3-small';
  private readonly maxBatchSize = 100;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;

  // Cost tracking (per 1M tokens)
  private readonly modelCosts: Record<string, number> = {
    'text-embedding-3-small': 0.02,
    'text-embedding-3-large': 0.13,
    'text-embedding-ada-002': 0.10,
  };

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');

    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY not configured - embedding generation will fail');
      return;
    }

    this.openai = new OpenAI({
      apiKey,
      maxRetries: this.maxRetries,
    });

    this.logger.log('EmbeddingService initialized with OpenAI');
  }

  /**
   * Generate embedding for a single text
   */
  async generateEmbedding(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    const model = request.model || this.defaultModel;

    if (!this.openai) {
      throw new Error('OpenAI client not initialized - check OPENAI_API_KEY');
    }

    try {
      const response = await this.retryWithBackoff(async () => {
        return await this.openai.embeddings.create({
          model,
          input: request.text,
        });
      });

      const embedding = response.data[0].embedding;
      const tokensUsed = response.usage.total_tokens;

      this.logger.debug(
        `Generated embedding: ${embedding.length} dimensions, ${tokensUsed} tokens`
      );

      return {
        embedding,
        model,
        tokensUsed,
      };
    } catch (error) {
      this.logger.error(`Failed to generate embedding: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate embeddings for multiple texts in batch
   */
  async generateBatchEmbeddings(
    request: BatchEmbeddingRequest
  ): Promise<BatchEmbeddingResponse> {
    const model = request.model || this.defaultModel;

    if (!this.openai) {
      throw new Error('OpenAI client not initialized - check OPENAI_API_KEY');
    }

    if (request.texts.length === 0) {
      return { embeddings: [], model, tokensUsed: 0 };
    }

    try {
      const embeddings: Embedding[] = [];
      let totalTokens = 0;

      // Process in batches to respect API limits
      for (let i = 0; i < request.texts.length; i += this.maxBatchSize) {
        const batch = request.texts.slice(i, i + this.maxBatchSize);

        const response = await this.retryWithBackoff(async () => {
          return await this.openai.embeddings.create({
            model,
            input: batch,
          });
        });

        // Sort by index to maintain order
        const sortedData = response.data.sort((a, b) => a.index - b.index);

        for (const item of sortedData) {
          embeddings.push(item.embedding);
        }

        totalTokens += response.usage.total_tokens;

        this.logger.debug(
          `Batch ${Math.floor(i / this.maxBatchSize) + 1}: ` +
          `${batch.length} texts, ${response.usage.total_tokens} tokens`
        );
      }

      this.logger.log(
        `Generated ${embeddings.length} embeddings, ${totalTokens} total tokens`
      );

      return {
        embeddings,
        model,
        tokensUsed: totalTokens,
      };
    } catch (error) {
      this.logger.error(`Batch embedding failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate embedding for product text (title + description)
   */
  async generateProductEmbedding(
    title: string,
    description?: string | null,
    category?: string | null,
    tags?: string[]
  ): Promise<EmbeddingResponse> {
    // Combine product fields into searchable text
    const parts = [title];

    if (description) {
      // Truncate long descriptions to manage token costs
      parts.push(description.substring(0, 500));
    }

    if (category) {
      parts.push(`Category: ${category}`);
    }

    if (tags && tags.length > 0) {
      parts.push(`Tags: ${tags.slice(0, 10).join(', ')}`);
    }

    const text = parts.join('. ');

    return this.generateEmbedding({ text });
  }

  /**
   * Generate embedding for search query
   */
  async generateQueryEmbedding(query: string): Promise<EmbeddingResponse> {
    // Clean and normalize query
    const normalizedQuery = query.trim().toLowerCase();

    return this.generateEmbedding({ text: normalizedQuery });
  }

  /**
   * Calculate cost for embedding generation
   */
  calculateCost(tokensUsed: number, model?: string): EmbeddingCost {
    const modelName = model || this.defaultModel;
    const costPerMillion = this.modelCosts[modelName] || this.modelCosts[this.defaultModel];
    const estimatedCost = (tokensUsed / 1_000_000) * costPerMillion;

    return {
      tokensUsed,
      estimatedCost,
      model: modelName,
      timestamp: new Date(),
    };
  }

  /**
   * Validate embedding dimensions
   */
  validateEmbedding(embedding: Embedding, expectedDimensions = 1536): boolean {
    if (!Array.isArray(embedding)) {
      return false;
    }

    if (embedding.length !== expectedDimensions) {
      this.logger.warn(
        `Invalid embedding dimensions: ${embedding.length} (expected ${expectedDimensions})`
      );
      return false;
    }

    // Check for valid numbers
    return embedding.every(n => typeof n === 'number' && !isNaN(n) && isFinite(n));
  }

  /**
   * Convert embedding to PostgreSQL vector format
   */
  toVectorString(embedding: Embedding): string {
    return `[${embedding.join(',')}]`;
  }

  /**
   * Parse PostgreSQL vector format to embedding array
   */
  fromVectorString(vectorString: string): Embedding {
    // Remove brackets and split by comma
    const cleaned = vectorString.replace(/[\[\]]/g, '');
    return cleaned.split(',').map(n => parseFloat(n.trim()));
  }

  /**
   * Retry with exponential backoff for rate limits
   */
  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries = this.maxRetries
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        // Check if error is rate limit (429) or server error (5xx)
        const isRetryable =
          error?.status === 429 ||
          (error?.status >= 500 && error?.status < 600);

        if (!isRetryable || attempt === maxRetries) {
          throw error;
        }

        const delay = this.retryDelay * Math.pow(2, attempt);
        this.logger.warn(
          `Rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`
        );

        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
