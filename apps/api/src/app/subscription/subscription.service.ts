import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import {
  SubscriptionPlan,
  SubscriptionStatus,
  BillingInterval,
  UsageFeature,
  Subscription,
  Payment,
  PaymentStatus,
} from '@prisma/client';
import { StripeService } from './stripe.service';
import { PrismaService } from '../common/prisma';
import Stripe from 'stripe';

export interface PlanLimits {
  aiSearches: number;
  recipientProfiles: number;
  wishlists: number;
  wishlistShares: number;
  aiChat: boolean;
  familySharing: boolean;
  adsEnabled: boolean;
}

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  FREE: {
    aiSearches: 5,
    recipientProfiles: 3,
    wishlists: 1,
    wishlistShares: 0,
    aiChat: false,
    familySharing: false,
    adsEnabled: true,
  },
  GOLD: {
    aiSearches: 50,
    recipientProfiles: 10,
    wishlists: 5,
    wishlistShares: 5,
    aiChat: false,
    familySharing: false,
    adsEnabled: false,
  },
  PLATINUM: {
    aiSearches: -1, // Unlimited
    recipientProfiles: -1, // Unlimited
    wishlists: -1, // Unlimited
    wishlistShares: -1, // Unlimited
    aiChat: true,
    familySharing: true,
    adsEnabled: false,
  },
};

export interface SubscriptionWithUsage extends Subscription {
  usage: {
    aiSearches: { count: number; limit: number };
    recipientProfiles: { count: number; limit: number };
    wishlists: { count: number; limit: number };
  };
  limits: PlanLimits;
}

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly prisma: PrismaService
  ) {}

  // Get or create subscription for user
  async getOrCreateSubscription(userId: string): Promise<Subscription> {
    let subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      subscription = await this.prisma.subscription.create({
        data: {
          userId,
          plan: SubscriptionPlan.FREE,
          status: SubscriptionStatus.ACTIVE,
        },
      });
    }

    return subscription;
  }

  async getSubscription(userId: string): Promise<Subscription | null> {
    return this.prisma.subscription.findUnique({
      where: { userId },
    });
  }

  async getSubscriptionWithUsage(userId: string): Promise<SubscriptionWithUsage> {
    const subscription = await this.getOrCreateSubscription(userId);
    const limits = PLAN_LIMITS[subscription.plan];

    // Get current period usage
    const now = new Date();
    const periodStart = subscription.currentPeriodStart || new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = subscription.currentPeriodEnd || new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const usageRecords = await this.prisma.usageRecord.findMany({
      where: {
        subscriptionId: subscription.id,
        periodStart: { lte: now },
        periodEnd: { gte: now },
      },
    });

    const getUsageCount = (feature: UsageFeature) => {
      const record = usageRecords.find((r) => r.feature === feature);
      return record?.count || 0;
    };

    return {
      ...subscription,
      usage: {
        aiSearches: {
          count: getUsageCount(UsageFeature.AI_SEARCH),
          limit: limits.aiSearches,
        },
        recipientProfiles: {
          count: getUsageCount(UsageFeature.RECIPIENT_PROFILE),
          limit: limits.recipientProfiles,
        },
        wishlists: {
          count: getUsageCount(UsageFeature.WISHLIST),
          limit: limits.wishlists,
        },
      },
      limits,
    };
  }

  // Create Stripe checkout session for subscription
  async createCheckoutSession(
    userId: string,
    plan: 'GOLD' | 'PLATINUM',
    interval: 'MONTHLY' | 'YEARLY',
    successUrl: string,
    cancelUrl: string,
    promoCode?: string
  ): Promise<{ sessionId: string; url: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get or create Stripe customer
    let stripeCustomerId = user.subscription?.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await this.stripeService.createCustomer(
        user.email,
        user.name || undefined,
        { userId: user.id }
      );
      stripeCustomerId = customer.id;

      // Save customer ID
      await this.prisma.subscription.upsert({
        where: { userId },
        update: { stripeCustomerId },
        create: {
          userId,
          stripeCustomerId,
          plan: SubscriptionPlan.FREE,
          status: SubscriptionStatus.ACTIVE,
        },
      });
    }

    // Get price ID
    const priceId = this.stripeService.getPriceId(plan, interval);
    if (!priceId) {
      throw new BadRequestException('Invalid plan or interval');
    }

    // Check for promo code
    let couponId: string | undefined;
    if (promoCode) {
      const promo = await this.prisma.promoCode.findUnique({
        where: { code: promoCode },
      });

      if (promo && promo.isActive && promo.stripeCouponId) {
        if (promo.validUntil && promo.validUntil < new Date()) {
          throw new BadRequestException('Promo code has expired');
        }
        if (promo.maxUses && promo.currentUses >= promo.maxUses) {
          throw new BadRequestException('Promo code usage limit reached');
        }
        couponId = promo.stripeCouponId;
      }
    }

    const session = await this.stripeService.createCheckoutSession(
      stripeCustomerId,
      priceId,
      successUrl,
      cancelUrl,
      {
        couponId,
        metadata: { userId, plan, interval },
      }
    );

    return {
      sessionId: session.id,
      url: session.url!,
    };
  }

  // Create billing portal session
  async createBillingPortalSession(userId: string, returnUrl: string): Promise<{ url: string }> {
    const subscription = await this.getSubscription(userId);
    if (!subscription?.stripeCustomerId) {
      throw new BadRequestException('No billing account found');
    }

    const session = await this.stripeService.createBillingPortalSession(
      subscription.stripeCustomerId,
      returnUrl
    );

    return { url: session.url };
  }

  // Upgrade subscription
  async upgradeSubscription(
    userId: string,
    newPlan: 'GOLD' | 'PLATINUM',
    interval: 'MONTHLY' | 'YEARLY'
  ): Promise<Subscription> {
    const subscription = await this.getSubscription(userId);
    if (!subscription?.stripeSubscriptionId) {
      throw new BadRequestException('No active subscription to upgrade');
    }

    const priceId = this.stripeService.getPriceId(newPlan, interval);
    if (!priceId) {
      throw new BadRequestException('Invalid plan or interval');
    }

    // Get current subscription from Stripe
    const stripeSubscription = await this.stripeService.getSubscription(
      subscription.stripeSubscriptionId
    );

    if (!stripeSubscription) {
      throw new NotFoundException('Stripe subscription not found');
    }

    // Update subscription with proration
    await this.stripeService.updateSubscription(subscription.stripeSubscriptionId, {
      items: [
        {
          id: stripeSubscription.items.data[0].id,
          price: priceId,
        },
      ],
      proration_behavior: 'create_prorations',
    });

    // Update local subscription
    return this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        plan: SubscriptionPlan[newPlan],
        billingInterval: BillingInterval[interval],
        stripePriceId: priceId,
      },
    });
  }

  // Downgrade subscription (takes effect at end of period)
  async downgradeSubscription(
    userId: string,
    newPlan: 'FREE' | 'GOLD',
    interval?: 'MONTHLY' | 'YEARLY'
  ): Promise<Subscription> {
    const subscription = await this.getSubscription(userId);
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (newPlan === 'FREE') {
      // Cancel at end of period
      if (subscription.stripeSubscriptionId) {
        await this.stripeService.cancelSubscription(subscription.stripeSubscriptionId, false);
      }

      return this.prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          cancelAtPeriodEnd: true,
        },
      });
    }

    // Downgrade to Gold (schedule for end of period)
    const priceId = this.stripeService.getPriceId('GOLD', interval || 'MONTHLY');
    if (!priceId || !subscription.stripeSubscriptionId) {
      throw new BadRequestException('Cannot downgrade subscription');
    }

    // Schedule the downgrade for end of period
    const stripeSubscription = await this.stripeService.getSubscription(
      subscription.stripeSubscriptionId
    );

    if (!stripeSubscription) {
      throw new NotFoundException('Stripe subscription not found');
    }

    await this.stripeService.updateSubscription(subscription.stripeSubscriptionId, {
      items: [
        {
          id: stripeSubscription.items.data[0].id,
          price: priceId,
        },
      ],
      proration_behavior: 'none',
      billing_cycle_anchor: 'unchanged',
    });

    return this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        // Will be updated by webhook when period ends
      },
    });
  }

  // Cancel subscription
  async cancelSubscription(userId: string, immediately = false): Promise<Subscription> {
    const subscription = await this.getSubscription(userId);
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.stripeSubscriptionId) {
      await this.stripeService.cancelSubscription(
        subscription.stripeSubscriptionId,
        immediately
      );
    }

    return this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: !immediately,
        canceledAt: new Date(),
        status: immediately ? SubscriptionStatus.CANCELED : subscription.status,
        plan: immediately ? SubscriptionPlan.FREE : subscription.plan,
      },
    });
  }

  // Reactivate canceled subscription
  async reactivateSubscription(userId: string): Promise<Subscription> {
    const subscription = await this.getSubscription(userId);
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (!subscription.cancelAtPeriodEnd) {
      throw new BadRequestException('Subscription is not scheduled for cancellation');
    }

    if (subscription.stripeSubscriptionId) {
      await this.stripeService.reactivateSubscription(subscription.stripeSubscriptionId);
    }

    return this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: false,
        canceledAt: null,
      },
    });
  }

  // Get payment/invoice history
  async getInvoices(userId: string, limit = 10): Promise<Payment[]> {
    const subscription = await this.getSubscription(userId);
    if (!subscription) {
      return [];
    }

    return this.prisma.payment.findMany({
      where: { subscriptionId: subscription.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  // Usage tracking
  async incrementUsage(userId: string, feature: UsageFeature, amount = 1): Promise<void> {
    const subscription = await this.getOrCreateSubscription(userId);
    const limits = PLAN_LIMITS[subscription.plan];

    // Get the limit for this feature
    let limit: number;
    switch (feature) {
      case UsageFeature.AI_SEARCH:
        limit = limits.aiSearches;
        break;
      case UsageFeature.RECIPIENT_PROFILE:
        limit = limits.recipientProfiles;
        break;
      case UsageFeature.WISHLIST:
        limit = limits.wishlists;
        break;
      case UsageFeature.WISHLIST_SHARE:
        limit = limits.wishlistShares;
        break;
      default:
        limit = 0;
    }

    // Get current period
    const now = new Date();
    const periodStart = subscription.currentPeriodStart || new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = subscription.currentPeriodEnd || new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Upsert usage record
    await this.prisma.usageRecord.upsert({
      where: {
        subscriptionId_feature_periodStart: {
          subscriptionId: subscription.id,
          feature,
          periodStart,
        },
      },
      update: {
        count: { increment: amount },
      },
      create: {
        subscriptionId: subscription.id,
        feature,
        count: amount,
        limit,
        periodStart,
        periodEnd,
      },
    });
  }

  async checkUsageLimit(userId: string, feature: UsageFeature): Promise<{ allowed: boolean; current: number; limit: number }> {
    const subscription = await this.getOrCreateSubscription(userId);
    const limits = PLAN_LIMITS[subscription.plan];

    let limit: number;
    switch (feature) {
      case UsageFeature.AI_SEARCH:
        limit = limits.aiSearches;
        break;
      case UsageFeature.RECIPIENT_PROFILE:
        limit = limits.recipientProfiles;
        break;
      case UsageFeature.WISHLIST:
        limit = limits.wishlists;
        break;
      case UsageFeature.WISHLIST_SHARE:
        limit = limits.wishlistShares;
        break;
      default:
        limit = 0;
    }

    // Unlimited
    if (limit === -1) {
      return { allowed: true, current: 0, limit: -1 };
    }

    // Get current usage
    const now = new Date();
    const periodStart = subscription.currentPeriodStart || new Date(now.getFullYear(), now.getMonth(), 1);

    const usageRecord = await this.prisma.usageRecord.findUnique({
      where: {
        subscriptionId_feature_periodStart: {
          subscriptionId: subscription.id,
          feature,
          periodStart,
        },
      },
    });

    const current = usageRecord?.count || 0;
    return {
      allowed: current < limit,
      current,
      limit,
    };
  }

  // Check if user has access to a feature
  async hasFeatureAccess(userId: string, feature: 'aiChat' | 'familySharing' | 'wishlistShare'): Promise<boolean> {
    const subscription = await this.getOrCreateSubscription(userId);
    const limits = PLAN_LIMITS[subscription.plan];

    switch (feature) {
      case 'aiChat':
        return limits.aiChat;
      case 'familySharing':
        return limits.familySharing;
      case 'wishlistShare':
        return limits.wishlistShares > 0 || limits.wishlistShares === -1;
      default:
        return false;
    }
  }

  // Webhook handlers
  async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
    const userId = subscription.metadata?.userId;
    if (!userId) {
      this.logger.warn('Subscription created without userId in metadata');
      return;
    }

    const planFromPrice = this.getPlanFromPriceId(subscription.items.data[0]?.price.id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sub = subscription as any;

    await this.prisma.subscription.update({
      where: { userId },
      data: {
        stripeSubscriptionId: subscription.id,
        stripePriceId: subscription.items.data[0]?.price.id,
        plan: planFromPrice || SubscriptionPlan.GOLD,
        status: this.mapStripeStatus(subscription.status),
        currentPeriodStart: new Date((sub.current_period_start || sub.currentPeriodStart) * 1000),
        currentPeriodEnd: new Date((sub.current_period_end || sub.currentPeriodEnd) * 1000),
        trialStart: (sub.trial_start || sub.trialStart) ? new Date((sub.trial_start || sub.trialStart) * 1000) : null,
        trialEnd: (sub.trial_end || sub.trialEnd) ? new Date((sub.trial_end || sub.trialEnd) * 1000) : null,
      },
    });
  }

  async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    const dbSubscription = await this.prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (!dbSubscription) {
      this.logger.warn(`Subscription ${subscription.id} not found in database`);
      return;
    }

    const planFromPrice = this.getPlanFromPriceId(subscription.items.data[0]?.price.id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sub = subscription as any;

    await this.prisma.subscription.update({
      where: { id: dbSubscription.id },
      data: {
        plan: planFromPrice || dbSubscription.plan,
        status: this.mapStripeStatus(subscription.status),
        currentPeriodStart: new Date((sub.current_period_start || sub.currentPeriodStart) * 1000),
        currentPeriodEnd: new Date((sub.current_period_end || sub.currentPeriodEnd) * 1000),
        cancelAtPeriodEnd: sub.cancel_at_period_end ?? sub.cancelAtPeriodEnd ?? false,
        stripePriceId: subscription.items.data[0]?.price.id,
      },
    });
  }

  async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const dbSubscription = await this.prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (!dbSubscription) return;

    await this.prisma.subscription.update({
      where: { id: dbSubscription.id },
      data: {
        plan: SubscriptionPlan.FREE,
        status: SubscriptionStatus.CANCELED,
        stripeSubscriptionId: null,
        stripePriceId: null,
        canceledAt: new Date(),
      },
    });
  }

  async handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const inv = invoice as any;
    const subscriptionId = inv.subscription;
    if (!subscriptionId) return;

    const dbSubscription = await this.prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscriptionId as string },
    });

    if (!dbSubscription) return;

    await this.prisma.payment.create({
      data: {
        subscriptionId: dbSubscription.id,
        stripeInvoiceId: invoice.id ?? null,
        amount: inv.amount_paid ?? inv.amountPaid ?? 0,
        currency: invoice.currency ?? 'usd',
        status: PaymentStatus.SUCCEEDED,
        invoiceUrl: inv.hosted_invoice_url ?? inv.hostedInvoiceUrl ?? null,
        invoicePdf: inv.invoice_pdf ?? inv.invoicePdf ?? null,
        paidAt: new Date(),
      },
    });
  }

  async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const inv = invoice as any;
    const subscriptionId = inv.subscription;
    if (!subscriptionId) return;

    const dbSubscription = await this.prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscriptionId as string },
    });

    if (!dbSubscription) return;

    await this.prisma.payment.create({
      data: {
        subscriptionId: dbSubscription.id,
        stripeInvoiceId: invoice.id ?? null,
        amount: inv.amount_due ?? inv.amountDue ?? 0,
        currency: invoice.currency ?? 'usd',
        status: PaymentStatus.FAILED,
        invoiceUrl: inv.hosted_invoice_url ?? inv.hostedInvoiceUrl ?? null,
        failedAt: new Date(),
      },
    });

    // Update subscription status
    await this.prisma.subscription.update({
      where: { id: dbSubscription.id },
      data: { status: SubscriptionStatus.PAST_DUE },
    });
  }

  // Promo code validation
  async validatePromoCode(code: string, plan?: SubscriptionPlan): Promise<{
    valid: boolean;
    discountType?: string;
    discountValue?: number;
    stripeCouponId?: string;
    message?: string;
  }> {
    const promo = await this.prisma.promoCode.findUnique({
      where: { code },
    });

    if (!promo) {
      return { valid: false, message: 'Invalid promo code' };
    }

    if (!promo.isActive) {
      return { valid: false, message: 'Promo code is no longer active' };
    }

    if (promo.validUntil && promo.validUntil < new Date()) {
      return { valid: false, message: 'Promo code has expired' };
    }

    if (promo.maxUses && promo.currentUses >= promo.maxUses) {
      return { valid: false, message: 'Promo code usage limit reached' };
    }

    if (plan && promo.applicablePlans.length > 0 && !promo.applicablePlans.includes(plan)) {
      return { valid: false, message: 'Promo code is not valid for this plan' };
    }

    return {
      valid: true,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      stripeCouponId: promo.stripeCouponId || undefined,
    };
  }

  // Get current usage for all features
  async getCurrentUsage(userId: string): Promise<{
    aiSearches: { count: number; limit: number; remaining: number };
    recipientProfiles: { count: number; limit: number; remaining: number };
    wishlists: { count: number; limit: number; remaining: number };
    wishlistShares: { count: number; limit: number; remaining: number };
    periodStart: Date;
    periodEnd: Date;
  }> {
    const subscription = await this.getOrCreateSubscription(userId);
    const limits = PLAN_LIMITS[subscription.plan];

    const now = new Date();
    const periodStart = subscription.currentPeriodStart || new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = subscription.currentPeriodEnd || new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const usageRecords = await this.prisma.usageRecord.findMany({
      where: {
        subscriptionId: subscription.id,
        periodStart: { lte: now },
        periodEnd: { gte: now },
      },
    });

    const getUsage = (feature: UsageFeature, limit: number) => {
      const record = usageRecords.find((r) => r.feature === feature);
      const count = record?.count || 0;
      return {
        count,
        limit,
        remaining: limit === -1 ? -1 : Math.max(0, limit - count),
      };
    };

    return {
      aiSearches: getUsage(UsageFeature.AI_SEARCH, limits.aiSearches),
      recipientProfiles: getUsage(UsageFeature.RECIPIENT_PROFILE, limits.recipientProfiles),
      wishlists: getUsage(UsageFeature.WISHLIST, limits.wishlists),
      wishlistShares: getUsage(UsageFeature.WISHLIST_SHARE, limits.wishlistShares),
      periodStart,
      periodEnd,
    };
  }

  // Helper methods
  private getPlanFromPriceId(priceId: string): SubscriptionPlan | null {
    const prices = this.stripeService.getPriceConfig();
    if (!prices) return null;

    if (priceId === prices.gold.monthly.priceId || priceId === prices.gold.yearly.priceId) {
      return SubscriptionPlan.GOLD;
    }
    if (priceId === prices.platinum.monthly.priceId || priceId === prices.platinum.yearly.priceId) {
      return SubscriptionPlan.PLATINUM;
    }
    return null;
  }

  private mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
    const statusMap: Record<Stripe.Subscription.Status, SubscriptionStatus> = {
      active: SubscriptionStatus.ACTIVE,
      canceled: SubscriptionStatus.CANCELED,
      incomplete: SubscriptionStatus.INCOMPLETE,
      incomplete_expired: SubscriptionStatus.INCOMPLETE_EXPIRED,
      past_due: SubscriptionStatus.PAST_DUE,
      trialing: SubscriptionStatus.TRIALING,
      unpaid: SubscriptionStatus.UNPAID,
      paused: SubscriptionStatus.PAUSED,
    };
    return statusMap[status] || SubscriptionStatus.ACTIVE;
  }
}
