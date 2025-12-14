const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Author {
  id: string;
  name: string;
  slug: string;
  email?: string;
  bio?: string;
  avatarUrl?: string;
  twitterHandle?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  isActive: boolean;
  articleCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  seoTitle?: string;
  seoDescription?: string;
  sortOrder: number;
  isActive: boolean;
  articleCount?: number;
  children?: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  articleCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImageUrl?: string;
  featuredImageAlt?: string;
  featuredImageCaption?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';
  contentType: 'ARTICLE' | 'GIFT_GUIDE' | 'HOW_TO' | 'SEASONAL' | 'TREND' | 'BUYERS_GUIDE';
  publishedAt?: string;
  scheduledAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImageUrl?: string;
  readingTimeMinutes?: number;
  wordCount?: number;
  viewCount: number;
  shareCount: number;
  isFeatured: boolean;
  author: {
    id: string;
    name: string;
    slug: string;
    avatarUrl?: string;
    bio?: string;
  };
  categories: {
    id: string;
    name: string;
    slug: string;
    isPrimary: boolean;
  }[];
  tags: {
    id: string;
    name: string;
    slug: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedArticles {
  data: Article[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ArticleQueryParams {
  status?: string;
  contentType?: string;
  category?: string;
  tag?: string;
  author?: string;
  featured?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    next: {
      revalidate: 60, // Revalidate every 60 seconds (ISR)
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Articles
export async function getArticles(params: ArticleQueryParams = {}): Promise<PaginatedArticles> {
  const searchParams = new URLSearchParams();

  // Only include published articles for public API
  searchParams.set('status', 'PUBLISHED');

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  });

  return fetchApi<PaginatedArticles>(`/content/articles?${searchParams.toString()}`);
}

export async function getArticleBySlug(slug: string): Promise<Article> {
  return fetchApi<Article>(`/content/articles/${slug}`);
}

export async function getRelatedArticles(articleId: string, limit: number = 6): Promise<Article[]> {
  return fetchApi<Article[]>(`/content/articles/${articleId}/related?limit=${limit}`);
}

export async function getFeaturedArticles(limit: number = 4): Promise<PaginatedArticles> {
  return getArticles({ featured: true, limit });
}

// Categories
export async function getCategories(includeCount: boolean = false): Promise<Category[]> {
  const searchParams = new URLSearchParams();
  searchParams.set('activeOnly', 'true');
  if (includeCount) {
    searchParams.set('includeCount', 'true');
  }
  return fetchApi<Category[]>(`/content/categories?${searchParams.toString()}`);
}

export async function getCategoryBySlug(slug: string): Promise<Category> {
  return fetchApi<Category>(`/content/categories/${slug}`);
}

export async function getCategoryArticles(
  slug: string,
  params: Omit<ArticleQueryParams, 'category'> = {}
): Promise<PaginatedArticles> {
  const searchParams = new URLSearchParams();
  searchParams.set('status', 'PUBLISHED');

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  });

  return fetchApi<PaginatedArticles>(`/content/categories/${slug}/articles?${searchParams.toString()}`);
}

// Tags
export async function getTags(includeCount: boolean = false): Promise<Tag[]> {
  return fetchApi<Tag[]>(`/content/tags?includeCount=${includeCount}`);
}

export async function getTagBySlug(slug: string): Promise<Tag> {
  return fetchApi<Tag>(`/content/tags/${slug}`);
}

export async function getTagArticles(
  slug: string,
  params: Omit<ArticleQueryParams, 'tag'> = {}
): Promise<PaginatedArticles> {
  const searchParams = new URLSearchParams();
  searchParams.set('status', 'PUBLISHED');

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  });

  return fetchApi<PaginatedArticles>(`/content/tags/${slug}/articles?${searchParams.toString()}`);
}

// Authors
export async function getAuthors(includeCount: boolean = false): Promise<Author[]> {
  const searchParams = new URLSearchParams();
  searchParams.set('activeOnly', 'true');
  if (includeCount) {
    searchParams.set('includeCount', 'true');
  }
  return fetchApi<Author[]>(`/content/authors?${searchParams.toString()}`);
}

export async function getAuthorBySlug(slug: string): Promise<Author> {
  return fetchApi<Author>(`/content/authors/${slug}`);
}

export async function getAuthorArticles(
  slug: string,
  params: Omit<ArticleQueryParams, 'author'> = {}
): Promise<PaginatedArticles> {
  const searchParams = new URLSearchParams();
  searchParams.set('status', 'PUBLISHED');

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  });

  return fetchApi<PaginatedArticles>(`/content/authors/${slug}/articles?${searchParams.toString()}`);
}

// Adjacent articles (previous/next)
export interface AdjacentArticle {
  slug: string;
  title: string;
  featuredImageUrl?: string | null;
  category?: {
    name: string;
    slug: string;
  } | null;
}

export interface AdjacentArticles {
  previous: AdjacentArticle | null;
  next: AdjacentArticle | null;
}

export async function getAdjacentArticles(articleId: string): Promise<AdjacentArticles> {
  try {
    return await fetchApi<AdjacentArticles>(`/content/articles/${articleId}/adjacent`);
  } catch {
    // Return empty if endpoint not available
    return { previous: null, next: null };
  }
}

// Popular/Trending Articles
export async function getPopularArticles(limit: number = 5): Promise<Article[]> {
  const result = await getArticles({ sortBy: 'viewCount', sortOrder: 'desc', limit });
  return result.data;
}

export async function getRecentArticles(limit: number = 5): Promise<Article[]> {
  const result = await getArticles({ sortBy: 'publishedAt', sortOrder: 'desc', limit });
  return result.data;
}

// Sitemap data
export async function getSitemapArticles(): Promise<{ slug: string; updatedAt: string; publishedAt: string }[]> {
  return fetchApi<{ slug: string; updatedAt: string; publishedAt: string }[]>('/content/sitemap/articles');
}

export async function getSitemapCategories(): Promise<{ slug: string; updatedAt: string }[]> {
  return fetchApi<{ slug: string; updatedAt: string }[]>('/content/sitemap/categories');
}

export async function getSitemapTags(): Promise<{ slug: string; updatedAt: string }[]> {
  return fetchApi<{ slug: string; updatedAt: string }[]>('/content/sitemap/tags');
}
