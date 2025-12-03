import * as React from 'react';
import { cn } from '../../utils';

export interface SearchBarProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /**
   * Callback when search is submitted
   */
  onSearch?: (value: string) => void;

  /**
   * Show search button
   */
  showButton?: boolean;

  /**
   * Search button text
   */
  buttonText?: string;

  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Additional className for wrapper
   */
  wrapperClassName?: string;
}

/**
 * Search Icon
 */
const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle
      cx="8"
      cy="8"
      r="6"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M13 13L17 17"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * SearchBar component
 *
 * Search input with icon and optional search button.
 * Optimized for search functionality with keyboard shortcuts.
 *
 * @example
 * ```tsx
 * // Basic search bar
 * <SearchBar placeholder="Search products..." />
 *
 * // With search button
 * <SearchBar
 *   placeholder="Search..."
 *   showButton
 *   onSearch={(value) => console.log('Search:', value)}
 * />
 *
 * // Different sizes
 * <SearchBar size="sm" placeholder="Search..." />
 * <SearchBar size="md" placeholder="Search..." />
 * <SearchBar size="lg" placeholder="Search..." />
 *
 * // Controlled
 * <SearchBar
 *   value={searchQuery}
 *   onChange={(e) => setSearchQuery(e.target.value)}
 *   onSearch={handleSearch}
 * />
 * ```
 */
export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      className,
      onSearch,
      showButton = false,
      buttonText = 'Search',
      size = 'md',
      wrapperClassName,
      placeholder = 'Search...',
      ...props
    },
    ref
  ) => {
    const [value, setValue] = React.useState(props.value || props.defaultValue || '');

    React.useEffect(() => {
      if (props.value !== undefined) {
        setValue(props.value);
      }
    }, [props.value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
      props.onChange?.(e);
    };

    const handleSearch = () => {
      if (onSearch) {
        onSearch(String(value));
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSearch();
      }
      props.onKeyDown?.(e);
    };

    const sizeStyles = {
      sm: 'px-3 py-1.5 pl-9 text-sm',
      md: 'px-4 py-2 pl-10 text-base',
      lg: 'px-5 py-3 pl-12 text-lg',
    };

    const iconSizes = {
      sm: 'left-2.5',
      md: 'left-3',
      lg: 'left-4',
    };

    return (
      <div className={cn('w-full', wrapperClassName)}>
        <div className="relative flex items-center gap-2">
          <div className={cn('absolute top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none', iconSizes[size])}>
            <SearchIcon />
          </div>

          <input
            ref={ref}
            type="search"
            className={cn(
              // Base styles
              'w-full rounded-lg border bg-white',
              'text-neutral-900 placeholder-neutral-400',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              'border-neutral-300 focus:ring-primary-500 focus:border-primary-500',
              // Disabled state
              'disabled:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-400',
              // Size
              sizeStyles[size],
              // Button spacing
              showButton && 'pr-2',
              className
            )}
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            {...props}
          />

          {showButton && (
            <button
              type="button"
              onClick={handleSearch}
              disabled={props.disabled}
              className={cn(
                'absolute right-1 px-4 py-1.5 rounded-md',
                'bg-primary-500 text-white font-medium text-sm',
                'hover:bg-primary-600 active:bg-primary-700',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
                'transition-colors duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {buttonText}
            </button>
          )}
        </div>
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';
