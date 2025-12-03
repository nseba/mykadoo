import * as React from 'react';
import { cn } from '../../utils';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Title text
   */
  title: string;

  /**
   * Description text
   */
  description?: string;

  /**
   * Icon or illustration element
   */
  icon?: React.ReactNode;

  /**
   * Action button
   */
  action?: React.ReactNode;

  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: {
    container: 'py-8',
    icon: 'w-12 h-12',
    title: 'text-base',
    description: 'text-sm',
  },
  md: {
    container: 'py-12',
    icon: 'w-16 h-16',
    title: 'text-lg',
    description: 'text-base',
  },
  lg: {
    container: 'py-16',
    icon: 'w-24 h-24',
    title: 'text-xl',
    description: 'text-lg',
  },
};

/**
 * Default empty state icon
 */
const DefaultEmptyIcon = () => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full text-neutral-300"
  >
    <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" fill="none" />
    <path
      d="M20 28h24M20 36h16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * EmptyState component
 *
 * Display when no content is available to show.
 *
 * @example
 * ```tsx
 * // Basic empty state
 * <EmptyState
 *   title="No results found"
 *   description="Try adjusting your search or filters"
 * />
 *
 * // With action
 * <EmptyState
 *   title="No items yet"
 *   description="Get started by adding your first item"
 *   action={<Button>Add Item</Button>}
 * />
 *
 * // With custom icon
 * <EmptyState
 *   title="Empty inbox"
 *   description="All caught up!"
 *   icon={<InboxIcon />}
 *   size="lg"
 * />
 * ```
 */
export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      className,
      title,
      description,
      icon,
      action,
      size = 'md',
      ...props
    },
    ref
  ) => {
    const sizes = sizeMap[size];

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center text-center',
          sizes.container,
          className
        )}
        role="status"
        {...props}
      >
        {/* Icon */}
        {icon !== null && (
          <div className={cn('mb-4 text-neutral-400', sizes.icon)}>
            {icon || <DefaultEmptyIcon />}
          </div>
        )}

        {/* Title */}
        <h3 className={cn('font-semibold text-neutral-900 mb-2', sizes.title)}>
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className={cn('text-neutral-600 max-w-md mb-6', sizes.description)}>
            {description}
          </p>
        )}

        {/* Action */}
        {action && <div className="mt-2">{action}</div>}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';
