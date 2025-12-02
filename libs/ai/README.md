# @mykadoo/ai

AI-powered gift recommendation library using OpenAI GPT models and Pinecone vector database.

## Features

- **AI Recommendation Service**: Generate personalized gift recommendations using GPT-4/GPT-3.5-Turbo
- **Vector Search**: Semantic product search using Pinecone and OpenAI embeddings
- **Model Fallback**: Automatic fallback from primary to secondary model on failure
- **Cost Tracking**: Track API costs per request with configurable alerting
- **Rate Limiting**: Client-side rate limiting to prevent quota exhaustion
- **Retry Logic**: Exponential backoff for failed API calls
- **Budget Filtering**: Strict price range enforcement
- **Category Diversity**: Ensure diverse recommendations across categories
- **Relevance Scoring**: Multi-factor scoring based on interests, price, and quality

## Installation

This library is part of the Mykadoo monorepo. Install dependencies:

```bash
yarn install
```

## Environment Variables

Create a `.env` file in your app root with the following variables:

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-...
OPENAI_ORG_ID=org-...           # Optional
OPENAI_BASE_URL=https://...     # Optional, for custom endpoints

# Pinecone Configuration
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=us-east-1-aws
PINECONE_INDEX_NAME=mykadoo-gifts
PINECONE_DIMENSION=3072         # 3072 for text-embedding-3-large
```

## Usage

### AI Recommendation Service

Generate gift recommendations based on user criteria:

```typescript
import { AIRecommendationService, GiftSearchRequest } from '@mykadoo/ai';

const aiService = new AIRecommendationService();

const request: GiftSearchRequest = {
  occasion: 'Birthday',
  relationship: 'Friend',
  ageRange: 'Young Adult (18-30)',
  gender: 'Female',
  budgetMin: 30,
  budgetMax: 60,
  interests: ['Reading', 'Coffee', 'Yoga'],
  recipientName: 'Sarah',
};

const response = await aiService.generateRecommendations(request);

console.log(`Found ${response.totalResults} recommendations`);
console.log(`Model used: ${response.model}`);
console.log(`Cost: $${response.cost.toFixed(4)}`);
console.log(`Latency: ${response.latency}ms`);

response.recommendations.forEach((rec) => {
  console.log(`\n${rec.productName} - $${rec.price}`);
  console.log(`Category: ${rec.category}`);
  console.log(`Relevance: ${rec.relevanceScore}/100`);
  console.log(`Why: ${rec.matchReason}`);
});
```

### Vector Search Service

Perform semantic search for products:

```typescript
import { VectorService } from '@mykadoo/ai';

const vectorService = new VectorService();

// Initialize Pinecone index (run once)
await vectorService.initializeIndex();

// Generate embeddings for products
const products = [
  {
    productId: 'prod_123',
    productName: 'Premium Yoga Mat',
    description: 'Eco-friendly non-slip yoga mat with alignment marks',
    category: 'Sports & Fitness',
    price: 48,
    tags: ['yoga', 'fitness', 'eco-friendly'],
  },
  // ... more products
];

const embeddings = await vectorService.generateProductEmbeddings(products);

// Upsert to Pinecone
await vectorService.upsertProductEmbeddings(embeddings);

// Semantic search
const results = await vectorService.semanticSearch({
  query: 'gifts for yoga enthusiast',
  topK: 10,
  includeMetadata: true,
});

results.forEach((result) => {
  console.log(`${result.metadata.productName} - Score: ${result.score}`);
});

// Search with filters
const filteredResults = await vectorService.searchByCategoryAndPrice(
  'birthday gift for book lover',
  'Books & Media',
  20,
  50
);
```

### Generate Single Embedding

```typescript
const embedding = await vectorService.generateEmbedding(
  'Personalized book embosser for book lovers'
);

console.log(`Embedding dimensions: ${embedding.length}`); // 3072
```

### Get Index Statistics

```typescript
const stats = await vectorService.getIndexStats();

console.log(`Total vectors: ${stats.totalVectorCount}`);
console.log(`Namespaces: ${Object.keys(stats.namespaces).length}`);
```

## Configuration

### Model Configuration

Customize AI models and parameters:

```typescript
import { getAIConfig } from '@mykadoo/ai';

const config = getAIConfig();

// Override defaults
config.models.primary = 'gpt-4-turbo-preview';
config.models.fallback = 'gpt-3.5-turbo';
config.models.temperature = 0.8;
config.models.maxTokens = 3000;
```

### Rate Limiting

Configure rate limiting:

```typescript
config.rateLimiting.enabled = true;
config.rateLimiting.maxRequestsPerMinute = 100;
config.rateLimiting.maxConcurrentRequests = 20;
```

### Cost Tracking

Enable cost tracking and alerts:

```typescript
config.costTracking.enabled = true;
config.costTracking.alertThreshold = 200; // $200/day
```

### Caching

Configure result caching:

```typescript
config.cache.enabled = true;
config.cache.ttl = 7200; // 2 hours
config.cache.keyPrefix = 'ai:gift:v2:';
```

## Model Pricing

Current pricing (USD per 1K tokens):

| Model | Input | Output |
|-------|-------|--------|
| GPT-4 | $0.03 | $0.06 |
| GPT-4 Turbo | $0.01 | $0.03 |
| GPT-3.5 Turbo | $0.0005 | $0.0015 |
| text-embedding-3-large | $0.00013 | N/A |
| text-embedding-3-small | $0.00002 | N/A |

## Error Handling

The library provides custom error types:

```typescript
import { AIServiceError, RateLimitError, VectorDatabaseError } from '@mykadoo/ai';

try {
  const response = await aiService.generateRecommendations(request);
} catch (error) {
  if (error instanceof RateLimitError) {
    console.error(`Rate limit exceeded. Retry after ${error.retryAfter}s`);
  } else if (error instanceof AIServiceError) {
    console.error(`AI service error: ${error.code}`, error.details);
  } else if (error instanceof VectorDatabaseError) {
    console.error(`Vector DB error: ${error.code}`, error.details);
  }
}
```

## Retry Configuration

The library automatically retries failed API calls with exponential backoff:

- **Max Retries**: 3 attempts
- **Initial Delay**: 1 second
- **Max Delay**: 10 seconds
- **Exponential Base**: 2x

Retries on:
- HTTP 5xx server errors
- HTTP 429 rate limit errors
- Network timeout errors (ECONNRESET, ETIMEDOUT)

## Timeout Configuration

- **Recommendations**: 30 seconds
- **Embeddings**: 10 seconds
- **Vector Search**: 5 seconds

## Advanced Features

### Budget-Optimized Recommendations

```typescript
import { GiftRecommendationPrompts } from '@mykadoo/ai';

const context = { /* ... */ };
const budgetPrompt = GiftRecommendationPrompts.getBudgetOptimizedPrompt(context);
```

### Creative Recommendations

```typescript
const creativePrompt = GiftRecommendationPrompts.getCreativePrompt(context);
```

### Refinement Based on Feedback

```typescript
const refinementPrompt = GiftRecommendationPrompts.getRefinementPrompt(
  originalContext,
  ['Product A', 'Product B'],
  'I prefer more practical gifts'
);
```

## Testing

Run unit tests:

```bash
yarn nx test ai
```

Run with coverage:

```bash
yarn nx test:coverage ai
```

## Type Safety

This library is written in TypeScript with strict mode enabled. All exports are fully typed.

## License

Proprietary - Mykadoo Platform
