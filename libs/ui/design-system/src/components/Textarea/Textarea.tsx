import * as React from 'react';
import { cn } from '../../utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Visual state of the textarea
   */
  state?: 'default' | 'error' | 'success';

  /**
   * Helper text displayed below textarea
   */
  helperText?: string;

  /**
   * Label text
   */
  label?: string;

  /**
   * Show character count
   */
  showCount?: boolean;

  /**
   * Additional className for textarea wrapper
   */
  wrapperClassName?: string;
}

/**
 * Textarea component
 *
 * Multi-line text input with validation states and character count.
 *
 * @example
 * ```tsx
 * // Basic textarea
 * <Textarea label="Description" placeholder="Enter description..." />
 *
 * // With character count
 * <Textarea
 *   label="Bio"
 *   maxLength={200}
 *   showCount
 *   placeholder="Tell us about yourself..."
 * />
 *
 * // With validation
 * <Textarea
 *   label="Message"
 *   state="error"
 *   helperText="Message is required"
 * />
 * ```
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      state = 'default',
      helperText,
      label,
      showCount,
      maxLength,
      wrapperClassName,
      id,
      disabled,
      value,
      defaultValue,
      ...props
    },
    ref
  ) => {
    const inputId = id || React.useId();
    const helperTextId = helperText ? `${inputId}-helper` : undefined;

    // Track character count
    const [charCount, setCharCount] = React.useState(0);

    React.useEffect(() => {
      const currentValue = value || defaultValue || '';
      setCharCount(String(currentValue).length);
    }, [value, defaultValue]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (showCount) {
        setCharCount(e.target.value.length);
      }
      props.onChange?.(e);
    };

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

        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            // Base styles
            'w-full rounded-lg border bg-white px-4 py-2',
            'text-neutral-900 placeholder-neutral-400',
            'transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'resize-y min-h-[80px]',
            // Disabled state
            'disabled:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-400',
            // State styles
            state === 'default' && 'border-neutral-300 focus:ring-primary-300 focus:border-primary-300',
            state === 'error' && 'border-error-500 focus:ring-error-500 focus:border-error-500',
            state === 'success' && 'border-success-500 focus:ring-success-500 focus:border-success-500',
            className
          )}
          aria-invalid={state === 'error' ? 'true' : undefined}
          aria-describedby={helperTextId}
          disabled={disabled}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          {...props}
        />

        <div className="flex justify-between items-start mt-1.5">
          {helperText && (
            <p
              id={helperTextId}
              className={cn(
                'text-sm',
                state === 'error' && 'text-error-600',
                state === 'success' && 'text-success-600',
                state === 'default' && 'text-neutral-600'
              )}
            >
              {helperText}
            </p>
          )}

          {showCount && maxLength && (
            <p
              className={cn(
                'text-sm ml-auto',
                charCount > maxLength ? 'text-error-600' : 'text-neutral-500'
              )}
            >
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
