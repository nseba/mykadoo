import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { RecommendationEngineService } from './recommendation-engine.service';
import { UserPreferenceService, InteractionType } from './user-preference.service';
import { AIIntegrationService } from './ai-integration.service';
import {
  GetRecommendationsDto,
  GetSimilarProductsDto,
  TrackInteractionDto,
  UpdateUserPreferencesDto,
  LearnFromSearchDto,
  RecommendationResponseDto,
  UserProfileResponseDto,
} from './dto/recommendation.dto';

@ApiTags('Recommendations')
@Controller('recommendations')
export class RecommendationController {
  private readonly logger = new Logger(RecommendationController.name);

  constructor(
    private readonly recommendationEngine: RecommendationEngineService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly aiIntegrationService: AIIntegrationService
  ) {}

  /**
   * Get personalized recommendations
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get personalized recommendations' })
  @ApiResponse({
    status: 200,
    description: 'Returns personalized recommendations',
    type: [RecommendationResponseDto],
  })
  async getRecommendations(
    @Body() dto: GetRecommendationsDto
  ): Promise<RecommendationResponseDto[]> {
    this.logger.debug(`Getting recommendations for context: ${JSON.stringify(dto.context)}`);

    const recommendations = await this.recommendationEngine.getRecommendations(
      dto.context,
      dto.options || {}
    );

    return recommendations.map(rec => ({
      id: rec.id,
      title: rec.title,
      description: rec.description || undefined,
      price: rec.price,
      category: rec.category || undefined,
      imageUrl: rec.imageUrl || undefined,
      score: rec.score,
      explanation: rec.explanation
        ? {
            primaryReason: rec.explanation.primaryReason,
            factors: rec.explanation.factors.map(f => ({
              type: f.type,
              description: f.description,
              weight: f.weight,
            })),
            confidence: rec.explanation.confidence,
          }
        : undefined,
    }));
  }

  /**
   * Get similar products
   */
  @Post('similar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get products similar to a given product' })
  @ApiResponse({
    status: 200,
    description: 'Returns similar products',
    type: [RecommendationResponseDto],
  })
  async getSimilarProducts(
    @Body() dto: GetSimilarProductsDto
  ): Promise<RecommendationResponseDto[]> {
    this.logger.debug(`Getting similar products for: ${dto.productId}`);

    const recommendations = await this.recommendationEngine.getSimilarProducts(
      dto.productId,
      dto.context || {},
      dto.options || {}
    );

    return recommendations.map(rec => ({
      id: rec.id,
      title: rec.title,
      description: rec.description || undefined,
      price: rec.price,
      category: rec.category || undefined,
      imageUrl: rec.imageUrl || undefined,
      score: rec.score,
      explanation: rec.explanation
        ? {
            primaryReason: rec.explanation.primaryReason,
            factors: rec.explanation.factors.map(f => ({
              type: f.type,
              description: f.description,
              weight: f.weight,
            })),
            confidence: rec.explanation.confidence,
          }
        : undefined,
    }));
  }

  /**
   * Get trending recommendations
   */
  @Get('trending')
  @ApiOperation({ summary: 'Get trending product recommendations' })
  @ApiResponse({
    status: 200,
    description: 'Returns trending products',
    type: [RecommendationResponseDto],
  })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of results' })
  async getTrendingRecommendations(
    @Query('category') category?: string,
    @Query('limit') limit?: number
  ): Promise<RecommendationResponseDto[]> {
    this.logger.debug(`Getting trending recommendations, category: ${category}`);

    const recommendations = await this.recommendationEngine.getTrendingRecommendations(
      { categories: category ? [category] : undefined },
      { limit: limit || 20 }
    );

    return recommendations.map(rec => ({
      id: rec.id,
      title: rec.title,
      description: rec.description || undefined,
      price: rec.price,
      category: rec.category || undefined,
      imageUrl: rec.imageUrl || undefined,
      score: rec.score,
      explanation: rec.explanation
        ? {
            primaryReason: rec.explanation.primaryReason,
            factors: rec.explanation.factors.map(f => ({
              type: f.type,
              description: f.description,
              weight: f.weight,
            })),
            confidence: rec.explanation.confidence,
          }
        : undefined,
    }));
  }

  /**
   * Get personalized recommendations for a user (simplified endpoint)
   */
  @Get('personalized/:userId')
  @ApiOperation({ summary: 'Get personalized recommendations for a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of results' })
  @ApiResponse({
    status: 200,
    description: 'Returns personalized recommendations',
    type: [RecommendationResponseDto],
  })
  async getPersonalizedForUser(
    @Param('userId') userId: string,
    @Query('limit') limit?: number
  ): Promise<RecommendationResponseDto[]> {
    this.logger.debug(`Getting personalized recommendations for user: ${userId}`);

    const results = await this.aiIntegrationService.getPersonalizedRecommendations(
      userId,
      limit || 20
    );

    return results.map(r => ({
      id: r.id,
      title: r.metadata.productName,
      description: r.metadata.description || undefined,
      price: r.metadata.price,
      category: r.metadata.category || undefined,
      imageUrl: r.metadata.imageUrl || undefined,
      score: r.score,
    }));
  }

  /**
   * Track user interaction
   */
  @Post('track')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Track user interaction for preference learning' })
  @ApiResponse({
    status: 201,
    description: 'Interaction tracked successfully',
  })
  async trackInteraction(@Body() dto: TrackInteractionDto): Promise<{ success: boolean }> {
    this.logger.debug(
      `Tracking ${dto.interactionType} for user ${dto.userId}, product: ${dto.productId}`
    );

    await this.userPreferenceService.recordInteraction({
      userId: dto.userId,
      productId: dto.productId,
      searchQuery: dto.searchQuery,
      interactionType: dto.interactionType as InteractionType,
      timestamp: new Date(),
      metadata: dto.metadata,
    });

    return { success: true };
  }

  /**
   * Update user preferences
   */
  @Post('preferences/update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Recalculate user preference embedding' })
  @ApiResponse({
    status: 200,
    description: 'Preferences updated successfully',
  })
  async updateUserPreferences(
    @Body() dto: UpdateUserPreferencesDto
  ): Promise<{ success: boolean }> {
    this.logger.debug(`Updating preferences for user: ${dto.userId}`);

    await this.userPreferenceService.updateUserPreferences(dto.userId);

    return { success: true };
  }

  /**
   * Learn from search
   */
  @Post('learn/search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update preferences based on search query' })
  @ApiResponse({
    status: 200,
    description: 'Search preference learned',
  })
  async learnFromSearch(@Body() dto: LearnFromSearchDto): Promise<{ success: boolean }> {
    this.logger.debug(`Learning from search for user: ${dto.userId}, query: ${dto.searchQuery}`);

    await this.userPreferenceService.learnFromSearch(dto.userId, dto.searchQuery);

    return { success: true };
  }

  /**
   * Get user profile
   */
  @Get('profile/:userId')
  @ApiOperation({ summary: 'Get user preference profile' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns user profile',
    type: UserProfileResponseDto,
  })
  async getUserProfile(@Param('userId') userId: string): Promise<UserProfileResponseDto | null> {
    this.logger.debug(`Getting profile for user: ${userId}`);

    const profile = await this.userPreferenceService.getUserProfile(userId);

    if (!profile) {
      return null;
    }

    return {
      userId: profile.userId,
      interactionCount: profile.interactionCount,
      lastUpdated: profile.lastUpdated,
      topCategories: profile.topCategories,
      priceRange: profile.priceRange,
      hasPreferenceEmbedding: !!profile.preferenceEmbedding,
    };
  }

  /**
   * Get similar users
   */
  @Get('users/:userId/similar')
  @ApiOperation({ summary: 'Find users with similar preferences' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of results' })
  @ApiResponse({
    status: 200,
    description: 'Returns similar users',
  })
  async getSimilarUsers(
    @Param('userId') userId: string,
    @Query('limit') limit?: number
  ): Promise<Array<{ userId: string; similarity: number }>> {
    this.logger.debug(`Getting similar users for: ${userId}`);

    return this.userPreferenceService.getSimilarUsers(userId, limit || 10);
  }

  /**
   * Get AI index statistics
   */
  @Get('stats')
  @ApiOperation({ summary: 'Get AI integration statistics' })
  @ApiResponse({
    status: 200,
    description: 'Returns index statistics',
  })
  async getStats() {
    return this.aiIntegrationService.getIndexStats();
  }
}
