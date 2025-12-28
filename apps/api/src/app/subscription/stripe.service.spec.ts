/**
 * @jest-environment node
 */
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { StripeService } from './stripe.service';

describe('StripeService', () => {
  let service: StripeService;

  const mockStripeSecretKey = 'sk_test_123';
  const mockCustomerId = 'cus_123';
  const mockSubscriptionId = 'sub_123';
  const mockPriceId = 'price_123';

  // Create fresh mock instance for each test
  const createMockStripeInstance = () => ({
    customers: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
    },
    subscriptions: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
      cancel: jest.fn(),
    },
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
    billingPortal: {
      sessions: {
        create: jest.fn(),
      },
    },
    invoices: {
      list: jest.fn(),
      retrieve: jest.fn(),
    },
    coupons: {
      create: jest.fn(),
      retrieve: jest.fn(),
    },
    paymentMethods: {
      list: jest.fn(),
      detach: jest.fn(),
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
  });

  let mockStripeInstance: ReturnType<typeof createMockStripeInstance>;

  // Mock Stripe module
  jest.mock('stripe', () => {
    return function () {
      return mockStripeInstance;
    };
  });

  beforeEach(async () => {
    // Create fresh mock instance
    mockStripeInstance = createMockStripeInstance();

    // Re-mock Stripe for each test
    jest.doMock('stripe', () => {
      return function () {
        return mockStripeInstance;
      };
    });

    const mockConfigService = {
      get: jest.fn((key: string) => {
        const config: Record<string, string> = {
          STRIPE_SECRET_KEY: mockStripeSecretKey,
          STRIPE_WEBHOOK_SECRET: 'whsec_123',
          STRIPE_GOLD_MONTHLY_PRICE_ID: 'price_gold_monthly',
          STRIPE_GOLD_YEARLY_PRICE_ID: 'price_gold_yearly',
          STRIPE_PLATINUM_MONTHLY_PRICE_ID: 'price_platinum_monthly',
          STRIPE_PLATINUM_YEARLY_PRICE_ID: 'price_platinum_yearly',
        };
        return config[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StripeService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<StripeService>(StripeService);

    // Manually set the stripe instance to our mock
    (service as any).stripe = mockStripeInstance;

    // Initialize the service
    await service.onModuleInit();
  });

  describe('initialization', () => {
    it('should load price configuration on init', async () => {
      const priceConfig = service.getPriceConfig();

      expect(priceConfig).toEqual({
        gold: {
          monthly: expect.objectContaining({
            priceId: 'price_gold_monthly',
            amount: 999,
            interval: 'month',
          }),
          yearly: expect.objectContaining({
            priceId: 'price_gold_yearly',
            amount: 9900,
            interval: 'year',
          }),
        },
        platinum: {
          monthly: expect.objectContaining({
            priceId: 'price_platinum_monthly',
            amount: 1999,
            interval: 'month',
          }),
          yearly: expect.objectContaining({
            priceId: 'price_platinum_yearly',
            amount: 19900,
            interval: 'year',
          }),
        },
      });
    });
  });

  describe('getPriceId', () => {
    it('should return correct price ID for GOLD MONTHLY', () => {
      const priceId = service.getPriceId('GOLD', 'MONTHLY');
      expect(priceId).toBe('price_gold_monthly');
    });

    it('should return correct price ID for GOLD YEARLY', () => {
      const priceId = service.getPriceId('GOLD', 'YEARLY');
      expect(priceId).toBe('price_gold_yearly');
    });

    it('should return correct price ID for PLATINUM MONTHLY', () => {
      const priceId = service.getPriceId('PLATINUM', 'MONTHLY');
      expect(priceId).toBe('price_platinum_monthly');
    });

    it('should return correct price ID for PLATINUM YEARLY', () => {
      const priceId = service.getPriceId('PLATINUM', 'YEARLY');
      expect(priceId).toBe('price_platinum_yearly');
    });
  });

  describe('Customer Management', () => {
    describe('createCustomer', () => {
      it('should create a customer with email and name', async () => {
        const mockCustomer = { id: mockCustomerId, email: 'test@example.com' };
        mockStripeInstance.customers.create.mockResolvedValue(mockCustomer);

        const result = await service.createCustomer('test@example.com', 'Test User', {
          userId: 'user-123',
        });

        expect(result).toEqual(mockCustomer);
        expect(mockStripeInstance.customers.create).toHaveBeenCalledWith({
          email: 'test@example.com',
          name: 'Test User',
          metadata: { userId: 'user-123' },
        });
      });
    });

    describe('getCustomer', () => {
      it('should retrieve a customer', async () => {
        const mockCustomer = { id: mockCustomerId, email: 'test@example.com' };
        mockStripeInstance.customers.retrieve.mockResolvedValue(mockCustomer);

        const result = await service.getCustomer(mockCustomerId);

        expect(result).toEqual(mockCustomer);
        expect(mockStripeInstance.customers.retrieve).toHaveBeenCalledWith(mockCustomerId);
      });

      it('should return null for deleted customer', async () => {
        mockStripeInstance.customers.retrieve.mockResolvedValue({ deleted: true });

        const result = await service.getCustomer(mockCustomerId);

        expect(result).toBeNull();
      });

      it('should return null on error', async () => {
        mockStripeInstance.customers.retrieve.mockRejectedValue(new Error('Not found'));

        const result = await service.getCustomer(mockCustomerId);

        expect(result).toBeNull();
      });
    });

    describe('updateCustomer', () => {
      it('should update customer data', async () => {
        const mockCustomer = { id: mockCustomerId, name: 'Updated Name' };
        mockStripeInstance.customers.update.mockResolvedValue(mockCustomer);

        const result = await service.updateCustomer(mockCustomerId, { name: 'Updated Name' });

        expect(result).toEqual(mockCustomer);
        expect(mockStripeInstance.customers.update).toHaveBeenCalledWith(mockCustomerId, {
          name: 'Updated Name',
        });
      });
    });
  });

  describe('Subscription Management', () => {
    describe('createSubscription', () => {
      it('should create a subscription', async () => {
        const mockSubscription = { id: mockSubscriptionId, status: 'active' };
        mockStripeInstance.subscriptions.create.mockResolvedValue(mockSubscription);

        const result = await service.createSubscription(mockCustomerId, mockPriceId);

        expect(result).toEqual(mockSubscription);
        expect(mockStripeInstance.subscriptions.create).toHaveBeenCalledWith({
          customer: mockCustomerId,
          items: [{ price: mockPriceId }],
          payment_behavior: 'default_incomplete',
          payment_settings: { save_default_payment_method: 'on_subscription' },
          expand: ['latest_invoice.payment_intent'],
          metadata: undefined,
        });
      });

      it('should create a subscription with trial period', async () => {
        const mockSubscription = { id: mockSubscriptionId, status: 'trialing' };
        mockStripeInstance.subscriptions.create.mockResolvedValue(mockSubscription);

        await service.createSubscription(mockCustomerId, mockPriceId, { trialDays: 14 });

        expect(mockStripeInstance.subscriptions.create).toHaveBeenCalledWith(
          expect.objectContaining({
            trial_period_days: 14,
          })
        );
      });

      it('should create a subscription with coupon', async () => {
        const mockSubscription = { id: mockSubscriptionId, status: 'active' };
        mockStripeInstance.subscriptions.create.mockResolvedValue(mockSubscription);

        await service.createSubscription(mockCustomerId, mockPriceId, {
          couponId: 'coupon_123',
        });

        expect(mockStripeInstance.subscriptions.create).toHaveBeenCalledWith(
          expect.objectContaining({
            discounts: [{ coupon: 'coupon_123' }],
          })
        );
      });
    });

    describe('getSubscription', () => {
      it('should retrieve a subscription', async () => {
        const mockSubscription = { id: mockSubscriptionId, status: 'active' };
        mockStripeInstance.subscriptions.retrieve.mockResolvedValue(mockSubscription);

        const result = await service.getSubscription(mockSubscriptionId);

        expect(result).toEqual(mockSubscription);
      });

      it('should return null on error', async () => {
        mockStripeInstance.subscriptions.retrieve.mockRejectedValue(new Error('Not found'));

        const result = await service.getSubscription(mockSubscriptionId);

        expect(result).toBeNull();
      });
    });

    describe('updateSubscription', () => {
      it('should update subscription', async () => {
        const mockSubscription = { id: mockSubscriptionId, status: 'active' };
        mockStripeInstance.subscriptions.update.mockResolvedValue(mockSubscription);

        const result = await service.updateSubscription(mockSubscriptionId, {
          items: [{ id: 'si_123', price: 'price_new' }],
        });

        expect(result).toEqual(mockSubscription);
        expect(mockStripeInstance.subscriptions.update).toHaveBeenCalledWith(
          mockSubscriptionId,
          { items: [{ id: 'si_123', price: 'price_new' }] }
        );
      });
    });

    describe('cancelSubscription', () => {
      it('should cancel subscription immediately', async () => {
        const mockSubscription = { id: mockSubscriptionId, status: 'canceled' };
        mockStripeInstance.subscriptions.cancel.mockResolvedValue(mockSubscription);

        const result = await service.cancelSubscription(mockSubscriptionId, true);

        expect(result).toEqual(mockSubscription);
        expect(mockStripeInstance.subscriptions.cancel).toHaveBeenCalledWith(mockSubscriptionId);
      });

      it('should cancel subscription at period end', async () => {
        const mockSubscription = {
          id: mockSubscriptionId,
          cancel_at_period_end: true,
        };
        mockStripeInstance.subscriptions.update.mockResolvedValue(mockSubscription);

        const result = await service.cancelSubscription(mockSubscriptionId, false);

        expect(result).toEqual(mockSubscription);
        expect(mockStripeInstance.subscriptions.update).toHaveBeenCalledWith(
          mockSubscriptionId,
          { cancel_at_period_end: true }
        );
      });
    });

    describe('reactivateSubscription', () => {
      it('should reactivate subscription', async () => {
        const mockSubscription = {
          id: mockSubscriptionId,
          cancel_at_period_end: false,
        };
        mockStripeInstance.subscriptions.update.mockResolvedValue(mockSubscription);

        const result = await service.reactivateSubscription(mockSubscriptionId);

        expect(result).toEqual(mockSubscription);
        expect(mockStripeInstance.subscriptions.update).toHaveBeenCalledWith(
          mockSubscriptionId,
          { cancel_at_period_end: false }
        );
      });
    });
  });

  describe('Checkout Sessions', () => {
    describe('createCheckoutSession', () => {
      it('should create a checkout session', async () => {
        const mockSession = {
          id: 'cs_123',
          url: 'https://checkout.stripe.com/session',
        };
        mockStripeInstance.checkout.sessions.create.mockResolvedValue(mockSession);

        const result = await service.createCheckoutSession(
          mockCustomerId,
          mockPriceId,
          'https://example.com/success',
          'https://example.com/cancel'
        );

        expect(result).toEqual(mockSession);
        expect(mockStripeInstance.checkout.sessions.create).toHaveBeenCalledWith({
          customer: mockCustomerId,
          mode: 'subscription',
          line_items: [{ price: mockPriceId, quantity: 1 }],
          success_url: 'https://example.com/success',
          cancel_url: 'https://example.com/cancel',
          metadata: undefined,
          subscription_data: {
            metadata: undefined,
          },
        });
      });

      it('should create checkout session with trial', async () => {
        const mockSession = { id: 'cs_123' };
        mockStripeInstance.checkout.sessions.create.mockResolvedValue(mockSession);

        await service.createCheckoutSession(
          mockCustomerId,
          mockPriceId,
          'https://example.com/success',
          'https://example.com/cancel',
          { trialDays: 7 }
        );

        expect(mockStripeInstance.checkout.sessions.create).toHaveBeenCalledWith(
          expect.objectContaining({
            subscription_data: expect.objectContaining({
              trial_period_days: 7,
            }),
          })
        );
      });

      it('should create checkout session with coupon', async () => {
        const mockSession = { id: 'cs_123' };
        mockStripeInstance.checkout.sessions.create.mockResolvedValue(mockSession);

        await service.createCheckoutSession(
          mockCustomerId,
          mockPriceId,
          'https://example.com/success',
          'https://example.com/cancel',
          { couponId: 'coupon_123' }
        );

        expect(mockStripeInstance.checkout.sessions.create).toHaveBeenCalledWith(
          expect.objectContaining({
            discounts: [{ coupon: 'coupon_123' }],
          })
        );
      });
    });
  });

  describe('Billing Portal', () => {
    describe('createBillingPortalSession', () => {
      it('should create billing portal session', async () => {
        const mockSession = { url: 'https://billing.stripe.com/portal' };
        mockStripeInstance.billingPortal.sessions.create.mockResolvedValue(mockSession);

        const result = await service.createBillingPortalSession(
          mockCustomerId,
          'https://example.com/account'
        );

        expect(result).toEqual(mockSession);
        expect(mockStripeInstance.billingPortal.sessions.create).toHaveBeenCalledWith({
          customer: mockCustomerId,
          return_url: 'https://example.com/account',
        });
      });
    });
  });

  describe('Invoices', () => {
    describe('listInvoices', () => {
      it('should list invoices for customer', async () => {
        const mockInvoices = [{ id: 'inv_1' }, { id: 'inv_2' }];
        mockStripeInstance.invoices.list.mockResolvedValue({ data: mockInvoices });

        const result = await service.listInvoices(mockCustomerId);

        expect(result).toEqual(mockInvoices);
        expect(mockStripeInstance.invoices.list).toHaveBeenCalledWith({
          customer: mockCustomerId,
          limit: 10,
        });
      });

      it('should respect custom limit', async () => {
        mockStripeInstance.invoices.list.mockResolvedValue({ data: [] });

        await service.listInvoices(mockCustomerId, 5);

        expect(mockStripeInstance.invoices.list).toHaveBeenCalledWith({
          customer: mockCustomerId,
          limit: 5,
        });
      });
    });

    describe('getInvoice', () => {
      it('should retrieve an invoice', async () => {
        const mockInvoice = { id: 'inv_123', amount_paid: 999 };
        mockStripeInstance.invoices.retrieve.mockResolvedValue(mockInvoice);

        const result = await service.getInvoice('inv_123');

        expect(result).toEqual(mockInvoice);
      });

      it('should return null on error', async () => {
        mockStripeInstance.invoices.retrieve.mockRejectedValue(new Error('Not found'));

        const result = await service.getInvoice('inv_123');

        expect(result).toBeNull();
      });
    });
  });

  describe('Coupons', () => {
    describe('createCoupon', () => {
      it('should create a coupon', async () => {
        const mockCoupon = { id: 'coupon_123', percent_off: 20 };
        mockStripeInstance.coupons.create.mockResolvedValue(mockCoupon);

        const result = await service.createCoupon({
          percent_off: 20,
          duration: 'once',
        });

        expect(result).toEqual(mockCoupon);
        expect(mockStripeInstance.coupons.create).toHaveBeenCalledWith({
          percent_off: 20,
          duration: 'once',
        });
      });
    });

    describe('getCoupon', () => {
      it('should retrieve a coupon', async () => {
        const mockCoupon = { id: 'coupon_123', percent_off: 20 };
        mockStripeInstance.coupons.retrieve.mockResolvedValue(mockCoupon);

        const result = await service.getCoupon('coupon_123');

        expect(result).toEqual(mockCoupon);
      });

      it('should return null on error', async () => {
        mockStripeInstance.coupons.retrieve.mockRejectedValue(new Error('Not found'));

        const result = await service.getCoupon('coupon_123');

        expect(result).toBeNull();
      });
    });
  });

  describe('Webhook Verification', () => {
    describe('constructWebhookEvent', () => {
      it('should construct webhook event', () => {
        const mockEvent = { type: 'customer.subscription.created' };
        mockStripeInstance.webhooks.constructEvent.mockReturnValue(mockEvent);

        const payload = Buffer.from('{}');
        const signature = 'sig_123';

        const result = service.constructWebhookEvent(payload, signature);

        expect(result).toEqual(mockEvent);
        expect(mockStripeInstance.webhooks.constructEvent).toHaveBeenCalledWith(
          payload,
          signature,
          'whsec_123'
        );
      });
    });
  });

  describe('Payment Methods', () => {
    describe('listPaymentMethods', () => {
      it('should list payment methods for customer', async () => {
        const mockMethods = [{ id: 'pm_1', type: 'card' }];
        mockStripeInstance.paymentMethods.list.mockResolvedValue({ data: mockMethods });

        const result = await service.listPaymentMethods(mockCustomerId);

        expect(result).toEqual(mockMethods);
        expect(mockStripeInstance.paymentMethods.list).toHaveBeenCalledWith({
          customer: mockCustomerId,
          type: 'card',
        });
      });
    });

    describe('detachPaymentMethod', () => {
      it('should detach payment method', async () => {
        const mockMethod = { id: 'pm_123' };
        mockStripeInstance.paymentMethods.detach.mockResolvedValue(mockMethod);

        const result = await service.detachPaymentMethod('pm_123');

        expect(result).toEqual(mockMethod);
        expect(mockStripeInstance.paymentMethods.detach).toHaveBeenCalledWith('pm_123');
      });
    });
  });

  describe('Error handling - Stripe not configured', () => {
    let serviceNotConfigured: StripeService;

    beforeEach(async () => {
      const mockConfigServiceNoKey = {
        get: jest.fn(() => undefined),
      };

      const moduleNoKey = await Test.createTestingModule({
        providers: [
          StripeService,
          { provide: ConfigService, useValue: mockConfigServiceNoKey },
        ],
      }).compile();

      serviceNotConfigured = moduleNoKey.get<StripeService>(StripeService);
      // Ensure stripe is null for not-configured tests
      (serviceNotConfigured as any).stripe = null;
    });

    it('should throw error on createCustomer when not configured', async () => {
      await expect(
        serviceNotConfigured.createCustomer('test@example.com')
      ).rejects.toThrow('Stripe is not configured');
    });

    it('should throw error on createSubscription when not configured', async () => {
      await expect(
        serviceNotConfigured.createSubscription('cus_123', 'price_123')
      ).rejects.toThrow('Stripe is not configured');
    });

    it('should return null on getSubscription when not configured', async () => {
      const result = await serviceNotConfigured.getSubscription('sub_123');
      expect(result).toBeNull();
    });

    it('should return empty array on listInvoices when not configured', async () => {
      const result = await serviceNotConfigured.listInvoices('cus_123');
      expect(result).toEqual([]);
    });

    it('should return empty array on listPaymentMethods when not configured', async () => {
      const result = await serviceNotConfigured.listPaymentMethods('cus_123');
      expect(result).toEqual([]);
    });

    it('should return null price ID when prices not loaded', () => {
      const result = serviceNotConfigured.getPriceId('GOLD', 'MONTHLY');
      expect(result).toBeNull();
    });
  });
});
