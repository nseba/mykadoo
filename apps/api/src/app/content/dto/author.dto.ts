import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEmail,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateAuthorDto {
  @ApiProperty({ description: 'Author name', example: 'Sarah Johnson' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'URL-friendly slug (auto-generated if not provided)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  slug?: string;

  @ApiPropertyOptional({ description: 'Author email' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Author bio' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;

  @ApiPropertyOptional({ description: 'Avatar URL' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({ description: 'Twitter handle (without @)' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  twitterHandle?: string;

  @ApiPropertyOptional({ description: 'LinkedIn profile URL' })
  @IsOptional()
  @IsString()
  linkedinUrl?: string;

  @ApiPropertyOptional({ description: 'Personal website URL' })
  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @ApiPropertyOptional({ description: 'Whether author is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateAuthorDto {
  @ApiPropertyOptional({ description: 'Author name' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'URL-friendly slug' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  slug?: string;

  @ApiPropertyOptional({ description: 'Author email' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Author bio' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;

  @ApiPropertyOptional({ description: 'Avatar URL' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({ description: 'Twitter handle' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  twitterHandle?: string;

  @ApiPropertyOptional({ description: 'LinkedIn profile URL' })
  @IsOptional()
  @IsString()
  linkedinUrl?: string;

  @ApiPropertyOptional({ description: 'Personal website URL' })
  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @ApiPropertyOptional({ description: 'Whether author is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AuthorQueryDto {
  @ApiPropertyOptional({ description: 'Include only active authors' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  activeOnly?: boolean;

  @ApiPropertyOptional({ description: 'Include article counts' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeCount?: boolean;
}

export class AuthorResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiPropertyOptional()
  email?: string;

  @ApiPropertyOptional()
  bio?: string;

  @ApiPropertyOptional()
  avatarUrl?: string;

  @ApiPropertyOptional()
  twitterHandle?: string;

  @ApiPropertyOptional()
  linkedinUrl?: string;

  @ApiPropertyOptional()
  websiteUrl?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiPropertyOptional({ description: 'Number of published articles' })
  articleCount?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
