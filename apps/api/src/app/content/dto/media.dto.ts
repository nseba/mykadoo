import {
  IsString,
  IsOptional,
  IsInt,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UploadMediaDto {
  @ApiPropertyOptional({ description: 'Alt text for accessibility' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  alt?: string;

  @ApiPropertyOptional({ description: 'Caption for the media' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  caption?: string;

  @ApiPropertyOptional({ description: 'Virtual folder path for organization' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  folder?: string;
}

export class UpdateMediaDto {
  @ApiPropertyOptional({ description: 'Alt text' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  alt?: string;

  @ApiPropertyOptional({ description: 'Caption' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  caption?: string;

  @ApiPropertyOptional({ description: 'Virtual folder path' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  folder?: string;
}

export class MediaQueryDto {
  @ApiPropertyOptional({ description: 'Filter by MIME type' })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiPropertyOptional({ description: 'Filter by folder' })
  @IsOptional()
  @IsString()
  folder?: string;

  @ApiPropertyOptional({ description: 'Search in filename' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}

export class MediaResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  filename: string;

  @ApiProperty()
  originalName: string;

  @ApiProperty()
  mimeType: string;

  @ApiProperty({ description: 'File size in bytes' })
  size: number;

  @ApiProperty({ description: 'Full CDN URL' })
  url: string;

  @ApiPropertyOptional({ description: 'Thumbnail URL' })
  thumbnailUrl?: string;

  @ApiPropertyOptional({ description: 'Responsive image sizes' })
  sizes?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Image width in pixels' })
  width?: number;

  @ApiPropertyOptional({ description: 'Image height in pixels' })
  height?: number;

  @ApiPropertyOptional()
  alt?: string;

  @ApiPropertyOptional()
  caption?: string;

  @ApiPropertyOptional()
  folder?: string;

  @ApiPropertyOptional()
  uploadedBy?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PaginatedMediaResponseDto {
  @ApiProperty({ type: [MediaResponseDto] })
  data: MediaResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
