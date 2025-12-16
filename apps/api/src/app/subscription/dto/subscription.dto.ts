import { IsEnum, IsOptional, IsString, IsUrl, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PlanType {
  FREE = 'FREE',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
}

export enum BillingIntervalType {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export class CreateCheckoutSessionDto {
  @ApiProperty({ enum: ['GOLD', 'PLATINUM'], description: 'Subscription plan' })
  @IsEnum(['GOLD', 'PLATINUM'])
  plan: 'GOLD' | 'PLATINUM';

  @ApiProperty({ enum: ['MONTHLY', 'YEARLY'], description: 'Billing interval' })
  @IsEnum(['MONTHLY', 'YEARLY'])
  interval: 'MONTHLY' | 'YEARLY';

  @ApiProperty({ description: 'URL to redirect on successful checkout' })
  @IsUrl()
  successUrl: string;

  @ApiProperty({ description: 'URL to redirect on canceled checkout' })
  @IsUrl()
  cancelUrl: string;

  @ApiPropertyOptional({ description: 'Promo code to apply' })
  @IsOptional()
  @IsString()
  promoCode?: string;
}

export class CreateBillingPortalDto {
  @ApiProperty({ description: 'URL to return to after billing portal' })
  @IsUrl()
  returnUrl: string;
}

export class UpgradeSubscriptionDto {
  @ApiProperty({ enum: ['GOLD', 'PLATINUM'], description: 'New plan to upgrade to' })
  @IsEnum(['GOLD', 'PLATINUM'])
  plan: 'GOLD' | 'PLATINUM';

  @ApiProperty({ enum: ['MONTHLY', 'YEARLY'], description: 'Billing interval' })
  @IsEnum(['MONTHLY', 'YEARLY'])
  interval: 'MONTHLY' | 'YEARLY';
}

export class DowngradeSubscriptionDto {
  @ApiProperty({ enum: ['FREE', 'GOLD'], description: 'New plan to downgrade to' })
  @IsEnum(['FREE', 'GOLD'])
  plan: 'FREE' | 'GOLD';

  @ApiPropertyOptional({ enum: ['MONTHLY', 'YEARLY'], description: 'Billing interval (for Gold)' })
  @IsOptional()
  @IsEnum(['MONTHLY', 'YEARLY'])
  interval?: 'MONTHLY' | 'YEARLY';
}

export class CancelSubscriptionDto {
  @ApiPropertyOptional({ description: 'Cancel immediately instead of at period end' })
  @IsOptional()
  @IsBoolean()
  immediately?: boolean;
}

export class ApplyPromoCodeDto {
  @ApiProperty({ description: 'Promo code to apply' })
  @IsString()
  code: string;
}

export class SubscriptionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: PlanType })
  plan: PlanType;

  @ApiProperty()
  status: string;

  @ApiProperty({ enum: BillingIntervalType })
  billingInterval: BillingIntervalType;

  @ApiPropertyOptional()
  currentPeriodStart?: Date;

  @ApiPropertyOptional()
  currentPeriodEnd?: Date;

  @ApiProperty()
  cancelAtPeriodEnd: boolean;

  @ApiPropertyOptional()
  canceledAt?: Date;

  @ApiPropertyOptional()
  trialEnd?: Date;

  @ApiProperty()
  createdAt: Date;
}

export class SubscriptionWithUsageResponseDto extends SubscriptionResponseDto {
  @ApiProperty({
    description: 'Current usage statistics',
    example: {
      aiSearches: { count: 3, limit: 5 },
      recipientProfiles: { count: 2, limit: 3 },
      wishlists: { count: 1, limit: 1 },
    },
  })
  usage: {
    aiSearches: { count: number; limit: number };
    recipientProfiles: { count: number; limit: number };
    wishlists: { count: number; limit: number };
  };

  @ApiProperty({
    description: 'Plan feature limits',
    example: {
      aiSearches: 5,
      recipientProfiles: 3,
      wishlists: 1,
      wishlistShares: 0,
      aiChat: false,
      familySharing: false,
      adsEnabled: true,
    },
  })
  limits: {
    aiSearches: number;
    recipientProfiles: number;
    wishlists: number;
    wishlistShares: number;
    aiChat: boolean;
    familySharing: boolean;
    adsEnabled: boolean;
  };
}

export class CheckoutSessionResponseDto {
  @ApiProperty({ description: 'Stripe checkout session ID' })
  sessionId: string;

  @ApiProperty({ description: 'URL to redirect user to for checkout' })
  url: string;
}

export class BillingPortalResponseDto {
  @ApiProperty({ description: 'URL to redirect user to billing portal' })
  url: string;
}

export class PaymentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ description: 'Amount in cents' })
  amount: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  invoiceUrl?: string;

  @ApiPropertyOptional()
  invoicePdf?: string;

  @ApiPropertyOptional()
  paidAt?: Date;

  @ApiProperty()
  createdAt: Date;
}

export class UsageLimitResponseDto {
  @ApiProperty({ description: 'Whether the action is allowed' })
  allowed: boolean;

  @ApiProperty({ description: 'Current usage count' })
  current: number;

  @ApiProperty({ description: 'Usage limit (-1 for unlimited)' })
  limit: number;
}

export class PlanComparisonDto {
  @ApiProperty()
  plan: PlanType;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ description: 'Monthly price in cents' })
  monthlyPrice: number;

  @ApiProperty({ description: 'Yearly price in cents' })
  yearlyPrice: number;

  @ApiProperty({ type: [String] })
  features: string[];

  @ApiProperty()
  limits: {
    aiSearches: number;
    recipientProfiles: number;
    wishlists: number;
    wishlistShares: number;
    aiChat: boolean;
    familySharing: boolean;
  };
}

export class PromoCodeValidationResponseDto {
  @ApiProperty({ description: 'Whether the promo code is valid' })
  valid: boolean;

  @ApiPropertyOptional({ description: 'Discount type (PERCENTAGE or FIXED_AMOUNT)' })
  discountType?: string;

  @ApiPropertyOptional({ description: 'Discount value (percentage 0-100 or cents)' })
  discountValue?: number;

  @ApiPropertyOptional({ description: 'Error message if invalid' })
  message?: string;
}

export class UsageStatsDto {
  @ApiProperty()
  count: number;

  @ApiProperty({ description: 'Limit for this feature (-1 for unlimited)' })
  limit: number;

  @ApiProperty({ description: 'Remaining usage (-1 for unlimited)' })
  remaining: number;
}

export class CurrentUsageResponseDto {
  @ApiProperty({ type: UsageStatsDto })
  aiSearches: UsageStatsDto;

  @ApiProperty({ type: UsageStatsDto })
  recipientProfiles: UsageStatsDto;

  @ApiProperty({ type: UsageStatsDto })
  wishlists: UsageStatsDto;

  @ApiProperty({ type: UsageStatsDto })
  wishlistShares: UsageStatsDto;

  @ApiProperty({ description: 'Start of current billing period' })
  periodStart: Date;

  @ApiProperty({ description: 'End of current billing period' })
  periodEnd: Date;
}
