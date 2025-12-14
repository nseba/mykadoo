import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCategoryBySlug, getCategoryArticles, getCategories } from '../../../../lib/content-api';
import { generateCategoryMetadata } from '../../../../lib/seo';
import { ArticleCard, Breadcrumbs, Pagination } from '../../../../components/content';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  try {
    const category = await getCategoryBySlug(resolvedParams.slug);
    return generateCategoryMetadata(category);
  } catch {
    return { title: 'Category Not Found' };
  }
}

export async function generateStaticParams() {
  try {
    const categories = await getCategories();
    return categories.map((category) => ({
      slug: category.slug,
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

async function CategoryArticles({ slug, page }: { slug: string; page: number }) {
  const { data: articles, totalPages } = await getCategoryArticles(slug, {
    page,
    limit: 9,
    sortBy: 'publishedAt',
    sortOrder: 'desc',
  });

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No articles found in this category.</p>
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
        basePath={`/blog/category/${slug}`}
        className="mt-12"
      />
    </>
  );
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || '1', 10);

  let category;
  try {
    category = await getCategoryBySlug(resolvedParams.slug);
  } catch {
    notFound();
  }

  if (!category) {
    notFound();
  }

  const breadcrumbItems = [
    { name: 'Blog', href: '/blog' },
    { name: category.name, href: `/blog/category/${category.slug}` },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-coral-500 to-coral-600 text-white py-16">
        <div className="container mx-auto px-4">
          <Breadcrumbs
            items={breadcrumbItems}
            className="mb-6 text-coral-100 [&_a]:text-white [&_a:hover]:text-coral-200"
          />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-xl text-coral-100 max-w-2xl">
              {category.description}
            </p>
          )}
        </div>
      </section>

      {/* Articles */}
      <div className="container mx-auto px-4 py-12">
        <Suspense fallback={<LoadingSkeleton />}>
          <CategoryArticles slug={resolvedParams.slug} page={page} />
        </Suspense>
      </div>
    </main>
  );
}
