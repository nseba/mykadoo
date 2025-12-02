/**
 * Search Request DTO
 *
 * Validation schema for gift search requests
 */

import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsArray,
  ArrayMinSize,
  Min,
  Max,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AgeRange {
  CHILD = 'Child (0-12)',
  TEEN = 'Teen (13-17)',
  YOUNG_ADULT = 'Young Adult (18-30)',
  ADULT = 'Adult (31-50)',
  SENIOR = 'Senior (50+)',
}

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  NON_BINARY = 'Non-Binary',
  PREFER_NOT_TO_SAY = 'Prefer not to say',
}

export class SearchRequestDto {
  @ApiProperty({
    description: 'Gift-giving occasion',
    example: 'Birthday',
  })
  @IsString()
  @IsNotEmpty()
  occasion: string;

  @ApiProperty({
    description: 'Relationship to recipient',
    example: 'Friend',
  })
  @IsString()
  @IsNotEmpty()
  relationship: string;

  @ApiProperty({
    description: 'Age range of recipient',
    enum: AgeRange,
    example: AgeRange.YOUNG_ADULT,
  })
  @IsEnum(AgeRange)
  @IsNotEmpty()
  ageRange: AgeRange;

  @ApiPropertyOptional({
    description: 'Gender of recipient',
    enum: Gender,
    example: Gender.FEMALE,
  })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiProperty({
    description: 'Minimum budget in USD',
    example: 30,
    minimum: 1,
    maximum: 10000,
  })
  @IsNumber()
  @Min(1)
  @Max(10000)
  budgetMin: number;

  @ApiProperty({
    description: 'Maximum budget in USD',
    example: 60,
    minimum: 1,
    maximum: 10000,
  })
  @IsNumber()
  @Min(1)
  @Max(10000)
  budgetMax: number;

  @ApiProperty({
    description: 'Recipient interests and hobbies',
    example: ['Reading', 'Coffee', 'Yoga'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  interests: string[];

  @ApiPropertyOptional({
    description: 'Recipient name (optional, for personalization)',
    example: 'Sarah',
  })
  @IsString()
  @IsOptional()
  recipientName?: string;

  @ApiPropertyOptional({
    description: 'User ID for tracking and personalization',
  })
  @IsString()
  @IsOptional()
  userId?: string;
}
