/**
 * Account Lockout Service
 *
 * Handles account lockout logic based on failed login attempts
 */

import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export interface LockoutStatus {
  isLocked: boolean;
  remainingAttempts: number;
  lockoutExpiresAt?: Date;
  nextAttemptAllowedAt?: Date;
}

@Injectable()
export class AccountLockoutService {
  private readonly prisma: PrismaClient;

  // Configuration (can be moved to ConfigService)
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION_MINUTES = 15;
  private readonly ATTEMPT_WINDOW_MINUTES = 15;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Check if account is locked
   */
  async checkLockout(email: string): Promise<LockoutStatus> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return {
        isLocked: false,
        remainingAttempts: this.MAX_ATTEMPTS,
      };
    }

    // Check recent failed login attempts
    const recentAttempts = await this.getRecentFailedAttempts(email);

    // If user has max attempts, check if lockout period has expired
    if (recentAttempts.length >= this.MAX_ATTEMPTS) {
      const oldestAttempt = recentAttempts[recentAttempts.length - 1];
      const lockoutExpiresAt = new Date(
        oldestAttempt.createdAt.getTime() + this.LOCKOUT_DURATION_MINUTES * 60 * 1000
      );

      if (new Date() < lockoutExpiresAt) {
        // Still locked out
        return {
          isLocked: true,
          remainingAttempts: 0,
          lockoutExpiresAt,
          nextAttemptAllowedAt: lockoutExpiresAt,
        };
      } else {
        // Lockout expired, clear old attempts
        await this.clearFailedAttempts(email);
        return {
          isLocked: false,
          remainingAttempts: this.MAX_ATTEMPTS,
        };
      }
    }

    return {
      isLocked: false,
      remainingAttempts: this.MAX_ATTEMPTS - recentAttempts.length,
    };
  }

  /**
   * Record a failed login attempt
   */
  async recordFailedAttempt(email: string, ipAddress?: string): Promise<LockoutStatus> {
    // Create user event for tracking
    await this.prisma.userEvent.create({
      data: {
        userId: null, // Anonymous since login failed
        eventType: 'failed_login',
        eventData: {
          email: email.toLowerCase(),
          ipAddress,
          timestamp: new Date().toISOString(),
        },
      },
    });

    return this.checkLockout(email);
  }

  /**
   * Record a successful login (clears failed attempts)
   */
  async recordSuccessfulLogin(email: string, ipAddress?: string): Promise<void> {
    // Clear failed login attempts
    await this.clearFailedAttempts(email);

    // Record successful login event
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (user) {
      await this.prisma.userEvent.create({
        data: {
          userId: user.id,
          eventType: 'successful_login',
          eventData: {
            ipAddress,
            timestamp: new Date().toISOString(),
          },
        },
      });
    }
  }

  /**
   * Get recent failed login attempts within the attempt window
   */
  private async getRecentFailedAttempts(email: string): Promise<any[]> {
    const windowStart = new Date(Date.now() - this.ATTEMPT_WINDOW_MINUTES * 60 * 1000);

    const attempts = await this.prisma.userEvent.findMany({
      where: {
        eventType: 'failed_login',
        eventData: {
          path: ['email'],
          equals: email.toLowerCase(),
        },
        createdAt: {
          gte: windowStart,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: this.MAX_ATTEMPTS,
    });

    return attempts;
  }

  /**
   * Clear failed login attempts for an email
   */
  private async clearFailedAttempts(email: string): Promise<void> {
    const windowStart = new Date(Date.now() - this.ATTEMPT_WINDOW_MINUTES * 60 * 1000);

    await this.prisma.userEvent.deleteMany({
      where: {
        eventType: 'failed_login',
        eventData: {
          path: ['email'],
          equals: email.toLowerCase(),
        },
        createdAt: {
          gte: windowStart,
        },
      },
    });
  }

  /**
   * Manually unlock an account (admin function)
   */
  async unlockAccount(email: string): Promise<void> {
    await this.clearFailedAttempts(email);
  }

  /**
   * Get lockout statistics for monitoring
   */
  async getLockoutStats(): Promise<{
    totalLockedAccounts: number;
    recentFailedAttempts: number;
  }> {
    const windowStart = new Date(Date.now() - this.ATTEMPT_WINDOW_MINUTES * 60 * 1000);

    const recentFailedAttempts = await this.prisma.userEvent.count({
      where: {
        eventType: 'failed_login',
        createdAt: {
          gte: windowStart,
        },
      },
    });

    // Count unique emails with max attempts
    const failedAttempts = await this.prisma.userEvent.findMany({
      where: {
        eventType: 'failed_login',
        createdAt: {
          gte: windowStart,
        },
      },
      select: {
        eventData: true,
      },
    });

    const emailCounts = new Map<string, number>();
    failedAttempts.forEach((attempt) => {
      const email = (attempt.eventData as any).email;
      emailCounts.set(email, (emailCounts.get(email) || 0) + 1);
    });

    const totalLockedAccounts = Array.from(emailCounts.values()).filter(
      (count) => count >= this.MAX_ATTEMPTS
    ).length;

    return {
      totalLockedAccounts,
      recentFailedAttempts,
    };
  }

  /**
   * Clean up Prisma connection
   */
  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
