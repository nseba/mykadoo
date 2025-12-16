import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsageFeature } from '@prisma/client';
import { SubscriptionService } from '../subscription.service';
import { USAGE_FEATURE_KEY } from '../decorators/check-usage.decorator';

@Injectable()
export class UsageLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly subscriptionService: SubscriptionService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const feature = this.reflector.getAllAndOverride<UsageFeature>(
      USAGE_FEATURE_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!feature) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.id) {
      throw new ForbiddenException('Authentication required');
    }

    const { allowed, current, limit } = await this.subscriptionService.checkUsageLimit(
      user.id,
      feature
    );

    if (!allowed) {
      const featureNames: Record<UsageFeature, string> = {
        AI_SEARCH: 'AI searches',
        RECIPIENT_PROFILE: 'recipient profiles',
        WISHLIST: 'wishlists',
        WISHLIST_SHARE: 'wishlist shares',
        AI_CHAT: 'AI chat messages',
      };

      throw new ForbiddenException(
        `You've reached your ${featureNames[feature]} limit for this billing period. ` +
        `Current: ${current}/${limit}. Upgrade your plan for more.`
      );
    }

    // Attach usage info to request for downstream tracking
    request.usageFeature = feature;

    return true;
  }
}
