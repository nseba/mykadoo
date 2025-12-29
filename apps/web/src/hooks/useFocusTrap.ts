/**
 * useFocusTrap Hook
 * React hook for managing focus trapping in modals and dialogs
 */

import { useEffect, useRef, useCallback } from 'react';
import { FocusTrap, FocusTrapOptions } from '../lib/a11y/focus-management';

interface UseFocusTrapOptions {
  /** Whether the focus trap is currently active */
  isActive: boolean;
  /** Callback when escape key is pressed */
  onEscape?: () => void;
  /** Element to focus initially */
  initialFocusRef?: React.RefObject<HTMLElement>;
  /** Callback when focus tries to exit the container */
  onFocusExit?: () => void;
}

/**
 * Hook to create a focus trap for a container element
 *
 * @example
 * ```tsx
 * function Modal({ isOpen, onClose }) {
 *   const modalRef = useFocusTrap({
 *     isActive: isOpen,
 *     onEscape: onClose,
 *   });
 *
 *   return (
 *     <div ref={modalRef} role="dialog" aria-modal="true">
 *       <button>First focusable</button>
 *       <button onClick={onClose}>Close</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(
  options: UseFocusTrapOptions
): React.RefObject<T> {
  const containerRef = useRef<T>(null);
  const focusTrapRef = useRef<FocusTrap | null>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  const { isActive, onEscape, initialFocusRef, onFocusExit } = options;

  // Memoize the escape handler to prevent recreating the focus trap
  const handleEscape = useCallback(() => {
    onEscape?.();
  }, [onEscape]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (isActive) {
      // Store the currently focused element
      previousActiveElementRef.current = document.activeElement as HTMLElement;

      // Create and activate the focus trap
      const trapOptions: FocusTrapOptions = {
        container,
        initialFocus: initialFocusRef?.current ?? null,
        returnFocus: previousActiveElementRef.current,
        onEscape: handleEscape,
        onFocusExit,
      };

      focusTrapRef.current = new FocusTrap(trapOptions);
      focusTrapRef.current.activate();

      // Prevent body scroll
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        // Deactivate the focus trap
        focusTrapRef.current?.deactivate();
        focusTrapRef.current = null;

        // Restore body scroll
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isActive, handleEscape, initialFocusRef, onFocusExit]);

  return containerRef;
}

/**
 * Hook to manage focus return after an action
 * Stores the currently focused element and returns focus when component unmounts
 *
 * @example
 * ```tsx
 * function Popover({ isOpen }) {
 *   useFocusReturn(isOpen);
 *
 *   if (!isOpen) return null;
 *   return <div>Popover content</div>;
 * }
 * ```
 */
export function useFocusReturn(isActive: boolean): void {
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isActive) {
      previousActiveElementRef.current = document.activeElement as HTMLElement;
    } else if (previousActiveElementRef.current) {
      previousActiveElementRef.current.focus();
      previousActiveElementRef.current = null;
    }
  }, [isActive]);

  // Also return focus on unmount if still active
  useEffect(() => {
    return () => {
      if (previousActiveElementRef.current) {
        previousActiveElementRef.current.focus();
      }
    };
  }, []);
}

/**
 * Hook to handle escape key press
 *
 * @example
 * ```tsx
 * function Modal({ isOpen, onClose }) {
 *   useEscapeKey(onClose, isOpen);
 *   return <div>Modal content</div>;
 * }
 * ```
 */
export function useEscapeKey(
  callback: () => void,
  isEnabled: boolean = true
): void {
  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        callback();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [callback, isEnabled]);
}

export default useFocusTrap;
