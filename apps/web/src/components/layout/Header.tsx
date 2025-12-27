interface NavLink {
  label: string;
  href: string;
}

const navLinks: NavLink[] = [
  { label: 'Search', href: '/search' },
  { label: 'Blog', href: '/blog' },
  { label: 'Pricing', href: '/pricing' },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16"
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <a
          href="/"
          className="flex items-center gap-2 text-2xl font-bold transition-colors hover:opacity-80"
          style={{ color: '#FF6B6B' }}
        >
          Mykadoo
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Actions (Desktop) */}
        <div className="hidden md:flex md:items-center md:gap-4">
          <a
            href="/login"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Log in
          </a>
          <a
            href="/signup"
            className="rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:opacity-90"
            style={{ backgroundColor: '#FF6B6B' }}
          >
            Sign up
          </a>
        </div>

        {/* Mobile Menu - CSS-only using details/summary */}
        <details className="md:hidden group relative">
          <summary className="list-none cursor-pointer inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500">
            <span className="sr-only">Open menu</span>
            {/* Hamburger icon - shown when closed */}
            <svg
              className="h-6 w-6 group-open:hidden"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
            {/* Close icon - shown when open */}
            <svg
              className="h-6 w-6 hidden group-open:block"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </summary>

          {/* Mobile Menu Panel */}
          <div className="absolute right-0 top-full mt-2 w-64 origin-top-right rounded-lg border border-gray-200 bg-white shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="py-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block px-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="border-t border-gray-200 mt-2 pt-2">
                <a
                  href="/login"
                  className="block px-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  Log in
                </a>
                <div className="px-4 py-2">
                  <a
                    href="/signup"
                    className="block rounded-full px-4 py-2 text-center text-base font-semibold text-white shadow-sm transition-colors hover:opacity-90"
                    style={{ backgroundColor: '#FF6B6B' }}
                  >
                    Sign up
                  </a>
                </div>
              </div>
            </div>
          </div>
        </details>
      </nav>
    </header>
  );
}
