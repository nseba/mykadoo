import * as React from 'react';
import { cn } from '../../utils';

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Error title
   */
  title?: string;

  /**
   * Error message/description
   */
  message?: string;

  /**
   * Error severity level
   */
  variant?: 'error' | 'warning' | 'info';

  /**
   * Retry action button
   */
  onRetry?: () => void;

  /**
   * Custom action button
   */
  action?: React.ReactNode;

  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Show error icon
   */
  showIcon?: boolean;
}

const sizeMap = {
  sm: {
    container: 'py-8',
    icon: 'w-12 h-12',
    title: 'text-base',
    message: 'text-sm',
  },
  md: {
    container: 'py-12',
    icon: 'w-16 h-16',
    title: 'text-lg',
    message: 'text-base',
  },
  lg: {
    container: 'py-16',
    icon: 'w-24 h-24',
    title: 'text-xl',
    message: 'text-lg',
  },
};

/**
 * Error icons for each variant
 */
const ErrorIcons = {
  error: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M22 22l20 20M42 22l-20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path
        d="M32 4L4 56h56L32 4z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M32 22v16M32 46h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M32 18v4M32 30v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};

/**
 * ErrorState component
 *
 * Display error states with optional retry functionality.
 *
 * @example
 * ```tsx
 * // Basic error
 * <ErrorState
 *   title="Something went wrong"
 *   message="We couldn't load your data. Please try again."
 *   onRetry={() => refetch()}
 * />
 *
 * // Warning variant
 * <ErrorState
 *   variant="warning"
 *   title="Partial failure"
 *   message="Some items couldn't be loaded"
 * />
 *
 * // Custom action
 * <ErrorState
 *   title="Access denied"
 *   message="You don't have permission to view this content"
 *   action={<Button variant="primary">Go Back</Button>}
 * />
 * ```
 */
export const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  (
    {
      className,
      title = 'Something went wrong',
      message = 'An error occurred. Please try again.',
      variant = 'error',
      onRetry,
      action,
      size = 'md',
      showIcon = true,
      ...props
    },
    ref
  ) => {
    const sizes = sizeMap[size];

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center text-center',
          sizes.container,
          className
        )}
        role="alert"
        aria-live="assertive"
        {...props}
      >
        {/* Icon */}
        {showIcon && (
          <div
            className={cn(
              'mb-4',
              sizes.icon,
              variant === 'error' && 'text-error-500',
              variant === 'warning' && 'text-warning-500',
              variant === 'info' && 'text-info-500'
            )}
          >
            {ErrorIcons[variant]}
          </div>
        )}

        {/* Title */}
        <h3 className={cn('font-semibold text-neutral-900 mb-2', sizes.title)}>
          {title}
        </h3>

        {/* Message */}
        {message && (
          <p className={cn('text-neutral-600 max-w-md mb-6', sizes.message)}>
            {message}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 active:bg-primary-700 transition-colors font-medium"
            >
              Try Again
            </button>
          )}
          {action}
        </div>
      </div>
    );
  }
);

ErrorState.displayName = 'ErrorState';
