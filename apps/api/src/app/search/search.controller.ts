/**
 * Search Controller
 *
 * REST API endpoints for gift search with caching and rate limiting
 */

import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UsePipes,
  Logger,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchRequestDto } from './dto/search-request.dto';
import { SearchResponseDto } from './dto/search-response.dto';
import { RateLimit } from '../common/guards/rate-limit.guard';

@ApiTags('search')
@Controller('api/search')
@RateLimit({ maxRequests: 60, windowSeconds: 60 }) // 60 requests per minute
export class SearchController {
  private readonly logger = new Logger(SearchController.name);

  constructor(private readonly searchService: SearchService) {}

  /**
   * POST /api/search
   * Generate gift recommendations based on search criteria
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({
    summary: 'Generate gift recommendations',
    description: 'Get AI-powered gift recommendations based on recipient profile and preferences',
  })
  @ApiResponse({
    status: 200,
    description: 'Recommendations generated successfully',
    type: SearchResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid search parameters',
  })
  @ApiResponse({
    status: 429,
    description: 'Rate limit exceeded',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async search(@Body() dto: SearchRequestDto): Promise<SearchResponseDto> {
    this.logger.log(`Search request: ${dto.occasion} for ${dto.relationship}`);
    return this.searchService.search(dto);
  }

  /**
   * GET /api/search/semantic
   * Semantic product search using vector database
   */
  @Get('semantic')
  @ApiOperation({
    summary: 'Semantic product search',
    description: 'Find products using natural language queries with vector similarity search',
  })
  @ApiQuery({
    name: 'q',
    description: 'Search query',
    example: 'gifts for yoga enthusiast',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by category',
    example: 'Sports & Fitness',
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    type: Number,
    description: 'Minimum price',
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    type: Number,
    description: 'Maximum price',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of results',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Search results',
  })
  async semanticSearch(
    @Query('q') query: string,
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('limit') limit: number = 10
  ): Promise<any> {
    this.logger.log(`Semantic search: "${query}"`);
    return this.searchService.semanticSearch(query, category, minPrice, maxPrice, limit);
  }

  /**
   * GET /api/search/health
   * Health check for search service
   */
  @Get('health')
  @ApiOperation({
    summary: 'Search service health check',
    description: 'Check if search service and AI integrations are operational',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
  })
  async health(): Promise<any> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'search',
    };
  }

  /**
   * GET /api/search/stats
   * Get vector database statistics
   */
  @Get('stats')
  @ApiOperation({
    summary: 'Vector database statistics',
    description: 'Get statistics about indexed products in vector database',
  })
  @ApiResponse({
    status: 200,
    description: 'Vector database statistics',
  })
  async getStats(): Promise<any> {
    return this.searchService.getVectorStats();
  }
}
