import React from 'react';
import { cn } from '../../utils/cn';

export interface SidebarItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  active?: boolean;
  badge?: string | number;
  onClick?: () => void;
  children?: SidebarItem[];
}

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Sidebar items
   */
  items: SidebarItem[];
  /**
   * Sidebar header
   */
  header?: React.ReactNode;
  /**
   * Sidebar footer
   */
  footer?: React.ReactNode;
  /**
   * Collapsible sidebar
   */
  collapsible?: boolean;
  /**
   * Initially collapsed
   */
  defaultCollapsed?: boolean;
  /**
   * Width when expanded
   */
  width?: string;
  /**
   * Background variant
   */
  variant?: 'light' | 'dark';
}

export const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  (
    {
      items,
      header,
      footer,
      collapsible = false,
      defaultCollapsed = false,
      width = '16rem',
      variant = 'light',
      className,
      ...props
    },
    ref
  ) => {
    const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
    const [expandedItems, setExpandedItems] = React.useState<Set<number>>(new Set());

    const variantStyles = {
      light: 'bg-white border-r border-neutral-200 text-neutral-900',
      dark: 'bg-neutral-900 border-r border-neutral-800 text-white',
    };

    const toggleExpanded = (index: number) => {
      const newExpanded = new Set(expandedItems);
      if (newExpanded.has(index)) {
        newExpanded.delete(index);
      } else {
        newExpanded.add(index);
      }
      setExpandedItems(newExpanded);
    };

    const renderItem = (item: SidebarItem, index: number, depth = 0) => {
      const hasChildren = item.children && item.children.length > 0;
      const isExpanded = expandedItems.has(index);
      const Component = item.href ? 'a' : 'button';

      return (
        <div key={index}>
          <Component
            href={item.href}
            onClick={(e) => {
              if (hasChildren) {
                e.preventDefault();
                toggleExpanded(index);
              }
              item.onClick?.();
            }}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-md transition-colors',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
              item.active
                ? 'bg-primary-50 text-primary-700'
                : variant === 'light'
                  ? 'text-neutral-700 hover:bg-neutral-100'
                  : 'text-neutral-300 hover:bg-neutral-800',
              depth > 0 && 'pl-8'
            )}
            aria-current={item.active ? 'page' : undefined}
          >
            {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
            {!collapsed && (
              <>
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    {item.badge}
                  </span>
                )}
                {hasChildren && (
                  <svg
                    className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-90')}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </>
            )}
          </Component>

          {hasChildren && isExpanded && !collapsed && (
            <div className="ml-2 mt-1 space-y-1">
              {item.children!.map((child, childIndex) =>
                renderItem(child, index * 1000 + childIndex, depth + 1)
              )}
            </div>
          )}
        </div>
      );
    };

    return (
      <aside
        ref={ref}
        className={cn(
          'flex flex-col h-full transition-all duration-300',
          variantStyles[variant],
          className
        )}
        style={{ width: collapsed ? '4rem' : width }}
        aria-label="Sidebar navigation"
        {...props}
      >
        {/* Header */}
        {header && (
          <div className="p-4 border-b border-inherit">
            {collapsed ? (
              <div className="flex items-center justify-center">{header}</div>
            ) : (
              header
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">{items.map((item, index) => renderItem(item, index))}</div>
        </nav>

        {/* Footer */}
        {footer && (
          <div className="p-4 border-t border-inherit">
            {collapsed ? (
              <div className="flex items-center justify-center">{footer}</div>
            ) : (
              footer
            )}
          </div>
        )}

        {/* Collapse toggle */}
        {collapsible && (
          <div className="p-4 border-t border-inherit">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={cn(
                'w-full flex items-center justify-center p-2 rounded-md transition-colors',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                variant === 'light'
                  ? 'text-neutral-700 hover:bg-neutral-100'
                  : 'text-neutral-300 hover:bg-neutral-800'
              )}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg
                className={cn('h-5 w-5 transition-transform', collapsed && 'rotate-180')}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        )}
      </aside>
    );
  }
);

Sidebar.displayName = 'Sidebar';
