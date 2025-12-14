import type { MetadataRoute } from 'next';
import { getSitemapArticles, getSitemapCategories, getSitemapTags } from '../lib/content-api';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mykadoo.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemap: MetadataRoute.Sitemap = [];

  // Static pages
  sitemap.push(
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    }
  );

  // Dynamic content from API
  try {
    // Articles
    const articles = await getSitemapArticles();
    for (const article of articles) {
      sitemap.push({
        url: `${SITE_URL}/blog/${article.slug}`,
        lastModified: new Date(article.updatedAt),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }

    // Categories
    const categories = await getSitemapCategories();
    for (const category of categories) {
      sitemap.push({
        url: `${SITE_URL}/blog/category/${category.slug}`,
        lastModified: new Date(category.updatedAt),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }

    // Tags
    const tags = await getSitemapTags();
    for (const tag of tags) {
      sitemap.push({
        url: `${SITE_URL}/blog/tag/${tag.slug}`,
        lastModified: new Date(tag.updatedAt),
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    }
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return static pages only if API fails
  }

  return sitemap;
}
