'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { generateBreadcrumbSchema } from '../../lib/structured-data';

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mykadoo.com';

  const allItems = [
    { name: 'Home', href: '/' },
    ...items,
  ];

  const schemaData = generateBreadcrumbSchema({
    items: allItems.map((item) => ({
      name: item.name,
      url: `${SITE_URL}${item.href}`,
    })),
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <nav
        aria-label="Breadcrumb"
        className={`flex items-center gap-1 text-sm text-gray-500 ${className}`}
      >
        <ol className="flex items-center gap-1 flex-wrap">
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1;

            return (
              <li key={item.href} className="flex items-center gap-1">
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 text-gray-400" aria-hidden />
                )}
                {isLast ? (
                  <span
                    className="text-gray-700 font-medium truncate max-w-[200px]"
                    aria-current="page"
                  >
                    {item.name === 'Home' ? (
                      <Home className="w-4 h-4" aria-label="Home" />
                    ) : (
                      item.name
                    )}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="hover:text-coral-600 transition-colors flex items-center"
                  >
                    {item.name === 'Home' ? (
                      <Home className="w-4 h-4" aria-label="Home" />
                    ) : (
                      <span className="truncate max-w-[150px]">{item.name}</span>
                    )}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
