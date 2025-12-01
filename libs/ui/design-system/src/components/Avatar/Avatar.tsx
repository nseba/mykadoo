import React from 'react';
import { cn } from '../../utils/cn';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Image source
   */
  src?: string;
  /**
   * Alt text for image
   */
  alt?: string;
  /**
   * Fallback text (initials)
   */
  fallback?: string;
  /**
   * Size variant
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /**
   * Shape variant
   */
  shape?: 'circle' | 'square';
  /**
   * Status indicator
   */
  status?: 'online' | 'offline' | 'away' | 'busy';
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      alt = '',
      fallback,
      size = 'md',
      shape = 'circle',
      status,
      className,
      ...props
    },
    ref
  ) => {
    const [imageError, setImageError] = React.useState(false);

    const sizeStyles = {
      xs: 'h-6 w-6 text-xs',
      sm: 'h-8 w-8 text-sm',
      md: 'h-10 w-10 text-base',
      lg: 'h-12 w-12 text-lg',
      xl: 'h-16 w-16 text-xl',
      '2xl': 'h-20 w-20 text-2xl',
    };

    const shapeStyles = {
      circle: 'rounded-full',
      square: 'rounded-md',
    };

    const statusColors = {
      online: 'bg-success-500',
      offline: 'bg-neutral-400',
      away: 'bg-warning-500',
      busy: 'bg-error-500',
    };

    const statusSizes = {
      xs: 'h-1.5 w-1.5',
      sm: 'h-2 w-2',
      md: 'h-2.5 w-2.5',
      lg: 'h-3 w-3',
      xl: 'h-4 w-4',
      '2xl': 'h-5 w-5',
    };

    const showFallback = !src || imageError;

    return (
      <div ref={ref} className={cn('relative inline-block', className)} {...props}>
        <div
          className={cn(
            'flex items-center justify-center overflow-hidden bg-neutral-200 font-semibold text-neutral-600',
            sizeStyles[size],
            shapeStyles[shape]
          )}
        >
          {!showFallback ? (
            <img
              src={src}
              alt={alt}
              className="h-full w-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <span className="uppercase">{fallback || alt.charAt(0) || '?'}</span>
          )}
        </div>

        {/* Status indicator */}
        {status && (
          <span
            className={cn(
              'absolute bottom-0 right-0 rounded-full border-2 border-white',
              statusColors[status],
              statusSizes[size]
            )}
            aria-label={`Status: ${status}`}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

/**
 * Avatar group component for displaying multiple avatars
 */
export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Maximum number of avatars to show
   */
  max?: number;
  /**
   * Size of avatars
   */
  size?: AvatarProps['size'];
  /**
   * Shape of avatars
   */
  shape?: AvatarProps['shape'];
}

export const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ max = 3, size = 'md', shape = 'circle', children, className, ...props }, ref) => {
    const childrenArray = React.Children.toArray(children);
    const visibleChildren = childrenArray.slice(0, max);
    const remainingCount = childrenArray.length - max;

    return (
      <div ref={ref} className={cn('flex -space-x-2', className)} {...props}>
        {visibleChildren.map((child, index) =>
          React.cloneElement(child as React.ReactElement, {
            key: index,
            size,
            shape,
            className: 'ring-2 ring-white',
          })
        )}
        {remainingCount > 0 && (
          <Avatar
            fallback={`+${remainingCount}`}
            size={size}
            shape={shape}
            className="ring-2 ring-white bg-neutral-300"
          />
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = 'AvatarGroup';
