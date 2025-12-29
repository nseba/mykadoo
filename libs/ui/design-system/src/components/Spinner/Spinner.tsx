import * as React from 'react';
import { cn } from '../../utils';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Size of the spinner
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Color variant
   */
  variant?: 'primary' | 'secondary' | 'neutral' | 'white';

  /**
   * Optional label for accessibility
   */
  label?: string;
}

const sizeMap = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-3',
  xl: 'w-16 h-16 border-4',
};

/**
 * Spinner component
 *
 * Loading spinner for indicating async operations.
 * Respects prefers-reduced-motion with a static alternative.
 *
 * @example
 * ```tsx
 * // Basic spinner
 * <Spinner />
 *
 * // Different sizes
 * <Spinner size="sm" />
 * <Spinner size="lg" />
 *
 * // Different colors
 * <Spinner variant="secondary" />
 *
 * // With label
 * <Spinner label="Loading data..." />
 * ```
 */
export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  (
    {
      className,
      size = 'md',
      variant = 'primary',
      label = 'Loading...',
      ...props
    },
    ref
  ) => {
    const colorClasses = cn(
      variant === 'primary' && 'border-primary-500 text-primary-500',
      variant === 'secondary' && 'border-secondary-500 text-secondary-500',
      variant === 'neutral' && 'border-neutral-400 text-neutral-400',
      variant === 'white' && 'border-white text-white'
    );

    return (
      <div
        ref={ref}
        role="status"
        aria-label={label}
        className={cn('inline-flex items-center justify-center', className)}
        {...props}
      >
        {/* Animated spinner - shown when motion is allowed */}
        <div
          className={cn(
            'motion-reduce:hidden animate-spin rounded-full border-solid border-t-transparent',
            sizeMap[size],
            colorClasses
          )}
          aria-hidden="true"
        />
        {/* Static indicator - shown when reduced motion is preferred */}
        <div
          className={cn(
            'hidden motion-reduce:flex items-center justify-center rounded-full border-2 border-current',
            sizeMap[size],
            colorClasses
          )}
          aria-hidden="true"
        >
          <span className="text-xs font-bold">···</span>
        </div>
        <span className="sr-only">{label}</span>
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';
