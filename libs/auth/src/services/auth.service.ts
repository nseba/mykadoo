/**
 * Auth Service
 *
 * Business logic for authentication operations
 */

import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { JwtTokenService } from './jwt.service';
import { AccountLockoutService } from './account-lockout.service';
import { EmailVerificationService } from './email-verification.service';
import { hashPassword, comparePasswords, validatePasswordStrength } from '../utils/password.util';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto, UserInfoDto } from '../dto/auth-response.dto';
import { UserRole } from '../types/jwt.types';

@Injectable()
export class AuthService {
  private readonly prisma: PrismaClient;

  constructor(
    private readonly jwtTokenService: JwtTokenService,
    private readonly accountLockoutService: AccountLockoutService,
    private readonly emailVerificationService: EmailVerificationService
  ) {
    this.prisma = new PrismaClient();
  }

  /**
   * Register a new user
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, name } = registerDto;

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      throw new BadRequestException({
        message: 'Password does not meet requirements',
        errors: passwordValidation.errors,
      });
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name || null,
        role: UserRole.FREE,
        status: 'ACTIVE',
      },
    });

    // Generate email verification token
    const verificationToken = await this.emailVerificationService.generateVerificationToken(user.id);

    // TODO: Send verification email
    // For now, we'll just log it (in production, this would be sent via email)
    // Example verification link: https://mykadoo.com/verify-email?token={verificationToken}

    // Generate tokens
    const tokens = await this.jwtTokenService.generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
    });

    // Return response
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.mapUserToUserInfo(user),
    };
  }

  /**
   * Login existing user
   */
  async login(loginDto: LoginDto, ipAddress?: string): Promise<AuthResponseDto> {
    const { email, password } = loginDto;
    const normalizedEmail = email.toLowerCase();

    // Check if account is locked
    const lockoutStatus = await this.accountLockoutService.checkLockout(normalizedEmail);

    if (lockoutStatus.isLocked) {
      const minutesRemaining = Math.ceil(
        (lockoutStatus.lockoutExpiresAt!.getTime() - Date.now()) / 1000 / 60
      );
      throw new UnauthorizedException(
        `Account is locked due to too many failed login attempts. Please try again in ${minutesRemaining} minutes.`
      );
    }

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Record failed attempt for non-existent user (to prevent enumeration attacks)
      await this.accountLockoutService.recordFailedAttempt(normalizedEmail, ipAddress);
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check user status
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active');
    }

    // Verify password
    if (!user.password) {
      await this.accountLockoutService.recordFailedAttempt(normalizedEmail, ipAddress);
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await comparePasswords(password, user.password);

    if (!isPasswordValid) {
      // Record failed attempt
      const updatedLockoutStatus = await this.accountLockoutService.recordFailedAttempt(
        normalizedEmail,
        ipAddress
      );

      if (updatedLockoutStatus.isLocked) {
        throw new UnauthorizedException(
          'Too many failed login attempts. Account is now locked for 15 minutes.'
        );
      }

      throw new UnauthorizedException(
        `Invalid email or password. ${updatedLockoutStatus.remainingAttempts} attempts remaining before account lockout.`
      );
    }

    // Record successful login and clear failed attempts
    await this.accountLockoutService.recordSuccessfulLogin(normalizedEmail, ipAddress);

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

    // Return response
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.mapUserToUserInfo(user),
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    // Verify and generate new tokens
    const tokens = await this.jwtTokenService.refreshAccessToken(refreshToken);

    // Get user info from refresh token
    const payload = await this.jwtTokenService.verifyRefreshToken(refreshToken);

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active');
    }

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.mapUserToUserInfo(user),
    };
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(userId: string): Promise<UserInfoDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.mapUserToUserInfo(user);
  }

  /**
   * Logout user (invalidate tokens)
   * Note: JWT tokens cannot be truly invalidated without a blacklist
   * This is a placeholder for future implementation
   */
  async logout(userId: string): Promise<{ message: string }> {
    // TODO: Implement token blacklist in Redis
    // For now, client should delete tokens
    return {
      message: 'Logged out successfully. Please delete tokens on client side.',
    };
  }

  /**
   * Map Prisma user to UserInfoDto
   */
  private mapUserToUserInfo(user: any): UserInfoDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name || undefined,
      avatar: user.avatar || undefined,
      role: user.role as UserRole,
      emailVerified: !!user.emailVerified,
      createdAt: user.createdAt,
    };
  }

  /**
   * Clean up Prisma connection
   */
  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
