import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '../../utils/cn';

export interface ModalProps {
  /**
   * Open state
   */
  open?: boolean;
  /**
   * Callback when open state changes
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Modal title
   */
  title?: string;
  /**
   * Modal description
   */
  description?: string;
  /**
   * Modal content
   */
  children: React.ReactNode;
  /**
   * Modal footer (actions)
   */
  footer?: React.ReactNode;
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /**
   * Close on overlay click
   */
  closeOnOverlayClick?: boolean;
  /**
   * Close on escape
   */
  closeOnEscape?: boolean;
  /**
   * Show close button
   */
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
}) => {
  const sizeStyles = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* Overlay */}
        <DialogPrimitive.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
          )}
        />

        {/* Content */}
        <DialogPrimitive.Content
          className={cn(
            'fixed left-[50%] top-[50%] z-50 w-full translate-x-[-50%] translate-y-[-50%]',
            'bg-white rounded-lg shadow-lg',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
            'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
            'duration-200',
            sizeStyles[size]
          )}
          onPointerDownOutside={
            closeOnOverlayClick ? undefined : (e) => e.preventDefault()
          }
          onEscapeKeyDown={closeOnEscape ? undefined : (e) => e.preventDefault()}
        >
          {/* Header */}
          {(title || description) && (
            <div className="px-6 pt-6 pb-4">
              {title && (
                <DialogPrimitive.Title className="text-lg font-semibold text-neutral-900">
                  {title}
                </DialogPrimitive.Title>
              )}
              {description && (
                <DialogPrimitive.Description className="text-sm text-neutral-600 mt-2">
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>
          )}

          {/* Body */}
          <div className="px-6 py-4">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 bg-neutral-50 rounded-b-lg border-t border-neutral-200">
              {footer}
            </div>
          )}

          {/* Close button */}
          {showCloseButton && (
            <DialogPrimitive.Close
              className={cn(
                'absolute right-4 top-4 rounded-sm opacity-70',
                'ring-offset-white transition-opacity',
                'hover:opacity-100',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                'disabled:pointer-events-none',
                'data-[state=open]:bg-neutral-100'
              )}
              aria-label="Close"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

Modal.displayName = 'Modal';

/**
 * Modal trigger component
 */
export const ModalTrigger = DialogPrimitive.Trigger;
ModalTrigger.displayName = 'ModalTrigger';

/**
 * Modal close component
 */
export const ModalClose = DialogPrimitive.Close;
ModalClose.displayName = 'ModalClose';
