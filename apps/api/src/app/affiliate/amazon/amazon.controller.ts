import {
  Controller,
  Get,
  Query,
  Param,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { AmazonService, AmazonSearchParams } from './amazon.service';

@ApiTags('Affiliate - Amazon')
@Controller('affiliate/amazon')
export class AmazonController {
  private readonly logger = new Logger(AmazonController.name);

  constructor(private readonly amazonService: AmazonService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search Amazon products by keywords' })
  @ApiQuery({ name: 'keywords', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'minRating', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({
    name: 'itemsPerPage',
    required: false,
    type: Number,
    example: 10,
  })
  async searchProducts(
    @Query('keywords') keywords?: string,
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('minRating') minRating?: number,
    @Query('page') page = 1,
    @Query('itemsPerPage') itemsPerPage = 10
  ) {
    if (!keywords && !category) {
      throw new HttpException(
        'Either keywords or category must be provided',
        HttpStatus.BAD_REQUEST
      );
    }

    const searchParams: AmazonSearchParams = {
      keywords,
      categoryId: category,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minRating: minRating ? Number(minRating) : undefined,
      page: Number(page),
      itemsPerPage: Math.min(Number(itemsPerPage), 10),
    };

    this.logger.log(
      `Search request: ${JSON.stringify(searchParams)}`
    );

    try {
      const products = await this.amazonService.searchProducts(searchParams);

      return {
        success: true,
        count: products.length,
        page: searchParams.page,
        itemsPerPage: searchParams.itemsPerPage,
        products,
      };
    } catch (error) {
      this.logger.error(`Search failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get('product/:asin')
  @ApiOperation({ summary: 'Get Amazon product details by ASIN' })
  @ApiParam({ name: 'asin', type: String, example: 'B08N5WRWNW' })
  async getProduct(@Param('asin') asin: string) {
    if (!asin || asin.length !== 10) {
      throw new HttpException(
        'Invalid ASIN format. ASIN must be 10 characters.',
        HttpStatus.BAD_REQUEST
      );
    }

    this.logger.log(`Fetching product: ${asin}`);

    try {
      const product = await this.amazonService.getProductByAsin(asin);

      if (!product) {
        throw new HttpException(
          `Product with ASIN ${asin} not found`,
          HttpStatus.NOT_FOUND
        );
      }

      return {
        success: true,
        product,
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch product ${asin}: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  @Get('products')
  @ApiOperation({ summary: 'Get multiple Amazon products by ASINs' })
  @ApiQuery({
    name: 'asins',
    required: true,
    type: String,
    example: 'B08N5WRWNW,B07ZPKN6YR',
    description: 'Comma-separated list of ASINs',
  })
  async getProducts(@Query('asins') asins: string) {
    if (!asins) {
      throw new HttpException(
        'ASINs parameter is required',
        HttpStatus.BAD_REQUEST
      );
    }

    const asinArray = asins.split(',').map((asin) => asin.trim());

    if (asinArray.length === 0) {
      throw new HttpException(
        'At least one ASIN must be provided',
        HttpStatus.BAD_REQUEST
      );
    }

    if (asinArray.length > 50) {
      throw new HttpException(
        'Maximum 50 ASINs allowed per request',
        HttpStatus.BAD_REQUEST
      );
    }

    this.logger.log(`Fetching ${asinArray.length} products`);

    try {
      const products = await this.amazonService.getProductsByAsins(asinArray);

      return {
        success: true,
        count: products.length,
        requested: asinArray.length,
        products,
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch products: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  @Get('link/:asin')
  @ApiOperation({ summary: 'Generate affiliate link for a product' })
  @ApiParam({ name: 'asin', type: String, example: 'B08N5WRWNW' })
  @ApiQuery({
    name: 'trackingId',
    required: false,
    type: String,
    description: 'Optional internal tracking ID',
  })
  generateLink(
    @Param('asin') asin: string,
    @Query('trackingId') trackingId?: string
  ) {
    if (!asin || asin.length !== 10) {
      throw new HttpException(
        'Invalid ASIN format. ASIN must be 10 characters.',
        HttpStatus.BAD_REQUEST
      );
    }

    const link = this.amazonService.generateAffiliateLink(asin, trackingId);

    return {
      success: true,
      asin,
      trackingId,
      affiliateLink: link,
    };
  }

  @Get('cache/stats')
  @ApiOperation({ summary: 'Get cache statistics (admin only)' })
  getCacheStats() {
    const stats = this.amazonService.getCacheStats();

    return {
      success: true,
      cache: stats,
    };
  }

  @Get('cache/clear')
  @ApiOperation({ summary: 'Clear cache (admin only)' })
  clearCache() {
    this.amazonService.clearCache();

    return {
      success: true,
      message: 'Cache cleared successfully',
    };
  }
}
