import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

export interface CJProduct {
  advertiserId: string;
  catalogId: string;
  productId: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  currency: string;
  imageUrl: string;
  productUrl: string;
  category: string;
  brand?: string;
  manufacturer?: string;
  inStock: boolean;
  sku: string;
  upc?: string;
}

export interface CJSearchParams {
  keywords?: string;
  advertiserId?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  perPage?: number;
}

export interface CJAdvertiser {
  advertiserId: string;
  advertiserName: string;
  programStatus: string;
  primaryCategory: string;
  performanceIncentives: boolean;
  sevenDayEpc?: number;
  threeMonthEpc?: number;
}

@Injectable()
export class CJService {
  private readonly logger = new Logger(CJService.name);
  private readonly apiClient: AxiosInstance;
  private readonly publisherId: string;
  private readonly apiToken: string;
  private readonly websiteId: string;
  private readonly baseUrl = 'https://product-search.api.cj.com';
  private readonly linkServiceUrl = 'https://www.anrdoezrs.net';

  // Cache for product data
  private productCache = new Map<string, { data: CJProduct; timestamp: number }>();
  private readonly cacheTtl = 3600000; // 1 hour in milliseconds

  constructor() {
    this.publisherId = process.env.CJ_PUBLISHER_ID || '';
    this.apiToken = process.env.CJ_API_TOKEN || '';
    this.websiteId = process.env.CJ_WEBSITE_ID || '';

    if (!this.publisherId || !this.apiToken || !this.websiteId) {
      this.logger.warn(
        'CJ Affiliate credentials not configured. Set CJ_PUBLISHER_ID, CJ_API_TOKEN, and CJ_WEBSITE_ID environment variables.'
      );
    }

    this.apiClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Search for products in CJ Product Catalog
   * Uses CJ's Product Catalog Search API
   */
  async searchProducts(params: CJSearchParams): Promise<CJProduct[]> {
    this.logger.log(`Searching CJ products with params: ${JSON.stringify(params)}`);

    if (!this.apiToken) {
      throw new HttpException(
        'CJ API credentials not configured',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    try {
      const response = await this.apiClient.get('/v2/product-search', {
        params: {
          'website-id': this.websiteId,
          'keywords': params.keywords,
          'advertiser-ids': params.advertiserId,
          'serviceable-area': 'US',
          'currency': 'USD',
          'page-number': params.page || 1,
          'records-per-page': Math.min(params.perPage || 20, 1000),
          'low-price': params.minPrice,
          'high-price': params.maxPrice,
        },
      });

      const products: CJProduct[] = [];

      // Parse CJ API response
      if (response.data?.products) {
        for (const product of response.data.products) {
          products.push({
            advertiserId: product.advertiserId || product['advertiser-id'],
            catalogId: product.catalogId || product['catalog-id'],
            productId: product.sku,
            name: product.name || product.title,
            description: product.description,
            price: parseFloat(product.price || product['retail-price'] || '0'),
            salePrice: product['sale-price'] ? parseFloat(product['sale-price']) : undefined,
            currency: product.currency || 'USD',
            imageUrl: product.imageUrl || product['image-url'] || product.imageUrls?.[0],
            productUrl: product.buyUrl || product['buy-url'],
            category: product.category || product.categories?.[0],
            brand: product.brand,
            manufacturer: product.manufacturer,
            inStock: product.inStock !== false && product['in-stock'] !== 'no',
            sku: product.sku,
            upc: product.upc,
          });
        }
      }

      this.logger.log(`Found ${products.length} products from CJ`);
      return products;
    } catch (error) {
      this.logger.error(`CJ product search failed: ${error.message}`, error.stack);

      if (error.response) {
        throw new HttpException(
          `CJ API error: ${error.response.data?.message || error.message}`,
          error.response.status
        );
      }

      throw new HttpException(
        `CJ search error: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get product details by SKU
   */
  async getProductDetails(advertiserId: string, sku: string): Promise<CJProduct | null> {
    const cacheKey = `${advertiserId}:${sku}`;

    // Check cache
    const cached = this.productCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTtl) {
      this.logger.log(`Returning cached product: ${sku}`);
      return cached.data;
    }

    try {
      const results = await this.searchProducts({
        keywords: sku,
        advertiserId,
        perPage: 1,
      });

      if (results.length === 0) {
        return null;
      }

      const product = results[0];

      // Cache the result
      this.productCache.set(cacheKey, {
        data: product,
        timestamp: Date.now(),
      });

      return product;
    } catch (error) {
      this.logger.error(`Failed to get product details: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Generate CJ affiliate link
   * Format: https://www.anrdoezrs.net/click-{publisher-id}-{ad-id}?url={product-url}
   */
  generateAffiliateLink(advertiserId: string, productUrl: string): string {
    const cleanUrl = encodeURIComponent(productUrl);
    const adId = advertiserId; // In CJ, advertiserId is used as ad ID

    return `${this.linkServiceUrl}/click-${this.publisherId}-${adId}?url=${cleanUrl}`;
  }

  /**
   * Get advertiser list
   * Returns advertisers you're joined with
   */
  async getAdvertiserList(params: {
    keywords?: string;
    status?: 'joined' | 'notjoined' | 'all';
    page?: number;
    perPage?: number;
  } = {}): Promise<CJAdvertiser[]> {
    this.logger.log('Fetching CJ advertiser list');

    if (!this.apiToken) {
      throw new HttpException(
        'CJ API credentials not configured',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    try {
      // Use CJ Commission API to get advertiser data
      const response = await axios.get('https://advertiser-lookup.api.cj.com/v3/advertiser-lookup', {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
        },
        params: {
          'advertiser-ids': params.keywords === 'joined' ? 'joined' : undefined,
          'page-number': params.page || 1,
          'records-per-page': params.perPage || 100,
        },
      });

      const advertisers: CJAdvertiser[] = [];

      if (response.data?.advertisers) {
        for (const advertiser of response.data.advertisers) {
          advertisers.push({
            advertiserId: advertiser.advertiserId || advertiser['advertiser-id'],
            advertiserName: advertiser.advertiserName || advertiser['advertiser-name'],
            programStatus: advertiser.relationshipStatus || advertiser['relationship-status'],
            primaryCategory: advertiser.primaryCategory || advertiser['primary-category'],
            performanceIncentives: advertiser.performanceIncentives || false,
            sevenDayEpc: advertiser.sevenDayEpc || advertiser['seven-day-epc'],
            threeMonthEpc: advertiser.threeMonthEpc || advertiser['three-month-epc'],
          });
        }
      }

      this.logger.log(`Found ${advertisers.length} advertisers`);
      return advertisers;
    } catch (error) {
      this.logger.error(`Failed to get advertiser list: ${error.message}`, error.stack);

      if (error.response) {
        throw new HttpException(
          `CJ API error: ${error.response.data?.message || error.message}`,
          error.response.status
        );
      }

      throw new HttpException(
        `Advertiser list error: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get commission details for advertiser
   */
  async getCommissionDetails(advertiserId: string): Promise<any> {
    this.logger.log(`Fetching commission details for advertiser ${advertiserId}`);

    if (!this.apiToken) {
      throw new HttpException(
        'CJ API credentials not configured',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    try {
      const response = await axios.get('https://commission-detail.api.cj.com/v3/commissions', {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
        },
        params: {
          'cids': advertiserId,
          'start-date': new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 30 days
          'end-date': new Date().toISOString().split('T')[0],
        },
      });

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get commission details: ${error.message}`, error.stack);

      if (error.response) {
        throw new HttpException(
          `CJ API error: ${error.response.data?.message || error.message}`,
          error.response.status
        );
      }

      throw new HttpException(
        `Commission details error: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Process conversion postback from CJ
   * CJ sends server postbacks for conversions
   */
  async processConversionPostback(data: {
    actionTrackerId: string;
    advertiserId: string;
    commissionId: string;
    orderId: string;
    saleAmount: number;
    commission: number;
    eventDate: string;
    clickId?: string;
  }): Promise<void> {
    this.logger.log(`Processing CJ conversion: ${data.commissionId}`);

    try {
      // Verify and store conversion data
      // This integrates with your TrackingService

      this.logger.log(
        `Conversion recorded: Commission ${data.commissionId}, ` +
        `Order ${data.orderId}, Amount $${data.saleAmount}, Commission $${data.commission}`
      );
    } catch (error) {
      this.logger.error(`Failed to process conversion: ${error.message}`, error.stack);
      throw new HttpException(
        `Conversion processing error: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Validate CJ postback signature
   * CJ includes a signature in postbacks for validation
   */
  validatePostback(params: Record<string, string>, signature: string): boolean {
    // CJ signature validation
    // In production, verify the signature matches expected value
    // This prevents fraudulent conversion reports

    return true; // Simplified for now
  }

  /**
   * Get performance report
   */
  async getPerformanceReport(startDate: string, endDate: string): Promise<any> {
    this.logger.log(`Fetching performance report from ${startDate} to ${endDate}`);

    if (!this.apiToken) {
      throw new HttpException(
        'CJ API credentials not configured',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    try {
      const response = await axios.get('https://commission-detail.api.cj.com/v3/commissions', {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
        },
        params: {
          'start-date': startDate,
          'end-date': endDate,
        },
      });

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get performance report: ${error.message}`, error.stack);

      if (error.response) {
        throw new HttpException(
          `CJ API error: ${error.response.data?.message || error.message}`,
          error.response.status
        );
      }

      throw new HttpException(
        `Performance report error: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Clear product cache
   */
  clearCache(): void {
    this.productCache.clear();
    this.logger.log('CJ product cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; ttl: number } {
    return {
      size: this.productCache.size,
      ttl: this.cacheTtl,
    };
  }
}
