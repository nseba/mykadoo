import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../utils';

/**
 * Button variants configuration
 * Uses design tokens from the Mykadoo design system
 */
const buttonVariants = {
  variant: {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 active:bg-secondary-700 focus:ring-secondary-500',
    tertiary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 active:bg-neutral-300 focus:ring-neutral-300',
    outline: 'bg-transparent border-2 border-neutral-300 text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100 focus:ring-neutral-300',
    ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 focus:ring-neutral-300',
    danger: 'bg-error-500 text-white hover:bg-error-700 active:bg-error-900 focus:ring-error-500',
  },
  size: {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    icon: 'p-2',
  },
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual style variant
   * @default 'primary'
   */
  variant?: keyof typeof buttonVariants.variant;

  /**
   * Button size
   * @default 'md'
   */
  size?: keyof typeof buttonVariants.size;

  /**
   * If true, renders as a child component (polymorphic)
   * Useful for rendering as Link, etc.
   */
  asChild?: boolean;

  /**
   * If true, shows loading spinner and disables interaction
   */
  loading?: boolean;

  /**
   * Icon to display before children
   */
  leftIcon?: React.ReactNode;

  /**
   * Icon to display after children
   */
  rightIcon?: React.ReactNode;

  /**
   * Additional className to merge
   */
  className?: string;
}

/**
 * Loading spinner component
 */
const LoadingSpinner: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={cn('animate-spin', className)}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    width="16"
    height="16"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

/**
 * Button component
 *
 * Versatile button component with multiple variants, sizes, and states.
 * Built with accessibility in mind, supporting keyboard navigation and screen readers.
 *
 * @example
 * ```tsx
 * // Primary button
 * <Button>Click me</Button>
 *
 * // Secondary button with icon
 * <Button variant="secondary" leftIcon={<HeartIcon />}>
 *   Favorite
 * </Button>
 *
 * // Loading state
 * <Button loading>Saving...</Button>
 *
 * // As a Link (polymorphic)
 * <Button asChild>
 *   <Link href="/about">About</Link>
 * </Button>
 *
 * // Icon-only button
 * <Button size="icon" aria-label="Close">
 *   <XIcon />
 * </Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      asChild = false,
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';

    const isDisabled = disabled || loading;

    return (
      <Comp
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center gap-2 rounded-lg font-semibold',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          // Variant styles
          buttonVariants.variant[variant],
          // Size styles
          buttonVariants.size[size],
          // Custom className
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {loading && <LoadingSpinner />}
        {!loading && leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </Comp>
    );
  }
);

Button.displayName = 'Button';
