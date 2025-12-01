/**
 * Update Profile DTO
 *
 * Data transfer object for updating user profile
 */

import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsDateString,
  IsIn,
  IsArray,
  ArrayMaxSize,
  IsUrl,
  IsPhoneNumber,
} from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name?: string;

  @IsString()
  @IsOptional()
  @IsUrl({}, { message: 'Please provide a valid avatar URL' })
  avatar?: string;

  @IsString()
  @IsOptional()
  @IsPhoneNumber(null, { message: 'Please provide a valid phone number' })
  phone?: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsString()
  @IsOptional()
  @IsIn(['male', 'female', 'other', 'prefer_not_to_say'], {
    message: 'Gender must be one of: male, female, other, prefer_not_to_say',
  })
  gender?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200, { message: 'Location must not exceed 200 characters' })
  location?: string;

  @IsString()
  @IsOptional()
  timezone?: string;
}
