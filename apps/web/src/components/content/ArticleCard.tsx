'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Article } from '../../lib/content-api';

interface ArticleCardProps {
  article: Article;
  variant?: 'default' | 'featured' | 'compact';
}

export function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
  const primaryCategory = article.categories.find((c) => c.isPrimary) || article.categories[0];

  if (variant === 'featured') {
    return (
      <article className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
        <Link href={`/blog/${article.slug}`} className="block">
          <div className="relative aspect-[16/9] overflow-hidden">
            {article.featuredImageUrl ? (
              <Image
                src={article.featuredImageUrl}
                alt={article.featuredImageAlt || article.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-coral-100 to-coral-200 flex items-center justify-center">
                <span className="text-coral-500 text-4xl">🎁</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            {primaryCategory && (
              <span className="inline-block px-3 py-1 text-xs font-semibold bg-coral-500 rounded-full mb-3">
                {primaryCategory.name}
              </span>
            )}
            <h2 className="text-2xl font-bold mb-2 line-clamp-2 group-hover:text-coral-300 transition-colors">
              {article.title}
            </h2>
            {article.excerpt && (
              <p className="text-gray-200 text-sm line-clamp-2 mb-3">
                {article.excerpt}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-300">
              <span>{article.author.name}</span>
              <span>•</span>
              {article.readingTimeMinutes && (
                <span>{article.readingTimeMinutes} min read</span>
              )}
            </div>
          </div>
        </Link>
      </article>
    );
  }

  if (variant === 'compact') {
    return (
      <article className="group flex gap-4 items-start">
        <Link href={`/blog/${article.slug}`} className="shrink-0">
          <div className="relative w-20 h-20 rounded-lg overflow-hidden">
            {article.featuredImageUrl ? (
              <Image
                src={article.featuredImageUrl}
                alt={article.featuredImageAlt || article.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="80px"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-coral-100 to-coral-200 flex items-center justify-center">
                <span className="text-coral-500 text-lg">🎁</span>
              </div>
            )}
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/blog/${article.slug}`}>
            <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-coral-600 transition-colors">
              {article.title}
            </h3>
          </Link>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
            {article.publishedAt && (
              <time dateTime={article.publishedAt}>
                {new Date(article.publishedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </time>
            )}
            {article.readingTimeMinutes && (
              <>
                <span>•</span>
                <span>{article.readingTimeMinutes} min</span>
              </>
            )}
          </div>
        </div>
      </article>
    );
  }

  // Default variant
  return (
    <article className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
      <Link href={`/blog/${article.slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden">
          {article.featuredImageUrl ? (
            <Image
              src={article.featuredImageUrl}
              alt={article.featuredImageAlt || article.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-coral-100 to-coral-200 flex items-center justify-center">
              <span className="text-coral-500 text-3xl">🎁</span>
            </div>
          )}
        </div>
      </Link>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          {primaryCategory && (
            <Link
              href={`/blog/category/${primaryCategory.slug}`}
              className="text-xs font-medium text-coral-600 hover:text-coral-700 transition-colors"
            >
              {primaryCategory.name}
            </Link>
          )}
          {article.readingTimeMinutes && (
            <>
              <span className="text-gray-300">•</span>
              <span className="text-xs text-gray-500">{article.readingTimeMinutes} min read</span>
            </>
          )}
        </div>
        <Link href={`/blog/${article.slug}`}>
          <h2 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-coral-600 transition-colors">
            {article.title}
          </h2>
        </Link>
        {article.excerpt && (
          <p className="text-gray-600 text-sm line-clamp-2 mb-4">
            {article.excerpt}
          </p>
        )}
        <div className="flex items-center gap-3">
          {article.author.avatarUrl ? (
            <Image
              src={article.author.avatarUrl}
              alt={article.author.name}
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-coral-100 flex items-center justify-center">
              <span className="text-coral-600 text-sm font-medium">
                {article.author.name.charAt(0)}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <Link
              href={`/blog/author/${article.author.slug}`}
              className="text-sm font-medium text-gray-900 hover:text-coral-600 transition-colors"
            >
              {article.author.name}
            </Link>
            {article.publishedAt && (
              <p className="text-xs text-gray-500">
                {new Date(article.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
