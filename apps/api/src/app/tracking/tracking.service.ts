import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient, AffiliatePlatform } from '@prisma/client';

@Injectable()
export class TrackingService {
  private readonly logger = new Logger(TrackingService.name);
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async generateLink(params: {
    productId: string;
    userId?: string;
    searchId?: string;
    platform: AffiliatePlatform;
    baseUrl: string;
    campaignId?: string;
  }) {
    const trackingId = this.generateTrackingId();

    const link = await this.prisma.affiliateLink.create({
      data: {
        productId: params.productId,
        userId: params.userId,
        searchId: params.searchId,
        url: params.baseUrl,
        trackingId,
        platform: params.platform,
        campaignId: params.campaignId,
      },
    });

    this.logger.log(`Generated affiliate link: ${link.id} for product ${params.productId}`);
    return link;
  }

  async trackClick(linkId: string, metadata: {
    ipAddress?: string;
    userAgent?: string;
    referer?: string;
    userId?: string;
  }) {
    const link = await this.prisma.affiliateLink.findUnique({
      where: { id: linkId },
    });

    if (!link) {
      this.logger.warn(`Link not found: ${linkId}`);
      return null;
    }

    const click = await this.prisma.affiliateClick.create({
      data: {
        linkId,
        productId: link.productId,
        userId: metadata.userId || link.userId,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        referer: metadata.referer,
      },
    });

    // Update product click count
    await this.prisma.product.update({
      where: { id: link.productId },
      data: {
        clicks: { increment: 1 },
      },
    });

    this.logger.log(`Tracked click: ${click.id} for link ${linkId}`);
    return click;
  }

  async recordConversion(clickId: string, orderValue: number, commission: number) {
    const click = await this.prisma.affiliateClick.update({
      where: { id: clickId },
      data: {
        converted: true,
        convertedAt: new Date(),
        orderValue,
        commission,
      },
    });

    // Update product conversion count and revenue
    await this.prisma.product.update({
      where: { id: click.productId },
      data: {
        conversions: { increment: 1 },
        revenue: { increment: commission },
      },
    });

    this.logger.log(`Recorded conversion: ${clickId} - $${orderValue} (${commission} commission)`);
    return click;
  }

  async getClickStats(productId: string) {
    const [totalClicks, conversions, revenue] = await Promise.all([
      this.prisma.affiliateClick.count({ where: { productId } }),
      this.prisma.affiliateClick.count({ where: { productId, converted: true } }),
      this.prisma.affiliateClick.aggregate({
        where: { productId, converted: true },
        _sum: { commission: true },
      }),
    ]);

    return {
      totalClicks,
      conversions,
      conversionRate: totalClicks > 0 ? (conversions / totalClicks) * 100 : 0,
      totalRevenue: revenue._sum.commission || 0,
    };
  }

  private generateTrackingId(): string {
    return `trk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
