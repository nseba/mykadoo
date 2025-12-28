import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { PrismaModule } from '../common/prisma';
import { VectorController } from './vector.controller';
import { VectorService } from './vector.service';
import { EmbeddingService } from './embedding.service';
import { VectorStorageService } from './vector-storage.service';
import { SimilaritySearchService } from './similarity-search.service';

/**
 * Vector Module for semantic search and embeddings
 *
 * Provides:
 * - Text embedding generation using OpenAI
 * - Vector storage in PostgreSQL with pgvector
 * - Similarity search and hybrid search
 * - Personalized recommendations
 */
@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    CacheModule.register({
      ttl: 3600, // 1 hour default TTL
      max: 1000, // Maximum number of items in cache
    }),
  ],
  controllers: [VectorController],
  providers: [
    VectorService,
    EmbeddingService,
    VectorStorageService,
    SimilaritySearchService,
  ],
  exports: [
    VectorService,
    EmbeddingService,
    VectorStorageService,
    SimilaritySearchService,
  ],
})
export class VectorModule {}
