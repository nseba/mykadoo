import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTagBySlug, getTagArticles, getTags } from '../../../../lib/content-api';
import { generateTagMetadata } from '../../../../lib/seo';
import { ArticleCard, Breadcrumbs, Pagination } from '../../../../components/content';

interface TagPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  try {
    const tag = await getTagBySlug(resolvedParams.slug);
    return generateTagMetadata(tag);
  } catch {
    return { title: 'Tag Not Found' };
  }
}

export async function generateStaticParams() {
  try {
    const tags = await getTags();
    return tags.map((tag) => ({
      slug: tag.slug,
    }));
  } catch {
    return [];
  }
}

function LoadingSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
          <div className="aspect-[16/10] bg-gray-200" />
          <div className="p-5">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-3" />
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-full mb-4" />
          </div>
        </div>
      ))}
    </div>
  );
}

async function TagArticles({ slug, page }: { slug: string; page: number }) {
  const { data: articles, totalPages } = await getTagArticles(slug, {
    page,
    limit: 9,
    sortBy: 'publishedAt',
    sortOrder: 'desc',
  });

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No articles found with this tag.</p>
        <p className="text-gray-400 text-sm mt-2">Check back soon for new content!</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath={`/blog/tag/${slug}`}
        className="mt-12"
      />
    </>
  );
}

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || '1', 10);

  let tag;
  try {
    tag = await getTagBySlug(resolvedParams.slug);
  } catch {
    notFound();
  }

  if (!tag) {
    notFound();
  }

  const breadcrumbItems = [
    { name: 'Blog', href: '/blog' },
    { name: `Tag: ${tag.name}`, href: `/blog/tag/${tag.slug}` },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-gray-700 to-gray-800 text-white py-16">
        <div className="container mx-auto px-4">
          <Breadcrumbs
            items={breadcrumbItems}
            className="mb-6 text-gray-300 [&_a]:text-white [&_a:hover]:text-gray-200"
          />
          <div className="flex items-center gap-3 mb-4">
            <span className="text-gray-400">Tag:</span>
            <span className="px-4 py-2 bg-coral-500 text-white font-semibold rounded-full">
              {tag.name}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            {tag.name} Gift Ideas
          </h1>
        </div>
      </section>

      {/* Articles */}
      <div className="container mx-auto px-4 py-12">
        <Suspense fallback={<LoadingSkeleton />}>
          <TagArticles slug={resolvedParams.slug} page={page} />
        </Suspense>
      </div>
    </main>
  );
}
