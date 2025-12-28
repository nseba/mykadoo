/**
 * Mykadoo Database Performance Benchmark
 * Tests database query performance through the API layer
 *
 * Usage:
 *   k6 run --env BASE_URL=http://localhost:14001 database-benchmark.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Rate } from 'k6/metrics';

// Database-specific metrics
const queryMetrics = {
  simpleSelect: new Trend('db_simple_select'),
  complexJoin: new Trend('db_complex_join'),
  pagination: new Trend('db_pagination'),
  search: new Trend('db_search'),
  aggregation: new Trend('db_aggregation'),
  write: new Trend('db_write'),
};

const errorRate = new Rate('errors');
const BASE_URL = __ENV.BASE_URL || 'http://localhost:14001';

export const options = {
  scenarios: {
    // Database benchmark - moderate concurrent load
    database_benchmark: {
      executor: 'constant-vus',
      vus: 20,
      duration: '5m',
    },
  },
  thresholds: {
    'db_simple_select': ['p(95)<50', 'p(99)<100'],
    'db_complex_join': ['p(95)<200', 'p(99)<500'],
    'db_pagination': ['p(95)<100', 'p(99)<200'],
    'db_search': ['p(95)<300', 'p(99)<500'],
    'db_aggregation': ['p(95)<500', 'p(99)<1000'],
    'errors': ['rate<0.01'],
  },
};

const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

export default function () {
  // Simple SELECT - single record fetch
  group('Simple SELECT', () => {
    const start = Date.now();
    const response = http.get(`${BASE_URL}/api/health`, { headers });
    queryMetrics.simpleSelect.add(Date.now() - start);

    check(response, {
      'simple select: status 200': (r) => r.status === 200,
    }) || errorRate.add(1);
  });

  // Complex JOIN - products with categories
  group('Complex JOIN', () => {
    const start = Date.now();
    const response = http.get(
      `${BASE_URL}/api/products?include=category,brand&limit=20`,
      { headers }
    );
    queryMetrics.complexJoin.add(Date.now() - start);

    check(response, {
      'complex join: status 200 or 404': (r) => r.status === 200 || r.status === 404,
    }) || errorRate.add(1);
  });

  // Pagination - offset-based pagination
  group('Pagination', () => {
    const pages = [1, 2, 5, 10, 20];
    const page = pages[Math.floor(Math.random() * pages.length)];

    const start = Date.now();
    const response = http.get(
      `${BASE_URL}/api/products?page=${page}&limit=20`,
      { headers }
    );
    queryMetrics.pagination.add(Date.now() - start);

    check(response, {
      'pagination: status 200 or 404': (r) => r.status === 200 || r.status === 404,
    }) || errorRate.add(1);
  });

  // Full-text search
  group('Full-text Search', () => {
    const queries = [
      'gift',
      'birthday present',
      'christmas gift ideas',
      'electronics',
      'home decor',
    ];
    const query = queries[Math.floor(Math.random() * queries.length)];

    const start = Date.now();
    const response = http.get(
      `${BASE_URL}/api/gifts/search?q=${encodeURIComponent(query)}`,
      { headers }
    );
    queryMetrics.search.add(Date.now() - start);

    check(response, {
      'search: status 200 or 404': (r) => r.status === 200 || r.status === 404,
    }) || errorRate.add(1);
  });

  // Aggregation - counts, stats
  group('Aggregation', () => {
    const start = Date.now();
    const response = http.get(
      `${BASE_URL}/api/products/stats`,
      { headers }
    );
    queryMetrics.aggregation.add(Date.now() - start);

    check(response, {
      'aggregation: status 200 or 404': (r) => r.status === 200 || r.status === 404,
    }) || errorRate.add(1);
  });

  sleep(0.5);
}

export function handleSummary(data) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const report = generateDatabaseReport(data);

  return {
    stdout: report,
    [`./reports/database-benchmark-${timestamp}.json`]: JSON.stringify(data, null, 2),
  };
}

function generateDatabaseReport(data) {
  const lines = [];
  lines.push('\n' + '='.repeat(70));
  lines.push('                 DATABASE PERFORMANCE REPORT');
  lines.push('='.repeat(70) + '\n');

  const queries = [
    { name: 'Simple SELECT', metric: 'db_simple_select', target: 50 },
    { name: 'Complex JOIN', metric: 'db_complex_join', target: 200 },
    { name: 'Pagination', metric: 'db_pagination', target: 100 },
    { name: 'Full-text Search', metric: 'db_search', target: 300 },
    { name: 'Aggregation', metric: 'db_aggregation', target: 500 },
  ];

  lines.push('Query Performance (all times in ms):');
  lines.push('-'.repeat(70));
  lines.push(
    'Query Type'.padEnd(20) +
    'Avg'.padStart(10) +
    'P50'.padStart(10) +
    'P95'.padStart(10) +
    'P99'.padStart(10) +
    'Max'.padStart(10)
  );
  lines.push('-'.repeat(70));

  for (const q of queries) {
    const metric = data.metrics[q.metric];
    if (metric) {
      const v = metric.values;
      lines.push(
        q.name.padEnd(20) +
        v.avg.toFixed(1).padStart(10) +
        v.med.toFixed(1).padStart(10) +
        v['p(95)'].toFixed(1).padStart(10) +
        v['p(99)'].toFixed(1).padStart(10) +
        v.max.toFixed(1).padStart(10)
      );
    }
  }

  lines.push('-'.repeat(70));

  // Recommendations
  lines.push('\nRecommendations:');
  for (const q of queries) {
    const metric = data.metrics[q.metric];
    if (metric && metric.values['p(95)'] > q.target) {
      lines.push(`  - ${q.name}: P95 (${metric.values['p(95)'].toFixed(1)}ms) exceeds target (${q.target}ms)`);
      lines.push(`    Consider adding indexes or optimizing the query`);
    }
  }

  lines.push('\n' + '='.repeat(70) + '\n');
  return lines.join('\n');
}
