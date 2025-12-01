import React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '../../utils/cn';

export interface TabItem {
  value: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  /**
   * Tab items
   */
  items: TabItem[];
  /**
   * Default active tab value
   */
  defaultValue?: string;
  /**
   * Controlled active tab value
   */
  value?: string;
  /**
   * Callback when tab changes
   */
  onValueChange?: (value: string) => void;
  /**
   * Tabs variant
   */
  variant?: 'line' | 'enclosed' | 'soft';
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Orientation
   */
  orientation?: 'horizontal' | 'vertical';
  /**
   * Full width tabs
   */
  fullWidth?: boolean;
  className?: string;
}

export const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  TabsProps
>(
  (
    {
      items,
      defaultValue,
      value,
      onValueChange,
      variant = 'line',
      size = 'md',
      orientation = 'horizontal',
      fullWidth = false,
      className,
    },
    ref
  ) => {
    const sizeStyles = {
      sm: 'text-sm px-3 py-1.5',
      md: 'text-base px-4 py-2',
      lg: 'text-lg px-5 py-2.5',
    };

    const variantStyles = {
      line: {
        list: 'border-b border-neutral-200',
        trigger: cn(
          'border-b-2 border-transparent',
          'data-[state=active]:border-primary-600 data-[state=active]:text-primary-600',
          'hover:text-neutral-900 hover:border-neutral-300'
        ),
        content: 'mt-4',
      },
      enclosed: {
        list: 'bg-neutral-100 p-1 rounded-lg',
        trigger: cn(
          'rounded-md',
          'data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-neutral-900',
          'hover:text-neutral-900'
        ),
        content: 'mt-4',
      },
      soft: {
        list: 'space-x-1',
        trigger: cn(
          'rounded-md',
          'data-[state=active]:bg-primary-50 data-[state=active]:text-primary-700',
          'hover:bg-neutral-100'
        ),
        content: 'mt-4',
      },
    };

    return (
      <TabsPrimitive.Root
        ref={ref}
        defaultValue={defaultValue || items[0]?.value}
        value={value}
        onValueChange={onValueChange}
        orientation={orientation}
        className={cn(
          orientation === 'vertical' && 'flex gap-4',
          className
        )}
      >
        <TabsPrimitive.List
          className={cn(
            'flex',
            orientation === 'horizontal' ? 'flex-row' : 'flex-col',
            fullWidth && orientation === 'horizontal' && 'w-full',
            variantStyles[variant].list
          )}
          aria-label="Tabs"
        >
          {items.map((item) => (
            <TabsPrimitive.Trigger
              key={item.value}
              value={item.value}
              disabled={item.disabled}
              className={cn(
                'relative font-medium text-neutral-600 transition-all',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                sizeStyles[size],
                variantStyles[variant].trigger,
                fullWidth && orientation === 'horizontal' && 'flex-1'
              )}
            >
              {item.label}
            </TabsPrimitive.Trigger>
          ))}
        </TabsPrimitive.List>

        {items.map((item) => (
          <TabsPrimitive.Content
            key={item.value}
            value={item.value}
            className={cn(
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
              variantStyles[variant].content,
              orientation === 'vertical' && 'flex-1'
            )}
          >
            {item.content}
          </TabsPrimitive.Content>
        ))}
      </TabsPrimitive.Root>
    );
  }
);

Tabs.displayName = 'Tabs';
