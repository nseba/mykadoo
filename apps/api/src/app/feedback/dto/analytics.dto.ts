/**
 * Analytics DTOs
 *
 * Response formats for analytics and pattern data
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FeedbackAction } from './create-feedback.dto';

/**
 * Analytics by action type
 */
export class ActionAnalyticsDto {
  @ApiProperty({
    description: 'Feedback action type',
    enum: FeedbackAction,
    example: FeedbackAction.CLICKED,
  })
  action: FeedbackAction;

  @ApiProperty({
    description: 'Number of occurrences',
    example: 245,
  })
  count: number;

  @ApiProperty({
    description: 'Percentage of total feedback',
    example: 12.5,
  })
  percentage: number;
}

/**
 * Category performance analytics
 */
export class CategoryAnalyticsDto {
  @ApiProperty({
    description: 'Product category',
    example: 'electronics',
  })
  category: string;

  @ApiProperty({
    description: 'Number of views',
    example: 1250,
  })
  views: number;

  @ApiProperty({
    description: 'Number of clicks',
    example: 325,
  })
  clicks: number;

  @ApiProperty({
    description: 'Number of purchases',
    example: 45,
  })
  purchases: number;

  @ApiProperty({
    description: 'Click-through rate (percentage)',
    example: 26.0,
  })
  ctr: number;

  @ApiProperty({
    description: 'Conversion rate (percentage)',
    example: 13.8,
  })
  conversionRate: number;

  @ApiProperty({
    description: 'Average rating (1-5 stars)',
    example: 4.2,
  })
  avgRating: number;
}

/**
 * Overall analytics summary
 */
export class AnalyticsSummaryDto {
  @ApiProperty({
    description: 'Total number of feedback items',
    example: 1960,
  })
  totalFeedback: number;

  @ApiProperty({
    description: 'Total unique users',
    example: 432,
  })
  uniqueUsers: number;

  @ApiProperty({
    description: 'Total unique searches',
    example: 856,
  })
  uniqueSearches: number;

  @ApiProperty({
    description: 'Overall click-through rate (percentage)',
    example: 18.5,
  })
  overallCtr: number;

  @ApiProperty({
    description: 'Overall conversion rate (percentage)',
    example: 8.2,
  })
  overallConversionRate: number;

  @ApiProperty({
    description: 'Average rating across all feedback (1-5 stars)',
    example: 3.8,
  })
  avgRating: number;

  @ApiProperty({
    description: 'Breakdown by action type',
    type: [ActionAnalyticsDto],
  })
  byAction: ActionAnalyticsDto[];

  @ApiProperty({
    description: 'Performance by category',
    type: [CategoryAnalyticsDto],
  })
  byCategory: CategoryAnalyticsDto[];

  @ApiProperty({
    description: 'Date range for analytics',
    example: {
      start: '2024-01-01T00:00:00Z',
      end: '2024-01-31T23:59:59Z',
    },
  })
  dateRange: {
    start: Date;
    end: Date;
  };
}

/**
 * Learned recommendation pattern
 */
export class RecommendationPatternDto {
  @ApiProperty({
    description: 'Unique pattern ID',
    example: 'pattern_abc123',
  })
  id: string;

  @ApiProperty({
    description: 'Pattern description',
    example: 'Users searching for birthday gifts for mothers aged 50-60 prefer practical items',
  })
  pattern: string;

  @ApiProperty({
    description: 'Confidence score (0-1)',
    example: 0.85,
  })
  confidence: number;

  @ApiProperty({
    description: 'Number of times this pattern has been applied',
    example: 127,
  })
  usageCount: number;

  @ApiPropertyOptional({
    description: 'Pattern metadata (parameters, filters, etc.)',
    example: {
      occasion: 'birthday',
      relationship: 'mother',
      ageRange: '50-60',
      preferredCategories: ['home', 'kitchen', 'wellness'],
    },
  })
  metadata: Record<string, any> | null;

  @ApiProperty({
    description: 'When pattern was discovered',
    example: '2024-01-10T15:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last time pattern was updated',
    example: '2024-01-20T09:15:00Z',
  })
  updatedAt: Date;
}

/**
 * List of learned patterns
 */
export class PatternsListDto {
  @ApiProperty({
    description: 'Array of learned patterns',
    type: [RecommendationPatternDto],
  })
  patterns: RecommendationPatternDto[];

  @ApiProperty({
    description: 'Total number of patterns',
    example: 45,
  })
  total: number;

  @ApiProperty({
    description: 'Minimum confidence threshold used',
    example: 0.7,
  })
  minConfidence: number;
}
