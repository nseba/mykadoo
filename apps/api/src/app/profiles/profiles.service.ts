/**
 * Profiles Service
 *
 * Manage recipient profiles with tier limits
 */

import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileResponseDto, ProfileListResponseDto } from './dto/profile-response.dto';

// User role enum (matches Prisma schema)
enum UserRole {
  FREE = 'FREE',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
  ADMIN = 'ADMIN',
}

// Tier limits for recipient profiles
const PROFILE_LIMITS = {
  [UserRole.FREE]: 3,
  [UserRole.GOLD]: 10,
  [UserRole.PLATINUM]: Infinity,
  [UserRole.ADMIN]: Infinity,
};

@Injectable()
export class ProfilesService {
  private readonly logger = new Logger(ProfilesService.name);
  // NOTE: Prisma client will be injected once migrations are run
  // private prisma: PrismaClient;

  // Temporary in-memory storage for demonstration
  private profiles: Map<string, ProfileResponseDto[]> = new Map();

  constructor() {
    // this.prisma = new PrismaClient();
  }

  /**
   * Get all profiles for a user
   */
  async findAll(userId: string): Promise<ProfileListResponseDto> {
    // NOTE: Replace with Prisma query after migrations
    const userRole = UserRole.FREE; // Mock - get from auth context
    const profiles = this.profiles.get(userId) || [];

    const maxAllowed = PROFILE_LIMITS[userRole];
    const canCreateMore = profiles.length < maxAllowed;

    return {
      profiles,
      total: profiles.length,
      limit: maxAllowed,
      maxAllowed,
      canCreateMore,
    };
  }

  /**
   * Get a single profile by ID
   */
  async findOne(userId: string, profileId: string): Promise<ProfileResponseDto> {
    // NOTE: Replace with Prisma query after migrations
    const profiles = this.profiles.get(userId) || [];
    const profile = profiles.find((p) => p.id === profileId);

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  /**
   * Create a new recipient profile
   */
  async create(userId: string, dto: CreateProfileDto): Promise<ProfileResponseDto> {
    // NOTE: Replace with Prisma query after migrations
    const userRole = UserRole.FREE; // Mock - get from auth context
    const currentProfiles = this.profiles.get(userId) || [];
    const currentCount = currentProfiles.length;

    const maxAllowed = PROFILE_LIMITS[userRole];

    if (currentCount >= maxAllowed) {
      throw new ForbiddenException(
        `You have reached the maximum number of profiles (${maxAllowed}) for your ${userRole} tier. Upgrade to create more profiles.`
      );
    }

    // Create profile
    const profile: ProfileResponseDto = {
      id: Math.random().toString(36).substring(7),
      userId,
      name: dto.name,
      relationship: dto.relationship,
      ageRange: dto.ageRange,
      gender: dto.gender,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      interests: dto.interests || [],
      favoriteColors: dto.favoriteColors || [],
      hobbies: dto.hobbies || [],
      dislikes: dto.dislikes || [],
      birthdayDate: dto.birthdayDate ? new Date(dto.birthdayDate) : undefined,
      anniversaryDate: dto.anniversaryDate ? new Date(dto.anniversaryDate) : undefined,
      notes: dto.notes,
      avatar: dto.avatar,
      giftHistory: [],
      totalGiftsGiven: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    currentProfiles.push(profile);
    this.profiles.set(userId, currentProfiles);

    this.logger.log(`Created profile ${profile.id} for user ${userId}`);

    return profile;
  }

  /**
   * Update a recipient profile
   */
  async update(
    userId: string,
    profileId: string,
    dto: UpdateProfileDto
  ): Promise<ProfileResponseDto> {
    // NOTE: Replace with Prisma query after migrations
    const profiles = this.profiles.get(userId) || [];
    const index = profiles.findIndex((p) => p.id === profileId);

    if (index === -1) {
      throw new NotFoundException('Profile not found');
    }

    const existing = profiles[index];

    // Update profile
    const updatedProfile: ProfileResponseDto = {
      ...existing,
      ...(dto.name && { name: dto.name }),
      ...(dto.relationship && { relationship: dto.relationship }),
      ...(dto.ageRange && { ageRange: dto.ageRange }),
      ...(dto.gender !== undefined && { gender: dto.gender }),
      ...(dto.interests !== undefined && { interests: dto.interests }),
      ...(dto.favoriteColors !== undefined && { favoriteColors: dto.favoriteColors }),
      ...(dto.hobbies !== undefined && { hobbies: dto.hobbies }),
      ...(dto.dislikes !== undefined && { dislikes: dto.dislikes }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
      ...(dto.avatar !== undefined && { avatar: dto.avatar }),
      updatedAt: new Date(),
    };

    profiles[index] = updatedProfile;
    this.profiles.set(userId, profiles);

    this.logger.log(`Updated profile ${profileId} for user ${userId}`);

    return updatedProfile;
  }

  /**
   * Delete a recipient profile
   */
  async remove(userId: string, profileId: string): Promise<void> {
    // NOTE: Replace with Prisma query after migrations
    const profiles = this.profiles.get(userId) || [];
    const index = profiles.findIndex((p) => p.id === profileId);

    if (index === -1) {
      throw new NotFoundException('Profile not found');
    }

    profiles.splice(index, 1);
    this.profiles.set(userId, profiles);

    this.logger.log(`Deleted profile ${profileId} for user ${userId}`);
  }

  /**
   * Add gift to profile history
   */
  async addGiftToHistory(
    userId: string,
    profileId: string,
    gift: {
      date: Date;
      productName: string;
      occasion: string;
      liked?: boolean;
      notes?: string;
    }
  ): Promise<ProfileResponseDto> {
    // NOTE: Replace with Prisma query after migrations
    const profile = await this.findOne(userId, profileId);
    const profiles = this.profiles.get(userId) || [];
    const index = profiles.findIndex((p) => p.id === profileId);

    if (index === -1) {
      throw new NotFoundException('Profile not found');
    }

    const updatedProfile: ProfileResponseDto = {
      ...profile,
      giftHistory: [...(profile.giftHistory || []), gift],
      lastGiftDate: gift.date,
      totalGiftsGiven: profile.totalGiftsGiven + 1,
      updatedAt: new Date(),
    };

    profiles[index] = updatedProfile;
    this.profiles.set(userId, profiles);

    return updatedProfile;
  }

  /**
   * Get tier limits information
   */
  getTierLimits() {
    return {
      FREE: PROFILE_LIMITS[UserRole.FREE],
      GOLD: PROFILE_LIMITS[UserRole.GOLD],
      PLATINUM: PROFILE_LIMITS[UserRole.PLATINUM],
    };
  }
}
