# PRD: User Authentication & Profile Management

## Introduction

Mykadoo requires a secure user authentication system and profile management to enable personalized gift search experiences, save recipient profiles, and prepare for future subscription tiers. This system forms the foundation for user data privacy, GDPR compliance, and monetization.

## Problem Statement

Users need a way to:
- Create accounts to save their gift searches and recipient profiles
- Securely access their personalized data across devices
- Manage their personal information and preferences
- Control their data privacy and comply with regulations

## Goals

1. Implement secure user registration and authentication
2. Enable users to manage their profiles and preferences
3. Support free tier users with 3 recipient profile limit
4. Ensure GDPR compliance and data privacy
5. Provide seamless authentication experience across devices
6. Achieve <2 second authentication response time
7. Support social login for ease of use (Google, Facebook)
8. Enable password reset and account recovery

## User Stories

### As a new user:
- I want to sign up with email/password so that I can save my searches
- I want to sign up with Google/Facebook so that registration is quick
- I want to verify my email so that my account is secure
- I want clear information about data usage so that I trust the platform

### As a returning user:
- I want to log in quickly so that I can access my saved profiles
- I want to stay logged in so that I don't have to re-authenticate frequently
- I want to reset my password if I forget it so that I can regain access
- I want to log out from all devices so that my account is secure

### As a registered user:
- I want to view and edit my profile information so that it stays current
- I want to change my password so that I can maintain security
- I want to see my account tier (free) and limits so that I know my status
- I want to delete my account and data so that I comply with my privacy preferences
- I want to export my data so that I can move to another platform if needed

## Functional Requirements

### 1. User Registration

**1.1** Users must be able to register using:
- Email and password
- Google OAuth 2.0
- Facebook Login

**1.2** Registration with email must require:
- Valid email address
- Password (min 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char)
- Acceptance of Terms of Service and Privacy Policy

**1.3** System must validate:
- Email format and uniqueness
- Password strength
- No duplicate accounts for same email

**1.4** Upon registration, system must:
- Send verification email with confirmation link
- Create user account in pending state
- Generate secure verification token (expires in 24 hours)

**1.5** Email verification process must:
- Activate account when user clicks verification link
- Show error if token expired or invalid
- Allow resending verification email

### 2. User Authentication

**2.1** Users must be able to log in using:
- Email and password
- Google OAuth 2.0
- Facebook Login
- "Remember me" option

**2.2** Authentication must implement:
- JWT tokens for session management
- Access token (15 minutes expiry)
- Refresh token (7 days expiry, rotated on use)
- Secure HTTP-only cookies for token storage

**2.3** System must enforce:
- Account lockout after 5 failed login attempts (15 minutes)
- Rate limiting on login endpoint (10 requests per minute per IP)
- Brute force protection

**2.4** Authenticated sessions must:
- Persist across browser sessions if "Remember me" selected
- Auto-refresh before access token expiration
- Support logout from single device or all devices

### 3. Password Management

**3.1** Password reset flow must:
- Require email address for reset request
- Send reset link to registered email
- Generate secure reset token (expires in 1 hour)
- Allow password change with valid token
- Invalidate all existing sessions after password change

**3.2** Password change (for logged-in users) must:
- Require current password confirmation
- Validate new password strength
- Update password hash
- Send email notification of change

**3.3** Passwords must be:
- Hashed using bcrypt (cost factor 12)
- Never stored in plain text
- Never sent via email

### 4. User Profile Management

**4.1** User profile must include:
- Email (primary identifier)
- Name (optional)
- Profile picture (optional)
- Account tier (free, gold, platinum)
- Email notification preferences
- Language preference (for future localization)
- Timezone

**4.2** Users must be able to:
- View their profile
- Edit name and profile picture
- Change email (with verification)
- Update notification preferences
- Change language and timezone

**4.3** System must track:
- Account creation date
- Last login date
- Account status (active, suspended, deleted)
- Verification status
- Subscription tier and limits

**4.4** Free tier accounts must have:
- Maximum 3 recipient profiles
- Unlimited gift searches
- Basic gift recommendations
- Access to public content

### 5. Account Limits & Tier Management

**5.1** System must enforce recipient profile limits:
- Free: 3 profiles
- Gold: 10 profiles (future)
- Platinum: Unlimited profiles (future)

**5.2** Profile creation must:
- Check current count before allowing new profile
- Show upgrade prompt when limit reached
- Display current count (e.g., "2 of 3 profiles used")

**5.3** System must provide:
- Clear tier comparison information
- Upgrade path to premium tiers (for Phase 2)

### 6. Data Privacy & GDPR Compliance

**6.1** Users must be able to:
- View all data stored about them
- Export data in JSON format
- Delete their account and all associated data
- Manage cookie consent preferences

**6.2** Data export must include:
- User profile information
- Recipient profiles
- Search history
- Feedback and ratings

**6.3** Account deletion must:
- Require password confirmation
- Show warning about data loss
- Soft delete initially (30 days retention for recovery)
- Permanently delete after 30 days
- Remove all personally identifiable information

**6.4** System must:
- Display privacy policy and terms of service
- Obtain explicit consent for data processing
- Allow withdrawal of consent
- Log all data access and modifications

### 7. Social Authentication

**7.1** Google OAuth integration must:
- Use official Google Sign-In library
- Request only necessary scopes (email, profile)
- Create or link account on first sign-in
- Handle OAuth errors gracefully

**7.2** Facebook Login integration must:
- Use Facebook Login SDK
- Request email and public_profile permissions
- Create or link account on first sign-in
- Handle authentication errors

**7.3** Social login must:
- Merge accounts if email already exists
- Prompt user to set password for email login option
- Link multiple social providers to same account

### 8. Security Features

**8.1** System must implement:
- HTTPS for all communications
- CSRF protection on all forms
- XSS prevention with input sanitization
- SQL injection prevention with parameterized queries
- Content Security Policy headers

**8.2** Sensitive operations must:
- Require re-authentication for password change
- Require email confirmation for email change
- Require password for account deletion
- Send email notifications for security events

**8.3** Session management must:
- Expire sessions after inactivity (7 days)
- Provide "logout from all devices" option
- Track active sessions per user

## Non-Goals (Out of Scope)

- Two-factor authentication (2FA) - Phase 2
- Biometric authentication - Phase 3
- SSO for enterprise - Phase 4
- Account linking with third-party services (beyond social login)
- User roles and permissions (admin/user) - separate PRD
- Subscription payment processing - PRD 0005

## Technical Considerations

### Architecture

**Frontend:**
- Next.js 14 App Router with middleware for auth
- Server actions for authentication operations
- Protected routes using middleware
- Session management with next-auth or similar

**Backend:**
- NestJS with Passport.js for authentication
- JWT strategy for token-based auth
- OAuth strategies for Google and Facebook
- Guards for route protection

**Database:**
- PostgreSQL for user data
- Redis for session management and rate limiting
- Secure storage of refresh tokens

### Data Model

```typescript
interface User {
  id: string;
  email: string;
  passwordHash?: string; // Null for social-only accounts
  name?: string;
  profilePictureUrl?: string;
  tier: 'free' | 'gold' | 'platinum';
  isVerified: boolean;
  isActive: boolean;
  emailNotifications: boolean;
  language: string;
  timezone: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date; // Soft delete
}

interface SocialAccount {
  id: string;
  userId: string;
  provider: 'google' | 'facebook';
  providerId: string; // User ID from provider
  email: string;
  accessToken?: string;
  refreshToken?: string;
  createdAt: Date;
}

interface Session {
  id: string;
  userId: string;
  accessToken: string;
  refreshToken: string;
  deviceInfo?: string;
  ipAddress?: string;
  expiresAt: Date;
  createdAt: Date;
}

interface VerificationToken {
  id: string;
  userId: string;
  token: string;
  type: 'email_verification' | 'password_reset';
  expiresAt: Date;
  createdAt: Date;
}
```

### Authentication Flow

**Email Registration:**
1. User submits registration form
2. Validate input and check for existing account
3. Hash password with bcrypt
4. Create user record (isVerified: false)
5. Generate verification token
6. Send verification email
7. Return success response

**Email Login:**
1. User submits credentials
2. Check rate limiting
3. Find user by email
4. Verify password hash
5. Check if account is verified and active
6. Generate JWT access and refresh tokens
7. Create session record
8. Set HTTP-only cookies
9. Return user data and tokens

**OAuth Flow:**
1. User clicks social login button
2. Redirect to OAuth provider
3. User authorizes on provider
4. Provider redirects back with code
5. Exchange code for access token
6. Fetch user profile from provider
7. Find or create user account
8. Generate JWT tokens
9. Create session
10. Redirect to dashboard

### API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/logout-all
POST   /api/auth/refresh
POST   /api/auth/verify-email
POST   /api/auth/resend-verification
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/auth/me
PATCH  /api/auth/me
DELETE /api/auth/me

GET    /api/auth/google
GET    /api/auth/google/callback
GET    /api/auth/facebook
GET    /api/auth/facebook/callback

GET    /api/user/profile
PATCH  /api/user/profile
PATCH  /api/user/password
GET    /api/user/data-export
DELETE /api/user/account

GET    /api/user/sessions
DELETE /api/user/sessions/:id
```

### Integration Points

- Email service (SendGrid, AWS SES) for verification and notifications
- Google OAuth API
- Facebook Graph API
- Analytics service for login events
- Monitoring for failed login attempts

### Security Considerations

**Password Security:**
- Bcrypt with cost factor 12
- Reject common passwords (top 10,000 list)
- Enforce password complexity

**Token Security:**
- Short-lived access tokens (15 minutes)
- Rotating refresh tokens
- HTTP-only, Secure, SameSite cookies
- CSRF tokens for state-changing operations

**Rate Limiting:**
- Login: 10 requests/minute per IP
- Registration: 3 requests/hour per IP
- Password reset: 5 requests/hour per email
- Email verification: 3 requests/hour per account

**Brute Force Protection:**
- Account lockout after 5 failed attempts
- Exponential backoff for subsequent attempts
- Admin notification for suspicious activity

## Design Considerations

### UI/UX

**Registration Form:**
- Clean, minimal design
- Progressive disclosure (show only necessary fields)
- Real-time validation feedback
- Password strength indicator
- Social login buttons prominent
- Link to login for existing users

**Login Form:**
- Email and password fields
- "Remember me" checkbox
- "Forgot password?" link
- Social login buttons
- Link to registration

**Profile Page:**
- Avatar upload with crop tool
- Editable fields inline or in modal
- Tier badge showing current subscription
- Profile limit indicator (X of 3 used)
- Link to upgrade (for future)

**Verification Email:**
- Clear call-to-action button
- Branding consistent with platform
- Fallback link if button doesn't work
- Support contact information

### Accessibility

- Keyboard navigation for all forms
- Screen reader labels
- Error messages associated with fields
- High contrast for form elements
- Focus indicators

## Success Metrics

### Adoption
- **Target:** 60% of users create accounts within first visit
- **Target:** 70% of registrations verified within 24 hours
- **Target:** 40% choose social login vs email

### Engagement
- **Target:** 50% of users log in within 7 days of registration
- **Target:** 30% weekly active users (WAU)
- **Target:** <5% account abandonment rate

### Security
- **Target:** 0 security breaches
- **Target:** <0.1% failed login attempts due to brute force
- **Target:** <1% password reset requests per month

### Performance
- **Target:** <2 seconds for login response time
- **Target:** <3 seconds for OAuth flow completion
- **Target:** 99.9% uptime for auth service

### User Satisfaction
- **Target:** <2% support tickets related to authentication
- **Target:** 80% successful first-time logins

## Open Questions

1. **Session Duration**: Should free tier have shorter session duration than paid tiers?

2. **Social Login Providers**: Should we support additional providers (Apple, Twitter, LinkedIn)?

3. **Email Verification**: Should we allow users to use the platform before email verification?

4. **Account Deletion**: Should we allow immediate permanent deletion or always use 30-day grace period?

5. **Profile Pictures**: Should we use Gravatar integration or require uploads?

6. **Multi-Device**: Should we limit concurrent sessions per account?

## Implementation Phases

### Phase 1: Core Auth (Weeks 1-2)
- Email registration and login
- JWT token management
- Password hashing and validation
- Email verification

### Phase 2: Social Login (Week 3)
- Google OAuth integration
- Facebook Login integration
- Account linking

### Phase 3: Profile Management (Week 4)
- Profile viewing and editing
- Password change
- Account tier display

### Phase 4: Data Privacy (Week 5)
- Data export
- Account deletion
- GDPR compliance features

### Phase 5: Security Hardening (Week 6)
- Rate limiting
- Brute force protection
- Session management
- Security testing

## Dependencies

- Email service configuration
- Google OAuth credentials
- Facebook App credentials
- Core Gift Search PRD (0001) - for recipient profile limits
- Infrastructure setup (database, Redis)

## Risks & Mitigation

### Risk 1: OAuth Provider Downtime
**Mitigation:**
- Always support email login as fallback
- Clear error messages when provider unavailable
- Cache user data to avoid blocking

### Risk 2: Email Deliverability Issues
**Mitigation:**
- Use reputable email service (SendGrid, AWS SES)
- Implement retry logic
- Provide manual verification option
- Monitor delivery rates

### Risk 3: Account Takeover
**Mitigation:**
- Strong password requirements
- Email notifications for security events
- Session management with device tracking
- Account lockout policies

### Risk 4: Low Verification Rates
**Mitigation:**
- Send reminder emails
- Allow platform use before verification (limited features)
- Streamline verification process
- Clear benefits communication

## Acceptance Criteria

- [ ] Users can register with email and password
- [ ] Users can register with Google OAuth
- [ ] Users can register with Facebook Login
- [ ] Email verification emails are sent and work correctly
- [ ] Users can log in with email and password
- [ ] Users can log in with social accounts
- [ ] JWT tokens are generated and validated
- [ ] Users can reset forgotten passwords
- [ ] Users can change their password when logged in
- [ ] Users can view and edit their profile
- [ ] Free tier limit of 3 recipient profiles is enforced
- [ ] Users can export their data in JSON format
- [ ] Users can delete their accounts
- [ ] Account deletion follows 30-day soft delete process
- [ ] All authentication endpoints have rate limiting
- [ ] Account lockout works after 5 failed attempts
- [ ] Sessions expire correctly
- [ ] "Logout from all devices" works
- [ ] All forms have CSRF protection
- [ ] Passwords are hashed with bcrypt
- [ ] HTTP-only cookies are used for tokens
- [ ] Privacy policy and terms are displayed
- [ ] GDPR consent is obtained and stored

---

**Document Version:** 1.0
**Last Updated:** 2025-11-26
**Status:** Draft
**Author:** AI Product Team
**Reviewers:** Engineering, Design, Product, Legal
