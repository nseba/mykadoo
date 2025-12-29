import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getArticles, getCategories, getFeaturedArticles } from '../../lib/content-api';
import { generateBlogListMetadata } from '../../lib/seo';
import { generateWebSiteSchema, generateOrganizationSchema } from '../../lib/structured-data';
import { ArticleCard } from '../../components/content/ArticleCard';
import { Breadcrumbs } from '../../components/content/Breadcrumbs';
import { Pagination } from '../../components/content/Pagination';

interface BlogPageProps {
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return generateBlogListMetadata();
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
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

async function FeaturedSection() {
  try {
    const { data: featured } = await getFeaturedArticles(2);
    if (featured.length === 0) return null;

    return (
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Guides</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {featured.map((article) => (
            <ArticleCard key={article.id} article={article} variant="featured" />
          ))}
        </div>
      </section>
    );
  } catch {
    return null;
  }
}

async function CategoriesSidebar() {
  try {
    const categories = await getCategories(true);
    if (categories.length === 0) return null;

    return (
      <aside
        role="complementary"
        aria-label="Blog categories"
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <h2 className="font-semibold text-gray-900 mb-4">Categories</h2>
        <ul className="space-y-2">
          {categories.slice(0, 10).map((category) => (
            <li key={category.id}>
              <Link
                href={`/blog/category/${category.slug}`}
                className="flex items-center justify-between text-gray-600 hover:text-coral-600 transition-colors"
              >
                <span>{category.name}</span>
                {category.articleCount !== undefined && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                    {category.articleCount}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    );
  } catch {
    return null;
  }
}

async function ArticlesList({ page }: { page: number }) {
  const { data: articles, totalPages } = await getArticles({
    page,
    limit: 9,
    sortBy: 'publishedAt',
    sortOrder: 'desc',
  });

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No articles found.</p>
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
        basePath="/blog"
        className="mt-12"
      />
    </>
  );
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || '1', 10);

  const schemaData = [generateWebSiteSchema(), generateOrganizationSchema()];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-coral-500 to-coral-600 text-white py-16">
          <div className="container mx-auto px-4">
            <Breadcrumbs
              items={[{ name: 'Blog', href: '/blog' }]}
              className="mb-6 text-coral-100 [&_a]:text-white [&_a:hover]:text-coral-200"
            />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Gift Ideas & Guides
            </h1>
            <p className="text-xl text-coral-100 max-w-2xl">
              Discover expert gift recommendations, buying guides, and tips to help
              you find the perfect gift for everyone on your list.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          {/* Featured Articles */}
          <Suspense fallback={null}>
            <FeaturedSection />
          </Suspense>

          <div className="lg:grid lg:grid-cols-4 lg:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Latest Articles
              </h2>
              <Suspense fallback={<LoadingSkeleton />}>
                <ArticlesList page={page} />
              </Suspense>
            </div>

            {/* Sidebar */}
            <div className="hidden lg:block space-y-6 mt-12 lg:mt-0">
              <Suspense fallback={null}>
                <CategoriesSidebar />
              </Suspense>

              {/* Newsletter Signup */}
              <aside
                role="complementary"
                aria-label="Newsletter signup"
                className="bg-coral-50 rounded-xl p-6"
              >
                <h2 className="font-semibold text-gray-900 mb-2">
                  Get Gift Ideas
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Subscribe to our newsletter for weekly gift inspiration.
                </p>
                <form className="space-y-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-coral-500 focus:border-transparent text-sm"
                    aria-label="Email address"
                  />
                  <button
                    type="submit"
                    className="w-full bg-coral-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-coral-700 transition-colors text-sm"
                  >
                    Subscribe
                  </button>
                </form>
              </aside>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
