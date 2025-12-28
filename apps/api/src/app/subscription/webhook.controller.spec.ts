/**
 * @jest-environment node
 */
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { StripeService } from './stripe.service';
import { SubscriptionService } from './subscription.service';
import Stripe from 'stripe';

describe('WebhookController', () => {
  let controller: WebhookController;
  let stripeService: jest.Mocked<StripeService>;
  let subscriptionService: jest.Mocked<SubscriptionService>;

  const mockSignature = 'sig_test_123';
  const mockRawBody = Buffer.from('{}');

  beforeEach(async () => {
    const mockStripeService = {
      constructWebhookEvent: jest.fn(),
    };

    const mockSubscriptionService = {
      handleSubscriptionCreated: jest.fn(),
      handleSubscriptionUpdated: jest.fn(),
      handleSubscriptionDeleted: jest.fn(),
      handleInvoicePaid: jest.fn(),
      handleInvoicePaymentFailed: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhookController],
      providers: [
        { provide: StripeService, useValue: mockStripeService },
        { provide: SubscriptionService, useValue: mockSubscriptionService },
      ],
    }).compile();

    controller = module.get<WebhookController>(WebhookController);
    stripeService = module.get(StripeService);
    subscriptionService = module.get(SubscriptionService);
  });

  const createMockRequest = (rawBody: Buffer | undefined = mockRawBody) => ({
    rawBody,
  });

  describe('handleStripeWebhook', () => {
    it('should throw BadRequestException when signature is missing', async () => {
      const req = createMockRequest();

      await expect(
        controller.handleStripeWebhook(req as any, '')
      ).rejects.toThrow('Missing stripe-signature header');
    });

    it('should throw BadRequestException when raw body is missing', async () => {
      // Create request with explicit null rawBody
      const req = { rawBody: null };

      await expect(
        controller.handleStripeWebhook(req as any, mockSignature)
      ).rejects.toThrow(BadRequestException);

      // Verify constructWebhookEvent was never called since rawBody check should fail first
      expect(stripeService.constructWebhookEvent).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when signature verification fails', async () => {
      const req = createMockRequest();
      stripeService.constructWebhookEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      await expect(
        controller.handleStripeWebhook(req as any, mockSignature)
      ).rejects.toThrow('Webhook Error: Invalid signature');
    });

    it('should handle customer.subscription.created event', async () => {
      const mockSubscription = { id: 'sub_123', status: 'active' };
      const mockEvent: Stripe.Event = {
        id: 'evt_123',
        type: 'customer.subscription.created',
        data: { object: mockSubscription },
      } as any;

      const req = createMockRequest();
      stripeService.constructWebhookEvent.mockReturnValue(mockEvent);
      subscriptionService.handleSubscriptionCreated.mockResolvedValue();

      const result = await controller.handleStripeWebhook(req as any, mockSignature);

      expect(result).toEqual({ received: true });
      expect(subscriptionService.handleSubscriptionCreated).toHaveBeenCalledWith(mockSubscription);
    });

    it('should handle customer.subscription.updated event', async () => {
      const mockSubscription = { id: 'sub_123', status: 'active' };
      const mockEvent: Stripe.Event = {
        id: 'evt_123',
        type: 'customer.subscription.updated',
        data: { object: mockSubscription },
      } as any;

      const req = createMockRequest();
      stripeService.constructWebhookEvent.mockReturnValue(mockEvent);
      subscriptionService.handleSubscriptionUpdated.mockResolvedValue();

      const result = await controller.handleStripeWebhook(req as any, mockSignature);

      expect(result).toEqual({ received: true });
      expect(subscriptionService.handleSubscriptionUpdated).toHaveBeenCalledWith(mockSubscription);
    });

    it('should handle customer.subscription.deleted event', async () => {
      const mockSubscription = { id: 'sub_123' };
      const mockEvent: Stripe.Event = {
        id: 'evt_123',
        type: 'customer.subscription.deleted',
        data: { object: mockSubscription },
      } as any;

      const req = createMockRequest();
      stripeService.constructWebhookEvent.mockReturnValue(mockEvent);
      subscriptionService.handleSubscriptionDeleted.mockResolvedValue();

      const result = await controller.handleStripeWebhook(req as any, mockSignature);

      expect(result).toEqual({ received: true });
      expect(subscriptionService.handleSubscriptionDeleted).toHaveBeenCalledWith(mockSubscription);
    });

    it('should handle invoice.paid event', async () => {
      const mockInvoice = { id: 'inv_123', amount_paid: 999 };
      const mockEvent: Stripe.Event = {
        id: 'evt_123',
        type: 'invoice.paid',
        data: { object: mockInvoice },
      } as any;

      const req = createMockRequest();
      stripeService.constructWebhookEvent.mockReturnValue(mockEvent);
      subscriptionService.handleInvoicePaid.mockResolvedValue();

      const result = await controller.handleStripeWebhook(req as any, mockSignature);

      expect(result).toEqual({ received: true });
      expect(subscriptionService.handleInvoicePaid).toHaveBeenCalledWith(mockInvoice);
    });

    it('should handle invoice.payment_failed event', async () => {
      const mockInvoice = { id: 'inv_123', amount_due: 999 };
      const mockEvent: Stripe.Event = {
        id: 'evt_123',
        type: 'invoice.payment_failed',
        data: { object: mockInvoice },
      } as any;

      const req = createMockRequest();
      stripeService.constructWebhookEvent.mockReturnValue(mockEvent);
      subscriptionService.handleInvoicePaymentFailed.mockResolvedValue();

      const result = await controller.handleStripeWebhook(req as any, mockSignature);

      expect(result).toEqual({ received: true });
      expect(subscriptionService.handleInvoicePaymentFailed).toHaveBeenCalledWith(mockInvoice);
    });

    it('should handle invoice.upcoming event', async () => {
      const mockInvoice = { id: 'inv_123', subscription: 'sub_123' };
      const mockEvent: Stripe.Event = {
        id: 'evt_123',
        type: 'invoice.upcoming',
        data: { object: mockInvoice },
      } as any;

      const req = createMockRequest();
      stripeService.constructWebhookEvent.mockReturnValue(mockEvent);

      const result = await controller.handleStripeWebhook(req as any, mockSignature);

      expect(result).toEqual({ received: true });
      // invoice.upcoming doesn't call subscriptionService methods directly
    });

    it('should handle customer.subscription.trial_will_end event', async () => {
      const mockSubscription = { id: 'sub_123', trial_end: Math.floor(Date.now() / 1000) + 3600 };
      const mockEvent: Stripe.Event = {
        id: 'evt_123',
        type: 'customer.subscription.trial_will_end',
        data: { object: mockSubscription },
      } as any;

      const req = createMockRequest();
      stripeService.constructWebhookEvent.mockReturnValue(mockEvent);

      const result = await controller.handleStripeWebhook(req as any, mockSignature);

      expect(result).toEqual({ received: true });
    });

    it('should handle payment_intent.succeeded event', async () => {
      const mockPaymentIntent = { id: 'pi_123' };
      const mockEvent: Stripe.Event = {
        id: 'evt_123',
        type: 'payment_intent.succeeded',
        data: { object: mockPaymentIntent },
      } as any;

      const req = createMockRequest();
      stripeService.constructWebhookEvent.mockReturnValue(mockEvent);

      const result = await controller.handleStripeWebhook(req as any, mockSignature);

      expect(result).toEqual({ received: true });
    });

    it('should handle payment_intent.payment_failed event', async () => {
      const mockPaymentIntent = { id: 'pi_123' };
      const mockEvent: Stripe.Event = {
        id: 'evt_123',
        type: 'payment_intent.payment_failed',
        data: { object: mockPaymentIntent },
      } as any;

      const req = createMockRequest();
      stripeService.constructWebhookEvent.mockReturnValue(mockEvent);

      const result = await controller.handleStripeWebhook(req as any, mockSignature);

      expect(result).toEqual({ received: true });
    });

    it('should handle unrecognized event types gracefully', async () => {
      const mockEvent: Stripe.Event = {
        id: 'evt_123',
        type: 'some.unknown.event' as any,
        data: { object: {} },
      } as any;

      const req = createMockRequest();
      stripeService.constructWebhookEvent.mockReturnValue(mockEvent);

      const result = await controller.handleStripeWebhook(req as any, mockSignature);

      expect(result).toEqual({ received: true });
    });

    it('should return received: true even when handler throws', async () => {
      const mockSubscription = { id: 'sub_123', status: 'active' };
      const mockEvent: Stripe.Event = {
        id: 'evt_123',
        type: 'customer.subscription.created',
        data: { object: mockSubscription },
      } as any;

      const req = createMockRequest();
      stripeService.constructWebhookEvent.mockReturnValue(mockEvent);
      subscriptionService.handleSubscriptionCreated.mockRejectedValue(new Error('Database error'));

      // Should not throw - returns 200 to prevent Stripe from retrying
      const result = await controller.handleStripeWebhook(req as any, mockSignature);

      expect(result).toEqual({ received: true });
    });

    it('should verify signature using stripe service', async () => {
      const mockEvent: Stripe.Event = {
        id: 'evt_123',
        type: 'checkout.session.completed',
        data: { object: {} },
      } as any;

      const req = createMockRequest();
      stripeService.constructWebhookEvent.mockReturnValue(mockEvent);

      await controller.handleStripeWebhook(req as any, mockSignature);

      expect(stripeService.constructWebhookEvent).toHaveBeenCalledWith(
        mockRawBody,
        mockSignature
      );
    });
  });
});
