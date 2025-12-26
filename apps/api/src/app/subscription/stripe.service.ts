import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

export interface StripePriceConfig {
  priceId: string;
  productId: string;
  amount: number;
  interval: 'month' | 'year';
}

export interface StripeProductConfig {
  gold: {
    monthly: StripePriceConfig;
    yearly: StripePriceConfig;
  };
  platinum: {
    monthly: StripePriceConfig;
    yearly: StripePriceConfig;
  };
}

@Injectable()
export class StripeService implements OnModuleInit {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe | null = null;
  private prices: StripeProductConfig | null = null;
  private readonly isConfigured: boolean;

  constructor(private readonly configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    this.isConfigured = !!secretKey;

    if (!secretKey) {
      this.logger.warn('STRIPE_SECRET_KEY not configured - Stripe features disabled');
    } else {
      this.stripe = new Stripe(secretKey, {
        typescript: true,
      });
    }
  }

  async onModuleInit() {
    await this.loadPriceConfig();
  }

  private async loadPriceConfig() {
    // Load price IDs from environment or fetch from Stripe
    const goldMonthlyPriceId = this.configService.get<string>('STRIPE_GOLD_MONTHLY_PRICE_ID');
    const goldYearlyPriceId = this.configService.get<string>('STRIPE_GOLD_YEARLY_PRICE_ID');
    const platinumMonthlyPriceId = this.configService.get<string>('STRIPE_PLATINUM_MONTHLY_PRICE_ID');
    const platinumYearlyPriceId = this.configService.get<string>('STRIPE_PLATINUM_YEARLY_PRICE_ID');

    if (goldMonthlyPriceId && goldYearlyPriceId && platinumMonthlyPriceId && platinumYearlyPriceId) {
      this.prices = {
        gold: {
          monthly: {
            priceId: goldMonthlyPriceId,
            productId: '',
            amount: 999, // $9.99
            interval: 'month',
          },
          yearly: {
            priceId: goldYearlyPriceId,
            productId: '',
            amount: 9900, // $99.00
            interval: 'year',
          },
        },
        platinum: {
          monthly: {
            priceId: platinumMonthlyPriceId,
            productId: '',
            amount: 1999, // $19.99
            interval: 'month',
          },
          yearly: {
            priceId: platinumYearlyPriceId,
            productId: '',
            amount: 19900, // $199.00
            interval: 'year',
          },
        },
      };
      this.logger.log('Stripe price configuration loaded');
    } else {
      this.logger.warn('Stripe price IDs not configured - subscription creation disabled');
    }
  }

  get client(): Stripe | null {
    return this.stripe;
  }

  private ensureConfigured(): void {
    if (!this.stripe) {
      throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY environment variable.');
    }
  }

  getPriceConfig(): StripeProductConfig | null {
    return this.prices;
  }

  getPriceId(plan: 'GOLD' | 'PLATINUM', interval: 'MONTHLY' | 'YEARLY'): string | null {
    if (!this.prices) return null;
    const planKey = plan.toLowerCase() as 'gold' | 'platinum';
    const intervalKey = interval.toLowerCase() as 'monthly' | 'yearly';
    return this.prices[planKey]?.[intervalKey]?.priceId || null;
  }

  // Customer Management
  async createCustomer(email: string, name?: string, metadata?: Record<string, string>): Promise<Stripe.Customer> {
    this.ensureConfigured();
    return this.stripe!.customers.create({
      email,
      name,
      metadata,
    });
  }

  async getCustomer(customerId: string): Promise<Stripe.Customer | null> {
    if (!this.stripe) return null;
    try {
      const customer = await this.stripe.customers.retrieve(customerId);
      if (customer.deleted) return null;
      return customer as Stripe.Customer;
    } catch {
      return null;
    }
  }

  async updateCustomer(customerId: string, data: Stripe.CustomerUpdateParams): Promise<Stripe.Customer> {
    this.ensureConfigured();
    return this.stripe!.customers.update(customerId, data);
  }

  // Subscription Management
  async createSubscription(
    customerId: string,
    priceId: string,
    options?: {
      trialDays?: number;
      couponId?: string;
      metadata?: Record<string, string>;
    }
  ): Promise<Stripe.Subscription> {
    this.ensureConfigured();
    const params: Stripe.SubscriptionCreateParams = {
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: options?.metadata,
    };

    if (options?.trialDays) {
      params.trial_period_days = options.trialDays;
    }

    if (options?.couponId) {
      params.discounts = [{ coupon: options.couponId }];
    }

    return this.stripe!.subscriptions.create(params);
  }

  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
    if (!this.stripe) return null;
    try {
      return await this.stripe.subscriptions.retrieve(subscriptionId);
    } catch {
      return null;
    }
  }

  async updateSubscription(
    subscriptionId: string,
    params: Stripe.SubscriptionUpdateParams
  ): Promise<Stripe.Subscription> {
    this.ensureConfigured();
    return this.stripe!.subscriptions.update(subscriptionId, params);
  }

  async cancelSubscription(subscriptionId: string, immediately = false): Promise<Stripe.Subscription> {
    this.ensureConfigured();
    if (immediately) {
      return this.stripe!.subscriptions.cancel(subscriptionId);
    }
    return this.stripe!.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }

  async reactivateSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    this.ensureConfigured();
    return this.stripe!.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
  }

  // Checkout Sessions
  async createCheckoutSession(
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
    options?: {
      trialDays?: number;
      couponId?: string;
      metadata?: Record<string, string>;
    }
  ): Promise<Stripe.Checkout.Session> {
    this.ensureConfigured();
    const params: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: options?.metadata,
      subscription_data: {
        metadata: options?.metadata,
      },
    };

    if (options?.trialDays) {
      params.subscription_data!.trial_period_days = options.trialDays;
    }

    if (options?.couponId) {
      params.discounts = [{ coupon: options.couponId }];
    }

    return this.stripe!.checkout.sessions.create(params);
  }

  // Billing Portal
  async createBillingPortalSession(
    customerId: string,
    returnUrl: string
  ): Promise<Stripe.BillingPortal.Session> {
    this.ensureConfigured();
    return this.stripe!.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  }

  // Invoices
  async listInvoices(customerId: string, limit = 10): Promise<Stripe.Invoice[]> {
    if (!this.stripe) return [];
    const invoices = await this.stripe.invoices.list({
      customer: customerId,
      limit,
    });
    return invoices.data;
  }

  async getInvoice(invoiceId: string): Promise<Stripe.Invoice | null> {
    if (!this.stripe) return null;
    try {
      return await this.stripe.invoices.retrieve(invoiceId);
    } catch {
      return null;
    }
  }

  // Coupons
  async createCoupon(params: Stripe.CouponCreateParams): Promise<Stripe.Coupon> {
    this.ensureConfigured();
    return this.stripe!.coupons.create(params);
  }

  async getCoupon(couponId: string): Promise<Stripe.Coupon | null> {
    if (!this.stripe) return null;
    try {
      return await this.stripe.coupons.retrieve(couponId);
    } catch {
      return null;
    }
  }

  // Webhook Verification
  constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
    this.ensureConfigured();
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET not configured');
    }
    return this.stripe!.webhooks.constructEvent(payload, signature, webhookSecret);
  }

  // Payment Methods
  async listPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    if (!this.stripe) return [];
    const methods = await this.stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });
    return methods.data;
  }

  async detachPaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod> {
    this.ensureConfigured();
    return this.stripe!.paymentMethods.detach(paymentMethodId);
  }
}
