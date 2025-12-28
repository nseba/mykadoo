import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';
import { PrismaModule } from './common/prisma';
import { SearchModule } from './search/search.module';
import { ProfilesModule } from './profiles/profiles.module';
import { FeedbackModule } from './feedback/feedback.module';
import { PerformanceModule } from './performance/performance.module';
import { AffiliateModule } from './affiliate/affiliate.module';
import { ProductsModule } from './products/products.module';
import { TrackingModule } from './tracking/tracking.module';
import { SyncModule } from './sync/sync.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ContentModule } from './content/content.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { VectorModule } from './vector/vector.module';

@Module({
  imports: [
    PrismaModule,
    SearchModule,
    ProfilesModule,
    FeedbackModule,
    PerformanceModule,
    AffiliateModule,
    ProductsModule,
    TrackingModule,
    SyncModule,
    AnalyticsModule,
    ContentModule,
    SubscriptionModule,
    VectorModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
