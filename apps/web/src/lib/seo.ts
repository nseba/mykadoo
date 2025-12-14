import type { Metadata } from 'next';

const SITE_NAME = 'Mykadoo';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mykadoo.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

export interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  article?: {
    publishedTime: string;
    modifiedTime?: string;
    authors: string[];
    tags?: string[];
    section?: string;
  };
  noIndex?: boolean;
}

export function generateMetadata({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage,
  ogTitle,
  ogDescription,
  article,
  noIndex = false,
}: SEOProps): Metadata {
  const fullTitle = `${title} | ${SITE_NAME} Gift Ideas`;
  const finalOgImage = ogImage || DEFAULT_OG_IMAGE;
  const finalCanonical = canonicalUrl || SITE_URL;

  return {
    title: fullTitle,
    description,
    keywords: keywords?.join(', '),
    alternates: {
      canonical: finalCanonical,
    },
    openGraph: {
      type: article ? 'article' : 'website',
      locale: 'en_US',
      url: finalCanonical,
      siteName: SITE_NAME,
      title: ogTitle || fullTitle,
      description: ogDescription || description,
      images: [
        {
          url: finalOgImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(article && {
        publishedTime: article.publishedTime,
        modifiedTime: article.modifiedTime,
        authors: article.authors,
        tags: article.tags,
        section: article.section,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle || fullTitle,
      description: ogDescription || description,
      images: [finalOgImage],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export function generateBlogListMetadata(
  page: number = 1,
  category?: string,
  tag?: string
): Metadata {
  let title = 'Gift Ideas Blog';
  let description = 'Discover the best gift ideas, buying guides, and gifting tips from our expert team.';

  if (category) {
    title = `${category} Gift Guides`;
    description = `Browse our curated collection of ${category.toLowerCase()} gift guides and recommendations.`;
  }

  if (tag) {
    title = `${tag} Gifts`;
    description = `Find the perfect ${tag.toLowerCase()} gifts with our expert recommendations and guides.`;
  }

  if (page > 1) {
    title = `${title} - Page ${page}`;
  }

  return generateMetadata({
    title,
    description,
    keywords: ['gift ideas', 'gift guide', 'gift recommendations', category, tag].filter(Boolean) as string[],
  });
}

export function generateArticleMetadata(article: {
  title: string;
  excerpt?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImageUrl?: string;
  featuredImageUrl?: string;
  publishedAt?: string;
  updatedAt: string;
  author: { name: string };
  categories: { name: string }[];
  tags: { name: string }[];
}): Metadata {
  const title = article.seoTitle || article.title;
  const description = article.seoDescription || article.excerpt || `${article.title} - Gift guide from Mykadoo`;
  const ogImage = article.ogImageUrl || article.featuredImageUrl;

  return generateMetadata({
    title,
    description,
    keywords: article.seoKeywords || article.tags.map(t => t.name),
    canonicalUrl: article.canonicalUrl,
    ogImage,
    ogTitle: article.ogTitle,
    ogDescription: article.ogDescription,
    article: article.publishedAt ? {
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author.name],
      tags: article.tags.map(t => t.name),
      section: article.categories[0]?.name,
    } : undefined,
  });
}

export function generateAuthorMetadata(author: {
  name: string;
  bio?: string;
}): Metadata {
  return generateMetadata({
    title: `Articles by ${author.name}`,
    description: author.bio || `Read gift guides and articles written by ${author.name} on Mykadoo.`,
    keywords: ['gift ideas', 'gift guide', author.name],
  });
}

export function generateCategoryMetadata(category: {
  name: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
}): Metadata {
  return generateMetadata({
    title: category.seoTitle || `${category.name} Gift Guides`,
    description: category.seoDescription || category.description || `Browse our ${category.name.toLowerCase()} gift guides and recommendations.`,
    keywords: ['gift ideas', 'gift guide', category.name.toLowerCase()],
  });
}

export function generateTagMetadata(tag: {
  name: string;
}): Metadata {
  return generateMetadata({
    title: `${tag.name} Gifts & Gift Ideas`,
    description: `Find the perfect ${tag.name.toLowerCase()} gifts with our expert gift guides and recommendations.`,
    keywords: ['gift ideas', 'gift guide', tag.name.toLowerCase()],
  });
}
