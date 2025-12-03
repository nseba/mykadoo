import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cn } from '../../utils';

export interface RadioOption {
  value: string;
  label: string;
  helperText?: string;
  disabled?: boolean;
}

export interface RadioGroupProps extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> {
  /**
   * Radio options
   */
  options: RadioOption[];

  /**
   * Label for the radio group
   */
  label?: string;

  /**
   * Helper text for the group
   */
  helperText?: string;

  /**
   * Visual state
   */
  state?: 'default' | 'error';

  /**
   * Layout orientation
   */
  orientation?: 'horizontal' | 'vertical';
}

/**
 * RadioGroup component
 *
 * Radio button group with label and validation states.
 * Built on Radix UI for accessibility.
 *
 * @example
 * ```tsx
 * // Basic radio group
 * <RadioGroup
 *   label="Select size"
 *   options={[
 *     { value: 'sm', label: 'Small' },
 *     { value: 'md', label: 'Medium' },
 *     { value: 'lg', label: 'Large' },
 *   ]}
 * />
 *
 * // With helper text
 * <RadioGroup
 *   label="Delivery method"
 *   options={[
 *     { value: 'standard', label: 'Standard', helperText: '5-7 business days' },
 *     { value: 'express', label: 'Express', helperText: '2-3 business days' },
 *   ]}
 * />
 *
 * // Horizontal layout
 * <RadioGroup
 *   label="Gender"
 *   orientation="horizontal"
 *   options={[
 *     { value: 'male', label: 'Male' },
 *     { value: 'female', label: 'Female' },
 *     { value: 'other', label: 'Other' },
 *   ]}
 * />
 * ```
 */
export const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupProps
>(
  (
    {
      className,
      options,
      label,
      helperText,
      state = 'default',
      orientation = 'vertical',
      disabled,
      ...props
    },
    ref
  ) => {
    const groupId = React.useId();
    const helperTextId = helperText ? `${groupId}-helper` : undefined;

    return (
      <div className="w-full">
        {label && (
          <label
            className={cn(
              'block text-sm font-medium mb-2',
              disabled ? 'text-neutral-400' : 'text-neutral-700'
            )}
          >
            {label}
          </label>
        )}

        <RadioGroupPrimitive.Root
          ref={ref}
          className={cn(
            'flex',
            orientation === 'vertical' ? 'flex-col gap-3' : 'flex-row gap-4',
            className
          )}
          aria-describedby={helperTextId}
          disabled={disabled}
          {...props}
        >
          {options.map((option) => (
            <div key={option.value} className="flex items-start gap-3">
              <RadioGroupPrimitive.Item
                value={option.value}
                id={`${groupId}-${option.value}`}
                disabled={option.disabled || disabled}
                className={cn(
                  // Base styles
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                  'transition-colors duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2',
                  // Default state
                  state === 'default' && [
                    'border-neutral-300 bg-white',
                    'data-[state=checked]:border-primary-500 data-[state=checked]:bg-primary-50',
                    'focus:ring-primary-500',
                  ],
                  // Error state
                  state === 'error' && [
                    'border-error-500 bg-white',
                    'data-[state=checked]:border-error-500 data-[state=checked]:bg-error-50',
                    'focus:ring-error-500',
                  ],
                  // Disabled state
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                <RadioGroupPrimitive.Indicator
                  className={cn(
                    'h-2.5 w-2.5 rounded-full',
                    state === 'default' && 'bg-primary-500',
                    state === 'error' && 'bg-error-500'
                  )}
                />
              </RadioGroupPrimitive.Item>

              <div className="flex flex-col">
                <label
                  htmlFor={`${groupId}-${option.value}`}
                  className={cn(
                    'text-sm font-medium cursor-pointer select-none',
                    option.disabled || disabled
                      ? 'text-neutral-400 cursor-not-allowed'
                      : 'text-neutral-700'
                  )}
                >
                  {option.label}
                </label>

                {option.helperText && (
                  <p className="text-sm text-neutral-600 mt-0.5">{option.helperText}</p>
                )}
              </div>
            </div>
          ))}
        </RadioGroupPrimitive.Root>

        {helperText && (
          <p
            id={helperTextId}
            className={cn(
              'text-sm mt-2',
              state === 'error' && 'text-error-600',
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

RadioGroup.displayName = 'RadioGroup';
