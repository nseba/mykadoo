import { SetMetadata } from '@nestjs/common';
import { UsageFeature } from '@prisma/client';

export const USAGE_FEATURE_KEY = 'usage_feature';

/**
 * Decorator to check and enforce usage limits for a feature
 * @param feature - The feature to check usage for
 */
export const CheckUsage = (feature: UsageFeature) =>
  SetMetadata(USAGE_FEATURE_KEY, feature);

/**
 * Shorthand decorators for common usage checks
 */
export const CheckAISearchUsage = () => CheckUsage(UsageFeature.AI_SEARCH);
export const CheckProfileUsage = () => CheckUsage(UsageFeature.RECIPIENT_PROFILE);
export const CheckWishlistUsage = () => CheckUsage(UsageFeature.WISHLIST);
export const CheckWishlistShareUsage = () => CheckUsage(UsageFeature.WISHLIST_SHARE);
export const CheckAIChatUsage = () => CheckUsage(UsageFeature.AI_CHAT);
