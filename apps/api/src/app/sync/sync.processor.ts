import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { SyncService, SyncJobData, SyncStats } from './sync.service';

@Processor('product-sync')
export class SyncProcessor {
  private readonly logger = new Logger(SyncProcessor.name);

  constructor(private readonly syncService: SyncService) {}

  @Process('full-sync-amazon')
  async handleFullSync(job: Job<SyncJobData>) {
    this.logger.log(`Processing full sync job ${job.id} for ${job.data.platform}`);

    try {
      const stats = await this.syncService.processFullSync(job.data);

      this.logger.log(`Full sync job ${job.id} completed: ${stats.productsProcessed} products processed`);

      return stats;
    } catch (error) {
      this.logger.error(`Full sync job ${job.id} failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('price-update')
  async handlePriceUpdate(job: Job<SyncJobData>) {
    this.logger.log(`Processing price update job ${job.id} for ${job.data.platform}`);

    try {
      const stats = await this.syncService.processPriceUpdate(job.data);

      this.logger.log(`Price update job ${job.id} completed: ${stats.productsUpdated} products updated`);

      return stats;
    } catch (error) {
      this.logger.error(`Price update job ${job.id} failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('availability-check')
  async handleAvailabilityCheck(job: Job<SyncJobData>) {
    this.logger.log(`Processing availability check job ${job.id} for ${job.data.platform}`);

    try {
      const stats = await this.syncService.processAvailabilityCheck(job.data);

      this.logger.log(`Availability check job ${job.id} completed: ${stats.productsProcessed} products checked`);

      return stats;
    } catch (error) {
      this.logger.error(`Availability check job ${job.id} failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('full-sync')
  async handleManualFullSync(job: Job<SyncJobData>) {
    this.logger.log(`Processing manual full sync job ${job.id} for ${job.data.platform}`);

    try {
      const stats = await this.syncService.processFullSync(job.data);

      this.logger.log(`Manual full sync job ${job.id} completed: ${stats.productsProcessed} products processed`);

      return stats;
    } catch (error) {
      this.logger.error(`Manual full sync job ${job.id} failed: ${error.message}`, error.stack);
      throw error;
    }
  }
}
