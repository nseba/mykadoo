import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  SemanticSearchService,
  SemanticSearchResult,
  QueryMetrics,
  ExpandedQuery,
} from './semantic-search.service';
import {
  SearchQualityService,
  SearchQualityMetrics,
} from './search-quality.service';
import {
  SemanticSearchDto,
  TrackSearchClickDto,
  TrackSearchConversionDto,
  TrackDwellTimeDto,
  TrackRefinementDto,
  SearchQualityMetricsDto,
} from './dto';

/**
 * Semantic search response
 */
interface SemanticSearchResponse {
  results: SemanticSearchResult[];
  count: number;
  metrics: QueryMetrics;
  expandedQuery?: ExpandedQuery;
}

/**
 * Controller for semantic search operations
 */
@Controller('semantic-search')
export class SemanticSearchController {
  private readonly logger = new Logger(SemanticSearchController.name);

  constructor(
    private readonly semanticSearchService: SemanticSearchService,
    private readonly searchQualityService: SearchQualityService
  ) {}

  /**
   * POST /api/semantic-search
   * Perform semantic search with RRF ranking
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  async search(@Body() dto: SemanticSearchDto): Promise<SemanticSearchResponse> {
    this.logger.log(`Semantic search: "${dto.query.substring(0, 50)}..."`);

    const { results, metrics, expandedQuery } = await this.semanticSearchService.search(
      dto.query,
      {
        limit: dto.limit,
        category: dto.category,
        minPrice: dto.minPrice,
        maxPrice: dto.maxPrice,
        rrfK: dto.rrfK,
        enableExpansion: dto.enableExpansion,
        enableReranking: dto.enableReranking,
        userId: dto.userId,
        sessionId: dto.sessionId,
        minSimilarity: dto.minSimilarity,
      }
    );

    // Track the search for quality metrics
    this.searchQualityService.trackSearch({
      queryId: metrics.queryId,
      query: dto.query,
      resultCount: results.length,
      userId: dto.userId,
      sessionId: dto.sessionId,
      latencyMs: metrics.latencyMs,
      expansionUsed: metrics.expansionUsed,
      rerankingApplied: metrics.rerankingApplied,
    });

    return {
      results,
      count: results.length,
      metrics,
      expandedQuery,
    };
  }

  /**
   * GET /api/semantic-search
   * Semantic search via query params (for simple GET requests)
   */
  @Get()
  async searchGet(
    @Query('q') query: string,
    @Query('limit') limit?: number,
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('userId') userId?: string,
    @Query('sessionId') sessionId?: string
  ): Promise<SemanticSearchResponse> {
    return this.search({
      query,
      limit,
      category,
      minPrice,
      maxPrice,
      userId,
      sessionId,
    });
  }

  /**
   * POST /api/semantic-search/expand
   * Expand a query with synonyms and related terms
   */
  @Post('expand')
  @HttpCode(HttpStatus.OK)
  async expandQuery(@Body('query') query: string): Promise<ExpandedQuery> {
    this.logger.log(`Expanding query: "${query}"`);
    return this.semanticSearchService.expandQuery(query);
  }

  /**
   * POST /api/semantic-search/track/click
   * Track click on search result
   */
  @Post('track/click')
  @HttpCode(HttpStatus.NO_CONTENT)
  trackClick(@Body() dto: TrackSearchClickDto): void {
    this.searchQualityService.trackClick({
      queryId: dto.queryId,
      query: dto.query,
      productId: dto.productId,
      position: dto.position,
      userId: dto.userId,
      sessionId: dto.sessionId,
    });
  }

  /**
   * POST /api/semantic-search/track/conversion
   * Track conversion from search result
   */
  @Post('track/conversion')
  @HttpCode(HttpStatus.NO_CONTENT)
  trackConversion(@Body() dto: TrackSearchConversionDto): void {
    this.searchQualityService.trackPurchase({
      queryId: dto.queryId,
      query: dto.query,
      productId: dto.productId,
      position: dto.position,
      userId: dto.userId,
      sessionId: dto.sessionId,
    });
  }

  /**
   * POST /api/semantic-search/track/dwell
   * Track dwell time on product page
   */
  @Post('track/dwell')
  @HttpCode(HttpStatus.NO_CONTENT)
  trackDwellTime(@Body() dto: TrackDwellTimeDto): void {
    this.searchQualityService.trackDwellTime({
      queryId: dto.queryId,
      query: dto.query,
      productId: dto.productId,
      dwellTimeMs: dto.dwellTimeMs,
      userId: dto.userId,
      sessionId: dto.sessionId,
    });
  }

  /**
   * POST /api/semantic-search/track/refinement
   * Track query refinement
   */
  @Post('track/refinement')
  @HttpCode(HttpStatus.NO_CONTENT)
  trackRefinement(@Body() dto: TrackRefinementDto): void {
    this.searchQualityService.trackRefinement({
      originalQueryId: dto.originalQueryId,
      newQueryId: dto.newQueryId,
      originalQuery: dto.originalQuery,
      newQuery: dto.newQuery,
      userId: dto.userId,
      sessionId: dto.sessionId,
    });
  }

  /**
   * GET /api/semantic-search/quality/metrics
   * Get search quality metrics
   */
  @Get('quality/metrics')
  async getQualityMetrics(
    @Query() query: SearchQualityMetricsDto
  ): Promise<SearchQualityMetrics> {
    const startDate = new Date(query.startDate);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    return this.searchQualityService.getMetrics(startDate, endDate);
  }

  /**
   * GET /api/semantic-search/quality/precision-recall
   * Get precision and recall estimates
   */
  @Get('quality/precision-recall')
  async getPrecisionRecall(
    @Query() query: SearchQualityMetricsDto
  ): Promise<{
    estimatedPrecision: number;
    estimatedRecall: number;
    ndcg: number;
    sampleSize: number;
  }> {
    const startDate = new Date(query.startDate);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    return this.searchQualityService.getPrecisionRecall(startDate, endDate);
  }
}
