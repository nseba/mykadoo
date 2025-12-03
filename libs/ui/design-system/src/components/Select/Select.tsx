import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { cn } from '../../utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  /**
   * Select options
   */
  options: SelectOption[];

  /**
   * Label text
   */
  label?: string;

  /**
   * Helper text displayed below select
   */
  helperText?: string;

  /**
   * Visual state
   */
  state?: 'default' | 'error' | 'success';

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Current value
   */
  value?: string;

  /**
   * Default value (uncontrolled)
   */
  defaultValue?: string;

  /**
   * Callback when value changes
   */
  onValueChange?: (value: string) => void;

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Required field
   */
  required?: boolean;

  /**
   * Additional className for select wrapper
   */
  wrapperClassName?: string;

  /**
   * ID for the select
   */
  id?: string;
}

/**
 * Chevron Down Icon
 */
const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M4 6L8 10L12 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Check Icon
 */
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M13 4L6 11L3 8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Select component
 *
 * Dropdown select field with validation states and accessibility.
 * Built on Radix UI for full keyboard navigation and screen reader support.
 *
 * @example
 * ```tsx
 * // Basic select
 * <Select
 *   label="Country"
 *   placeholder="Select country"
 *   options={[
 *     { value: 'us', label: 'United States' },
 *     { value: 'ca', label: 'Canada' },
 *     { value: 'uk', label: 'United Kingdom' },
 *   ]}
 * />
 *
 * // With validation
 * <Select
 *   label="Size"
 *   state="error"
 *   helperText="Please select a size"
 *   options={[
 *     { value: 's', label: 'Small' },
 *     { value: 'm', label: 'Medium' },
 *     { value: 'l', label: 'Large' },
 *   ]}
 * />
 *
 * // Controlled
 * <Select
 *   label="Color"
 *   value={color}
 *   onValueChange={setColor}
 *   options={colorOptions}
 * />
 * ```
 */
export const Select: React.FC<SelectProps> = ({
  options,
  label,
  helperText,
  state = 'default',
  placeholder = 'Select an option',
  value,
  defaultValue,
  onValueChange,
  disabled,
  required,
  wrapperClassName,
  id,
}) => {
  const generatedId = React.useId();
  const selectId = id || generatedId;
  const helperTextId = helperText ? `${selectId}-helper` : undefined;

  return (
    <div className={cn('w-full', wrapperClassName)}>
      {label && (
        <label
          htmlFor={selectId}
          className={cn(
            'block text-sm font-medium mb-1.5',
            disabled ? 'text-neutral-400' : 'text-neutral-700'
          )}
        >
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}

      <SelectPrimitive.Root
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
        required={required}
      >
        <SelectPrimitive.Trigger
          id={selectId}
          className={cn(
            // Base styles
            'w-full rounded-lg border bg-white px-4 py-2',
            'text-neutral-900 placeholder-neutral-400',
            'transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'flex items-center justify-between',
            // Disabled state
            'disabled:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-400',
            // State styles
            state === 'default' && 'border-neutral-300 focus:ring-primary-500 focus:border-primary-500',
            state === 'error' && 'border-error-500 focus:ring-error-500 focus:border-error-500',
            state === 'success' && 'border-success-500 focus:ring-success-500 focus:border-success-500'
          )}
          aria-invalid={state === 'error' ? 'true' : undefined}
          aria-describedby={helperTextId}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon>
            <ChevronDownIcon className="text-neutral-400" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className={cn(
              'overflow-hidden bg-white rounded-lg border border-neutral-200 shadow-lg',
              'z-50'
            )}
            position="popper"
            sideOffset={5}
          >
            <SelectPrimitive.Viewport className="p-1">
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className={cn(
                    'relative flex items-center px-8 py-2 rounded-md',
                    'text-sm text-neutral-900 cursor-pointer select-none',
                    'focus:outline-none focus:bg-primary-50',
                    'data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed',
                    'data-[highlighted]:bg-primary-50'
                  )}
                >
                  <SelectPrimitive.ItemIndicator className="absolute left-2">
                    <CheckIcon className="text-primary-500" />
                  </SelectPrimitive.ItemIndicator>
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>

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
};

Select.displayName = 'Select';
