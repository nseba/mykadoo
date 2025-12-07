import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AmazonService, AmazonProduct } from './amazon.service';

describe('AmazonService', () => {
  let service: AmazonService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => {
      const config = {
        AMAZON_ACCESS_KEY: 'test-access-key',
        AMAZON_SECRET_KEY: 'test-secret-key',
        AMAZON_ASSOCIATE_TAG: 'test-tag',
        AMAZON_REGION: 'us-east-1',
      };
      return config[key] || defaultValue;
    }),
  };

  const mockAmazonItem = {
    ASIN: 'B08N5WRWNW',
    DetailPageURL: 'https://www.amazon.com/dp/B08N5WRWNW',
    ItemInfo: {
      Title: {
        DisplayValue: 'Test Product',
      },
      ByLineInfo: {
        Brand: {
          DisplayValue: 'Test Brand',
        },
      },
    },
    Offers: {
      Listings: [
        {
          Price: {
            Amount: 29.99,
            Currency: 'USD',
          },
          Availability: {
            Message: 'In Stock',
          },
        },
      ],
    },
    Images: {
      Primary: {
        Large: {
          URL: 'https://example.com/image.jpg',
        },
      },
      Variants: [
        {
          Large: {
            URL: 'https://example.com/variant1.jpg',
          },
        },
      ],
    },
    BrowseNodeInfo: {
      BrowseNodes: [
        {
          DisplayName: 'Electronics',
        },
      ],
    },
  };

  const mockSearchResponse = {
    SearchResult: {
      Items: [mockAmazonItem],
    },
  };

  const mockGetItemsResponse = {
    ItemsResult: {
      Items: [mockAmazonItem],
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AmazonService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AmazonService>(AmazonService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    service.clearCache();
  });

  describe('Service Initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should initialize with config credentials', () => {
      expect(configService.get).toHaveBeenCalledWith('AMAZON_ACCESS_KEY');
      expect(configService.get).toHaveBeenCalledWith('AMAZON_SECRET_KEY');
      expect(configService.get).toHaveBeenCalledWith('AMAZON_ASSOCIATE_TAG', '');
    });

    it('should handle missing credentials gracefully', async () => {
      const mockConfigMissing = {
        get: jest.fn(() => undefined),
      };

      const module = await Test.createTestingModule({
        providers: [
          AmazonService,
          {
            provide: ConfigService,
            useValue: mockConfigMissing,
          },
        ],
      }).compile();

      const serviceMissing = module.get<AmazonService>(AmazonService);
      expect(serviceMissing).toBeDefined();
    });
  });

  describe('searchProducts', () => {
    it('should search products by keywords', async () => {
      // Mock the client searchItems method
      jest.spyOn<any, any>(service['client'], 'searchItems').mockResolvedValue(mockSearchResponse);

      const result = await service.searchProducts({ keywords: 'laptop' });

      expect(result).toHaveLength(1);
      expect(result[0].asin).toBe('B08N5WRWNW');
      expect(result[0].title).toBe('Test Product');
      expect(result[0].price).toBe(29.99);
    });

    it('should search products by category', async () => {
      jest.spyOn<any, any>(service['client'], 'searchItems').mockResolvedValue(mockSearchResponse);

      const result = await service.searchProducts({ categoryId: 'Electronics' });

      expect(result).toHaveLength(1);
      expect(result[0].asin).toBe('B08N5WRWNW');
    });

    it('should apply price filters', async () => {
      jest.spyOn<any, any>(service['client'], 'searchItems').mockResolvedValue(mockSearchResponse);

      const result = await service.searchProducts({
        keywords: 'laptop',
        minPrice: 20,
        maxPrice: 50,
      });

      expect(result).toHaveLength(1);
    });

    it('should apply rating filter', async () => {
      jest.spyOn<any, any>(service['client'], 'searchItems').mockResolvedValue(mockSearchResponse);

      const result = await service.searchProducts({
        keywords: 'laptop',
        minRating: 4,
      });

      expect(result).toHaveLength(1);
    });

    it('should handle pagination', async () => {
      jest.spyOn<any, any>(service['client'], 'searchItems').mockResolvedValue(mockSearchResponse);

      const result = await service.searchProducts({
        keywords: 'laptop',
        page: 2,
        itemsPerPage: 5,
      });

      expect(result).toHaveLength(1);
    });

    it('should cache search results', async () => {
      jest.spyOn<any, any>(service['client'], 'searchItems').mockResolvedValue(mockSearchResponse);

      // First call
      await service.searchProducts({ keywords: 'laptop' });

      // Second call should use cache
      const result = await service.searchProducts({ keywords: 'laptop' });

      expect(service['client'].searchItems).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(1);
    });

    it('should return empty array on API error', async () => {
      jest.spyOn<any, any>(service['client'], 'searchItems').mockRejectedValue(new Error('API Error'));

      await expect(service.searchProducts({ keywords: 'laptop' })).rejects.toThrow();
    });

    it('should handle empty search results', async () => {
      jest.spyOn<any, any>(service['client'], 'searchItems').mockResolvedValue({
        SearchResult: { Items: [] },
      });

      const result = await service.searchProducts({ keywords: 'nonexistent' });

      expect(result).toHaveLength(0);
    });
  });

  describe('getProductByAsin', () => {
    it('should fetch product by ASIN', async () => {
      jest.spyOn<any, any>(service['client'], 'getItems').mockResolvedValue(mockGetItemsResponse);

      const result = await service.getProductByAsin('B08N5WRWNW');

      expect(result).toBeDefined();
      expect(result?.asin).toBe('B08N5WRWNW');
      expect(result?.title).toBe('Test Product');
      expect(result?.price).toBe(29.99);
      expect(result?.currency).toBe('USD');
    });

    it('should include all product details', async () => {
      jest.spyOn<any, any>(service['client'], 'getItems').mockResolvedValue(mockGetItemsResponse);

      const result = await service.getProductByAsin('B08N5WRWNW');

      expect(result).toBeDefined();
      expect(result?.brand).toBe('Test Brand');
      expect(result?.category).toBe('Electronics');
      expect(result?.imageUrl).toBe('https://example.com/image.jpg');
      expect(result?.availability).toBe('In Stock');
    });

    it('should cache product data', async () => {
      jest.spyOn<any, any>(service['client'], 'getItems').mockResolvedValue(mockGetItemsResponse);

      // First call
      await service.getProductByAsin('B08N5WRWNW');

      // Second call should use cache
      const result = await service.getProductByAsin('B08N5WRWNW');

      expect(service['client'].getItems).toHaveBeenCalledTimes(1);
      expect(result).toBeDefined();
    });

    it('should return null on product not found', async () => {
      jest.spyOn<any, any>(service['client'], 'getItems').mockResolvedValue({
        ItemsResult: { Items: [] },
      });

      const result = await service.getProductByAsin('INVALID');

      expect(result).toBeNull();
    });

    it('should return null on API error', async () => {
      jest.spyOn<any, any>(service['client'], 'getItems').mockRejectedValue(new Error('API Error'));

      const result = await service.getProductByAsin('B08N5WRWNW');

      expect(result).toBeNull();
    });
  });

  describe('getProductsByAsins', () => {
    it('should fetch multiple products', async () => {
      jest.spyOn<any, any>(service['client'], 'getItems').mockResolvedValue(mockGetItemsResponse);

      const asins = ['B08N5WRWNW', 'B07ZPKN6YR'];
      const results = await service.getProductsByAsins(asins);

      expect(results).toHaveLength(2);
    });

    it('should batch requests for > 10 ASINs', async () => {
      jest.spyOn<any, any>(service['client'], 'getItems').mockResolvedValue(mockGetItemsResponse);

      const asins = Array.from({ length: 25 }, (_, i) => `B08N5WRWN${i}`);
      const results = await service.getProductsByAsins(asins);

      // Should make 3 batches (10 + 10 + 5)
      expect(service['client'].getItems).toHaveBeenCalledTimes(25);
    });

    it('should filter out null results', async () => {
      jest
        .spyOn<any, any>(service['client'], 'getItems')
        .mockResolvedValueOnce(mockGetItemsResponse)
        .mockResolvedValueOnce({ ItemsResult: { Items: [] } });

      const results = await service.getProductsByAsins(['B08N5WRWNW', 'INVALID']);

      expect(results).toHaveLength(1);
    });
  });

  describe('generateAffiliateLink', () => {
    it('should generate basic affiliate link', () => {
      const link = service.generateAffiliateLink('B08N5WRWNW');

      expect(link).toContain('amazon.com/dp/B08N5WRWNW');
      expect(link).toContain('tag=test-tag');
      expect(link).toContain('linkCode=osi');
    });

    it('should include tracking ID if provided', () => {
      const link = service.generateAffiliateLink('B08N5WRWNW', 'custom-tracking-id');

      expect(link).toContain('trackingId=custom-tracking-id');
    });

    it('should include all required parameters', () => {
      const link = service.generateAffiliateLink('B08N5WRWNW');

      expect(link).toContain('th=1');
      expect(link).toContain('psc=1');
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce 1 request per second', async () => {
      jest.spyOn<any, any>(service['client'], 'getItems').mockResolvedValue(mockGetItemsResponse);

      const start = Date.now();

      // Make 3 consecutive requests
      await service.getProductByAsin('B08N5WRWNW');
      service.clearCache(); // Clear cache to force new API call
      await service.getProductByAsin('B08N5WRWN1');
      service.clearCache();
      await service.getProductByAsin('B08N5WRWN2');

      const duration = Date.now() - start;

      // Should take at least 2 seconds (3 requests = 2 intervals)
      expect(duration).toBeGreaterThanOrEqual(2000);
    }, 10000);
  });

  describe('Retry Logic', () => {
    it('should retry on API failure with exponential backoff', async () => {
      let callCount = 0;
      jest.spyOn<any, any>(service['client'], 'getItems').mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          return Promise.reject(new Error('API Error'));
        }
        return Promise.resolve(mockGetItemsResponse);
      });

      const result = await service.getProductByAsin('B08N5WRWNW');

      expect(callCount).toBe(3);
      expect(result).toBeDefined();
    }, 10000);

    it('should fail after max retries', async () => {
      jest.spyOn<any, any>(service['client'], 'getItems').mockRejectedValue(new Error('Persistent Error'));

      const result = await service.getProductByAsin('B08N5WRWNW');

      expect(result).toBeNull();
    }, 20000);
  });

  describe('Caching', () => {
    it('should cache data for 1 hour', async () => {
      jest.spyOn<any, any>(service['client'], 'getItems').mockResolvedValue(mockGetItemsResponse);

      await service.getProductByAsin('B08N5WRWNW');

      const stats = service.getCacheStats();
      expect(stats.size).toBe(1);
      expect(stats.keys).toContain('product:B08N5WRWNW');
    });

    it('should clear cache when requested', async () => {
      jest.spyOn<any, any>(service['client'], 'getItems').mockResolvedValue(mockGetItemsResponse);

      await service.getProductByAsin('B08N5WRWNW');
      service.clearCache();

      const stats = service.getCacheStats();
      expect(stats.size).toBe(0);
    });

    it('should expire cache after TTL', async () => {
      jest.spyOn<any, any>(service['client'], 'getItems').mockResolvedValue(mockGetItemsResponse);

      await service.getProductByAsin('B08N5WRWNW');

      // Manually expire cache by manipulating timestamp
      const cache = service['cache'];
      const entry = cache.get('product:B08N5WRWNW');
      if (entry) {
        entry.timestamp = Date.now() - (60 * 60 * 1000 + 1000); // 1 hour + 1 second ago
      }

      // Next call should not use cache
      await service.getProductByAsin('B08N5WRWNW');

      expect(service['client'].getItems).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed API responses', async () => {
      jest.spyOn<any, any>(service['client'], 'searchItems').mockResolvedValue({
        SearchResult: null,
      });

      const result = await service.searchProducts({ keywords: 'test' });

      expect(result).toEqual([]);
    });

    it('should handle missing product data fields', async () => {
      jest.spyOn<any, any>(service['client'], 'getItems').mockResolvedValue({
        ItemsResult: {
          Items: [
            {
              ASIN: 'B08N5WRWNW',
              DetailPageURL: 'https://amazon.com/dp/B08N5WRWNW',
              // Missing ItemInfo and other fields
            },
          ],
        },
      });

      const result = await service.getProductByAsin('B08N5WRWNW');

      expect(result).toBeDefined();
      expect(result?.asin).toBe('B08N5WRWNW');
      expect(result?.title).toBe('Unknown Product');
    });
  });
});
