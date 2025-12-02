/**
 * Feedback Service
 *
 * Manages user feedback, analytics, and learning from user interactions
 */

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  CreateFeedbackDto,
  FeedbackAction,
  FeedbackItemDto,
  FeedbackListDto,
  FeedbackSubmissionResponseDto,
  AnalyticsSummaryDto,
  ActionAnalyticsDto,
  CategoryAnalyticsDto,
  RecommendationPatternDto,
  PatternsListDto,
} from './dto';

/**
 * Feedback Service
 *
 * Handles feedback submission, retrieval, analytics, and pattern learning
 */
@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  // NOTE: Prisma client will be injected once migrations are run
  // private prisma: PrismaClient;

  // Temporary in-memory storage for demonstration
  private feedbackStore: Map<string, FeedbackItemDto> = new Map();
  private patternStore: Map<string, RecommendationPatternDto> = new Map();

  constructor() {
    // this.prisma = new PrismaClient();
    this.initializeMockPatterns();
  }

  /**
   * Initialize some mock patterns for demonstration
   */
  private initializeMockPatterns() {
    const mockPatterns: RecommendationPatternDto[] = [
      {
        id: 'pattern_001',
        pattern:
          'Users searching for birthday gifts for mothers aged 50-60 prefer practical home items',
        confidence: 0.87,
        usageCount: 143,
        metadata: {
          occasion: 'birthday',
          relationship: 'mother',
          ageRange: '50-60',
          preferredCategories: ['home', 'kitchen', 'wellness'],
        },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-20'),
      },
      {
        id: 'pattern_002',
        pattern:
          'Tech gifts for young adults (18-25) have higher engagement when budget exceeds $100',
        confidence: 0.92,
        usageCount: 287,
        metadata: {
          ageRange: '18-25',
          category: 'electronics',
          budgetThreshold: 100,
        },
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-22'),
      },
      {
        id: 'pattern_003',
        pattern:
          'Anniversary gifts for spouses show strong preference for experiences over physical items',
        confidence: 0.78,
        usageCount: 95,
        metadata: {
          occasion: 'anniversary',
          relationship: 'spouse',
          preferredTypes: ['experience', 'travel', 'dining'],
        },
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-25'),
      },
    ];

    mockPatterns.forEach((pattern) => {
      this.patternStore.set(pattern.id, pattern);
    });
  }

  /**
   * Submit user feedback
   */
  async submitFeedback(
    dto: CreateFeedbackDto
  ): Promise<FeedbackSubmissionResponseDto> {
    try {
      // NOTE: Replace with Prisma create after migrations
      const feedbackId = `fb_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      const feedbackItem: FeedbackItemDto = {
        id: feedbackId,
        userId: dto.userId || null,
        searchId: dto.searchId,
        productId: dto.productId,
        action: dto.action,
        rating: dto.rating || null,
        occasion: dto.occasion || null,
        relationship: dto.relationship || null,
        recipientAge: dto.recipientAge || null,
        searchContext: dto.searchContext || null,
        comment: dto.comment || null,
        createdAt: new Date(),
      };

      this.feedbackStore.set(feedbackId, feedbackItem);

      this.logger.log(
        `Feedback submitted: ${dto.action} for product ${dto.productId} (search: ${dto.searchId})`
      );

      // Trigger pattern learning in background (would be async job in production)
      this.updatePatternsFromFeedback(feedbackItem);

      return {
        success: true,
        feedback: feedbackItem,
      };
    } catch (error: any) {
      this.logger.error(`Failed to submit feedback: ${error.message}`, error.stack);
      return {
        success: false,
        feedback: null as any,
        error: error.message || 'Failed to submit feedback',
      };
    }
  }

  /**
   * Get feedback for a specific search
   */
  async getFeedbackBySearch(
    searchId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<FeedbackListDto> {
    // NOTE: Replace with Prisma query after migrations
    const allFeedback = Array.from(this.feedbackStore.values()).filter(
      (fb) => fb.searchId === searchId
    );

    const total = allFeedback.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedFeedback = allFeedback.slice(startIndex, endIndex);

    return {
      feedback: paginatedFeedback,
      total,
      page,
      limit,
      hasMore: endIndex < total,
    };
  }

  /**
   * Get feedback for a specific product
   */
  async getFeedbackByProduct(
    productId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<FeedbackListDto> {
    // NOTE: Replace with Prisma query after migrations
    const allFeedback = Array.from(this.feedbackStore.values()).filter(
      (fb) => fb.productId === productId
    );

    const total = allFeedback.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedFeedback = allFeedback.slice(startIndex, endIndex);

    return {
      feedback: paginatedFeedback,
      total,
      page,
      limit,
      hasMore: endIndex < total,
    };
  }

  /**
   * Get analytics summary
   */
  async getAnalytics(
    startDate?: Date,
    endDate?: Date
  ): Promise<AnalyticsSummaryDto> {
    // NOTE: Replace with Prisma aggregations after migrations
    const allFeedback = Array.from(this.feedbackStore.values());

    // Filter by date range if provided
    let filteredFeedback = allFeedback;
    if (startDate || endDate) {
      filteredFeedback = allFeedback.filter((fb) => {
        if (startDate && fb.createdAt < startDate) return false;
        if (endDate && fb.createdAt > endDate) return false;
        return true;
      });
    }

    const totalFeedback = filteredFeedback.length;
    const uniqueUsers = new Set(
      filteredFeedback.filter((fb) => fb.userId).map((fb) => fb.userId)
    ).size;
    const uniqueSearches = new Set(filteredFeedback.map((fb) => fb.searchId)).size;

    // Calculate action breakdown
    const actionCounts = new Map<FeedbackAction, number>();
    filteredFeedback.forEach((fb) => {
      actionCounts.set(fb.action, (actionCounts.get(fb.action) || 0) + 1);
    });

    const byAction: ActionAnalyticsDto[] = Array.from(actionCounts.entries()).map(
      ([action, count]) => ({
        action,
        count,
        percentage: (count / totalFeedback) * 100,
      })
    );

    // Calculate CTR and conversion rate
    const views = actionCounts.get(FeedbackAction.VIEWED) || 0;
    const clicks = actionCounts.get(FeedbackAction.CLICKED) || 0;
    const purchases = actionCounts.get(FeedbackAction.PURCHASED) || 0;

    const overallCtr = views > 0 ? (clicks / views) * 100 : 0;
    const overallConversionRate = clicks > 0 ? (purchases / clicks) * 100 : 0;

    // Calculate average rating
    const ratings = filteredFeedback
      .filter((fb) => fb.rating !== null)
      .map((fb) => fb.rating as number);
    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      : 0;

    // Mock category analytics (would be joined with product data in real implementation)
    const byCategory: CategoryAnalyticsDto[] = this.calculateCategoryAnalytics(
      filteredFeedback
    );

    const dateRange = {
      start: startDate || new Date(Math.min(...allFeedback.map((fb) => fb.createdAt.getTime()))),
      end: endDate || new Date(Math.max(...allFeedback.map((fb) => fb.createdAt.getTime()))),
    };

    return {
      totalFeedback,
      uniqueUsers,
      uniqueSearches,
      overallCtr,
      overallConversionRate,
      avgRating,
      byAction,
      byCategory,
      dateRange,
    };
  }

  /**
   * Calculate analytics by category (mock implementation)
   */
  private calculateCategoryAnalytics(
    feedback: FeedbackItemDto[]
  ): CategoryAnalyticsDto[] {
    // NOTE: In production, this would join with product data to get categories
    // For now, return mock data based on common categories
    const mockCategories = ['electronics', 'home', 'fashion', 'books', 'toys'];

    return mockCategories.map((category) => {
      // Randomly distribute feedback across categories for demo
      const categoryFeedback = feedback.filter(
        (fb) => Math.random() > 0.7 // Mock filter
      );

      const views = categoryFeedback.filter((fb) => fb.action === FeedbackAction.VIEWED).length;
      const clicks = categoryFeedback.filter((fb) => fb.action === FeedbackAction.CLICKED).length;
      const purchases = categoryFeedback.filter(
        (fb) => fb.action === FeedbackAction.PURCHASED
      ).length;

      const ctr = views > 0 ? (clicks / views) * 100 : 0;
      const conversionRate = clicks > 0 ? (purchases / clicks) * 100 : 0;

      const categoryRatings = categoryFeedback
        .filter((fb) => fb.rating !== null)
        .map((fb) => fb.rating as number);
      const avgRating = categoryRatings.length > 0
        ? categoryRatings.reduce((sum, r) => sum + r, 0) / categoryRatings.length
        : 0;

      return {
        category,
        views,
        clicks,
        purchases,
        ctr,
        conversionRate,
        avgRating,
      };
    });
  }

  /**
   * Get learned recommendation patterns
   */
  async getPatterns(minConfidence: number = 0.7): Promise<PatternsListDto> {
    // NOTE: Replace with Prisma query after migrations
    const allPatterns = Array.from(this.patternStore.values());

    const filteredPatterns = allPatterns
      .filter((p) => p.confidence >= minConfidence)
      .sort((a, b) => b.confidence - a.confidence);

    return {
      patterns: filteredPatterns,
      total: filteredPatterns.length,
      minConfidence,
    };
  }

  /**
   * Update patterns based on new feedback (simplified learning)
   */
  private async updatePatternsFromFeedback(feedback: FeedbackItemDto): Promise<void> {
    // NOTE: In production, this would use ML algorithms to discover patterns
    // For now, simple rule-based pattern updates

    try {
      // Example: If user purchased, strengthen related patterns
      if (feedback.action === FeedbackAction.PURCHASED && feedback.searchContext) {
        const context = feedback.searchContext as any;

        // Find or create pattern
        const patternKey = `${context.occasion}_${context.relationship}_${context.ageRange}`;
        const existingPattern = Array.from(this.patternStore.values()).find(
          (p) =>
            p.metadata?.occasion === context.occasion &&
            p.metadata?.relationship === context.relationship
        );

        if (existingPattern) {
          // Strengthen existing pattern
          existingPattern.usageCount += 1;
          existingPattern.confidence = Math.min(
            0.99,
            existingPattern.confidence + 0.01
          );
          existingPattern.updatedAt = new Date();
          this.patternStore.set(existingPattern.id, existingPattern);

          this.logger.log(
            `Updated pattern ${existingPattern.id} (confidence: ${existingPattern.confidence.toFixed(2)})`
          );
        }
      }
    } catch (error: any) {
      this.logger.warn(`Pattern update failed: ${error.message}`);
      // Don't throw - pattern learning is non-critical
    }
  }

  /**
   * Get feedback statistics for a user
   */
  async getUserStats(userId: string): Promise<{
    totalFeedback: number;
    byAction: Record<FeedbackAction, number>;
    avgRating: number;
  }> {
    // NOTE: Replace with Prisma aggregation after migrations
    const userFeedback = Array.from(this.feedbackStore.values()).filter(
      (fb) => fb.userId === userId
    );

    const byAction: Record<FeedbackAction, number> = {
      [FeedbackAction.VIEWED]: 0,
      [FeedbackAction.SAVED]: 0,
      [FeedbackAction.PURCHASED]: 0,
      [FeedbackAction.DISMISSED]: 0,
      [FeedbackAction.LIKED]: 0,
      [FeedbackAction.DISLIKED]: 0,
      [FeedbackAction.CLICKED]: 0,
    };

    userFeedback.forEach((fb) => {
      byAction[fb.action] = (byAction[fb.action] || 0) + 1;
    });

    const ratings = userFeedback
      .filter((fb) => fb.rating !== null)
      .map((fb) => fb.rating as number);
    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      : 0;

    return {
      totalFeedback: userFeedback.length,
      byAction,
      avgRating,
    };
  }
}
