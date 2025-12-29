# Vector Search API Documentation

This document describes the Vector Search API endpoints for semantic search, similarity matching, and personalized recommendations using pgvector.

## Base URL

```
/api/vectors
```

## Authentication

All endpoints require authentication via JWT Bearer token in production.

---

## Endpoints

### Semantic Search

#### POST /vectors/search

Perform semantic similarity search to find products matching a text query.

**Request Body:**

```json
{
  "query": "birthday gift for mom",
  "matchThreshold": 0.7,
  "matchCount": 10,
  "categoryFilter": "Gifts",
  "minPrice": 20,
  "maxPrice": 100
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| query | string | Yes | - | Search query text |
| matchThreshold | number | No | 0.7 | Minimum similarity score (0-1) |
| matchCount | number | No | 10 | Maximum results to return |
| categoryFilter | string | No | null | Filter by category |
| minPrice | number | No | null | Minimum price filter |
| maxPrice | number | No | null | Maximum price filter |

**Response:**

```json
{
  "results": [
    {
      "id": "product-123",
      "title": "Personalized Mom Bracelet",
      "description": "A beautiful customizable bracelet...",
      "price": 49.99,
      "category": "Jewelry",
      "similarity": 0.92
    }
  ],
  "count": 10
}
```

**Status Codes:**
- `200 OK` - Successful search
- `400 Bad Request` - Invalid request body
- `500 Internal Server Error` - Server error

---

### Hybrid Search

#### POST /vectors/hybrid-search

Combined keyword + semantic search using Reciprocal Rank Fusion (RRF).

**Request Body:**

```json
{
  "query": "tech gadgets under 50",
  "keywordWeight": 0.3,
  "semanticWeight": 0.7,
  "matchCount": 20
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| query | string | Yes | - | Search query text |
| keywordWeight | number | No | 0.3 | Weight for keyword matching |
| semanticWeight | number | No | 0.7 | Weight for semantic similarity |
| matchCount | number | No | 20 | Maximum results to return |

**Response:**

```json
{
  "results": [
    {
      "id": "product-456",
      "title": "Wireless Earbuds",
      "keywordScore": 0.8,
      "semanticScore": 0.85,
      "combinedScore": 0.84
    }
  ],
  "count": 20
}
```

---

### Similar Products

#### GET /vectors/products/:id/similar

Find products similar to a given product using vector similarity.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Product ID |

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| matchThreshold | number | 0.7 | Minimum similarity score |
| matchCount | number | 10 | Maximum results |
| categoryFilter | string | null | Same-category filter |
| minPrice | number | null | Minimum price |
| maxPrice | number | null | Maximum price |

**Example Request:**

```
GET /vectors/products/product-123/similar?matchCount=5&categoryFilter=Electronics
```

**Response:**

```json
{
  "results": [
    {
      "id": "product-789",
      "title": "Similar Product",
      "similarity": 0.88
    }
  ],
  "count": 5
}
```

---

### Personalized Recommendations

#### GET /vectors/recommendations/:userId

Get personalized product recommendations based on user preference vectors.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| userId | string | User ID |

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| count | number | 20 | Number of recommendations |

**Example Request:**

```
GET /vectors/recommendations/user-123?count=10
```

**Response:**

```json
{
  "results": [
    {
      "id": "product-111",
      "title": "Recommended Product",
      "similarity": 0.75
    }
  ],
  "count": 10
}
```

---

### Embedding Status

#### GET /vectors/status

Get the current status of embedding generation across all products.

**Response:**

```json
{
  "totalProducts": 10000,
  "productsWithEmbeddings": 8500,
  "coverage": 0.85,
  "lastUpdated": "2025-01-15T10:30:00Z"
}
```

---

### Check Product Embedding

#### GET /vectors/products/:id/has-embedding

Check if a specific product has an embedding generated.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Product ID |

**Response:**

```json
{
  "productId": "product-123",
  "hasEmbedding": true
}
```

---

### Generate Embedding (Testing)

#### POST /vectors/embed

Generate an embedding for arbitrary text. Primarily for testing and debugging.

**Request Body:**

```json
{
  "text": "Sample text for embedding",
  "model": "text-embedding-3-small"
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| text | string | Yes | - | Text to embed |
| model | string | No | text-embedding-3-small | OpenAI model |

**Response:**

```json
{
  "dimensions": 1536,
  "cost": {
    "tokensUsed": 6,
    "estimatedCost": 0.00001,
    "model": "text-embedding-3-small",
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

---

### Backfill Embeddings

#### POST /vectors/backfill

Backfill embeddings for products that don't have them. Admin-only endpoint.

**Request Body:**

```json
{
  "limit": 100,
  "batchSize": 50
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| limit | number | 100 | Maximum products to process |
| batchSize | number | 50 | Batch size for API calls |

**Response:**

```json
{
  "processed": 100,
  "cost": {
    "tokensUsed": 5000,
    "estimatedCost": 0.0001,
    "model": "text-embedding-3-small",
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

---

### Get Products Missing Embeddings

#### GET /vectors/products/missing

List products that need embeddings generated.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | number | 100 | Maximum results |

**Response:**

```json
{
  "products": [
    { "id": "product-1", "title": "Product 1" },
    { "id": "product-2", "title": "Product 2" }
  ],
  "count": 2
}
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| 400 | Invalid request parameters |
| 401 | Authentication required |
| 403 | Insufficient permissions |
| 404 | Resource not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| /vectors/search | 100 requests/minute |
| /vectors/embed | 50 requests/minute |
| /vectors/backfill | 10 requests/minute |

---

## Performance Considerations

- **Similarity Search**: p95 latency < 500ms for standard queries
- **Hybrid Search**: p95 latency < 800ms due to combined ranking
- **Recommendations**: Results are cached for 5 minutes
- **Backfill**: Runs in batches to avoid rate limiting

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://api.mykadoo.com/api',
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Semantic search
const searchResults = await apiClient.post('/vectors/search', {
  query: 'gift for mom',
  matchCount: 10,
});

// Similar products
const similar = await apiClient.get('/vectors/products/product-123/similar', {
  params: { matchCount: 5 },
});

// Recommendations
const recommendations = await apiClient.get('/vectors/recommendations/user-456', {
  params: { count: 20 },
});
```

### cURL

```bash
# Semantic search
curl -X POST https://api.mykadoo.com/api/vectors/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"query": "gift for mom", "matchCount": 10}'

# Similar products
curl "https://api.mykadoo.com/api/vectors/products/product-123/similar?matchCount=5" \
  -H "Authorization: Bearer <token>"
```
