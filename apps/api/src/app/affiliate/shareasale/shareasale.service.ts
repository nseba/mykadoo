import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { createHash, createHmac } from 'crypto';
import axios, { AxiosInstance } from 'axios';

export interface ShareASaleProduct {
  merchantId: string;
  productId: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  imageUrl: string;
  productUrl: string;
  category: string;
  brand?: string;
  inStock: boolean;
  sku: string;
}

export interface ShareASaleSearchParams {
  keywords?: string;
  merchantId?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  perPage?: number;
}

@Injectable()
export class ShareASaleService {
  private readonly logger = new Logger(ShareASaleService.name);
  private readonly apiClient: AxiosInstance;
  private readonly affiliateId: string;
  private readonly apiToken: string;
  private readonly apiSecret: string;
  private readonly apiVersion = '2.8';
  private readonly baseUrl = 'https://api.shareasale.com';

  // Cache for product data
  private productCache = new Map<string, { data: ShareASaleProduct; timestamp: number }>();
  private readonly cacheTtl = 3600000; // 1 hour in milliseconds

  constructor() {
    this.affiliateId = process.env.SHAREASALE_AFFILIATE_ID || '';
    this.apiToken = process.env.SHAREASALE_API_TOKEN || '';
    this.apiSecret = process.env.SHAREASALE_API_SECRET || '';

    if (!this.affiliateId || !this.apiToken || !this.apiSecret) {
      this.logger.warn(
        'ShareASale credentials not configured. Set SHAREASALE_AFFILIATE_ID, SHAREASALE_API_TOKEN, and SHAREASALE_API_SECRET environment variables.'
      );
    }

    this.apiClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  /**
   * Generate authentication signature for ShareASale API
   * ShareASale uses HMAC-SHA256 for request signing
   */
  private generateSignature(timestamp: string, action: string): string {
    const message = `${this.apiToken}:${timestamp}:${action}:${this.apiSecret}`;
    return createHmac('sha256', this.apiSecret).update(message).digest('hex');
  }

  /**
   * Make authenticated request to ShareASale API
   */
  private async makeApiRequest(action: string, params: Record<string, any> = {}): Promise<any> {
    if (!this.apiToken || !this.apiSecret) {
      throw new HttpException(
        'ShareASale API credentials not configured',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = this.generateSignature(timestamp, action);

    try {
      const response = await this.apiClient.get(`/w.cfm`, {
        params: {
          affiliateId: this.affiliateId,
          token: this.apiToken,
          version: this.apiVersion,
          action,
          timestamp,
          signature,
          ...params,
        },
      });

      return response.data;
    } catch (error) {
      this.logger.error(`ShareASale API request failed: ${error.message}`, error.stack);
      throw new HttpException(
        `ShareASale API error: ${error.message}`,
        HttpStatus.BAD_GATEWAY
      );
    }
  }

  /**
   * Search for products across ShareASale merchants
   * Note: ShareASale doesn't have a direct product search API like Amazon
   * This is a simulated implementation - in production, you would download merchant feeds
   */
  async searchProducts(params: ShareASaleSearchParams): Promise<ShareASaleProduct[]> {
    this.logger.log(`Searching ShareASale products with params: ${JSON.stringify(params)}`);

    try {
      // In production, you would:
      // 1. Download merchant product feeds (datafeed API)
      // 2. Parse and index the feeds in your database
      // 3. Search your indexed data
      // For now, return empty array with a note to implement feed parsing
      this.logger.warn(
        'ShareASale product search requires implementing feed download and parsing. ' +
        'See https://www.shareasale.com/api-docs/ for datafeed API documentation.'
      );

      return [];
    } catch (error) {
      this.logger.error(`ShareASale product search failed: ${error.message}`, error.stack);
      throw new HttpException(
        `ShareASale search error: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Download merchant datafeed
   * ShareASale provides product feeds that need to be downloaded and parsed
   */
  async downloadMerchantFeed(merchantId: string): Promise<string> {
    this.logger.log(`Downloading datafeed for merchant ${merchantId}`);

    try {
      const response = await this.makeApiRequest('merchantDatafeeds', {
        merchantId,
      });

      // Parse the feed URL from response and download it
      // This would return the feed data as CSV or XML
      return response;
    } catch (error) {
      this.logger.error(`Failed to download merchant feed: ${error.message}`, error.stack);
      throw new HttpException(
        `Datafeed download error: ${error.message}`,
        HttpStatus.BAD_GATEWAY
      );
    }
  }

  /**
   * Parse CSV product feed from ShareASale
   * Merchant feeds are typically provided as CSV files
   */
  parseCsvFeed(csvData: string): ShareASaleProduct[] {
    const products: ShareASaleProduct[] = [];

    try {
      const lines = csvData.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        const values = line.split(',');
        const productData: any = {};

        headers.forEach((header, index) => {
          productData[header] = values[index]?.trim();
        });

        // Map CSV columns to our product structure
        // Column names vary by merchant, this is a common structure
        products.push({
          merchantId: productData['Merchant ID'] || productData['merchantId'],
          productId: productData['Product ID'] || productData['SKU'],
          name: productData['Product Name'] || productData['name'],
          description: productData['Product Description'] || productData['description'],
          price: parseFloat(productData['Price'] || productData['price'] || '0'),
          salePrice: productData['Sale Price'] ? parseFloat(productData['Sale Price']) : undefined,
          imageUrl: productData['Product Image'] || productData['image'],
          productUrl: productData['Product URL'] || productData['url'],
          category: productData['Category'] || productData['category'],
          brand: productData['Brand'] || productData['brand'],
          inStock: productData['In Stock']?.toLowerCase() === 'yes' || productData['in_stock'] === '1',
          sku: productData['SKU'] || productData['sku'],
        });
      }

      this.logger.log(`Parsed ${products.length} products from CSV feed`);
      return products;
    } catch (error) {
      this.logger.error(`Failed to parse CSV feed: ${error.message}`, error.stack);
      throw new HttpException(
        `CSV parsing error: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Generate ShareASale affiliate link
   * Format: https://shareasale.com/r.cfm?b=BANNER_ID&u=AFFILIATE_ID&m=MERCHANT_ID&urllink=PRODUCT_URL
   */
  generateAffiliateLink(merchantId: string, productUrl: string, bannerId?: string): string {
    const cleanUrl = encodeURIComponent(productUrl);
    const banner = bannerId || '0'; // 0 is text link

    return `https://shareasale.com/r.cfm?b=${banner}&u=${this.affiliateId}&m=${merchantId}&urllink=${cleanUrl}`;
  }

  /**
   * Get product details from cache or API
   */
  async getProductDetails(merchantId: string, productId: string): Promise<ShareASaleProduct | null> {
    const cacheKey = `${merchantId}:${productId}`;

    // Check cache
    const cached = this.productCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTtl) {
      this.logger.log(`Returning cached product: ${productId}`);
      return cached.data;
    }

    try {
      // In production, this would fetch from your database where you've indexed the feeds
      // For now, return null
      this.logger.warn(
        'ShareASale product details require implementing feed indexing. ' +
        'Download merchant feeds and index them in your database.'
      );

      return null;
    } catch (error) {
      this.logger.error(`Failed to get product details: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Get merchant activity report
   * This shows clicks, sales, and commissions for a date range
   */
  async getMerchantReport(startDate: string, endDate: string, merchantId?: string): Promise<any> {
    this.logger.log(`Fetching merchant report from ${startDate} to ${endDate}`);

    try {
      const response = await this.makeApiRequest('activity', {
        dateStart: startDate, // Format: MM/DD/YYYY
        dateEnd: endDate,
        merchantId: merchantId || '',
      });

      return response;
    } catch (error) {
      this.logger.error(`Failed to get merchant report: ${error.message}`, error.stack);
      throw new HttpException(
        `Merchant report error: ${error.message}`,
        HttpStatus.BAD_GATEWAY
      );
    }
  }

  /**
   * Get merchant list
   * Returns all merchants you're approved to promote
   */
  async getMerchantList(): Promise<any[]> {
    this.logger.log('Fetching merchant list');

    try {
      const response = await this.makeApiRequest('merchantList');
      return response;
    } catch (error) {
      this.logger.error(`Failed to get merchant list: ${error.message}`, error.stack);
      throw new HttpException(
        `Merchant list error: ${error.message}`,
        HttpStatus.BAD_GATEWAY
      );
    }
  }

  /**
   * Process conversion postback from ShareASale
   * ShareASale sends conversion data via postback URL
   */
  async processConversionPostback(data: {
    transactionId: string;
    merchantId: string;
    amount: number;
    commission: number;
    status: string;
    clickId?: string;
  }): Promise<void> {
    this.logger.log(`Processing ShareASale conversion: ${data.transactionId}`);

    try {
      // Verify the postback is legitimate
      // ShareASale includes a verification token in postbacks

      // Store conversion data in your database
      // Update click record with conversion info
      // This integrates with your TrackingService

      this.logger.log(
        `Conversion recorded: Transaction ${data.transactionId}, ` +
        `Amount $${data.amount}, Commission $${data.commission}`
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
   * Validate ShareASale postback authentication
   */
  validatePostback(params: Record<string, string>): boolean {
    // ShareASale includes a security token in postbacks
    // Validate it matches your configured secret
    const providedToken = params.token;
    const expectedToken = this.apiSecret;

    return providedToken === expectedToken;
  }

  /**
   * Clear product cache
   */
  clearCache(): void {
    this.productCache.clear();
    this.logger.log('ShareASale product cache cleared');
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
