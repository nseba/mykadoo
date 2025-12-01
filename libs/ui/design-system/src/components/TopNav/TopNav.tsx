import React from 'react';
import { cn } from '../../utils/cn';

export interface TopNavLink {
  label: string;
  href: string;
  active?: boolean;
  disabled?: boolean;
}

export interface TopNavProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Logo/brand element
   */
  logo?: React.ReactNode;
  /**
   * Navigation links
   */
  links?: TopNavLink[];
  /**
   * Actions (e.g., user menu, search)
   */
  actions?: React.ReactNode;
  /**
   * Fixed to top of viewport
   */
  fixed?: boolean;
  /**
   * Background variant
   */
  variant?: 'light' | 'dark' | 'transparent';
  /**
   * Border at bottom
   */
  bordered?: boolean;
}

export const TopNav = React.forwardRef<HTMLElement, TopNavProps>(
  (
    {
      logo,
      links = [],
      actions,
      fixed = false,
      variant = 'light',
      bordered = true,
      className,
      ...props
    },
    ref
  ) => {
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    const variantStyles = {
      light: 'bg-white text-neutral-900',
      dark: 'bg-neutral-900 text-white',
      transparent: 'bg-transparent text-neutral-900',
    };

    return (
      <nav
        ref={ref}
        className={cn(
          'w-full z-50 transition-colors',
          variantStyles[variant],
          fixed && 'sticky top-0',
          bordered && 'border-b border-neutral-200',
          className
        )}
        role="navigation"
        aria-label="Main navigation"
        {...props}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            {logo && <div className="flex-shrink-0">{logo}</div>}

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-8 flex-1 ml-10">
              {links.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className={cn(
                    'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    link.active
                      ? 'text-primary-600 bg-primary-50'
                      : 'hover:text-primary-600 hover:bg-neutral-50',
                    link.disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
                  )}
                  aria-current={link.active ? 'page' : undefined}
                  aria-disabled={link.disabled}
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Actions */}
            {actions && <div className="hidden md:flex md:items-center md:space-x-4">{actions}</div>}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                type="button"
                className={cn(
                  'inline-flex items-center justify-center p-2 rounded-md',
                  'hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500'
                )}
                aria-controls="mobile-menu"
                aria-expanded={mobileMenuOpen}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden" id="mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {links.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className={cn(
                    'block px-3 py-2 rounded-md text-base font-medium',
                    link.active
                      ? 'text-primary-600 bg-primary-50'
                      : 'hover:text-primary-600 hover:bg-neutral-50',
                    link.disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
                  )}
                  aria-current={link.active ? 'page' : undefined}
                  aria-disabled={link.disabled}
                >
                  {link.label}
                </a>
              ))}
            </div>
            {actions && <div className="pt-4 pb-3 border-t border-neutral-200 px-2">{actions}</div>}
          </div>
        )}
      </nav>
    );
  }
);

TopNav.displayName = 'TopNav';
