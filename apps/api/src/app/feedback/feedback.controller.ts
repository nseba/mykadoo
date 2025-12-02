/**
 * Feedback Controller
 *
 * REST API endpoints for user feedback, analytics, and learned patterns
 */

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
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
  DefaultValuePipe,
  ParseFloatPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import {
  CreateFeedbackDto,
  FeedbackSubmissionResponseDto,
  FeedbackListDto,
  AnalyticsSummaryDto,
  PatternsListDto,
} from './dto';

/**
 * Feedback Controller
 *
 * Handles feedback submission, retrieval, analytics, and pattern queries
 */
@ApiTags('feedback')
@Controller('feedback')
export class FeedbackController {
  private readonly logger = new Logger(FeedbackController.name);

  constructor(private readonly feedbackService: FeedbackService) {}

  /**
   * Submit user feedback
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({
    summary: 'Submit user feedback',
    description:
      'Record user interaction with search results (view, click, purchase, like, etc.)',
  })
  @ApiResponse({
    status: 201,
    description: 'Feedback submitted successfully',
    type: FeedbackSubmissionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid feedback data',
  })
  async submitFeedback(
    @Body() dto: CreateFeedbackDto
  ): Promise<FeedbackSubmissionResponseDto> {
    this.logger.log(
      `Submitting feedback: ${dto.action} for product ${dto.productId}`
    );
    return this.feedbackService.submitFeedback(dto);
  }

  /**
   * Get feedback for a specific search
   */
  @Get('search/:searchId')
  @ApiOperation({
    summary: 'Get feedback for a search',
    description: 'Retrieve all feedback items related to a specific search',
  })
  @ApiParam({
    name: 'searchId',
    description: 'Search ID',
    example: 'search_1234567890',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Feedback retrieved successfully',
    type: FeedbackListDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Search not found',
  })
  async getFeedbackBySearch(
    @Param('searchId') searchId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number
  ): Promise<FeedbackListDto> {
    this.logger.log(`Getting feedback for search ${searchId}`);
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    return this.feedbackService.getFeedbackBySearch(searchId, page, safeLimit);
  }

  /**
   * Get feedback for a specific product
   */
  @Get('product/:productId')
  @ApiOperation({
    summary: 'Get feedback for a product',
    description: 'Retrieve all feedback items related to a specific product',
  })
  @ApiParam({
    name: 'productId',
    description: 'Product ID',
    example: 'prod_abc123',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Feedback retrieved successfully',
    type: FeedbackListDto,
  })
  async getFeedbackByProduct(
    @Param('productId') productId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number
  ): Promise<FeedbackListDto> {
    this.logger.log(`Getting feedback for product ${productId}`);
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    return this.feedbackService.getFeedbackByProduct(productId, page, safeLimit);
  }

  /**
   * Get analytics summary
   */
  @Get('analytics')
  @ApiOperation({
    summary: 'Get analytics summary',
    description:
      'Retrieve aggregated analytics including CTR, conversion rates, and category performance',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date for analytics (ISO 8601)',
    example: '2024-01-01T00:00:00Z',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date for analytics (ISO 8601)',
    example: '2024-01-31T23:59:59Z',
  })
  @ApiResponse({
    status: 200,
    description: 'Analytics retrieved successfully',
    type: AnalyticsSummaryDto,
  })
  async getAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ): Promise<AnalyticsSummaryDto> {
    this.logger.log('Getting analytics summary');

    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return this.feedbackService.getAnalytics(start, end);
  }

  /**
   * Get learned recommendation patterns
   */
  @Get('patterns')
  @ApiOperation({
    summary: 'Get learned patterns',
    description:
      'Retrieve recommendation patterns learned from user feedback',
  })
  @ApiQuery({
    name: 'minConfidence',
    required: false,
    type: Number,
    description: 'Minimum confidence threshold (0-1, default: 0.7)',
    example: 0.7,
  })
  @ApiResponse({
    status: 200,
    description: 'Patterns retrieved successfully',
    type: PatternsListDto,
  })
  async getPatterns(
    @Query('minConfidence', new DefaultValuePipe(0.7), ParseFloatPipe)
    minConfidence: number
  ): Promise<PatternsListDto> {
    this.logger.log(`Getting patterns with min confidence ${minConfidence}`);
    const safeConfidence = Math.min(Math.max(minConfidence, 0), 1);
    return this.feedbackService.getPatterns(safeConfidence);
  }

  /**
   * Get user feedback statistics
   */
  @Get('user/:userId/stats')
  @ApiOperation({
    summary: 'Get user feedback statistics',
    description: 'Retrieve feedback statistics for a specific user',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    example: 'user_abc123',
  })
  @ApiResponse({
    status: 200,
    description: 'User statistics retrieved successfully',
  })
  async getUserStats(@Param('userId') userId: string) {
    this.logger.log(`Getting feedback stats for user ${userId}`);
    return this.feedbackService.getUserStats(userId);
  }

  /**
   * Health check for feedback service
   */
  @Get('health')
  @ApiOperation({
    summary: 'Feedback service health check',
    description: 'Check if feedback service is operational',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
  })
  health() {
    return {
      status: 'ok',
      service: 'feedback',
      timestamp: new Date().toISOString(),
    };
  }
}
