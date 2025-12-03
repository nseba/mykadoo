import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils';

export interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  onClose?: (id: string) => void;
}

interface ToastContextValue {
  toasts: ToastProps[];
  addToast: (toast: Omit<ToastProps, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

/**
 * Default icons for each variant
 */
const ToastIcons = {
  info: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M10 6v4M10 14h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  success: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M6 10l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 2L2 17h16L10 2z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 8v4M10 15h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  error: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M7 7l6 6M13 7l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
};

/**
 * Individual Toast component
 */
const ToastItem: React.FC<ToastProps> = ({
  id,
  title,
  description,
  variant = 'info',
  duration = 5000,
  onClose,
}) => {
  const [isExiting, setIsExiting] = React.useState(false);

  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => onClose?.(id), 300); // Wait for exit animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, id, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose?.(id), 300);
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'pointer-events-auto relative rounded-lg border p-4 shadow-lg',
        'flex gap-3 min-w-[300px] max-w-md',
        'transition-all duration-300',
        isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0',
        variant === 'info' && 'bg-white border-info-200',
        variant === 'success' && 'bg-white border-success-200',
        variant === 'warning' && 'bg-white border-warning-200',
        variant === 'error' && 'bg-white border-error-200'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'shrink-0',
          variant === 'info' && 'text-info-600',
          variant === 'success' && 'text-success-600',
          variant === 'warning' && 'text-warning-600',
          variant === 'error' && 'text-error-600'
        )}
      >
        {ToastIcons[variant]}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <h6 className="font-semibold text-neutral-900 mb-1">
            {title}
          </h6>
        )}
        {description && (
          <p className="text-sm text-neutral-600">
            {description}
          </p>
        )}
      </div>

      {/* Close button */}
      <button
        type="button"
        onClick={handleClose}
        className="shrink-0 text-neutral-400 hover:text-neutral-600 transition-colors"
        aria-label="Close toast"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
};

/**
 * ToastProvider component
 *
 * Provides toast notification context to the application.
 * Place this at the root of your app.
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <ToastProvider>
 *       <YourApp />
 *     </ToastProvider>
 *   );
 * }
 * ```
 */
/**
 * Portal container for toasts
 */
const ToastPortal = ({
  toasts,
  onClose,
}: {
  toasts: ToastProps[];
  onClose: (id: string) => void;
}): React.ReactElement | null => {
  if (typeof window === 'undefined') return null;

  return createPortal(
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map(toast => (
        <ToastItem key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>,
    document.body
  ) as React.ReactElement;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  const addToast = React.useCallback((toast: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAll = React.useCallback(() => {
    setToasts([]);
  }, []);

  const value = React.useMemo(
    () => ({ toasts, addToast, removeToast, clearAll }),
    [toasts, addToast, removeToast, clearAll]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastPortal toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
};

/**
 * Hook to show toasts
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { addToast } = useToast();
 *
 *   const handleClick = () => {
 *     addToast({
 *       title: 'Success!',
 *       description: 'Your changes have been saved',
 *       variant: 'success',
 *     });
 *   };
 *
 *   return <button onClick={handleClick}>Save</button>;
 * }
 * ```
 */
export const toast = {
  success: (title: string, description?: string, duration?: number) => ({
    title,
    description,
    variant: 'success' as const,
    duration,
  }),
  error: (title: string, description?: string, duration?: number) => ({
    title,
    description,
    variant: 'error' as const,
    duration,
  }),
  warning: (title: string, description?: string, duration?: number) => ({
    title,
    description,
    variant: 'warning' as const,
    duration,
  }),
  info: (title: string, description?: string, duration?: number) => ({
    title,
    description,
    variant: 'info' as const,
    duration,
  }),
};
