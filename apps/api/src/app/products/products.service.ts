import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaClient, Product, AffiliatePlatform, ProductAvailability } from '@prisma/client';

export interface CreateProductDto {
  title: string;
  description?: string;
  shortDescription?: string;
  imageUrl?: string;
  galleryImages?: string[];
  price: number;
  salePrice?: number;
  currency?: string;
  rating?: number;
  reviewCount?: number;
  platform: AffiliatePlatform;
  externalId: string;
  affiliateLink: string;
  retailerName?: string;
  retailerUrl?: string;
  brand?: string;
  availability?: ProductAvailability;
  category?: string;
  tags?: string[];
  occasions?: string[];
  ageGroups?: string[];
}

export interface UpdateProductDto {
  title?: string;
  description?: string;
  shortDescription?: string;
  imageUrl?: string;
  galleryImages?: string[];
  price?: number;
  salePrice?: number;
  currency?: string;
  rating?: number;
  reviewCount?: number;
  affiliateLink?: string;
  retailerName?: string;
  retailerUrl?: string;
  brand?: string;
  availability?: ProductAvailability;
  category?: string;
  tags?: string[];
  occasions?: string[];
  ageGroups?: string[];
  isActive?: boolean;
}

export interface ProductSearchFilters {
  query?: string;
  category?: string;
  platform?: AffiliatePlatform;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  availability?: ProductAvailability;
  tags?: string[];
  occasions?: string[];
  ageGroups?: string[];
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Create a new product
   */
  async create(data: CreateProductDto): Promise<Product> {
    try {
      // Check for existing product (deduplication)
      const existing = await this.findByExternalId(data.platform, data.externalId);
      if (existing) {
        this.logger.warn(
          `Product already exists: ${data.platform}/${data.externalId}. Updating instead.`
        );
        return this.update(existing.id, data);
      }

      const product = await this.prisma.product.create({
        data: {
          title: data.title,
          description: data.description,
          shortDescription: data.shortDescription,
          imageUrl: data.imageUrl,
          galleryImages: data.galleryImages || [],
          price: data.price,
          salePrice: data.salePrice,
          currency: data.currency || 'USD',
          rating: data.rating,
          reviewCount: data.reviewCount,
          platform: data.platform,
          externalId: data.externalId,
          affiliateLink: data.affiliateLink,
          retailerName: data.retailerName,
          retailerUrl: data.retailerUrl,
          brand: data.brand,
          availability: data.availability || ProductAvailability.UNKNOWN,
          category: this.normalizeCategory(data.category),
          tags: data.tags || [],
          occasions: data.occasions || [],
          ageGroups: data.ageGroups || [],
          lastSyncedAt: new Date(),
        },
      });

      this.logger.log(`Created product: ${product.id} (${product.title})`);
      return product;
    } catch (error) {
      this.logger.error(`Failed to create product: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find product by ID
   */
  async findById(id: string): Promise<Product | null> {
    try {
      return await this.prisma.product.findUnique({
        where: { id },
      });
    } catch (error) {
      this.logger.error(`Failed to find product ${id}: ${error.message}`);
      return null;
    }
  }

  /**
   * Find product by external ID (platform + externalId)
   */
  async findByExternalId(
    platform: AffiliatePlatform,
    externalId: string
  ): Promise<Product | null> {
    try {
      return await this.prisma.product.findUnique({
        where: {
          platform_externalId: {
            platform,
            externalId,
          },
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to find product ${platform}/${externalId}: ${error.message}`
      );
      return null;
    }
  }

  /**
   * Update product
   */
  async update(id: string, data: UpdateProductDto): Promise<Product> {
    try {
      const product = await this.prisma.product.update({
        where: { id },
        data: {
          ...data,
          category: data.category ? this.normalizeCategory(data.category) : undefined,
          lastSyncedAt: new Date(),
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Updated product: ${product.id}`);
      return product;
    } catch (error) {
      this.logger.error(`Failed to update product ${id}: ${error.message}`);
      throw new NotFoundException(`Product ${id} not found`);
    }
  }

  /**
   * Delete product (soft delete by marking inactive)
   */
  async delete(id: string): Promise<Product> {
    try {
      const product = await this.prisma.product.update({
        where: { id },
        data: {
          isActive: false,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Deleted (soft) product: ${product.id}`);
      return product;
    } catch (error) {
      this.logger.error(`Failed to delete product ${id}: ${error.message}`);
      throw new NotFoundException(`Product ${id} not found`);
    }
  }

  /**
   * Search products with filters
   */
  async search(filters: ProductSearchFilters): Promise<{
    products: Product[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const limit = Math.min(filters.limit || 20, 100);
      const offset = filters.offset || 0;

      // Build where clause
      const where: any = {};

      // Text search on title, description, brand
      if (filters.query) {
        where.OR = [
          { title: { contains: filters.query, mode: 'insensitive' } },
          { description: { contains: filters.query, mode: 'insensitive' } },
          { brand: { contains: filters.query, mode: 'insensitive' } },
          { tags: { has: filters.query } },
        ];
      }

      // Category filter
      if (filters.category) {
        where.category = this.normalizeCategory(filters.category);
      }

      // Platform filter
      if (filters.platform) {
        where.platform = filters.platform;
      }

      // Price range
      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        where.price = {};
        if (filters.minPrice !== undefined) {
          where.price.gte = filters.minPrice;
        }
        if (filters.maxPrice !== undefined) {
          where.price.lte = filters.maxPrice;
        }
      }

      // Rating filter
      if (filters.minRating !== undefined) {
        where.rating = { gte: filters.minRating };
      }

      // Availability filter
      if (filters.availability) {
        where.availability = filters.availability;
      }

      // Tags filter (must have ALL specified tags)
      if (filters.tags && filters.tags.length > 0) {
        where.tags = { hasEvery: filters.tags };
      }

      // Occasions filter (must have at least one)
      if (filters.occasions && filters.occasions.length > 0) {
        where.occasions = { hasSome: filters.occasions };
      }

      // Age groups filter (must have at least one)
      if (filters.ageGroups && filters.ageGroups.length > 0) {
        where.ageGroups = { hasSome: filters.ageGroups };
      }

      // Active filter (default to true)
      where.isActive = filters.isActive !== undefined ? filters.isActive : true;

      // Execute query
      const [products, total] = await Promise.all([
        this.prisma.product.findMany({
          where,
          take: limit,
          skip: offset,
          orderBy: [
            { rating: 'desc' },
            { reviewCount: 'desc' },
            { createdAt: 'desc' },
          ],
        }),
        this.prisma.product.count({ where }),
      ]);

      this.logger.log(
        `Search returned ${products.length} of ${total} products (offset: ${offset})`
      );

      return {
        products,
        total,
        hasMore: offset + products.length < total,
      };
    } catch (error) {
      this.logger.error(`Product search failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find duplicate products across platforms
   */
  async findDuplicates(title: string, threshold = 0.8): Promise<Product[]> {
    try {
      // Simple fuzzy search - find products with similar titles
      const products = await this.prisma.product.findMany({
        where: {
          title: {
            contains: title.substring(0, Math.floor(title.length * threshold)),
            mode: 'insensitive',
          },
          isActive: true,
        },
        take: 10,
      });

      return products;
    } catch (error) {
      this.logger.error(`Failed to find duplicates: ${error.message}`);
      return [];
    }
  }

  /**
   * Bulk create/update products
   */
  async bulkUpsert(products: CreateProductDto[]): Promise<{
    created: number;
    updated: number;
    failed: number;
  }> {
    let created = 0;
    let updated = 0;
    let failed = 0;

    for (const productData of products) {
      try {
        const existing = await this.findByExternalId(
          productData.platform,
          productData.externalId
        );

        if (existing) {
          await this.update(existing.id, productData);
          updated++;
        } else {
          // Create directly without duplicate check since we already checked
          await this.prisma.product.create({
            data: {
              ...productData,
              currency: productData.currency || 'USD',
              availability: productData.availability || ProductAvailability.UNKNOWN,
              category: this.normalizeCategory(productData.category),
              galleryImages: productData.galleryImages || [],
              tags: productData.tags || [],
              occasions: productData.occasions || [],
              ageGroups: productData.ageGroups || [],
              lastSyncedAt: new Date(),
            },
          });
          created++;
        }
      } catch (error) {
        this.logger.error(
          `Failed to upsert product ${productData.externalId}: ${error.message}`
        );
        failed++;
      }
    }

    this.logger.log(
      `Bulk upsert complete: ${created} created, ${updated} updated, ${failed} failed`
    );

    return { created, updated, failed };
  }

  /**
   * Mark products as out of stock
   */
  async markOutOfStock(externalIds: { platform: AffiliatePlatform; externalId: string }[]): Promise<number> {
    let count = 0;

    for (const { platform, externalId } of externalIds) {
      try {
        await this.prisma.product.updateMany({
          where: { platform, externalId },
          data: {
            availability: ProductAvailability.OUT_OF_STOCK,
            updatedAt: new Date(),
          },
        });
        count++;
      } catch (error) {
        this.logger.error(
          `Failed to mark ${platform}/${externalId} as out of stock: ${error.message}`
        );
      }
    }

    this.logger.log(`Marked ${count} products as out of stock`);
    return count;
  }

  /**
   * Get products by category
   */
  async findByCategory(category: string, limit = 20): Promise<Product[]> {
    try {
      return await this.prisma.product.findMany({
        where: {
          category: this.normalizeCategory(category),
          isActive: true,
        },
        take: limit,
        orderBy: [
          { rating: 'desc' },
          { reviewCount: 'desc' },
        ],
      });
    } catch (error) {
      this.logger.error(`Failed to find products by category: ${error.message}`);
      return [];
    }
  }

  /**
   * Get trending products (most clicks)
   */
  async getTrending(limit = 20): Promise<Product[]> {
    try {
      return await this.prisma.product.findMany({
        where: { isActive: true },
        take: limit,
        orderBy: [
          { clicks: 'desc' },
          { conversions: 'desc' },
        ],
      });
    } catch (error) {
      this.logger.error(`Failed to get trending products: ${error.message}`);
      return [];
    }
  }

  /**
   * Normalize category names for consistency
   */
  private normalizeCategory(category?: string): string | undefined {
    if (!category) return undefined;

    // Category mapping for standardization
    const categoryMap: Record<string, string> = {
      'electronics': 'Electronics',
      'computers': 'Electronics',
      'tech': 'Electronics',
      'books': 'Books',
      'literature': 'Books',
      'toys': 'Toys & Games',
      'games': 'Toys & Games',
      'home': 'Home & Kitchen',
      'kitchen': 'Home & Kitchen',
      'fashion': 'Fashion',
      'clothing': 'Fashion',
      'beauty': 'Beauty & Personal Care',
      'sports': 'Sports & Outdoors',
      'outdoors': 'Sports & Outdoors',
      'automotive': 'Automotive',
      'tools': 'Tools & Home Improvement',
      'jewelry': 'Jewelry',
      'accessories': 'Jewelry',
    };

    const normalized = category.toLowerCase().trim();
    return categoryMap[normalized] || this.capitalizeWords(category);
  }

  /**
   * Capitalize first letter of each word
   */
  private capitalizeWords(str: string): string {
    return str
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Get statistics
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    platforms: Record<string, number>;
    avgPrice: number;
    totalRevenue: number;
  }> {
    try {
      const [total, active, platformCounts, aggregates] = await Promise.all([
        this.prisma.product.count(),
        this.prisma.product.count({ where: { isActive: true } }),
        this.prisma.product.groupBy({
          by: ['platform'],
          _count: true,
        }),
        this.prisma.product.aggregate({
          _avg: { price: true },
          _sum: { revenue: true },
        }),
      ]);

      const platforms: Record<string, number> = {};
      for (const item of platformCounts) {
        platforms[item.platform] = item._count;
      }

      return {
        total,
        active,
        platforms,
        avgPrice: aggregates._avg.price || 0,
        totalRevenue: aggregates._sum.revenue || 0,
      };
    } catch (error) {
      this.logger.error(`Failed to get stats: ${error.message}`);
      return {
        total: 0,
        active: 0,
        platforms: {},
        avgPrice: 0,
        totalRevenue: 0,
      };
    }
  }

  /**
   * Clean up old inactive products
   */
  async cleanup(olderThanDays = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const result = await this.prisma.product.deleteMany({
        where: {
          isActive: false,
          updatedAt: {
            lt: cutoffDate,
          },
        },
      });

      this.logger.log(`Cleaned up ${result.count} old inactive products`);
      return result.count;
    } catch (error) {
      this.logger.error(`Cleanup failed: ${error.message}`);
      return 0;
    }
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
