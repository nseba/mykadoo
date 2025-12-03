import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '../../utils';

export interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  /**
   * Label text
   */
  label?: string;

  /**
   * Helper text displayed below slider
   */
  helperText?: string;

  /**
   * Show current value
   */
  showValue?: boolean;

  /**
   * Value formatter function
   */
  formatValue?: (value: number) => string;
}

/**
 * Slider component
 *
 * Range slider for selecting numeric values.
 * Built on Radix UI for accessibility.
 *
 * @example
 * ```tsx
 * // Basic slider
 * <Slider label="Volume" defaultValue={[50]} max={100} />
 *
 * // With value display
 * <Slider
 *   label="Price"
 *   showValue
 *   defaultValue={[500]}
 *   min={0}
 *   max={1000}
 *   step={50}
 *   formatValue={(v) => `$${v}`}
 * />
 *
 * // Range slider
 * <Slider
 *   label="Age Range"
 *   defaultValue={[18, 65]}
 *   min={0}
 *   max={100}
 *   showValue
 * />
 *
 * // Controlled
 * <Slider
 *   label="Brightness"
 *   value={brightness}
 *   onValueChange={setBrightness}
 *   max={100}
 * />
 * ```
 */
export const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(
  (
    {
      className,
      label,
      helperText,
      showValue = false,
      formatValue,
      value,
      defaultValue,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const sliderId = id || generatedId;
    const helperTextId = helperText ? `${sliderId}-helper` : undefined;

    // Track current value for display
    const [currentValue, setCurrentValue] = React.useState<number[]>(
      value || defaultValue || [0]
    );

    React.useEffect(() => {
      if (value) {
        setCurrentValue(value);
      }
    }, [value]);

    const handleValueChange = (newValue: number[]) => {
      setCurrentValue(newValue);
      props.onValueChange?.(newValue);
    };

    const displayValue = currentValue.length === 1
      ? formatValue?.(currentValue[0]) || currentValue[0]
      : `${formatValue?.(currentValue[0]) || currentValue[0]} - ${formatValue?.(currentValue[1]) || currentValue[1]}`;

    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-2">
          {label && (
            <label
              htmlFor={sliderId}
              className={cn(
                'block text-sm font-medium',
                disabled ? 'text-neutral-400' : 'text-neutral-700'
              )}
            >
              {label}
            </label>
          )}

          {showValue && (
            <span className={cn('text-sm font-medium', disabled ? 'text-neutral-400' : 'text-neutral-700')}>
              {displayValue}
            </span>
          )}
        </div>

        <SliderPrimitive.Root
          ref={ref}
          id={sliderId}
          className={cn(
            'relative flex items-center select-none touch-none w-full h-5',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
          value={value}
          defaultValue={defaultValue}
          onValueChange={handleValueChange}
          disabled={disabled}
          aria-describedby={helperTextId}
          {...props}
        >
          <SliderPrimitive.Track className="relative bg-neutral-200 grow rounded-full h-2">
            <SliderPrimitive.Range className="absolute bg-primary-500 rounded-full h-full" />
          </SliderPrimitive.Track>
          {currentValue.map((_, index) => (
            <SliderPrimitive.Thumb
              key={index}
              className={cn(
                'block w-5 h-5 bg-white border-2 border-primary-500 rounded-full shadow-sm',
                'transition-colors duration-200',
                'hover:bg-primary-50',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                'disabled:pointer-events-none'
              )}
            />
          ))}
        </SliderPrimitive.Root>

        {helperText && (
          <p
            id={helperTextId}
            className={cn('mt-1.5 text-sm text-neutral-600')}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Slider.displayName = 'Slider';
