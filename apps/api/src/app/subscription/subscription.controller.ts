import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SubscriptionService, PLAN_LIMITS } from './subscription.service';
import {
  CreateCheckoutSessionDto,
  CreateBillingPortalDto,
  UpgradeSubscriptionDto,
  DowngradeSubscriptionDto,
  CancelSubscriptionDto,
  ApplyPromoCodeDto,
  SubscriptionResponseDto,
  SubscriptionWithUsageResponseDto,
  CheckoutSessionResponseDto,
  BillingPortalResponseDto,
  PaymentResponseDto,
  PlanComparisonDto,
  PlanType,
  PromoCodeValidationResponseDto,
  CurrentUsageResponseDto,
} from './dto/subscription.dto';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('plans')
  @ApiOperation({ summary: 'Get available subscription plans' })
  @ApiResponse({ status: 200, type: [PlanComparisonDto] })
  getPlans(): PlanComparisonDto[] {
    return [
      {
        plan: PlanType.FREE,
        name: 'Free',
        description: 'Get started with basic gift searching',
        monthlyPrice: 0,
        yearlyPrice: 0,
        features: [
          '5 AI gift searches per month',
          '3 recipient profiles',
          'Basic recommendations',
          'Access to gift guides',
          'Email support',
        ],
        limits: PLAN_LIMITS.FREE,
      },
      {
        plan: PlanType.GOLD,
        name: 'Gold',
        description: 'Enhanced features for regular gift-givers',
        monthlyPrice: 999,
        yearlyPrice: 9900,
        features: [
          '50 AI gift searches per month',
          '10 recipient profiles',
          'Advanced recommendations',
          '5 shareable wishlists',
          'Gift occasion reminders',
          'Priority email support',
          'No ads',
          'Export to PDF',
        ],
        limits: PLAN_LIMITS.GOLD,
      },
      {
        plan: PlanType.PLATINUM,
        name: 'Platinum',
        description: 'Unlimited access for power users & families',
        monthlyPrice: 1999,
        yearlyPrice: 19900,
        features: [
          'Unlimited AI gift searches',
          'Unlimited recipient profiles',
          'Premium recommendations',
          'Unlimited shareable wishlists',
          'Advanced gift calendar',
          'AI chat assistance',
          'Family sharing (5 members)',
          'Priority phone & email support',
          'No ads',
          'Early access to features',
          'Exclusive partner discounts',
        ],
        limits: PLAN_LIMITS.PLATINUM,
      },
    ];
  }

  @Get('current')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current subscription with usage' })
  @ApiResponse({ status: 200, type: SubscriptionWithUsageResponseDto })
  async getCurrentSubscription(
    @CurrentUser() user: { id: string }
  ): Promise<SubscriptionWithUsageResponseDto> {
    const subscription = await this.subscriptionService.getSubscriptionWithUsage(user.id);
    return {
      id: subscription.id,
      plan: subscription.plan as PlanType,
      status: subscription.status,
      billingInterval: subscription.billingInterval as any,
      currentPeriodStart: subscription.currentPeriodStart || undefined,
      currentPeriodEnd: subscription.currentPeriodEnd || undefined,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      canceledAt: subscription.canceledAt || undefined,
      trialEnd: subscription.trialEnd || undefined,
      createdAt: subscription.createdAt,
      usage: subscription.usage,
      limits: subscription.limits,
    };
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a checkout session for subscription' })
  @ApiResponse({ status: 201, type: CheckoutSessionResponseDto })
  async createCheckoutSession(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateCheckoutSessionDto
  ): Promise<CheckoutSessionResponseDto> {
    return this.subscriptionService.createCheckoutSession(
      user.id,
      dto.plan,
      dto.interval,
      dto.successUrl,
      dto.cancelUrl,
      dto.promoCode
    );
  }

  @Post('portal')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a billing portal session' })
  @ApiResponse({ status: 201, type: BillingPortalResponseDto })
  async createBillingPortal(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateBillingPortalDto
  ): Promise<BillingPortalResponseDto> {
    return this.subscriptionService.createBillingPortalSession(user.id, dto.returnUrl);
  }

  @Patch('upgrade')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upgrade subscription to higher tier' })
  @ApiResponse({ status: 200, type: SubscriptionResponseDto })
  async upgradeSubscription(
    @CurrentUser() user: { id: string },
    @Body() dto: UpgradeSubscriptionDto
  ): Promise<SubscriptionResponseDto> {
    const subscription = await this.subscriptionService.upgradeSubscription(
      user.id,
      dto.plan,
      dto.interval
    );
    return {
      id: subscription.id,
      plan: subscription.plan as PlanType,
      status: subscription.status,
      billingInterval: subscription.billingInterval as any,
      currentPeriodStart: subscription.currentPeriodStart || undefined,
      currentPeriodEnd: subscription.currentPeriodEnd || undefined,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      canceledAt: subscription.canceledAt || undefined,
      createdAt: subscription.createdAt,
    };
  }

  @Patch('downgrade')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Downgrade subscription to lower tier' })
  @ApiResponse({ status: 200, type: SubscriptionResponseDto })
  async downgradeSubscription(
    @CurrentUser() user: { id: string },
    @Body() dto: DowngradeSubscriptionDto
  ): Promise<SubscriptionResponseDto> {
    const subscription = await this.subscriptionService.downgradeSubscription(
      user.id,
      dto.plan,
      dto.interval
    );
    return {
      id: subscription.id,
      plan: subscription.plan as PlanType,
      status: subscription.status,
      billingInterval: subscription.billingInterval as any,
      currentPeriodStart: subscription.currentPeriodStart || undefined,
      currentPeriodEnd: subscription.currentPeriodEnd || undefined,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      canceledAt: subscription.canceledAt || undefined,
      createdAt: subscription.createdAt,
    };
  }

  @Post('cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel subscription' })
  @ApiResponse({ status: 200, type: SubscriptionResponseDto })
  async cancelSubscription(
    @CurrentUser() user: { id: string },
    @Body() dto: CancelSubscriptionDto
  ): Promise<SubscriptionResponseDto> {
    const subscription = await this.subscriptionService.cancelSubscription(
      user.id,
      dto.immediately
    );
    return {
      id: subscription.id,
      plan: subscription.plan as PlanType,
      status: subscription.status,
      billingInterval: subscription.billingInterval as any,
      currentPeriodStart: subscription.currentPeriodStart || undefined,
      currentPeriodEnd: subscription.currentPeriodEnd || undefined,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      canceledAt: subscription.canceledAt || undefined,
      createdAt: subscription.createdAt,
    };
  }

  @Post('reactivate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reactivate canceled subscription' })
  @ApiResponse({ status: 200, type: SubscriptionResponseDto })
  async reactivateSubscription(
    @CurrentUser() user: { id: string }
  ): Promise<SubscriptionResponseDto> {
    const subscription = await this.subscriptionService.reactivateSubscription(user.id);
    return {
      id: subscription.id,
      plan: subscription.plan as PlanType,
      status: subscription.status,
      billingInterval: subscription.billingInterval as any,
      currentPeriodStart: subscription.currentPeriodStart || undefined,
      currentPeriodEnd: subscription.currentPeriodEnd || undefined,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      canceledAt: subscription.canceledAt || undefined,
      createdAt: subscription.createdAt,
    };
  }

  @Get('invoices')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment/invoice history' })
  @ApiResponse({ status: 200, type: [PaymentResponseDto] })
  async getInvoices(
    @CurrentUser() user: { id: string },
    @Query('limit') limit?: number
  ): Promise<PaymentResponseDto[]> {
    const payments = await this.subscriptionService.getInvoices(user.id, limit || 10);
    return payments.map((payment) => ({
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      description: payment.description || undefined,
      invoiceUrl: payment.invoiceUrl || undefined,
      invoicePdf: payment.invoicePdf || undefined,
      paidAt: payment.paidAt || undefined,
      createdAt: payment.createdAt,
    }));
  }

  @Post('promo/validate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate a promo code' })
  @ApiResponse({ status: 200, type: PromoCodeValidationResponseDto })
  async validatePromoCode(
    @Body() dto: ApplyPromoCodeDto
  ): Promise<PromoCodeValidationResponseDto> {
    return this.subscriptionService.validatePromoCode(dto.code);
  }

  @Get('usage')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current usage statistics' })
  @ApiResponse({ status: 200, type: CurrentUsageResponseDto })
  async getCurrentUsage(
    @CurrentUser() user: { id: string }
  ): Promise<CurrentUsageResponseDto> {
    return this.subscriptionService.getCurrentUsage(user.id);
  }
}
