import React from 'react';
import { cn } from '../../utils/cn';

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Spacing between items
   */
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /**
   * Alignment
   */
  align?: 'start' | 'center' | 'end' | 'stretch';
  /**
   * Justify
   */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  /**
   * Direction (horizontal or vertical)
   */
  direction?: 'vertical' | 'horizontal';
  /**
   * Wrap items
   */
  wrap?: boolean;
}

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  (
    {
      spacing = 'md',
      align = 'stretch',
      justify = 'start',
      direction = 'vertical',
      wrap = false,
      className,
      ...props
    },
    ref
  ) => {
    const spacingStyles = {
      none: 'gap-0',
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
      '2xl': 'gap-12',
    };

    const alignStyles = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
    };

    const justifyStyles = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          direction === 'vertical' ? 'flex-col' : 'flex-row',
          spacingStyles[spacing],
          alignStyles[align],
          justifyStyles[justify],
          wrap && 'flex-wrap',
          className
        )}
        {...props}
      />
    );
  }
);

Stack.displayName = 'Stack';
