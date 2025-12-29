import * as React from 'react';
import { cn } from '../../utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Visual state of the input
   */
  state?: 'default' | 'error' | 'success';

  /**
   * Icon to display before input
   */
  leftIcon?: React.ReactNode;

  /**
   * Icon to display after input
   */
  rightIcon?: React.ReactNode;

  /**
   * Helper text displayed below input
   */
  helperText?: string;

  /**
   * Label text
   */
  label?: string;

  /**
   * Additional className for input wrapper
   */
  wrapperClassName?: string;
}

/**
 * Input component
 *
 * Text input field with validation states, icons, and helper text.
 * Built with accessibility in mind.
 *
 * @example
 * ```tsx
 * // Basic input
 * <Input label="Email" type="email" placeholder="you@example.com" />
 *
 * // With validation state
 * <Input
 *   label="Password"
 *   type="password"
 *   state="error"
 *   helperText="Password must be at least 8 characters"
 * />
 *
 * // With icons
 * <Input
 *   label="Search"
 *   leftIcon={<SearchIcon />}
 *   placeholder="Search..."
 * />
 * ```
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      state = 'default',
      leftIcon,
      rightIcon,
      helperText,
      label,
      wrapperClassName,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    // Generate unique ID if not provided
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const helperTextId = helperText ? `${inputId}-helper` : undefined;

    return (
      <div className={cn('w-full', wrapperClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium mb-1.5',
              disabled ? 'text-neutral-400' : 'text-neutral-700'
            )}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              // Base styles
              'w-full rounded-lg border bg-white px-4 py-2',
              'text-neutral-900 placeholder-neutral-400',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              // WCAG 2.5.5: Minimum 44px height for touch targets
              'min-h-[44px]',
              // Disabled state
              'disabled:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-400',
              // Icon spacing
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              // State styles
              state === 'default' && 'border-neutral-300 focus:ring-primary-500 focus:border-primary-500',
              state === 'error' && 'border-error-500 focus:ring-error-500 focus:border-error-500',
              state === 'success' && 'border-success-500 focus:ring-success-500 focus:border-success-500',
              className
            )}
            aria-invalid={state === 'error' ? 'true' : undefined}
            aria-describedby={helperTextId}
            disabled={disabled}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>

        {helperText && (
          <p
            id={helperTextId}
            className={cn(
              'mt-1.5 text-sm',
              state === 'error' && 'text-error-600',
              state === 'success' && 'text-success-600',
              state === 'default' && 'text-neutral-600'
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
