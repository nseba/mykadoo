import * as React from 'react';
import { cn } from '../../utils';

export interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /**
   * Label text
   */
  label?: string;

  /**
   * Helper text displayed below input
   */
  helperText?: string;

  /**
   * Visual state
   */
  state?: 'default' | 'error' | 'success';

  /**
   * Additional className for wrapper
   */
  wrapperClassName?: string;
}

/**
 * Calendar Icon
 */
const CalendarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M13 2H11V1H10V2H6V1H5V2H3C2.448 2 2 2.448 2 3V13C2 13.552 2.448 14 3 14H13C13.552 14 14 13.552 14 13V3C14 2.448 13.552 2 13 2ZM13 13H3V6H13V13ZM13 5H3V3H5V4H6V3H10V4H11V3H13V5Z"
      fill="currentColor"
    />
  </svg>
);

/**
 * DatePicker component
 *
 * Date input field with calendar icon and native date picker.
 * Uses HTML5 date input for broad compatibility.
 *
 * @example
 * ```tsx
 * // Basic date picker
 * <DatePicker label="Birth Date" />
 *
 * // With validation
 * <DatePicker
 *   label="Appointment Date"
 *   state="error"
 *   helperText="Please select a future date"
 * />
 *
 * // With constraints
 * <DatePicker
 *   label="Start Date"
 *   min="2024-01-01"
 *   max="2024-12-31"
 *   helperText="Select a date in 2024"
 * />
 *
 * // Controlled
 * <DatePicker
 *   label="Event Date"
 *   value={eventDate}
 *   onChange={(e) => setEventDate(e.target.value)}
 * />
 * ```
 */
export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  (
    {
      className,
      label,
      helperText,
      state = 'default',
      wrapperClassName,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
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
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
            <CalendarIcon />
          </div>

          <input
            ref={ref}
            type="date"
            id={inputId}
            className={cn(
              // Base styles
              'w-full rounded-lg border bg-white px-4 py-2 pl-10',
              'text-neutral-900',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              // Disabled state
              'disabled:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-400',
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

DatePicker.displayName = 'DatePicker';
