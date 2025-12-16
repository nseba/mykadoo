import { SetMetadata } from '@nestjs/common';
import { SubscriptionPlan } from '@prisma/client';

export const REQUIRED_PLAN_KEY = 'required_plan';

/**
 * Decorator to require a minimum subscription plan for an endpoint
 * @param plan - Minimum required plan (FREE, GOLD, PLATINUM)
 */
export const RequirePlan = (plan: SubscriptionPlan) =>
  SetMetadata(REQUIRED_PLAN_KEY, plan);

/**
 * Shorthand decorators for common plan requirements
 */
export const RequireGold = () => RequirePlan(SubscriptionPlan.GOLD);
export const RequirePlatinum = () => RequirePlan(SubscriptionPlan.PLATINUM);
