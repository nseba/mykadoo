/**
 * @jest-environment node
 */
import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { VectorService } from './vector.service';
import { EmbeddingService } from './embedding.service';
import { VectorStorageService } from './vector-storage.service';
import { SimilaritySearchService } from './similarity-search.service';
import { Embedding, EmbeddingCost } from './interfaces';

describe('VectorService', () => {
  let service: VectorService;
  let embeddingService: jest.Mocked<EmbeddingService>;
  let storageService: jest.Mocked<VectorStorageService>;
  let searchService: jest.Mocked<SimilaritySearchService>;
  let cacheManager: jest.Mocked<Cache>;

  const mockEmbedding: Embedding = Array(1536).fill(0.1);
  const mockCost: EmbeddingCost = {
    tokensUsed: 10,
    estimatedCost: 0.0002,
    model: 'text-embedding-3-small',
    timestamp: new Date(),
  };

  beforeEach(async () => {
    const mockEmbeddingService = {
      generateProductEmbedding: jest.fn(),
      generateQueryEmbedding: jest.fn(),
      generateBatchEmbeddings: jest.fn(),
      calculateCost: jest.fn(),
    };

    const mockStorageService = {
      storeProductEmbedding: jest.fn(),
      storeSearchEmbedding: jest.fn(),
      storeProductEmbeddingsBatch: jest.fn(),
      getEmbeddingStatus: jest.fn(),
      hasEmbedding: jest.fn(),
      getProductsWithoutEmbeddings: jest.fn(),
    };

    const mockSearchService = {
      findSimilarProductsByText: jest.fn(),
      findSimilarToProduct: jest.fn(),
      hybridSearchByText: jest.fn(),
      getPersonalizedRecommendations: jest.fn(),
    };

    const mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VectorService,
        { provide: EmbeddingService, useValue: mockEmbeddingService },
        { provide: VectorStorageService, useValue: mockStorageService },
        { provide: SimilaritySearchService, useValue: mockSearchService },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    service = module.get<VectorService>(VectorService);
    embeddingService = module.get(EmbeddingService);
    storageService = module.get(VectorStorageService);
    searchService = module.get(SimilaritySearchService);
    cacheManager = module.get(CACHE_MANAGER);
  });

  describe('generateProductEmbedding', () => {
    it('should use cached embedding if available', async () => {
      cacheManager.get.mockResolvedValue(mockEmbedding);
      embeddingService.calculateCost.mockReturnValue(mockCost);

      const result = await service.generateProductEmbedding(
        'product-123',
        'Test Product',
        'Description',
        'Electronics'
      );

      expect(cacheManager.get).toHaveBeenCalledWith('embedding:product:product-123');
      expect(storageService.storeProductEmbedding).toHaveBeenCalledWith(
        'product-123',
        mockEmbedding
      );
      expect(embeddingService.generateProductEmbedding).not.toHaveBeenCalled();
      expect(result.tokensUsed).toBe(10);
    });

    it('should generate and cache new embedding when not cached', async () => {
      cacheManager.get.mockResolvedValue(null);
      embeddingService.generateProductEmbedding.mockResolvedValue({
        embedding: mockEmbedding,
        model: 'text-embedding-3-small',
        tokensUsed: 15,
      });
      embeddingService.calculateCost.mockReturnValue(mockCost);

      const result = await service.generateProductEmbedding(
        'product-456',
        'New Product',
        'New description'
      );

      expect(embeddingService.generateProductEmbedding).toHaveBeenCalledWith(
        'New Product',
        'New description',
        undefined,
        undefined
      );
      expect(storageService.storeProductEmbedding).toHaveBeenCalledWith(
        'product-456',
        mockEmbedding
      );
      expect(cacheManager.set).toHaveBeenCalledWith(
        'embedding:product:product-456',
        mockEmbedding,
        3600
      );
      expect(result).toEqual(mockCost);
    });

    it('should pass all product fields to embedding service', async () => {
      cacheManager.get.mockResolvedValue(null);
      embeddingService.generateProductEmbedding.mockResolvedValue({
        embedding: mockEmbedding,
        model: 'text-embedding-3-small',
        tokensUsed: 20,
      });
      embeddingService.calculateCost.mockReturnValue(mockCost);

      await service.generateProductEmbedding(
        'product-789',
        'Product Title',
        'Product Description',
        'Electronics',
        ['gift', 'tech']
      );

      expect(embeddingService.generateProductEmbedding).toHaveBeenCalledWith(
        'Product Title',
        'Product Description',
        'Electronics',
        ['gift', 'tech']
      );
    });

    it('should throw error if embedding generation fails', async () => {
      cacheManager.get.mockResolvedValue(null);
      embeddingService.generateProductEmbedding.mockRejectedValue(
        new Error('API error')
      );

      await expect(
        service.generateProductEmbedding('product-123', 'Test')
      ).rejects.toThrow('API error');
    });
  });

  describe('generateSearchEmbedding', () => {
    it('should use cached query embedding if available', async () => {
      cacheManager.get.mockResolvedValue(mockEmbedding);
      embeddingService.calculateCost.mockReturnValue(mockCost);

      const result = await service.generateSearchEmbedding('search-123', 'gift for mom');

      expect(storageService.storeSearchEmbedding).toHaveBeenCalledWith(
        'search-123',
        mockEmbedding
      );
      expect(embeddingService.generateQueryEmbedding).not.toHaveBeenCalled();
      expect(result.embedding).toEqual(mockEmbedding);
      expect(result.cost.tokensUsed).toBe(10);
    });

    it('should generate and cache new query embedding', async () => {
      cacheManager.get.mockResolvedValue(null);
      embeddingService.generateQueryEmbedding.mockResolvedValue({
        embedding: mockEmbedding,
        model: 'text-embedding-3-small',
        tokensUsed: 5,
      });
      embeddingService.calculateCost.mockReturnValue(mockCost);

      const result = await service.generateSearchEmbedding('search-456', 'tech gifts');

      expect(embeddingService.generateQueryEmbedding).toHaveBeenCalledWith('tech gifts');
      expect(storageService.storeSearchEmbedding).toHaveBeenCalledWith(
        'search-456',
        mockEmbedding
      );
      expect(cacheManager.set).toHaveBeenCalled();
      expect(result.embedding).toEqual(mockEmbedding);
    });

    it('should use consistent cache key for same query', async () => {
      cacheManager.get.mockResolvedValue(null);
      embeddingService.generateQueryEmbedding.mockResolvedValue({
        embedding: mockEmbedding,
        model: 'text-embedding-3-small',
        tokensUsed: 5,
      });
      embeddingService.calculateCost.mockReturnValue(mockCost);

      await service.generateSearchEmbedding('search-1', 'test query');
      const firstCacheKey = cacheManager.set.mock.calls[0][0];

      await service.generateSearchEmbedding('search-2', 'TEST QUERY');
      const secondCacheKey = cacheManager.set.mock.calls[1][0];

      // Same query (case-insensitive) should have same cache key
      expect(firstCacheKey).toBe(secondCacheKey);
    });
  });

  describe('generateBatchProductEmbeddings', () => {
    const products = [
      { id: 'p1', title: 'Product 1', description: 'Desc 1' },
      { id: 'p2', title: 'Product 2', description: 'Desc 2' },
      { id: 'p3', title: 'Product 3', description: 'Desc 3' },
    ];

    it('should process products in batch', async () => {
      embeddingService.generateBatchEmbeddings.mockResolvedValue({
        embeddings: [mockEmbedding, mockEmbedding, mockEmbedding],
        model: 'text-embedding-3-small',
        tokensUsed: 30,
      });
      storageService.storeProductEmbeddingsBatch.mockResolvedValue({ stored: 3 });
      embeddingService.calculateCost.mockReturnValue({
        ...mockCost,
        tokensUsed: 30,
      });

      const result = await service.generateBatchProductEmbeddings(products);

      expect(result.processed).toBe(3);
      expect(result.cost.tokensUsed).toBe(30);
    });

    it('should respect custom batch size', async () => {
      const manyProducts = Array(60)
        .fill(null)
        .map((_, i) => ({
          id: `p${i}`,
          title: `Product ${i}`,
        }));

      embeddingService.generateBatchEmbeddings.mockResolvedValue({
        embeddings: Array(25).fill(mockEmbedding),
        model: 'text-embedding-3-small',
        tokensUsed: 50,
      });
      storageService.storeProductEmbeddingsBatch.mockResolvedValue({ stored: 25 });
      embeddingService.calculateCost.mockReturnValue(mockCost);

      await service.generateBatchProductEmbeddings(manyProducts, 25);

      // 60 products with batch size 25 = 3 batches
      expect(embeddingService.generateBatchEmbeddings).toHaveBeenCalledTimes(3);
    });

    it('should include category and tags in batch text', async () => {
      const productsWithMeta = [
        {
          id: 'p1',
          title: 'Product',
          description: 'Desc',
          category: 'Electronics',
          tags: ['tech', 'gift'],
        },
      ];

      embeddingService.generateBatchEmbeddings.mockResolvedValue({
        embeddings: [mockEmbedding],
        model: 'text-embedding-3-small',
        tokensUsed: 10,
      });
      storageService.storeProductEmbeddingsBatch.mockResolvedValue({ stored: 1 });
      embeddingService.calculateCost.mockReturnValue(mockCost);

      await service.generateBatchProductEmbeddings(productsWithMeta);

      const callArgs = embeddingService.generateBatchEmbeddings.mock.calls[0][0];
      expect(callArgs.texts[0]).toContain('Category: Electronics');
      expect(callArgs.texts[0]).toContain('Tags: tech, gift');
    });
  });

  describe('findSimilarProducts', () => {
    it('should delegate to search service', async () => {
      const mockResults = [
        { id: 'p1', title: 'Product 1', similarity: 0.9 },
        { id: 'p2', title: 'Product 2', similarity: 0.8 },
      ];
      searchService.findSimilarProductsByText.mockResolvedValue(mockResults as any);

      const result = await service.findSimilarProducts('gift for mom');

      expect(searchService.findSimilarProductsByText).toHaveBeenCalledWith(
        'gift for mom',
        {}
      );
      expect(result).toEqual(mockResults);
    });

    it('should pass options to search service', async () => {
      searchService.findSimilarProductsByText.mockResolvedValue([]);

      await service.findSimilarProducts('tech gifts', {
        matchThreshold: 0.8,
        matchCount: 20,
        categoryFilter: 'Electronics',
      });

      expect(searchService.findSimilarProductsByText).toHaveBeenCalledWith('tech gifts', {
        matchThreshold: 0.8,
        matchCount: 20,
        categoryFilter: 'Electronics',
      });
    });
  });

  describe('findSimilarToProduct', () => {
    it('should delegate to search service', async () => {
      const mockResults = [{ id: 'p2', similarity: 0.85 }];
      searchService.findSimilarToProduct.mockResolvedValue(mockResults as any);

      const result = await service.findSimilarToProduct('product-123');

      expect(searchService.findSimilarToProduct).toHaveBeenCalledWith('product-123', {});
      expect(result).toEqual(mockResults);
    });
  });

  describe('hybridSearch', () => {
    it('should delegate to search service', async () => {
      const mockResults = [
        { id: 'p1', keywordScore: 0.5, semanticScore: 0.9, combinedScore: 0.8 },
      ];
      searchService.hybridSearchByText.mockResolvedValue(mockResults as any);

      const result = await service.hybridSearch('birthday gift');

      expect(searchService.hybridSearchByText).toHaveBeenCalledWith('birthday gift', {});
      expect(result).toEqual(mockResults);
    });

    it('should pass options to search service', async () => {
      searchService.hybridSearchByText.mockResolvedValue([]);

      await service.hybridSearch('gift', {
        keywordWeight: 0.4,
        semanticWeight: 0.6,
        matchCount: 30,
      });

      expect(searchService.hybridSearchByText).toHaveBeenCalledWith('gift', {
        keywordWeight: 0.4,
        semanticWeight: 0.6,
        matchCount: 30,
      });
    });
  });

  describe('getRecommendations', () => {
    it('should get personalized recommendations', async () => {
      const mockRecs = [
        { id: 'p1', similarity: 0.9 },
        { id: 'p2', similarity: 0.85 },
      ];
      searchService.getPersonalizedRecommendations.mockResolvedValue(mockRecs as any);

      const result = await service.getRecommendations('user-123');

      expect(searchService.getPersonalizedRecommendations).toHaveBeenCalledWith(
        'user-123',
        20
      );
      expect(result).toEqual(mockRecs);
    });

    it('should respect custom match count', async () => {
      searchService.getPersonalizedRecommendations.mockResolvedValue([]);

      await service.getRecommendations('user-456', 50);

      expect(searchService.getPersonalizedRecommendations).toHaveBeenCalledWith(
        'user-456',
        50
      );
    });
  });

  describe('getEmbeddingStatus', () => {
    it('should return embedding status from storage service', async () => {
      const mockStatus = {
        totalProducts: 1000,
        productsWithEmbeddings: 800,
        coverage: 0.8,
      };
      storageService.getEmbeddingStatus.mockResolvedValue(mockStatus as any);

      const result = await service.getEmbeddingStatus();

      expect(result).toEqual(mockStatus);
    });
  });

  describe('hasEmbedding', () => {
    it('should check if product has embedding', async () => {
      storageService.hasEmbedding.mockResolvedValue(true);

      const result = await service.hasEmbedding('product-123');

      expect(storageService.hasEmbedding).toHaveBeenCalledWith('product-123');
      expect(result).toBe(true);
    });
  });

  describe('getProductsNeedingEmbeddings', () => {
    it('should return products without embeddings', async () => {
      const products = [{ id: 'p1', title: 'Product 1' }];
      storageService.getProductsWithoutEmbeddings.mockResolvedValue(products as any);

      const result = await service.getProductsNeedingEmbeddings();

      expect(storageService.getProductsWithoutEmbeddings).toHaveBeenCalledWith(100);
      expect(result).toEqual(products);
    });

    it('should respect custom limit', async () => {
      storageService.getProductsWithoutEmbeddings.mockResolvedValue([]);

      await service.getProductsNeedingEmbeddings(50);

      expect(storageService.getProductsWithoutEmbeddings).toHaveBeenCalledWith(50);
    });
  });

  describe('backfillEmbeddings', () => {
    it('should return early if no products need embeddings', async () => {
      storageService.getProductsWithoutEmbeddings.mockResolvedValue([]);
      embeddingService.calculateCost.mockReturnValue(mockCost);

      const result = await service.backfillEmbeddings();

      expect(result.processed).toBe(0);
      expect(embeddingService.generateBatchEmbeddings).not.toHaveBeenCalled();
    });

    it('should process products needing embeddings', async () => {
      const products = [
        { id: 'p1', title: 'Product 1' },
        { id: 'p2', title: 'Product 2' },
      ];
      storageService.getProductsWithoutEmbeddings.mockResolvedValue(products as any);
      embeddingService.generateBatchEmbeddings.mockResolvedValue({
        embeddings: [mockEmbedding, mockEmbedding],
        model: 'text-embedding-3-small',
        tokensUsed: 20,
      });
      storageService.storeProductEmbeddingsBatch.mockResolvedValue({ stored: 2 });
      embeddingService.calculateCost.mockReturnValue({
        ...mockCost,
        tokensUsed: 20,
      });

      const result = await service.backfillEmbeddings();

      expect(result.processed).toBe(2);
    });
  });

  describe('clearProductCache', () => {
    it('should delete product from cache', async () => {
      await service.clearProductCache('product-123');

      expect(cacheManager.del).toHaveBeenCalledWith('embedding:product:product-123');
    });
  });

  describe('cache key generation', () => {
    it('should generate consistent hash for same query', () => {
      const hash1 = service['simpleHash']('test query');
      const hash2 = service['simpleHash']('test query');

      expect(hash1).toBe(hash2);
    });

    it('should generate different hash for different queries', () => {
      const hash1 = service['simpleHash']('query one');
      const hash2 = service['simpleHash']('query two');

      expect(hash1).not.toBe(hash2);
    });
  });
});
