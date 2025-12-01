/**
 * Auth Library
 *
 * Shared authentication library for the Mykadoo platform
 */

// Module
export * from './auth.module';

// Services
export * from './services/jwt.service';
export * from './services/auth.service';
export * from './services/profile.service';
export * from './services/account-lockout.service';
export * from './services/password-reset.service';
export * from './services/email-verification.service';
export * from './services/oauth.service';

// Controllers
export * from './controllers/auth.controller';
export * from './controllers/profile.controller';

// Strategies
export * from './strategies/jwt.strategy';
export * from './strategies/google.strategy';
export * from './strategies/facebook.strategy';

// Guards
export * from './guards/jwt-auth.guard';
export * from './guards/roles.guard';
export * from './guards/google-auth.guard';
export * from './guards/facebook-auth.guard';

// Decorators
export * from './decorators/public.decorator';
export * from './decorators/current-user.decorator';
export * from './decorators/roles.decorator';
export * from './decorators/throttle.decorator';

// DTOs
export * from './dto/register.dto';
export * from './dto/login.dto';
export * from './dto/refresh-token.dto';
export * from './dto/auth-response.dto';
export * from './dto/update-profile.dto';
export * from './dto/update-preferences.dto';
export * from './dto/change-password.dto';
export * from './dto/request-password-reset.dto';
export * from './dto/reset-password.dto';
export * from './dto/verify-email.dto';
export * from './dto/resend-verification.dto';

// Types
export * from './types/jwt.types';

// Utils
export * from './utils/password.util';
