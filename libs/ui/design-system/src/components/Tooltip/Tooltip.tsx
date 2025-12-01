import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '../../utils/cn';

export interface TooltipProps {
  /**
   * Tooltip content
   */
  content: React.ReactNode;
  /**
   * Trigger element
   */
  children: React.ReactNode;
  /**
   * Side of the trigger element
   */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /**
   * Alignment
   */
  align?: 'start' | 'center' | 'end';
  /**
   * Delay before showing (ms)
   */
  delayDuration?: number;
  /**
   * Tooltip size
   */
  size?: 'sm' | 'md' | 'lg';
}

export const TooltipProvider = TooltipPrimitive.Provider;

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  side = 'top',
  align = 'center',
  delayDuration = 200,
  size = 'md',
}) => {
  const sizeStyles = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <TooltipPrimitive.Root delayDuration={delayDuration}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          align={align}
          className={cn(
            'z-50 overflow-hidden rounded-md bg-neutral-900 text-white shadow-md',
            'animate-in fade-in-0 zoom-in-95',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
            'data-[side=bottom]:slide-in-from-top-2',
            'data-[side=left]:slide-in-from-right-2',
            'data-[side=right]:slide-in-from-left-2',
            'data-[side=top]:slide-in-from-bottom-2',
            sizeStyles[size]
          )}
          sideOffset={5}
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-neutral-900" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
};

Tooltip.displayName = 'Tooltip';
