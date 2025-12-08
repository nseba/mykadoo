import { Controller, Get, Post, Query, Body, Param } from '@nestjs/common';
import { ShareASaleService, ShareASaleSearchParams } from './shareasale.service';

@Controller('affiliate/shareasale')
export class ShareASaleController {
  constructor(private readonly shareasaleService: ShareASaleService) {}

  @Get('search')
  async searchProducts(@Query() params: ShareASaleSearchParams) {
    const products = await this.shareasaleService.searchProducts(params);

    return {
      success: true,
      total: products.length,
      products,
    };
  }

  @Get('merchants')
  async getMerchantList() {
    const merchants = await this.shareasaleService.getMerchantList();

    return {
      success: true,
      merchants,
    };
  }

  @Get('merchants/:merchantId/feed')
  async downloadMerchantFeed(@Param('merchantId') merchantId: string) {
    const feed = await this.shareasaleService.downloadMerchantFeed(merchantId);

    return {
      success: true,
      feed,
    };
  }

  @Get('merchants/:merchantId/products/:productId')
  async getProductDetails(
    @Param('merchantId') merchantId: string,
    @Param('productId') productId: string
  ) {
    const product = await this.shareasaleService.getProductDetails(merchantId, productId);

    if (!product) {
      return {
        success: false,
        message: 'Product not found',
      };
    }

    return {
      success: true,
      product,
    };
  }

  @Get('link/generate')
  async generateAffiliateLink(
    @Query('merchantId') merchantId: string,
    @Query('productUrl') productUrl: string,
    @Query('bannerId') bannerId?: string
  ) {
    const link = this.shareasaleService.generateAffiliateLink(merchantId, productUrl, bannerId);

    return {
      success: true,
      link,
    };
  }

  @Get('reports/merchant')
  async getMerchantReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('merchantId') merchantId?: string
  ) {
    const report = await this.shareasaleService.getMerchantReport(startDate, endDate, merchantId);

    return {
      success: true,
      report,
    };
  }

  @Post('postback/conversion')
  async handleConversionPostback(@Body() body: any) {
    // Validate postback authentication
    const isValid = this.shareasaleService.validatePostback(body);

    if (!isValid) {
      return {
        success: false,
        message: 'Invalid postback authentication',
      };
    }

    await this.shareasaleService.processConversionPostback({
      transactionId: body.transactionId,
      merchantId: body.merchantId,
      amount: parseFloat(body.amount),
      commission: parseFloat(body.commission),
      status: body.status,
      clickId: body.clickId,
    });

    return {
      success: true,
      message: 'Conversion processed',
    };
  }

  @Get('cache/stats')
  async getCacheStats() {
    const stats = this.shareasaleService.getCacheStats();

    return {
      success: true,
      cache: stats,
    };
  }

  @Post('cache/clear')
  async clearCache() {
    this.shareasaleService.clearCache();

    return {
      success: true,
      message: 'Cache cleared',
    };
  }
}
