/**
 * Vector Database Service
 *
 * Service for managing embeddings and semantic search using Pinecone
 */

import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';
import {
  VectorSearchQuery,
  VectorSearchResult,
  ProductEmbedding,
  VectorDatabaseError,
  EmbeddingModel,
} from '../types';
import { getAIConfig, calculateCost, TIMEOUT_CONFIG } from '../config/ai.config';

export class VectorService {
  private pinecone: Pinecone;
  private openai: OpenAI;
  private config: ReturnType<typeof getAIConfig>;
  private indexName: string;

  constructor() {
    this.config = getAIConfig();
    this.indexName = this.config.pinecone.indexName;

    // Initialize Pinecone
    this.pinecone = new Pinecone({
      apiKey: this.config.pinecone.apiKey,
    });

    // Initialize OpenAI for embeddings
    this.openai = new OpenAI({
      apiKey: this.config.openai.apiKey,
      organization: this.config.openai.organization,
      timeout: TIMEOUT_CONFIG.embedding,
    });
  }

  /**
   * Initialize Pinecone index
   */
  async initializeIndex(): Promise<void> {
    try {
      const existingIndexes = await this.pinecone.listIndexes();
      const indexExists = existingIndexes.indexes?.some(
        (index) => index.name === this.indexName
      );

      if (!indexExists) {
        console.log(`Creating Pinecone index: ${this.indexName}`);
        await this.pinecone.createIndex({
          name: this.indexName,
          dimension: this.config.pinecone.dimension,
          metric: 'cosine',
          spec: {
            serverless: {
              cloud: 'aws',
              region: 'us-east-1',
            },
          },
        });

        // Wait for index to be ready
        await this.waitForIndexReady();
      } else {
        console.log(`Index ${this.indexName} already exists`);
      }
    } catch (error: any) {
      throw new VectorDatabaseError(
        `Failed to initialize Pinecone index: ${error.message}`,
        'INITIALIZATION_ERROR',
        error
      );
    }
  }

  /**
   * Generate embedding for text using OpenAI
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: this.config.models.embeddingModel,
        input: text,
      });

      const embedding = response.data[0]?.embedding;
      if (!embedding) {
        throw new Error('No embedding in response');
      }

      return embedding;
    } catch (error: any) {
      throw new VectorDatabaseError(
        `Failed to generate embedding: ${error.message}`,
        'EMBEDDING_ERROR',
        error
      );
    }
  }

  /**
   * Upsert product embeddings to Pinecone
   */
  async upsertProductEmbeddings(products: ProductEmbedding[]): Promise<void> {
    try {
      const index = this.pinecone.index(this.indexName);

      // Prepare vectors for upsert
      const vectors = products.map((product) => ({
        id: product.productId,
        values: product.embedding,
        metadata: {
          productName: product.productName,
          description: product.description,
          category: product.category,
          price: product.price,
          tags: product.tags,
        },
      }));

      // Upsert in batches of 100
      const batchSize = 100;
      for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize);
        await index.upsert(batch);
      }

      console.log(`Upserted ${vectors.length} product embeddings`);
    } catch (error: any) {
      throw new VectorDatabaseError(
        `Failed to upsert embeddings: ${error.message}`,
        'UPSERT_ERROR',
        error
      );
    }
  }

  /**
   * Perform semantic search for similar products
   */
  async semanticSearch(query: VectorSearchQuery): Promise<VectorSearchResult[]> {
    try {
      // Generate embedding for search query
      const queryEmbedding = await this.generateEmbedding(query.query);

      const index = this.pinecone.index(this.indexName);

      // Perform similarity search
      const searchResults = await index.query({
        vector: queryEmbedding,
        topK: query.topK || 10,
        includeMetadata: query.includeMetadata !== false,
        filter: query.filters,
      });

      // Transform results
      const results: VectorSearchResult[] = (searchResults.matches || []).map(
        (match) => ({
          id: match.id,
          score: match.score || 0,
          metadata: match.metadata as Record<string, any>,
        })
      );

      return results;
    } catch (error: any) {
      throw new VectorDatabaseError(
        `Failed to perform semantic search: ${error.message}`,
        'SEARCH_ERROR',
        error
      );
    }
  }

  /**
   * Delete product embeddings from index
   */
  async deleteProductEmbeddings(productIds: string[]): Promise<void> {
    try {
      const index = this.pinecone.index(this.indexName);

      await index.deleteMany(productIds);

      console.log(`Deleted ${productIds.length} product embeddings`);
    } catch (error: any) {
      throw new VectorDatabaseError(
        `Failed to delete embeddings: ${error.message}`,
        'DELETE_ERROR',
        error
      );
    }
  }

  /**
   * Get index statistics
   */
  async getIndexStats(): Promise<any> {
    try {
      const index = this.pinecone.index(this.indexName);
      const stats = await index.describeIndexStats();
      return stats;
    } catch (error: any) {
      throw new VectorDatabaseError(
        `Failed to get index stats: ${error.message}`,
        'STATS_ERROR',
        error
      );
    }
  }

  /**
   * Search by category and price range
   */
  async searchByCategoryAndPrice(
    query: string,
    category?: string,
    minPrice?: number,
    maxPrice?: number,
    topK: number = 10
  ): Promise<VectorSearchResult[]> {
    const filters: Record<string, any> = {};

    if (category) {
      filters.category = { $eq: category };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filters.price = {};
      if (minPrice !== undefined) {
        filters.price.$gte = minPrice;
      }
      if (maxPrice !== undefined) {
        filters.price.$lte = maxPrice;
      }
    }

    return this.semanticSearch({
      query,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
      topK,
      includeMetadata: true,
    });
  }

  /**
   * Generate embeddings for a batch of products
   */
  async generateProductEmbeddings(
    products: Array<{
      productId: string;
      productName: string;
      description: string;
      category: string;
      price: number;
      tags: string[];
    }>
  ): Promise<ProductEmbedding[]> {
    const embeddings: ProductEmbedding[] = [];

    for (const product of products) {
      // Create searchable text from product data
      const searchableText = `${product.productName} ${product.description} ${product.category} ${product.tags.join(' ')}`;

      try {
        const embedding = await this.generateEmbedding(searchableText);

        embeddings.push({
          productId: product.productId,
          productName: product.productName,
          description: product.description,
          category: product.category,
          price: product.price,
          tags: product.tags,
          embedding,
        });

        // Add small delay to avoid rate limiting
        await this.sleep(100);
      } catch (error) {
        console.error(`Failed to generate embedding for product ${product.productId}:`, error);
      }
    }

    return embeddings;
  }

  /**
   * Wait for index to be ready
   */
  private async waitForIndexReady(maxAttempts: number = 30): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const indexDescription = await this.pinecone.describeIndex(this.indexName);
        if (indexDescription.status?.ready) {
          console.log('Index is ready');
          return;
        }
      } catch (error) {
        // Index might not be available yet
      }

      console.log(`Waiting for index to be ready... (${i + 1}/${maxAttempts})`);
      await this.sleep(2000); // Wait 2 seconds
    }

    throw new Error('Index did not become ready in time');
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Delete the entire index (use with caution!)
   */
  async deleteIndex(): Promise<void> {
    try {
      await this.pinecone.deleteIndex(this.indexName);
      console.log(`Deleted index: ${this.indexName}`);
    } catch (error: any) {
      throw new VectorDatabaseError(
        `Failed to delete index: ${error.message}`,
        'DELETE_INDEX_ERROR',
        error
      );
    }
  }
}
