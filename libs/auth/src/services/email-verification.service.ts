/**
 * Email Verification Service
 *
 * Handles email verification token generation, verification, and resending
 */

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { randomBytes, createHash } from 'crypto';

export interface EmailVerificationToken {
  token: string;
  hashedToken: string;
  expiresAt: Date;
}

@Injectable()
export class EmailVerificationService {
  private readonly prisma: PrismaClient;

  // Configuration (can be moved to ConfigService)
  private readonly TOKEN_EXPIRY_HOURS = 24; // 24 hour expiry
  private readonly TOKEN_LENGTH = 32; // 32 bytes = 64 hex characters

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Generate email verification token for a user
   * Returns the plain token to be sent via email
   */
  async generateVerificationToken(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    // Generate verification token
    const { token, hashedToken, expiresAt } = this.generateToken();

    // Invalidate any existing verification tokens for this user
    await this.prisma.emailVerificationToken.deleteMany({
      where: { userId },
    });

    // Store hashed token
    await this.prisma.emailVerificationToken.create({
      data: {
        userId,
        token: hashedToken,
        expiresAt,
      },
    });

    // Create user event for audit
    await this.prisma.userEvent.create({
      data: {
        userId,
        eventType: 'verification_email_sent',
        eventData: {
          email: user.email,
          timestamp: new Date().toISOString(),
        },
      },
    });

    return token;
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<{ userId: string; email: string }> {
    const hashedToken = this.hashToken(token);

    // Find valid token
    const verificationToken = await this.prisma.emailVerificationToken.findFirst({
      where: {
        token: hashedToken,
        expiresAt: {
          gte: new Date(),
        },
        used: false,
      },
      include: {
        user: true,
      },
    });

    if (!verificationToken) {
      throw new UnauthorizedException('Invalid or expired verification token');
    }

    // Check if email already verified
    if (verificationToken.user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    // Mark email as verified
    await this.prisma.user.update({
      where: { id: verificationToken.userId },
      data: {
        emailVerified: new Date(),
      },
    });

    // Mark token as used
    await this.prisma.emailVerificationToken.update({
      where: { id: verificationToken.id },
      data: {
        used: true,
      },
    });

    // Create user event for audit
    await this.prisma.userEvent.create({
      data: {
        userId: verificationToken.userId,
        eventType: 'email_verified',
        eventData: {
          email: verificationToken.user.email,
          timestamp: new Date().toISOString(),
        },
      },
    });

    return {
      userId: verificationToken.userId,
      email: verificationToken.user.email,
    };
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<string> {
    const normalizedEmail = email.toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // For security, always return success even if user not found
    // This prevents email enumeration attacks
    if (!user) {
      // Generate a fake token to maintain consistent timing
      this.generateToken();
      return 'fake-token-for-timing';
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    if (user.status !== 'ACTIVE') {
      throw new BadRequestException('Account is not active');
    }

    // Check rate limiting - ensure user hasn't requested too many times
    const recentTokens = await this.prisma.emailVerificationToken.findMany({
      where: {
        userId: user.id,
        createdAt: {
          gte: new Date(Date.now() - 15 * 60 * 1000), // Last 15 minutes
        },
      },
    });

    if (recentTokens.length >= 3) {
      throw new BadRequestException(
        'Too many verification emails requested. Please wait 15 minutes before trying again.'
      );
    }

    // Generate new token
    return this.generateVerificationToken(user.id);
  }

  /**
   * Check if email is verified
   */
  async isEmailVerified(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    return !!user?.emailVerified;
  }

  /**
   * Clean up expired tokens (should be run periodically)
   */
  async cleanupExpiredTokens(): Promise<number> {
    const result = await this.prisma.emailVerificationToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return result.count;
  }

  /**
   * Generate a secure random token
   */
  private generateToken(): EmailVerificationToken {
    // Generate random token
    const token = randomBytes(this.TOKEN_LENGTH).toString('hex');

    // Hash token for storage
    const hashedToken = this.hashToken(token);

    // Calculate expiry
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.TOKEN_EXPIRY_HOURS);

    return {
      token,
      hashedToken,
      expiresAt,
    };
  }

  /**
   * Hash token using SHA-256
   */
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  /**
   * Clean up Prisma connection
   */
  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
