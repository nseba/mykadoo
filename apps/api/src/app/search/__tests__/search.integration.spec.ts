/**
 * Search Integration Tests
 * 
 * Tests the complete search flow including AI, caching, and validation
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { SearchModule } from '../search.module';
import { CacheService } from '@mykadoo/cache';

describe('SearchController (Integration)', () => {
  let app: INestApplication;
  let cacheService: CacheService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SearchModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    cacheService = moduleFixture.get<CacheService>(CacheService);
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clear cache before each test
    await cacheService.clear();
  });

  describe('POST /api/search', () => {
    it('should return gift recommendations', async () => {
      const searchDto = {
        occasion: 'birthday',
        relationship: 'friend',
        ageRange: 'young-adult',
        budgetMin: 50,
        budgetMax: 100,
        interests: ['gaming', 'tech'],
      };

      const response = await request(app.getHttpServer())
        .post('/api/search')
        .send(searchDto)
        .expect(200);

      expect(response.body).toHaveProperty('recommendations');
      expect(response.body.recommendations).toHaveLength(10);
      expect(response.body.recommendations[0]).toMatchObject({
        productName: expect.any(String),
        description: expect.any(String),
        price: expect.any(Number),
        matchReason: expect.any(String),
      });
    });

    it('should validate required fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/search')
        .send({})
        .expect(400);

      expect(response.body.message).toContain('occasion');
      expect(response.body.message).toContain('relationship');
    });

    it('should cache search results', async () => {
      const searchDto = {
        occasion: 'birthday',
        relationship: 'friend',
        ageRange: 'young-adult',
        budgetMin: 50,
        budgetMax: 100,
        interests: ['gaming'],
      };

      // First request
      const response1 = await request(app.getHttpServer())
        .post('/api/search')
        .send(searchDto)
        .expect(200);

      // Second request (should be cached)
      const response2 = await request(app.getHttpServer())
        .post('/api/search')
        .send(searchDto)
        .expect(200);

      expect(response1.body).toEqual(response2.body);
    });

    it('should respect budget constraints', async () => {
      const searchDto = {
        occasion: 'birthday',
        relationship: 'friend',
        ageRange: 'adult',
        budgetMin: 100,
        budgetMax: 200,
        interests: ['cooking'],
      };

      const response = await request(app.getHttpServer())
        .post('/api/search')
        .send(searchDto)
        .expect(200);

      const recommendations = response.body.recommendations;
      recommendations.forEach((rec: any) => {
        expect(rec.price).toBeGreaterThanOrEqual(100);
        expect(rec.price).toBeLessThanOrEqual(200);
      });
    });
  });

  describe('GET /api/search/health', () => {
    it('should return health status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/search/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'ok',
        service: 'search',
        timestamp: expect.any(String),
      });
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const searchDto = {
        occasion: 'birthday',
        relationship: 'friend',
        ageRange: 'adult',
        budgetMin: 50,
        budgetMax: 100,
        interests: ['sports'],
      };

      // Make 61 requests (rate limit is 60/min)
      const promises = Array.from({ length: 61 }, () =>
        request(app.getHttpServer()).post('/api/search').send(searchDto)
      );

      const responses = await Promise.all(promises);
      const rateLimited = responses.filter((r) => r.status === 429);

      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });
});
