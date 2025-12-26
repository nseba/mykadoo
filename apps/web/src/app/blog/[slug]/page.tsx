import { Suspense } from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock, Eye, Share2, Calendar } from 'lucide-react';
import { getArticleBySlug, getRelatedArticles, getArticles } from '../../../lib/content-api';
import { generateArticleMetadata } from '../../../lib/seo';
import { generateArticleSchema, generateBreadcrumbSchema } from '../../../lib/structured-data';
import { ArticleCard } from '../../../components/content/ArticleCard';
import { AuthorCard } from '../../../components/content/AuthorCard';
import { Breadcrumbs } from '../../../components/content/Breadcrumbs';
import { TableOfContents } from '../../../components/content/TableOfContents';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  try {
    const article = await getArticleBySlug(resolvedParams.slug);
    return generateArticleMetadata(article);
  } catch {
    return { title: 'Article Not Found' };
  }
}

export async function generateStaticParams() {
  try {
    const { data: articles } = await getArticles({ limit: 100 });
    return articles.map((article) => ({
      slug: article.slug,
    }));
  } catch {
    return [];
  }
}

async function RelatedArticles({ articleId }: { articleId: string }) {
  try {
    const related = await getRelatedArticles(articleId, 3);
    if (related.length === 0) return null;

    return (
      <section className="mt-12 pt-12 border-t border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {related.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </section>
    );
  } catch {
    return null;
  }
}

function ShareButtons({ title, slug }: { title: string; slug: string }) {
  const url = encodeURIComponent(`https://mykadoo.com/blog/${slug}`);
  const text = encodeURIComponent(title);

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-500 flex items-center gap-1">
        <Share2 className="w-4 h-4" />
        Share:
      </span>
      <a
        href={`https://twitter.com/intent/tweet?url=${url}&text=${text}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-400 hover:text-blue-400 transition-colors"
        aria-label="Share on Twitter"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${url}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-400 hover:text-blue-600 transition-colors"
        aria-label="Share on Facebook"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </a>
      <a
        href={`https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${text}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-400 hover:text-blue-700 transition-colors"
        aria-label="Share on LinkedIn"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      </a>
    </div>
  );
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const resolvedParams = await params;
  let article;

  try {
    article = await getArticleBySlug(resolvedParams.slug);
  } catch {
    notFound();
  }

  if (!article) {
    notFound();
  }

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mykadoo.com';
  const primaryCategory = article.categories.find((c) => c.isPrimary) || article.categories[0];

  const schemaData = generateArticleSchema({
    title: article.title,
    description: article.seoDescription || article.excerpt || article.title,
    imageUrl: article.featuredImageUrl,
    datePublished: article.publishedAt || article.createdAt,
    dateModified: article.updatedAt,
    authorName: article.author.name,
    authorUrl: `${SITE_URL}/blog/author/${article.author.slug}`,
    url: `${SITE_URL}/blog/${article.slug}`,
  });

  const breadcrumbItems = [
    { name: 'Blog', href: '/blog' },
  ];

  if (primaryCategory) {
    breadcrumbItems.push({
      name: primaryCategory.name,
      href: `/blog/category/${primaryCategory.slug}`,
    });
  }

  breadcrumbItems.push({ name: article.title, href: `/blog/${article.slug}` });

  // Process content to add IDs to headings for TOC
  const processedContent = article.content.replace(
    /<(h[2-3])>(.*?)<\/\1>/g,
    (match, tag, text) => {
      const id = text
        .toLowerCase()
        .replace(/<[^>]*>/g, '')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      return `<${tag} id="${id}">${text}</${tag}>`;
    }
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <main className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <Breadcrumbs items={breadcrumbItems} className="mb-6" />

            <div className="max-w-4xl">
              {primaryCategory && (
                <Link
                  href={`/blog/category/${primaryCategory.slug}`}
                  className="inline-block text-sm font-semibold text-coral-600 hover:text-coral-700 mb-4"
                >
                  {primaryCategory.name}
                </Link>
              )}

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                {article.title}
              </h1>

              {article.excerpt && (
                <p className="text-xl text-gray-600 mb-6">{article.excerpt}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <AuthorCard author={article.author} variant="inline" />

                {article.publishedAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(article.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                )}

                {article.readingTimeMinutes && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {article.readingTimeMinutes} min read
                  </span>
                )}

                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {article.viewCount.toLocaleString()} views
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {article.featuredImageUrl && (
          <div className="container mx-auto px-4 -mt-4 mb-8">
            <figure className="max-w-4xl mx-auto">
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden shadow-lg">
                <Image
                  src={article.featuredImageUrl}
                  alt={article.featuredImageAlt || article.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 900px"
                />
              </div>
              {article.featuredImageCaption && (
                <figcaption className="text-center text-sm text-gray-500 mt-3">
                  {article.featuredImageCaption}
                </figcaption>
              )}
            </figure>
          </div>
        )}

        {/* Content */}
        <div className="container mx-auto px-4 pb-16">
          <div className="lg:grid lg:grid-cols-4 lg:gap-12">
            {/* Sidebar - Table of Contents (Desktop) */}
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <TableOfContents content={article.content} />
              </div>
            </aside>

            {/* Main Article Content */}
            <article className="lg:col-span-3 max-w-3xl">
              {/* Mobile TOC */}
              <div className="lg:hidden mb-8">
                <TableOfContents content={article.content} />
              </div>

              {/* Article Body */}
              <div
                className="prose prose-lg prose-gray max-w-none
                  prose-headings:font-bold prose-headings:text-gray-900
                  prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
                  prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                  prose-p:text-gray-700 prose-p:leading-relaxed
                  prose-a:text-coral-600 prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-gray-900
                  prose-ul:my-4 prose-ol:my-4
                  prose-li:text-gray-700
                  prose-img:rounded-xl prose-img:shadow-md
                  prose-blockquote:border-l-coral-500 prose-blockquote:bg-gray-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg"
                dangerouslySetInnerHTML={{ __html: processedContent }}
              />

              {/* Tags */}
              {article.tags.length > 0 && (
                <div className="mt-12 pt-6 border-t border-gray-200">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-gray-500">Tags:</span>
                    {article.tags.map((tag) => (
                      <Link
                        key={tag.id}
                        href={`/blog/tag/${tag.slug}`}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-coral-100 hover:text-coral-700 transition-colors"
                      >
                        {tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Share & Author */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <ShareButtons title={article.title} slug={article.slug} />
                </div>

                <div className="mt-8">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    Written by
                  </h3>
                  <AuthorCard author={article.author} />
                </div>
              </div>

              {/* Related Articles */}
              <Suspense fallback={null}>
                <RelatedArticles articleId={article.id} />
              </Suspense>
            </article>
          </div>
        </div>
      </main>
    </>
  );
}
