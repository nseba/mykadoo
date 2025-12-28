# PRD: Content System & SEO Foundation

## Introduction

To drive organic traffic and establish Mykadoo as an authority in gift giving, we need a content management system with SEO optimization. This PRD covers the basic content infrastructure for gift guides, articles, and SEO best practices to improve search engine rankings and user engagement.

## Problem Statement

Mykadoo needs to:
- Attract organic traffic through search engines
- Establish thought leadership in the gift-giving space
- Provide valuable content beyond AI recommendations
- Improve search engine rankings for gift-related keywords
- Create shareable content for social media

## Goals

1. Create a basic CMS for publishing gift guides and articles
2. Implement comprehensive SEO optimization (meta tags, structured data, sitemaps)
3. Achieve Google indexing within 2 weeks of launch
4. Rank in top 20 for at least 10 long-tail gift keywords within 3 months
5. Generate 30% of traffic from organic search within 6 months
6. Publish 20+ high-quality content pieces in first 3 months
7. Achieve average page load time <3 seconds
8. Score 90+ on Google Lighthouse SEO audit

## User Stories

### As a user finding Mykadoo via search:
- I want to find relevant gift guides so that I get ideas for specific occasions
- I want to read helpful articles so that I improve my gift-giving skills
- I want content to load quickly so that I don't abandon the page
- I want to easily navigate between related articles so that I discover more content

### As a content creator/admin:
- I want to create and publish articles easily so that content production is efficient
- I want to preview content before publishing so that I ensure quality
- I want to add images and formatting so that articles are visually appealing
- I want to see article performance metrics so that I optimize content strategy

### As a search engine:
- I want clear page structure so that I can index content accurately
- I want metadata and structured data so that I can display rich results
- I want fast page loads so that I can rank pages higher
- I want mobile-friendly pages so that I can serve mobile searchers

## Functional Requirements

### 1. Content Management System

**1.1** Admin interface must allow:
- Creating new articles/gift guides
- Editing existing content
- Saving drafts
- Scheduling publication
- Setting publish/unpublish dates
- Organizing content with categories and tags
- Uploading and managing images
- Rich text editing (WYSIWYG)

**1.2** Article data model must include:
- Title
- Slug (URL-friendly)
- Content (rich text/markdown)
- Excerpt/summary
- Featured image
- Author
- Publication date
- Last modified date
- Status (draft, published, archived)
- Categories
- Tags
- SEO metadata (title, description, keywords)

**1.3** Content editor must support:
- Headings (H2, H3, H4)
- Paragraphs with formatting (bold, italic, links)
- Bullet and numbered lists
- Images with captions
- Blockquotes
- Embedded products (from affiliate catalog)
- Code blocks (for examples)
- Tables

**1.4** Image management must:
- Support upload from device
- Allow drag-and-drop
- Auto-optimize for web (compression, WebP conversion)
- Generate responsive sizes
- Provide alt text field
- Create thumbnails

### 2. Content Types

**2.1** System must support:
- Gift Guides (curated product lists)
- How-To Articles (instructional content)
- Seasonal Guides (holiday, occasions)
- Trend Articles (current gift trends)
- Buyer's Guides (category deep-dives)

**2.2** Gift Guide template must include:
- Introduction
- Gift recommendations (with affiliate links)
- Price ranges
- Categories
- "Buy Now" buttons
- Related guides

**2.3** Article template must include:
- Hero image
- Table of contents (for long articles)
- Body content
- Related articles
- Call-to-action (start search, create profile)

### 3. SEO Optimization

**3.1** Every page must have:
- Unique, descriptive title tag (50-60 characters)
- Meta description (150-160 characters)
- Canonical URL
- Open Graph tags (title, description, image)
- Twitter Card tags
- Structured data (Article schema)

**3.2** Title tag format:
```
[Article Title] | Mykadoo Gift Ideas
"Best Tech Gifts for Men in 2024 | Mykadoo Gift Ideas"
```

**3.3** Meta description must:
- Include primary keyword
- Be compelling and action-oriented
- Accurately describe content
- Include call-to-action when appropriate

**3.4** URL structure must be:
- SEO-friendly (lowercase, hyphens)
- Include primary keyword
- Be concise (3-5 words)
- Avoid special characters
- Examples:
  - `/blog/tech-gifts-for-men`
  - `/guides/mothers-day-gifts-2024`
  - `/articles/how-to-choose-perfect-gift`

### 4. Structured Data (Schema.org)

**4.1** Article pages must include Article schema:
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Article title",
  "description": "Article description",
  "image": "Featured image URL",
  "datePublished": "2024-01-01",
  "dateModified": "2024-01-15",
  "author": {
    "@type": "Person",
    "name": "Author name"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Mykadoo",
    "logo": {
      "@type": "ImageObject",
      "url": "Logo URL"
    }
  }
}
```

**4.2** Gift Guide pages must include ItemList schema:
```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@type": "Product",
        "name": "Product name",
        "image": "Product image",
        "description": "Description",
        "offers": {
          "@type": "Offer",
          "price": "99.99",
          "priceCurrency": "USD"
        }
      }
    }
  ]
}
```

**4.3** Breadcrumb schema must be present on all pages:
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://mykadoo.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Blog",
      "item": "https://mykadoo.com/blog"
    }
  ]
}
```

### 5. Sitemap & Robots.txt

**5.1** XML sitemap must:
- Auto-generate from published content
- Update when content published/unpublished
- Include all public pages
- Set appropriate priorities and change frequencies
- Submit to Google Search Console automatically

**5.2** Sitemap structure:
```xml
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://mykadoo.com</loc>
    <lastmod>2024-01-01</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://mykadoo.com/blog/article-slug</loc>
    <lastmod>2024-01-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

**5.3** Robots.txt must:
- Allow crawling of public pages
- Disallow admin areas (/admin, /api)
- Point to sitemap location
- Include crawl delay if needed

### 6. Performance Optimization

**6.1** Pages must implement:
- Lazy loading for images below fold
- Image optimization (WebP, compression)
- Font optimization (preload, font-display: swap)
- Code splitting for JavaScript
- CSS optimization (critical CSS inline)
- CDN for static assets
- Browser caching headers

**6.2** Core Web Vitals targets:
- **LCP (Largest Contentful Paint):** <2.5s
- **FID (First Input Delay):** <100ms
- **CLS (Cumulative Layout Shift):** <0.1

**6.3** Image optimization:
- Convert to WebP format
- Compress to 80-85% quality
- Generate responsive sizes (320px, 640px, 1024px, 1920px)
- Set appropriate width and height attributes
- Use `loading="lazy"` for below-fold images
- Use `priority` for hero images

### 7. Internal Linking

**7.1** Every article must include:
- Links to related articles
- Links to relevant gift search pages
- Breadcrumb navigation
- Category archive links

**7.2** Link structure must:
- Use descriptive anchor text
- Avoid generic "click here" text
- Open external links in new tab
- Mark external links with icon or indicator

**7.3** Related articles must be:
- Algorithmically determined (by tags, category)
- Manually curated (by editor)
- Limited to 3-6 suggestions
- Displayed at end of article

### 8. Mobile Optimization

**8.1** All pages must be:
- Fully responsive (mobile, tablet, desktop)
- Touch-friendly (min 48x48px tap targets)
- Fast loading on mobile networks
- Readable without zooming
- Compatible with mobile browsers

**8.2** Mobile-specific optimizations:
- Hamburger menu for navigation
- Sticky header for easy navigation
- Fast-tap phone numbers and addresses
- Optimized images for small screens
- Reduced animations for performance

### 9. Analytics Integration

**9.1** System must track:
- Page views per article
- Time on page
- Bounce rate
- Scroll depth
- Click-through rate on CTAs
- Share counts (social media)

**9.2** Analytics must integrate with:
- Google Analytics 4
- Google Search Console
- Internal analytics dashboard

**9.3** Content performance dashboard must show:
- Top performing articles
- Traffic sources
- Keyword rankings
- Conversion rates (to gift searches)

## Non-Goals (Out of Scope)

- User-generated content (comments, reviews) - Phase 2
- AI-powered content creation - PRD 0006
- Multi-language content - Phase 3
- Video content - Phase 4
- Podcast integration - Phase 4
- Advanced analytics (heat maps, session recording) - Phase 4

## Technical Considerations

### Architecture

**Frontend:**
- Next.js 14 App Router for all content pages
- Server Components for static content
- Static Site Generation (SSG) for articles
- Incremental Static Regeneration (ISR) for updates

**Admin CMS:**
- Headless CMS (Strapi, Payload CMS) or
- Custom NestJS admin with rich text editor or
- Next.js admin with TipTap or Lexical editor

**Database:**
- PostgreSQL for content storage
- Full-text search on articles
- Indexes on slug, tags, categories

**CDN:**
- CloudFlare or similar for global distribution
- Cache static assets (images, CSS, JS)
- Cache-Control headers for content

### Data Model

```typescript
interface Article {
  id: string;
  title: string;
  slug: string;
  content: string; // HTML or Markdown
  excerpt: string;
  featuredImageUrl: string;
  authorId: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: Date;
  scheduledAt?: Date;
  categoryIds: string[];
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string; // For hierarchical categories
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface Author {
  id: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
  };
}
```

### API Endpoints

```
// Public
GET    /api/content/articles
GET    /api/content/articles/:slug
GET    /api/content/categories
GET    /api/content/categories/:slug/articles
GET    /api/content/tags/:tag/articles

// Admin
POST   /api/admin/articles
PUT    /api/admin/articles/:id
DELETE /api/admin/articles/:id
POST   /api/admin/articles/:id/publish
POST   /api/admin/articles/:id/unpublish
POST   /api/admin/media/upload
GET    /api/admin/analytics/articles
```

### SEO Tools & Validation

**Testing:**
- Google Rich Results Test
- PageSpeed Insights
- Lighthouse CI
- Mobile-Friendly Test
- Screaming Frog SEO Spider

**Monitoring:**
- Google Search Console
- Google Analytics 4
- Ahrefs or SEMrush (optional)
- Core Web Vitals monitoring

## Design Considerations

### Content Page Layout

**Header:**
- Logo (links to home)
- Navigation (Gift Search, Browse, Blog)
- Search bar
- User account link

**Article Header:**
- Category badge
- Article title (H1)
- Author byline
- Publication date
- Reading time estimate
- Social share buttons

**Article Body:**
- Table of contents (long articles)
- Rich text content
- Embedded products
- Images with captions
- Related internal links

**Article Footer:**
- Author bio box
- Tags
- Related articles
- Call-to-action (start gift search)
- Social share buttons

**Sidebar (Desktop):**
- Popular articles
- Recent articles
- Newsletter signup
- Category navigation

### Category & Archive Pages

- Grid of article cards (2-3 columns)
- Featured article at top
- Pagination or infinite scroll
- Filtering by tags
- Sorting (recent, popular, alphabetical)

### Article Card

- Featured image
- Category badge
- Title
- Excerpt (2-3 sentences)
- Author name and avatar
- Publication date
- Reading time
- "Read More" link

## Success Metrics

### SEO Performance
- **Target:** Indexed by Google within 2 weeks
- **Target:** Rank top 20 for 10+ long-tail keywords in 3 months
- **Target:** 30% traffic from organic search in 6 months
- **Target:** 90+ Google Lighthouse SEO score

### Content Production
- **Target:** 20 articles published in first 3 months
- **Target:** 2-3 articles published per week thereafter
- **Target:** Average 1,000+ words per article

### User Engagement
- **Target:** 2+ minutes average time on page
- **Target:** <60% bounce rate
- **Target:** 20% click-through to gift search
- **Target:** 10% social share rate

### Technical Performance
- **Target:** <3s page load time (p95)
- **Target:** LCP <2.5s
- **Target:** CLS <0.1
- **Target:** 99% uptime

## Open Questions

1. **CMS Choice**: Should we use a headless CMS (Strapi, Contentful) or build custom?

2. **Content Strategy**: What topics should we prioritize for SEO (occasion-based, category-based, how-to)?

3. **Monetization**: Should articles include ads in addition to affiliate links?

4. **Social Features**: Should we add social sharing counts to encourage sharing?

5. **Email Integration**: Should we capture emails for newsletter from content pages?

6. **Multi-Author**: Will we have multiple content creators or single author initially?

## Implementation Phases

### Phase 1: Basic CMS (Weeks 1-2)
- Content data model and database
- Admin interface for creating articles
- Rich text editor integration
- Image upload and optimization

### Phase 2: Public Pages (Weeks 3-4)
- Article display pages
- Category and tag pages
- SEO meta tags implementation
- Responsive design

### Phase 3: SEO Optimization (Week 5)
- Structured data (schema.org)
- Sitemap generation
- Robots.txt configuration
- Internal linking

### Phase 4: Performance & Analytics (Week 6)
- Image optimization
- Code splitting
- CDN setup
- Analytics integration
- Search Console setup

## Dependencies

- Domain and hosting infrastructure
- CDN service
- Image optimization service
- Rich text editor library
- Analytics accounts (Google Analytics, Search Console)

## Risks & Mitigation

### Risk 1: Low Organic Traffic Initially
**Mitigation:**
- Focus on long-tail keywords
- Create high-quality, comprehensive content
- Build backlinks through outreach
- Promote content on social media

### Risk 2: Content Production Bottleneck
**Mitigation:**
- Plan content calendar in advance
- Use templates for common article types
- Consider freelance writers
- Repurpose AI-generated insights

### Risk 3: Poor Search Rankings
**Mitigation:**
- Extensive keyword research
- Follow SEO best practices
- Regular content updates
- Build authoritative backlinks
- Monitor and iterate based on data

### Risk 4: Slow Page Load Times
**Mitigation:**
- Aggressive image optimization
- CDN for global delivery
- Code splitting and lazy loading
- Performance monitoring and optimization

## Acceptance Criteria

- [ ] Admin can create, edit, and publish articles
- [ ] Admin can upload and manage images
- [ ] Rich text editor supports all required formatting
- [ ] Articles can be saved as drafts
- [ ] Articles can be scheduled for future publication
- [ ] Published articles display correctly on public site
- [ ] All pages have unique title and meta description
- [ ] Structured data (Article schema) is present
- [ ] Open Graph and Twitter Cards configured
- [ ] Sitemap generates automatically
- [ ] Sitemap updates when content published
- [ ] Robots.txt is properly configured
- [ ] All images are optimized (WebP, compressed)
- [ ] Pages load in <3 seconds
- [ ] LCP <2.5s on all content pages
- [ ] CLS <0.1 on all pages
- [ ] Mobile-responsive design works on all devices
- [ ] Google Lighthouse SEO score 90+
- [ ] Internal linking shows related articles
- [ ] Breadcrumb navigation is present
- [ ] Analytics tracking is functional
- [ ] Google Search Console is configured
- [ ] Site is indexed by Google within 2 weeks

---

**Document Version:** 1.2
**Last Updated:** 2025-12-28
**Status:** Complete ✅
**Author:** AI Product Team
**Reviewers:** Engineering, Product, Marketing, SEO Specialist
