import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from '@nestjs/cache-manager';
import { PrismaModule } from '../common/prisma';
import { VectorModule } from '../vector/vector.module';
import { EmbeddingJobProcessor } from './embedding-job.processor';
import { EmbeddingJobService } from './embedding-job.service';
import { EmbeddingValidationService } from './embedding-validation.service';
import { EmbeddingMonitoringService } from './embedding-monitoring.service';
import { EmbeddingCostService } from './embedding-cost.service';
import { EmbeddingPipelineController } from './embedding-pipeline.controller';
import { EMBEDDING_QUEUE_NAME, RATE_LIMIT } from './embedding-pipeline.constants';

/**
 * Embedding Pipeline Module
 *
 * Provides background job processing for embedding generation:
 * - BullMQ queue for async job processing
 * - Job processor for embedding generation
 * - Validation utilities for embedding quality
 * - Monitoring and metrics tracking
 * - Cost tracking and budget management
 */
@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    VectorModule,
    CacheModule.register({
      ttl: 3600, // 1 hour default TTL
      max: 1000, // Maximum number of items in cache
    }),
    // Register BullMQ with Redis configuration
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD'),
          db: configService.get<number>('REDIS_DB', 0),
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: {
            age: 3600, // 1 hour
            count: 100,
          },
          removeOnFail: {
            age: 86400, // 24 hours
            count: 500,
          },
        },
      }),
      inject: [ConfigService],
    }),
    // Register the embedding queue
    BullModule.registerQueue({
      name: EMBEDDING_QUEUE_NAME,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    }),
  ],
  controllers: [EmbeddingPipelineController],
  providers: [
    EmbeddingJobProcessor,
    EmbeddingJobService,
    EmbeddingValidationService,
    EmbeddingMonitoringService,
    EmbeddingCostService,
  ],
  exports: [
    EmbeddingJobService,
    EmbeddingValidationService,
    EmbeddingMonitoringService,
    EmbeddingCostService,
  ],
})
export class EmbeddingPipelineModule {}
