import { IsString, IsNumber, IsOptional, IsArray, IsBoolean, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Context for recommendation request
 */
export class RecommendationContextDto {
  @ApiPropertyOptional({ description: 'User ID for personalization' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: 'Session ID for anonymous tracking' })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiPropertyOptional({ description: 'Search query context' })
  @IsOptional()
  @IsString()
  searchQuery?: string;

  @ApiPropertyOptional({ description: 'Current category being viewed' })
  @IsOptional()
  @IsString()
  currentCategory?: string;

  @ApiPropertyOptional({ description: 'Recently viewed product IDs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recentlyViewed?: string[];

  @ApiPropertyOptional({ description: 'Gift occasion (birthday, christmas, etc.)' })
  @IsOptional()
  @IsString()
  occasion?: string;

  @ApiPropertyOptional({ description: 'Gift recipient relationship' })
  @IsOptional()
  @IsString()
  recipient?: string;

  @ApiPropertyOptional({ description: 'Minimum price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;
}

/**
 * Options for recommendation request
 */
export class RecommendationOptionsDto {
  @ApiPropertyOptional({ description: 'Number of recommendations', default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ description: 'Include explanation for each recommendation', default: false })
  @IsOptional()
  @IsBoolean()
  includeExplanation?: boolean;

  @ApiPropertyOptional({ description: 'Diversity threshold (0-1)', default: 0.3 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  diversityThreshold?: number;

  @ApiPropertyOptional({ description: 'Exploration factor for discovering new items', default: 0.1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  explorationFactor?: number;
}

/**
 * Main recommendation request DTO
 */
export class GetRecommendationsDto {
  @ApiProperty({ description: 'Context for recommendations' })
  @ValidateNested()
  @Type(() => RecommendationContextDto)
  context: RecommendationContextDto;

  @ApiPropertyOptional({ description: 'Options for recommendations' })
  @IsOptional()
  @ValidateNested()
  @Type(() => RecommendationOptionsDto)
  options?: RecommendationOptionsDto;
}

/**
 * Similar products request DTO
 */
export class GetSimilarProductsDto {
  @ApiProperty({ description: 'Product ID to find similar items for' })
  @IsString()
  productId: string;

  @ApiPropertyOptional({ description: 'Context for recommendations' })
  @IsOptional()
  @ValidateNested()
  @Type(() => RecommendationContextDto)
  context?: RecommendationContextDto;

  @ApiPropertyOptional({ description: 'Options for recommendations' })
  @IsOptional()
  @ValidateNested()
  @Type(() => RecommendationOptionsDto)
  options?: RecommendationOptionsDto;
}

/**
 * User interaction tracking DTO
 */
export class TrackInteractionDto {
  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;

  @ApiPropertyOptional({ description: 'Product ID' })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional({ description: 'Search query' })
  @IsOptional()
  @IsString()
  searchQuery?: string;

  @ApiProperty({ description: 'Interaction type', enum: ['view', 'click', 'add_to_cart', 'purchase', 'save', 'search'] })
  @IsString()
  interactionType: 'view' | 'click' | 'add_to_cart' | 'purchase' | 'save' | 'search';

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: Record<string, unknown>;
}

/**
 * User preference update request DTO
 */
export class UpdateUserPreferencesDto {
  @ApiProperty({ description: 'User ID to update preferences for' })
  @IsString()
  userId: string;
}

/**
 * Learn from search request DTO
 */
export class LearnFromSearchDto {
  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Search query to learn from' })
  @IsString()
  searchQuery: string;
}

/**
 * Single explanation factor
 */
export class ExplanationFactorDto {
  @ApiProperty({ description: 'Type of factor' })
  type: string;

  @ApiProperty({ description: 'Human-readable description' })
  description: string;

  @ApiProperty({ description: 'Weight/importance of this factor' })
  weight: number;
}

/**
 * Response DTO for recommendation explanation
 */
export class RecommendationExplanationResponseDto {
  @ApiProperty({ description: 'Primary reason for recommendation' })
  primaryReason: string;

  @ApiPropertyOptional({ description: 'Additional factors', type: [ExplanationFactorDto] })
  factors?: ExplanationFactorDto[];

  @ApiPropertyOptional({ description: 'Confidence score (0-1)' })
  confidence?: number;
}

/**
 * Response DTO for a single recommendation
 */
export class RecommendationResponseDto {
  @ApiProperty({ description: 'Product ID' })
  id: string;

  @ApiProperty({ description: 'Product title' })
  title: string;

  @ApiPropertyOptional({ description: 'Product description' })
  description?: string;

  @ApiProperty({ description: 'Product price' })
  price: number;

  @ApiPropertyOptional({ description: 'Product category' })
  category?: string;

  @ApiPropertyOptional({ description: 'Product image URL' })
  imageUrl?: string;

  @ApiProperty({ description: 'Recommendation score (0-1)' })
  score: number;

  @ApiPropertyOptional({ description: 'Explanation for this recommendation' })
  explanation?: RecommendationExplanationResponseDto;
}

/**
 * Response DTO for user profile
 */
export class UserProfileResponseDto {
  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Total interaction count' })
  interactionCount: number;

  @ApiProperty({ description: 'Last updated timestamp' })
  lastUpdated: Date;

  @ApiProperty({ description: 'Top categories by preference' })
  topCategories: Array<{ category: string; score: number }>;

  @ApiProperty({ description: 'Price range preferences' })
  priceRange: { min: number; max: number; avg: number };

  @ApiProperty({ description: 'Whether user has preference embedding' })
  hasPreferenceEmbedding: boolean;
}
