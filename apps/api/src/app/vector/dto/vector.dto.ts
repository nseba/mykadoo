import { IsString, IsOptional, IsNumber, Min, Max, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for similarity search request
 */
export class SimilaritySearchDto {
  @IsString()
  query: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  @Type(() => Number)
  matchThreshold?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  matchCount?: number;

  @IsOptional()
  @IsString()
  categoryFilter?: string;

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
}

/**
 * DTO for hybrid search request
 */
export class HybridSearchDto {
  @IsString()
  query: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  @Type(() => Number)
  keywordWeight?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  @Type(() => Number)
  semanticWeight?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  matchCount?: number;
}

/**
 * DTO for embedding generation request
 */
export class GenerateEmbeddingDto {
  @IsString()
  text: string;

  @IsOptional()
  @IsString()
  model?: string;
}

/**
 * DTO for product embedding generation
 */
export class GenerateProductEmbeddingDto {
  @IsString()
  productId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

/**
 * DTO for batch embedding backfill
 */
export class BackfillEmbeddingsDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  batchSize?: number;
}

/**
 * DTO for similar products request
 */
export class SimilarProductsDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  @Type(() => Number)
  matchThreshold?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  matchCount?: number;

  @IsOptional()
  @IsString()
  categoryFilter?: string;

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
}
