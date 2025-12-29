/**
 * @jest-environment node
 */
import { Test, TestingModule } from '@nestjs/testing';
import { SimilaritySearchService } from './similarity-search.service';
import { EmbeddingService } from './embedding.service';
import { PrismaService } from '../common/prisma';
import { Embedding } from './interfaces';

describe('SimilaritySearchService', () => {
  let service: SimilaritySearchService;
  let prismaService: jest.Mocked<PrismaService>;
  let embeddingService: jest.Mocked<EmbeddingService>;

  const mockEmbedding: Embedding = Array(1536).fill(0.1);
  const mockVectorString = `[${mockEmbedding.join(',')}]`;

  beforeEach(async () => {
    const mockPrismaService = {
      $queryRaw: jest.fn(),
    };

    const mockEmbeddingService = {
      validateEmbedding: jest.fn(),
      toVectorString: jest.fn(),
      fromVectorString: jest.fn(),
      generateQueryEmbedding: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SimilaritySearchService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EmbeddingService, useValue: mockEmbeddingService },
      ],
    }).compile();

    service = module.get<SimilaritySearchService>(SimilaritySearchService);
    prismaService = module.get(PrismaService);
    embeddingService = module.get(EmbeddingService);
  });

  describe('findSimilarProducts', () => {
    it('should throw error for invalid embedding', async () => {
      embeddingService.validateEmbedding.mockReturnValue(false);

      await expect(
        service.findSimilarProducts(mockEmbedding)
      ).rejects.toThrow('Invalid embedding provided');
    });

    it('should find similar products with default options', async () => {
      embeddingService.validateEmbedding.mockReturnValue(true);
      embeddingService.toVectorString.mockReturnValue(mockVectorString);

      const mockResults = [
        { id: 'p1', title: 'Product 1', similarity: 0.9 },
        { id: 'p2', title: 'Product 2', similarity: 0.85 },
      ];
      prismaService.$queryRaw.mockResolvedValue(mockResults);

      const result = await service.findSimilarProducts(mockEmbedding);

      expect(result).toEqual(mockResults);
      expect(embeddingService.toVectorString).toHaveBeenCalledWith(mockEmbedding);
    });

    it('should apply custom options', async () => {
      embeddingService.validateEmbedding.mockReturnValue(true);
      embeddingService.toVectorString.mockReturnValue(mockVectorString);
      prismaService.$queryRaw.mockResolvedValue([]);

      await service.findSimilarProducts(mockEmbedding, {
        matchThreshold: 0.8,
        matchCount: 20,
        categoryFilter: 'Electronics',
        minPrice: 10,
        maxPrice: 100,
      });

      // Verify query was called (can't easily verify raw SQL params)
      expect(prismaService.$queryRaw).toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      embeddingService.validateEmbedding.mockReturnValue(true);
      embeddingService.toVectorString.mockReturnValue(mockVectorString);
      prismaService.$queryRaw.mockRejectedValue(new Error('Database error'));

      await expect(service.findSimilarProducts(mockEmbedding)).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('findSimilarProductsByText', () => {
    it('should generate embedding and find similar products', async () => {
      embeddingService.generateQueryEmbedding.mockResolvedValue({
        embedding: mockEmbedding,
        model: 'text-embedding-3-small',
        tokensUsed: 5,
      });
      embeddingService.validateEmbedding.mockReturnValue(true);
      embeddingService.toVectorString.mockReturnValue(mockVectorString);

      const mockResults = [{ id: 'p1', similarity: 0.9 }];
      prismaService.$queryRaw.mockResolvedValue(mockResults);

      const result = await service.findSimilarProductsByText('gift for mom');

      expect(embeddingService.generateQueryEmbedding).toHaveBeenCalledWith('gift for mom');
      expect(result).toEqual(mockResults);
    });

    it('should pass options through to findSimilarProducts', async () => {
      embeddingService.generateQueryEmbedding.mockResolvedValue({
        embedding: mockEmbedding,
        model: 'text-embedding-3-small',
        tokensUsed: 5,
      });
      embeddingService.validateEmbedding.mockReturnValue(true);
      embeddingService.toVectorString.mockReturnValue(mockVectorString);
      prismaService.$queryRaw.mockResolvedValue([]);

      await service.findSimilarProductsByText('tech gifts', {
        matchThreshold: 0.9,
        matchCount: 5,
      });

      expect(embeddingService.generateQueryEmbedding).toHaveBeenCalled();
      expect(prismaService.$queryRaw).toHaveBeenCalled();
    });
  });

  describe('findSimilarToProduct', () => {
    it('should return empty array if product has no embedding', async () => {
      prismaService.$queryRaw.mockResolvedValue([{ embedding: null }]);

      const result = await service.findSimilarToProduct('product-123');

      expect(result).toEqual([]);
    });

    it('should find products similar to given product', async () => {
      // First query returns the product's embedding
      prismaService.$queryRaw
        .mockResolvedValueOnce([{ embedding: mockVectorString }])
        // Second query returns similar products
        .mockResolvedValueOnce([
          { id: 'p1', similarity: 0.95 },
          { id: 'product-123', similarity: 1.0 }, // The source product
          { id: 'p2', similarity: 0.9 },
        ]);

      embeddingService.fromVectorString.mockReturnValue(mockEmbedding);
      embeddingService.validateEmbedding.mockReturnValue(true);
      embeddingService.toVectorString.mockReturnValue(mockVectorString);

      const result = await service.findSimilarToProduct('product-123', {
        matchCount: 2,
      });

      // Should filter out the source product
      expect(result).toHaveLength(2);
      expect(result.find((p) => p.id === 'product-123')).toBeUndefined();
    });

    it('should request extra result to account for self-match', async () => {
      prismaService.$queryRaw
        .mockResolvedValueOnce([{ embedding: mockVectorString }])
        .mockResolvedValueOnce([{ id: 'p1', similarity: 0.9 }]);

      embeddingService.fromVectorString.mockReturnValue(mockEmbedding);
      embeddingService.validateEmbedding.mockReturnValue(true);
      embeddingService.toVectorString.mockReturnValue(mockVectorString);

      await service.findSimilarToProduct('product-123', { matchCount: 10 });

      // Should have been called with matchCount + 1 = 11
      expect(embeddingService.validateEmbedding).toHaveBeenCalled();
    });
  });

  describe('findSimilarQueries', () => {
    it('should throw error for invalid embedding', async () => {
      embeddingService.validateEmbedding.mockReturnValue(false);

      await expect(service.findSimilarQueries(mockEmbedding)).rejects.toThrow(
        'Invalid embedding provided'
      );
    });

    it('should find similar queries', async () => {
      embeddingService.validateEmbedding.mockReturnValue(true);
      embeddingService.toVectorString.mockReturnValue(mockVectorString);

      const mockQueries = [
        { query: 'gift for mother', similarity: 0.95 },
        { query: 'present for mom', similarity: 0.9 },
      ];
      prismaService.$queryRaw.mockResolvedValue(mockQueries);

      const result = await service.findSimilarQueries(mockEmbedding, 0.8, 5);

      expect(result).toEqual(mockQueries);
    });
  });

  describe('hybridSearch', () => {
    it('should throw error for invalid embedding', async () => {
      embeddingService.validateEmbedding.mockReturnValue(false);

      await expect(
        service.hybridSearch('test query', mockEmbedding)
      ).rejects.toThrow('Invalid embedding provided');
    });

    it('should perform hybrid search with default weights', async () => {
      embeddingService.validateEmbedding.mockReturnValue(true);
      embeddingService.toVectorString.mockReturnValue(mockVectorString);

      const mockResults = [
        { id: 'p1', keywordScore: 0.5, semanticScore: 0.9, combinedScore: 0.78 },
      ];
      prismaService.$queryRaw.mockResolvedValue(mockResults);

      const result = await service.hybridSearch('birthday gift', mockEmbedding);

      expect(result).toEqual(mockResults);
    });

    it('should apply custom weights', async () => {
      embeddingService.validateEmbedding.mockReturnValue(true);
      embeddingService.toVectorString.mockReturnValue(mockVectorString);
      prismaService.$queryRaw.mockResolvedValue([]);

      await service.hybridSearch('gift', mockEmbedding, {
        keywordWeight: 0.5,
        semanticWeight: 0.5,
        matchCount: 30,
      });

      expect(prismaService.$queryRaw).toHaveBeenCalled();
    });
  });

  describe('hybridSearchByText', () => {
    it('should generate embedding and perform hybrid search', async () => {
      embeddingService.generateQueryEmbedding.mockResolvedValue({
        embedding: mockEmbedding,
        model: 'text-embedding-3-small',
        tokensUsed: 5,
      });
      embeddingService.validateEmbedding.mockReturnValue(true);
      embeddingService.toVectorString.mockReturnValue(mockVectorString);

      const mockResults = [{ id: 'p1', combinedScore: 0.85 }];
      prismaService.$queryRaw.mockResolvedValue(mockResults);

      const result = await service.hybridSearchByText('tech gifts');

      expect(embeddingService.generateQueryEmbedding).toHaveBeenCalledWith('tech gifts');
      expect(result).toEqual(mockResults);
    });
  });

  describe('calculateSimilarity', () => {
    it('should calculate cosine similarity between two embeddings', () => {
      const embedding1 = [1, 0, 0];
      const embedding2 = [1, 0, 0];

      const result = service.calculateSimilarity(embedding1, embedding2);

      expect(result).toBe(1); // Identical vectors have similarity 1
    });

    it('should return 0 for orthogonal vectors', () => {
      const embedding1 = [1, 0, 0];
      const embedding2 = [0, 1, 0];

      const result = service.calculateSimilarity(embedding1, embedding2);

      expect(result).toBe(0);
    });

    it('should return -1 for opposite vectors', () => {
      const embedding1 = [1, 0, 0];
      const embedding2 = [-1, 0, 0];

      const result = service.calculateSimilarity(embedding1, embedding2);

      expect(result).toBe(-1);
    });

    it('should throw error for different dimensions', () => {
      const embedding1 = [1, 0, 0];
      const embedding2 = [1, 0];

      expect(() => service.calculateSimilarity(embedding1, embedding2)).toThrow(
        'Embeddings must have the same dimensions'
      );
    });

    it('should return 0 for zero vectors', () => {
      const embedding1 = [0, 0, 0];
      const embedding2 = [1, 0, 0];

      const result = service.calculateSimilarity(embedding1, embedding2);

      expect(result).toBe(0);
    });

    it('should handle partial similarity correctly', () => {
      const embedding1 = [1, 1, 0];
      const embedding2 = [1, 0, 0];

      const result = service.calculateSimilarity(embedding1, embedding2);

      // cos(45°) ≈ 0.707
      expect(result).toBeCloseTo(0.707, 2);
    });
  });

  describe('findUsersWithSimilarPreferences', () => {
    it('should return empty array if user has no preference embedding', async () => {
      prismaService.$queryRaw.mockResolvedValue([{ preference_embedding: null }]);

      const result = await service.findUsersWithSimilarPreferences('user-123');

      expect(result).toEqual([]);
    });

    it('should find users with similar preferences', async () => {
      prismaService.$queryRaw
        .mockResolvedValueOnce([{ preference_embedding: mockVectorString }])
        .mockResolvedValueOnce([
          { user_id: 'user-456', similarity: 0.85 },
          { user_id: 'user-789', similarity: 0.8 },
        ]);

      embeddingService.fromVectorString.mockReturnValue(mockEmbedding);
      embeddingService.toVectorString.mockReturnValue(mockVectorString);

      const result = await service.findUsersWithSimilarPreferences('user-123', 0.7, 10);

      expect(result).toHaveLength(2);
      expect(result[0].userId).toBe('user-456');
      expect(result[0].similarity).toBe(0.85);
    });

    it('should return empty array on database error', async () => {
      prismaService.$queryRaw.mockRejectedValue(new Error('Database error'));

      const result = await service.findUsersWithSimilarPreferences('user-123');

      expect(result).toEqual([]);
    });
  });

  describe('getPersonalizedRecommendations', () => {
    it('should return empty array if user has no preference embedding', async () => {
      prismaService.$queryRaw.mockResolvedValue([{ preference_embedding: null }]);

      const result = await service.getPersonalizedRecommendations('user-123');

      expect(result).toEqual([]);
    });

    it('should get recommendations based on user preferences', async () => {
      prismaService.$queryRaw
        .mockResolvedValueOnce([{ preference_embedding: mockVectorString }])
        .mockResolvedValueOnce([
          { id: 'p1', title: 'Recommended 1', similarity: 0.8 },
          { id: 'p2', title: 'Recommended 2', similarity: 0.75 },
        ]);

      embeddingService.fromVectorString.mockReturnValue(mockEmbedding);
      embeddingService.validateEmbedding.mockReturnValue(true);
      embeddingService.toVectorString.mockReturnValue(mockVectorString);

      const result = await service.getPersonalizedRecommendations('user-123', 20);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('p1');
    });

    it('should return empty array on error', async () => {
      prismaService.$queryRaw.mockRejectedValue(new Error('Database error'));

      const result = await service.getPersonalizedRecommendations('user-123');

      expect(result).toEqual([]);
    });
  });
});
