/**
 * k6 Load Testing Suite for Vector Operations
 *
 * Run with: k6 run apps/api/load-tests/vector-load-test.js
 *
 * Configuration via environment variables:
 * - API_BASE_URL: Base URL of the API (default: http://localhost:3000)
 * - VUS: Number of virtual users (default: 10)
 * - DURATION: Test duration (default: 1m)
 *
 * Example:
 *   k6 run -e API_BASE_URL=http://localhost:3000 -e VUS=50 -e DURATION=5m vector-load-test.js
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const similaritySearchLatency = new Trend('similarity_search_latency', true);
const semanticSearchLatency = new Trend('semantic_search_latency', true);
const hybridSearchLatency = new Trend('hybrid_search_latency', true);
const recommendationLatency = new Trend('recommendation_latency', true);
const errorRate = new Rate('error_rate');
const searchCount = new Counter('search_count');

// Test configuration
const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:3000';

// Test scenarios
export const options = {
  scenarios: {
    // Gradual ramp-up for similarity search
    similarity_search: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '30s', target: parseInt(__ENV.VUS) || 10 },
        { duration: __ENV.DURATION || '1m', target: parseInt(__ENV.VUS) || 10 },
        { duration: '30s', target: 0 },
      ],
      exec: 'testSimilaritySearch',
    },
    // Constant load for semantic search
    semantic_search: {
      executor: 'constant-vus',
      vus: Math.max(1, Math.floor((parseInt(__ENV.VUS) || 10) / 2)),
      duration: __ENV.DURATION || '1m',
      startTime: '30s',
      exec: 'testSemanticSearch',
    },
    // Spike test for recommendations
    recommendations: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '20s', target: 5 },
        { duration: '10s', target: 20 }, // Spike
        { duration: '20s', target: 5 },
        { duration: '10s', target: 0 },
      ],
      startTime: '1m',
      exec: 'testRecommendations',
    },
  },
  thresholds: {
    'similarity_search_latency': ['p(95)<500', 'p(99)<1000'],
    'semantic_search_latency': ['p(95)<800', 'p(99)<1500'],
    'hybrid_search_latency': ['p(95)<600', 'p(99)<1200'],
    'recommendation_latency': ['p(95)<1000', 'p(99)<2000'],
    'error_rate': ['rate<0.05'], // Less than 5% errors
    'http_req_duration': ['p(95)<1000'], // 95% of requests under 1s
  },
};

// Sample test queries
const testQueries = [
  'birthday gift for mom',
  'christmas present for kids',
  'tech gadget for dad',
  'romantic anniversary gift',
  'outdoor adventure gear',
  'unique handmade jewelry',
  'smart home devices',
  'eco-friendly products',
  'personalized gifts',
  'luxury watches',
  'gaming accessories',
  'kitchen appliances',
  'fitness equipment',
  'books for teenagers',
  'pet supplies',
];

// Sample categories
const categories = [
  'electronics',
  'jewelry',
  'home',
  'sports',
  'books',
  'fashion',
  'toys',
];

// Helper function to get random item
function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper function to generate random embedding (for testing)
function randomEmbedding(dimensions = 1536) {
  const embedding = [];
  for (let i = 0; i < dimensions; i++) {
    embedding.push(Math.random() * 2 - 1);
  }
  // Normalize
  const norm = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
  return embedding.map(v => v / norm);
}

/**
 * Test similarity search endpoint
 */
export function testSimilaritySearch() {
  group('Similarity Search', () => {
    const embedding = randomEmbedding();
    const category = Math.random() > 0.5 ? randomItem(categories) : null;

    const payload = {
      embedding,
      options: {
        matchCount: 10,
        matchThreshold: 0.5,
        categoryFilter: category,
      },
    };

    const startTime = Date.now();
    const response = http.post(`${BASE_URL}/api/vectors/search`, JSON.stringify(payload), {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'similarity_search' },
    });
    const duration = Date.now() - startTime;

    similaritySearchLatency.add(duration);
    searchCount.add(1);

    const success = check(response, {
      'similarity search status 200': (r) => r.status === 200,
      'similarity search has results': (r) => {
        try {
          const body = JSON.parse(r.body);
          return Array.isArray(body) || (body.results && Array.isArray(body.results));
        } catch {
          return false;
        }
      },
      'similarity search latency < 500ms': () => duration < 500,
    });

    errorRate.add(!success);
  });

  sleep(Math.random() * 0.5 + 0.1); // Random sleep 0.1-0.6s
}

/**
 * Test semantic search endpoint
 */
export function testSemanticSearch() {
  group('Semantic Search', () => {
    const query = randomItem(testQueries);
    const category = Math.random() > 0.7 ? randomItem(categories) : undefined;

    const payload = {
      query,
      limit: 10,
      category,
    };

    const startTime = Date.now();
    const response = http.post(`${BASE_URL}/api/semantic-search`, JSON.stringify(payload), {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'semantic_search' },
    });
    const duration = Date.now() - startTime;

    semanticSearchLatency.add(duration);
    searchCount.add(1);

    const success = check(response, {
      'semantic search status 200': (r) => r.status === 200,
      'semantic search has results': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.results && Array.isArray(body.results);
        } catch {
          return false;
        }
      },
      'semantic search latency < 800ms': () => duration < 800,
    });

    errorRate.add(!success);
  });

  sleep(Math.random() * 0.3 + 0.2); // Random sleep 0.2-0.5s
}

/**
 * Test hybrid search endpoint
 */
export function testHybridSearch() {
  group('Hybrid Search', () => {
    const query = randomItem(testQueries);

    const payload = {
      query,
      keywordWeight: 0.3,
      semanticWeight: 0.7,
      matchCount: 20,
    };

    const startTime = Date.now();
    const response = http.post(`${BASE_URL}/api/vectors/hybrid-search`, JSON.stringify(payload), {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'hybrid_search' },
    });
    const duration = Date.now() - startTime;

    hybridSearchLatency.add(duration);
    searchCount.add(1);

    const success = check(response, {
      'hybrid search status 200': (r) => r.status === 200,
      'hybrid search has results': (r) => {
        try {
          const body = JSON.parse(r.body);
          return Array.isArray(body);
        } catch {
          return false;
        }
      },
      'hybrid search latency < 600ms': () => duration < 600,
    });

    errorRate.add(!success);
  });

  sleep(Math.random() * 0.4 + 0.1);
}

/**
 * Test recommendations endpoint
 */
export function testRecommendations() {
  group('Recommendations', () => {
    const userId = `test-user-${Math.floor(Math.random() * 100)}`;
    const occasion = Math.random() > 0.5 ? randomItem(['birthday', 'christmas', 'anniversary']) : undefined;

    const payload = {
      context: {
        userId,
        occasion,
        searchQuery: randomItem(testQueries),
      },
      options: {
        limit: 10,
        includeExplanation: true,
      },
    };

    const startTime = Date.now();
    const response = http.post(`${BASE_URL}/api/recommendations`, JSON.stringify(payload), {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'recommendations' },
    });
    const duration = Date.now() - startTime;

    recommendationLatency.add(duration);

    const success = check(response, {
      'recommendations status 200': (r) => r.status === 200,
      'recommendations has results': (r) => {
        try {
          const body = JSON.parse(r.body);
          return Array.isArray(body);
        } catch {
          return false;
        }
      },
      'recommendations latency < 1000ms': () => duration < 1000,
    });

    errorRate.add(!success);
  });

  sleep(Math.random() * 0.5 + 0.2);
}

/**
 * Test similar products endpoint
 */
export function testSimilarProducts() {
  group('Similar Products', () => {
    // Use a fixed product ID for testing (would be dynamic in real test)
    const productId = 'test-product-1';

    const startTime = Date.now();
    const response = http.get(`${BASE_URL}/api/vectors/products/${productId}/similar?limit=10`, {
      tags: { name: 'similar_products' },
    });
    const duration = Date.now() - startTime;

    const success = check(response, {
      'similar products status 200 or 404': (r) => r.status === 200 || r.status === 404,
      'similar products latency < 500ms': () => duration < 500,
    });

    errorRate.add(!success && response.status !== 404);
  });

  sleep(Math.random() * 0.3 + 0.1);
}

/**
 * Default test function (runs all scenarios)
 */
export default function () {
  testSimilaritySearch();
  testSemanticSearch();
  testHybridSearch();
  testRecommendations();
}

/**
 * Handle test summary
 */
export function handleSummary(data) {
  const summary = {
    metrics: {
      similarity_search_p95: data.metrics.similarity_search_latency?.values?.['p(95)'] || 0,
      semantic_search_p95: data.metrics.semantic_search_latency?.values?.['p(95)'] || 0,
      hybrid_search_p95: data.metrics.hybrid_search_latency?.values?.['p(95)'] || 0,
      recommendation_p95: data.metrics.recommendation_latency?.values?.['p(95)'] || 0,
      error_rate: data.metrics.error_rate?.values?.rate || 0,
      total_searches: data.metrics.search_count?.values?.count || 0,
    },
    thresholds: data.root_group?.checks || {},
  };

  return {
    'stdout': textSummary(data, { indent: '  ', enableColors: true }),
    'apps/api/load-tests/results.json': JSON.stringify(summary, null, 2),
  };
}

/**
 * Generate text summary
 */
function textSummary(data, options = {}) {
  const { indent = '  ', enableColors = false } = options;

  const green = enableColors ? '\x1b[32m' : '';
  const red = enableColors ? '\x1b[31m' : '';
  const yellow = enableColors ? '\x1b[33m' : '';
  const reset = enableColors ? '\x1b[0m' : '';

  let output = '\n=== Vector Load Test Results ===\n\n';

  // Latency metrics
  output += 'Latency Metrics (ms):\n';
  output += `${indent}Similarity Search p95: ${data.metrics.similarity_search_latency?.values?.['p(95)']?.toFixed(2) || 'N/A'}\n`;
  output += `${indent}Semantic Search p95: ${data.metrics.semantic_search_latency?.values?.['p(95)']?.toFixed(2) || 'N/A'}\n`;
  output += `${indent}Hybrid Search p95: ${data.metrics.hybrid_search_latency?.values?.['p(95)']?.toFixed(2) || 'N/A'}\n`;
  output += `${indent}Recommendations p95: ${data.metrics.recommendation_latency?.values?.['p(95)']?.toFixed(2) || 'N/A'}\n`;

  // Error rate
  const errorRateVal = data.metrics.error_rate?.values?.rate || 0;
  const errorColor = errorRateVal < 0.01 ? green : errorRateVal < 0.05 ? yellow : red;
  output += `\nError Rate: ${errorColor}${(errorRateVal * 100).toFixed(2)}%${reset}\n`;

  // Total searches
  output += `Total Searches: ${data.metrics.search_count?.values?.count || 0}\n`;

  // Threshold results
  output += '\nThreshold Results:\n';
  for (const [name, passed] of Object.entries(data.root_group?.checks || {})) {
    const icon = passed ? `${green}✓${reset}` : `${red}✗${reset}`;
    output += `${indent}${icon} ${name}\n`;
  }

  return output;
}
