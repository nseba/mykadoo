import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { SyncService } from './sync.service';
import { AffiliatePlatform } from '@prisma/client';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('trigger/full-sync')
  async triggerFullSync(
    @Body() body: { platform: AffiliatePlatform; searchTerms: string[] }
  ) {
    await this.syncService.triggerFullSync(body.platform, body.searchTerms);

    return {
      success: true,
      message: `Full sync triggered for ${body.platform} with ${body.searchTerms.length} search terms`,
    };
  }

  @Post('trigger/price-update')
  async triggerPriceUpdate() {
    await this.syncService.schedulePriceUpdate();

    return {
      success: true,
      message: 'Price update job triggered',
    };
  }

  @Post('trigger/availability-check')
  async triggerAvailabilityCheck() {
    await this.syncService.scheduleAvailabilityCheck();

    return {
      success: true,
      message: 'Availability check job triggered',
    };
  }

  @Get('queue/status')
  async getQueueStatus() {
    const status = await this.syncService.getQueueStatus();

    return {
      success: true,
      queue: status,
    };
  }
}
