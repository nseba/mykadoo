import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ProductAdvertisingAPIv1 from 'paapi5-nodejs-sdk';

export interface AmazonProduct {
  asin: string;
  title: string;
  price?: number;
  salePrice?: number;
  currency: string;
  imageUrl?: string;
  galleryImages?: string[];
  rating?: number;
  reviewCount?: number;
  detailPageUrl: string;
  availability?: string;
  brand?: string;
  category?: string;
}

export interface AmazonSearchParams {
  keywords?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  page?: number;
  itemsPerPage?: number;
}

@Injectable()
export class AmazonService {
  private readonly logger = new Logger(AmazonService.name);
  private readonly api: ProductAdvertisingAPIv1.DefaultApi;
  private readonly associateTag: string;
  private readonly partnerType = 'Associates';
  private readonly cache: Map<string, { data: any; timestamp: number }> =
    new Map();
  private readonly CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour cache TTL
  private readonly RATE_LIMIT_MS = 1000; // 1 request per second for free tier
  private lastRequestTime = 0;
  private readonly maxRetries = 3;
  private readonly isConfigured: boolean;

  constructor(private readonly configService: ConfigService) {
    const accessKey = this.configService.get<string>('AMAZON_ACCESS_KEY');
    const secretKey = this.configService.get<string>('AMAZON_SECRET_KEY');
    const region = this.configService.get<string>('AMAZON_REGION', 'us-east-1');
    this.associateTag = this.configService.get<string>(
      'AMAZON_ASSOCIATE_TAG',
      ''
    );

    this.isConfigured = !!(accessKey && secretKey && this.associateTag);

    if (!this.isConfigured) {
      this.logger.warn(
        'Amazon PA-API credentials not configured. Service will operate in mock mode.'
      );
    }

    // Configure the API client
    const client = ProductAdvertisingAPIv1.ApiClient.instance;
    client.accessKey = accessKey || 'mock';
    client.secretKey = secretKey || 'mock';
    client.host = `webservices.amazon.com`;
    client.region = region;

    this.api = new ProductAdvertisingAPIv1.DefaultApi();

    if (this.isConfigured) {
      this.logger.log('Amazon PA-API client initialized successfully');
    }
  }

  /**
   * Search products by keywords
   */
  async searchProducts(
    params: AmazonSearchParams
  ): Promise<AmazonProduct[]> {
    if (!this.isConfigured) {
      this.logger.debug('Amazon API not configured, returning empty results');
      return [];
    }

    const cacheKey = `search:${JSON.stringify(params)}`;

    // Check cache first
    const cached = this.getFromCache<AmazonProduct[]>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for search: ${params.keywords}`);
      return cached;
    }

    // Rate limiting
    await this.enforceRateLimit();

    try {
      const searchRequest: ProductAdvertisingAPIv1.SearchItemsRequest = {
        Keywords: params.keywords,
        SearchIndex: params.categoryId || 'All',
        ItemPage: params.page || 1,
        ItemCount: Math.min(params.itemsPerPage || 10, 10),
        PartnerTag: this.associateTag,
        PartnerType: this.partnerType,
        Resources: [
          'Images.Primary.Large',
          'ItemInfo.Title',
          'ItemInfo.Features',
          'Offers.Listings.Price',
          'Offers.Listings.SavingBasis',
          'Offers.Listings.Availability.Message',
          'Images.Variants.Large',
        ] as ProductAdvertisingAPIv1.SearchItemsResource[],
      };

      if (params.minPrice) {
        searchRequest.MinPrice = params.minPrice;
      }
      if (params.maxPrice) {
        searchRequest.MaxPrice = params.maxPrice;
      }
      if (params.minRating) {
        searchRequest.MinReviewsRating = params.minRating;
      }

      this.logger.log(`Searching Amazon for: ${params.keywords}`);

      const response = await this.executeWithRetry(() =>
        new Promise((resolve, reject) => {
          this.api.searchItems(searchRequest, (error: Error | null, data: any) => {
            if (error) reject(error);
            else resolve(data);
          });
        })
      );

      const products = this.parseSearchResponse(response);

      // Cache the results
      this.setCache(cacheKey, products);

      return products;
    } catch (error) {
      this.logger.error(
        `Amazon search failed: ${error.message}`,
        error.stack
      );
      throw new HttpException(
        `Failed to search Amazon products: ${error.message}`,
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  /**
   * Get product details by ASIN
   */
  async getProductByAsin(asin: string): Promise<AmazonProduct | null> {
    if (!this.isConfigured) {
      this.logger.debug('Amazon API not configured, returning null');
      return null;
    }

    const cacheKey = `product:${asin}`;

    // Check cache first
    const cached = this.getFromCache<AmazonProduct>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for ASIN: ${asin}`);
      return cached;
    }

    // Rate limiting
    await this.enforceRateLimit();

    try {
      const getItemsRequest: ProductAdvertisingAPIv1.GetItemsRequest = {
        ItemIds: [asin],
        PartnerTag: this.associateTag,
        PartnerType: this.partnerType,
        Resources: [
          'Images.Primary.Large',
          'ItemInfo.Title',
          'ItemInfo.Features',
          'ItemInfo.ByLineInfo',
          'ItemInfo.ContentInfo',
          'Offers.Listings.Price',
          'Offers.Listings.SavingBasis',
          'Offers.Listings.Availability.Message',
          'Images.Variants.Large',
        ] as ProductAdvertisingAPIv1.GetItemsResource[],
      };

      this.logger.log(`Fetching Amazon product: ${asin}`);

      const response = await this.executeWithRetry(() =>
        new Promise((resolve, reject) => {
          this.api.getItems(getItemsRequest, (error: Error | null, data: any) => {
            if (error) reject(error);
            else resolve(data);
          });
        })
      );

      const products = this.parseGetItemsResponse(response);
      const product = products.length > 0 ? products[0] : null;

      if (product) {
        // Cache the result
        this.setCache(cacheKey, product);
      }

      return product;
    } catch (error) {
      this.logger.error(
        `Failed to fetch Amazon product ${asin}: ${error.message}`,
        error.stack
      );
      return null;
    }
  }

  /**
   * Get multiple products by ASINs
   */
  async getProductsByAsins(asins: string[]): Promise<AmazonProduct[]> {
    // Amazon API supports max 10 ASINs per request
    const batchSize = 10;
    const batches: string[][] = [];

    for (let i = 0; i < asins.length; i += batchSize) {
      batches.push(asins.slice(i, i + batchSize));
    }

    const allProducts: AmazonProduct[] = [];

    for (const batch of batches) {
      const products = await Promise.all(
        batch.map((asin) => this.getProductByAsin(asin))
      );
      allProducts.push(...products.filter((p) => p !== null));
    }

    return allProducts;
  }

  /**
   * Generate affiliate link for a product
   */
  generateAffiliateLink(asin: string, trackingId?: string): string {
    const baseUrl = `https://www.amazon.com/dp/${asin}`;
    const params = new URLSearchParams({
      tag: this.associateTag,
      linkCode: 'osi',
      th: '1',
      psc: '1',
    });

    if (trackingId) {
      params.append('trackingId', trackingId);
    }

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Parse search response from Amazon PA-API
   */
  private parseSearchResponse(response: any): AmazonProduct[] {
    if (!response?.SearchResult?.Items) {
      return [];
    }

    return response.SearchResult.Items.map((item: any) =>
      this.parseAmazonItem(item)
    ).filter((product: AmazonProduct | null) => product !== null);
  }

  /**
   * Parse GetItems response from Amazon PA-API
   */
  private parseGetItemsResponse(response: any): AmazonProduct[] {
    if (!response?.ItemsResult?.Items) {
      return [];
    }

    return response.ItemsResult.Items.map((item: any) =>
      this.parseAmazonItem(item)
    ).filter((product: AmazonProduct | null) => product !== null);
  }

  /**
   * Parse individual Amazon item to AmazonProduct
   */
  private parseAmazonItem(item: any): AmazonProduct | null {
    try {
      const asin = item.ASIN;
      const title = item.ItemInfo?.Title?.DisplayValue || 'Unknown Product';
      const detailPageUrl = item.DetailPageURL || '';

      // Extract price
      let price: number | undefined;
      let salePrice: number | undefined;
      let currency = 'USD';

      if (item.Offers?.Listings?.[0]?.Price) {
        const priceData = item.Offers.Listings[0].Price;
        price = priceData.Amount;
        currency = priceData.Currency || 'USD';
      }

      if (item.Offers?.Listings?.[0]?.SavingBasis) {
        const savingBasis = item.Offers.Listings[0].SavingBasis;
        salePrice = price;
        price = savingBasis.Amount;
      }

      // Extract images
      const imageUrl = item.Images?.Primary?.Large?.URL;
      const galleryImages = item.Images?.Variants?.map(
        (variant: any) => variant.Large?.URL
      ).filter((url: string) => url);

      // Extract brand
      const brand = item.ItemInfo?.ByLineInfo?.Brand?.DisplayValue;

      // Extract category
      const category = item.BrowseNodeInfo?.BrowseNodes?.[0]?.DisplayName;

      // Extract availability
      const availability =
        item.Offers?.Listings?.[0]?.Availability?.Message || 'Unknown';

      return {
        asin,
        title,
        price,
        salePrice,
        currency,
        imageUrl,
        galleryImages,
        detailPageUrl,
        brand,
        category,
        availability,
      };
    } catch (error) {
      this.logger.error(`Failed to parse Amazon item: ${error.message}`);
      return null;
    }
  }

  /**
   * Enforce rate limiting (1 request per second for free tier)
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.RATE_LIMIT_MS) {
      const waitTime = this.RATE_LIMIT_MS - timeSinceLastRequest;
      this.logger.debug(`Rate limit: waiting ${waitTime}ms`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Execute API call with retry logic (exponential backoff)
   */
  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    retryCount = 0
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retryCount >= this.maxRetries) {
        throw error;
      }

      const backoffTime = Math.pow(2, retryCount) * 1000; // Exponential backoff
      this.logger.warn(
        `API call failed, retrying in ${backoffTime}ms (attempt ${
          retryCount + 1
        }/${this.maxRetries})`
      );

      await new Promise((resolve) => setTimeout(resolve, backoffTime));

      return this.executeWithRetry(fn, retryCount + 1);
    }
  }

  /**
   * Get data from cache
   */
  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    const now = Date.now();
    const age = now - cached.timestamp;

    if (age > this.CACHE_TTL_MS) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  /**
   * Set data in cache
   */
  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear entire cache
   */
  clearCache(): void {
    this.cache.clear();
    this.logger.log('Amazon service cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}
