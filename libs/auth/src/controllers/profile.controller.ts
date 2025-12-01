/**
 * Profile Controller
 *
 * HTTP endpoints for user profile management
 */

import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProfileService, UserProfileDto } from '../services/profile.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UpdatePreferencesDto } from '../dto/update-preferences.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { AuthenticatedUser } from '../types/jwt.types';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  /**
   * Get current user profile with preferences
   * GET /profile
   */
  @Get()
  async getProfile(@CurrentUser() user: AuthenticatedUser): Promise<UserProfileDto> {
    return this.profileService.getProfile(user.id);
  }

  /**
   * Update user profile information
   * PUT /profile
   */
  @Put()
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() updateProfileDto: UpdateProfileDto
  ): Promise<UserProfileDto> {
    return this.profileService.updateProfile(user.id, updateProfileDto);
  }

  /**
   * Update user preferences
   * PUT /profile/preferences
   */
  @Put('preferences')
  async updatePreferences(
    @CurrentUser() user: AuthenticatedUser,
    @Body() updatePreferencesDto: UpdatePreferencesDto
  ): Promise<UserProfileDto> {
    return this.profileService.updatePreferences(user.id, updatePreferencesDto);
  }

  /**
   * Change user password
   * PUT /profile/password
   */
  @Put('password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() changePasswordDto: ChangePasswordDto
  ): Promise<{ message: string }> {
    return this.profileService.changePassword(user.id, changePasswordDto);
  }

  /**
   * Delete user account (soft delete)
   * DELETE /profile
   */
  @Delete()
  @HttpCode(HttpStatus.OK)
  async deleteAccount(@CurrentUser() user: AuthenticatedUser): Promise<{ message: string }> {
    return this.profileService.deleteAccount(user.id);
  }
}
