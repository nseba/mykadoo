import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, PoolClient, PoolConfig } from 'pg';

/**
 * Pool statistics
 */
export interface PoolStats {
  totalConnections: number;
  idleConnections: number;
  waitingRequests: number;
  maxConnections: number;
  acquiredConnections: number;
}

/**
 * Query execution result
 */
export interface QueryResult<T> {
  rows: T[];
  rowCount: number;
  durationMs: number;
}

/**
 * Dedicated connection pool for vector operations
 * Prevents resource contention with regular database operations
 */
@Injectable()
export class VectorPoolService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(VectorPoolService.name);
  private pool: Pool | null = null;

  // Default pool configuration optimized for vector operations
  private readonly defaultConfig: PoolConfig = {
    max: 10, // Maximum connections in pool
    min: 2, // Minimum idle connections
    idleTimeoutMillis: 30000, // 30 seconds idle timeout
    connectionTimeoutMillis: 10000, // 10 second connection timeout
    allowExitOnIdle: false,
    statement_timeout: 30000, // 30 second query timeout
  };

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.initializePool();
  }

  async onModuleDestroy() {
    await this.closePool();
  }

  /**
   * Initialize the connection pool
   */
  private async initializePool(): Promise<void> {
    const connectionString = this.configService.get<string>('DATABASE_URL');

    if (!connectionString) {
      this.logger.warn('DATABASE_URL not configured, vector pool not initialized');
      return;
    }

    // Parse pool size from environment or use defaults
    const maxConnections = this.configService.get<number>('VECTOR_POOL_MAX', 10);
    const minConnections = this.configService.get<number>('VECTOR_POOL_MIN', 2);

    const poolConfig: PoolConfig = {
      ...this.defaultConfig,
      connectionString,
      max: maxConnections,
      min: minConnections,
      application_name: 'mykadoo_vector_pool',
    };

    try {
      this.pool = new Pool(poolConfig);

      // Set up event handlers
      this.pool.on('error', (err) => {
        this.logger.error(`Pool client error: ${err.message}`);
      });

      this.pool.on('connect', (client) => {
        // Set session-level HNSW parameters for optimal performance
        client.query('SET hnsw.ef_search = 60').catch(() => {
          // Ignore if not supported
        });
      });

      // Verify connection
      const client = await this.pool.connect();
      await client.query('SELECT 1');
      client.release();

      this.logger.log(`Vector pool initialized with ${maxConnections} max connections`);
    } catch (error) {
      this.logger.error(`Failed to initialize vector pool: ${error.message}`);
      this.pool = null;
    }
  }

  /**
   * Close the connection pool
   */
  private async closePool(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.logger.log('Vector pool closed');
    }
  }

  /**
   * Get a client from the pool
   */
  async getClient(): Promise<PoolClient> {
    if (!this.pool) {
      throw new Error('Vector pool not initialized');
    }
    return this.pool.connect();
  }

  /**
   * Execute a query using the vector pool
   */
  async query<T>(sql: string, params?: unknown[]): Promise<QueryResult<T>> {
    if (!this.pool) {
      throw new Error('Vector pool not initialized');
    }

    const start = performance.now();
    const result = await this.pool.query(sql, params);
    const durationMs = performance.now() - start;

    return {
      rows: result.rows as T[],
      rowCount: result.rowCount || 0,
      durationMs,
    };
  }

  /**
   * Execute a vector similarity search using the dedicated pool
   */
  async vectorSearch<T>(
    embedding: number[],
    options: {
      table?: string;
      embeddingColumn?: string;
      limit?: number;
      threshold?: number;
      selectColumns?: string[];
      whereClause?: string;
      whereParams?: unknown[];
    } = {}
  ): Promise<QueryResult<T & { similarity: number }>> {
    const {
      table = 'products',
      embeddingColumn = 'embedding',
      limit = 10,
      threshold = 0.5,
      selectColumns = ['id', 'title', 'description', 'price', 'category'],
      whereClause = '',
      whereParams = [],
    } = options;

    const vectorString = `[${embedding.join(',')}]`;
    const columns = selectColumns.join(', ');

    let sql = `
      SELECT
        ${columns},
        (1 - (${embeddingColumn} <=> $1::vector(1536)))::float AS similarity
      FROM ${table}
      WHERE ${embeddingColumn} IS NOT NULL
      AND (1 - (${embeddingColumn} <=> $1::vector(1536))) > $2
    `;

    const params: unknown[] = [vectorString, threshold];

    if (whereClause) {
      sql += ` AND ${whereClause}`;
      params.push(...whereParams);
    }

    sql += `
      ORDER BY ${embeddingColumn} <=> $1::vector(1536)
      LIMIT $${params.length + 1}
    `;
    params.push(limit);

    return this.query<T & { similarity: number }>(sql, params);
  }

  /**
   * Execute with automatic retry and connection management
   */
  async executeWithRetry<T>(
    operation: (client: PoolClient) => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      let client: PoolClient | null = null;

      try {
        client = await this.getClient();
        const result = await operation(client);
        return result;
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(
          `Vector pool operation failed (attempt ${attempt}/${maxRetries}): ${error.message}`
        );

        if (attempt < maxRetries) {
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
        }
      } finally {
        if (client) {
          client.release();
        }
      }
    }

    throw lastError || new Error('Operation failed after retries');
  }

  /**
   * Get pool statistics
   */
  getStats(): PoolStats {
    if (!this.pool) {
      return {
        totalConnections: 0,
        idleConnections: 0,
        waitingRequests: 0,
        maxConnections: 0,
        acquiredConnections: 0,
      };
    }

    return {
      totalConnections: this.pool.totalCount,
      idleConnections: this.pool.idleCount,
      waitingRequests: this.pool.waitingCount,
      maxConnections: this.defaultConfig.max || 10,
      acquiredConnections: this.pool.totalCount - this.pool.idleCount,
    };
  }

  /**
   * Health check for the pool
   */
  async healthCheck(): Promise<{ healthy: boolean; message: string }> {
    if (!this.pool) {
      return { healthy: false, message: 'Pool not initialized' };
    }

    try {
      const client = await this.pool.connect();
      await client.query('SELECT 1');
      client.release();
      return { healthy: true, message: 'Pool is healthy' };
    } catch (error) {
      return { healthy: false, message: `Health check failed: ${error.message}` };
    }
  }

  /**
   * Optimize pool settings based on current load
   */
  async optimizePoolSize(targetUtilization: number = 0.7): Promise<void> {
    const stats = this.getStats();
    const currentUtilization = stats.acquiredConnections / stats.maxConnections;

    if (currentUtilization > targetUtilization && stats.waitingRequests > 0) {
      this.logger.warn(
        `High pool utilization: ${(currentUtilization * 100).toFixed(1)}%, ` +
        `${stats.waitingRequests} waiting. Consider increasing VECTOR_POOL_MAX.`
      );
    }
  }
}
