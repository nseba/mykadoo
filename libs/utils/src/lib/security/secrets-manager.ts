/**
 * Secrets Manager
 *
 * Centralized secrets management for environment variables and secure configuration
 */

import { Logger } from '@nestjs/common';

const logger = new Logger('SecretsManager');

export interface SecretConfig {
  key: string;
  required?: boolean;
  defaultValue?: string;
  validate?: (value: string) => boolean;
}

/**
 * Get secret from environment with validation
 */
export function getSecret(config: SecretConfig): string {
  const { key, required = true, defaultValue, validate } = config;

  const value = process.env[key] || defaultValue;

  if (!value) {
    if (required) {
      throw new Error(`Required secret ${key} is not set`);
    }
    logger.warn(`Optional secret ${key} is not set, using empty value`);
    return '';
  }

  if (validate && !validate(value)) {
    throw new Error(`Secret ${key} failed validation`);
  }

  return value;
}

/**
 * Get all application secrets
 */
export function getAppSecrets() {
  return {
    // Application
    nodeEnv: getSecret({ key: 'NODE_ENV', defaultValue: 'development', required: false }),
    appVersion: getSecret({ key: 'APP_VERSION', defaultValue: '1.0.0', required: false }),
    port: getSecret({ key: 'PORT', defaultValue: '3000', required: false }),

    // Database
    databaseUrl: getSecret({ key: 'DATABASE_URL', required: true }),
    databaseDirectUrl: getSecret({ key: 'DATABASE_DIRECT_URL', required: false }),

    // Redis
    redisUrl: getSecret({ key: 'REDIS_URL', required: false }),

    // JWT
    jwtSecret: getSecret({
      key: 'JWT_SECRET',
      required: true,
      validate: (v) => v.length >= 32,
    }),
    jwtRefreshSecret: getSecret({
      key: 'JWT_REFRESH_SECRET',
      required: true,
      validate: (v) => v.length >= 32,
    }),

    // OAuth
    googleClientId: getSecret({ key: 'GOOGLE_CLIENT_ID', required: false }),
    googleClientSecret: getSecret({ key: 'GOOGLE_CLIENT_SECRET', required: false }),
    facebookAppId: getSecret({ key: 'FACEBOOK_APP_ID', required: false }),
    facebookAppSecret: getSecret({ key: 'FACEBOOK_APP_SECRET', required: false }),

    // AI Services
    openaiApiKey: getSecret({ key: 'OPENAI_API_KEY', required: false }),
    anthropicApiKey: getSecret({ key: 'ANTHROPIC_API_KEY', required: false }),

    // Pinecone
    pineconeApiKey: getSecret({ key: 'PINECONE_API_KEY', required: false }),
    pineconeEnvironment: getSecret({ key: 'PINECONE_ENVIRONMENT', required: false }),
    pineconeIndex: getSecret({ key: 'PINECONE_INDEX', required: false }),

    // Affiliate Networks
    amazonAccessKey: getSecret({ key: 'AMAZON_ACCESS_KEY', required: false }),
    amazonSecretKey: getSecret({ key: 'AMAZON_SECRET_KEY', required: false }),
    amazonPartnerTag: getSecret({ key: 'AMAZON_PARTNER_TAG', required: false }),
    shareasaleApiToken: getSecret({ key: 'SHAREASALE_API_TOKEN', required: false }),
    shareasaleAffiliateId: getSecret({ key: 'SHAREASALE_AFFILIATE_ID', required: false }),

    // Email
    smtpHost: getSecret({ key: 'SMTP_HOST', required: false }),
    smtpPort: getSecret({ key: 'SMTP_PORT', defaultValue: '587', required: false }),
    smtpUser: getSecret({ key: 'SMTP_USER', required: false }),
    smtpPassword: getSecret({ key: 'SMTP_PASSWORD', required: false }),
    emailFrom: getSecret({ key: 'EMAIL_FROM', defaultValue: 'noreply@mykadoo.com', required: false }),

    // Monitoring
    sentryDsn: getSecret({ key: 'SENTRY_DSN', required: false }),
    datadogApiKey: getSecret({ key: 'DATADOG_API_KEY', required: false }),

    // Security
    encryptionKey: getSecret({
      key: 'ENCRYPTION_KEY',
      required: true,
      validate: (v) => v.length === 32, // 256-bit key
    }),
  };
}

/**
 * Validate all required secrets are present
 */
export function validateSecrets(): void {
  try {
    getAppSecrets();
    logger.log('All required secrets validated successfully');
  } catch (error) {
    logger.error('Secret validation failed', error);
    throw error;
  }
}

/**
 * Mask secret for logging (show first 4 and last 4 characters)
 */
export function maskSecret(secret: string): string {
  if (secret.length <= 8) {
    return '***';
  }
  return `${secret.slice(0, 4)}...${secret.slice(-4)}`;
}

/**
 * Generate secure random secret
 */
export function generateSecret(length: number = 32): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let secret = '';
  const crypto = require('crypto');
  const bytes = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    secret += charset[bytes[i] % charset.length];
  }

  return secret;
}

/**
 * Rotate secret (for scheduled rotation)
 */
export async function rotateSecret(secretName: string): Promise<void> {
  // This would integrate with AWS Secrets Manager or HashiCorp Vault
  // For now, log the rotation request
  logger.log(`Secret rotation requested for ${secretName}`);

  // TODO: Implement actual rotation logic with secrets manager
  throw new Error('Secret rotation not yet implemented - requires secrets manager integration');
}

/**
 * Encryption utilities
 */
export class Encryption {
  private static algorithm = 'aes-256-gcm';
  private static crypto = require('crypto');

  /**
   * Encrypt data
   */
  static encrypt(data: string, key: string): string {
    const iv = this.crypto.randomBytes(16);
    const cipher = this.crypto.createCipheriv(this.algorithm, Buffer.from(key, 'hex'), iv);

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt data
   */
  static decrypt(encryptedData: string, key: string): string {
    const [ivHex, authTagHex, encrypted] = encryptedData.split(':');

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = this.crypto.createDecipheriv(this.algorithm, Buffer.from(key, 'hex'), iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Hash sensitive data (one-way)
   */
  static hash(data: string, salt?: string): string {
    const actualSalt = salt || this.crypto.randomBytes(16).toString('hex');
    const hash = this.crypto.pbkdf2Sync(data, actualSalt, 100000, 64, 'sha512').toString('hex');

    return salt ? hash : `${actualSalt}:${hash}`;
  }

  /**
   * Verify hash
   */
  static verifyHash(data: string, hashedData: string): boolean {
    const [salt, originalHash] = hashedData.split(':');
    const hash = this.hash(data, salt);

    return hash === originalHash;
  }
}
