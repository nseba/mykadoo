'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ArticleLink {
  slug: string;
  title: string;
  featuredImageUrl?: string | null;
  category?: {
    name: string;
    slug: string;
  } | null;
}

interface ArticleNavigationProps {
  previousArticle?: ArticleLink | null;
  nextArticle?: ArticleLink | null;
  className?: string;
}

export function ArticleNavigation({
  previousArticle,
  nextArticle,
  className,
}: ArticleNavigationProps) {
  if (!previousArticle && !nextArticle) {
    return null;
  }

  return (
    <nav
      className={cn('border-t border-gray-200 pt-8', className)}
      aria-label="Article navigation"
    >
      <div className="grid md:grid-cols-2 gap-4">
        {/* Previous Article */}
        {previousArticle ? (
          <Link
            href={`/blog/${previousArticle.slug}`}
            className="group flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0 group-hover:-translate-x-1 transition-transform" />
            <div className="flex-1 min-w-0">
              <span className="text-sm text-gray-500 mb-1 block">Previous</span>
              <h4 className="font-medium text-gray-900 line-clamp-2 group-hover:text-coral-600 transition-colors">
                {previousArticle.title}
              </h4>
              {previousArticle.category && (
                <span className="text-sm text-gray-500 mt-1 block">
                  {previousArticle.category.name}
                </span>
              )}
            </div>
            {previousArticle.featuredImageUrl && (
              <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 hidden sm:block">
                <Image
                  src={previousArticle.featuredImageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            )}
          </Link>
        ) : (
          <div />
        )}

        {/* Next Article */}
        {nextArticle ? (
          <Link
            href={`/blog/${nextArticle.slug}`}
            className="group flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-right md:flex-row-reverse"
          >
            <ChevronRight className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
            <div className="flex-1 min-w-0">
              <span className="text-sm text-gray-500 mb-1 block">Next</span>
              <h4 className="font-medium text-gray-900 line-clamp-2 group-hover:text-coral-600 transition-colors">
                {nextArticle.title}
              </h4>
              {nextArticle.category && (
                <span className="text-sm text-gray-500 mt-1 block">
                  {nextArticle.category.name}
                </span>
              )}
            </div>
            {nextArticle.featuredImageUrl && (
              <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 hidden sm:block">
                <Image
                  src={nextArticle.featuredImageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            )}
          </Link>
        ) : (
          <div />
        )}
      </div>
    </nav>
  );
}

export default ArticleNavigation;
