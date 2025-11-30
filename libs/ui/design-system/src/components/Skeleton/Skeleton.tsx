import * as React from 'react';
import { cn } from '../../utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Variant shape
   */
  variant?: 'text' | 'circular' | 'rectangular';

  /**
   * Width of the skeleton
   */
  width?: string | number;

  /**
   * Height of the skeleton
   */
  height?: string | number;

  /**
   * Animation type
   */
  animation?: 'pulse' | 'wave' | 'none';
}

/**
 * Skeleton component
 *
 * Placeholder for loading content.
 *
 * @example
 * ```tsx
 * // Text skeleton
 * <Skeleton variant="text" width="80%" />
 *
 * // Circular (avatar)
 * <Skeleton variant="circular" width={40} height={40} />
 *
 * // Rectangular (image)
 * <Skeleton variant="rectangular" width="100%" height={200} />
 *
 * // Card skeleton
 * <div>
 *   <Skeleton variant="rectangular" height={200} />
 *   <Skeleton variant="text" width="60%" />
 *   <Skeleton variant="text" width="80%" />
 * </div>
 * ```
 */
export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      className,
      variant = 'text',
      width,
      height,
      animation = 'pulse',
      style,
      ...props
    },
    ref
  ) => {
    const computedStyle: React.CSSProperties = {
      ...style,
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
    };

    return (
      <div
        ref={ref}
        className={cn(
          'bg-neutral-200',
          // Animations
          animation === 'pulse' && 'animate-pulse',
          animation === 'wave' && 'animate-shimmer bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 bg-[length:200%_100%]',
          // Variants
          variant === 'text' && 'rounded h-4',
          variant === 'circular' && 'rounded-full',
          variant === 'rectangular' && 'rounded',
          className
        )}
        style={computedStyle}
        aria-busy="true"
        aria-live="polite"
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

/**
 * Pre-built skeleton layouts
 */
export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('space-y-3', className)}>
    <Skeleton variant="rectangular" height={200} />
    <Skeleton variant="text" width="60%" />
    <Skeleton variant="text" width="80%" />
    <Skeleton variant="text" width="40%" />
  </div>
);

export const SkeletonAvatar: React.FC<{ className?: string; size?: number }> = ({ className, size = 40 }) => (
  <div className={cn('flex items-center gap-3', className)}>
    <Skeleton variant="circular" width={size} height={size} />
    <div className="flex-1 space-y-2">
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="40%" />
    </div>
  </div>
);

export const SkeletonList: React.FC<{ className?: string; items?: number }> = ({ className, items = 3 }) => (
  <div className={cn('space-y-4', className)}>
    {Array.from({ length: items }).map((_, i) => (
      <SkeletonAvatar key={i} />
    ))}
  </div>
);
