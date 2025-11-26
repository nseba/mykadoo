# PRD: E-commerce Integration & Affiliate Platform

## Introduction

Mykadoo's business model relies on affiliate commissions from gift purchases. This PRD defines the integration with major affiliate platforms and e-commerce APIs to provide users with purchasable gift recommendations while generating revenue through affiliate links.

## Problem Statement

The gift recommendation system needs:
- Access to a comprehensive product catalog across multiple retailers
- Real-time pricing and availability information
- Properly tracked affiliate links to earn commissions
- Reliable product data including images, descriptions, and reviews

## Goals

1. Integrate with 3-5 major affiliate platforms (Amazon Associates, ShareASale, CJ Affiliate)
2. Aggregate product data from multiple sources into unified format
3. Generate and track affiliate links for all gift recommendations
4. Achieve 5%+ click-through rate on affiliate links
5. Ensure 95%+ accuracy on product pricing and availability
6. Support at least 10,000 products in initial catalog
7. Update product data daily for pricing and availability
8. Track affiliate conversions and commission earnings

## User Stories

### As a user:
- I want to see current, accurate prices so that I make informed decisions
- I want to click through to purchase easily so that buying is convenient
- I want to see product ratings and reviews so that I trust the quality
- I want to know which retailer sells the product so that I can choose preferred stores
- I want to see if a product is in stock so that I don't waste time on unavailable items

### As a business stakeholder:
- I want to track which products generate most clicks so that I can optimize recommendations
- I want to measure conversion rates so that I can calculate ROI
- I want to earn commissions on purchases so that the platform is profitable
- I want to diversify across multiple affiliates so that revenue isn't dependent on one platform

## Functional Requirements

### 1. Affiliate Platform Integration

**1.1** System must integrate with the following affiliate platforms:
- Amazon Associates (Priority 1)
- ShareASale (Priority 2)
- CJ Affiliate (Commission Junction) (Priority 2)
- Rakuten Advertising (Priority 3)
- Impact Radius (Priority 3)

**1.2** For each platform, system must:
- Authenticate using API credentials
- Fetch product data via API or data feeds
- Generate compliant affiliate links
- Track clicks and conversions
- Retrieve commission reports

**1.3** Amazon Associates integration must:
- Use Product Advertising API (PA-API 5.0)
- Search products by keywords and categories
- Fetch product details (ASIN, title, price, images, ratings)
- Generate affiliate links with tracking ID
- Comply with Amazon API usage policies
- Handle API rate limits (1 request/second for free tier)

**1.4** ShareASale integration must:
- Use Merchant API for product search
- Access data feeds from partner merchants
- Generate affiliate links with affiliate ID
- Track conversions via postback URL
- Support multiple merchant categories

**1.5** CJ Affiliate integration must:
- Use Product Catalog Search API
- Search across advertiser catalogs
- Generate tracking links
- Retrieve performance reports
- Support commission tracking

### 2. Product Data Management

**2.1** System must maintain a product catalog with:
- Product ID (unique across all platforms)
- Platform source (Amazon, ShareASale, etc.)
- External product ID (ASIN, SKU, etc.)
- Product name
- Description (short and long)
- Price (original and sale price)
- Currency
- Category/tags
- Images (primary and gallery)
- Average rating
- Number of reviews
- Availability status
- Last updated timestamp

**2.2** Product data must be:
- Updated daily for prices and availability
- Cached for performance
- Validated for completeness before recommendation
- Deduplicated across platforms (same product from multiple sources)

**2.3** System must handle:
- Out of stock products (hide or mark unavailable)
- Price changes (update in near real-time)
- Product removals (archive from active catalog)
- Category mapping (standardize across platforms)

### 3. Affiliate Link Generation

**3.1** When generating gift recommendations, system must:
- Create unique affiliate link for each product
- Include proper tracking parameters
- Encode all required platform-specific parameters
- Add internal tracking ID for analytics

**3.2** Affiliate links must:
- Include campaign ID (for tracking source)
- Include user ID hash (for conversion attribution)
- Be shortened for better UX (optional)
- Redirect through platform-compliant mechanism
- Track click events before redirect

**3.3** Link format examples:
```
Amazon:
https://www.amazon.com/dp/{ASIN}?tag={affiliate-id}&linkCode=osi&th=1&psc=1

ShareASale:
https://shareasale.com/r.cfm?b={banner-id}&u={affiliate-id}&m={merchant-id}&urllink={product-url}

CJ:
https://www.anrdoezrs.net/click-{pub-id}-{ad-id}?url={product-url}
```

**3.4** System must comply with:
- Platform terms of service
- Link disclosure requirements
- Tracking parameter requirements
- Cookie duration policies

### 4. Product Search & Matching

**4.1** System must be able to search products by:
- Keywords (from user interests)
- Category
- Price range
- Rating threshold
- Platform/retailer

**4.2** Search must return:
- Relevant products matching criteria
- Diverse product types
- Products from multiple retailers
- At least 20 results per search

**4.3** Product matching algorithm must:
- Use embeddings to find semantically similar products
- Filter by budget constraints
- Prioritize highly-rated products
- Balance between popular and niche items
- Avoid duplicates in results

**4.4** System must handle:
- Partial matches when exact search fails
- Category fallbacks (search broader category)
- Multi-language product names (future)

### 5. Click Tracking & Analytics

**5.1** System must track:
- Affiliate link clicks
- Click-through rate per product
- Click-through rate per recommendation batch
- Time from view to click
- User who clicked (if authenticated)

**5.2** Click tracking must:
- Fire before redirect to affiliate site
- Store click event in database
- Increment click counter for product
- Associate with gift search session
- Include timestamp and user agent

**5.3** Analytics dashboard must show:
- Total clicks per day/week/month
- Top clicked products
- Top performing categories
- Click-through rate by platform
- Conversion rate (when data available)

### 6. Conversion Tracking

**6.1** System must:
- Listen for conversion postbacks from platforms
- Match conversions to original clicks
- Calculate commission earned
- Store conversion data

**6.2** Conversion data must include:
- Order ID from affiliate platform
- Product(s) purchased
- Sale amount
- Commission amount
- Conversion date
- Original click ID

**6.3** Reporting must show:
- Total conversions
- Conversion rate (clicks to purchases)
- Revenue generated
- Commission earned
- Top converting products

### 7. Product Display Compliance

**7.1** Product display must:
- Include affiliate disclosure ("As an Amazon Associate, we earn from qualifying purchases")
- Show accurate pricing at time of display
- Indicate if price may change
- Link directly to product page
- Not mislead about affiliate relationship

**7.2** Product cards must show:
- Product image
- Product name
- Current price
- Rating (if available)
- Retailer name
- "Buy Now" or "View on [Retailer]" button

**7.3** Price display must:
- Show currency symbol
- Format correctly for locale
- Show sale price prominently if discounted
- Indicate original price when on sale

### 8. Error Handling & Fallbacks

**8.1** When API calls fail, system must:
- Use cached data if available
- Show error message to user
- Log error for monitoring
- Retry with exponential backoff
- Fall back to alternative platforms

**8.2** When products are unavailable, system must:
- Remove from recommendations
- Suggest alternative products
- Update catalog status
- Notify user if saved to wishlist

**8.3** System must handle:
- Rate limit errors (queue and retry)
- Authentication failures (refresh credentials)
- Network timeouts (retry with timeout)
- Invalid product data (skip and log)

## Non-Goals (Out of Scope)

- Direct purchasing through Mykadoo (users purchase on retailer site)
- Inventory management
- Order fulfillment
- Customer service for purchases
- Price comparison engine (focus is curation, not price matching)
- Product reviews (link to retailer reviews only)
- Shopping cart functionality
- Payment processing

## Technical Considerations

### Architecture

**Backend:**
- NestJS microservice for affiliate integrations
- Separate service per affiliate platform (scalability)
- Job queue for daily product data updates
- Redis for product data caching

**Data Pipeline:**
- Scheduled jobs to fetch product feeds
- ETL process to standardize product data
- Deduplication logic for products
- Data validation and cleaning

**Database:**
- PostgreSQL for product catalog
- Separate table per platform (with unified view)
- Indexes on search fields (category, price, rating)
- Archival of historical product data

### Data Model

```typescript
interface Product {
  id: string;
  platform: 'amazon' | 'shareasale' | 'cj' | 'rakuten';
  externalId: string; // ASIN, SKU, etc.
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  salePrice?: number;
  currency: string;
  category: string;
  tags: string[];
  imageUrl: string;
  galleryImages?: string[];
  rating?: number;
  reviewCount?: number;
  availability: 'in_stock' | 'out_of_stock' | 'unknown';
  retailerName: string;
  retailerUrl: string;
  lastUpdated: Date;
  createdAt: Date;
}

interface AffiliateLink {
  id: string;
  productId: string;
  userId?: string;
  searchId?: string;
  url: string;
  trackingId: string;
  platform: string;
  createdAt: Date;
}

interface AffiliateClick {
  id: string;
  linkId: string;
  userId?: string;
  ipAddress: string;
  userAgent: string;
  referer?: string;
  clickedAt: Date;
}

interface AffiliateConversion {
  id: string;
  clickId: string;
  orderId: string; // From platform
  productId: string;
  saleAmount: number;
  commission: number;
  currency: string;
  convertedAt: Date;
}
```

### API Endpoints

```
GET    /api/products/search
GET    /api/products/:id
GET    /api/products/category/:category
GET    /api/products/recommendations

POST   /api/affiliate/link/generate
POST   /api/affiliate/click/track
POST   /api/affiliate/conversion/webhook

GET    /api/admin/analytics/clicks
GET    /api/admin/analytics/conversions
GET    /api/admin/products/sync
```

### Integration Points

- Amazon Product Advertising API (PA-API 5.0)
- ShareASale Merchant API
- CJ Web Services API
- Analytics service for click tracking
- AI recommendation service (product data consumer)

### Caching Strategy

**Product Data:**
- Cache frequently viewed products (1 hour TTL)
- Cache search results (30 minutes TTL)
- Update prices daily via background job
- Invalidate cache on manual product update

**Affiliate Links:**
- Cache generated links (7 days TTL)
- Reuse links for same product + user
- Track unique links for analytics

### Security & Compliance

**API Credentials:**
- Store in environment variables
- Rotate credentials quarterly
- Use separate credentials per environment
- Monitor for unauthorized usage

**Affiliate Compliance:**
- Display required disclosures
- Follow platform TOS
- Avoid prohibited practices (cookie stuffing, etc.)
- Maintain proper tracking attribution

**Data Privacy:**
- Don't share user data with affiliate platforms
- Anonymize tracking data
- Allow users to opt-out of tracking
- Comply with GDPR for EU users

## Design Considerations

### Product Display

**Product Card:**
- Clear product image (primary photo)
- Product name (truncate if too long)
- Price prominently displayed
- Rating stars if available
- Retailer logo/name
- "View on Amazon" button (or other retailer)

**Product Detail View:**
- Larger product image with gallery
- Full description
- Detailed pricing info
- Rating and review count
- Retailer information
- Similar products section
- Affiliate disclosure

**Affiliate Disclosure:**
- Visible but not intrusive
- Standard language per platform requirements
- Tooltip with more information
- Link to full disclosure policy

### Mobile Optimization

- Thumb-friendly tap targets for affiliate links
- Optimized product images for mobile data
- Fast loading of product cards
- Deep linking to retailer apps when available

## Success Metrics

### Platform Coverage
- **Target:** 10,000+ products in catalog
- **Target:** 50+ categories covered
- **Target:** 3+ affiliate platforms integrated

### User Engagement
- **Target:** 5% click-through rate on affiliate links
- **Target:** 30% of users click at least one affiliate link
- **Target:** 2+ products viewed per session

### Revenue
- **Target:** 2% conversion rate (clicks to purchases)
- **Target:** $20 average order value
- **Target:** 5% average commission rate
- **Target:** $10,000/month in affiliate revenue by month 3

### Data Quality
- **Target:** 95% products have accurate prices
- **Target:** 90% products have images
- **Target:** 80% products have ratings
- **Target:** <1% broken affiliate links

### Performance
- **Target:** <500ms for product search
- **Target:** <200ms for affiliate link generation
- **Target:** 99% uptime for affiliate service
- **Target:** <1% failed API calls to platforms

## Open Questions

1. **Multi-Currency**: How do we handle products priced in different currencies for international users?

2. **Product Deduplication**: Should we show the same product from multiple retailers or pick the best one?

3. **Commission Disclosure**: How transparent should we be about commission rates?

4. **Link Shortening**: Should we use custom short URLs or full affiliate links?

5. **Product Freshness**: How often should we refresh product data (daily, hourly, on-demand)?

6. **Inventory Sync**: Should we check real-time inventory before showing products?

7. **Price Alerts**: Should we notify users when saved products go on sale?

## Implementation Phases

### Phase 1: Amazon Integration (Weeks 1-2)
- Amazon PA-API integration
- Product search and data fetch
- Affiliate link generation
- Basic click tracking

### Phase 2: Product Catalog (Weeks 3-4)
- Product data model and database
- ETL pipeline for product feeds
- Product search service
- Data caching layer

### Phase 3: Additional Platforms (Weeks 5-6)
- ShareASale integration
- CJ Affiliate integration
- Multi-platform search
- Platform comparison logic

### Phase 4: Analytics & Optimization (Weeks 7-8)
- Click tracking dashboard
- Conversion tracking
- Performance optimization
- A/B testing for link display

## Dependencies

- Core Gift Search AI (PRD 0001) - consumer of product data
- User Authentication (PRD 0002) - for click attribution
- Amazon Associates account approval
- ShareASale publisher account
- CJ Affiliate publisher account

## Risks & Mitigation

### Risk 1: Affiliate Account Rejection
**Mitigation:**
- Apply early with complete application
- Use established entity if available
- Have backup platforms ready
- Start with Amazon (easiest to get approved)

### Risk 2: API Rate Limits
**Mitigation:**
- Implement aggressive caching
- Use data feeds instead of API where possible
- Queue requests during peak times
- Monitor and optimize API usage

### Risk 3: Link Compliance Violations
**Mitigation:**
- Legal review of implementation
- Clear disclosure on all pages
- Regular compliance audits
- Follow platform best practices

### Risk 4: Low Conversion Rates
**Mitigation:**
- Focus on high-quality, relevant recommendations
- Test different link placements
- Optimize product selection
- Track and analyze conversion data

## Acceptance Criteria

- [ ] Amazon PA-API integration works and returns product data
- [ ] Product search finds relevant items by keywords
- [ ] Affiliate links are generated with correct tracking parameters
- [ ] Click tracking records all affiliate link clicks
- [ ] Product catalog stores at least 1,000 products
- [ ] Product prices update daily via scheduled job
- [ ] Out-of-stock products are filtered from recommendations
- [ ] Affiliate disclosure is displayed on all relevant pages
- [ ] Product cards show image, name, price, and rating
- [ ] Links open to correct product pages on retailer sites
- [ ] Analytics dashboard shows click data
- [ ] Conversion webhook receives and processes postbacks
- [ ] System handles API errors gracefully
- [ ] Rate limiting prevents exceeding platform limits
- [ ] All affiliate links comply with platform TOS
- [ ] Product data is cached for performance
- [ ] Search results load in <500ms
- [ ] No broken affiliate links (<1% error rate)

---

**Document Version:** 1.0
**Last Updated:** 2025-11-26
**Status:** Draft
**Author:** AI Product Team
**Reviewers:** Engineering, Product, Legal, Business Development
