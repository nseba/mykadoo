/**
 * Auth Controller
 *
 * HTTP endpoints for authentication
 */

import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Res,
  Req,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from '../services/auth.service';
import { PasswordResetService } from '../services/password-reset.service';
import { EmailVerificationService } from '../services/email-verification.service';
import { OAuthService } from '../services/oauth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { GoogleAuthGuard } from '../guards/google-auth.guard';
import { FacebookAuthGuard } from '../guards/facebook-auth.guard';
import { Public } from '../decorators/public.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import {
  AuthThrottle,
  RegisterThrottle,
  PasswordResetThrottle,
  SkipThrottle,
} from '../decorators/throttle.decorator';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { RequestPasswordResetDto } from '../dto/request-password-reset.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { ResendVerificationDto } from '../dto/resend-verification.dto';
import { AuthResponseDto, UserInfoDto } from '../dto/auth-response.dto';
import { AuthenticatedUser } from '../types/jwt.types';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordResetService: PasswordResetService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly oauthService: OAuthService
  ) {}

  /**
   * Register a new user
   * POST /auth/register
   * Rate limit: 3 requests per hour
   */
  @Public()
  @RegisterThrottle()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) response: Response
  ): Promise<AuthResponseDto> {
    const result = await this.authService.register(registerDto);

    // Set refresh token in HTTP-only cookie
    this.setRefreshTokenCookie(response, result.refreshToken);

    return result;
  }

  /**
   * Login existing user
   * POST /auth/login
   * Rate limit: 5 requests per 15 minutes
   */
  @Public()
  @AuthThrottle()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ): Promise<AuthResponseDto> {
    // Get IP address from request
    const ipAddress = request.ip || request.socket.remoteAddress;

    const result = await this.authService.login(loginDto, ipAddress);

    // Set refresh token in HTTP-only cookie
    this.setRefreshTokenCookie(response, result.refreshToken);

    return result;
  }

  /**
   * Refresh access token
   * POST /auth/refresh
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ): Promise<AuthResponseDto> {
    // Get refresh token from body or cookie
    const refreshToken =
      refreshTokenDto.refreshToken ||
      request.cookies?.['refresh_token'];

    if (!refreshToken) {
      throw new Error('Refresh token not provided');
    }

    const result = await this.authService.refreshToken(refreshToken);

    // Set new refresh token in HTTP-only cookie
    this.setRefreshTokenCookie(response, result.refreshToken);

    return result;
  }

  /**
   * Logout user
   * POST /auth/logout
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) response: Response
  ): Promise<{ message: string }> {
    const result = await this.authService.logout(user.id);

    // Clear refresh token cookie
    this.clearRefreshTokenCookie(response);

    return result;
  }

  /**
   * Get current user profile
   * GET /auth/me
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(@CurrentUser() user: AuthenticatedUser): Promise<UserInfoDto> {
    return this.authService.getCurrentUser(user.id);
  }

  /**
   * Request password reset
   * POST /auth/password-reset/request
   * Rate limit: 3 requests per hour
   */
  @Public()
  @PasswordResetThrottle()
  @Post('password-reset/request')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(
    @Body() requestPasswordResetDto: RequestPasswordResetDto
  ): Promise<{ message: string }> {
    // Generate reset token
    const token = await this.passwordResetService.requestPasswordReset(
      requestPasswordResetDto.email
    );

    // TODO: Send email with reset link
    // For now, we'll just log it (in production, this would be sent via email)
    // Example reset link: https://mykadoo.com/reset-password?token={token}

    // Always return success to prevent email enumeration
    return {
      message:
        'If an account exists with this email, a password reset link has been sent. Please check your inbox.',
    };
  }

  /**
   * Verify password reset token
   * GET /auth/password-reset/verify/:token
   */
  @Public()
  @Get('password-reset/verify/:token')
  async verifyResetToken(@Param('token') token: string): Promise<{ valid: boolean; email?: string }> {
    try {
      const { email } = await this.passwordResetService.verifyResetToken(token);
      return { valid: true, email };
    } catch (error) {
      return { valid: false };
    }
  }

  /**
   * Reset password with token
   * POST /auth/password-reset/reset
   */
  @Public()
  @Post('password-reset/reset')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    await this.passwordResetService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
      resetPasswordDto.confirmPassword
    );

    return {
      message: 'Password has been reset successfully. You can now log in with your new password.',
    };
  }

  /**
   * Verify email with token
   * POST /auth/email/verify
   */
  @Public()
  @Post('email/verify')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<{ message: string }> {
    await this.emailVerificationService.verifyEmail(verifyEmailDto.token);

    return {
      message: 'Email verified successfully. You can now access all features.',
    };
  }

  /**
   * Verify email with token (GET variant for email links)
   * GET /auth/email/verify/:token
   */
  @Public()
  @Get('email/verify/:token')
  async verifyEmailViaLink(@Param('token') token: string): Promise<{ message: string; email: string }> {
    const { email } = await this.emailVerificationService.verifyEmail(token);

    return {
      message: 'Email verified successfully. You can now access all features.',
      email,
    };
  }

  /**
   * Resend verification email
   * POST /auth/email/resend
   * Rate limit: 3 requests per hour
   */
  @Public()
  @PasswordResetThrottle()
  @Post('email/resend')
  @HttpCode(HttpStatus.OK)
  async resendVerificationEmail(
    @Body() resendVerificationDto: ResendVerificationDto
  ): Promise<{ message: string }> {
    const token = await this.emailVerificationService.resendVerificationEmail(
      resendVerificationDto.email
    );

    // TODO: Send email with verification link
    // For now, we'll just log it (in production, this would be sent via email)
    // Example verification link: https://mykadoo.com/verify-email?token={token}

    // Always return success to prevent email enumeration
    return {
      message:
        'If an account exists with this email and is not verified, a verification link has been sent. Please check your inbox.',
    };
  }

  /**
   * Google OAuth - Initiate authentication
   * GET /auth/google
   */
  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google')
  async googleAuth() {
    // Guard redirects to Google
  }

  /**
   * Google OAuth - Callback
   * GET /auth/google/callback
   */
  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleAuthCallback(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ): Promise<AuthResponseDto> {
    const profile = request.user as any;
    const result = await this.oauthService.handleOAuthLogin(profile, 'google');

    // Set refresh token in HTTP-only cookie
    this.setRefreshTokenCookie(response, result.refreshToken);

    return result;
  }

  /**
   * Facebook OAuth - Initiate authentication
   * GET /auth/facebook
   */
  @Public()
  @UseGuards(FacebookAuthGuard)
  @Get('facebook')
  async facebookAuth() {
    // Guard redirects to Facebook
  }

  /**
   * Facebook OAuth - Callback
   * GET /auth/facebook/callback
   */
  @Public()
  @UseGuards(FacebookAuthGuard)
  @Get('facebook/callback')
  async facebookAuthCallback(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ): Promise<AuthResponseDto> {
    const profile = request.user as any;
    const result = await this.oauthService.handleOAuthLogin(profile, 'facebook');

    // Set refresh token in HTTP-only cookie
    this.setRefreshTokenCookie(response, result.refreshToken);

    return result;
  }

  /**
   * Health check endpoint
   * GET /auth/health
   * No rate limiting
   */
  @Public()
  @SkipThrottle()
  @Get('health')
  health(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Set refresh token in HTTP-only cookie
   */
  private setRefreshTokenCookie(response: Response, refreshToken: string): void {
    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/auth/refresh', // Cookie only sent to refresh endpoint
    });
  }

  /**
   * Clear refresh token cookie
   */
  private clearRefreshTokenCookie(response: Response): void {
    response.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/auth/refresh',
    });
  }
}
