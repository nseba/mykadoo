import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '../../utils';

export interface ToggleProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  /**
   * Label text
   */
  label?: string;

  /**
   * Helper text displayed below toggle
   */
  helperText?: string;

  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Toggle (Switch) component
 *
 * Toggle switch for binary on/off states.
 * Built on Radix UI for accessibility.
 *
 * @example
 * ```tsx
 * // Basic toggle
 * <Toggle label="Enable notifications" />
 *
 * // With helper text
 * <Toggle
 *   label="Dark mode"
 *   helperText="Switch between light and dark themes"
 * />
 *
 * // Controlled
 * <Toggle
 *   label="Auto-save"
 *   checked={autoSave}
 *   onCheckedChange={setAutoSave}
 * />
 *
 * // Different sizes
 * <Toggle label="Small" size="sm" />
 * <Toggle label="Medium" size="md" />
 * <Toggle label="Large" size="lg" />
 * ```
 */
export const Toggle = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  ToggleProps
>(({ className, label, helperText, size = 'md', id, disabled, ...props }, ref) => {
  const generatedId = React.useId();
  const toggleId = id || generatedId;
  const helperTextId = helperText ? `${toggleId}-helper` : undefined;

  const sizeStyles = {
    sm: {
      root: 'h-5 w-9',
      thumb: 'h-4 w-4 data-[state=checked]:translate-x-4',
    },
    md: {
      root: 'h-6 w-11',
      thumb: 'h-5 w-5 data-[state=checked]:translate-x-5',
    },
    lg: {
      root: 'h-7 w-14',
      thumb: 'h-6 w-6 data-[state=checked]:translate-x-7',
    },
  };

  return (
    <div className="flex items-start gap-3">
      <SwitchPrimitive.Root
        ref={ref}
        id={toggleId}
        className={cn(
          // Base styles
          'relative inline-flex shrink-0 rounded-full border-2 border-transparent',
          'transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
          // Unchecked state
          'bg-neutral-300',
          // Checked state
          'data-[state=checked]:bg-primary-500',
          // Disabled state
          'disabled:opacity-50 disabled:cursor-not-allowed',
          // Size
          sizeStyles[size].root,
          className
        )}
        aria-describedby={helperTextId}
        disabled={disabled}
        {...props}
      >
        <SwitchPrimitive.Thumb
          className={cn(
            'block rounded-full bg-white shadow-sm',
            'transition-transform duration-200',
            'translate-x-0.5',
            sizeStyles[size].thumb
          )}
        />
      </SwitchPrimitive.Root>

      {(label || helperText) && (
        <div className="flex flex-col">
          {label && (
            <label
              htmlFor={toggleId}
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
              className={cn('text-sm text-neutral-600 mt-0.5')}
            >
              {helperText}
            </p>
          )}
        </div>
      )}
    </div>
  );
});

Toggle.displayName = 'Toggle';
