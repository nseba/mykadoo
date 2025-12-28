import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Query,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  SimilarityAnalyticsService,
  SimilarityMetrics,
  VariantMetrics,
  ProductAnalytics,
  ABTestConfig,
  RecommendationVariant,
} from './similarity-analytics.service';
import {
  DateRangeDto,
  TrackSearchDto,
  TrackImpressionDto,
  TrackClickDto,
  TrackConversionDto,
  UpdateABTestDto,
  GetTopProductsDto,
  AssignVariantDto,
} from './dto';

@Controller('api/similarity-analytics')
export class SimilarityAnalyticsController {
  constructor(private readonly analyticsService: SimilarityAnalyticsService) {}

  /**
   * Assign A/B test variant to user/session
   */
  @Post('variant')
  @HttpCode(HttpStatus.OK)
  assignVariant(@Body() dto: AssignVariantDto): { variant: RecommendationVariant } {
    const variant = this.analyticsService.assignVariant(dto.userId, dto.sessionId);
    return { variant };
  }

  /**
   * Track similarity search event
   */
  @Post('track/search')
  @HttpCode(HttpStatus.NO_CONTENT)
  async trackSearch(@Body() dto: TrackSearchDto): Promise<void> {
    await this.analyticsService.trackSearch(dto.sourceProductId, {
      userId: dto.userId,
      sessionId: dto.sessionId,
      variant: dto.variant,
      recommendedProductIds: dto.recommendedProductIds,
      searchThreshold: dto.searchThreshold,
    });
  }

  /**
   * Track impression event (user saw recommendations)
   */
  @Post('track/impression')
  @HttpCode(HttpStatus.NO_CONTENT)
  async trackImpression(@Body() dto: TrackImpressionDto): Promise<void> {
    await this.analyticsService.trackImpression(
      dto.sourceProductId,
      dto.recommendedProductIds,
      {
        userId: dto.userId,
        sessionId: dto.sessionId,
        variant: dto.variant,
      }
    );
  }

  /**
   * Track click on recommended product
   */
  @Post('track/click')
  @HttpCode(HttpStatus.NO_CONTENT)
  async trackClick(@Body() dto: TrackClickDto): Promise<void> {
    await this.analyticsService.trackClick(
      dto.sourceProductId,
      dto.clickedProductId,
      dto.position,
      {
        userId: dto.userId,
        sessionId: dto.sessionId,
        variant: dto.variant,
      }
    );
  }

  /**
   * Track conversion from recommendation
   */
  @Post('track/conversion')
  @HttpCode(HttpStatus.NO_CONTENT)
  async trackConversion(@Body() dto: TrackConversionDto): Promise<void> {
    await this.analyticsService.trackConversion(dto.sourceProductId, dto.convertedProductId, {
      userId: dto.userId,
      sessionId: dto.sessionId,
      variant: dto.variant,
      position: dto.position,
    });
  }

  /**
   * Get similarity analytics metrics
   */
  @Get('metrics')
  async getMetrics(@Query() query: DateRangeDto): Promise<SimilarityMetrics> {
    const startDate = new Date(query.startDate);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    return this.analyticsService.getMetrics(startDate, endDate);
  }

  /**
   * Get A/B test results
   */
  @Get('ab-test/results')
  async getABTestResults(
    @Query('testName') testName?: string
  ): Promise<{
    testName: string;
    startDate: Date;
    endDate?: Date;
    isActive: boolean;
    results: VariantMetrics[];
    winner?: RecommendationVariant;
    significance?: number;
  }> {
    return this.analyticsService.getABTestResults(testName);
  }

  /**
   * Get current A/B test configuration
   */
  @Get('ab-test/config')
  getCurrentABTest(): ABTestConfig {
    return this.analyticsService.getCurrentABTest();
  }

  /**
   * Update A/B test configuration
   */
  @Put('ab-test/config')
  async updateABTest(@Body() dto: UpdateABTestDto): Promise<ABTestConfig> {
    return this.analyticsService.updateABTest(dto);
  }

  /**
   * End current A/B test
   */
  @Delete('ab-test')
  async endABTest(): Promise<ABTestConfig> {
    return this.analyticsService.endABTest();
  }

  /**
   * Get top source products (products that generate good recommendations)
   */
  @Get('top-source-products')
  async getTopSourceProducts(@Query() query: GetTopProductsDto): Promise<ProductAnalytics[]> {
    const startDate = new Date(query.startDate);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    const limit = query.limit || 10;
    return this.analyticsService.getTopSourceProducts(startDate, endDate, limit);
  }

  /**
   * Get top recommended products (frequently recommended and clicked)
   */
  @Get('top-recommended-products')
  async getTopRecommendedProducts(@Query() query: GetTopProductsDto): Promise<ProductAnalytics[]> {
    const startDate = new Date(query.startDate);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    const limit = query.limit || 10;
    return this.analyticsService.getTopRecommendedProducts(startDate, endDate, limit);
  }
}
