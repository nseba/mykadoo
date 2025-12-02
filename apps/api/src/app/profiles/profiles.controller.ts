/**
 * Profiles Controller
 *
 * REST API endpoints for recipient profile management
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UsePipes,
  Logger,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileResponseDto, ProfileListResponseDto } from './dto/profile-response.dto';

@ApiTags('profiles')
@Controller('api/profiles')
@ApiBearerAuth()
export class ProfilesController {
  private readonly logger = new Logger(ProfilesController.name);

  constructor(private readonly profilesService: ProfilesService) {}

  /**
   * GET /api/profiles
   * Get all recipient profiles for the authenticated user
   */
  @Get()
  @ApiOperation({
    summary: 'Get all recipient profiles',
    description: 'Retrieve all saved recipient profiles with tier limit information',
  })
  @ApiResponse({
    status: 200,
    description: 'Profiles retrieved successfully',
    type: ProfileListResponseDto,
  })
  async findAll(
    @Query('userId') userId: string
  ): Promise<ProfileListResponseDto> {
    this.logger.log(`Get all profiles for user ${userId}`);
    return this.profilesService.findAll(userId);
  }

  /**
   * GET /api/profiles/:id
   * Get a single recipient profile by ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get recipient profile by ID',
    description: 'Retrieve a specific recipient profile',
  })
  @ApiParam({
    name: 'id',
    description: 'Profile ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    type: ProfileResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Profile not found',
  })
  async findOne(
    @Param('id') id: string,
    @Query('userId') userId: string
  ): Promise<ProfileResponseDto> {
    this.logger.log(`Get profile ${id} for user ${userId}`);
    return this.profilesService.findOne(userId, id);
  }

  /**
   * POST /api/profiles
   * Create a new recipient profile
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({
    summary: 'Create recipient profile',
    description: 'Create a new recipient profile (subject to tier limits)',
  })
  @ApiResponse({
    status: 201,
    description: 'Profile created successfully',
    type: ProfileResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 403,
    description: 'Tier limit reached',
  })
  async create(
    @Body() dto: CreateProfileDto,
    @Query('userId') userId: string
  ): Promise<ProfileResponseDto> {
    this.logger.log(`Create profile for user ${userId}`);
    return this.profilesService.create(userId, dto);
  }

  /**
   * PUT /api/profiles/:id
   * Update a recipient profile
   */
  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({
    summary: 'Update recipient profile',
    description: 'Update an existing recipient profile',
  })
  @ApiParam({
    name: 'id',
    description: 'Profile ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: ProfileResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Profile not found',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProfileDto,
    @Query('userId') userId: string
  ): Promise<ProfileResponseDto> {
    this.logger.log(`Update profile ${id} for user ${userId}`);
    return this.profilesService.update(userId, id, dto);
  }

  /**
   * DELETE /api/profiles/:id
   * Delete a recipient profile
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete recipient profile',
    description: 'Delete a recipient profile',
  })
  @ApiParam({
    name: 'id',
    description: 'Profile ID',
  })
  @ApiResponse({
    status: 204,
    description: 'Profile deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Profile not found',
  })
  async remove(
    @Param('id') id: string,
    @Query('userId') userId: string
  ): Promise<void> {
    this.logger.log(`Delete profile ${id} for user ${userId}`);
    return this.profilesService.remove(userId, id);
  }

  /**
   * POST /api/profiles/:id/gifts
   * Add gift to profile history
   */
  @Post(':id/gifts')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({
    summary: 'Add gift to history',
    description: 'Record a gift given to this recipient',
  })
  @ApiParam({
    name: 'id',
    description: 'Profile ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Gift added to history',
    type: ProfileResponseDto,
  })
  async addGiftToHistory(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Body()
    gift: {
      date: Date;
      productName: string;
      occasion: string;
      liked?: boolean;
      notes?: string;
    }
  ): Promise<ProfileResponseDto> {
    this.logger.log(`Add gift to profile ${id} for user ${userId}`);
    return this.profilesService.addGiftToHistory(userId, id, gift);
  }

  /**
   * GET /api/profiles/limits
   * Get tier limits information
   */
  @Get('meta/limits')
  @ApiOperation({
    summary: 'Get tier limits',
    description: 'Get profile limits for each subscription tier',
  })
  @ApiResponse({
    status: 200,
    description: 'Tier limits retrieved',
  })
  getTierLimits() {
    return this.profilesService.getTierLimits();
  }
}
