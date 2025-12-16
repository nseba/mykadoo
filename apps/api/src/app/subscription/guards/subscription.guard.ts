import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionPlan } from '@prisma/client';
import { SubscriptionService, PLAN_LIMITS } from '../subscription.service';
import { REQUIRED_PLAN_KEY } from '../decorators/require-plan.decorator';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly subscriptionService: SubscriptionService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPlan = this.reflector.getAllAndOverride<SubscriptionPlan>(
      REQUIRED_PLAN_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredPlan) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.id) {
      throw new ForbiddenException('Authentication required');
    }

    const subscription = await this.subscriptionService.getOrCreateSubscription(user.id);

    // Check if user's plan meets the requirement
    const planHierarchy: SubscriptionPlan[] = [
      SubscriptionPlan.FREE,
      SubscriptionPlan.GOLD,
      SubscriptionPlan.PLATINUM,
    ];

    const userPlanIndex = planHierarchy.indexOf(subscription.plan);
    const requiredPlanIndex = planHierarchy.indexOf(requiredPlan);

    if (userPlanIndex < requiredPlanIndex) {
      throw new ForbiddenException(
        `This feature requires a ${requiredPlan} subscription or higher. ` +
        `Your current plan is ${subscription.plan}.`
      );
    }

    // Attach subscription to request for downstream use
    request.subscription = subscription;

    return true;
  }
}
