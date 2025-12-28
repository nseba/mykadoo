/**
 * Mykadoo API Benchmark Script
 * Detailed performance benchmarks for individual API endpoints
 *
 * Usage:
 *   k6 run --env BASE_URL=http://localhost:14001 api-benchmark.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

// Custom metrics per endpoint
const metrics = {
  health: new Trend('endpoint_health'),
  search: new Trend('endpoint_search'),
  products: new Trend('endpoint_products'),
  productDetail: new Trend('endpoint_product_detail'),
  articles: new Trend('endpoint_articles'),
  categories: new Trend('endpoint_categories'),
  auth: new Trend('endpoint_auth'),
};

const errorRate = new Rate('errors');
const successfulRequests = new Counter('successful_requests');

const BASE_URL = __ENV.BASE_URL || 'http://localhost:14001';

export const options = {
  scenarios: {
    // Run each endpoint benchmark sequentially
    benchmark: {
      executor: 'per-vu-iterations',
      vus: 10,
      iterations: 100,
      maxDuration: '10m',
    },
  },
  thresholds: {
    'endpoint_health': ['p(95)<100'],
    'endpoint_search': ['p(95)<500'],
    'endpoint_products': ['p(95)<300'],
    'endpoint_product_detail': ['p(95)<200'],
    'endpoint_articles': ['p(95)<300'],
    'endpoint_categories': ['p(95)<200'],
    'errors': ['rate<0.05'],
  },
};

// Benchmark helper
function benchmark(name, fn) {
  const start = Date.now();
  const result = fn();
  const duration = Date.now() - start;

  if (metrics[name]) {
    metrics[name].add(duration);
  }

  return { result, duration };
}

export default function () {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Health endpoint benchmark
  group('Health Endpoint', () => {
    const { result, duration } = benchmark('health', () => {
      return http.get(`${BASE_URL}/api/health`, { headers });
    });

    const passed = check(result, {
      'health: status 200': (r) => r.status === 200,
      'health: response < 100ms': () => duration < 100,
    });

    if (passed) successfulRequests.add(1);
    else errorRate.add(1);
  });

  // Search endpoint benchmark
  group('Search Endpoint', () => {
    const queries = [
      'birthday gift',
      'christmas',
      'wedding',
      'electronics under 50',
      'gift for mom',
    ];
    const query = queries[Math.floor(Math.random() * queries.length)];

    const { result, duration } = benchmark('search', () => {
      return http.get(
        `${BASE_URL}/api/gifts/search?q=${encodeURIComponent(query)}&limit=20`,
        { headers }
      );
    });

    const passed = check(result, {
      'search: status 200': (r) => r.status === 200,
      'search: has results': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.data || body.results || Array.isArray(body);
        } catch {
          return false;
        }
      },
      'search: response < 500ms': () => duration < 500,
    });

    if (passed) successfulRequests.add(1);
    else errorRate.add(1);
  });

  // Products listing benchmark
  group('Products Endpoint', () => {
    const { result, duration } = benchmark('products', () => {
      return http.get(`${BASE_URL}/api/products?limit=20&page=1`, { headers });
    });

    const passed = check(result, {
      'products: status 200': (r) => r.status === 200,
      'products: response < 300ms': () => duration < 300,
    });

    if (passed) successfulRequests.add(1);
    else errorRate.add(1);
  });

  // Product detail benchmark
  group('Product Detail Endpoint', () => {
    const productIds = ['prod_1', 'prod_2', 'prod_3'];
    const productId = productIds[Math.floor(Math.random() * productIds.length)];

    const { result, duration } = benchmark('productDetail', () => {
      return http.get(`${BASE_URL}/api/products/${productId}`, { headers });
    });

    // 404 is acceptable for test product IDs
    const passed = check(result, {
      'product detail: status 200 or 404': (r) => r.status === 200 || r.status === 404,
      'product detail: response < 200ms': () => duration < 200,
    });

    if (passed) successfulRequests.add(1);
    else errorRate.add(1);
  });

  // Articles/Content benchmark
  group('Articles Endpoint', () => {
    const { result, duration } = benchmark('articles', () => {
      return http.get(`${BASE_URL}/api/content/articles?limit=10`, { headers });
    });

    const passed = check(result, {
      'articles: status 200 or 404': (r) => r.status === 200 || r.status === 404,
      'articles: response < 300ms': () => duration < 300,
    });

    if (passed) successfulRequests.add(1);
    else errorRate.add(1);
  });

  // Categories benchmark
  group('Categories Endpoint', () => {
    const { result, duration } = benchmark('categories', () => {
      return http.get(`${BASE_URL}/api/categories`, { headers });
    });

    const passed = check(result, {
      'categories: status 200 or 404': (r) => r.status === 200 || r.status === 404,
      'categories: response < 200ms': () => duration < 200,
    });

    if (passed) successfulRequests.add(1);
    else errorRate.add(1);
  });

  // Small delay between iterations
  sleep(0.1);
}

export function handleSummary(data) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  // Generate benchmark report
  const report = generateBenchmarkReport(data);

  return {
    stdout: report,
    [`./reports/benchmark-${timestamp}.json`]: JSON.stringify(data, null, 2),
    [`./reports/benchmark-${timestamp}.txt`]: report,
  };
}

function generateBenchmarkReport(data) {
  const lines = [];
  lines.push('\n' + '='.repeat(70));
  lines.push('                    API BENCHMARK RESULTS');
  lines.push('='.repeat(70) + '\n');

  const endpoints = [
    { name: 'Health', metric: 'endpoint_health', target: 100 },
    { name: 'Search', metric: 'endpoint_search', target: 500 },
    { name: 'Products', metric: 'endpoint_products', target: 300 },
    { name: 'Product Detail', metric: 'endpoint_product_detail', target: 200 },
    { name: 'Articles', metric: 'endpoint_articles', target: 300 },
    { name: 'Categories', metric: 'endpoint_categories', target: 200 },
  ];

  lines.push('Endpoint Performance (all times in ms):');
  lines.push('-'.repeat(70));
  lines.push(
    'Endpoint'.padEnd(20) +
    'Avg'.padStart(10) +
    'Med'.padStart(10) +
    'P95'.padStart(10) +
    'P99'.padStart(10) +
    'Target'.padStart(10)
  );
  lines.push('-'.repeat(70));

  for (const ep of endpoints) {
    const metric = data.metrics[ep.metric];
    if (metric) {
      const v = metric.values;
      const p95Pass = v['p(95)'] <= ep.target ? '✓' : '✗';
      lines.push(
        ep.name.padEnd(20) +
        v.avg.toFixed(1).padStart(10) +
        v.med.toFixed(1).padStart(10) +
        v['p(95)'].toFixed(1).padStart(10) +
        v['p(99)'].toFixed(1).padStart(10) +
        `${ep.target} ${p95Pass}`.padStart(10)
      );
    }
  }

  lines.push('-'.repeat(70));

  // Summary stats
  if (data.metrics.http_reqs) {
    lines.push(`\nTotal Requests: ${data.metrics.http_reqs.values.count}`);
    lines.push(`Request Rate: ${data.metrics.http_reqs.values.rate.toFixed(2)}/s`);
  }

  if (data.metrics.errors) {
    const errRate = (data.metrics.errors.values.rate * 100).toFixed(2);
    lines.push(`Error Rate: ${errRate}%`);
  }

  lines.push('\n' + '='.repeat(70) + '\n');

  return lines.join('\n');
}
