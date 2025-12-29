/**
 * @jest-environment node
 */
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmbeddingService } from './embedding.service';

describe('EmbeddingService', () => {
  let service: EmbeddingService;
  let configService: jest.Mocked<ConfigService>;

  const mockEmbedding = Array(1536).fill(0.1);
  const mockOpenAIResponse = {
    data: [{ index: 0, embedding: mockEmbedding }],
    usage: { total_tokens: 10 },
  };

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmbeddingService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<EmbeddingService>(EmbeddingService);
    configService = module.get(ConfigService);
  });

  describe('onModuleInit', () => {
    it('should warn if OPENAI_API_KEY is not configured', async () => {
      configService.get.mockReturnValue(undefined);
      const warnSpy = jest.spyOn(service['logger'], 'warn');

      await service.onModuleInit();

      expect(warnSpy).toHaveBeenCalledWith(
        'OPENAI_API_KEY not configured - embedding generation will fail'
      );
    });

    it('should initialize OpenAI client with API key', async () => {
      configService.get.mockReturnValue('test-api-key');
      const logSpy = jest.spyOn(service['logger'], 'log');

      await service.onModuleInit();

      expect(logSpy).toHaveBeenCalledWith('EmbeddingService initialized with OpenAI');
      expect(service['openai']).toBeDefined();
    });
  });

  describe('generateEmbedding', () => {
    beforeEach(async () => {
      configService.get.mockReturnValue('test-api-key');
      await service.onModuleInit();
    });

    it('should throw error if OpenAI client not initialized', async () => {
      service['openai'] = undefined as any;

      await expect(service.generateEmbedding({ text: 'test' })).rejects.toThrow(
        'OpenAI client not initialized - check OPENAI_API_KEY'
      );
    });

    it('should generate embedding with default model', async () => {
      service['openai'] = {
        embeddings: {
          create: jest.fn().mockResolvedValue(mockOpenAIResponse),
        },
      } as any;

      const result = await service.generateEmbedding({ text: 'test text' });

      expect(result.embedding).toEqual(mockEmbedding);
      expect(result.model).toBe('text-embedding-3-small');
      expect(result.tokensUsed).toBe(10);
    });

    it('should use custom model when specified', async () => {
      service['openai'] = {
        embeddings: {
          create: jest.fn().mockResolvedValue(mockOpenAIResponse),
        },
      } as any;

      await service.generateEmbedding({
        text: 'test',
        model: 'text-embedding-3-large',
      });

      expect(service['openai'].embeddings.create).toHaveBeenCalledWith({
        model: 'text-embedding-3-large',
        input: 'test',
      });
    });
  });

  describe('generateBatchEmbeddings', () => {
    beforeEach(async () => {
      configService.get.mockReturnValue('test-api-key');
      await service.onModuleInit();
    });

    it('should return empty array for empty input', async () => {
      const result = await service.generateBatchEmbeddings({ texts: [] });

      expect(result.embeddings).toEqual([]);
      expect(result.tokensUsed).toBe(0);
    });

    it('should generate embeddings for multiple texts', async () => {
      const batchResponse = {
        data: [
          { index: 0, embedding: mockEmbedding },
          { index: 1, embedding: mockEmbedding },
        ],
        usage: { total_tokens: 20 },
      };

      service['openai'] = {
        embeddings: {
          create: jest.fn().mockResolvedValue(batchResponse),
        },
      } as any;

      const result = await service.generateBatchEmbeddings({
        texts: ['text 1', 'text 2'],
      });

      expect(result.embeddings).toHaveLength(2);
      expect(result.tokensUsed).toBe(20);
    });

    it('should process in batches of maxBatchSize', async () => {
      const texts = Array(150).fill('test text');
      const batchResponse = {
        data: Array(100)
          .fill(null)
          .map((_, i) => ({ index: i, embedding: mockEmbedding })),
        usage: { total_tokens: 100 },
      };

      service['openai'] = {
        embeddings: {
          create: jest.fn().mockResolvedValue(batchResponse),
        },
      } as any;

      await service.generateBatchEmbeddings({ texts });

      // Should be called twice: 100 + 50
      expect(service['openai'].embeddings.create).toHaveBeenCalledTimes(2);
    });

    it('should maintain order when responses are out of order', async () => {
      const unorderedResponse = {
        data: [
          { index: 1, embedding: Array(1536).fill(0.2) },
          { index: 0, embedding: Array(1536).fill(0.1) },
        ],
        usage: { total_tokens: 20 },
      };

      service['openai'] = {
        embeddings: {
          create: jest.fn().mockResolvedValue(unorderedResponse),
        },
      } as any;

      const result = await service.generateBatchEmbeddings({
        texts: ['text 1', 'text 2'],
      });

      // First embedding should have 0.1 values (was index 0)
      expect(result.embeddings[0][0]).toBe(0.1);
      // Second embedding should have 0.2 values (was index 1)
      expect(result.embeddings[1][0]).toBe(0.2);
    });
  });

  describe('generateProductEmbedding', () => {
    beforeEach(async () => {
      configService.get.mockReturnValue('test-api-key');
      await service.onModuleInit();
      service['openai'] = {
        embeddings: {
          create: jest.fn().mockResolvedValue(mockOpenAIResponse),
        },
      } as any;
    });

    it('should generate embedding from title only', async () => {
      await service.generateProductEmbedding('Product Title');

      expect(service['openai'].embeddings.create).toHaveBeenCalledWith({
        model: 'text-embedding-3-small',
        input: 'Product Title',
      });
    });

    it('should combine title and description', async () => {
      await service.generateProductEmbedding('Product Title', 'Product description');

      expect(service['openai'].embeddings.create).toHaveBeenCalledWith({
        model: 'text-embedding-3-small',
        input: 'Product Title. Product description',
      });
    });

    it('should truncate long descriptions to 500 characters', async () => {
      const longDescription = 'a'.repeat(1000);

      await service.generateProductEmbedding('Title', longDescription);

      const call = (service['openai'].embeddings.create as jest.Mock).mock.calls[0][0];
      expect(call.input).toContain('a'.repeat(500));
      expect(call.input).not.toContain('a'.repeat(501));
    });

    it('should include category and tags', async () => {
      await service.generateProductEmbedding(
        'Title',
        'Description',
        'Electronics',
        ['gift', 'tech', 'gadget']
      );

      expect(service['openai'].embeddings.create).toHaveBeenCalledWith({
        model: 'text-embedding-3-small',
        input: 'Title. Description. Category: Electronics. Tags: gift, tech, gadget',
      });
    });

    it('should limit tags to 10', async () => {
      const manyTags = Array(20)
        .fill(null)
        .map((_, i) => `tag${i}`);

      await service.generateProductEmbedding('Title', null, null, manyTags);

      const call = (service['openai'].embeddings.create as jest.Mock).mock.calls[0][0];
      const expectedTags = manyTags.slice(0, 10).join(', ');
      expect(call.input).toContain(`Tags: ${expectedTags}`);
    });
  });

  describe('generateQueryEmbedding', () => {
    beforeEach(async () => {
      configService.get.mockReturnValue('test-api-key');
      await service.onModuleInit();
      service['openai'] = {
        embeddings: {
          create: jest.fn().mockResolvedValue(mockOpenAIResponse),
        },
      } as any;
    });

    it('should normalize query before embedding', async () => {
      await service.generateQueryEmbedding('  GIFT FOR MOM  ');

      expect(service['openai'].embeddings.create).toHaveBeenCalledWith({
        model: 'text-embedding-3-small',
        input: 'gift for mom',
      });
    });
  });

  describe('calculateCost', () => {
    it('should calculate cost for text-embedding-3-small', () => {
      const result = service.calculateCost(1_000_000);

      expect(result.tokensUsed).toBe(1_000_000);
      expect(result.estimatedCost).toBe(0.02);
      expect(result.model).toBe('text-embedding-3-small');
    });

    it('should calculate cost for text-embedding-3-large', () => {
      const result = service.calculateCost(1_000_000, 'text-embedding-3-large');

      expect(result.estimatedCost).toBe(0.13);
    });

    it('should calculate cost for text-embedding-ada-002', () => {
      const result = service.calculateCost(1_000_000, 'text-embedding-ada-002');

      expect(result.estimatedCost).toBe(0.1);
    });

    it('should handle partial token counts', () => {
      const result = service.calculateCost(500);

      expect(result.estimatedCost).toBeCloseTo(0.00001, 6);
    });

    it('should include timestamp', () => {
      const result = service.calculateCost(100);

      expect(result.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('validateEmbedding', () => {
    it('should return true for valid embedding', () => {
      const embedding = Array(1536).fill(0.5);

      expect(service.validateEmbedding(embedding)).toBe(true);
    });

    it('should return false for non-array', () => {
      expect(service.validateEmbedding('not an array' as any)).toBe(false);
    });

    it('should return false for wrong dimensions', () => {
      const embedding = Array(512).fill(0.5);

      expect(service.validateEmbedding(embedding)).toBe(false);
    });

    it('should return false for NaN values', () => {
      const embedding = Array(1536).fill(NaN);

      expect(service.validateEmbedding(embedding)).toBe(false);
    });

    it('should return false for Infinity values', () => {
      const embedding = Array(1536).fill(Infinity);

      expect(service.validateEmbedding(embedding)).toBe(false);
    });

    it('should return false for non-number values', () => {
      const embedding = Array(1536).fill('string');

      expect(service.validateEmbedding(embedding as any)).toBe(false);
    });

    it('should accept custom dimensions', () => {
      const embedding = Array(768).fill(0.5);

      expect(service.validateEmbedding(embedding, 768)).toBe(true);
    });
  });

  describe('toVectorString', () => {
    it('should convert embedding to PostgreSQL vector format', () => {
      const embedding = [0.1, 0.2, 0.3];

      const result = service.toVectorString(embedding);

      expect(result).toBe('[0.1,0.2,0.3]');
    });

    it('should handle empty embedding', () => {
      expect(service.toVectorString([])).toBe('[]');
    });
  });

  describe('fromVectorString', () => {
    it('should parse PostgreSQL vector format', () => {
      const vectorString = '[0.1,0.2,0.3]';

      const result = service.fromVectorString(vectorString);

      expect(result).toEqual([0.1, 0.2, 0.3]);
    });

    it('should handle spaces in vector string', () => {
      const vectorString = '[ 0.1, 0.2, 0.3 ]';

      const result = service.fromVectorString(vectorString);

      expect(result).toEqual([0.1, 0.2, 0.3]);
    });

    it('should handle negative values', () => {
      const vectorString = '[-0.1,0.2,-0.3]';

      const result = service.fromVectorString(vectorString);

      expect(result).toEqual([-0.1, 0.2, -0.3]);
    });
  });

  describe('retryWithBackoff', () => {
    beforeEach(async () => {
      configService.get.mockReturnValue('test-api-key');
      await service.onModuleInit();
    });

    it('should retry on rate limit (429) error', async () => {
      const rateLimitError = { status: 429, message: 'Rate limited' };
      let attempts = 0;

      service['openai'] = {
        embeddings: {
          create: jest.fn().mockImplementation(() => {
            attempts++;
            if (attempts < 2) {
              throw rateLimitError;
            }
            return Promise.resolve(mockOpenAIResponse);
          }),
        },
      } as any;

      // Mock sleep to avoid actual delays
      service['sleep'] = jest.fn().mockResolvedValue(undefined);

      const result = await service.generateEmbedding({ text: 'test' });

      expect(result.embedding).toBeDefined();
      expect(attempts).toBe(2);
    });

    it('should retry on server error (5xx)', async () => {
      const serverError = { status: 500, message: 'Server error' };
      let attempts = 0;

      service['openai'] = {
        embeddings: {
          create: jest.fn().mockImplementation(() => {
            attempts++;
            if (attempts < 2) {
              throw serverError;
            }
            return Promise.resolve(mockOpenAIResponse);
          }),
        },
      } as any;

      service['sleep'] = jest.fn().mockResolvedValue(undefined);

      const result = await service.generateEmbedding({ text: 'test' });

      expect(result.embedding).toBeDefined();
      expect(attempts).toBe(2);
    });

    it('should not retry on client error (4xx except 429)', async () => {
      const clientError = { status: 400, message: 'Bad request' };

      service['openai'] = {
        embeddings: {
          create: jest.fn().mockRejectedValue(clientError),
        },
      } as any;

      await expect(service.generateEmbedding({ text: 'test' })).rejects.toEqual(
        clientError
      );

      expect(service['openai'].embeddings.create).toHaveBeenCalledTimes(1);
    });

    it('should throw after max retries', async () => {
      const rateLimitError = { status: 429, message: 'Rate limited' };

      service['openai'] = {
        embeddings: {
          create: jest.fn().mockRejectedValue(rateLimitError),
        },
      } as any;

      service['sleep'] = jest.fn().mockResolvedValue(undefined);

      await expect(service.generateEmbedding({ text: 'test' })).rejects.toEqual(
        rateLimitError
      );

      // Initial attempt + 3 retries = 4 calls
      expect(service['openai'].embeddings.create).toHaveBeenCalledTimes(4);
    });
  });
});
