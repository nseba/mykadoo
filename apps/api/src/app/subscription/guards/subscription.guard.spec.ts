/**
 * @jest-environment node
 */
import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
import { SubscriptionGuard } from './subscription.guard';
import { SubscriptionService } from '../subscription.service';
import { REQUIRED_PLAN_KEY } from '../decorators/require-plan.decorator';

describe('SubscriptionGuard', () => {
  let guard: SubscriptionGuard;
  let reflector: jest.Mocked<Reflector>;
  let subscriptionService: jest.Mocked<SubscriptionService>;

  const mockUserId = 'user-123';

  const createMockSubscription = (plan: SubscriptionPlan) => ({
    id: 'sub-123',
    userId: mockUserId,
    plan,
    status: SubscriptionStatus.ACTIVE,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    stripePriceId: null,
    billingInterval: null,
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(),
    trialStart: null,
    trialEnd: null,
    cancelAtPeriodEnd: false,
    canceledAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const createMockExecutionContext = (
    user: { id: string } | null = { id: mockUserId }
  ): ExecutionContext => {
    const mockRequest = { user, subscription: undefined };
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    const mockReflector = {
      getAllAndOverride: jest.fn(),
    };

    const mockSubscriptionService = {
      getOrCreateSubscription: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionGuard,
        { provide: Reflector, useValue: mockReflector },
        { provide: SubscriptionService, useValue: mockSubscriptionService },
      ],
    }).compile();

    guard = module.get<SubscriptionGuard>(SubscriptionGuard);
    reflector = module.get(Reflector);
    subscriptionService = module.get(SubscriptionService);
  });

  describe('canActivate', () => {
    it('should return true when no plan is required', async () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);
      const context = createMockExecutionContext();

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(subscriptionService.getOrCreateSubscription).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user is not authenticated', async () => {
      reflector.getAllAndOverride.mockReturnValue(SubscriptionPlan.GOLD);
      const context = createMockExecutionContext(null);

      await expect(guard.canActivate(context)).rejects.toThrow(
        new ForbiddenException('Authentication required')
      );
    });

    it('should throw ForbiddenException when user id is missing', async () => {
      reflector.getAllAndOverride.mockReturnValue(SubscriptionPlan.GOLD);
      const context = createMockExecutionContext({ id: '' } as any);

      await expect(guard.canActivate(context)).rejects.toThrow(
        new ForbiddenException('Authentication required')
      );
    });

    describe('Plan hierarchy checks', () => {
      it('should allow FREE user to access FREE features', async () => {
        reflector.getAllAndOverride.mockReturnValue(SubscriptionPlan.FREE);
        subscriptionService.getOrCreateSubscription.mockResolvedValue(
          createMockSubscription(SubscriptionPlan.FREE)
        );
        const context = createMockExecutionContext();

        const result = await guard.canActivate(context);

        expect(result).toBe(true);
      });

      it('should deny FREE user from GOLD features', async () => {
        reflector.getAllAndOverride.mockReturnValue(SubscriptionPlan.GOLD);
        subscriptionService.getOrCreateSubscription.mockResolvedValue(
          createMockSubscription(SubscriptionPlan.FREE)
        );
        const context = createMockExecutionContext();

        await expect(guard.canActivate(context)).rejects.toThrow(
          new ForbiddenException(
            'This feature requires a GOLD subscription or higher. Your current plan is FREE.'
          )
        );
      });

      it('should deny FREE user from PLATINUM features', async () => {
        reflector.getAllAndOverride.mockReturnValue(SubscriptionPlan.PLATINUM);
        subscriptionService.getOrCreateSubscription.mockResolvedValue(
          createMockSubscription(SubscriptionPlan.FREE)
        );
        const context = createMockExecutionContext();

        await expect(guard.canActivate(context)).rejects.toThrow(
          new ForbiddenException(
            'This feature requires a PLATINUM subscription or higher. Your current plan is FREE.'
          )
        );
      });

      it('should allow GOLD user to access FREE features', async () => {
        reflector.getAllAndOverride.mockReturnValue(SubscriptionPlan.FREE);
        subscriptionService.getOrCreateSubscription.mockResolvedValue(
          createMockSubscription(SubscriptionPlan.GOLD)
        );
        const context = createMockExecutionContext();

        const result = await guard.canActivate(context);

        expect(result).toBe(true);
      });

      it('should allow GOLD user to access GOLD features', async () => {
        reflector.getAllAndOverride.mockReturnValue(SubscriptionPlan.GOLD);
        subscriptionService.getOrCreateSubscription.mockResolvedValue(
          createMockSubscription(SubscriptionPlan.GOLD)
        );
        const context = createMockExecutionContext();

        const result = await guard.canActivate(context);

        expect(result).toBe(true);
      });

      it('should deny GOLD user from PLATINUM features', async () => {
        reflector.getAllAndOverride.mockReturnValue(SubscriptionPlan.PLATINUM);
        subscriptionService.getOrCreateSubscription.mockResolvedValue(
          createMockSubscription(SubscriptionPlan.GOLD)
        );
        const context = createMockExecutionContext();

        await expect(guard.canActivate(context)).rejects.toThrow(
          new ForbiddenException(
            'This feature requires a PLATINUM subscription or higher. Your current plan is GOLD.'
          )
        );
      });

      it('should allow PLATINUM user to access FREE features', async () => {
        reflector.getAllAndOverride.mockReturnValue(SubscriptionPlan.FREE);
        subscriptionService.getOrCreateSubscription.mockResolvedValue(
          createMockSubscription(SubscriptionPlan.PLATINUM)
        );
        const context = createMockExecutionContext();

        const result = await guard.canActivate(context);

        expect(result).toBe(true);
      });

      it('should allow PLATINUM user to access GOLD features', async () => {
        reflector.getAllAndOverride.mockReturnValue(SubscriptionPlan.GOLD);
        subscriptionService.getOrCreateSubscription.mockResolvedValue(
          createMockSubscription(SubscriptionPlan.PLATINUM)
        );
        const context = createMockExecutionContext();

        const result = await guard.canActivate(context);

        expect(result).toBe(true);
      });

      it('should allow PLATINUM user to access PLATINUM features', async () => {
        reflector.getAllAndOverride.mockReturnValue(SubscriptionPlan.PLATINUM);
        subscriptionService.getOrCreateSubscription.mockResolvedValue(
          createMockSubscription(SubscriptionPlan.PLATINUM)
        );
        const context = createMockExecutionContext();

        const result = await guard.canActivate(context);

        expect(result).toBe(true);
      });
    });

    it('should attach subscription to request', async () => {
      reflector.getAllAndOverride.mockReturnValue(SubscriptionPlan.FREE);
      const mockSubscription = createMockSubscription(SubscriptionPlan.GOLD);
      subscriptionService.getOrCreateSubscription.mockResolvedValue(mockSubscription);

      const mockRequest = { user: { id: mockUserId }, subscription: undefined };
      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
        }),
      } as unknown as ExecutionContext;

      await guard.canActivate(context);

      expect(mockRequest.subscription).toEqual(mockSubscription);
    });

    it('should use reflector to get required plan from handler and class', async () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);
      const context = createMockExecutionContext();

      await guard.canActivate(context);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
        REQUIRED_PLAN_KEY,
        [context.getHandler(), context.getClass()]
      );
    });

    it('should call subscriptionService with correct userId', async () => {
      reflector.getAllAndOverride.mockReturnValue(SubscriptionPlan.FREE);
      subscriptionService.getOrCreateSubscription.mockResolvedValue(
        createMockSubscription(SubscriptionPlan.FREE)
      );
      const context = createMockExecutionContext();

      await guard.canActivate(context);

      expect(subscriptionService.getOrCreateSubscription).toHaveBeenCalledWith(mockUserId);
    });
  });
});
