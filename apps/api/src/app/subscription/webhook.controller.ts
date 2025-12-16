import {
  Controller,
  Post,
  Headers,
  Req,
  RawBodyRequest,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { Request } from 'express';
import Stripe from 'stripe';
import { StripeService } from './stripe.service';
import { SubscriptionService } from './subscription.service';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly subscriptionService: SubscriptionService
  ) {}

  @Post('stripe')
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string
  ): Promise<{ received: boolean }> {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    let event: Stripe.Event;

    try {
      const rawBody = req.rawBody;
      if (!rawBody) {
        throw new BadRequestException('Missing raw body');
      }
      event = this.stripeService.constructWebhookEvent(rawBody, signature);
    } catch (err) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    this.logger.log(`Received Stripe event: ${event.type} (${event.id})`);

    try {
      switch (event.type) {
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        case 'invoice.paid':
          await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
          break;

        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        case 'invoice.upcoming':
          await this.handleInvoiceUpcoming(event.data.object as Stripe.Invoice);
          break;

        case 'customer.subscription.trial_will_end':
          await this.handleTrialWillEnd(event.data.object as Stripe.Subscription);
          break;

        case 'payment_intent.succeeded':
          this.logger.log(`Payment intent succeeded: ${(event.data.object as Stripe.PaymentIntent).id}`);
          break;

        case 'payment_intent.payment_failed':
          this.logger.warn(`Payment intent failed: ${(event.data.object as Stripe.PaymentIntent).id}`);
          break;

        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
      }
    } catch (err) {
      this.logger.error(`Error handling webhook ${event.type}: ${err.message}`, err.stack);
      // Don't throw - return 200 to prevent Stripe from retrying
    }

    return { received: true };
  }

  private async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
    this.logger.log(`Subscription created: ${subscription.id}`);
    await this.subscriptionService.handleSubscriptionCreated(subscription);
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    this.logger.log(`Subscription updated: ${subscription.id}, status: ${subscription.status}`);
    await this.subscriptionService.handleSubscriptionUpdated(subscription);
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    this.logger.log(`Subscription deleted: ${subscription.id}`);
    await this.subscriptionService.handleSubscriptionDeleted(subscription);
  }

  private async handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    this.logger.log(`Invoice paid: ${invoice.id}, amount: ${invoice.amount_paid}`);
    await this.subscriptionService.handleInvoicePaid(invoice);
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    this.logger.warn(`Invoice payment failed: ${invoice.id}`);
    await this.subscriptionService.handleInvoicePaymentFailed(invoice);
    // TODO: Send dunning email to customer
  }

  private async handleInvoiceUpcoming(invoice: Stripe.Invoice): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const inv = invoice as any;
    this.logger.log(`Upcoming invoice for subscription: ${inv.subscription}`);
    // TODO: Send reminder email to customer about upcoming charge
  }

  private async handleTrialWillEnd(subscription: Stripe.Subscription): Promise<void> {
    this.logger.log(`Trial ending soon for subscription: ${subscription.id}`);
    // TODO: Send email to customer about trial ending
  }
}
