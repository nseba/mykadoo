/**
 * Feedback Response DTOs
 *
 * Response formats for feedback queries
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FeedbackAction } from './create-feedback.dto';

/**
 * Single feedback item response
 */
export class FeedbackItemDto {
  @ApiProperty({
    description: 'Unique feedback ID',
    example: 'fb_1234567890',
  })
  id: string;

  @ApiProperty({
    description: 'User ID (if authenticated)',
    example: 'user_abc123',
    nullable: true,
  })
  userId: string | null;

  @ApiProperty({
    description: 'Search ID',
    example: 'search_1234567890',
  })
  searchId: string;

  @ApiProperty({
    description: 'Product ID',
    example: 'prod_abc123',
  })
  productId: string;

  @ApiProperty({
    description: 'Feedback action type',
    enum: FeedbackAction,
    example: FeedbackAction.LIKED,
  })
  action: FeedbackAction;

  @ApiPropertyOptional({
    description: 'Rating (1-5 stars)',
    example: 4,
    nullable: true,
  })
  rating: number | null;

  @ApiPropertyOptional({
    description: 'Occasion context',
    example: 'birthday',
    nullable: true,
  })
  occasion: string | null;

  @ApiPropertyOptional({
    description: 'Relationship context',
    example: 'mother',
    nullable: true,
  })
  relationship: string | null;

  @ApiPropertyOptional({
    description: 'Recipient age context',
    example: 'adult',
    nullable: true,
  })
  recipientAge: string | null;

  @ApiPropertyOptional({
    description: 'Search context data',
    nullable: true,
  })
  searchContext: Record<string, any> | null;

  @ApiPropertyOptional({
    description: 'User comment',
    example: 'Perfect gift idea!',
    nullable: true,
  })
  comment: string | null;

  @ApiProperty({
    description: 'Timestamp when feedback was created',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;
}

/**
 * List of feedback items with metadata
 */
export class FeedbackListDto {
  @ApiProperty({
    description: 'Array of feedback items',
    type: [FeedbackItemDto],
  })
  feedback: FeedbackItemDto[];

  @ApiProperty({
    description: 'Total number of feedback items',
    example: 25,
  })
  total: number;

  @ApiProperty({
    description: 'Page number (for pagination)',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Items per page',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Whether there are more pages',
    example: true,
  })
  hasMore: boolean;
}

/**
 * Feedback submission response
 */
export class FeedbackSubmissionResponseDto {
  @ApiProperty({
    description: 'Whether feedback was submitted successfully',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Created feedback item',
    type: FeedbackItemDto,
  })
  feedback: FeedbackItemDto;

  @ApiPropertyOptional({
    description: 'Error message (if failed)',
    example: 'Validation error',
  })
  error?: string;
}
