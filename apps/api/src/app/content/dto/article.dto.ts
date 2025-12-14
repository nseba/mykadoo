import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsBoolean,
  IsDateString,
  MaxLength,
  MinLength,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum ArticleStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  SCHEDULED = 'SCHEDULED',
  ARCHIVED = 'ARCHIVED',
}

export enum ArticleContentType {
  ARTICLE = 'ARTICLE',
  GIFT_GUIDE = 'GIFT_GUIDE',
  HOW_TO = 'HOW_TO',
  SEASONAL = 'SEASONAL',
  TREND = 'TREND',
  BUYERS_GUIDE = 'BUYERS_GUIDE',
}

export class CreateArticleDto {
  @ApiProperty({ description: 'Article title', example: 'Best Tech Gifts for Men in 2024' })
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ description: 'URL-friendly slug (auto-generated if not provided)' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  slug?: string;

  @ApiPropertyOptional({ description: 'Short excerpt/summary for previews' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;

  @ApiProperty({ description: 'Article content (HTML or Markdown)' })
  @IsString()
  @MinLength(50)
  content: string;

  @ApiProperty({ description: 'Author ID' })
  @IsUUID()
  authorId: string;

  @ApiPropertyOptional({ description: 'Featured image URL' })
  @IsOptional()
  @IsString()
  featuredImageUrl?: string;

  @ApiPropertyOptional({ description: 'Featured image alt text' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  featuredImageAlt?: string;

  @ApiPropertyOptional({ description: 'Featured image caption' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  featuredImageCaption?: string;

  @ApiPropertyOptional({ enum: ArticleContentType, default: ArticleContentType.ARTICLE })
  @IsOptional()
  @IsEnum(ArticleContentType)
  contentType?: ArticleContentType;

  @ApiPropertyOptional({ enum: ArticleStatus, default: ArticleStatus.DRAFT })
  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;

  @ApiPropertyOptional({ description: 'Scheduled publication date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional({ description: 'Category IDs to associate with article' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  categoryIds?: string[];

  @ApiPropertyOptional({ description: 'Tag names to associate with article' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'SEO title override (50-60 chars recommended)' })
  @IsOptional()
  @IsString()
  @MaxLength(70)
  seoTitle?: string;

  @ApiPropertyOptional({ description: 'SEO meta description (150-160 chars recommended)' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  seoDescription?: string;

  @ApiPropertyOptional({ description: 'SEO keywords' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  seoKeywords?: string[];

  @ApiPropertyOptional({ description: 'Canonical URL for cross-posted content' })
  @IsOptional()
  @IsString()
  canonicalUrl?: string;

  @ApiPropertyOptional({ description: 'Open Graph title override' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ogTitle?: string;

  @ApiPropertyOptional({ description: 'Open Graph description override' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  ogDescription?: string;

  @ApiPropertyOptional({ description: 'Open Graph image URL (1200x630px recommended)' })
  @IsOptional()
  @IsString()
  ogImageUrl?: string;

  @ApiPropertyOptional({ description: 'Mark as featured article' })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}

export class UpdateArticleDto {
  @ApiPropertyOptional({ description: 'Article title' })
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ description: 'URL-friendly slug' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  slug?: string;

  @ApiPropertyOptional({ description: 'Short excerpt/summary' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;

  @ApiPropertyOptional({ description: 'Article content (HTML or Markdown)' })
  @IsOptional()
  @IsString()
  @MinLength(50)
  content?: string;

  @ApiPropertyOptional({ description: 'Author ID' })
  @IsOptional()
  @IsUUID()
  authorId?: string;

  @ApiPropertyOptional({ description: 'Featured image URL' })
  @IsOptional()
  @IsString()
  featuredImageUrl?: string;

  @ApiPropertyOptional({ description: 'Featured image alt text' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  featuredImageAlt?: string;

  @ApiPropertyOptional({ description: 'Featured image caption' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  featuredImageCaption?: string;

  @ApiPropertyOptional({ enum: ArticleContentType })
  @IsOptional()
  @IsEnum(ArticleContentType)
  contentType?: ArticleContentType;

  @ApiPropertyOptional({ enum: ArticleStatus })
  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;

  @ApiPropertyOptional({ description: 'Scheduled publication date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional({ description: 'Category IDs' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  categoryIds?: string[];

  @ApiPropertyOptional({ description: 'Tag names' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'SEO title override' })
  @IsOptional()
  @IsString()
  @MaxLength(70)
  seoTitle?: string;

  @ApiPropertyOptional({ description: 'SEO meta description' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  seoDescription?: string;

  @ApiPropertyOptional({ description: 'SEO keywords' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  seoKeywords?: string[];

  @ApiPropertyOptional({ description: 'Canonical URL' })
  @IsOptional()
  @IsString()
  canonicalUrl?: string;

  @ApiPropertyOptional({ description: 'Open Graph title' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ogTitle?: string;

  @ApiPropertyOptional({ description: 'Open Graph description' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  ogDescription?: string;

  @ApiPropertyOptional({ description: 'Open Graph image URL' })
  @IsOptional()
  @IsString()
  ogImageUrl?: string;

  @ApiPropertyOptional({ description: 'Mark as featured article' })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}

export class ArticleQueryDto {
  @ApiPropertyOptional({ description: 'Filter by status' })
  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;

  @ApiPropertyOptional({ description: 'Filter by content type' })
  @IsOptional()
  @IsEnum(ArticleContentType)
  contentType?: ArticleContentType;

  @ApiPropertyOptional({ description: 'Filter by category slug' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Filter by tag slug' })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional({ description: 'Filter by author slug' })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiPropertyOptional({ description: 'Filter featured articles only' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  featured?: boolean;

  @ApiPropertyOptional({ description: 'Search query' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Page number (1-based)', default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({ description: 'Sort field', default: 'publishedAt' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Sort direction', default: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}

export class ArticleResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  slug: string;

  @ApiPropertyOptional()
  excerpt?: string;

  @ApiProperty()
  content: string;

  @ApiPropertyOptional()
  featuredImageUrl?: string;

  @ApiPropertyOptional()
  featuredImageAlt?: string;

  @ApiPropertyOptional()
  featuredImageCaption?: string;

  @ApiProperty({ enum: ArticleStatus })
  status: ArticleStatus;

  @ApiProperty({ enum: ArticleContentType })
  contentType: ArticleContentType;

  @ApiPropertyOptional()
  publishedAt?: Date;

  @ApiPropertyOptional()
  scheduledAt?: Date;

  @ApiPropertyOptional()
  seoTitle?: string;

  @ApiPropertyOptional()
  seoDescription?: string;

  @ApiPropertyOptional()
  seoKeywords?: string[];

  @ApiPropertyOptional()
  canonicalUrl?: string;

  @ApiPropertyOptional()
  ogTitle?: string;

  @ApiPropertyOptional()
  ogDescription?: string;

  @ApiPropertyOptional()
  ogImageUrl?: string;

  @ApiPropertyOptional()
  readingTimeMinutes?: number;

  @ApiPropertyOptional()
  wordCount?: number;

  @ApiProperty()
  viewCount: number;

  @ApiProperty()
  shareCount: number;

  @ApiProperty()
  isFeatured: boolean;

  @ApiProperty()
  author: {
    id: string;
    name: string;
    slug: string;
    avatarUrl?: string;
    bio?: string;
  };

  @ApiProperty({ type: [Object] })
  categories: {
    id: string;
    name: string;
    slug: string;
    isPrimary: boolean;
  }[];

  @ApiProperty({ type: [Object] })
  tags: {
    id: string;
    name: string;
    slug: string;
  }[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PaginatedArticlesResponseDto {
  @ApiProperty({ type: [ArticleResponseDto] })
  data: ArticleResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  hasMore: boolean;
}
