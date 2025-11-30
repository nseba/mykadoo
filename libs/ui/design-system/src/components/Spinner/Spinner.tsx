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
    return (
      <div
        ref={ref}
        role="status"
        aria-label={label}
        className={cn('inline-flex items-center justify-center', className)}
        {...props}
      >
        <div
          className={cn(
            'animate-spin rounded-full border-solid border-t-transparent',
            sizeMap[size],
            variant === 'primary' && 'border-primary-300',
            variant === 'secondary' && 'border-secondary-500',
            variant === 'neutral' && 'border-neutral-400',
            variant === 'white' && 'border-white'
          )}
        />
        <span className="sr-only">{label}</span>
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';
