import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for semantic search request
 */
export class SemanticSearchDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  query: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  rrfK?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  enableExpansion?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  enableReranking?: boolean;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  @Type(() => Number)
  minSimilarity?: number;
}

/**
 * DTO for tracking search click
 */
export class TrackSearchClickDto {
  @IsString()
  queryId: string;

  @IsString()
  query: string;

  @IsString()
  productId: string;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  position: number;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;
}

/**
 * DTO for tracking search conversion
 */
export class TrackSearchConversionDto {
  @IsString()
  queryId: string;

  @IsString()
  query: string;

  @IsString()
  productId: string;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  position: number;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;
}

/**
 * DTO for tracking dwell time
 */
export class TrackDwellTimeDto {
  @IsString()
  queryId: string;

  @IsString()
  query: string;

  @IsString()
  productId: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  dwellTimeMs: number;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;
}

/**
 * DTO for tracking query refinement
 */
export class TrackRefinementDto {
  @IsString()
  originalQueryId: string;

  @IsString()
  newQueryId: string;

  @IsString()
  originalQuery: string;

  @IsString()
  newQuery: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;
}

/**
 * DTO for search quality metrics request
 */
export class SearchQualityMetricsDto {
  @IsString()
  startDate: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}
