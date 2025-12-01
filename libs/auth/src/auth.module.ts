/**
 * Auth Module
 *
 * Main authentication module for the Mykadoo platform
 */

import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

// Services
import { JwtTokenService } from './services/jwt.service';
import { AuthService } from './services/auth.service';
import { ProfileService } from './services/profile.service';
import { AccountLockoutService } from './services/account-lockout.service';
import { PasswordResetService } from './services/password-reset.service';
import { EmailVerificationService } from './services/email-verification.service';
import { OAuthService } from './services/oauth.service';

// Controllers
import { AuthController } from './controllers/auth.controller';
import { ProfileController } from './controllers/profile.controller';

// Strategies
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy';

// Guards
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { FacebookAuthGuard } from './guards/facebook-auth.guard';

@Global()
@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET', 'access-secret-change-me'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_EXPIRY', '15m'),
        },
      }),
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          name: 'default',
          ttl: configService.get<number>('THROTTLE_TTL', 60000), // 1 minute
          limit: configService.get<number>('THROTTLE_LIMIT', 100), // 100 requests per minute
        },
        {
          name: 'auth',
          ttl: configService.get<number>('AUTH_THROTTLE_TTL', 900000), // 15 minutes
          limit: configService.get<number>('AUTH_THROTTLE_LIMIT', 5), // 5 attempts per 15 minutes
        },
      ],
    }),
  ],
  controllers: [AuthController, ProfileController],
  providers: [
    // Services
    JwtTokenService,
    AuthService,
    ProfileService,
    AccountLockoutService,
    PasswordResetService,
    EmailVerificationService,
    OAuthService,

    // Strategies
    JwtStrategy,
    GoogleStrategy,
    FacebookStrategy,

    // Guards
    JwtAuthGuard,
    RolesGuard,
    GoogleAuthGuard,
    FacebookAuthGuard,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [
    JwtTokenService,
    AuthService,
    ProfileService,
    AccountLockoutService,
    PasswordResetService,
    EmailVerificationService,
    OAuthService,
    JwtAuthGuard,
    RolesGuard,
    GoogleAuthGuard,
    FacebookAuthGuard,
    PassportModule,
    JwtModule,
  ],
})
export class AuthModule {}
