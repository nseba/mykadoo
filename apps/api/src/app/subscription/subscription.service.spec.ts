/**
 * @jest-environment node
 */
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  SubscriptionPlan,
  SubscriptionStatus,
  BillingInterval,
  UsageFeature,
} from '@prisma/client';
import { SubscriptionService, PLAN_LIMITS } from './subscription.service';
import { StripeService } from './stripe.service';
import { PrismaService } from '../common/prisma';

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let prismaService: jest.Mocked<PrismaService>;
  let stripeService: jest.Mocked<StripeService>;

  const mockUserId = 'user-123';
  const mockSubscriptionId = 'sub-123';
  const mockStripeCustomerId = 'cus_123';
  const mockStripeSubscriptionId = 'sub_stripe_123';

  const mockSubscription = {
    id: mockSubscriptionId,
    userId: mockUserId,
    plan: SubscriptionPlan.FREE,
    status: SubscriptionStatus.ACTIVE,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    stripePriceId: null,
    billingInterval: null,
    currentPeriodStart: new Date('2025-01-01'),
    currentPeriodEnd: new Date('2025-01-31'),
    trialStart: null,
    trialEnd: null,
    cancelAtPeriodEnd: false,
    canceledAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser = {
    id: mockUserId,
    email: 'test@example.com',
    name: 'Test User',
    subscription: mockSubscription,
  };

  beforeEach(async () => {
    const mockPrismaService = {
      subscription: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        upsert: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
      usageRecord: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        upsert: jest.fn(),
      },
      payment: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
      promoCode: {
        findUnique: jest.fn(),
      },
    };

    const mockStripeService = {
      createCustomer: jest.fn(),
      getPriceId: jest.fn(),
      getPriceConfig: jest.fn(),
      createCheckoutSession: jest.fn(),
      createBillingPortalSession: jest.fn(),
      getSubscription: jest.fn(),
      updateSubscription: jest.fn(),
      cancelSubscription: jest.fn(),
      reactivateSubscription: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: StripeService, useValue: mockStripeService },
      ],
    }).compile();

    service = module.get<SubscriptionService>(SubscriptionService);
    prismaService = module.get(PrismaService);
    stripeService = module.get(StripeService);
  });

  describe('PLAN_LIMITS', () => {
    it('should have correct limits for FREE plan', () => {
      expect(PLAN_LIMITS.FREE).toEqual({
        aiSearches: 5,
        recipientProfiles: 3,
        wishlists: 1,
        wishlistShares: 0,
        aiChat: false,
        familySharing: false,
        adsEnabled: true,
      });
    });

    it('should have correct limits for GOLD plan', () => {
      expect(PLAN_LIMITS.GOLD).toEqual({
        aiSearches: 50,
        recipientProfiles: 10,
        wishlists: 5,
        wishlistShares: 5,
        aiChat: false,
        familySharing: false,
        adsEnabled: false,
      });
    });

    it('should have correct limits for PLATINUM plan (unlimited)', () => {
      expect(PLAN_LIMITS.PLATINUM).toEqual({
        aiSearches: -1,
        recipientProfiles: -1,
        wishlists: -1,
        wishlistShares: -1,
        aiChat: true,
        familySharing: true,
        adsEnabled: false,
      });
    });
  });

  describe('getOrCreateSubscription', () => {
    it('should return existing subscription', async () => {
      prismaService.subscription.findUnique.mockResolvedValue(mockSubscription);

      const result = await service.getOrCreateSubscription(mockUserId);

      expect(result).toEqual(mockSubscription);
      expect(prismaService.subscription.findUnique).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });
      expect(prismaService.subscription.create).not.toHaveBeenCalled();
    });

    it('should create new FREE subscription if none exists', async () => {
      prismaService.subscription.findUnique.mockResolvedValue(null);
      prismaService.subscription.create.mockResolvedValue(mockSubscription);

      const result = await service.getOrCreateSubscription(mockUserId);

      expect(result).toEqual(mockSubscription);
      expect(prismaService.subscription.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          plan: SubscriptionPlan.FREE,
          status: SubscriptionStatus.ACTIVE,
        },
      });
    });
  });

  describe('getSubscription', () => {
    it('should return subscription if exists', async () => {
      prismaService.subscription.findUnique.mockResolvedValue(mockSubscription);

      const result = await service.getSubscription(mockUserId);

      expect(result).toEqual(mockSubscription);
    });

    it('should return null if subscription does not exist', async () => {
      prismaService.subscription.findUnique.mockResolvedValue(null);

      const result = await service.getSubscription(mockUserId);

      expect(result).toBeNull();
    });
  });

  describe('getSubscriptionWithUsage', () => {
    it('should return subscription with usage data', async () => {
      prismaService.subscription.findUnique.mockResolvedValue(mockSubscription);
      prismaService.usageRecord.findMany.mockResolvedValue([
        {
          id: 'usage-1',
          subscriptionId: mockSubscriptionId,
          feature: UsageFeature.AI_SEARCH,
          count: 3,
          limit: 5,
          periodStart: new Date('2025-01-01'),
          periodEnd: new Date('2025-01-31'),
        },
      ]);

      const result = await service.getSubscriptionWithUsage(mockUserId);

      expect(result.usage.aiSearches).toEqual({ count: 3, limit: 5 });
      expect(result.usage.recipientProfiles).toEqual({ count: 0, limit: 3 });
      expect(result.usage.wishlists).toEqual({ count: 0, limit: 1 });
      expect(result.limits).toEqual(PLAN_LIMITS.FREE);
    });
  });

  describe('createCheckoutSession', () => {
    it('should create checkout session for new customer', async () => {
      const userWithoutStripe = {
        ...mockUser,
        subscription: { ...mockSubscription, stripeCustomerId: null },
      };
      prismaService.user.findUnique.mockResolvedValue(userWithoutStripe);
      stripeService.createCustomer.mockResolvedValue({ id: mockStripeCustomerId } as any);
      stripeService.getPriceId.mockReturnValue('price_gold_monthly');
      stripeService.createCheckoutSession.mockResolvedValue({
        id: 'cs_123',
        url: 'https://checkout.stripe.com/session',
      } as any);
      prismaService.subscription.upsert.mockResolvedValue(mockSubscription);

      const result = await service.createCheckoutSession(
        mockUserId,
        'GOLD',
        'MONTHLY',
        'https://example.com/success',
        'https://example.com/cancel'
      );

      expect(result.sessionId).toBe('cs_123');
      expect(result.url).toBe('https://checkout.stripe.com/session');
      expect(stripeService.createCustomer).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.name,
        { userId: mockUserId }
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.createCheckoutSession(
          mockUserId,
          'GOLD',
          'MONTHLY',
          'https://example.com/success',
          'https://example.com/cancel'
        )
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid plan', async () => {
      prismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        subscription: { ...mockSubscription, stripeCustomerId: mockStripeCustomerId },
      });
      stripeService.getPriceId.mockReturnValue(null);

      await expect(
        service.createCheckoutSession(
          mockUserId,
          'GOLD',
          'MONTHLY',
          'https://example.com/success',
          'https://example.com/cancel'
        )
      ).rejects.toThrow(BadRequestException);
    });

    it('should apply promo code if valid', async () => {
      prismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        subscription: { ...mockSubscription, stripeCustomerId: mockStripeCustomerId },
      });
      stripeService.getPriceId.mockReturnValue('price_gold_monthly');
      stripeService.createCheckoutSession.mockResolvedValue({
        id: 'cs_123',
        url: 'https://checkout.stripe.com/session',
      } as any);
      prismaService.promoCode.findUnique.mockResolvedValue({
        id: 'promo-1',
        code: 'SAVE20',
        isActive: true,
        stripeCouponId: 'coupon_123',
        validUntil: null,
        maxUses: null,
        currentUses: 0,
      });

      await service.createCheckoutSession(
        mockUserId,
        'GOLD',
        'MONTHLY',
        'https://example.com/success',
        'https://example.com/cancel',
        'SAVE20'
      );

      expect(stripeService.createCheckoutSession).toHaveBeenCalledWith(
        mockStripeCustomerId,
        'price_gold_monthly',
        'https://example.com/success',
        'https://example.com/cancel',
        expect.objectContaining({ couponId: 'coupon_123' })
      );
    });

    it('should throw BadRequestException for expired promo code', async () => {
      prismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        subscription: { ...mockSubscription, stripeCustomerId: mockStripeCustomerId },
      });
      stripeService.getPriceId.mockReturnValue('price_gold_monthly');
      prismaService.promoCode.findUnique.mockResolvedValue({
        id: 'promo-1',
        code: 'EXPIRED',
        isActive: true,
        stripeCouponId: 'coupon_123',
        validUntil: new Date('2024-01-01'), // Expired
        maxUses: null,
        currentUses: 0,
      });

      await expect(
        service.createCheckoutSession(
          mockUserId,
          'GOLD',
          'MONTHLY',
          'https://example.com/success',
          'https://example.com/cancel',
          'EXPIRED'
        )
      ).rejects.toThrow('Promo code has expired');
    });
  });

  describe('createBillingPortalSession', () => {
    it('should create billing portal session', async () => {
      prismaService.subscription.findUnique.mockResolvedValue({
        ...mockSubscription,
        stripeCustomerId: mockStripeCustomerId,
      });
      stripeService.createBillingPortalSession.mockResolvedValue({
        url: 'https://billing.stripe.com/portal',
      } as any);

      const result = await service.createBillingPortalSession(
        mockUserId,
        'https://example.com/account'
      );

      expect(result.url).toBe('https://billing.stripe.com/portal');
    });

    it('should throw BadRequestException if no billing account', async () => {
      prismaService.subscription.findUnique.mockResolvedValue(mockSubscription);

      await expect(
        service.createBillingPortalSession(mockUserId, 'https://example.com/account')
      ).rejects.toThrow('No billing account found');
    });
  });

  describe('upgradeSubscription', () => {
    it('should upgrade subscription with proration', async () => {
      const subscriptionWithStripe = {
        ...mockSubscription,
        stripeSubscriptionId: mockStripeSubscriptionId,
      };
      prismaService.subscription.findUnique.mockResolvedValue(subscriptionWithStripe);
      stripeService.getPriceId.mockReturnValue('price_platinum_monthly');
      stripeService.getSubscription.mockResolvedValue({
        id: mockStripeSubscriptionId,
        items: { data: [{ id: 'si_123', price: { id: 'price_gold_monthly' } }] },
      } as any);
      stripeService.updateSubscription.mockResolvedValue({} as any);
      prismaService.subscription.update.mockResolvedValue({
        ...subscriptionWithStripe,
        plan: SubscriptionPlan.PLATINUM,
      });

      const result = await service.upgradeSubscription(
        mockUserId,
        'PLATINUM',
        'MONTHLY'
      );

      expect(result.plan).toBe(SubscriptionPlan.PLATINUM);
      expect(stripeService.updateSubscription).toHaveBeenCalledWith(
        mockStripeSubscriptionId,
        expect.objectContaining({ proration_behavior: 'create_prorations' })
      );
    });

    it('should throw BadRequestException if no active subscription', async () => {
      prismaService.subscription.findUnique.mockResolvedValue(mockSubscription);

      await expect(
        service.upgradeSubscription(mockUserId, 'PLATINUM', 'MONTHLY')
      ).rejects.toThrow('No active subscription to upgrade');
    });
  });

  describe('downgradeSubscription', () => {
    it('should schedule cancellation when downgrading to FREE', async () => {
      const subscriptionWithStripe = {
        ...mockSubscription,
        plan: SubscriptionPlan.GOLD,
        stripeSubscriptionId: mockStripeSubscriptionId,
      };
      prismaService.subscription.findUnique.mockResolvedValue(subscriptionWithStripe);
      stripeService.cancelSubscription.mockResolvedValue({} as any);
      prismaService.subscription.update.mockResolvedValue({
        ...subscriptionWithStripe,
        cancelAtPeriodEnd: true,
      });

      const result = await service.downgradeSubscription(mockUserId, 'FREE');

      expect(result.cancelAtPeriodEnd).toBe(true);
      expect(stripeService.cancelSubscription).toHaveBeenCalledWith(
        mockStripeSubscriptionId,
        false
      );
    });

    it('should throw NotFoundException if subscription not found', async () => {
      prismaService.subscription.findUnique.mockResolvedValue(null);

      await expect(
        service.downgradeSubscription(mockUserId, 'FREE')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel subscription at period end by default', async () => {
      const subscriptionWithStripe = {
        ...mockSubscription,
        stripeSubscriptionId: mockStripeSubscriptionId,
      };
      prismaService.subscription.findUnique.mockResolvedValue(subscriptionWithStripe);
      stripeService.cancelSubscription.mockResolvedValue({} as any);
      prismaService.subscription.update.mockResolvedValue({
        ...subscriptionWithStripe,
        cancelAtPeriodEnd: true,
        canceledAt: new Date(),
      });

      const result = await service.cancelSubscription(mockUserId);

      expect(result.cancelAtPeriodEnd).toBe(true);
      expect(stripeService.cancelSubscription).toHaveBeenCalledWith(
        mockStripeSubscriptionId,
        false
      );
    });

    it('should cancel subscription immediately when specified', async () => {
      const subscriptionWithStripe = {
        ...mockSubscription,
        stripeSubscriptionId: mockStripeSubscriptionId,
      };
      prismaService.subscription.findUnique.mockResolvedValue(subscriptionWithStripe);
      stripeService.cancelSubscription.mockResolvedValue({} as any);
      prismaService.subscription.update.mockResolvedValue({
        ...subscriptionWithStripe,
        status: SubscriptionStatus.CANCELED,
        plan: SubscriptionPlan.FREE,
        canceledAt: new Date(),
      });

      const result = await service.cancelSubscription(mockUserId, true);

      expect(result.status).toBe(SubscriptionStatus.CANCELED);
      expect(stripeService.cancelSubscription).toHaveBeenCalledWith(
        mockStripeSubscriptionId,
        true
      );
    });
  });

  describe('reactivateSubscription', () => {
    it('should reactivate canceled subscription', async () => {
      const canceledSubscription = {
        ...mockSubscription,
        stripeSubscriptionId: mockStripeSubscriptionId,
        cancelAtPeriodEnd: true,
      };
      prismaService.subscription.findUnique.mockResolvedValue(canceledSubscription);
      stripeService.reactivateSubscription.mockResolvedValue({} as any);
      prismaService.subscription.update.mockResolvedValue({
        ...canceledSubscription,
        cancelAtPeriodEnd: false,
        canceledAt: null,
      });

      const result = await service.reactivateSubscription(mockUserId);

      expect(result.cancelAtPeriodEnd).toBe(false);
    });

    it('should throw BadRequestException if not scheduled for cancellation', async () => {
      prismaService.subscription.findUnique.mockResolvedValue(mockSubscription);

      await expect(
        service.reactivateSubscription(mockUserId)
      ).rejects.toThrow('Subscription is not scheduled for cancellation');
    });
  });

  describe('incrementUsage', () => {
    it('should increment usage count', async () => {
      prismaService.subscription.findUnique.mockResolvedValue(mockSubscription);
      prismaService.usageRecord.upsert.mockResolvedValue({} as any);

      await service.incrementUsage(mockUserId, UsageFeature.AI_SEARCH);

      expect(prismaService.usageRecord.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: { count: { increment: 1 } },
          create: expect.objectContaining({
            feature: UsageFeature.AI_SEARCH,
            count: 1,
            limit: 5, // FREE plan limit
          }),
        })
      );
    });

    it('should increment by custom amount', async () => {
      prismaService.subscription.findUnique.mockResolvedValue(mockSubscription);
      prismaService.usageRecord.upsert.mockResolvedValue({} as any);

      await service.incrementUsage(mockUserId, UsageFeature.AI_SEARCH, 3);

      expect(prismaService.usageRecord.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: { count: { increment: 3 } },
        })
      );
    });
  });

  describe('checkUsageLimit', () => {
    it('should return allowed=true when under limit', async () => {
      prismaService.subscription.findUnique.mockResolvedValue(mockSubscription);
      prismaService.usageRecord.findUnique.mockResolvedValue({
        count: 3,
      });

      const result = await service.checkUsageLimit(mockUserId, UsageFeature.AI_SEARCH);

      expect(result).toEqual({ allowed: true, current: 3, limit: 5 });
    });

    it('should return allowed=false when at limit', async () => {
      prismaService.subscription.findUnique.mockResolvedValue(mockSubscription);
      prismaService.usageRecord.findUnique.mockResolvedValue({
        count: 5,
      });

      const result = await service.checkUsageLimit(mockUserId, UsageFeature.AI_SEARCH);

      expect(result).toEqual({ allowed: false, current: 5, limit: 5 });
    });

    it('should return allowed=true for unlimited (PLATINUM)', async () => {
      prismaService.subscription.findUnique.mockResolvedValue({
        ...mockSubscription,
        plan: SubscriptionPlan.PLATINUM,
      });

      const result = await service.checkUsageLimit(mockUserId, UsageFeature.AI_SEARCH);

      expect(result).toEqual({ allowed: true, current: 0, limit: -1 });
    });
  });

  describe('hasFeatureAccess', () => {
    it('should return false for aiChat on FREE plan', async () => {
      prismaService.subscription.findUnique.mockResolvedValue(mockSubscription);

      const result = await service.hasFeatureAccess(mockUserId, 'aiChat');

      expect(result).toBe(false);
    });

    it('should return true for aiChat on PLATINUM plan', async () => {
      prismaService.subscription.findUnique.mockResolvedValue({
        ...mockSubscription,
        plan: SubscriptionPlan.PLATINUM,
      });

      const result = await service.hasFeatureAccess(mockUserId, 'aiChat');

      expect(result).toBe(true);
    });

    it('should return false for familySharing on GOLD plan', async () => {
      prismaService.subscription.findUnique.mockResolvedValue({
        ...mockSubscription,
        plan: SubscriptionPlan.GOLD,
      });

      const result = await service.hasFeatureAccess(mockUserId, 'familySharing');

      expect(result).toBe(false);
    });

    it('should return true for wishlistShare on GOLD plan', async () => {
      prismaService.subscription.findUnique.mockResolvedValue({
        ...mockSubscription,
        plan: SubscriptionPlan.GOLD,
      });

      const result = await service.hasFeatureAccess(mockUserId, 'wishlistShare');

      expect(result).toBe(true);
    });
  });

  describe('handleSubscriptionCreated', () => {
    it('should update subscription from Stripe webhook', async () => {
      const stripeSubscription = {
        id: mockStripeSubscriptionId,
        metadata: { userId: mockUserId },
        items: { data: [{ price: { id: 'price_gold_monthly' } }] },
        status: 'active',
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      } as any;

      stripeService.getPriceConfig.mockReturnValue({
        gold: {
          monthly: { priceId: 'price_gold_monthly' },
          yearly: { priceId: 'price_gold_yearly' },
        },
        platinum: {
          monthly: { priceId: 'price_platinum_monthly' },
          yearly: { priceId: 'price_platinum_yearly' },
        },
      });
      prismaService.subscription.update.mockResolvedValue({
        ...mockSubscription,
        plan: SubscriptionPlan.GOLD,
        stripeSubscriptionId: mockStripeSubscriptionId,
      });

      await service.handleSubscriptionCreated(stripeSubscription);

      expect(prismaService.subscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: mockUserId },
          data: expect.objectContaining({
            stripeSubscriptionId: mockStripeSubscriptionId,
            plan: SubscriptionPlan.GOLD,
            status: SubscriptionStatus.ACTIVE,
          }),
        })
      );
    });

    it('should log warning if userId not in metadata', async () => {
      const stripeSubscription = {
        id: mockStripeSubscriptionId,
        metadata: {},
        items: { data: [{ price: { id: 'price_gold_monthly' } }] },
        status: 'active',
      } as any;

      await service.handleSubscriptionCreated(stripeSubscription);

      expect(prismaService.subscription.update).not.toHaveBeenCalled();
    });
  });

  describe('handleSubscriptionDeleted', () => {
    it('should reset subscription to FREE when deleted', async () => {
      const stripeSubscription = {
        id: mockStripeSubscriptionId,
      } as any;

      prismaService.subscription.findFirst.mockResolvedValue({
        ...mockSubscription,
        stripeSubscriptionId: mockStripeSubscriptionId,
      });
      prismaService.subscription.update.mockResolvedValue({
        ...mockSubscription,
        plan: SubscriptionPlan.FREE,
        status: SubscriptionStatus.CANCELED,
      });

      await service.handleSubscriptionDeleted(stripeSubscription);

      expect(prismaService.subscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            plan: SubscriptionPlan.FREE,
            status: SubscriptionStatus.CANCELED,
            stripeSubscriptionId: null,
          }),
        })
      );
    });
  });

  describe('handleInvoicePaid', () => {
    it('should create payment record on invoice paid', async () => {
      const invoice = {
        id: 'inv_123',
        subscription: mockStripeSubscriptionId,
        amount_paid: 999,
        currency: 'usd',
        hosted_invoice_url: 'https://invoice.stripe.com/inv_123',
        invoice_pdf: 'https://invoice.stripe.com/inv_123/pdf',
      } as any;

      prismaService.subscription.findFirst.mockResolvedValue({
        ...mockSubscription,
        stripeSubscriptionId: mockStripeSubscriptionId,
      });
      prismaService.payment.create.mockResolvedValue({} as any);

      await service.handleInvoicePaid(invoice);

      expect(prismaService.payment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          subscriptionId: mockSubscriptionId,
          stripeInvoiceId: 'inv_123',
          amount: 999,
          currency: 'usd',
          status: 'SUCCEEDED',
        }),
      });
    });
  });

  describe('handleInvoicePaymentFailed', () => {
    it('should create failed payment record and update status', async () => {
      const invoice = {
        id: 'inv_123',
        subscription: mockStripeSubscriptionId,
        amount_due: 999,
        currency: 'usd',
      } as any;

      prismaService.subscription.findFirst.mockResolvedValue({
        ...mockSubscription,
        stripeSubscriptionId: mockStripeSubscriptionId,
      });
      prismaService.payment.create.mockResolvedValue({} as any);
      prismaService.subscription.update.mockResolvedValue({
        ...mockSubscription,
        status: SubscriptionStatus.PAST_DUE,
      });

      await service.handleInvoicePaymentFailed(invoice);

      expect(prismaService.payment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'FAILED',
        }),
      });
      expect(prismaService.subscription.update).toHaveBeenCalledWith({
        where: { id: mockSubscriptionId },
        data: { status: SubscriptionStatus.PAST_DUE },
      });
    });
  });

  describe('validatePromoCode', () => {
    it('should return valid for active promo code', async () => {
      prismaService.promoCode.findUnique.mockResolvedValue({
        id: 'promo-1',
        code: 'SAVE20',
        isActive: true,
        discountType: 'PERCENTAGE',
        discountValue: 20,
        stripeCouponId: 'coupon_123',
        validUntil: null,
        maxUses: null,
        currentUses: 0,
        applicablePlans: [],
      });

      const result = await service.validatePromoCode('SAVE20');

      expect(result).toEqual({
        valid: true,
        discountType: 'PERCENTAGE',
        discountValue: 20,
        stripeCouponId: 'coupon_123',
      });
    });

    it('should return invalid for non-existent code', async () => {
      prismaService.promoCode.findUnique.mockResolvedValue(null);

      const result = await service.validatePromoCode('INVALID');

      expect(result).toEqual({ valid: false, message: 'Invalid promo code' });
    });

    it('should return invalid for inactive code', async () => {
      prismaService.promoCode.findUnique.mockResolvedValue({
        id: 'promo-1',
        code: 'INACTIVE',
        isActive: false,
      });

      const result = await service.validatePromoCode('INACTIVE');

      expect(result).toEqual({ valid: false, message: 'Promo code is no longer active' });
    });

    it('should return invalid for code not applicable to plan', async () => {
      prismaService.promoCode.findUnique.mockResolvedValue({
        id: 'promo-1',
        code: 'PLATINUMONLY',
        isActive: true,
        applicablePlans: [SubscriptionPlan.PLATINUM],
      });

      const result = await service.validatePromoCode('PLATINUMONLY', SubscriptionPlan.GOLD);

      expect(result).toEqual({
        valid: false,
        message: 'Promo code is not valid for this plan',
      });
    });
  });

  describe('getCurrentUsage', () => {
    it('should return current usage for all features', async () => {
      prismaService.subscription.findUnique.mockResolvedValue(mockSubscription);
      prismaService.usageRecord.findMany.mockResolvedValue([
        { feature: UsageFeature.AI_SEARCH, count: 2 },
        { feature: UsageFeature.RECIPIENT_PROFILE, count: 1 },
      ]);

      const result = await service.getCurrentUsage(mockUserId);

      expect(result.aiSearches).toEqual({ count: 2, limit: 5, remaining: 3 });
      expect(result.recipientProfiles).toEqual({ count: 1, limit: 3, remaining: 2 });
      expect(result.wishlists).toEqual({ count: 0, limit: 1, remaining: 1 });
    });

    it('should return -1 remaining for unlimited features', async () => {
      prismaService.subscription.findUnique.mockResolvedValue({
        ...mockSubscription,
        plan: SubscriptionPlan.PLATINUM,
      });
      prismaService.usageRecord.findMany.mockResolvedValue([]);

      const result = await service.getCurrentUsage(mockUserId);

      expect(result.aiSearches.remaining).toBe(-1);
      expect(result.recipientProfiles.remaining).toBe(-1);
    });
  });

  describe('getInvoices', () => {
    it('should return payment history', async () => {
      const mockPayments = [
        { id: 'payment-1', amount: 999 },
        { id: 'payment-2', amount: 999 },
      ];
      prismaService.subscription.findUnique.mockResolvedValue(mockSubscription);
      prismaService.payment.findMany.mockResolvedValue(mockPayments as any);

      const result = await service.getInvoices(mockUserId);

      expect(result).toEqual(mockPayments);
      expect(prismaService.payment.findMany).toHaveBeenCalledWith({
        where: { subscriptionId: mockSubscriptionId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
    });

    it('should return empty array if no subscription', async () => {
      prismaService.subscription.findUnique.mockResolvedValue(null);

      const result = await service.getInvoices(mockUserId);

      expect(result).toEqual([]);
    });
  });
});
