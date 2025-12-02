/**
 * Create Feedback DTO
 *
 * Validation for submitting user feedback on search results
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsObject,
  IsUUID,
} from 'class-validator';

/**
 * Feedback action types
 */
export enum FeedbackAction {
  VIEWED = 'VIEWED',
  SAVED = 'SAVED',
  PURCHASED = 'PURCHASED',
  DISMISSED = 'DISMISSED',
  LIKED = 'LIKED',
  DISLIKED = 'DISLIKED',
  CLICKED = 'CLICKED',
}

/**
 * DTO for creating user feedback
 */
export class CreateFeedbackDto {
  @ApiProperty({
    description: 'ID of the search that generated this recommendation',
    example: 'search_1234567890',
  })
  @IsString()
  searchId: string;

  @ApiProperty({
    description: 'ID or name of the product being reviewed',
    example: 'prod_abc123',
  })
  @IsString()
  productId: string;

  @ApiProperty({
    description: 'Type of feedback action',
    enum: FeedbackAction,
    example: FeedbackAction.LIKED,
  })
  @IsEnum(FeedbackAction)
  action: FeedbackAction;

  @ApiPropertyOptional({
    description: 'Rating from 1-5 stars (optional)',
    minimum: 1,
    maximum: 5,
    example: 4,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({
    description: 'Occasion context for the gift search',
    example: 'birthday',
  })
  @IsOptional()
  @IsString()
  occasion?: string;

  @ApiPropertyOptional({
    description: 'Relationship to the recipient',
    example: 'mother',
  })
  @IsOptional()
  @IsString()
  relationship?: string;

  @ApiPropertyOptional({
    description: 'Age range of the recipient',
    example: 'adult',
  })
  @IsOptional()
  @IsString()
  recipientAge?: string;

  @ApiPropertyOptional({
    description: 'Original search parameters (for learning)',
    example: {
      budgetMin: 50,
      budgetMax: 100,
      interests: ['cooking', 'gardening'],
    },
  })
  @IsOptional()
  @IsObject()
  searchContext?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Additional comments from the user',
    example: 'Perfect gift idea!',
  })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({
    description: 'User ID (optional, can be anonymous)',
  })
  @IsOptional()
  @IsUUID()
  userId?: string;
}
