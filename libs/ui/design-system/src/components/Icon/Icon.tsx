import React from 'react';
import { LucideIcon, LucideProps } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface IconProps extends Omit<LucideProps, 'size'> {
  /**
   * Icon component from lucide-react
   */
  icon: LucideIcon;
  /**
   * Size variant
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Color variant
   */
  color?: 'current' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';
}

const sizeMap = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

const colorMap = {
  current: 'currentColor',
  primary: 'text-primary-600',
  secondary: 'text-secondary-600',
  success: 'text-success-600',
  warning: 'text-warning-600',
  error: 'text-error-600',
  neutral: 'text-neutral-600',
};

export const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ icon: LucideIcon, size = 'md', color = 'current', className, ...props }, ref) => {
    return (
      <LucideIcon
        ref={ref}
        size={sizeMap[size]}
        className={cn(color !== 'current' && colorMap[color], className)}
        {...props}
      />
    );
  }
);

Icon.displayName = 'Icon';
