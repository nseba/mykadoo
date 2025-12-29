import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../common/prisma';
import { EmbeddingService } from './embedding.service';
import { Embedding } from './interfaces';

/**
 * User interaction type for preference learning
 */
export enum InteractionType {
  VIEW = 'view',
  CLICK = 'click',
  ADD_TO_CART = 'add_to_cart',
  PURCHASE = 'purchase',
  SAVE = 'save',
  SEARCH = 'search',
}

/**
 * Interaction weight for preference calculation
 */
const INTERACTION_WEIGHTS: Record<InteractionType, number> = {
  [InteractionType.VIEW]: 0.1,
  [InteractionType.CLICK]: 0.3,
  [InteractionType.ADD_TO_CART]: 0.5,
  [InteractionType.PURCHASE]: 1.0,
  [InteractionType.SAVE]: 0.7,
  [InteractionType.SEARCH]: 0.2,
};

/**
 * User interaction event
 */
export interface UserInteraction {
  userId: string;
  productId?: string;
  searchQuery?: string;
  interactionType: InteractionType;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

/**
 * User preference profile
 */
export interface UserPreferenceProfile {
  userId: string;
  preferenceEmbedding: Embedding | null;
  interactionCount: number;
  lastUpdated: Date;
  topCategories: Array<{ category: string; score: number }>;
  priceRange: { min: number; max: number; avg: number };
}

/**
 * Service for managing user preference vectors
 * Aggregates user behavior into preference embeddings for personalization
 */
@Injectable()
export class UserPreferenceService {
  private readonly logger = new Logger(UserPreferenceService.name);
  private readonly cachePrefix = 'user:pref:';
  private readonly cacheTtl = 1800; // 30 minutes

  // Time decay factor (older interactions have less weight)
  private readonly decayHalfLifeDays = 30;

  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddingService: EmbeddingService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  /**
   * Record a user interaction for preference learning
   */
  async recordInteraction(interaction: UserInteraction): Promise<void> {
    try {
      await this.prisma.$executeRaw`
        INSERT INTO user_interactions (
          user_id,
          product_id,
          search_query,
          interaction_type,
          metadata,
          created_at
        ) VALUES (
          ${interaction.userId},
          ${interaction.productId || null},
          ${interaction.searchQuery || null},
          ${interaction.interactionType},
          ${interaction.metadata ? JSON.stringify(interaction.metadata) : null}::jsonb,
          ${interaction.timestamp}
        )
      `;

      // Invalidate cache for this user
      await this.cacheManager.del(`${this.cachePrefix}${interaction.userId}`);

      this.logger.debug(
        `Recorded ${interaction.interactionType} interaction for user ${interaction.userId}`
      );
    } catch (error) {
      this.logger.error(`Failed to record interaction: ${error.message}`);
    }
  }

  /**
   * Update user preference embedding based on recent interactions
   */
  async updateUserPreferences(userId: string): Promise<void> {
    try {
      // Get recent interactions with product embeddings
      const interactions = await this.prisma.$queryRaw<Array<{
        product_id: string;
        interaction_type: string;
        created_at: Date;
        embedding: string | null;
      }>>`
        SELECT
          ui.product_id,
          ui.interaction_type,
          ui.created_at,
          p.embedding::text
        FROM user_interactions ui
        LEFT JOIN products p ON p.id = ui.product_id
        WHERE ui.user_id = ${userId}
        AND ui.created_at > NOW() - INTERVAL '90 days'
        AND p.embedding IS NOT NULL
        ORDER BY ui.created_at DESC
        LIMIT 100
      `;

      if (interactions.length === 0) {
        this.logger.debug(`No interactions with embeddings found for user ${userId}`);
        return;
      }

      // Calculate weighted average of product embeddings
      const now = new Date();
      let totalWeight = 0;
      const weightedEmbedding: number[] = new Array(1536).fill(0);

      for (const interaction of interactions) {
        if (!interaction.embedding) continue;

        const embedding = this.embeddingService.fromVectorString(interaction.embedding);
        const interactionWeight = INTERACTION_WEIGHTS[interaction.interaction_type as InteractionType] || 0.1;
        const timeDecay = this.calculateTimeDecay(interaction.created_at, now);
        const weight = interactionWeight * timeDecay;

        totalWeight += weight;

        for (let i = 0; i < embedding.length; i++) {
          weightedEmbedding[i] += embedding[i] * weight;
        }
      }

      // Normalize the weighted embedding
      if (totalWeight > 0) {
        for (let i = 0; i < weightedEmbedding.length; i++) {
          weightedEmbedding[i] /= totalWeight;
        }

        // Normalize to unit vector
        const norm = Math.sqrt(weightedEmbedding.reduce((sum, v) => sum + v * v, 0));
        if (norm > 0) {
          for (let i = 0; i < weightedEmbedding.length; i++) {
            weightedEmbedding[i] /= norm;
          }
        }

        // Store the updated preference embedding
        const vectorString = this.embeddingService.toVectorString(weightedEmbedding);

        await this.prisma.$executeRaw`
          INSERT INTO user_profiles (user_id, preference_embedding, updated_at)
          VALUES (${userId}, ${vectorString}::vector(1536), NOW())
          ON CONFLICT (user_id)
          DO UPDATE SET
            preference_embedding = ${vectorString}::vector(1536),
            updated_at = NOW()
        `;

        // Invalidate cache
        await this.cacheManager.del(`${this.cachePrefix}${userId}`);

        this.logger.log(
          `Updated preference embedding for user ${userId} from ${interactions.length} interactions`
        );
      }
    } catch (error) {
      this.logger.error(`Failed to update user preferences: ${error.message}`);
    }
  }

  /**
   * Get user preference profile
   */
  async getUserProfile(userId: string): Promise<UserPreferenceProfile | null> {
    // Check cache
    const cacheKey = `${this.cachePrefix}${userId}`;
    const cached = await this.cacheManager.get<UserPreferenceProfile>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Get preference embedding
      const profile = await this.prisma.$queryRaw<[{
        preference_embedding: string | null;
        updated_at: Date | null;
      }]>`
        SELECT preference_embedding::text, updated_at
        FROM user_profiles
        WHERE user_id = ${userId}
      `;

      // Get interaction count
      const interactionCount = await this.prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count
        FROM user_interactions
        WHERE user_id = ${userId}
      `;

      // Get top categories
      const topCategories = await this.prisma.$queryRaw<Array<{
        category: string;
        score: number;
      }>>`
        SELECT
          p.category,
          SUM(
            CASE ui.interaction_type
              WHEN 'purchase' THEN 1.0
              WHEN 'add_to_cart' THEN 0.5
              WHEN 'save' THEN 0.7
              WHEN 'click' THEN 0.3
              ELSE 0.1
            END
          )::float as score
        FROM user_interactions ui
        JOIN products p ON p.id = ui.product_id
        WHERE ui.user_id = ${userId}
        AND p.category IS NOT NULL
        GROUP BY p.category
        ORDER BY score DESC
        LIMIT 5
      `;

      // Get price range preferences
      const priceRange = await this.prisma.$queryRaw<[{
        min_price: number | null;
        max_price: number | null;
        avg_price: number | null;
      }]>`
        SELECT
          MIN(p.price)::float as min_price,
          MAX(p.price)::float as max_price,
          AVG(p.price)::float as avg_price
        FROM user_interactions ui
        JOIN products p ON p.id = ui.product_id
        WHERE ui.user_id = ${userId}
        AND ui.interaction_type IN ('purchase', 'add_to_cart', 'click')
      `;

      const result: UserPreferenceProfile = {
        userId,
        preferenceEmbedding: profile[0]?.preference_embedding
          ? this.embeddingService.fromVectorString(profile[0].preference_embedding)
          : null,
        interactionCount: Number(interactionCount[0]?.count || 0),
        lastUpdated: profile[0]?.updated_at || new Date(),
        topCategories: topCategories.map(c => ({
          category: c.category,
          score: c.score,
        })),
        priceRange: {
          min: priceRange[0]?.min_price || 0,
          max: priceRange[0]?.max_price || 1000,
          avg: priceRange[0]?.avg_price || 50,
        },
      };

      // Cache the result
      await this.cacheManager.set(cacheKey, result, this.cacheTtl);

      return result;
    } catch (error) {
      this.logger.error(`Failed to get user profile: ${error.message}`);
      return null;
    }
  }

  /**
   * Get similar users based on preference embeddings
   */
  async getSimilarUsers(
    userId: string,
    limit: number = 10
  ): Promise<Array<{ userId: string; similarity: number }>> {
    try {
      // Get the user's preference embedding
      const userProfile = await this.prisma.$queryRaw<[{
        preference_embedding: string | null;
      }]>`
        SELECT preference_embedding::text
        FROM user_profiles
        WHERE user_id = ${userId}
      `;

      if (!userProfile[0]?.preference_embedding) {
        return [];
      }

      const userEmbedding = userProfile[0].preference_embedding;

      // Find similar users
      const similarUsers = await this.prisma.$queryRaw<Array<{
        user_id: string;
        similarity: number;
      }>>`
        SELECT
          user_id,
          (1 - (preference_embedding <=> ${userEmbedding}::vector(1536)))::float as similarity
        FROM user_profiles
        WHERE user_id != ${userId}
        AND preference_embedding IS NOT NULL
        ORDER BY preference_embedding <=> ${userEmbedding}::vector(1536)
        LIMIT ${limit}
      `;

      return similarUsers.map(u => ({
        userId: u.user_id,
        similarity: u.similarity,
      }));
    } catch (error) {
      this.logger.error(`Failed to get similar users: ${error.message}`);
      return [];
    }
  }

  /**
   * Merge search query into user preferences
   */
  async learnFromSearch(userId: string, searchQuery: string): Promise<void> {
    try {
      // Generate embedding for search query
      const response = await this.embeddingService.generateQueryEmbedding(searchQuery);
      const queryEmbedding = response.embedding;

      // Get current user preference embedding
      const profile = await this.getUserProfile(userId);

      if (!profile?.preferenceEmbedding) {
        // No existing preference, use search query as initial preference
        const vectorString = this.embeddingService.toVectorString(queryEmbedding);

        await this.prisma.$executeRaw`
          INSERT INTO user_profiles (user_id, preference_embedding, updated_at)
          VALUES (${userId}, ${vectorString}::vector(1536), NOW())
          ON CONFLICT (user_id)
          DO UPDATE SET
            preference_embedding = ${vectorString}::vector(1536),
            updated_at = NOW()
        `;
      } else {
        // Blend search query into existing preferences (20% search, 80% existing)
        const searchWeight = 0.2;
        const blendedEmbedding = profile.preferenceEmbedding.map(
          (v, i) => v * (1 - searchWeight) + queryEmbedding[i] * searchWeight
        );

        // Normalize
        const norm = Math.sqrt(blendedEmbedding.reduce((sum, v) => sum + v * v, 0));
        const normalizedEmbedding = blendedEmbedding.map(v => v / norm);

        const vectorString = this.embeddingService.toVectorString(normalizedEmbedding);

        await this.prisma.$executeRaw`
          UPDATE user_profiles
          SET preference_embedding = ${vectorString}::vector(1536), updated_at = NOW()
          WHERE user_id = ${userId}
        `;
      }

      // Invalidate cache
      await this.cacheManager.del(`${this.cachePrefix}${userId}`);

      // Record the search interaction
      await this.recordInteraction({
        userId,
        searchQuery,
        interactionType: InteractionType.SEARCH,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error(`Failed to learn from search: ${error.message}`);
    }
  }

  /**
   * Calculate time decay factor
   */
  private calculateTimeDecay(interactionDate: Date, now: Date): number {
    const daysDiff = (now.getTime() - interactionDate.getTime()) / (1000 * 60 * 60 * 24);
    return Math.exp(-Math.LN2 * daysDiff / this.decayHalfLifeDays);
  }
}
