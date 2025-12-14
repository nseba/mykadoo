import Link from 'next/link';
import Image from 'next/image';
import { Clock, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface RelatedArticle {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  featuredImageUrl?: string | null;
  readingTimeMinutes?: number | null;
  publishedAt?: Date | string | null;
  category?: {
    name: string;
    slug: string;
  } | null;
}

interface RelatedArticlesProps {
  articles: RelatedArticle[];
  title?: string;
  className?: string;
}

export function RelatedArticles({
  articles,
  title = 'Related Articles',
  className,
}: RelatedArticlesProps) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <section className={cn('bg-white py-12 border-t border-gray-200', className)}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <Link
            href="/blog"
            className="text-coral-600 hover:text-coral-700 font-medium flex items-center gap-1 group"
          >
            View all articles
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.slice(0, 3).map((article) => (
            <article
              key={article.id}
              className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
            >
              <Link href={`/blog/${article.slug}`} className="block">
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  {article.featuredImageUrl ? (
                    <Image
                      src={article.featuredImageUrl}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-coral-100 to-coral-200" />
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Category & Reading Time */}
                  <div className="flex items-center justify-between text-sm mb-3">
                    {article.category && (
                      <span className="text-coral-600 font-medium">
                        {article.category.name}
                      </span>
                    )}
                    {article.readingTimeMinutes && (
                      <span className="text-gray-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {article.readingTimeMinutes} min read
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-coral-600 transition-colors">
                    {article.title}
                  </h3>

                  {/* Excerpt */}
                  {article.excerpt && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {article.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            </article>
          ))}
        </div>

        {/* Show more if there are more than 3 related articles */}
        {articles.length > 3 && (
          <div className="mt-8 text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-coral-50 text-coral-600 rounded-lg font-medium hover:bg-coral-100 transition-colors"
            >
              See more articles
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export default RelatedArticles;
