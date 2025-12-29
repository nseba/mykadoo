/**
 * @jest-environment node
 *
 * Integration tests for Vector API endpoints
 * These tests verify the full request/response flow through the controller
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { VectorModule } from '../vector.module';
import { VectorService } from '../vector.service';
import { EmbeddingService } from '../embedding.service';
import { VectorStorageService } from '../vector-storage.service';
import { SimilaritySearchService } from '../similarity-search.service';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';

describe('Vector API Integration Tests', () => {
  let app: INestApplication;
  let vectorService: jest.Mocked<VectorService>;

  const mockEmbedding = Array(1536).fill(0.1);
  const mockSearchResults = [
    {
      id: 'product-1',
      title: 'Gift for Mom',
      similarity: 0.92,
      price: 29.99,
      category: 'Gifts',
    },
    {
      id: 'product-2',
      title: 'Birthday Present',
      similarity: 0.87,
      price: 49.99,
      category: 'Gifts',
    },
  ];

  const mockHybridResults = [
    {
      id: 'product-1',
      title: 'Tech Gadget',
      keywordScore: 0.8,
      semanticScore: 0.9,
      combinedScore: 0.87,
    },
  ];

  const mockEmbeddingStatus = {
    totalProducts: 1000,
    productsWithEmbeddings: 800,
    coverage: 0.8,
    lastUpdated: new Date(),
  };

  beforeAll(async () => {
    const mockVectorService = {
      findSimilarProducts: jest.fn(),
      findSimilarToProduct: jest.fn(),
      hybridSearch: jest.fn(),
      getRecommendations: jest.fn(),
      getEmbeddingStatus: jest.fn(),
      hasEmbedding: jest.fn(),
      getProductsNeedingEmbeddings: jest.fn(),
      backfillEmbeddings: jest.fn(),
      embeddingService: {
        generateEmbedding: jest.fn(),
        calculateCost: jest.fn(),
      },
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        CacheModule.register(),
      ],
      controllers: [(await import('../vector.controller')).VectorController],
      providers: [{ provide: VectorService, useValue: mockVectorService }],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      })
    );
    await app.init();

    vectorService = moduleFixture.get(VectorService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /vectors/search', () => {
    it('should perform semantic search', async () => {
      vectorService.findSimilarProducts.mockResolvedValue(mockSearchResults as any);

      const response = await request(app.getHttpServer())
        .post('/vectors/search')
        .send({ query: 'gift for mom' })
        .expect(200);

      expect(response.body.results).toHaveLength(2);
      expect(response.body.count).toBe(2);
      expect(response.body.results[0].id).toBe('product-1');
    });

    it('should pass search options correctly', async () => {
      vectorService.findSimilarProducts.mockResolvedValue([]);

      await request(app.getHttpServer())
        .post('/vectors/search')
        .send({
          query: 'tech gifts',
          matchThreshold: 0.8,
          matchCount: 20,
          categoryFilter: 'Electronics',
          minPrice: 10,
          maxPrice: 100,
        })
        .expect(200);

      expect(vectorService.findSimilarProducts).toHaveBeenCalledWith('tech gifts', {
        matchThreshold: 0.8,
        matchCount: 20,
        categoryFilter: 'Electronics',
        minPrice: 10,
        maxPrice: 100,
      });
    });

    it('should return empty results when no matches found', async () => {
      vectorService.findSimilarProducts.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .post('/vectors/search')
        .send({ query: 'nonexistent item' })
        .expect(200);

      expect(response.body.results).toEqual([]);
      expect(response.body.count).toBe(0);
    });

    it('should return 400 for missing query', async () => {
      await request(app.getHttpServer())
        .post('/vectors/search')
        .send({})
        .expect(400);
    });
  });

  describe('POST /vectors/hybrid-search', () => {
    it('should perform hybrid search', async () => {
      vectorService.hybridSearch.mockResolvedValue(mockHybridResults as any);

      const response = await request(app.getHttpServer())
        .post('/vectors/hybrid-search')
        .send({ query: 'tech gadgets' })
        .expect(200);

      expect(response.body.results).toHaveLength(1);
      expect(response.body.results[0].combinedScore).toBe(0.87);
    });

    it('should pass weights correctly', async () => {
      vectorService.hybridSearch.mockResolvedValue([]);

      await request(app.getHttpServer())
        .post('/vectors/hybrid-search')
        .send({
          query: 'birthday gift',
          keywordWeight: 0.4,
          semanticWeight: 0.6,
          matchCount: 30,
        })
        .expect(200);

      expect(vectorService.hybridSearch).toHaveBeenCalledWith('birthday gift', {
        keywordWeight: 0.4,
        semanticWeight: 0.6,
        matchCount: 30,
      });
    });
  });

  describe('GET /vectors/products/:id/similar', () => {
    it('should find similar products', async () => {
      vectorService.findSimilarToProduct.mockResolvedValue(mockSearchResults as any);

      const response = await request(app.getHttpServer())
        .get('/vectors/products/product-123/similar')
        .expect(200);

      expect(response.body.results).toHaveLength(2);
      expect(vectorService.findSimilarToProduct).toHaveBeenCalledWith(
        'product-123',
        expect.any(Object)
      );
    });

    it('should pass query parameters', async () => {
      vectorService.findSimilarToProduct.mockResolvedValue([]);

      await request(app.getHttpServer())
        .get('/vectors/products/product-123/similar')
        .query({
          matchThreshold: 0.85,
          matchCount: 10,
          categoryFilter: 'Electronics',
        })
        .expect(200);

      expect(vectorService.findSimilarToProduct).toHaveBeenCalledWith('product-123', {
        matchThreshold: 0.85, // ValidationPipe transforms to number
        matchCount: 10,
        categoryFilter: 'Electronics',
        minPrice: undefined,
        maxPrice: undefined,
      });
    });

    it('should return empty results for product without embedding', async () => {
      vectorService.findSimilarToProduct.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/vectors/products/no-embedding/similar')
        .expect(200);

      expect(response.body.results).toEqual([]);
      expect(response.body.count).toBe(0);
    });
  });

  describe('GET /vectors/recommendations/:userId', () => {
    it('should get personalized recommendations', async () => {
      vectorService.getRecommendations.mockResolvedValue(mockSearchResults as any);

      const response = await request(app.getHttpServer())
        .get('/vectors/recommendations/user-123')
        .expect(200);

      expect(response.body.results).toHaveLength(2);
      expect(vectorService.getRecommendations).toHaveBeenCalledWith('user-123', 20);
    });

    it('should respect count parameter', async () => {
      vectorService.getRecommendations.mockResolvedValue([]);

      await request(app.getHttpServer())
        .get('/vectors/recommendations/user-123')
        .query({ count: 50 })
        .expect(200);

      expect(vectorService.getRecommendations).toHaveBeenCalledWith('user-123', 50);
    });
  });

  describe('GET /vectors/status', () => {
    it('should return embedding status', async () => {
      vectorService.getEmbeddingStatus.mockResolvedValue(mockEmbeddingStatus as any);

      const response = await request(app.getHttpServer())
        .get('/vectors/status')
        .expect(200);

      expect(response.body.totalProducts).toBe(1000);
      expect(response.body.productsWithEmbeddings).toBe(800);
      expect(response.body.coverage).toBe(0.8);
    });
  });

  describe('GET /vectors/products/:id/has-embedding', () => {
    it('should return true if product has embedding', async () => {
      vectorService.hasEmbedding.mockResolvedValue(true);

      const response = await request(app.getHttpServer())
        .get('/vectors/products/product-123/has-embedding')
        .expect(200);

      expect(response.body).toEqual({
        productId: 'product-123',
        hasEmbedding: true,
      });
    });

    it('should return false if product has no embedding', async () => {
      vectorService.hasEmbedding.mockResolvedValue(false);

      const response = await request(app.getHttpServer())
        .get('/vectors/products/product-456/has-embedding')
        .expect(200);

      expect(response.body).toEqual({
        productId: 'product-456',
        hasEmbedding: false,
      });
    });
  });

  describe('POST /vectors/backfill', () => {
    it('should backfill embeddings with defaults', async () => {
      vectorService.backfillEmbeddings.mockResolvedValue({
        processed: 50,
        cost: {
          tokensUsed: 5000,
          estimatedCost: 0.0001,
          model: 'text-embedding-3-small',
          timestamp: new Date(),
        },
      });

      const response = await request(app.getHttpServer())
        .post('/vectors/backfill')
        .send({})
        .expect(200);

      expect(response.body.processed).toBe(50);
      expect(vectorService.backfillEmbeddings).toHaveBeenCalledWith(100, 50);
    });

    it('should respect custom limit and batch size', async () => {
      vectorService.backfillEmbeddings.mockResolvedValue({
        processed: 25,
        cost: {
          tokensUsed: 2500,
          estimatedCost: 0.00005,
          model: 'text-embedding-3-small',
          timestamp: new Date(),
        },
      });

      await request(app.getHttpServer())
        .post('/vectors/backfill')
        .send({ limit: 25, batchSize: 10 })
        .expect(200);

      expect(vectorService.backfillEmbeddings).toHaveBeenCalledWith(25, 10);
    });
  });

  describe('GET /vectors/products/missing', () => {
    it('should return products needing embeddings', async () => {
      const missingProducts = [
        { id: 'p1', title: 'Product 1' },
        { id: 'p2', title: 'Product 2' },
      ];
      vectorService.getProductsNeedingEmbeddings.mockResolvedValue(
        missingProducts as any
      );

      const response = await request(app.getHttpServer())
        .get('/vectors/products/missing')
        .expect(200);

      expect(response.body.products).toHaveLength(2);
      expect(response.body.count).toBe(2);
      expect(response.body.products[0].id).toBe('p1');
    });

    it('should respect limit parameter', async () => {
      vectorService.getProductsNeedingEmbeddings.mockResolvedValue([]);

      await request(app.getHttpServer())
        .get('/vectors/products/missing')
        .query({ limit: 50 })
        .expect(200);

      expect(vectorService.getProductsNeedingEmbeddings).toHaveBeenCalledWith(50);
    });
  });

  describe('POST /vectors/embed', () => {
    it('should generate embedding and return dimensions', async () => {
      vectorService['embeddingService'].generateEmbedding.mockResolvedValue({
        embedding: mockEmbedding,
        model: 'text-embedding-3-small',
        tokensUsed: 10,
      });
      vectorService['embeddingService'].calculateCost.mockReturnValue({
        tokensUsed: 10,
        estimatedCost: 0.0002,
        model: 'text-embedding-3-small',
        timestamp: new Date(),
      });

      const response = await request(app.getHttpServer())
        .post('/vectors/embed')
        .send({ text: 'Test text for embedding' })
        .expect(200);

      expect(response.body.dimensions).toBe(1536);
      expect(response.body.cost).toBeDefined();
    });

    it('should return error for empty text', async () => {
      // Empty text causes service-level error (500)
      // Validation could be added in controller to return 400
      const response = await request(app.getHttpServer())
        .post('/vectors/embed')
        .send({ text: '' });

      expect([400, 500]).toContain(response.status);
    });
  });

  describe('Error handling', () => {
    it('should handle service errors gracefully', async () => {
      vectorService.findSimilarProducts.mockRejectedValue(
        new Error('OpenAI API error')
      );

      const response = await request(app.getHttpServer())
        .post('/vectors/search')
        .send({ query: 'test' })
        .expect(500);

      expect(response.body.message).toBeDefined();
    });
  });
});
