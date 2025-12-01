import React from 'react';
import { cn } from '../../utils/cn';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Breadcrumb items
   */
  items: BreadcrumbItem[];
  /**
   * Separator between items
   */
  separator?: React.ReactNode;
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';
}

const defaultSeparator = (
  <svg
    className="h-5 w-5 flex-shrink-0 text-neutral-400"
    fill="currentColor"
    viewBox="0 0 20 20"
    aria-hidden="true"
  >
    <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
  </svg>
);

export const Breadcrumbs = React.forwardRef<HTMLElement, BreadcrumbsProps>(
  ({ items, separator = defaultSeparator, size = 'md', className, ...props }, ref) => {
    const sizeStyles = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    };

    return (
      <nav
        ref={ref}
        className={cn('flex', sizeStyles[size], className)}
        aria-label="Breadcrumb"
        {...props}
      >
        <ol role="list" className="flex items-center space-x-2">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li key={index} className="flex items-center">
                {item.href && !isLast ? (
                  <a
                    href={item.href}
                    className={cn(
                      'font-medium text-neutral-600 hover:text-neutral-900',
                      'transition-colors focus:outline-none focus:underline'
                    )}
                  >
                    {item.label}
                  </a>
                ) : (
                  <span
                    className={cn('font-medium', isLast ? 'text-neutral-900' : 'text-neutral-600')}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.label}
                  </span>
                )}

                {!isLast && <div className="ml-2">{separator}</div>}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }
);

Breadcrumbs.displayName = 'Breadcrumbs';
