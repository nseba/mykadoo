import * as React from 'react';
import { cn } from '../../utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Current progress value (0-100)
   */
  value: number;

  /**
   * Maximum value
   */
  max?: number;

  /**
   * Color variant
   */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';

  /**
   * Size of the progress bar
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Show percentage label
   */
  showLabel?: boolean;

  /**
   * Label text (overrides percentage)
   */
  label?: string;
}

const sizeMap = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

/**
 * Progress component
 *
 * Visual indicator of progress for tasks and loading states.
 *
 * @example
 * ```tsx
 * // Basic progress
 * <Progress value={65} />
 *
 * // With label
 * <Progress value={45} showLabel />
 *
 * // Different variants
 * <Progress value={80} variant="success" />
 * <Progress value={30} variant="warning" />
 *
 * // Custom label
 * <Progress value={75} label="Uploading... 75%" />
 * ```
 */
export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      value,
      max = 100,
      variant = 'primary',
      size = 'md',
      showLabel,
      label,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const displayLabel = label || (showLabel ? `${Math.round(percentage)}%` : undefined);

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {displayLabel && (
          <div className="mb-2 flex justify-between items-center">
            <span className="text-sm font-medium text-neutral-700">{displayLabel}</span>
          </div>
        )}

        <div
          className={cn(
            'w-full rounded-full bg-neutral-200 overflow-hidden',
            sizeMap[size]
          )}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        >
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300 ease-in-out',
              variant === 'primary' && 'bg-primary-500',
              variant === 'secondary' && 'bg-secondary-500',
              variant === 'success' && 'bg-success-500',
              variant === 'warning' && 'bg-warning-500',
              variant === 'error' && 'bg-error-500'
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);

Progress.displayName = 'Progress';
