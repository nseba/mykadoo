import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Card variant
   */
  variant?: 'default' | 'outlined' | 'elevated' | 'filled';
  /**
   * Padding size
   */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /**
   * Clickable card
   */
  hoverable?: boolean;
  /**
   * Card header
   */
  header?: React.ReactNode;
  /**
   * Card footer
   */
  footer?: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      hoverable = false,
      header,
      footer,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      default: 'bg-white border border-neutral-200',
      outlined: 'bg-transparent border-2 border-neutral-300',
      elevated: 'bg-white shadow-md border border-neutral-100',
      filled: 'bg-neutral-50 border border-neutral-200',
    };

    const paddingStyles = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg transition-all',
          variantStyles[variant],
          hoverable && 'cursor-pointer hover:shadow-lg hover:scale-[1.02]',
          className
        )}
        {...props}
      >
        {header && (
          <div className={cn('border-b border-neutral-200', paddingStyles[padding])}>
            {header}
          </div>
        )}

        {children && <div className={cn(paddingStyles[padding])}>{children}</div>}

        {footer && (
          <div className={cn('border-t border-neutral-200', paddingStyles[padding])}>
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';

/**
 * Card header component
 */
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, subtitle, action, children, className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-start justify-between', className)} {...props}>
      <div className="flex-1">
        {title && <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>}
        {subtitle && <p className="text-sm text-neutral-600 mt-1">{subtitle}</p>}
        {children}
      </div>
      {action && <div className="ml-4">{action}</div>}
    </div>
  )
);

CardHeader.displayName = 'CardHeader';

/**
 * Card content component
 */
export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-neutral-700', className)} {...props} />
  )
);

CardContent.displayName = 'CardContent';

/**
 * Card footer component
 */
export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center gap-2', className)} {...props} />
  )
);

CardFooter.displayName = 'CardFooter';
