/**
 * Search Response DTO
 *
 * Response schema for gift search results
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GiftRecommendationDto {
  @ApiProperty({
    description: 'Product name',
    example: 'Personalized Book Embosser',
  })
  productName: string;

  @ApiProperty({
    description: 'Product description',
    example: 'A custom book embosser with their name that creates an elegant embossed stamp on book pages.',
  })
  description: string;

  @ApiProperty({
    description: 'Price in USD',
    example: 35,
  })
  price: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'USD',
  })
  currency: string;

  @ApiProperty({
    description: 'Product category',
    example: 'Books & Stationery',
  })
  category: string;

  @ApiProperty({
    description: 'Product tags',
    example: ['reading', 'personalized', 'unique'],
    type: [String],
  })
  tags: string[];

  @ApiProperty({
    description: 'Why this gift matches the recipient',
    example: 'Since they love reading, this personalized embosser adds a special touch to their book collection.',
  })
  matchReason: string;

  @ApiPropertyOptional({
    description: 'Product image URL',
    example: 'https://example.com/image.jpg',
  })
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Purchase URL (affiliate link)',
    example: 'https://www.amazon.com/dp/B123456789?tag=mykadoo-20',
  })
  purchaseUrl?: string;

  @ApiPropertyOptional({
    description: 'Retailer name',
    example: 'Amazon',
  })
  retailer?: string;

  @ApiProperty({
    description: 'Relevance score (0-100)',
    example: 85,
  })
  relevanceScore: number;
}

export class SearchMetadataDto {
  @ApiProperty({
    description: 'AI model used for recommendations',
    example: 'gpt-4-turbo-preview',
  })
  model: string;

  @ApiProperty({
    description: 'API cost in USD',
    example: 0.0234,
  })
  cost: number;

  @ApiProperty({
    description: 'Latency in milliseconds',
    example: 1842,
  })
  latency: number;

  @ApiProperty({
    description: 'Total number of results',
    example: 10,
  })
  totalResults: number;
}

export class SearchResponseDto {
  @ApiProperty({
    description: 'Gift recommendations',
    type: [GiftRecommendationDto],
  })
  recommendations: GiftRecommendationDto[];

  @ApiPropertyOptional({
    description: 'Search ID for tracking',
    example: 'search_abc123xyz',
  })
  searchId?: string;

  @ApiProperty({
    description: 'Metadata about the search operation',
    type: SearchMetadataDto,
  })
  metadata: SearchMetadataDto;

  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiPropertyOptional({
    description: 'Error message if applicable',
  })
  error?: string;
}
