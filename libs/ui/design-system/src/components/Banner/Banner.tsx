import * as React from 'react';
import { cn } from '../../utils';

export interface BannerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Banner content/message
   */
  children: React.ReactNode;

  /**
   * Visual variant
   */
  variant?: 'info' | 'success' | 'warning' | 'error';

  /**
   * Show icon
   */
  showIcon?: boolean;

  /**
   * Dismiss handler (shows close button if provided)
   */
  onDismiss?: () => void;

  /**
   * Action button
   */
  action?: React.ReactNode;

  /**
   * Position of the banner
   */
  position?: 'top' | 'bottom' | 'inline';
}

/**
 * Banner icons
 */
const BannerIcons = {
  info: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M10 6v4M10 14h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  success: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M6 10l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 2L2 17h16L10 2z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 8v4M10 15h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  error: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M7 7l6 6M13 7l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};

/**
 * Banner component
 *
 * Prominent message bar for announcements, warnings, or important information.
 *
 * @example
 * ```tsx
 * // Info banner
 * <Banner variant="info">
 *   New features are now available! Check out our latest updates.
 * </Banner>
 *
 * // Warning banner with dismiss
 * <Banner
 *   variant="warning"
 *   onDismiss={() => hideBanner()}
 * >
 *   Your session will expire in 5 minutes
 * </Banner>
 *
 * // Error banner with action
 * <Banner
 *   variant="error"
 *   action={<button>Retry</button>}
 * >
 *   Failed to save changes
 * </Banner>
 *
 * // Fixed position banner
 * <Banner variant="info" position="top">
 *   Cookie notice: We use cookies to improve your experience
 * </Banner>
 * ```
 */
export const Banner = React.forwardRef<HTMLDivElement, BannerProps>(
  (
    {
      className,
      children,
      variant = 'info',
      showIcon = true,
      onDismiss,
      action,
      position = 'inline',
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          'flex items-center gap-3 px-4 py-3 border-l-4',
          // Variants
          variant === 'info' && 'bg-info-50 border-info-500 text-info-900',
          variant === 'success' && 'bg-success-50 border-success-500 text-success-900',
          variant === 'warning' && 'bg-warning-50 border-warning-500 text-warning-900',
          variant === 'error' && 'bg-error-50 border-error-500 text-error-900',
          // Positioning
          position === 'top' && 'fixed top-0 left-0 right-0 z-50 rounded-none',
          position === 'bottom' && 'fixed bottom-0 left-0 right-0 z-50 rounded-none',
          position === 'inline' && 'rounded',
          className
        )}
        {...props}
      >
        {/* Icon */}
        {showIcon && (
          <div
            className={cn(
              'shrink-0',
              variant === 'info' && 'text-info-600',
              variant === 'success' && 'text-success-600',
              variant === 'warning' && 'text-warning-600',
              variant === 'error' && 'text-error-600'
            )}
          >
            {BannerIcons[variant]}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0 text-sm font-medium">
          {children}
        </div>

        {/* Action */}
        {action && (
          <div className="shrink-0">
            {action}
          </div>
        )}

        {/* Dismiss button */}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className={cn(
              'shrink-0 transition-colors',
              variant === 'info' && 'text-info-600 hover:text-info-800',
              variant === 'success' && 'text-success-600 hover:text-success-800',
              variant === 'warning' && 'text-warning-600 hover:text-warning-800',
              variant === 'error' && 'text-error-600 hover:text-error-800'
            )}
            aria-label="Dismiss banner"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

Banner.displayName = 'Banner';
