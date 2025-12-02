# Security Guide

Comprehensive security practices and configurations for the Mykadoo platform.

## Overview

**Security Principles:**
- Defense in depth
- Least privilege access
- Secure by default
- Regular security audits
- Responsible disclosure

**Compliance:**
- OWASP Top 10 coverage
- GDPR compliance
- PCI DSS (for payment handling)
- SOC 2 Type II (future)

## Quick Security Checklist

- [ ] All secrets stored in environment variables (never in code)
- [ ] HTTPS enforced in production
- [ ] Security headers configured (CSP, HSTS, X-Frame-Options)
- [ ] CORS properly configured
- [ ] Rate limiting enabled on all endpoints
- [ ] Input validation on all user input
- [ ] SQL injection protection (parameterized queries)
- [ ] XSS prevention (sanitized output)
- [ ] CSRF protection enabled
- [ ] Password policy enforced
- [ ] Dependencies regularly updated
- [ ] Security scans passing

## Secrets Management

### Environment Variables

**Never commit secrets to Git!** All sensitive configuration must be in environment variables.

**Required Secrets:**

```env
# Application
NODE_ENV=production
APP_VERSION=1.0.0

# Database
DATABASE_URL=postgresql://user:password@host:5432/mykadoo
DATABASE_DIRECT_URL=postgresql://user:password@host:5432/mykadoo

# JWT (must be 32+ characters)
JWT_SECRET=your-secret-here-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-here-min-32-chars

# Encryption (must be 32 characters exactly for AES-256)
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef

# OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx

# AI Services
OPENAI_API_KEY=sk-xxx
ANTHROPIC_API_KEY=sk-ant-xxx

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx
```

### Secrets Validation

```typescript
import { validateSecrets, getAppSecrets } from '@mykadoo/utils';

// Validate all required secrets on startup
validateSecrets();

// Get typed secrets
const secrets = getAppSecrets();
console.log('Database:', maskSecret(secrets.databaseUrl));
```

### Generating Secrets

```bash
# Generate 32-character secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate 64-character secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Using the utility
yarn ts-node -e "import { generateSecret } from './libs/utils/src/lib/security/secrets-manager'; console.log(generateSecret(32))"
```

### Secret Rotation

Secrets should be rotated regularly:

- **JWT Secrets:** Every 90 days
- **Database Password:** Every 90 days
- **API Keys:** Every 180 days
- **Encryption Keys:** Never (would invalidate encrypted data)

**Rotation Process:**

1. Generate new secret
2. Update in secrets manager
3. Deploy new version with new secret
4. Verify application works
5. Update old secret references
6. Remove old secret after grace period

## Authentication & Authorization

### Password Policy

```typescript
// Minimum requirements
- Length: 8-128 characters
- Must contain: uppercase, lowercase, number, special character
- Cannot contain: username, email
- Cannot be: common password (e.g., "password123")
```

**Validation:**

```typescript
import { validatePassword } from '@mykadoo/utils';

const result = validatePassword('MyP@ssw0rd', 'username', 'user@example.com');

if (!result.valid) {
  console.error('Password validation failed:', result.errors);
}
```

### JWT Tokens

**Access Token:** 15 minutes
**Refresh Token:** 7 days

**Token Structure:**

```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "role": "GOLD",
  "iat": 1234567890,
  "exp": 1234568790
}
```

**Cookie Configuration:**

```typescript
{
  httpOnly: true,
  secure: true, // HTTPS only
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
}
```

### Account Lockout

- **Failed Attempts:** 5
- **Lockout Duration:** 15 minutes
- **Implementation:** Track in database or Redis

## Security Headers

### Content Security Policy (CSP)

```
Content-Security-Policy:
  default-src 'self';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https: blob:;
  script-src 'self';
  connect-src 'self' https://api.mykadoo.com https://sentry.io;
  frame-src 'none';
  object-src 'none';
  upgrade-insecure-requests;
```

### HTTP Strict Transport Security (HSTS)

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

### Other Security Headers

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### NestJS Implementation

```typescript
import helmet from 'helmet';
import { getHelmetConfig } from '@mykadoo/utils';

app.use(helmet(getHelmetConfig()));
```

## CORS Configuration

### Allowed Origins

```typescript
// Development
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:4200',
];

// Production
const allowedOrigins = [
  'https://mykadoo.com',
  'https://www.mykadoo.com',
  'https://app.mykadoo.com',
];
```

### Configuration

```typescript
import { getCorsConfig } from '@mykadoo/utils';

app.enableCors(getCorsConfig());
```

**Environment Variable:**

```env
CORS_ORIGINS=https://mykadoo.com,https://www.mykadoo.com
```

## Rate Limiting

### Default Limits

- **Global:** 60 requests/minute
- **API:** 100 requests/minute
- **Auth:** 10 requests/minute
- **Search:** 30 requests/minute
- **AI:** 10 requests/minute

### Usage

```typescript
import { RateLimit } from '@/app/guards/rate-limit.guard';

@Controller('search')
export class SearchController {
  @Post()
  @RateLimit({ ttl: 60000, limit: 30 })
  async search(@Body() dto: SearchDto) {
    // Handle search
  }
}
```

### Response Headers

```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 25
X-RateLimit-Reset: 2025-01-03T12:01:00Z
Retry-After: 45
```

## Input Validation

### NestJS DTOs

```typescript
import { IsString, IsInt, Min, Max, IsEmail, Matches } from 'class-validator';

export class SearchDto {
  @IsString()
  @Length(1, 100)
  occasion: string;

  @IsInt()
  @Min(0)
  @Max(10000)
  budgetMin: number;

  @IsEmail()
  email: string;

  @Matches(/^[a-zA-Z0-9-_]+$/)
  username: string;
}
```

### Validation Pipe

```typescript
import { ValidationPipe } from '@nestjs/common';
import { getValidationOptions } from '@mykadoo/utils';

app.useGlobalPipes(new ValidationPipe(getValidationOptions()));
```

## SQL Injection Prevention

### ✅ GOOD - Type-safe Prisma queries

```typescript
// Parameterized query
await prisma.user.findMany({
  where: {
    email: userInput, // Safe - automatically parameterized
  },
});

// Raw query with parameters
await prisma.$queryRaw`SELECT * FROM users WHERE email = ${email}`;
```

### ❌ BAD - String concatenation

```typescript
// NEVER DO THIS!
await prisma.$queryRawUnsafe(`SELECT * FROM users WHERE email = '${email}'`);
```

## XSS Prevention

### React Automatic Escaping

React automatically escapes values, preventing XSS:

```tsx
// Safe - React escapes automatically
<div>{userInput}</div>

// Dangerous - only use with trusted input
<div dangerouslySetInnerHTML={{ __html: trustedHtml }} />
```

### Sanitization

For user-generated HTML (e.g., blog posts):

```typescript
import DOMPurify from 'dompurify';

const sanitized = DOMPurify.sanitize(userHtml, {
  ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a'],
  ALLOWED_ATTR: ['href'],
});
```

## CSRF Protection

### Same-Site Cookies

```typescript
{
  sameSite: 'strict', // Prevents CSRF attacks
  httpOnly: true,
  secure: true,
}
```

### CSRF Tokens (optional)

For additional protection:

```typescript
import csurf from 'csurf';

app.use(csurf({ cookie: true }));
```

## Encryption

### Field-Level Encryption

For sensitive data (SSN, credit cards):

```typescript
import { Encryption } from '@mykadoo/utils';

const encrypted = Encryption.encrypt(ssn, process.env.ENCRYPTION_KEY);
await prisma.user.create({
  data: {
    email: 'user@example.com',
    ssn: encrypted,
  },
});

// Decrypt when reading
const decrypted = Encryption.decrypt(user.ssn, process.env.ENCRYPTION_KEY);
```

### Password Hashing

```typescript
import * as bcrypt from 'bcryptjs';

// Hash password
const hashed = await bcrypt.hash(password, 12);

// Verify password
const valid = await bcrypt.compare(password, hashed);
```

## Dependency Security

### Regular Updates

```bash
# Check for outdated packages
npm outdated

# Update all packages
npm update

# Update with breaking changes (carefully!)
npx npm-check-updates -u
npm install
```

### Security Audits

```bash
# NPM audit
npm audit

# Fix automatically
npm audit fix

# Fix with breaking changes
npm audit fix --force

# Run comprehensive security scan
./scripts/security-scan.sh
```

### Snyk Integration

```bash
# Install Snyk
npm install -g snyk

# Authenticate
snyk auth

# Test for vulnerabilities
snyk test

# Monitor project
snyk monitor
```

## Security Scanning

### Automated Scans

Run on every PR:

```yaml
# .github/workflows/security.yml
- name: Security Scan
  run: ./scripts/security-scan.sh
```

### Manual Scan

```bash
./scripts/security-scan.sh
```

**Checks:**
- NPM audit for vulnerabilities
- Outdated dependencies
- Snyk security scan
- TypeScript strict mode
- Hardcoded secrets detection
- Security headers configuration
- SQL injection vulnerabilities
- HTTPS configuration

## Incident Response

### Security Incident Procedure

1. **Detect** - Alerts, monitoring, user reports
2. **Assess** - Determine severity and impact
3. **Contain** - Stop the attack, prevent spread
4. **Eradicate** - Remove threat, patch vulnerabilities
5. **Recover** - Restore services, verify security
6. **Document** - Write incident report, lessons learned

### Severity Levels

**P0 - Critical**
- Data breach
- Authentication bypass
- Remote code execution
- Response: Immediate

**P1 - High**
- XSS vulnerability
- SQL injection
- CSRF vulnerability
- Response: 24 hours

**P2 - Medium**
- Information disclosure
- DoS vulnerability
- Response: 1 week

**P3 - Low**
- Minor security improvement
- Response: Next release

### Contact

**Security Issues:** security@mykadoo.com
**Bug Bounty:** Coming soon

## Responsible Disclosure

We appreciate responsible disclosure of security vulnerabilities.

**Process:**
1. Email security@mykadoo.com with details
2. Allow 90 days for fix before public disclosure
3. Do not exploit the vulnerability
4. Do not access user data
5. We will respond within 48 hours

**Recognition:**
- Public acknowledgment (optional)
- Swag/rewards for valid reports
- Bug bounty program (future)

## Compliance

### GDPR

- **Right to Access:** Data export endpoint
- **Right to Erasure:** Account deletion with 30-day soft delete
- **Data Portability:** JSON export format
- **Consent:** Explicit consent for data processing
- **Data Minimization:** Only collect necessary data

### PCI DSS

We do NOT store credit card information:
- All payments via Stripe (PCI compliant)
- Never log credit card numbers
- Secure transmission (HTTPS)

## Best Practices

### For Developers

1. **Never commit secrets** - Use environment variables
2. **Validate all input** - Never trust user input
3. **Use parameterized queries** - Prevent SQL injection
4. **Escape output** - Prevent XSS
5. **Keep dependencies updated** - Regular security patches
6. **Review code** - Security review on all PRs
7. **Test security** - Include security tests
8. **Follow OWASP Top 10** - Regular review

### For DevOps

1. **Encrypt at rest** - Database encryption enabled
2. **Encrypt in transit** - HTTPS everywhere
3. **Least privilege** - Minimal permissions
4. **Network segmentation** - Separate environments
5. **Regular backups** - Encrypted backups
6. **Monitoring** - Security event monitoring
7. **Incident response** - Documented procedures

### For Users

1. **Strong passwords** - Min 8 characters, complexity required
2. **2FA enabled** - Optional but recommended
3. **Regular logout** - On shared devices
4. **Monitor activity** - Check account activity
5. **Report issues** - security@mykadoo.com

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/)
- [NestJS Security](https://docs.nestjs.com/security/helmet)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Prisma Security](https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access#sql-injection)
- [GDPR Compliance](https://gdpr.eu/)
