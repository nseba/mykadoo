import { Controller, Post, Get, Body, Param, Req } from '@nestjs/common';
import { TrackingService } from './tracking.service';

@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Post('click/:linkId')
  async trackClick(@Param('linkId') linkId: string, @Req() req: any) {
    const click = await this.trackingService.trackClick(linkId, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      referer: req.headers['referer'],
    });
    return { success: true, click };
  }

  @Post('conversion')
  async recordConversion(@Body() body: { clickId: string; orderValue: number; commission: number }) {
    const click = await this.trackingService.recordConversion(body.clickId, body.orderValue, body.commission);
    return { success: true, click };
  }

  @Get('stats/:productId')
  async getStats(@Param('productId') productId: string) {
    const stats = await this.trackingService.getClickStats(productId);
    return { success: true, stats };
  }
}
