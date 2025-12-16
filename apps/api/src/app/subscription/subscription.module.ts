import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StripeService } from './stripe.service';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { WebhookController } from './webhook.controller';
import { SubscriptionGuard } from './guards/subscription.guard';
import { UsageLimitGuard } from './guards/usage-limit.guard';

@Module({
  imports: [ConfigModule],
  controllers: [SubscriptionController, WebhookController],
  providers: [
    StripeService,
    SubscriptionService,
    SubscriptionGuard,
    UsageLimitGuard,
  ],
  exports: [StripeService, SubscriptionService, SubscriptionGuard, UsageLimitGuard],
})
export class SubscriptionModule {}
