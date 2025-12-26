# Amazon PA-API Integration

This module integrates Amazon's Product Advertising API (PA-API 5.0) for product search, details fetching, and affiliate link generation.

## Features

- ✅ Product search by keywords and categories
- ✅ Product details fetch by ASIN
- ✅ Batch product fetching (up to 50 ASINs)
- ✅ Affiliate link generation with tracking
- ✅ Rate limiting (1 request/second for free tier)
- ✅ Automatic retry with exponential backoff
- ✅ In-memory caching (1-hour TTL)
- ✅ Comprehensive error handling

## Setup

### 1. Apply for Amazon Associates Account

1. Go to [Amazon Associates](https://affiliate-program.amazon.com/)
2. Sign up for an account
3. Complete the application process
4. Note your **Associate Tag** (e.g., `yoursite-20`)

### 2. Apply for Product Advertising API Access

1. Log in to [Amazon Associates](https://affiliate-program.amazon.com/)
2. Go to **Tools** → **Product Advertising API**
3. Apply for API access
4. Wait for approval (usually 1-2 business days)
5. Once approved, go to **Manage Your Credentials**
6. Note your:
   - **Access Key** (e.g., `AKIAIOSFODNN7EXAMPLE`)
   - **Secret Key** (e.g., `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`)

### 3. Configure Environment Variables

Add the following to your `.env` file:

```bash
# Amazon Product Advertising API
AMAZON_ACCESS_KEY=your-access-key-here
AMAZON_SECRET_KEY=your-secret-key-here
AMAZON_ASSOCIATE_TAG=yoursite-20
AMAZON_REGION=us-east-1  # or your preferred region
```

**Supported Regions:**
- `us-east-1` (United States)
- `eu-west-1` (Europe)
- `fe-east-1` (Far East - Japan)
- `us-west-1` (Canada)
- `eu-west-2` (UK)
- `ap-southeast-1` (Singapore)

### 4. Test the Integration

```bash
# Run unit tests
yarn nx test api --testPathPattern=amazon.service

# Check API health
curl http://localhost:14001/api/affiliate/amazon/cache/stats
```

## API Endpoints

### Search Products

```http
GET /api/affiliate/amazon/search
  ?keywords=laptop
  &category=Electronics
  &minPrice=100
  &maxPrice=500
  &minRating=4
  &page=1
  &itemsPerPage=10
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "page": 1,
  "itemsPerPage": 10,
  "products": [
    {
      "asin": "B08N5WRWNW",
      "title": "Dell Laptop 15.6\"",
      "price": 299.99,
      "salePrice": 249.99,
      "currency": "USD",
      "imageUrl": "https://...",
      "rating": 4.5,
      "reviewCount": 1234,
      "detailPageUrl": "https://amazon.com/dp/B08N5WRWNW",
      "brand": "Dell",
      "category": "Computers",
      "availability": "In Stock"
    }
  ]
}
```

### Get Product by ASIN

```http
GET /api/affiliate/amazon/product/B08N5WRWNW
```

**Response:**
```json
{
  "success": true,
  "product": {
    "asin": "B08N5WRWNW",
    "title": "Dell Laptop 15.6\"",
    "price": 299.99,
    ...
  }
}
```

### Get Multiple Products

```http
GET /api/affiliate/amazon/products?asins=B08N5WRWNW,B07ZPKN6YR,B09G9FPHY6
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "requested": 3,
  "products": [...]
}
```

### Generate Affiliate Link

```http
GET /api/affiliate/amazon/link/B08N5WRWNW?trackingId=user123
```

**Response:**
```json
{
  "success": true,
  "asin": "B08N5WRWNW",
  "trackingId": "user123",
  "affiliateLink": "https://www.amazon.com/dp/B08N5WRWNW?tag=yoursite-20&linkCode=osi&th=1&psc=1&trackingId=user123"
}
```

### Cache Management (Admin Only)

```http
# Get cache statistics
GET /api/affiliate/amazon/cache/stats

# Clear cache
GET /api/affiliate/amazon/cache/clear
```

## Usage Examples

### Search for Products

```typescript
import { AmazonService } from './amazon/amazon.service';

// Inject service
constructor(private readonly amazonService: AmazonService) {}

// Search by keywords
const products = await this.amazonService.searchProducts({
  keywords: 'gaming laptop',
  minPrice: 500,
  maxPrice: 1500,
  minRating: 4,
  page: 1,
  itemsPerPage: 10,
});

// Search by category
const electronics = await this.amazonService.searchProducts({
  categoryId: 'Electronics',
  minRating: 4.5,
});
```

### Get Product Details

```typescript
// Single product
const product = await this.amazonService.getProductByAsin('B08N5WRWNW');

if (product) {
  console.log(`${product.title} - $${product.price}`);
}

// Multiple products
const products = await this.amazonService.getProductsByAsins([
  'B08N5WRWNW',
  'B07ZPKN6YR',
  'B09G9FPHY6',
]);
```

### Generate Affiliate Links

```typescript
// Basic link
const link = this.amazonService.generateAffiliateLink('B08N5WRWNW');

// With tracking ID
const trackedLink = this.amazonService.generateAffiliateLink(
  'B08N5WRWNW',
  'campaign-holiday-2024'
);
```

## Rate Limiting

The Amazon PA-API has strict rate limits:

**Free Tier:**
- **1 request per second**
- 8,640 requests per day (24 hours)
- Up to 10 items per request

**Paid Tier** (based on revenue):
- Higher rate limits available
- Contact Amazon for details

This module automatically enforces the 1 request/second limit and queues requests when necessary.

## Caching Strategy

- **Cache TTL:** 1 hour (3600 seconds)
- **Cache Key Format:**
  - Search: `search:{params-hash}`
  - Product: `product:{asin}`
- **Cache Storage:** In-memory Map (production should use Redis)

**Cache Benefits:**
- Reduces API calls (saves rate limit quota)
- Faster response times
- Lower costs (if using paid tier)

## Error Handling

### Automatic Retry

Failed API calls are automatically retried up to 3 times with exponential backoff:
- Retry 1: Wait 1 second
- Retry 2: Wait 2 seconds
- Retry 3: Wait 4 seconds

### Graceful Degradation

When API calls fail:
1. Check cache for stale data
2. Log error for monitoring
3. Return cached data if available
4. Return null/empty array if no cache

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Invalid credentials` | Wrong Access/Secret Key | Check `.env` file |
| `Invalid Associate Tag` | Wrong affiliate tag | Verify Amazon Associates account |
| `Rate limit exceeded` | Too many requests | Wait and retry |
| `Product not found` | Invalid ASIN | Verify ASIN is correct |
| `Insufficient quota` | Free tier limit reached | Upgrade to paid tier or wait 24h |

## Testing

```bash
# Run unit tests
yarn nx test api --testPathPattern=amazon.service

# Run with coverage
yarn nx test api --testPathPattern=amazon.service --coverage

# Run in watch mode
yarn nx test api --testPathPattern=amazon.service --watch
```

## Production Checklist

- [ ] Amazon Associates account approved
- [ ] PA-API access granted
- [ ] Production credentials configured
- [ ] Rate limiting tested
- [ ] Error monitoring set up (Sentry)
- [ ] Cache strategy reviewed (consider Redis)
- [ ] API quota monitoring configured
- [ ] Backup affiliate platforms ready (ShareASale, CJ)

## Compliance

### Amazon Operating Agreement

You must comply with the [Amazon Associates Operating Agreement](https://affiliate-program.amazon.com/help/operating/agreement):

1. **Disclosure Required:** Display "As an Amazon Associate I earn from qualifying purchases" on pages with affiliate links
2. **Link Freshness:** Product prices and availability must be up-to-date (our cache: 1 hour)
3. **No Misleading:** Don't misrepresent products or Amazon relationship
4. **Cookie Duration:** 24-hour attribution window
5. **Prohibited Uses:** No email marketing, no incentivized clicks

## Troubleshooting

### "Invalid Access Key" Error

- Verify credentials in `.env` match Amazon Associates dashboard
- Ensure no extra whitespace in keys
- Check region is correct (`us-east-1` for US accounts)

### Rate Limit Errors

- Module enforces 1 req/sec automatically
- If still seeing errors, check for concurrent requests
- Consider implementing request queue for high traffic

### Missing Product Data

- Some products don't have all fields (rating, images, etc.)
- Module handles missing data gracefully
- Check API response in logs for details

### Cache Not Working

- Verify cache is enabled (it's always on)
- Check cache stats: `GET /api/affiliate/amazon/cache/stats`
- Clear cache if needed: `GET /api/affiliate/amazon/cache/clear`

## Next Steps

1. **Integrate with Product Catalog** (Task 2.0)
   - Store products in database
   - Sync data daily

2. **Implement Click Tracking** (Task 3.0)
   - Track affiliate link clicks
   - Measure conversion rates

3. **Add ShareASale Integration** (Task 5.0)
   - Diversify product sources
   - Increase revenue potential

## Resources

- [Amazon PA-API Documentation](https://webservices.amazon.com/paapi5/documentation/)
- [Amazon Associates Central](https://affiliate-program.amazon.com/)
- [PA-API Best Practices](https://webservices.amazon.com/paapi5/documentation/best-practices.html)
- [SDK GitHub Repository](https://github.com/amzn/paapi5-nodejs-sdk)

---

**Maintainer:** Mykadoo Development Team
**Last Updated:** 2025-12-07
**Status:** Production Ready ✅
