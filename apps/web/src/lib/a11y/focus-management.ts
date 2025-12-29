/**
 * Focus Management Utilities
 * Provides accessible focus management for modals, dialogs, and other interactive components
 */

// Selector for focusable elements
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
  'details > summary:first-of-type',
].join(', ');

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const elements = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
  return Array.from(elements).filter((el) => {
    // Filter out elements that are not visible
    const style = window.getComputedStyle(el);
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      el.offsetParent !== null
    );
  });
}

/**
 * Focus trap options
 */
export interface FocusTrapOptions {
  /** Element to trap focus within */
  container: HTMLElement;
  /** Element to focus initially (defaults to first focusable) */
  initialFocus?: HTMLElement | null;
  /** Element to return focus to when trap is deactivated */
  returnFocus?: HTMLElement | null;
  /** Callback when escape is pressed */
  onEscape?: () => void;
  /** Callback when focus tries to leave the container */
  onFocusExit?: () => void;
}

/**
 * Focus trap manager
 * Creates a focus trap that keeps focus within a container element
 */
export class FocusTrap {
  private container: HTMLElement;
  private initialFocus: HTMLElement | null;
  private returnFocus: HTMLElement | null;
  private onEscape?: () => void;
  private onFocusExit?: () => void;
  private handleKeyDown: (e: KeyboardEvent) => void;
  private handleFocusIn: (e: FocusEvent) => void;
  private isActive = false;

  constructor(options: FocusTrapOptions) {
    this.container = options.container;
    this.initialFocus = options.initialFocus ?? null;
    this.returnFocus = options.returnFocus ?? null;
    this.onEscape = options.onEscape;
    this.onFocusExit = options.onFocusExit;

    this.handleKeyDown = this.keyDownHandler.bind(this);
    this.handleFocusIn = this.focusInHandler.bind(this);
  }

  /**
   * Activate the focus trap
   */
  activate(): void {
    if (this.isActive) return;

    this.isActive = true;

    // Store the currently focused element for return focus
    if (!this.returnFocus) {
      this.returnFocus = document.activeElement as HTMLElement;
    }

    // Add event listeners
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('focusin', this.handleFocusIn);

    // Set initial focus
    this.setInitialFocus();
  }

  /**
   * Deactivate the focus trap and return focus
   */
  deactivate(): void {
    if (!this.isActive) return;

    this.isActive = false;

    // Remove event listeners
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('focusin', this.handleFocusIn);

    // Return focus to the previous element
    if (this.returnFocus && typeof this.returnFocus.focus === 'function') {
      // Use requestAnimationFrame to ensure DOM updates are complete
      requestAnimationFrame(() => {
        this.returnFocus?.focus();
      });
    }
  }

  /**
   * Set focus to the initial element or first focusable
   */
  private setInitialFocus(): void {
    requestAnimationFrame(() => {
      if (this.initialFocus) {
        this.initialFocus.focus();
        return;
      }

      const focusableElements = getFocusableElements(this.container);
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      } else {
        // If no focusable elements, focus the container itself
        this.container.setAttribute('tabindex', '-1');
        this.container.focus();
      }
    });
  }

  /**
   * Handle keydown events for Tab and Escape
   */
  private keyDownHandler(e: KeyboardEvent): void {
    if (e.key === 'Escape' && this.onEscape) {
      e.preventDefault();
      this.onEscape();
      return;
    }

    if (e.key !== 'Tab') return;

    const focusableElements = getFocusableElements(this.container);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement;

    // Shift+Tab from first element → go to last
    if (e.shiftKey && activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
      return;
    }

    // Tab from last element → go to first
    if (!e.shiftKey && activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
      return;
    }
  }

  /**
   * Handle focus events to prevent focus from leaving the container
   */
  private focusInHandler(e: FocusEvent): void {
    if (!this.container.contains(e.target as Node)) {
      // Focus has moved outside the container
      e.preventDefault();

      if (this.onFocusExit) {
        this.onFocusExit();
      }

      // Return focus to the container
      const focusableElements = getFocusableElements(this.container);
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      } else {
        this.container.focus();
      }
    }
  }

  /**
   * Check if the trap is currently active
   */
  get active(): boolean {
    return this.isActive;
  }
}

/**
 * React hook-friendly function to create a focus trap
 * Returns activate and deactivate functions
 */
export function createFocusTrap(options: FocusTrapOptions): {
  activate: () => void;
  deactivate: () => void;
  isActive: () => boolean;
} {
  const trap = new FocusTrap(options);
  return {
    activate: () => trap.activate(),
    deactivate: () => trap.deactivate(),
    isActive: () => trap.active,
  };
}

/**
 * Move focus to a specific element with announcement for screen readers
 */
export function moveFocus(
  element: HTMLElement | null,
  options?: {
    preventScroll?: boolean;
  }
): void {
  if (!element) return;

  // Make element focusable if it isn't already
  if (
    !element.matches(FOCUSABLE_SELECTOR) &&
    element.getAttribute('tabindex') === null
  ) {
    element.setAttribute('tabindex', '-1');
  }

  element.focus({ preventScroll: options?.preventScroll ?? false });
}

/**
 * Announce a message to screen readers using an ARIA live region
 */
export function announce(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  // Find or create a live region
  let liveRegion = document.getElementById('a11y-announcer');

  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'a11y-announcer';
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    document.body.appendChild(liveRegion);
  } else {
    liveRegion.setAttribute('aria-live', priority);
  }

  // Clear and set the message to trigger announcement
  liveRegion.textContent = '';
  requestAnimationFrame(() => {
    if (liveRegion) {
      liveRegion.textContent = message;
    }
  });
}
