import React from 'react';
import { cn } from '../../utils/cn';

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  /**
   * Table variant
   */
  variant?: 'default' | 'striped' | 'bordered';
  /**
   * Hoverable rows
   */
  hoverable?: boolean;
  /**
   * Dense padding
   */
  dense?: boolean;
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ variant = 'default', hoverable = false, dense = false, className, ...props }, ref) => {
    return (
      <div className="w-full overflow-auto">
        <table
          ref={ref}
          className={cn(
            'w-full caption-bottom text-sm',
            variant === 'bordered' && 'border border-neutral-200',
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Table.displayName = 'Table';

/**
 * Table header component
 */
export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn('border-b border-neutral-200 bg-neutral-50', className)}
    {...props}
  />
));

TableHeader.displayName = 'TableHeader';

/**
 * Table body component
 */
export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  striped?: boolean;
  hoverable?: boolean;
}

export const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ striped = false, hoverable = false, className, ...props }, ref) => (
    <tbody
      ref={ref}
      className={cn(
        striped && '[&_tr:nth-child(even)]:bg-neutral-50',
        hoverable && '[&_tr]:hover:bg-neutral-100 [&_tr]:transition-colors',
        className
      )}
      {...props}
    />
  )
);

TableBody.displayName = 'TableBody';

/**
 * Table footer component
 */
export const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn('border-t border-neutral-200 bg-neutral-50 font-medium', className)}
    {...props}
  />
));

TableFooter.displayName = 'TableFooter';

/**
 * Table row component
 */
export const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr ref={ref} className={cn('border-b border-neutral-200', className)} {...props} />
));

TableRow.displayName = 'TableRow';

/**
 * Table head cell component
 */
export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  /**
   * Sortable column
   */
  sortable?: boolean;
  /**
   * Sort direction
   */
  sortDirection?: 'asc' | 'desc' | null;
  /**
   * Sort callback
   */
  onSort?: () => void;
}

export const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ sortable, sortDirection, onSort, className, children, ...props }, ref) => {
    const Component = sortable ? 'button' : 'div';

    return (
      <th
        ref={ref}
        className={cn(
          'h-12 px-4 text-left align-middle font-medium text-neutral-700',
          sortable && 'cursor-pointer select-none',
          className
        )}
        {...props}
      >
        <Component
          className={cn(
            'flex items-center gap-2',
            sortable && 'hover:text-neutral-900 focus:outline-none focus:underline'
          )}
          onClick={sortable ? onSort : undefined}
        >
          {children}
          {sortable && (
            <svg
              className={cn(
                'h-4 w-4 transition-transform',
                sortDirection === 'desc' && 'rotate-180',
                !sortDirection && 'opacity-30'
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          )}
        </Component>
      </th>
    );
  }
);

TableHead.displayName = 'TableHead';

/**
 * Table cell component
 */
export const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td ref={ref} className={cn('p-4 align-middle', className)} {...props} />
));

TableCell.displayName = 'TableCell';

/**
 * Table caption component
 */
export const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption ref={ref} className={cn('mt-4 text-sm text-neutral-600', className)} {...props} />
));

TableCaption.displayName = 'TableCaption';
