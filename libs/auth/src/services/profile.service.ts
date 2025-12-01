/**
 * Profile Service
 *
 * Business logic for user profile management
 */

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UpdatePreferencesDto } from '../dto/update-preferences.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { UserInfoDto } from '../dto/auth-response.dto';
import { hashPassword, comparePasswords, validatePasswordStrength } from '../utils/password.util';
import { UserRole } from '../types/jwt.types';

export interface UserProfileDto extends UserInfoDto {
  profile?: {
    phone?: string;
    dateOfBirth?: Date;
    gender?: string;
    location?: string;
    timezone?: string;
    currency: string;
    language: string;
    preferredAIAgent?: string;
    notificationsEnabled: boolean;
    emailNotifications: boolean;
    budgetMin?: number;
    budgetMax?: number;
    interests: string[];
    occasions: string[];
  };
}

@Injectable()
export class ProfileService {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Get user profile with preferences
   */
  async getProfile(userId: string): Promise<UserProfileDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name || undefined,
      avatar: user.avatar || undefined,
      role: user.role as UserRole,
      emailVerified: !!user.emailVerified,
      createdAt: user.createdAt,
      profile: user.profile
        ? {
            phone: user.profile.phone || undefined,
            dateOfBirth: user.profile.dateOfBirth || undefined,
            gender: user.profile.gender || undefined,
            location: user.profile.location || undefined,
            timezone: user.profile.timezone || undefined,
            currency: user.profile.currency,
            language: user.profile.language,
            preferredAIAgent: user.profile.preferredAIAgent || undefined,
            notificationsEnabled: user.profile.notificationsEnabled,
            emailNotifications: user.profile.emailNotifications,
            budgetMin: user.profile.budgetMin || undefined,
            budgetMax: user.profile.budgetMax || undefined,
            interests: user.profile.interests,
            occasions: user.profile.occasions,
          }
        : undefined,
    };
  }

  /**
   * Update user profile information
   */
  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<UserProfileDto> {
    // Update user basic info
    const { name, avatar, ...profileData } = updateProfileDto;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: name !== undefined ? name : undefined,
        avatar: avatar !== undefined ? avatar : undefined,
      },
    });

    // Create or update profile
    await this.prisma.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        ...profileData,
        dateOfBirth: profileData.dateOfBirth ? new Date(profileData.dateOfBirth) : undefined,
      },
      update: {
        ...profileData,
        dateOfBirth: profileData.dateOfBirth ? new Date(profileData.dateOfBirth) : undefined,
      },
    });

    return this.getProfile(userId);
  }

  /**
   * Update user preferences
   */
  async updatePreferences(
    userId: string,
    updatePreferencesDto: UpdatePreferencesDto
  ): Promise<UserProfileDto> {
    // Validate budget range
    if (
      updatePreferencesDto.budgetMin !== undefined &&
      updatePreferencesDto.budgetMax !== undefined &&
      updatePreferencesDto.budgetMin > updatePreferencesDto.budgetMax
    ) {
      throw new BadRequestException('Budget minimum cannot be greater than budget maximum');
    }

    // Update or create profile
    await this.prisma.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        ...updatePreferencesDto,
      },
      update: updatePreferencesDto,
    });

    return this.getProfile(userId);
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    const { currentPassword, newPassword } = changePasswordDto;

    // Get user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePasswords(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      throw new BadRequestException({
        message: 'New password does not meet requirements',
        errors: passwordValidation.errors,
      });
    }

    // Check if new password is same as current password
    const isSamePassword = await comparePasswords(newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestException('New password must be different from current password');
    }

    // Hash and update password
    const hashedPassword = await hashPassword(newPassword);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return {
      message: 'Password changed successfully',
    };
  }

  /**
   * Delete user account
   */
  async deleteAccount(userId: string): Promise<{ message: string }> {
    // Soft delete - change status to DELETED
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        status: 'DELETED',
      },
    });

    return {
      message: 'Account scheduled for deletion. Data will be removed after 30 days.',
    };
  }

  /**
   * Clean up Prisma connection
   */
  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
