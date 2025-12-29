import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { VectorService } from './vector.service';
import {
  SimilaritySearchDto,
  HybridSearchDto,
  GenerateEmbeddingDto,
  BackfillEmbeddingsDto,
  SimilarProductsDto,
} from './dto';
import {
  VectorSearchResult,
  HybridSearchResult,
  EmbeddingStatus,
  EmbeddingCost,
} from './interfaces';

/**
 * Controller for vector search and embedding operations
 */
@Controller('vectors')
export class VectorController {
  private readonly logger = new Logger(VectorController.name);

  constructor(private readonly vectorService: VectorService) {}

  /**
   * POST /api/vectors/search
   * Semantic similarity search
   */
  @Post('search')
  @HttpCode(HttpStatus.OK)
  async semanticSearch(
    @Body() dto: SimilaritySearchDto
  ): Promise<{ results: VectorSearchResult[]; count: number }> {
    this.logger.log(`Semantic search: ${dto.query}`);

    const results = await this.vectorService.findSimilarProducts(dto.query, {
      matchThreshold: dto.matchThreshold,
      matchCount: dto.matchCount,
      categoryFilter: dto.categoryFilter,
      minPrice: dto.minPrice,
      maxPrice: dto.maxPrice,
    });

    return {
      results,
      count: results.length,
    };
  }

  /**
   * POST /api/vectors/hybrid-search
   * Combined keyword + semantic search
   */
  @Post('hybrid-search')
  @HttpCode(HttpStatus.OK)
  async hybridSearch(
    @Body() dto: HybridSearchDto
  ): Promise<{ results: HybridSearchResult[]; count: number }> {
    this.logger.log(`Hybrid search: ${dto.query}`);

    const results = await this.vectorService.hybridSearch(dto.query, {
      keywordWeight: dto.keywordWeight,
      semanticWeight: dto.semanticWeight,
      matchCount: dto.matchCount,
    });

    return {
      results,
      count: results.length,
    };
  }

  /**
   * GET /api/vectors/products/:id/similar
   * Find products similar to a given product
   */
  @Get('products/:id/similar')
  async getSimilarProducts(
    @Param('id') productId: string,
    @Query() query: SimilarProductsDto
  ): Promise<{ results: VectorSearchResult[]; count: number }> {
    this.logger.log(`Finding similar products for: ${productId}`);

    const results = await this.vectorService.findSimilarToProduct(productId, {
      matchThreshold: query.matchThreshold,
      matchCount: query.matchCount,
      categoryFilter: query.categoryFilter,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
    });

    return {
      results,
      count: results.length,
    };
  }

  /**
   * GET /api/vectors/recommendations/:userId
   * Get personalized recommendations for a user
   */
  @Get('recommendations/:userId')
  async getRecommendations(
    @Param('userId') userId: string,
    @Query('count') count?: number
  ): Promise<{ results: VectorSearchResult[]; count: number }> {
    this.logger.log(`Getting recommendations for user: ${userId}`);

    const results = await this.vectorService.getRecommendations(
      userId,
      count || 20
    );

    return {
      results,
      count: results.length,
    };
  }

  /**
   * POST /api/vectors/embed
   * Generate embedding for text (for testing/debugging)
   */
  @Post('embed')
  @HttpCode(HttpStatus.OK)
  async generateEmbedding(
    @Body() dto: GenerateEmbeddingDto
  ): Promise<{ dimensions: number; cost: EmbeddingCost }> {
    this.logger.log(`Generating embedding for text (${dto.text.length} chars)`);

    // This is mainly for testing - we don't return the full embedding
    // to avoid large response payloads
    const { embedding } = await this.vectorService['embeddingService'].generateEmbedding({
      text: dto.text,
      model: dto.model,
    });

    const cost = this.vectorService['embeddingService'].calculateCost(
      Math.ceil(dto.text.length / 4) // Approximate token count
    );

    return {
      dimensions: embedding.length,
      cost,
    };
  }

  /**
   * GET /api/vectors/status
   * Get embedding generation status
   */
  @Get('status')
  async getStatus(): Promise<EmbeddingStatus> {
    return this.vectorService.getEmbeddingStatus();
  }

  /**
   * GET /api/vectors/products/:id/has-embedding
   * Check if a product has an embedding
   */
  @Get('products/:id/has-embedding')
  async hasEmbedding(
    @Param('id') productId: string
  ): Promise<{ productId: string; hasEmbedding: boolean }> {
    const hasEmbedding = await this.vectorService.hasEmbedding(productId);
    return { productId, hasEmbedding };
  }

  /**
   * POST /api/vectors/backfill
   * Backfill embeddings for products without them
   * Note: This should be protected with admin authentication in production
   */
  @Post('backfill')
  @HttpCode(HttpStatus.OK)
  async backfillEmbeddings(
    @Body() dto: BackfillEmbeddingsDto
  ): Promise<{ processed: number; cost: EmbeddingCost }> {
    this.logger.log(
      `Backfilling embeddings (limit: ${dto.limit || 100}, batch: ${dto.batchSize || 50})`
    );

    const result = await this.vectorService.backfillEmbeddings(
      dto.limit || 100,
      dto.batchSize || 50
    );

    this.logger.log(
      `Backfill complete: ${result.processed} products, cost: $${result.cost.estimatedCost.toFixed(4)}`
    );

    return result;
  }

  /**
   * GET /api/vectors/products/missing
   * Get products that need embeddings generated
   */
  @Get('products/missing')
  async getProductsMissingEmbeddings(
    @Query('limit') limit?: number
  ): Promise<{
    products: Array<{ id: string; title: string }>;
    count: number;
  }> {
    const products = await this.vectorService.getProductsNeedingEmbeddings(
      limit || 100
    );

    return {
      products: products.map((p) => ({ id: p.id, title: p.title })),
      count: products.length,
    };
  }
}
