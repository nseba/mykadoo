import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTagDto {
  @ApiProperty({ description: 'Tag name', example: 'Electronics' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @ApiPropertyOptional({ description: 'URL-friendly slug (auto-generated if not provided)' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  slug?: string;
}

export class UpdateTagDto {
  @ApiPropertyOptional({ description: 'Tag name' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({ description: 'URL-friendly slug' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  slug?: string;
}

export class TagResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiPropertyOptional({ description: 'Number of articles with this tag' })
  articleCount?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
