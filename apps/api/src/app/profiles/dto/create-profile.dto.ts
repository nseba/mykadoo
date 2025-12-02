/**
 * Create Recipient Profile DTO
 */

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsDateString,
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

export enum Relationship {
  SPOUSE = 'Spouse/Partner',
  PARENT = 'Parent',
  SIBLING = 'Sibling',
  CHILD = 'Child',
  FRIEND = 'Friend',
  COWORKER = 'Coworker',
  BOSS = 'Boss',
  TEACHER = 'Teacher',
  NEIGHBOR = 'Neighbor',
  OTHER = 'Other',
}

export class CreateProfileDto {
  @ApiProperty({
    description: 'Recipient name',
    example: 'Sarah Johnson',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Relationship to recipient',
    enum: Relationship,
    example: Relationship.FRIEND,
  })
  @IsEnum(Relationship)
  @IsNotEmpty()
  relationship: string;

  @ApiProperty({
    description: 'Age range of recipient',
    enum: AgeRange,
    example: AgeRange.YOUNG_ADULT,
  })
  @IsEnum(AgeRange)
  @IsNotEmpty()
  ageRange: string;

  @ApiPropertyOptional({
    description: 'Gender',
    example: 'Female',
  })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({
    description: 'Date of birth (ISO 8601)',
    example: '1995-06-15',
  })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiPropertyOptional({
    description: 'Array of interests',
    example: ['Reading', 'Yoga', 'Coffee'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  interests?: string[];

  @ApiPropertyOptional({
    description: 'Favorite colors',
    example: ['Blue', 'Green'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  favoriteColors?: string[];

  @ApiPropertyOptional({
    description: 'Hobbies',
    example: ['Photography', 'Hiking'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  hobbies?: string[];

  @ApiPropertyOptional({
    description: 'Things they dislike',
    example: ['Spicy food', 'Horror movies'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  dislikes?: string[];

  @ApiPropertyOptional({
    description: 'Birthday date (ISO 8601)',
    example: '2024-06-15',
  })
  @IsDateString()
  @IsOptional()
  birthdayDate?: string;

  @ApiPropertyOptional({
    description: 'Anniversary date (ISO 8601)',
    example: '2020-08-22',
  })
  @IsDateString()
  @IsOptional()
  anniversaryDate?: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Loves handmade gifts and sustainable products',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Avatar URL',
  })
  @IsString()
  @IsOptional()
  avatar?: string;
}
