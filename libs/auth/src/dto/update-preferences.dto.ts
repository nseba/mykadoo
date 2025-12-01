/**
 * Update Preferences DTO
 *
 * Data transfer object for updating user preferences
 */

import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  Max,
  IsArray,
  ArrayMaxSize,
  IsIn,
} from 'class-validator';

export class UpdatePreferencesDto {
  @IsString()
  @IsOptional()
  @IsIn(['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'], {
    message: 'Currency must be one of: USD, EUR, GBP, JPY, AUD, CAD',
  })
  currency?: string;

  @IsString()
  @IsOptional()
  @IsIn(['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'zh'], {
    message: 'Language must be supported',
  })
  language?: string;

  @IsString()
  @IsOptional()
  @IsIn(['Sophie', 'Max', 'Elena', 'Jordan'], {
    message: 'AI agent must be one of: Sophie, Max, Elena, Jordan',
  })
  preferredAIAgent?: string;

  @IsBoolean()
  @IsOptional()
  notificationsEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  emailNotifications?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0, { message: 'Budget minimum must be at least 0' })
  @Max(100000, { message: 'Budget minimum must not exceed 100,000' })
  budgetMin?: number;

  @IsNumber()
  @IsOptional()
  @Min(0, { message: 'Budget maximum must be at least 0' })
  @Max(100000, { message: 'Budget maximum must not exceed 100,000' })
  budgetMax?: number;

  @IsArray()
  @IsOptional()
  @ArrayMaxSize(50, { message: 'Cannot have more than 50 interests' })
  @IsString({ each: true })
  interests?: string[];

  @IsArray()
  @IsOptional()
  @ArrayMaxSize(20, { message: 'Cannot have more than 20 occasions' })
  @IsString({ each: true })
  occasions?: string[];
}
