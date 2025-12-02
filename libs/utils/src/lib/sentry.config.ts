/**
 * Sentry Error Tracking Configuration
 *
 * Centralized configuration for error tracking and monitoring
 */

export interface SentryConfig {
  dsn: string;
  environment: string;
  release?: string;
  tracesSampleRate: number;
  enabled: boolean;
}

/**
 * Get Sentry configuration from environment
 */
export function getSentryConfig(): SentryConfig {
  return {
    dsn: process.env.SENTRY_DSN || '',
    environment: process.env.NODE_ENV || 'development',
    release: process.env.APP_VERSION || 'unknown',
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
    enabled: process.env.SENTRY_ENABLED === 'true' && !!process.env.SENTRY_DSN,
  };
}

/**
 * Initialize Sentry for NestJS backend
 */
export async function initSentryBackend(): Promise<void> {
  const config = getSentryConfig();

  if (!config.enabled) {
    console.log('Sentry disabled - skipping initialization');
    return;
  }

  try {
    const Sentry = await import('@sentry/node');

    Sentry.init({
      dsn: config.dsn,
      environment: config.environment,
      release: config.release,
      tracesSampleRate: config.tracesSampleRate,

      // Performance monitoring
      integrations: [
        // Prisma integration
        new Sentry.Integrations.Prisma({ client: undefined }),
      ],

      // Error filtering
      beforeSend(event, hint) {
        // Don't send errors in development
        if (config.environment === 'development') {
          console.log('Sentry event (dev mode):', event);
          return null;
        }

        // Filter out known non-critical errors
        const error = hint.originalException;
        if (error && typeof error === 'object') {
          const errorMessage = (error as Error).message || '';

          // Don't track validation errors
          if (errorMessage.includes('Validation failed')) {
            return null;
          }

          // Don't track 401/403 errors
          if (errorMessage.includes('Unauthorized') || errorMessage.includes('Forbidden')) {
            return null;
          }
        }

        return event;
      },
    });

    console.log(`Sentry initialized for ${config.environment}`);
  } catch (error) {
    console.error('Failed to initialize Sentry:', error);
  }
}

/**
 * Initialize Sentry for Next.js frontend
 */
export async function initSentryFrontend(): Promise<void> {
  const config = getSentryConfig();

  if (!config.enabled) {
    console.log('Sentry disabled - skipping initialization');
    return;
  }

  try {
    const Sentry = await import('@sentry/nextjs');

    Sentry.init({
      dsn: config.dsn,
      environment: config.environment,
      release: config.release,
      tracesSampleRate: config.tracesSampleRate,

      // Replay configuration
      replaysSessionSampleRate: 0.1, // 10% of sessions
      replaysOnErrorSampleRate: 1.0, // 100% of errors

      integrations: [
        new Sentry.Replay({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],

      // Error filtering
      beforeSend(event) {
        // Don't send errors in development
        if (config.environment === 'development') {
          console.log('Sentry event (dev mode):', event);
          return null;
        }

        return event;
      },
    });

    console.log(`Sentry initialized for ${config.environment}`);
  } catch (error) {
    console.error('Failed to initialize Sentry:', error);
  }
}

/**
 * Capture error with context
 */
export async function captureError(
  error: Error,
  context?: {
    userId?: string;
    tags?: Record<string, string>;
    extra?: Record<string, any>;
  }
): Promise<void> {
  const config = getSentryConfig();

  if (!config.enabled) {
    console.error('Error (Sentry disabled):', error, context);
    return;
  }

  try {
    const Sentry = await import('@sentry/node');

    Sentry.withScope((scope) => {
      if (context?.userId) {
        scope.setUser({ id: context.userId });
      }

      if (context?.tags) {
        Object.entries(context.tags).forEach(([key, value]) => {
          scope.setTag(key, value);
        });
      }

      if (context?.extra) {
        Object.entries(context.extra).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
      }

      Sentry.captureException(error);
    });
  } catch (err) {
    console.error('Failed to capture error in Sentry:', err);
  }
}

/**
 * Capture message with context
 */
export async function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: Record<string, any>
): Promise<void> {
  const config = getSentryConfig();

  if (!config.enabled) {
    console.log(`Message (Sentry disabled) [${level}]:`, message, context);
    return;
  }

  try {
    const Sentry = await import('@sentry/node');

    Sentry.withScope((scope) => {
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
      }

      Sentry.captureMessage(message, level);
    });
  } catch (err) {
    console.error('Failed to capture message in Sentry:', err);
  }
}
