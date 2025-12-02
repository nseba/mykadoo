/**
 * Search Module
 *
 * NestJS module for gift search functionality
 */

import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule implements OnModuleInit {
  private readonly logger = new Logger(SearchModule.name);

  constructor(private readonly searchService: SearchService) {}

  /**
   * Initialize vector database on module startup
   */
  async onModuleInit() {
    this.logger.log('Initializing search module...');

    try {
      await this.searchService.initializeVectorDatabase();
      this.logger.log('Search module initialized successfully');
    } catch (error: any) {
      this.logger.error(
        `Failed to initialize vector database: ${error.message}`,
        error.stack
      );
      // Don't throw - allow app to start even if vector DB initialization fails
      // This allows development without Pinecone configured
      this.logger.warn('Continuing without vector database');
    }
  }
}
