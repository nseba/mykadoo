/**
 * Database Testing Utilities
 * 
 * Utilities for setting up and tearing down test databases
 */

import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

/**
 * Get Prisma client for testing
 */
export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'postgresql://test_user:test_password@localhost:5432/mykadoo_test',
        },
      },
    });
  }
  return prisma;
}

/**
 * Setup test database
 */
export async function setupTestDatabase(): Promise<void> {
  const client = getPrismaClient();
  await client.$connect();
}

/**
 * Cleanup test database
 */
export async function cleanupTestDatabase(): Promise<void> {
  const client = getPrismaClient();
  
  // Get all table names
  const tables = await client.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `;
  
  // Truncate all tables
  for (const { tablename } of tables) {
    if (tablename !== '_prisma_migrations') {
      await client.$executeRawUnsafe(
        `TRUNCATE TABLE "${tablename}" CASCADE;`
      );
    }
  }
}

/**
 * Teardown test database
 */
export async function teardownTestDatabase(): Promise<void> {
  const client = getPrismaClient();
  await client.$disconnect();
}

/**
 * Create test data factory
 */
export function createFactory<T>(
  createFn: (overrides?: Partial<T>) => Promise<T>
) {
  return {
    create: createFn,
    createMany: async (count: number, overrides?: Partial<T>): Promise<T[]> => {
      const items: T[] = [];
      for (let i = 0; i < count; i++) {
        items.push(await createFn(overrides));
      }
      return items;
    },
  };
}
