/**
 * @jest-environment node
 */
import { Test, TestingModule } from '@nestjs/testing';
import { VectorLoggingService, VectorLogEntry, QueryLog } from './vector-logging.service';
import { VectorOperationType } from './vector-metrics.service';

describe('VectorLoggingService', () => {
  let service: VectorLoggingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VectorLoggingService],
    }).compile();

    service = module.get<VectorLoggingService>(VectorLoggingService);
  });

  describe('logSearch', () => {
    it('should log a successful search operation', () => {
      const debugSpy = jest.spyOn(service['logger'], 'debug');

      service.logSearch({
        operation: 'similarity_search',
        query: 'gift for mom',
        durationMs: 50,
        resultCount: 10,
      });

      expect(debugSpy).toHaveBeenCalled();
    });

    it('should log slow queries as warnings', () => {
      const warnSpy = jest.spyOn(service['logger'], 'warn');

      service.logSearch({
        operation: 'similarity_search',
        query: 'slow query',
        durationMs: 600, // > 500ms threshold
        resultCount: 5,
      });

      expect(warnSpy).toHaveBeenCalled();
    });

    it('should log errors as error level', () => {
      const errorSpy = jest.spyOn(service['logger'], 'error');

      service.logSearch({
        operation: 'similarity_search',
        query: 'failed query',
        error: {
          type: 'DatabaseError',
          message: 'Connection failed',
        },
      });

      expect(errorSpy).toHaveBeenCalled();
    });

    it('should add successful operations to query log buffer', () => {
      service.logSearch({
        operation: 'similarity_search',
        query: 'test query',
        durationMs: 50,
        resultCount: 10,
      });

      expect(service.getBufferSize()).toBe(1);
    });

    it('should not add error operations to query log buffer', () => {
      service.logSearch({
        operation: 'similarity_search',
        error: {
          type: 'Error',
          message: 'Failed',
        },
      });

      expect(service.getBufferSize()).toBe(0);
    });

    it('should include cache information in logs', () => {
      const debugSpy = jest.spyOn(service['logger'], 'debug');

      service.logSearch({
        operation: 'similarity_search',
        query: 'cached query',
        durationMs: 5,
        resultCount: 10,
        cached: true,
        cacheLevel: 'l1',
      });

      expect(debugSpy).toHaveBeenCalled();
      const logMessage = debugSpy.mock.calls[0][0];
      expect(logMessage).toContain('cached:l1');
    });
  });

  describe('logEmbedding', () => {
    it('should log successful embedding generation', () => {
      const debugSpy = jest.spyOn(service['logger'], 'debug');

      service.logEmbedding({
        tokensUsed: 100,
        durationMs: 200,
      });

      expect(debugSpy).toHaveBeenCalled();
      const logMessage = debugSpy.mock.calls[0][0];
      expect(logMessage).toContain('100 tokens');
    });

    it('should log embedding errors', () => {
      const errorSpy = jest.spyOn(service['logger'], 'error');

      service.logEmbedding({
        error: {
          type: 'RateLimitError',
          message: 'Rate limit exceeded',
        },
      });

      expect(errorSpy).toHaveBeenCalled();
      const logMessage = errorSpy.mock.calls[0][0];
      expect(logMessage).toContain('Rate limit exceeded');
    });
  });

  describe('logCacheOperation', () => {
    it('should log cache hit', () => {
      const debugSpy = jest.spyOn(service['logger'], 'debug');

      service.logCacheOperation('hit', 'l1', {
        cacheKey: 'test-key',
        query: 'test query',
      });

      expect(debugSpy).toHaveBeenCalled();
      const logMessage = debugSpy.mock.calls[0][0];
      expect(logMessage).toContain('Cache hit (l1)');
    });

    it('should log cache miss', () => {
      const debugSpy = jest.spyOn(service['logger'], 'debug');

      service.logCacheOperation('miss', 'l2');

      expect(debugSpy).toHaveBeenCalled();
      const logMessage = debugSpy.mock.calls[0][0];
      expect(logMessage).toContain('Cache miss (l2)');
    });

    it('should log cache invalidation', () => {
      const debugSpy = jest.spyOn(service['logger'], 'debug');

      service.logCacheOperation('invalidation', 'l1', {
        entryCount: 5,
      });

      expect(debugSpy).toHaveBeenCalled();
    });
  });

  describe('logPoolOperation', () => {
    it('should log pool acquire', () => {
      const debugSpy = jest.spyOn(service['logger'], 'debug');

      service.logPoolOperation('acquire', {
        waitTimeMs: 10,
        acquiredCount: 5,
        maxConnections: 10,
      });

      expect(debugSpy).toHaveBeenCalled();
    });

    it('should log pool timeout as warning', () => {
      const warnSpy = jest.spyOn(service['logger'], 'warn');

      service.logPoolOperation('timeout', {
        acquiredCount: 10,
        maxConnections: 10,
      });

      expect(warnSpy).toHaveBeenCalled();
    });

    it('should log pool error as warning', () => {
      const warnSpy = jest.spyOn(service['logger'], 'warn');

      service.logPoolOperation('error', {
        error: 'Connection failed',
      });

      expect(warnSpy).toHaveBeenCalled();
    });
  });

  describe('logBatchOperation', () => {
    it('should log batch start', () => {
      const debugSpy = jest.spyOn(service['logger'], 'debug');

      service.logBatchOperation('start', {
        batchId: 'batch-123',
        totalItems: 100,
      });

      expect(debugSpy).toHaveBeenCalled();
    });

    it('should log batch progress', () => {
      const debugSpy = jest.spyOn(service['logger'], 'debug');

      service.logBatchOperation('progress', {
        batchId: 'batch-123',
        totalItems: 100,
        processedItems: 50,
      });

      expect(debugSpy).toHaveBeenCalled();
      const logMessage = debugSpy.mock.calls[0][0];
      expect(logMessage).toContain('50/100');
    });

    it('should log batch complete at info level', () => {
      const logSpy = jest.spyOn(service['logger'], 'log');

      service.logBatchOperation('complete', {
        batchId: 'batch-123',
        totalItems: 100,
        processedItems: 100,
        successfulItems: 95,
        failedItems: 5,
        durationMs: 60000,
        tokensUsed: 50000,
        estimatedCost: 0.001,
      });

      expect(logSpy).toHaveBeenCalled();
    });

    it('should log batch error at error level', () => {
      const errorSpy = jest.spyOn(service['logger'], 'error');

      service.logBatchOperation('error', {
        batchId: 'batch-123',
        error: 'API rate limit exceeded',
      });

      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('logAlert', () => {
    it('should log warning alerts', () => {
      const warnSpy = jest.spyOn(service['logger'], 'warn');

      service.logAlert('high_latency', 'warning', {
        threshold: 500,
        currentValue: 750,
        message: 'Vector search latency exceeded threshold',
      });

      expect(warnSpy).toHaveBeenCalled();
      const logMessage = warnSpy.mock.calls[0][0];
      expect(logMessage).toContain('[ALERT:WARNING]');
      expect(logMessage).toContain('high_latency');
    });

    it('should log critical alerts', () => {
      const errorSpy = jest.spyOn(service['logger'], 'error');

      service.logAlert('pool_exhausted', 'critical', {
        threshold: 95,
        currentValue: 100,
        message: 'Connection pool exhausted',
      });

      expect(errorSpy).toHaveBeenCalled();
      const logMessage = errorSpy.mock.calls[0][0];
      expect(logMessage).toContain('[ALERT:CRITICAL]');
    });

    it('should include metadata in alert', () => {
      const warnSpy = jest.spyOn(service['logger'], 'warn');

      service.logAlert('low_coverage', 'warning', {
        message: 'Low embedding coverage',
        metadata: { coverage: 0.6, target: 0.8 },
      });

      expect(warnSpy).toHaveBeenCalled();
    });
  });

  describe('flushQueryLogs', () => {
    it('should return and clear buffered logs', () => {
      // Add some logs
      service.logSearch({
        operation: 'similarity_search',
        query: 'query 1',
        durationMs: 50,
        resultCount: 10,
      });
      service.logSearch({
        operation: 'hybrid_search',
        query: 'query 2',
        durationMs: 100,
        resultCount: 5,
      });

      const logs = service.flushQueryLogs();

      expect(logs).toHaveLength(2);
      expect(logs[0].query).toBe('query 1');
      expect(logs[1].query).toBe('query 2');
      expect(service.getBufferSize()).toBe(0);
    });

    it('should return empty array if no logs', () => {
      const logs = service.flushQueryLogs();

      expect(logs).toEqual([]);
    });
  });

  describe('getBufferSize', () => {
    it('should return current buffer size', () => {
      expect(service.getBufferSize()).toBe(0);

      service.logSearch({
        operation: 'similarity_search',
        query: 'test',
        durationMs: 50,
        resultCount: 5,
      });

      expect(service.getBufferSize()).toBe(1);
    });
  });

  describe('auto-flush on max buffer size', () => {
    it('should auto-flush when buffer reaches max size', () => {
      const debugSpy = jest.spyOn(service['logger'], 'debug');

      // Add 101 entries (max is 100)
      for (let i = 0; i <= 100; i++) {
        service.logSearch({
          operation: 'similarity_search',
          query: `query ${i}`,
          durationMs: 50,
          resultCount: 5,
        });
      }

      // Buffer should have been flushed, so size should be 1 (the last entry)
      expect(service.getBufferSize()).toBe(1);

      // Should have logged the auto-flush
      expect(debugSpy).toHaveBeenCalledWith(
        expect.stringContaining('auto-flushing')
      );
    });
  });

  describe('enrichLogEntry', () => {
    it('should calculate duration from start and end time', () => {
      const startTime = new Date('2025-01-01T10:00:00.000Z');
      const endTime = new Date('2025-01-01T10:00:00.100Z');

      service.logSearch({
        operation: 'similarity_search',
        startTime,
        endTime,
      });

      const logs = service.flushQueryLogs();
      expect(logs[0].durationMs).toBe(100);
    });

    it('should calculate query length', () => {
      // Access private method indirectly through logSearch
      const debugSpy = jest.spyOn(service['logger'], 'debug');

      service.logSearch({
        operation: 'similarity_search',
        query: 'test query',
        durationMs: 50,
      });

      expect(debugSpy).toHaveBeenCalled();
    });
  });

  describe('formatLogMessage', () => {
    it('should format message with all fields', () => {
      const debugSpy = jest.spyOn(service['logger'], 'debug');

      service.logSearch({
        operation: 'similarity_search',
        query: 'gift for mom',
        durationMs: 45,
        resultCount: 10,
        cached: false,
      });

      expect(debugSpy).toHaveBeenCalled();
      const logMessage = debugSpy.mock.calls[0][0];
      expect(logMessage).toContain('similarity_search');
      expect(logMessage).toContain('gift for mom');
      expect(logMessage).toContain('45ms');
      expect(logMessage).toContain('10 results');
    });

    it('should truncate long queries', () => {
      const debugSpy = jest.spyOn(service['logger'], 'debug');
      const longQuery = 'a'.repeat(100);

      service.logSearch({
        operation: 'similarity_search',
        query: longQuery,
        durationMs: 50,
        resultCount: 5,
      });

      expect(debugSpy).toHaveBeenCalled();
      const logMessage = debugSpy.mock.calls[0][0];
      expect(logMessage).toContain('...');
      expect(logMessage.length).toBeLessThan(longQuery.length + 100);
    });
  });

  describe('formatStructuredLog', () => {
    it('should produce valid JSON', () => {
      const debugSpy = jest.spyOn(service['logger'], 'debug');

      service.logSearch({
        operation: 'similarity_search',
        query: 'test',
        durationMs: 50,
        resultCount: 5,
      });

      const structuredLog = debugSpy.mock.calls[0][1];
      expect(() => JSON.parse(structuredLog)).not.toThrow();
    });

    it('should exclude stack traces from structured logs', () => {
      const errorSpy = jest.spyOn(service['logger'], 'error');

      service.logSearch({
        operation: 'similarity_search',
        error: {
          type: 'Error',
          message: 'Failed',
          stack: 'Error: Failed\n    at test.js:10:5',
        },
      });

      const structuredLog = errorSpy.mock.calls[0][1];
      const parsed = JSON.parse(structuredLog);
      expect(parsed.error.stack).toBeUndefined();
      expect(parsed.error.message).toBe('Failed');
    });
  });

  describe('QueryLog structure', () => {
    it('should create properly structured query logs', () => {
      service.logSearch({
        operation: 'hybrid_search',
        query: 'tech gifts',
        userId: 'user-123',
        durationMs: 75,
        resultCount: 15,
        cached: true,
      });

      const logs = service.flushQueryLogs();
      const log = logs[0];

      expect(log.timestamp).toBeInstanceOf(Date);
      expect(log.operation).toBe('hybrid_search');
      expect(log.query).toBe('tech gifts');
      expect(log.userId).toBe('user-123');
      expect(log.durationMs).toBe(75);
      expect(log.resultCount).toBe(15);
      expect(log.cached).toBe(true);
      expect(log.success).toBe(true);
    });
  });
});
