/**
 * Password Reset Service
 *
 * Handles password reset token generation, verification, and password updates
 */

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { randomBytes, createHash } from 'crypto';
import { hashPassword, validatePasswordStrength } from '../utils/password.util';

export interface PasswordResetToken {
  token: string;
  hashedToken: string;
  expiresAt: Date;
}

@Injectable()
export class PasswordResetService {
  private readonly prisma: PrismaClient;

  // Configuration (can be moved to ConfigService)
  private readonly TOKEN_EXPIRY_HOURS = 1; // 1 hour expiry
  private readonly TOKEN_LENGTH = 32; // 32 bytes = 64 hex characters

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Request password reset - generates token and stores it
   * Returns the plain token to be sent via email
   */
  async requestPasswordReset(email: string): Promise<string> {
    const normalizedEmail = email.toLowerCase();

    // Find user
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

    // Check user status
    if (user.status !== 'ACTIVE') {
      throw new BadRequestException('Account is not active');
    }

    // Generate reset token
    const { token, hashedToken, expiresAt } = this.generateToken();

    // Invalidate any existing reset tokens for this user
    await this.prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Store hashed token
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expiresAt,
      },
    });

    // Create user event for audit
    await this.prisma.userEvent.create({
      data: {
        userId: user.id,
        eventType: 'password_reset_requested',
        eventData: {
          email: normalizedEmail,
          timestamp: new Date().toISOString(),
        },
      },
    });

    // Return plain token to be sent via email
    return token;
  }

  /**
   * Verify password reset token
   */
  async verifyResetToken(token: string): Promise<{ userId: string; email: string }> {
    const hashedToken = this.hashToken(token);

    // Find valid token
    const resetToken = await this.prisma.passwordResetToken.findFirst({
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

    if (!resetToken) {
      throw new UnauthorizedException('Invalid or expired password reset token');
    }

    return {
      userId: resetToken.userId,
      email: resetToken.user.email,
    };
  }

  /**
   * Reset password using token
   */
  async resetPassword(token: string, newPassword: string, confirmPassword: string): Promise<void> {
    // Validate passwords match
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      throw new BadRequestException({
        message: 'Password does not meet requirements',
        errors: passwordValidation.errors,
      });
    }

    // Verify token and get user
    const { userId, email } = await this.verifyResetToken(token);

    // Get user to check current password
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Mark token as used
    const hashedToken = this.hashToken(token);
    await this.prisma.passwordResetToken.updateMany({
      where: {
        token: hashedToken,
        userId,
      },
      data: {
        used: true,
      },
    });

    // Create user event for audit
    await this.prisma.userEvent.create({
      data: {
        userId,
        eventType: 'password_reset_completed',
        eventData: {
          email,
          timestamp: new Date().toISOString(),
        },
      },
    });
  }

  /**
   * Clean up expired tokens (should be run periodically)
   */
  async cleanupExpiredTokens(): Promise<number> {
    const result = await this.prisma.passwordResetToken.deleteMany({
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
  private generateToken(): PasswordResetToken {
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
