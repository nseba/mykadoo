import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  async getRevenueDashboard(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    const dashboard = await this.analyticsService.getRevenueDashboard({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    return {
      success: true,
      dashboard,
    };
  }

  @Get('products/top')
  async getTopProducts(
    @Query('metric') metric: 'clicks' | 'conversions' | 'revenue' | 'commission' = 'revenue',
    @Query('limit') limit?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const dateRange = startDate && endDate ? {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    } : undefined;

    const products = await this.analyticsService.getTopProducts(
      metric,
      limit ? parseInt(limit) : 10,
      dateRange
    );

    return {
      success: true,
      products,
    };
  }

  @Get('products/trending')
  async getTrendingProducts(@Query('limit') limit?: string) {
    const products = await this.analyticsService.getTrendingProducts(
      limit ? parseInt(limit) : 10
    );

    return {
      success: true,
      products,
    };
  }

  @Get('platforms/compare')
  async getPlatformComparison(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    const platforms = await this.analyticsService.getPlatformComparison({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    return {
      success: true,
      platforms,
    };
  }

  @Get('funnel')
  async getConversionFunnel(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    const funnel = await this.analyticsService.getConversionFunnel({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    return {
      success: true,
      funnel,
    };
  }

  @Get('export')
  async exportData(
    @Query('type') dataType: 'revenue' | 'products' | 'conversions',
    @Query('format') format: 'csv' | 'json',
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response
  ) {
    const data = await this.analyticsService.exportData(dataType, format, {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    const filename = `${dataType}-export-${startDate}-to-${endDate}.${format}`;

    res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(data);
  }
}
