import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { cn } from '../../utils';

export interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  /**
   * Label text
   */
  label?: string;

  /**
   * Helper text displayed below checkbox
   */
  helperText?: string;

  /**
   * Visual state
   */
  state?: 'default' | 'error';
}

/**
 * Checkbox Icon
 */
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M10 3L4.5 8.5L2 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Checkbox component
 *
 * Checkbox input with label and validation states.
 * Built on Radix UI for accessibility.
 *
 * @example
 * ```tsx
 * // Basic checkbox
 * <Checkbox label="Accept terms and conditions" />
 *
 * // With helper text
 * <Checkbox
 *   label="Subscribe to newsletter"
 *   helperText="Get weekly updates about new products"
 * />
 *
 * // With error state
 * <Checkbox
 *   label="I agree"
 *   state="error"
 *   helperText="You must accept to continue"
 * />
 * ```
 */
export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, label, helperText, state = 'default', id, disabled, ...props }, ref) => {
  const checkboxId = id || React.useId();
  const helperTextId = helperText ? `${checkboxId}-helper` : undefined;

  return (
    <div className="flex items-start gap-3">
      <CheckboxPrimitive.Root
        ref={ref}
        id={checkboxId}
        className={cn(
          // Base styles
          'flex h-5 w-5 shrink-0 items-center justify-center rounded border-2',
          'transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          // Default state
          state === 'default' && [
            'border-neutral-300 bg-white',
            'data-[state=checked]:bg-primary-500 data-[state=checked]:border-primary-500',
            'focus:ring-primary-500',
          ],
          // Error state
          state === 'error' && [
            'border-error-500 bg-white',
            'data-[state=checked]:bg-error-500 data-[state=checked]:border-error-500',
            'focus:ring-error-500',
          ],
          // Disabled state
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        aria-describedby={helperTextId}
        disabled={disabled}
        {...props}
      >
        <CheckboxPrimitive.Indicator className="text-white">
          <CheckIcon />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>

      {(label || helperText) && (
        <div className="flex flex-col">
          {label && (
            <label
              htmlFor={checkboxId}
              className={cn(
                'text-sm font-medium cursor-pointer select-none',
                disabled ? 'text-neutral-400 cursor-not-allowed' : 'text-neutral-700'
              )}
            >
              {label}
            </label>
          )}

          {helperText && (
            <p
              id={helperTextId}
              className={cn(
                'text-sm mt-0.5',
                state === 'error' && 'text-error-600',
                state === 'default' && 'text-neutral-600'
              )}
            >
              {helperText}
            </p>
          )}
        </div>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';
