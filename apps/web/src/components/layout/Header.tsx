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

        {/* Mobile - Simple Links */}
        <div className="md:hidden flex items-center gap-4">
          <a href="/search" className="text-sm font-medium text-gray-600">
            Search
          </a>
          <a href="/login" className="text-sm font-medium text-gray-600">
            Log in
          </a>
        </div>
      </nav>
    </header>
  );
}
