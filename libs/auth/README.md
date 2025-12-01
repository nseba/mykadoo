# Authentication Library (@mykadoo/auth)

Comprehensive authentication library for the Mykadoo platform with JWT, OAuth, password reset, and email verification.

## Features

### ✅ JWT Authentication
- Access tokens (15-minute expiry)
- Refresh tokens (7-day expiry with rotation)
- HTTP-only secure cookies
- Token blacklisting support (TODO)

### ✅ OAuth Integration
- **Google OAuth 2.0**: Sign in with Google
- **Facebook Login**: Sign in with Facebook
- Account linking: Connect OAuth accounts to existing users
- Auto email verification for verified OAuth emails

### ✅ Password Security
- bcrypt hashing (cost factor 12)
- Password strength validation
- Password reset with secure tokens (1-hour expiry)
- Change password functionality

### ✅ Email Verification
- Token-based verification (24-hour expiry)
- Auto-send on registration
- Resend verification email (rate-limited)
- Verified OAuth emails mark account as verified

### ✅ Account Security
- Account lockout: 5 failed attempts → 15-minute lockout
- Rate limiting:
  - Login: 5 attempts per 15 minutes
  - Registration: 3 attempts per hour
  - Password reset: 3 requests per hour
- IP address tracking for audit

### ✅ User Profile Management
- Get/update profile information
- Manage preferences (currency, language, AI agent, budget, interests)
- Change password
- Soft delete account (30-day retention)

## Installation

```bash
yarn add @nestjs/jwt @nestjs/passport passport passport-jwt passport-google-oauth20 passport-facebook
yarn add @nestjs/throttler bcryptjs class-validator class-transformer cookie-parser
yarn add -D @types/passport-jwt @types/passport-google-oauth20 @types/passport-facebook @types/bcryptjs
```

## Configuration

### Environment Variables

Copy `.env.example` and configure:

```env
# JWT
JWT_ACCESS_SECRET=your-secure-access-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_SECRET=your-secure-refresh-secret
JWT_REFRESH_EXPIRY=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Facebook OAuth
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_CALLBACK_URL=http://localhost:3000/api/auth/facebook/callback
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/google/callback`
5. Copy Client ID and Client Secret to `.env`

### Facebook OAuth Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or select existing
3. Add Facebook Login product
4. Configure OAuth redirect URIs: `http://localhost:3000/api/auth/facebook/callback`
5. Copy App ID and App Secret to `.env`

## Usage

### Import Module

```typescript
import { AuthModule } from '@mykadoo/auth';

@Module({
  imports: [AuthModule],
})
export class AppModule {}
```

### API Endpoints

#### Registration & Login

```bash
# Register with email/password
POST /auth/register
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}

# Login with email/password
POST /auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

# Refresh access token
POST /auth/refresh
{
  "refreshToken": "..." # or from cookie
}

# Logout
POST /auth/logout

# Get current user
GET /auth/me
```

#### OAuth Authentication

```bash
# Google OAuth - Initiate
GET /auth/google

# Google OAuth - Callback (automatic)
GET /auth/google/callback

# Facebook OAuth - Initiate
GET /auth/facebook

# Facebook OAuth - Callback (automatic)
GET /auth/facebook/callback
```

#### Password Reset

```bash
# Request password reset
POST /auth/password-reset/request
{
  "email": "user@example.com"
}

# Verify reset token
GET /auth/password-reset/verify/:token

# Reset password
POST /auth/password-reset/reset
{
  "token": "...",
  "newPassword": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

#### Email Verification

```bash
# Verify email (POST)
POST /auth/email/verify
{
  "token": "..."
}

# Verify email (GET - for email links)
GET /auth/email/verify/:token

# Resend verification email
POST /auth/email/resend
{
  "email": "user@example.com"
}
```

#### Profile Management

```bash
# Get profile
GET /profile

# Update profile
PUT /profile
{
  "name": "John Doe",
  "phone": "+1234567890",
  "location": "New York, USA"
}

# Update preferences
PUT /profile/preferences
{
  "currency": "USD",
  "language": "en",
  "preferredAIAgent": "Sophie",
  "budgetMin": 50,
  "budgetMax": 200,
  "interests": ["books", "tech", "gaming"]
}

# Change password
PUT /profile/password
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!"
}

# Delete account
DELETE /profile
```

## Guards and Decorators

### Protect Routes

```typescript
import { JwtAuthGuard, Roles, RolesGuard } from '@mykadoo/auth';

@Controller('protected')
@UseGuards(JwtAuthGuard)
export class ProtectedController {
  @Get()
  getProtectedData(@CurrentUser() user: AuthenticatedUser) {
    return { message: 'This is protected', user };
  }
}
```

### Role-Based Access Control

```typescript
import { Roles, RolesGuard } from '@mykadoo/auth';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'GOLD', 'PLATINUM')
@Get('premium')
getPremiumData() {
  return { message: 'Premium content' };
}
```

### Public Routes

```typescript
import { Public } from '@mykadoo/auth';

@Public()
@Get('public')
getPublicData() {
  return { message: 'This is public' };
}
```

### Rate Limiting

```typescript
import { AuthThrottle, RegisterThrottle, SkipThrottle } from '@mykadoo/auth';

@Public()
@AuthThrottle() // 5 requests per 15 minutes
@Post('login')
login(@Body() loginDto: LoginDto) {
  // ...
}

@SkipThrottle() // No rate limiting
@Get('health')
health() {
  return { status: 'ok' };
}
```

## Database Models

The library uses the following Prisma models:

- **User**: Core user data
- **Account**: OAuth provider accounts
- **UserProfile**: Extended user profile and preferences
- **PasswordResetToken**: Password reset tokens
- **EmailVerificationToken**: Email verification tokens
- **UserEvent**: Audit trail for security events

Run migrations:

```bash
yarn db:migrate
```

## Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **Secrets**: Use strong, random secrets for JWT
3. **HTTPS**: Always use HTTPS in production
4. **Rate Limiting**: Adjust limits based on your needs
5. **Account Lockout**: Monitor failed login attempts
6. **Token Rotation**: Refresh tokens are rotated on use
7. **Audit Trail**: All auth events logged to UserEvent table

## Testing

```bash
# Unit tests
yarn nx test auth

# E2E tests
yarn nx test:e2e auth

# Coverage
yarn nx test:coverage auth
```

## TODO

- [ ] Implement token blacklist in Redis
- [ ] Add email service integration (SendGrid/AWS SES)
- [ ] Add 2FA/MFA support
- [ ] Add passwordless authentication
- [ ] Add magic link login
- [ ] Add session management dashboard
- [ ] Add OAuth for more providers (GitHub, Twitter, LinkedIn)

## License

Proprietary - Mykadoo Platform
