import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../common/prisma';
import { EmbeddingService } from './embedding.service';
import { SimilaritySearchService } from './similarity-search.service';
import { SemanticSearchService } from './semantic-search.service';
import { UserPreferenceService, UserPreferenceProfile } from './user-preference.service';
import { Embedding, VectorSearchResult } from './interfaces';

/**
 * Recommendation with explanation
 */
export interface RecommendationWithExplanation {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string | null;
  imageUrl?: string | null;
  /** Overall relevance score (0-1) */
  score: number;
  /** Similarity to user preferences (0-1) */
  preferenceScore: number;
  /** Similarity to context/query (0-1) */
  contextScore: number;
  /** Why this item is recommended */
  explanation: RecommendationExplanation;
  /** Diversity contribution (how unique this recommendation is) */
  diversityScore: number;
}

/**
 * Explanation for why an item is recommended
 */
export interface RecommendationExplanation {
  /** Primary reason for recommendation */
  primaryReason: string;
  /** Specific matching factors */
  factors: ExplanationFactor[];
  /** Confidence level (0-1) */
  confidence: number;
}

/**
 * Single explanation factor
 */
export interface ExplanationFactor {
  type: 'category_match' | 'price_range' | 'similar_products' | 'user_history' | 'trending' | 'context_match';
  description: string;
  weight: number;
}

/**
 * Context for recommendations (conversation, recipient, occasion)
 */
export interface RecommendationContext {
  /** User making the request */
  userId?: string;
  /** Session ID for anonymous users */
  sessionId?: string;
  /** Natural language query */
  query?: string;
  /** Gift occasion */
  occasion?: string;
  /** Recipient relationship */
  relationship?: string;
  /** Recipient age range */
  recipientAge?: string;
  /** Recipient gender */
  recipientGender?: string;
  /** Recipient interests */
  recipientInterests?: string[];
  /** Budget range */
  budget?: { min: number; max: number };
  /** Preferred categories */
  categories?: string[];
  /** Products to exclude (already shown/purchased) */
  excludeProductIds?: string[];
  /** Recent conversation context */
  conversationHistory?: string[];
}

/**
 * Options for recommendation generation
 */
export interface RecommendationOptions {
  /** Maximum number of recommendations */
  limit?: number;
  /** Enable personalization based on user history */
  enablePersonalization?: boolean;
  /** Enable diversity in results */
  enableDiversity?: boolean;
  /** Minimum diversity threshold (0-1) */
  diversityThreshold?: number;
  /** Include explanations */
  includeExplanations?: boolean;
  /** Exploration factor (0=exploit, 1=explore) */
  explorationFactor?: number;
}

/**
 * Recommendation engine that combines vector search with personalization,
 * context-awareness, explanations, and diversity
 */
@Injectable()
export class RecommendationEngineService {
  private readonly logger = new Logger(RecommendationEngineService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddingService: EmbeddingService,
    private readonly similarityService: SimilaritySearchService,
    private readonly semanticSearchService: SemanticSearchService,
    private readonly userPreferenceService: UserPreferenceService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  /**
   * Generate personalized recommendations with context and explanations
   */
  async getRecommendations(
    context: RecommendationContext,
    options: RecommendationOptions = {}
  ): Promise<RecommendationWithExplanation[]> {
    const {
      limit = 20,
      enablePersonalization = true,
      enableDiversity = true,
      diversityThreshold = 0.3,
      includeExplanations = true,
      explorationFactor = 0.1,
    } = options;

    try {
      // Step 1: Get user preference profile if personalization enabled
      let userProfile: UserPreferenceProfile | null = null;
      if (enablePersonalization && context.userId) {
        userProfile = await this.userPreferenceService.getUserProfile(context.userId);
      }

      // Step 2: Build context embedding from query and context
      const contextEmbedding = await this.buildContextEmbedding(context);

      // Step 3: Get candidate recommendations from multiple sources
      const candidates = await this.getCandidates(context, contextEmbedding, limit * 3);

      // Step 4: Score candidates based on preference and context
      const scoredCandidates = await this.scoreCandidates(
        candidates,
        userProfile,
        contextEmbedding,
        context
      );

      // Step 5: Apply diversity if enabled
      let finalCandidates = scoredCandidates;
      if (enableDiversity) {
        finalCandidates = this.applyDiversity(
          scoredCandidates,
          diversityThreshold,
          explorationFactor
        );
      }

      // Step 6: Take top results
      const topResults = finalCandidates.slice(0, limit);

      // Step 7: Generate explanations if enabled
      if (includeExplanations) {
        for (const rec of topResults) {
          rec.explanation = this.generateExplanation(rec, userProfile, context);
        }
      }

      // Step 8: Learn from this recommendation session
      if (context.userId && context.query) {
        this.userPreferenceService.learnFromSearch(context.userId, context.query);
      }

      return topResults;
    } catch (error) {
      this.logger.error(`Failed to generate recommendations: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get similar products with explanations
   */
  async getSimilarProducts(
    productId: string,
    context: RecommendationContext,
    options: RecommendationOptions = {}
  ): Promise<RecommendationWithExplanation[]> {
    const { limit = 10, includeExplanations = true } = options;

    try {
      const results = await this.similarityService.findSimilarToProduct(productId, {
        matchCount: limit,
        matchThreshold: 0.5,
        categoryFilter: context.categories?.[0],
        minPrice: context.budget?.min,
        maxPrice: context.budget?.max,
      });

      // Get the source product for explanation
      const sourceProduct = await this.prisma.$queryRaw<[{
        title: string;
        category: string | null;
      }]>`
        SELECT title, category FROM products WHERE id = ${productId}
      `;

      const recommendations: RecommendationWithExplanation[] = results.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        price: r.price,
        category: r.category,
        score: r.similarity,
        preferenceScore: 0,
        contextScore: r.similarity,
        diversityScore: 0,
        explanation: includeExplanations ? {
          primaryReason: `Similar to "${sourceProduct[0]?.title || 'selected product'}"`,
          factors: [
            {
              type: 'similar_products' as const,
              description: `${Math.round(r.similarity * 100)}% similarity match`,
              weight: r.similarity,
            },
            ...(r.category === sourceProduct[0]?.category ? [{
              type: 'category_match' as const,
              description: `Same category: ${r.category}`,
              weight: 0.3,
            }] : []),
          ],
          confidence: r.similarity,
        } : {
          primaryReason: '',
          factors: [],
          confidence: 0,
        },
      }));

      return recommendations;
    } catch (error) {
      this.logger.error(`Failed to get similar products: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get trending recommendations
   */
  async getTrendingRecommendations(
    context: RecommendationContext,
    options: RecommendationOptions = {}
  ): Promise<RecommendationWithExplanation[]> {
    const { limit = 20 } = options;

    try {
      // Get products with high recent interaction counts
      const trending = await this.prisma.$queryRaw<Array<{
        id: string;
        title: string;
        description: string | null;
        price: number;
        category: string | null;
        image_url: string | null;
        interaction_count: bigint;
      }>>`
        SELECT
          p.id,
          p.title,
          p.description,
          p.price,
          p.category,
          p.image_url,
          COUNT(ui.id) as interaction_count
        FROM products p
        LEFT JOIN user_interactions ui ON ui.product_id = p.id
          AND ui.created_at > NOW() - INTERVAL '7 days'
        WHERE p.embedding IS NOT NULL
        ${context.categories?.length ? this.prisma.$queryRaw`AND p.category = ANY(${context.categories}::text[])` : this.prisma.$queryRaw``}
        ${context.budget?.min !== undefined ? this.prisma.$queryRaw`AND p.price >= ${context.budget.min}` : this.prisma.$queryRaw``}
        ${context.budget?.max !== undefined ? this.prisma.$queryRaw`AND p.price <= ${context.budget.max}` : this.prisma.$queryRaw``}
        GROUP BY p.id
        ORDER BY interaction_count DESC
        LIMIT ${limit}
      `;

      const maxCount = Math.max(...trending.map(t => Number(t.interaction_count)), 1);

      return trending.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        price: t.price,
        category: t.category,
        imageUrl: t.image_url,
        score: Number(t.interaction_count) / maxCount,
        preferenceScore: 0,
        contextScore: 0,
        diversityScore: 0,
        explanation: {
          primaryReason: 'Popular this week',
          factors: [{
            type: 'trending' as const,
            description: `${Number(t.interaction_count)} recent interactions`,
            weight: Number(t.interaction_count) / maxCount,
          }],
          confidence: 0.7,
        },
      }));
    } catch (error) {
      this.logger.error(`Failed to get trending recommendations: ${error.message}`);
      return [];
    }
  }

  /**
   * Build context embedding from query and context information
   */
  private async buildContextEmbedding(context: RecommendationContext): Promise<Embedding | null> {
    const contextParts: string[] = [];

    if (context.query) {
      contextParts.push(context.query);
    }

    if (context.occasion) {
      contextParts.push(`Gift for ${context.occasion}`);
    }

    if (context.relationship) {
      contextParts.push(`For ${context.relationship}`);
    }

    if (context.recipientInterests?.length) {
      contextParts.push(`Interests: ${context.recipientInterests.join(', ')}`);
    }

    if (context.recipientAge) {
      contextParts.push(`Age: ${context.recipientAge}`);
    }

    if (context.conversationHistory?.length) {
      // Add recent conversation context
      const recentContext = context.conversationHistory.slice(-3).join('. ');
      contextParts.push(recentContext);
    }

    if (contextParts.length === 0) {
      return null;
    }

    const contextText = contextParts.join('. ');
    const response = await this.embeddingService.generateQueryEmbedding(contextText);
    return response.embedding;
  }

  /**
   * Get candidate recommendations from multiple sources
   */
  private async getCandidates(
    context: RecommendationContext,
    contextEmbedding: Embedding | null,
    limit: number
  ): Promise<VectorSearchResult[]> {
    const candidates: VectorSearchResult[] = [];

    // Source 1: Semantic search if we have a context embedding
    if (contextEmbedding) {
      const semanticResults = await this.similarityService.findSimilarProducts(contextEmbedding, {
        matchCount: limit,
        matchThreshold: 0.3,
        categoryFilter: context.categories?.[0],
        minPrice: context.budget?.min,
        maxPrice: context.budget?.max,
      });
      candidates.push(...semanticResults);
    }

    // Source 2: User preference-based if we have a user
    if (context.userId) {
      const prefResults = await this.similarityService.getPersonalizedRecommendations(
        context.userId,
        Math.floor(limit / 2)
      );
      candidates.push(...prefResults);
    }

    // Deduplicate by ID
    const seen = new Set<string>();
    return candidates.filter(c => {
      if (seen.has(c.id)) return false;
      if (context.excludeProductIds?.includes(c.id)) return false;
      seen.add(c.id);
      return true;
    });
  }

  /**
   * Score candidates based on preference and context
   */
  private async scoreCandidates(
    candidates: VectorSearchResult[],
    userProfile: UserPreferenceProfile | null,
    contextEmbedding: Embedding | null,
    context: RecommendationContext
  ): Promise<RecommendationWithExplanation[]> {
    const scored: RecommendationWithExplanation[] = [];

    for (const candidate of candidates) {
      let preferenceScore = 0;
      let contextScore = candidate.similarity;

      // Calculate preference score if we have user profile
      if (userProfile?.preferenceEmbedding) {
        // Get product embedding
        const productEmbed = await this.prisma.$queryRaw<[{ embedding: string | null }]>`
          SELECT embedding::text FROM products WHERE id = ${candidate.id}
        `;

        if (productEmbed[0]?.embedding) {
          const prodEmbedding = this.embeddingService.fromVectorString(productEmbed[0].embedding);
          preferenceScore = this.similarityService.calculateSimilarity(
            userProfile.preferenceEmbedding,
            prodEmbedding
          );

          // Boost for matching top categories
          if (candidate.category && userProfile.topCategories.some(c => c.category === candidate.category)) {
            preferenceScore = Math.min(1, preferenceScore + 0.1);
          }

          // Boost for price in user's typical range
          if (candidate.price >= userProfile.priceRange.min * 0.8 &&
              candidate.price <= userProfile.priceRange.max * 1.2) {
            preferenceScore = Math.min(1, preferenceScore + 0.05);
          }
        }
      }

      // Boost context score for matching interests
      if (context.recipientInterests?.length && candidate.description) {
        const descLower = candidate.description.toLowerCase();
        const matchCount = context.recipientInterests.filter(
          i => descLower.includes(i.toLowerCase())
        ).length;
        contextScore = Math.min(1, contextScore + matchCount * 0.1);
      }

      // Combined score (weighted average)
      const prefWeight = userProfile ? 0.4 : 0;
      const contextWeight = 1 - prefWeight;
      const combinedScore = preferenceScore * prefWeight + contextScore * contextWeight;

      scored.push({
        id: candidate.id,
        title: candidate.title,
        description: candidate.description,
        price: candidate.price,
        category: candidate.category,
        score: combinedScore,
        preferenceScore,
        contextScore,
        diversityScore: 0, // Will be calculated in diversity step
        explanation: {
          primaryReason: '',
          factors: [],
          confidence: 0,
        },
      });
    }

    // Sort by combined score
    scored.sort((a, b) => b.score - a.score);

    return scored;
  }

  /**
   * Apply diversity to avoid filter bubbles
   * Uses Maximal Marginal Relevance (MMR) algorithm
   */
  private applyDiversity(
    candidates: RecommendationWithExplanation[],
    diversityThreshold: number,
    explorationFactor: number
  ): RecommendationWithExplanation[] {
    if (candidates.length <= 1) return candidates;

    const selected: RecommendationWithExplanation[] = [];
    const remaining = [...candidates];

    // Always include the top result
    const first = remaining.shift()!;
    first.diversityScore = 1;
    selected.push(first);

    // MMR selection for remaining items
    while (remaining.length > 0 && selected.length < candidates.length) {
      let bestIdx = 0;
      let bestMMR = -Infinity;

      for (let i = 0; i < remaining.length; i++) {
        const candidate = remaining[i];

        // Calculate max similarity to already selected items
        let maxSimilarity = 0;
        for (const sel of selected) {
          const sim = this.calculateCategorySimilarity(candidate, sel);
          maxSimilarity = Math.max(maxSimilarity, sim);
        }

        // MMR formula: λ * relevance - (1 - λ) * max_similarity
        const lambda = 1 - diversityThreshold - explorationFactor;
        const mmr = lambda * candidate.score - (1 - lambda) * maxSimilarity;

        // Add random exploration factor
        const explorationBonus = Math.random() * explorationFactor;
        const finalMMR = mmr + explorationBonus;

        if (finalMMR > bestMMR) {
          bestMMR = finalMMR;
          bestIdx = i;
        }
      }

      const selected_item = remaining.splice(bestIdx, 1)[0];
      selected_item.diversityScore = 1 - this.calculateMaxSimilarity(selected_item, selected);
      selected.push(selected_item);
    }

    return selected;
  }

  /**
   * Calculate category-based similarity between two items
   */
  private calculateCategorySimilarity(
    a: RecommendationWithExplanation,
    b: RecommendationWithExplanation
  ): number {
    let similarity = 0;

    // Same category = high similarity
    if (a.category && b.category && a.category === b.category) {
      similarity += 0.5;
    }

    // Similar price range = some similarity
    const priceRatio = Math.min(a.price, b.price) / Math.max(a.price, b.price);
    similarity += priceRatio * 0.3;

    return similarity;
  }

  /**
   * Calculate max similarity to selected items
   */
  private calculateMaxSimilarity(
    item: RecommendationWithExplanation,
    selected: RecommendationWithExplanation[]
  ): number {
    let maxSim = 0;
    for (const sel of selected) {
      maxSim = Math.max(maxSim, this.calculateCategorySimilarity(item, sel));
    }
    return maxSim;
  }

  /**
   * Generate explanation for a recommendation
   */
  private generateExplanation(
    rec: RecommendationWithExplanation,
    userProfile: UserPreferenceProfile | null,
    context: RecommendationContext
  ): RecommendationExplanation {
    const factors: ExplanationFactor[] = [];
    let primaryReason = '';

    // Preference-based factors
    if (rec.preferenceScore > 0.5 && userProfile) {
      const matchingCategory = userProfile.topCategories.find(c => c.category === rec.category);
      if (matchingCategory) {
        factors.push({
          type: 'user_history',
          description: `Matches your interest in ${rec.category}`,
          weight: matchingCategory.score / 10,
        });
      }

      if (rec.price >= userProfile.priceRange.min && rec.price <= userProfile.priceRange.max) {
        factors.push({
          type: 'price_range',
          description: 'In your typical price range',
          weight: 0.2,
        });
      }
    }

    // Context-based factors
    if (rec.contextScore > 0.6) {
      if (context.query) {
        factors.push({
          type: 'context_match',
          description: `Matches your search for "${context.query.substring(0, 30)}..."`,
          weight: rec.contextScore,
        });
      }

      if (context.occasion) {
        factors.push({
          type: 'context_match',
          description: `Great for ${context.occasion}`,
          weight: 0.3,
        });
      }

      if (context.recipientInterests?.length) {
        const matchingInterests = context.recipientInterests.filter(
          i => rec.description?.toLowerCase().includes(i.toLowerCase())
        );
        if (matchingInterests.length > 0) {
          factors.push({
            type: 'context_match',
            description: `Matches interests: ${matchingInterests.join(', ')}`,
            weight: 0.4,
          });
        }
      }
    }

    // Category match
    if (context.categories?.includes(rec.category || '')) {
      factors.push({
        type: 'category_match',
        description: `In requested category: ${rec.category}`,
        weight: 0.3,
      });
    }

    // Determine primary reason
    if (factors.length > 0) {
      // Sort by weight and pick the highest
      factors.sort((a, b) => b.weight - a.weight);
      primaryReason = factors[0].description;
    } else {
      primaryReason = 'Popular gift choice';
    }

    // Calculate confidence based on scores
    const confidence = Math.max(rec.preferenceScore, rec.contextScore, 0.5);

    return {
      primaryReason,
      factors: factors.slice(0, 4), // Limit to top 4 factors
      confidence,
    };
  }
}
