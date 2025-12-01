import React from 'react';
import { cn } from '../../utils/cn';

export interface BottomNavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  active?: boolean;
  badge?: string | number;
  onClick?: () => void;
}

export interface BottomNavProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Navigation items (max 5 recommended)
   */
  items: BottomNavItem[];
  /**
   * Show labels
   */
  showLabels?: boolean;
  /**
   * Background variant
   */
  variant?: 'light' | 'dark';
  /**
   * Border at top
   */
  bordered?: boolean;
}

export const BottomNav = React.forwardRef<HTMLElement, BottomNavProps>(
  (
    {
      items,
      showLabels = true,
      variant = 'light',
      bordered = true,
      className,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      light: 'bg-white text-neutral-600',
      dark: 'bg-neutral-900 text-neutral-400',
    };

    return (
      <nav
        ref={ref}
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50',
          'md:hidden', // Only show on mobile
          variantStyles[variant],
          bordered && 'border-t border-neutral-200',
          'safe-area-inset-bottom', // iOS notch support
          className
        )}
        role="navigation"
        aria-label="Bottom navigation"
        {...props}
      >
        <div className="flex items-center justify-around h-16 px-2">
          {items.map((item, index) => {
            const Component = item.href ? 'a' : 'button';

            return (
              <Component
                key={index}
                href={item.href}
                onClick={item.onClick}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-md min-w-0 flex-1',
                  'transition-colors',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset',
                  item.active
                    ? 'text-primary-600'
                    : variant === 'light'
                      ? 'text-neutral-600 hover:text-neutral-900'
                      : 'text-neutral-400 hover:text-white'
                )}
                aria-current={item.active ? 'page' : undefined}
              >
                {/* Badge */}
                {item.badge && (
                  <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-error-600 rounded-full min-w-[1.25rem]">
                    {item.badge}
                  </span>
                )}

                {/* Icon */}
                <span className={cn('flex-shrink-0', showLabels ? 'h-6 w-6' : 'h-7 w-7')}>
                  {item.icon}
                </span>

                {/* Label */}
                {showLabels && (
                  <span className="text-xs font-medium truncate w-full text-center">
                    {item.label}
                  </span>
                )}
              </Component>
            );
          })}
        </div>
      </nav>
    );
  }
);

BottomNav.displayName = 'BottomNav';
