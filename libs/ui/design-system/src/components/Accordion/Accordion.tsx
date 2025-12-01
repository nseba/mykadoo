import React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { cn } from '../../utils/cn';

export interface AccordionItem {
  value: string;
  title: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  /**
   * Accordion items
   */
  items: AccordionItem[];
  /**
   * Type of accordion
   */
  type?: 'single' | 'multiple';
  /**
   * Collapsible (for single type)
   */
  collapsible?: boolean;
  /**
   * Default open values
   */
  defaultValue?: string | string[];
  /**
   * Controlled value
   */
  value?: string | string[];
  /**
   * Callback when value changes
   */
  onValueChange?: (value: string | string[]) => void;
  /**
   * Variant style
   */
  variant?: 'default' | 'bordered' | 'separated';
  className?: string;
}

export const Accordion = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Root>,
  AccordionProps
>(
  (
    {
      items,
      type = 'single',
      collapsible = true,
      defaultValue,
      value,
      onValueChange,
      variant = 'default',
      className,
    },
    ref
  ) => {
    const variantStyles = {
      default: 'space-y-2',
      bordered: 'border border-neutral-200 rounded-lg divide-y divide-neutral-200',
      separated: 'space-y-4',
    };

    const itemStyles = {
      default: 'border border-neutral-200 rounded-md',
      bordered: '',
      separated: 'border border-neutral-200 rounded-md shadow-sm',
    };

    return (
      <AccordionPrimitive.Root
        ref={ref}
        type={type as any}
        collapsible={type === 'single' ? collapsible : undefined}
        defaultValue={defaultValue as any}
        value={value as any}
        onValueChange={onValueChange as any}
        className={cn(variantStyles[variant], className)}
      >
        {items.map((item) => (
          <AccordionPrimitive.Item
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            className={cn(itemStyles[variant], 'overflow-hidden')}
          >
            <AccordionPrimitive.Header className="flex">
              <AccordionPrimitive.Trigger
                className={cn(
                  'flex flex-1 items-center justify-between px-4 py-3 font-medium transition-all',
                  'hover:bg-neutral-50',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                  '[&[data-state=open]>svg]:rotate-180'
                )}
              >
                <span>{item.title}</span>
                <svg
                  className="h-4 w-4 shrink-0 transition-transform duration-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </AccordionPrimitive.Trigger>
            </AccordionPrimitive.Header>
            <AccordionPrimitive.Content
              className={cn(
                'overflow-hidden text-sm transition-all',
                'data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down'
              )}
            >
              <div className="px-4 py-3 text-neutral-700">{item.content}</div>
            </AccordionPrimitive.Content>
          </AccordionPrimitive.Item>
        ))}
      </AccordionPrimitive.Root>
    );
  }
);

Accordion.displayName = 'Accordion';
