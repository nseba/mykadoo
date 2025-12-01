/**
 * OAuth Service
 *
 * Handles OAuth authentication logic for Google and Facebook
 */

import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { JwtTokenService } from './jwt.service';
import { AuthResponseDto, UserInfoDto } from '../dto/auth-response.dto';
import { UserRole } from '../types/jwt.types';
import { GoogleProfile } from '../strategies/google.strategy';
import { FacebookProfile } from '../strategies/facebook.strategy';

type OAuthProfile = GoogleProfile | FacebookProfile;

@Injectable()
export class OAuthService {
  private readonly prisma: PrismaClient;

  constructor(private readonly jwtTokenService: JwtTokenService) {
    this.prisma = new PrismaClient();
  }

  /**
   * Handle OAuth authentication (Google or Facebook)
   */
  async handleOAuthLogin(
    profile: OAuthProfile,
    provider: 'google' | 'facebook'
  ): Promise<AuthResponseDto> {
    const normalizedEmail = profile.email.toLowerCase();

    // Check if account already exists for this provider
    const existingAccount = await this.prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId: profile.id,
        },
      },
      include: {
        user: true,
      },
    });

    if (existingAccount) {
      // User already connected with this OAuth provider
      return this.generateAuthResponse(existingAccount.user);
    }

    // Check if user exists with this email
    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      // Link OAuth account to existing user
      await this.linkOAuthAccount(existingUser.id, profile, provider);

      // If OAuth email is verified and user email isn't, mark as verified
      if ('emailVerified' in profile && profile.emailVerified && !existingUser.emailVerified) {
        await this.prisma.user.update({
          where: { id: existingUser.id },
          data: { emailVerified: new Date() },
        });
      }

      return this.generateAuthResponse(existingUser);
    }

    // Create new user with OAuth account
    const newUser = await this.createOAuthUser(profile, provider);
    return this.generateAuthResponse(newUser);
  }

  /**
   * Link OAuth account to existing user
   */
  private async linkOAuthAccount(
    userId: string,
    profile: OAuthProfile,
    provider: 'google' | 'facebook'
  ): Promise<void> {
    await this.prisma.account.create({
      data: {
        userId,
        type: 'oauth',
        provider,
        providerAccountId: profile.id,
      },
    });

    // Create user event for audit
    await this.prisma.userEvent.create({
      data: {
        userId,
        eventType: 'oauth_account_linked',
        eventData: {
          provider,
          timestamp: new Date().toISOString(),
        },
      },
    });
  }

  /**
   * Create new user from OAuth profile
   */
  private async createOAuthUser(
    profile: OAuthProfile,
    provider: 'google' | 'facebook'
  ): Promise<any> {
    const normalizedEmail = profile.email.toLowerCase();

    // Create user and OAuth account in a transaction
    const user = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        name: profile.name,
        avatar: profile.avatar,
        role: UserRole.FREE,
        status: 'ACTIVE',
        emailVerified:
          'emailVerified' in profile && profile.emailVerified ? new Date() : null,
        accounts: {
          create: {
            type: 'oauth',
            provider,
            providerAccountId: profile.id,
          },
        },
      },
    });

    // Create user event for audit
    await this.prisma.userEvent.create({
      data: {
        userId: user.id,
        eventType: 'user_registered_oauth',
        eventData: {
          provider,
          email: normalizedEmail,
          timestamp: new Date().toISOString(),
        },
      },
    });

    return user;
  }

  /**
   * Generate authentication response with tokens
   */
  private async generateAuthResponse(user: any): Promise<AuthResponseDto> {
    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const tokens = await this.jwtTokenService.generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
    });

    // Map user to response
    const userInfo: UserInfoDto = {
      id: user.id,
      email: user.email,
      name: user.name || undefined,
      avatar: user.avatar || undefined,
      role: user.role as UserRole,
      emailVerified: !!user.emailVerified,
      createdAt: user.createdAt,
    };

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: userInfo,
    };
  }

  /**
   * Clean up Prisma connection
   */
  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
