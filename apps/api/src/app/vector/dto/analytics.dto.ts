import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsArray, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { RecommendationVariant } from '../similarity-analytics.service';

export class DateRangeDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}

export class TrackSearchDto {
  @IsString()
  sourceProductId: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  sessionId?: string;

  @IsEnum(RecommendationVariant)
  variant: RecommendationVariant;

  @IsArray()
  @IsString({ each: true })
  recommendedProductIds: string[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(1)
  searchThreshold?: number;
}

export class TrackImpressionDto {
  @IsString()
  sourceProductId: string;

  @IsArray()
  @IsString({ each: true })
  recommendedProductIds: string[];

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  sessionId?: string;

  @IsEnum(RecommendationVariant)
  variant: RecommendationVariant;
}

export class TrackClickDto {
  @IsString()
  sourceProductId: string;

  @IsString()
  clickedProductId: string;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  position: number;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  sessionId?: string;

  @IsEnum(RecommendationVariant)
  variant: RecommendationVariant;
}

export class TrackConversionDto {
  @IsString()
  sourceProductId: string;

  @IsString()
  convertedProductId: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  sessionId?: string;

  @IsEnum(RecommendationVariant)
  variant: RecommendationVariant;

  @IsNumber()
  @IsOptional()
  @Min(0)
  position?: number;
}

export class UpdateABTestDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsEnum(RecommendationVariant, { each: true })
  @IsOptional()
  variants?: RecommendationVariant[];

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  weights?: number[];

  @IsOptional()
  isActive?: boolean;
}

export class GetTopProductsDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class AssignVariantDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  sessionId?: string;
}
