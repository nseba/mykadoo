import { Injectable, Logger } from '@nestjs/common';
import { AffiliatePlatform } from '@prisma/client';
import { PrismaService } from '../common/prisma';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface RevenueDashboard {
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
  totalRevenue: number;
  totalCommission: number;
  averageOrderValue: number;
  averageCommission: number;
  byPlatform: PlatformMetrics[];
  byDate: DateMetrics[];
  topProducts: ProductMetrics[];
}

export interface PlatformMetrics {
  platform: AffiliatePlatform;
  clicks: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  commission: number;
  averageCommission: number;
}

export interface DateMetrics {
  date: string;
  clicks: number;
  conversions: number;
  revenue: number;
  commission: number;
}

export interface ProductMetrics {
  productId: string;
  productTitle: string;
  platform: AffiliatePlatform;
  clicks: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  commission: number;
  clickThroughRate?: number;
}

export interface ExportFormat {
  format: 'csv' | 'json' | 'excel';
  data: any[];
  filename: string;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get comprehensive revenue dashboard
   */
  async getRevenueDashboard(dateRange: DateRange): Promise<RevenueDashboard> {
    this.logger.log(`Fetching revenue dashboard for ${dateRange.startDate} to ${dateRange.endDate}`);

    // Get all clicks and conversions within date range
    const clicks = await this.prisma.affiliateClick.findMany({
      where: {
        createdAt: {
          gte: dateRange.startDate,
          lte: dateRange.endDate,
        },
      },
      include: {
        link: {
          select: {
            platform: true,
            productId: true,
          },
        },
      },
    });

    const conversions = clicks.filter(c => c.converted);

    // Calculate overall metrics
    const totalClicks = clicks.length;
    const totalConversions = conversions.length;
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
    const totalRevenue = conversions.reduce((sum, c) => sum + (c.orderValue || 0), 0);
    const totalCommission = conversions.reduce((sum, c) => sum + (c.commission || 0), 0);
    const averageOrderValue = totalConversions > 0 ? totalRevenue / totalConversions : 0;
    const averageCommission = totalConversions > 0 ? totalCommission / totalConversions : 0;

    // Calculate metrics by platform
    const platformMap = new Map<AffiliatePlatform, any>();

    for (const click of clicks) {
      const platform = click.link.platform;

      if (!platformMap.has(platform)) {
        platformMap.set(platform, {
          platform,
          clicks: 0,
          conversions: 0,
          revenue: 0,
          commission: 0,
        });
      }

      const metrics = platformMap.get(platform);
      metrics.clicks++;

      if (click.converted) {
        metrics.conversions++;
        metrics.revenue += click.orderValue || 0;
        metrics.commission += click.commission || 0;
      }
    }

    const byPlatform: PlatformMetrics[] = Array.from(platformMap.values()).map(m => ({
      ...m,
      conversionRate: m.clicks > 0 ? (m.conversions / m.clicks) * 100 : 0,
      averageCommission: m.conversions > 0 ? m.commission / m.conversions : 0,
    }));

    // Calculate metrics by date
    const dateMap = new Map<string, any>();

    for (const click of clicks) {
      const date = click.createdAt.toISOString().split('T')[0];

      if (!dateMap.has(date)) {
        dateMap.set(date, {
          date,
          clicks: 0,
          conversions: 0,
          revenue: 0,
          commission: 0,
        });
      }

      const metrics = dateMap.get(date);
      metrics.clicks++;

      if (click.converted) {
        metrics.conversions++;
        metrics.revenue += click.orderValue || 0;
        metrics.commission += click.commission || 0;
      }
    }

    const byDate: DateMetrics[] = Array.from(dateMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    // Get top products
    const topProducts = await this.getTopProducts('revenue', 10, dateRange);

    return {
      totalClicks,
      totalConversions,
      conversionRate,
      totalRevenue,
      totalCommission,
      averageOrderValue,
      averageCommission,
      byPlatform,
      byDate,
      topProducts,
    };
  }

  /**
   * Get top products by metric
   */
  async getTopProducts(
    metric: 'clicks' | 'conversions' | 'revenue' | 'commission',
    limit: number = 10,
    dateRange?: DateRange
  ): Promise<ProductMetrics[]> {
    this.logger.log(`Fetching top ${limit} products by ${metric}`);

    const whereClause: any = {};

    if (dateRange) {
      whereClause.createdAt = {
        gte: dateRange.startDate,
        lte: dateRange.endDate,
      };
    }

    // Get all clicks grouped by product
    const clicks = await this.prisma.affiliateClick.groupBy({
      by: ['productId'],
      where: whereClause,
      _count: {
        id: true,
      },
      _sum: {
        orderValue: true,
        commission: true,
      },
    });

    // Get product details
    const productMetrics: ProductMetrics[] = [];

    for (const clickGroup of clicks) {
      const product = await this.prisma.product.findUnique({
        where: { id: clickGroup.productId },
      });

      if (!product) continue;

      const conversions = await this.prisma.affiliateClick.count({
        where: {
          productId: clickGroup.productId,
          converted: true,
          ...(dateRange && {
            createdAt: {
              gte: dateRange.startDate,
              lte: dateRange.endDate,
            },
          }),
        },
      });

      productMetrics.push({
        productId: product.id,
        productTitle: product.title,
        platform: product.platform,
        clicks: clickGroup._count.id,
        conversions,
        conversionRate: clickGroup._count.id > 0 ? (conversions / clickGroup._count.id) * 100 : 0,
        revenue: clickGroup._sum.orderValue || 0,
        commission: clickGroup._sum.commission || 0,
      });
    }

    // Sort by specified metric
    productMetrics.sort((a, b) => {
      switch (metric) {
        case 'clicks':
          return b.clicks - a.clicks;
        case 'conversions':
          return b.conversions - a.conversions;
        case 'revenue':
          return b.revenue - a.revenue;
        case 'commission':
          return b.commission - a.commission;
        default:
          return 0;
      }
    });

    return productMetrics.slice(0, limit);
  }

  /**
   * Get platform comparison analytics
   */
  async getPlatformComparison(dateRange: DateRange): Promise<PlatformMetrics[]> {
    this.logger.log('Fetching platform comparison analytics');

    const dashboard = await this.getRevenueDashboard(dateRange);
    return dashboard.byPlatform;
  }

  /**
   * Get conversion funnel analysis
   */
  async getConversionFunnel(dateRange: DateRange): Promise<{
    productViews: number;
    linkClicks: number;
    conversions: number;
    viewToClickRate: number;
    clickToConversionRate: number;
    overallConversionRate: number;
  }> {
    this.logger.log('Fetching conversion funnel analytics');

    // Product views (from search results or product displays)
    const productViews = await this.prisma.searchResult.count({
      where: {
        createdAt: {
          gte: dateRange.startDate,
          lte: dateRange.endDate,
        },
      },
    });

    // Link clicks
    const linkClicks = await this.prisma.affiliateClick.count({
      where: {
        createdAt: {
          gte: dateRange.startDate,
          lte: dateRange.endDate,
        },
      },
    });

    // Conversions
    const conversions = await this.prisma.affiliateClick.count({
      where: {
        createdAt: {
          gte: dateRange.startDate,
          lte: dateRange.endDate,
        },
        converted: true,
      },
    });

    const viewToClickRate = productViews > 0 ? (linkClicks / productViews) * 100 : 0;
    const clickToConversionRate = linkClicks > 0 ? (conversions / linkClicks) * 100 : 0;
    const overallConversionRate = productViews > 0 ? (conversions / productViews) * 100 : 0;

    return {
      productViews,
      linkClicks,
      conversions,
      viewToClickRate,
      clickToConversionRate,
      overallConversionRate,
    };
  }

  /**
   * Get trending products (products with increasing clicks/conversions)
   */
  async getTrendingProducts(limit: number = 10): Promise<ProductMetrics[]> {
    this.logger.log(`Fetching top ${limit} trending products`);

    // Compare last 7 days vs previous 7 days
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const recentProducts = await this.getTopProducts('clicks', 50, {
      startDate: sevenDaysAgo,
      endDate: now,
    });

    const previousProducts = await this.getTopProducts('clicks', 50, {
      startDate: fourteenDaysAgo,
      endDate: sevenDaysAgo,
    });

    // Calculate growth rate
    const productGrowth = recentProducts.map(recent => {
      const previous = previousProducts.find(p => p.productId === recent.productId);
      const previousClicks = previous?.clicks || 1; // Avoid division by zero
      const growthRate = ((recent.clicks - previousClicks) / previousClicks) * 100;

      return {
        ...recent,
        growthRate,
      };
    });

    // Sort by growth rate
    productGrowth.sort((a, b) => b.growthRate - a.growthRate);

    return productGrowth.slice(0, limit);
  }

  /**
   * Export data in specified format
   */
  async exportData(
    dataType: 'revenue' | 'products' | 'conversions',
    format: 'csv' | 'json',
    dateRange: DateRange
  ): Promise<string> {
    this.logger.log(`Exporting ${dataType} data as ${format}`);

    let data: any[];

    switch (dataType) {
      case 'revenue':
        const dashboard = await this.getRevenueDashboard(dateRange);
        data = dashboard.byDate;
        break;

      case 'products':
        data = await this.getTopProducts('revenue', 1000, dateRange);
        break;

      case 'conversions':
        const conversions = await this.prisma.affiliateClick.findMany({
          where: {
            converted: true,
            createdAt: {
              gte: dateRange.startDate,
              lte: dateRange.endDate,
            },
          },
          include: {
            link: {
              select: {
                platform: true,
                productId: true,
              },
            },
          },
        });
        data = conversions;
        break;

      default:
        data = [];
    }

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    }

    // CSV format
    if (data.length === 0) {
      return '';
    }

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in values
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
