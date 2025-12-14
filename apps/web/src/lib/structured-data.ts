const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mykadoo.com';
const SITE_NAME = 'Mykadoo';
const LOGO_URL = `${SITE_URL}/logo.png`;

export interface ArticleSchemaProps {
  title: string;
  description: string;
  imageUrl?: string;
  datePublished: string;
  dateModified: string;
  authorName: string;
  authorUrl?: string;
  url: string;
}

export function generateArticleSchema(article: ArticleSchemaProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.imageUrl,
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    url: article.url,
    author: {
      '@type': 'Person',
      name: article.authorName,
      url: article.authorUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: LOGO_URL,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url,
    },
  };
}

export interface GiftGuideSchemaProps {
  title: string;
  description: string;
  imageUrl?: string;
  datePublished: string;
  dateModified: string;
  authorName: string;
  url: string;
  products: {
    name: string;
    description?: string;
    imageUrl?: string;
    price?: number;
    currency?: string;
    url: string;
  }[];
}

export function generateGiftGuideSchema(guide: GiftGuideSchemaProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: guide.title,
    description: guide.description,
    url: guide.url,
    numberOfItems: guide.products.length,
    itemListElement: guide.products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: product.imageUrl,
        url: product.url,
        ...(product.price && {
          offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: product.currency || 'USD',
            availability: 'https://schema.org/InStock',
          },
        }),
      },
    })),
  };
}

export interface BreadcrumbSchemaProps {
  items: {
    name: string;
    url: string;
  }[];
}

export function generateBreadcrumbSchema(breadcrumbs: BreadcrumbSchemaProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: LOGO_URL,
    description: 'AI-powered gift search engine helping you find the perfect gifts for everyone.',
    sameAs: [
      'https://twitter.com/mykadoo',
      'https://facebook.com/mykadoo',
      'https://instagram.com/mykadoo',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'support@mykadoo.com',
    },
  };
}

export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: 'AI-powered gift search engine helping you find the perfect gifts for everyone.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generatePersonSchema(author: {
  name: string;
  bio?: string;
  avatarUrl?: string;
  twitterHandle?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  slug: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    description: author.bio,
    image: author.avatarUrl,
    url: `${SITE_URL}/blog/author/${author.slug}`,
    sameAs: [
      author.twitterHandle && `https://twitter.com/${author.twitterHandle}`,
      author.linkedinUrl,
      author.websiteUrl,
    ].filter(Boolean),
  };
}

export interface ProductReviewSchemaProps {
  productName: string;
  productDescription?: string;
  productImageUrl?: string;
  productUrl: string;
  reviewBody: string;
  ratingValue: number;
  authorName: string;
  datePublished: string;
}

export function generateProductReviewSchema(review: ProductReviewSchemaProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Product',
      name: review.productName,
      description: review.productDescription,
      image: review.productImageUrl,
      url: review.productUrl,
    },
    reviewBody: review.reviewBody,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.ratingValue,
      bestRating: 5,
      worstRating: 1,
    },
    author: {
      '@type': 'Person',
      name: review.authorName,
    },
    datePublished: review.datePublished,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
  };
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
