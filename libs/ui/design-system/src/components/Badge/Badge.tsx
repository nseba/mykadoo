import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Badge variant
   */
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  /**
   * Badge size
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Dot indicator
   */
  dot?: boolean;
  /**
   * Removable badge
   */
  onRemove?: () => void;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', size = 'md', dot = false, onRemove, children, className, ...props }, ref) => {
    const variantStyles = {
      default: 'bg-neutral-100 text-neutral-800 border-neutral-200',
      primary: 'bg-primary-100 text-primary-800 border-primary-200',
      secondary: 'bg-secondary-100 text-secondary-800 border-secondary-200',
      success: 'bg-success-100 text-success-800 border-success-200',
      warning: 'bg-warning-100 text-warning-800 border-warning-200',
      error: 'bg-error-100 text-error-800 border-error-200',
      info: 'bg-info-100 text-info-800 border-info-200',
    };

    const sizeStyles = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full font-medium border',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              variant === 'default' && 'bg-neutral-500',
              variant === 'primary' && 'bg-primary-600',
              variant === 'secondary' && 'bg-secondary-600',
              variant === 'success' && 'bg-success-600',
              variant === 'warning' && 'bg-warning-600',
              variant === 'error' && 'bg-error-600',
              variant === 'info' && 'bg-info-600'
            )}
          />
        )}
        {children}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className={cn(
              'inline-flex items-center justify-center rounded-full',
              'hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-current focus:ring-offset-1'
            )}
            aria-label="Remove"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
