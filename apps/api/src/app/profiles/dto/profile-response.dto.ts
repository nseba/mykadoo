/**
 * Profile Response DTO
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProfileResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  relationship: string;

  @ApiProperty()
  ageRange: string;

  @ApiPropertyOptional()
  gender?: string;

  @ApiPropertyOptional()
  dateOfBirth?: Date;

  @ApiPropertyOptional({ type: [String] })
  interests?: string[];

  @ApiPropertyOptional({ type: [String] })
  favoriteColors?: string[];

  @ApiPropertyOptional({ type: [String] })
  hobbies?: string[];

  @ApiPropertyOptional({ type: [String] })
  dislikes?: string[];

  @ApiPropertyOptional()
  birthdayDate?: Date;

  @ApiPropertyOptional()
  anniversaryDate?: Date;

  @ApiPropertyOptional()
  occasionReminders?: any;

  @ApiPropertyOptional({ type: [Object] })
  giftHistory?: any[];

  @ApiPropertyOptional()
  notes?: string;

  @ApiPropertyOptional()
  avatar?: string;

  @ApiPropertyOptional()
  lastGiftDate?: Date;

  @ApiProperty()
  totalGiftsGiven: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ProfileListResponseDto {
  @ApiProperty({ type: [ProfileResponseDto] })
  profiles: ProfileResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  limit: number;

  @ApiProperty({
    description: 'Maximum profiles allowed for current tier',
  })
  maxAllowed: number;

  @ApiProperty({
    description: 'Whether user can create more profiles',
  })
  canCreateMore: boolean;
}
