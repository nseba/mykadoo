import { Controller, Get, Post, Query, Body, Param } from '@nestjs/common';
import { CJService, CJSearchParams } from './cj.service';

@Controller('affiliate/cj')
export class CJController {
  constructor(private readonly cjService: CJService) {}

  @Get('search')
  async searchProducts(@Query() params: CJSearchParams) {
    const products = await this.cjService.searchProducts(params);

    return {
      success: true,
      total: products.length,
      products,
    };
  }

  @Get('advertisers')
  async getAdvertiserList(
    @Query('keywords') keywords?: string,
    @Query('status') status?: 'joined' | 'notjoined' | 'all',
    @Query('page') page?: string,
    @Query('perPage') perPage?: string
  ) {
    const advertisers = await this.cjService.getAdvertiserList({
      keywords,
      status,
      page: page ? parseInt(page) : 1,
      perPage: perPage ? parseInt(perPage) : 100,
    });

    return {
      success: true,
      total: advertisers.length,
      advertisers,
    };
  }

  @Get('advertisers/:advertiserId/products/:sku')
  async getProductDetails(
    @Param('advertiserId') advertiserId: string,
    @Param('sku') sku: string
  ) {
    const product = await this.cjService.getProductDetails(advertiserId, sku);

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

  @Get('advertisers/:advertiserId/commissions')
  async getCommissionDetails(@Param('advertiserId') advertiserId: string) {
    const commissions = await this.cjService.getCommissionDetails(advertiserId);

    return {
      success: true,
      commissions,
    };
  }

  @Get('link/generate')
  async generateAffiliateLink(
    @Query('advertiserId') advertiserId: string,
    @Query('productUrl') productUrl: string
  ) {
    const link = this.cjService.generateAffiliateLink(advertiserId, productUrl);

    return {
      success: true,
      link,
    };
  }

  @Get('reports/performance')
  async getPerformanceReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    const report = await this.cjService.getPerformanceReport(startDate, endDate);

    return {
      success: true,
      report,
    };
  }

  @Post('postback/conversion')
  async handleConversionPostback(@Body() body: any) {
    // Validate postback signature
    const signature = body.signature || '';
    const isValid = this.cjService.validatePostback(body, signature);

    if (!isValid) {
      return {
        success: false,
        message: 'Invalid postback signature',
      };
    }

    await this.cjService.processConversionPostback({
      actionTrackerId: body.actionTrackerId || body['action-tracker-id'],
      advertiserId: body.advertiserId || body['advertiser-id'] || body.cid,
      commissionId: body.commissionId || body['commission-id'],
      orderId: body.orderId || body['order-id'],
      saleAmount: parseFloat(body.saleAmount || body['sale-amount'] || '0'),
      commission: parseFloat(body.commission || body['commission-amount'] || '0'),
      eventDate: body.eventDate || body['event-date'],
      clickId: body.clickId,
    });

    return {
      success: true,
      message: 'Conversion processed',
    };
  }

  @Get('cache/stats')
  async getCacheStats() {
    const stats = this.cjService.getCacheStats();

    return {
      success: true,
      cache: stats,
    };
  }

  @Post('cache/clear')
  async clearCache() {
    this.cjService.clearCache();

    return {
      success: true,
      message: 'Cache cleared',
    };
  }
}
