import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';
import { SearchModule } from './search/search.module';
import { ProfilesModule } from './profiles/profiles.module';
import { FeedbackModule } from './feedback/feedback.module';
import { PerformanceModule } from './performance/performance.module';
import { AffiliateModule } from './affiliate/affiliate.module';
import { ProductsModule } from './products/products.module';
import { TrackingModule } from './tracking/tracking.module';
import { SyncModule } from './sync/sync.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [SearchModule, ProfilesModule, FeedbackModule, PerformanceModule, AffiliateModule, ProductsModule, TrackingModule, SyncModule, AnalyticsModule],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
