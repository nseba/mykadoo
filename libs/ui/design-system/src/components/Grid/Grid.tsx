import React from 'react';
import { cn } from '../../utils/cn';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Number of columns (1-12)
   */
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  /**
   * Gap between items
   */
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Responsive columns
   */
  responsive?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ cols = 1, gap = 'md', responsive, className, ...props }, ref) => {
    const colsStyles = {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6',
      7: 'grid-cols-7',
      8: 'grid-cols-8',
      9: 'grid-cols-9',
      10: 'grid-cols-10',
      11: 'grid-cols-11',
      12: 'grid-cols-12',
    };

    const gapStyles = {
      none: 'gap-0',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
    };

    const responsiveClasses = responsive
      ? [
          responsive.sm && `sm:grid-cols-${responsive.sm}`,
          responsive.md && `md:grid-cols-${responsive.md}`,
          responsive.lg && `lg:grid-cols-${responsive.lg}`,
          responsive.xl && `xl:grid-cols-${responsive.xl}`,
        ].filter(Boolean)
      : [];

    return (
      <div
        ref={ref}
        className={cn(
          'grid',
          colsStyles[cols],
          gapStyles[gap],
          ...responsiveClasses,
          className
        )}
        {...props}
      />
    );
  }
);

Grid.displayName = 'Grid';
