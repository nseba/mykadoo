import React from 'react';
import { cn } from '../../utils/cn';

export interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  /**
   * Orientation
   */
  orientation?: 'horizontal' | 'vertical';
  /**
   * Label text
   */
  label?: string;
  /**
   * Label position
   */
  labelPosition?: 'left' | 'center' | 'right';
  /**
   * Thickness
   */
  thickness?: 'thin' | 'normal' | 'thick';
  /**
   * Variant
   */
  variant?: 'solid' | 'dashed' | 'dotted';
}

export const Divider = React.forwardRef<HTMLHRElement, DividerProps>(
  (
    {
      orientation = 'horizontal',
      label,
      labelPosition = 'center',
      thickness = 'normal',
      variant = 'solid',
      className,
      ...props
    },
    ref
  ) => {
    const thicknessStyles = {
      thin: orientation === 'horizontal' ? 'border-t' : 'border-l',
      normal: orientation === 'horizontal' ? 'border-t-2' : 'border-l-2',
      thick: orientation === 'horizontal' ? 'border-t-4' : 'border-l-4',
    };

    const variantStyles = {
      solid: 'border-solid',
      dashed: 'border-dashed',
      dotted: 'border-dotted',
    };

    if (label && orientation === 'horizontal') {
      const positionStyles = {
        left: 'before:mr-auto before:w-8',
        center: 'before:flex-1 after:flex-1',
        right: 'after:ml-auto after:w-8',
      };

      return (
        <div
          className={cn(
            'flex items-center gap-4 text-sm text-neutral-600',
            positionStyles[labelPosition],
            className
          )}
          role="separator"
        >
          <hr
            className={cn(
              'flex-1 border-neutral-200',
              thicknessStyles[thickness],
              variantStyles[variant]
            )}
          />
          <span>{label}</span>
          <hr
            className={cn(
              'flex-1 border-neutral-200',
              thicknessStyles[thickness],
              variantStyles[variant]
            )}
          />
        </div>
      );
    }

    return (
      <hr
        ref={ref}
        className={cn(
          'border-neutral-200',
          thicknessStyles[thickness],
          variantStyles[variant],
          orientation === 'vertical' && 'h-auto self-stretch',
          orientation === 'horizontal' && 'w-full',
          className
        )}
        role="separator"
        aria-orientation={orientation}
        {...props}
      />
    );
  }
);

Divider.displayName = 'Divider';
