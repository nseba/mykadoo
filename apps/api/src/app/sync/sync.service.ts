import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaClient, AffiliatePlatform, ProductAvailability } from '@prisma/client';
import { AmazonService } from '../affiliate/amazon/amazon.service';
import { ProductsService } from '../products/products.service';

export interface SyncJobData {
  platform: AffiliatePlatform;
  operation: 'full_sync' | 'price_update' | 'availability_check';
  searchTerms?: string[];
  productIds?: string[];
}

export interface SyncStats {
  platform: AffiliatePlatform;
  operation: string;
  productsProcessed: number;
  productsCreated: number;
  productsUpdated: number;
  productsFailed: number;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  errors: string[];
}

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);
  private readonly prisma: PrismaClient;

  constructor(
    @InjectQueue('product-sync') private syncQueue: Queue,
    private readonly amazonService: AmazonService,
    private readonly productsService: ProductsService
  ) {
    this.prisma = new PrismaClient();
  }

  /**
   * Daily full product sync from all platforms
   * Runs every day at midnight
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async scheduleFullSync() {
    this.logger.log('Scheduling daily full product sync');

    const searchTerms = [
      'gifts for him',
      'gifts for her',
      'birthday gifts',
      'anniversary gifts',
      'graduation gifts',
      'baby shower gifts',
      'wedding gifts',
      'christmas gifts',
      'valentines gifts',
      'mothers day gifts',
      'fathers day gifts',
      'tech gifts',
      'home decor gifts',
      'personalized gifts',
      'luxury gifts',
    ];

    await this.syncQueue.add('full-sync-amazon', {
      platform: AffiliatePlatform.AMAZON,
      operation: 'full_sync',
      searchTerms,
    } as SyncJobData, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    });

    this.logger.log('Full sync job queued for Amazon');
  }

  /**
   * Hourly price update job
   * Updates prices for all active products
   */
  @Cron(CronExpression.EVERY_HOUR)
  async schedulePriceUpdate() {
    this.logger.log('Scheduling hourly price update');

    // Get all active products (last synced within 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activeProducts = await this.prisma.product.findMany({
      where: {
        lastSyncedAt: {
          gte: sevenDaysAgo,
        },
        availability: {
          in: [ProductAvailability.IN_STOCK, ProductAvailability.UNKNOWN],
        },
      },
      select: {
        id: true,
        externalId: true,
        platform: true,
      },
      take: 1000, // Limit to 1000 products per hour
      orderBy: {
        clicks: 'desc', // Prioritize popular products
      },
    });

    if (activeProducts.length === 0) {
      this.logger.log('No active products found for price update');
      return;
    }

    // Group by platform
    const productsByPlatform = activeProducts.reduce((acc, product) => {
      if (!acc[product.platform]) {
        acc[product.platform] = [];
      }
      acc[product.platform].push(product.id);
      return acc;
    }, {} as Record<AffiliatePlatform, string[]>);

    // Queue price update jobs for each platform
    for (const [platform, productIds] of Object.entries(productsByPlatform)) {
      await this.syncQueue.add('price-update', {
        platform: platform as AffiliatePlatform,
        operation: 'price_update',
        productIds,
      } as SyncJobData, {
        attempts: 2,
        backoff: {
          type: 'fixed',
          delay: 3000,
        },
      });
    }

    this.logger.log(`Queued price updates for ${activeProducts.length} products across ${Object.keys(productsByPlatform).length} platforms`);
  }

  /**
   * Availability check job
   * Runs every 6 hours to check product availability
   */
  @Cron('0 */6 * * *')
  async scheduleAvailabilityCheck() {
    this.logger.log('Scheduling availability check');

    // Get products with unknown or in-stock status
    const products = await this.prisma.product.findMany({
      where: {
        availability: {
          in: [ProductAvailability.IN_STOCK, ProductAvailability.UNKNOWN],
        },
      },
      select: {
        id: true,
        platform: true,
      },
      take: 500,
      orderBy: {
        clicks: 'desc',
      },
    });

    if (products.length === 0) {
      this.logger.log('No products found for availability check');
      return;
    }

    const productsByPlatform = products.reduce((acc, product) => {
      if (!acc[product.platform]) {
        acc[product.platform] = [];
      }
      acc[product.platform].push(product.id);
      return acc;
    }, {} as Record<AffiliatePlatform, string[]>);

    for (const [platform, productIds] of Object.entries(productsByPlatform)) {
      await this.syncQueue.add('availability-check', {
        platform: platform as AffiliatePlatform,
        operation: 'availability_check',
        productIds,
      } as SyncJobData, {
        attempts: 2,
      });
    }

    this.logger.log(`Queued availability checks for ${products.length} products`);
  }

  /**
   * Process full sync job for Amazon
   */
  async processFullSync(data: SyncJobData): Promise<SyncStats> {
    const stats: SyncStats = {
      platform: data.platform,
      operation: 'full_sync',
      productsProcessed: 0,
      productsCreated: 0,
      productsUpdated: 0,
      productsFailed: 0,
      startTime: new Date(),
      errors: [],
    };

    this.logger.log(`Starting full sync for ${data.platform}`);

    try {
      if (data.platform === AffiliatePlatform.AMAZON) {
        for (const searchTerm of data.searchTerms || []) {
          try {
            const products = await this.amazonService.searchProducts({
              keywords: searchTerm,
              itemCount: 10,
            });

            for (const product of products) {
              try {
                const existing = await this.productsService.findByExternalId(
                  AffiliatePlatform.AMAZON,
                  product.ASIN
                );

                if (existing) {
                  await this.productsService.update(existing.id, {
                    title: product.title,
                    description: product.description,
                    imageUrl: product.imageUrl,
                    price: product.price,
                    salePrice: product.salePrice,
                    rating: product.rating,
                    reviewCount: product.reviewCount,
                    affiliateLink: product.affiliateLink,
                    availability: product.isAvailable ? ProductAvailability.IN_STOCK : ProductAvailability.OUT_OF_STOCK,
                    platform: AffiliatePlatform.AMAZON,
                    externalId: product.ASIN,
                  });
                  stats.productsUpdated++;
                } else {
                  await this.productsService.create({
                    title: product.title,
                    description: product.description,
                    imageUrl: product.imageUrl,
                    price: product.price,
                    salePrice: product.salePrice,
                    rating: product.rating,
                    reviewCount: product.reviewCount,
                    affiliateLink: product.affiliateLink,
                    platform: AffiliatePlatform.AMAZON,
                    externalId: product.ASIN,
                    availability: product.isAvailable ? ProductAvailability.IN_STOCK : ProductAvailability.OUT_OF_STOCK,
                    retailerName: 'Amazon',
                    retailerUrl: 'https://www.amazon.com',
                  });
                  stats.productsCreated++;
                }

                stats.productsProcessed++;
              } catch (error) {
                stats.productsFailed++;
                stats.errors.push(`Failed to process product: ${error.message}`);
                this.logger.error(`Failed to process product: ${error.message}`);
              }
            }

            // Rate limiting - wait 1 second between searches
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (error) {
            stats.errors.push(`Failed to search for "${searchTerm}": ${error.message}`);
            this.logger.error(`Failed to search for "${searchTerm}": ${error.message}`);
          }
        }
      }
    } catch (error) {
      stats.errors.push(`Full sync failed: ${error.message}`);
      this.logger.error(`Full sync failed: ${error.message}`);
    }

    stats.endTime = new Date();
    stats.duration = stats.endTime.getTime() - stats.startTime.getTime();

    this.logger.log(`Full sync completed: ${stats.productsProcessed} processed, ${stats.productsCreated} created, ${stats.productsUpdated} updated, ${stats.productsFailed} failed`);

    // Store sync history
    await this.storeSyncHistory(stats);

    return stats;
  }

  /**
   * Process price update job
   */
  async processPriceUpdate(data: SyncJobData): Promise<SyncStats> {
    const stats: SyncStats = {
      platform: data.platform,
      operation: 'price_update',
      productsProcessed: 0,
      productsCreated: 0,
      productsUpdated: 0,
      productsFailed: 0,
      startTime: new Date(),
      errors: [],
    };

    this.logger.log(`Starting price update for ${data.platform} (${data.productIds?.length || 0} products)`);

    try {
      if (data.platform === AffiliatePlatform.AMAZON) {
        // Process in batches of 10
        const batchSize = 10;
        for (let i = 0; i < (data.productIds?.length || 0); i += batchSize) {
          const batch = data.productIds!.slice(i, i + batchSize);

          for (const productId of batch) {
            try {
              const product = await this.prisma.product.findUnique({
                where: { id: productId },
              });

              if (!product) continue;

              const amazonProduct = await this.amazonService.getProductDetails(product.externalId);

              if (amazonProduct) {
                await this.productsService.update(productId, {
                  price: amazonProduct.price,
                  salePrice: amazonProduct.salePrice,
                  rating: amazonProduct.rating,
                  reviewCount: amazonProduct.reviewCount,
                  availability: amazonProduct.isAvailable ? ProductAvailability.IN_STOCK : ProductAvailability.OUT_OF_STOCK,
                  title: product.title,
                  platform: AffiliatePlatform.AMAZON,
                  externalId: product.externalId,
                  affiliateLink: product.affiliateLink,
                });
                stats.productsUpdated++;
              }

              stats.productsProcessed++;
            } catch (error) {
              stats.productsFailed++;
              stats.errors.push(`Failed to update product ${productId}: ${error.message}`);
            }
          }

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (error) {
      stats.errors.push(`Price update failed: ${error.message}`);
      this.logger.error(`Price update failed: ${error.message}`);
    }

    stats.endTime = new Date();
    stats.duration = stats.endTime.getTime() - stats.startTime.getTime();

    this.logger.log(`Price update completed: ${stats.productsProcessed} processed, ${stats.productsUpdated} updated, ${stats.productsFailed} failed`);

    await this.storeSyncHistory(stats);

    return stats;
  }

  /**
   * Process availability check job
   */
  async processAvailabilityCheck(data: SyncJobData): Promise<SyncStats> {
    const stats: SyncStats = {
      platform: data.platform,
      operation: 'availability_check',
      productsProcessed: 0,
      productsCreated: 0,
      productsUpdated: 0,
      productsFailed: 0,
      startTime: new Date(),
      errors: [],
    };

    this.logger.log(`Starting availability check for ${data.platform} (${data.productIds?.length || 0} products)`);

    try {
      if (data.platform === AffiliatePlatform.AMAZON) {
        for (const productId of data.productIds || []) {
          try {
            const product = await this.prisma.product.findUnique({
              where: { id: productId },
            });

            if (!product) continue;

            const amazonProduct = await this.amazonService.getProductDetails(product.externalId);

            if (amazonProduct) {
              const newAvailability = amazonProduct.isAvailable
                ? ProductAvailability.IN_STOCK
                : ProductAvailability.OUT_OF_STOCK;

              if (product.availability !== newAvailability) {
                await this.productsService.update(productId, {
                  availability: newAvailability,
                  title: product.title,
                  platform: AffiliatePlatform.AMAZON,
                  externalId: product.externalId,
                  affiliateLink: product.affiliateLink,
                  price: product.price,
                });
                stats.productsUpdated++;
              }
            }

            stats.productsProcessed++;
          } catch (error) {
            stats.productsFailed++;
            stats.errors.push(`Failed to check availability for ${productId}: ${error.message}`);
          }

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (error) {
      stats.errors.push(`Availability check failed: ${error.message}`);
      this.logger.error(`Availability check failed: ${error.message}`);
    }

    stats.endTime = new Date();
    stats.duration = stats.endTime.getTime() - stats.startTime.getTime();

    this.logger.log(`Availability check completed: ${stats.productsProcessed} processed, ${stats.productsUpdated} updated, ${stats.productsFailed} failed`);

    await this.storeSyncHistory(stats);

    return stats;
  }

  /**
   * Store sync history in database for monitoring
   */
  private async storeSyncHistory(stats: SyncStats) {
    try {
      // You could create a SyncHistory model in Prisma to store this data
      // For now, just log it
      this.logger.log(`Sync stats: ${JSON.stringify({
        platform: stats.platform,
        operation: stats.operation,
        processed: stats.productsProcessed,
        created: stats.productsCreated,
        updated: stats.productsUpdated,
        failed: stats.productsFailed,
        duration: stats.duration,
        errorCount: stats.errors.length,
      })}`);
    } catch (error) {
      this.logger.error(`Failed to store sync history: ${error.message}`);
    }
  }

  /**
   * Manually trigger a full sync (for admin use)
   */
  async triggerFullSync(platform: AffiliatePlatform, searchTerms: string[]) {
    await this.syncQueue.add('full-sync', {
      platform,
      operation: 'full_sync',
      searchTerms,
    } as SyncJobData);

    this.logger.log(`Manual full sync triggered for ${platform}`);
  }

  /**
   * Get queue status and job counts
   */
  async getQueueStatus() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.syncQueue.getWaitingCount(),
      this.syncQueue.getActiveCount(),
      this.syncQueue.getCompletedCount(),
      this.syncQueue.getFailedCount(),
      this.syncQueue.getDelayedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed,
    };
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
