import * as React from 'react';
import { cn } from '../../utils';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Alert variant
   */
  variant?: 'info' | 'success' | 'warning' | 'error';

  /**
   * Alert title
   */
  title?: string;

  /**
   * Show close button
   */
  closable?: boolean;

  /**
   * Callback when close button is clicked
   */
  onClose?: () => void;

  /**
   * Custom icon
   */
  icon?: React.ReactNode;
}

/**
 * Default icons for each variant
 */
const DefaultIcons = {
  info: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M10 6v4M10 14h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  success: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M6 10l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 2L2 17h16L10 2z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 8v4M10 15h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  error: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M7 7l6 6M13 7l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
};

/**
 * Alert component
 *
 * Display contextual feedback messages with different severity levels.
 *
 * @example
 * ```tsx
 * // Basic alert
 * <Alert variant="info">
 *   This is an informational message
 * </Alert>
 *
 * // With title
 * <Alert variant="success" title="Success!">
 *   Your changes have been saved
 * </Alert>
 *
 * // Closable
 * <Alert variant="warning" closable onClose={() => console.log('closed')}>
 *   Please review your settings
 * </Alert>
 * ```
 */
export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant = 'info',
      title,
      closable,
      onClose,
      icon,
      children,
      ...props
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = React.useState(true);

    const handleClose = () => {
      setIsVisible(false);
      onClose?.();
    };

    if (!isVisible) return null;

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          // Base styles
          'relative rounded-lg border p-4',
          'flex gap-3',
          // Variant styles
          variant === 'info' && 'bg-info-50 border-info-200 text-info-900',
          variant === 'success' && 'bg-success-50 border-success-200 text-success-900',
          variant === 'warning' && 'bg-warning-50 border-warning-200 text-warning-900',
          variant === 'error' && 'bg-error-50 border-error-200 text-error-900',
          className
        )}
        {...props}
      >
        {/* Icon */}
        <div
          className={cn(
            'shrink-0',
            variant === 'info' && 'text-info-600',
            variant === 'success' && 'text-success-600',
            variant === 'warning' && 'text-warning-600',
            variant === 'error' && 'text-error-600'
          )}
        >
          {icon || DefaultIcons[variant]}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <h5 className="font-semibold mb-1">
              {title}
            </h5>
          )}
          <div className="text-sm">
            {children}
          </div>
        </div>

        {/* Close button */}
        {closable && (
          <button
            type="button"
            onClick={handleClose}
            className={cn(
              'shrink-0 rounded p-1 transition-colors',
              'hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2',
              variant === 'info' && 'text-info-600 focus:ring-info-500',
              variant === 'success' && 'text-success-600 focus:ring-success-500',
              variant === 'warning' && 'text-warning-600 focus:ring-warning-500',
              variant === 'error' && 'text-error-600 focus:ring-error-500'
            )}
            aria-label="Close alert"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = 'Alert';
