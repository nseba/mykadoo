import React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '../../utils/cn';

export interface PopoverProps {
  /**
   * Trigger element
   */
  trigger: React.ReactNode;
  /**
   * Popover content
   */
  children: React.ReactNode;
  /**
   * Side of the trigger
   */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /**
   * Alignment
   */
  align?: 'start' | 'center' | 'end';
  /**
   * Controlled open state
   */
  open?: boolean;
  /**
   * Callback when open state changes
   */
  onOpenChange?: (open: boolean) => void;
}

export const Popover: React.FC<PopoverProps> = ({
  trigger,
  children,
  side = 'bottom',
  align = 'center',
  open,
  onOpenChange,
}) => {
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side={side}
          align={align}
          className={cn(
            'z-50 w-72 rounded-md border border-neutral-200 bg-white p-4 shadow-md outline-none',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[side=bottom]:slide-in-from-top-2',
            'data-[side=left]:slide-in-from-right-2',
            'data-[side=right]:slide-in-from-left-2',
            'data-[side=top]:slide-in-from-bottom-2'
          )}
          sideOffset={5}
        >
          {children}
          <PopoverPrimitive.Arrow className="fill-white stroke-neutral-200" />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};

Popover.displayName = 'Popover';
