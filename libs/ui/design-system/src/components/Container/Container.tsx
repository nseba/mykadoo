import React from 'react';
import { cn } from '../../utils/cn';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Max width size
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  /**
   * Center content
   */
  centered?: boolean;
  /**
   * Padding
   */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ size = 'lg', centered = true, padding = 'md', className, ...props }, ref) => {
    const sizeStyles = {
      sm: 'max-w-screen-sm',
      md: 'max-w-screen-md',
      lg: 'max-w-screen-lg',
      xl: 'max-w-screen-xl',
      '2xl': 'max-w-screen-2xl',
      full: 'max-w-full',
    };

    const paddingStyles = {
      none: '',
      sm: 'px-4',
      md: 'px-6',
      lg: 'px-8',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'w-full',
          sizeStyles[size],
          centered && 'mx-auto',
          paddingStyles[padding],
          className
        )}
        {...props}
      />
    );
  }
);

Container.displayName = 'Container';
