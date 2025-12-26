import { Suspense } from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Twitter, Linkedin, Globe } from 'lucide-react';
import { getAuthorBySlug, getAuthorArticles, getAuthors } from '../../../../lib/content-api';
import { generateAuthorMetadata } from '../../../../lib/seo';
import { generatePersonSchema } from '../../../../lib/structured-data';
import { ArticleCard } from '../../../../components/content/ArticleCard';
import { Breadcrumbs } from '../../../../components/content/Breadcrumbs';
import { Pagination } from '../../../../components/content/Pagination';

interface AuthorPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  try {
    const author = await getAuthorBySlug(resolvedParams.slug);
    return generateAuthorMetadata(author);
  } catch {
    return { title: 'Author Not Found' };
  }
}

export async function generateStaticParams() {
  try {
    const authors = await getAuthors();
    return authors.map((author) => ({
      slug: author.slug,
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

async function AuthorArticles({ slug, page }: { slug: string; page: number }) {
  const { data: articles, totalPages } = await getAuthorArticles(slug, {
    page,
    limit: 9,
    sortBy: 'publishedAt',
    sortOrder: 'desc',
  });

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No articles found by this author.</p>
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
        basePath={`/blog/author/${slug}`}
        className="mt-12"
      />
    </>
  );
}

export default async function AuthorPage({ params, searchParams }: AuthorPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || '1', 10);

  let author;
  try {
    author = await getAuthorBySlug(resolvedParams.slug);
  } catch {
    notFound();
  }

  if (!author) {
    notFound();
  }

  const schemaData = generatePersonSchema(author);

  const breadcrumbItems = [
    { name: 'Blog', href: '/blog' },
    { name: author.name, href: `/blog/author/${author.slug}` },
  ];

  const hasSocialLinks = author.twitterHandle || author.linkedinUrl || author.websiteUrl;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <section className="bg-white py-16 border-b border-gray-200">
          <div className="container mx-auto px-4">
            <Breadcrumbs items={breadcrumbItems} className="mb-8" />

            <div className="flex flex-col md:flex-row items-start gap-8">
              {/* Author Avatar */}
              {author.avatarUrl ? (
                <Image
                  src={author.avatarUrl}
                  alt={author.name}
                  width={120}
                  height={120}
                  className="rounded-full"
                />
              ) : (
                <div className="w-30 h-30 rounded-full bg-coral-100 flex items-center justify-center shrink-0">
                  <span className="text-coral-600 text-4xl font-medium">
                    {author.name.charAt(0)}
                  </span>
                </div>
              )}

              {/* Author Info */}
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                  {author.name}
                </h1>

                {author.bio && (
                  <p className="text-lg text-gray-600 mb-4 max-w-2xl">
                    {author.bio}
                  </p>
                )}

                {hasSocialLinks && (
                  <div className="flex items-center gap-4">
                    {author.twitterHandle && (
                      <a
                        href={`https://twitter.com/${author.twitterHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-gray-500 hover:text-blue-400 transition-colors"
                        aria-label={`Follow ${author.name} on Twitter`}
                      >
                        <Twitter className="w-5 h-5" />
                        <span className="text-sm">@{author.twitterHandle}</span>
                      </a>
                    )}
                    {author.linkedinUrl && (
                      <a
                        href={author.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors"
                        aria-label={`Connect with ${author.name} on LinkedIn`}
                      >
                        <Linkedin className="w-5 h-5" />
                        <span className="text-sm">LinkedIn</span>
                      </a>
                    )}
                    {author.websiteUrl && (
                      <a
                        href={author.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-gray-500 hover:text-coral-500 transition-colors"
                        aria-label={`Visit ${author.name}'s website`}
                      >
                        <Globe className="w-5 h-5" />
                        <span className="text-sm">Website</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Articles */}
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Articles by {author.name}
          </h2>
          <Suspense fallback={<LoadingSkeleton />}>
            <AuthorArticles slug={resolvedParams.slug} page={page} />
          </Suspense>
        </div>
      </main>
    </>
  );
}
