/**
 * Search Service
 *
 * Business logic for gift search and recommendations with caching
 */

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { AIRecommendationService, VectorService } from '@mykadoo/ai';
import type { GiftSearchRequest, GiftSearchResponse } from '@mykadoo/ai';
import { CacheService, CacheKey, CacheTTL, getCacheConfig } from '@mykadoo/cache';
import { SearchRequestDto } from './dto/search-request.dto';
import { SearchResponseDto, GiftRecommendationDto } from './dto/search-response.dto';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private aiService: AIRecommendationService;
  private vectorService: VectorService;
  private cacheService: CacheService;

  constructor() {
    this.aiService = new AIRecommendationService();
    this.vectorService = new VectorService();
    this.cacheService = new CacheService(getCacheConfig());
  }

  /**
   * Generate gift recommendations based on search criteria
   */
  async search(dto: SearchRequestDto): Promise<SearchResponseDto> {
    this.logger.log(`Generating recommendations for ${dto.occasion} gift`);

    // Validate budget range
    if (dto.budgetMin > dto.budgetMax) {
      throw new BadRequestException('budgetMin cannot be greater than budgetMax');
    }

    try {
      // Build cache key from search parameters
      const cacheKey = CacheKey.search({
        occasion: dto.occasion,
        relationship: dto.relationship,
        ageRange: dto.ageRange,
        budgetMin: dto.budgetMin,
        budgetMax: dto.budgetMax,
      });

      // Try to get cached results
      const cached = await this.cacheService.get<SearchResponseDto>(cacheKey);
      if (cached) {
        this.logger.log(`Cache hit for search: ${cacheKey}`);
        return cached;
      }

      this.logger.log(`Cache miss for search: ${cacheKey}`);

      // Build AI search request
      const searchRequest: GiftSearchRequest = {
        occasion: dto.occasion,
        relationship: dto.relationship,
        ageRange: dto.ageRange,
        gender: dto.gender,
        budgetMin: dto.budgetMin,
        budgetMax: dto.budgetMax,
        interests: dto.interests,
        recipientName: dto.recipientName,
      };

      // Get AI recommendations
      const aiResponse: GiftSearchResponse = await this.aiService.generateRecommendations(
        searchRequest
      );

      // Transform to DTO
      const recommendations: GiftRecommendationDto[] = aiResponse.recommendations.map(
        (rec) => ({
          productName: rec.productName,
          description: rec.description,
          price: rec.price,
          currency: rec.currency,
          category: rec.category,
          tags: rec.tags,
          matchReason: rec.matchReason,
          imageUrl: rec.imageUrl,
          purchaseUrl: rec.purchaseUrl,
          retailer: rec.retailer,
          relevanceScore: rec.relevanceScore,
        })
      );

      // TODO: Save search to database
      const searchId = this.generateSearchId();

      this.logger.log(
        `Generated ${recommendations.length} recommendations using ${aiResponse.model} (cost: $${aiResponse.cost.toFixed(4)})`
      );

      const response: SearchResponseDto = {
        recommendations,
        searchId,
        metadata: {
          model: aiResponse.model,
          cost: aiResponse.cost,
          latency: aiResponse.latency,
          totalResults: aiResponse.totalResults,
        },
        success: true,
      };

      // Cache the response (1 hour TTL)
      await this.cacheService.set(cacheKey, response, {
        ttl: CacheTTL.MEDIUM,
        tags: ['search', dto.occasion, dto.relationship],
      });

      return response;
    } catch (error: any) {
      this.logger.error(`Search failed: ${error.message}`, error.stack);

      return {
        recommendations: [],
        metadata: {
          model: 'error',
          cost: 0,
          latency: 0,
          totalResults: 0,
        },
        success: false,
        error: error.message || 'Failed to generate recommendations',
      };
    }
  }

  /**
   * Semantic search using vector database
   */
  async semanticSearch(
    query: string,
    category?: string,
    minPrice?: number,
    maxPrice?: number,
    topK: number = 10
  ): Promise<any[]> {
    this.logger.log(`Semantic search: "${query}"`);

    try {
      const results = await this.vectorService.searchByCategoryAndPrice(
        query,
        category,
        minPrice,
        maxPrice,
        topK
      );

      return results.map((result) => ({
        id: result.id,
        score: result.score,
        ...result.metadata,
      }));
    } catch (error: any) {
      this.logger.error(`Semantic search failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Initialize vector database (run on startup)
   */
  async initializeVectorDatabase(): Promise<void> {
    try {
      await this.vectorService.initializeIndex();
      this.logger.log('Vector database initialized successfully');
    } catch (error: any) {
      this.logger.error(`Vector database initialization failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Generate unique search ID
   */
  private generateSearchId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 9);
    return `search_${timestamp}_${random}`;
  }

  /**
   * Get vector database statistics
   */
  async getVectorStats(): Promise<any> {
    try {
      return await this.vectorService.getIndexStats();
    } catch (error: any) {
      this.logger.error(`Failed to get vector stats: ${error.message}`, error.stack);
      throw error;
    }
  }
}
