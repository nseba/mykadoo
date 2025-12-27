const navigationLinks = [
  { label: 'Search', href: '/search' },
  { label: 'Blog', href: '/blog' },
  { label: 'Pricing', href: '/pricing' },
];

const legalLinks = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:justify-between">
          {/* Logo and Description */}
          <div className="flex flex-col items-center lg:items-start gap-4">
            <a
              href="/"
              className="text-2xl font-bold transition-colors hover:opacity-80"
              style={{ color: '#FF6B6B' }}
            >
              Mykadoo
            </a>
            <p className="text-sm text-gray-500 text-center lg:text-left max-w-xs">
              AI-powered gift search engine helping you find the perfect gift for everyone.
            </p>
          </div>

          {/* Navigation Links */}
          <nav aria-label="Footer navigation" className="flex flex-col sm:flex-row gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Navigation</h3>
              <ul className="space-y-2">
                {navigationLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Legal</h3>
              <ul className="space-y-2">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-gray-200 pt-8 text-center">
          <p className="text-sm text-gray-500">
            &copy; {currentYear} Mykadoo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
