/**
 * Security Configuration
 *
 * Centralized security settings for the application
 */

import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

/**
 * CORS Configuration
 */
export function getCorsConfig(): CorsOptions {
  const allowedOrigins = (process.env.CORS_ORIGINS || '').split(',').filter(Boolean);

  // Default origins for development
  if (allowedOrigins.length === 0 && process.env.NODE_ENV === 'development') {
    allowedOrigins.push('http://localhost:3000', 'http://localhost:4200');
  }

  return {
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) {
        callback(null, true);
        return;
      }

      // Check if origin is allowed
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-Request-ID',
      'Accept',
      'Origin',
    ],
    exposedHeaders: ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
    maxAge: 86400, // 24 hours
  };
}

/**
 * Helmet Security Headers Configuration
 */
export function getHelmetConfig() {
  return {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
        scriptSrc: ["'self'"],
        connectSrc: [
          "'self'",
          'https://api.mykadoo.com',
          'https://sentry.io',
          'https://*.sentry.io',
        ],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false, // Required for some third-party scripts
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    frameguard: {
      action: 'deny',
    },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },
  };
}

/**
 * Rate Limiting Configuration
 */
export function getRateLimitConfig() {
  return {
    // Global rate limit
    global: {
      ttl: 60 * 1000, // 1 minute
      limit: 60, // 60 requests per minute
    },

    // API endpoints
    api: {
      ttl: 60 * 1000,
      limit: 100, // 100 requests per minute
    },

    // Authentication endpoints (stricter)
    auth: {
      ttl: 60 * 1000,
      limit: 10, // 10 requests per minute
    },

    // Search endpoints (generous for free tier)
    search: {
      ttl: 60 * 1000,
      limit: 30, // 30 searches per minute
    },

    // AI endpoints (expensive operations)
    ai: {
      ttl: 60 * 1000,
      limit: 10, // 10 AI requests per minute
    },
  };
}

/**
 * Security Headers Middleware
 */
export function getSecurityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  };
}

/**
 * Content Security Policy
 */
export function getCSP(): string {
  const directives = [
    "default-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "script-src 'self'",
    "connect-src 'self' https://api.mykadoo.com https://sentry.io https://*.sentry.io",
    "frame-src 'none'",
    "object-src 'none'",
    'upgrade-insecure-requests',
  ];

  return directives.join('; ');
}

/**
 * Trusted proxies configuration
 */
export function getTrustedProxies(): string[] {
  // Trust Kubernetes internal IPs and cloud load balancers
  return [
    'loopback', // localhost
    'linklocal', // 169.254.0.0/16
    'uniquelocal', // fc00::/7
    '10.0.0.0/8', // Kubernetes internal
    '172.16.0.0/12', // Docker internal
    '192.168.0.0/16', // Private network
  ];
}

/**
 * Session configuration
 */
export function getSessionConfig() {
  return {
    secret: process.env.SESSION_SECRET || 'change-me-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      httpOnly: true,
      sameSite: 'strict' as const,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  };
}

/**
 * Cookie options for JWT tokens
 */
export function getCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
}

/**
 * Validation pipe options
 */
export function getValidationOptions() {
  return {
    whitelist: true, // Strip properties that don't have decorators
    forbidNonWhitelisted: true, // Throw error if non-whitelisted properties exist
    transform: true, // Auto-transform payloads to DTO instances
    transformOptions: {
      enableImplicitConversion: true,
    },
    disableErrorMessages: process.env.NODE_ENV === 'production', // Hide detailed errors in production
  };
}

/**
 * File upload limits
 */
export function getUploadLimits() {
  return {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5, // Max 5 files
    fields: 20, // Max 20 fields
  };
}

/**
 * IP whitelist for admin endpoints
 */
export function getAdminWhitelist(): string[] {
  const whitelist = (process.env.ADMIN_IP_WHITELIST || '').split(',').filter(Boolean);

  // Allow localhost in development
  if (process.env.NODE_ENV === 'development') {
    whitelist.push('127.0.0.1', '::1', '::ffff:127.0.0.1');
  }

  return whitelist;
}

/**
 * Security audit configuration
 */
export interface SecurityAudit {
  lastAudit: Date;
  vulnerabilities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  dependencies: {
    total: number;
    outdated: number;
  };
}

/**
 * Password policy
 */
export function getPasswordPolicy() {
  return {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    preventCommon: true, // Check against common password list
    preventUserInfo: true, // Prevent using username/email in password
  };
}

/**
 * Validate password against policy
 */
export function validatePassword(password: string, username?: string, email?: string): {
  valid: boolean;
  errors: string[];
} {
  const policy = getPasswordPolicy();
  const errors: string[] = [];

  if (password.length < policy.minLength) {
    errors.push(`Password must be at least ${policy.minLength} characters`);
  }

  if (password.length > policy.maxLength) {
    errors.push(`Password must be at most ${policy.maxLength} characters`);
  }

  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (policy.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (policy.requireSpecialChars && !new RegExp(`[${policy.specialChars}]`).test(password)) {
    errors.push('Password must contain at least one special character');
  }

  if (policy.preventUserInfo) {
    const lowerPassword = password.toLowerCase();
    if (username && lowerPassword.includes(username.toLowerCase())) {
      errors.push('Password cannot contain your username');
    }
    if (email) {
      const emailUser = email.split('@')[0].toLowerCase();
      if (lowerPassword.includes(emailUser)) {
        errors.push('Password cannot contain your email');
      }
    }
  }

  // Common passwords (top 100)
  const commonPasswords = [
    'password',
    '123456',
    '12345678',
    'qwerty',
    'abc123',
    'password123',
    'admin',
    'letmein',
    'welcome',
  ];

  if (policy.preventCommon && commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
