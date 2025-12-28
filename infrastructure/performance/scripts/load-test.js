/**
 * Mykadoo Load Testing Script
 * Using k6 for performance and load testing
 *
 * Usage:
 *   k6 run --env BASE_URL=https://api.mykadoo.com load-test.js
 *   k6 run --env BASE_URL=http://localhost:14001 load-test.js
 *
 * With scenarios:
 *   k6 run --env SCENARIO=smoke load-test.js
 *   k6 run --env SCENARIO=load load-test.js
 *   k6 run --env SCENARIO=stress load-test.js
 *   k6 run --env SCENARIO=spike load-test.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const apiLatency = new Trend('api_latency');
const searchLatency = new Trend('search_latency');
const authLatency = new Trend('auth_latency');
const requestCount = new Counter('requests');

// Configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:14001';
const SCENARIO = __ENV.SCENARIO || 'load';

// Test scenarios
const scenarios = {
  // Smoke test - verify system works under minimal load
  smoke: {
    executor: 'constant-vus',
    vus: 1,
    duration: '1m',
  },

  // Load test - normal expected load
  load: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '2m', target: 50 },   // Ramp up to 50 users
      { duration: '5m', target: 50 },   // Stay at 50 users
      { duration: '2m', target: 100 },  // Ramp up to 100 users
      { duration: '5m', target: 100 },  // Stay at 100 users
      { duration: '2m', target: 0 },    // Ramp down to 0
    ],
  },

  // Stress test - beyond normal load to find breaking point
  stress: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '2m', target: 100 },
      { duration: '5m', target: 100 },
      { duration: '2m', target: 200 },
      { duration: '5m', target: 200 },
      { duration: '2m', target: 300 },
      { duration: '5m', target: 300 },
      { duration: '2m', target: 400 },
      { duration: '5m', target: 400 },
      { duration: '5m', target: 0 },
    ],
  },

  // Spike test - sudden surge in traffic
  spike: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '30s', target: 10 },   // Normal load
      { duration: '30s', target: 500 },  // Spike to 500 users
      { duration: '1m', target: 500 },   // Stay at 500
      { duration: '30s', target: 10 },   // Back to normal
      { duration: '1m', target: 10 },    // Stay normal
      { duration: '30s', target: 500 },  // Another spike
      { duration: '1m', target: 500 },   // Stay at spike
      { duration: '30s', target: 0 },    // Ramp down
    ],
  },

  // Soak test - sustained load over time
  soak: {
    executor: 'constant-vus',
    vus: 100,
    duration: '30m',
  },
};

// Export options based on selected scenario
export const options = {
  scenarios: {
    default: scenarios[SCENARIO] || scenarios.load,
  },
  thresholds: {
    // Overall error rate should be less than 1%
    errors: ['rate<0.01'],

    // 95% of requests should complete within 500ms
    http_req_duration: ['p(95)<500', 'p(99)<1000'],

    // API latency thresholds
    api_latency: ['p(95)<300', 'p(99)<500'],

    // Search latency (can be slightly higher)
    search_latency: ['p(95)<500', 'p(99)<1000'],

    // Auth operations should be fast
    auth_latency: ['p(95)<200', 'p(99)<400'],
  },
  // Output configuration
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
};

// Helper function for API requests
function apiRequest(method, endpoint, body = null, name = null) {
  const url = `${BASE_URL}${endpoint}`;
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    tags: { name: name || endpoint },
  };

  let response;
  const start = Date.now();

  if (method === 'GET') {
    response = http.get(url, params);
  } else if (method === 'POST') {
    response = http.post(url, JSON.stringify(body), params);
  } else if (method === 'PUT') {
    response = http.put(url, JSON.stringify(body), params);
  } else if (method === 'DELETE') {
    response = http.del(url, null, params);
  }

  const duration = Date.now() - start;
  apiLatency.add(duration);
  requestCount.add(1);

  return response;
}

// Test user data
const testUsers = [
  { email: 'loadtest1@example.com', password: 'TestPassword123!' },
  { email: 'loadtest2@example.com', password: 'TestPassword123!' },
  { email: 'loadtest3@example.com', password: 'TestPassword123!' },
];

const searchQueries = [
  'birthday gift for dad',
  'christmas present for mom',
  'wedding anniversary gift',
  'graduation present ideas',
  'housewarming gift',
  'baby shower gift',
  'valentines day gift',
  'gift for coworker',
  'gift for teenager',
  'retirement gift',
];

// Main test function
export default function () {
  const user = testUsers[Math.floor(Math.random() * testUsers.length)];
  const query = searchQueries[Math.floor(Math.random() * searchQueries.length)];

  // Health check
  group('Health Check', () => {
    const response = apiRequest('GET', '/api/health', null, 'health');
    check(response, {
      'health check status is 200': (r) => r.status === 200,
      'health check response is ok': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.status === 'ok' || body.status === 'healthy';
        } catch {
          return false;
        }
      },
    }) || errorRate.add(1);
  });

  sleep(0.5);

  // Search API test
  group('Gift Search', () => {
    const start = Date.now();
    const response = apiRequest(
      'GET',
      `/api/gifts/search?q=${encodeURIComponent(query)}&limit=20`,
      null,
      'search'
    );
    searchLatency.add(Date.now() - start);

    check(response, {
      'search status is 200': (r) => r.status === 200,
      'search returns results': (r) => {
        try {
          const body = JSON.parse(r.body);
          return Array.isArray(body.data) || Array.isArray(body.results) || Array.isArray(body);
        } catch {
          return false;
        }
      },
      'search response time < 500ms': (r) => r.timings.duration < 500,
    }) || errorRate.add(1);
  });

  sleep(1);

  // Product listing
  group('Product Listing', () => {
    const response = apiRequest('GET', '/api/products?limit=20&page=1', null, 'products');
    check(response, {
      'products status is 200': (r) => r.status === 200,
      'products returns array': (r) => {
        try {
          const body = JSON.parse(r.body);
          return Array.isArray(body.data) || Array.isArray(body);
        } catch {
          return false;
        }
      },
    }) || errorRate.add(1);
  });

  sleep(0.5);

  // Content/Blog API
  group('Content API', () => {
    const response = apiRequest('GET', '/api/content/articles?limit=10', null, 'articles');
    check(response, {
      'articles status is 200 or 404': (r) => r.status === 200 || r.status === 404,
    }) || errorRate.add(1);
  });

  sleep(0.5);

  // Simulate user behavior with random think time
  sleep(Math.random() * 2 + 1);
}

// Lifecycle hooks
export function setup() {
  console.log(`Starting ${SCENARIO} test against ${BASE_URL}`);
  console.log(`Scenario configuration:`, JSON.stringify(scenarios[SCENARIO], null, 2));

  // Verify target is reachable
  const response = http.get(`${BASE_URL}/api/health`);
  if (response.status !== 200) {
    console.warn(`Warning: Health check returned status ${response.status}`);
  }

  return { startTime: Date.now() };
}

export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log(`Test completed in ${duration.toFixed(2)} seconds`);
}

// Handle summary output
export function handleSummary(data) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const summaryPath = `./reports/summary-${SCENARIO}-${timestamp}.json`;

  return {
    stdout: textSummary(data, { indent: '  ', enableColors: true }),
    [summaryPath]: JSON.stringify(data, null, 2),
  };
}

// Text summary helper
function textSummary(data, options) {
  const { metrics, root_group } = data;
  const lines = [];

  lines.push('\n' + '='.repeat(60));
  lines.push('                    LOAD TEST SUMMARY');
  lines.push('='.repeat(60) + '\n');

  // Request metrics
  if (metrics.http_reqs) {
    lines.push(`Total Requests:     ${metrics.http_reqs.values.count}`);
    lines.push(`Request Rate:       ${metrics.http_reqs.values.rate.toFixed(2)}/s`);
  }

  if (metrics.http_req_duration) {
    const dur = metrics.http_req_duration.values;
    lines.push(`\nResponse Times:`);
    lines.push(`  Average:          ${dur.avg.toFixed(2)}ms`);
    lines.push(`  Median:           ${dur.med.toFixed(2)}ms`);
    lines.push(`  P95:              ${dur['p(95)'].toFixed(2)}ms`);
    lines.push(`  P99:              ${dur['p(99)'].toFixed(2)}ms`);
    lines.push(`  Max:              ${dur.max.toFixed(2)}ms`);
  }

  if (metrics.errors) {
    const errRate = (metrics.errors.values.rate * 100).toFixed(2);
    lines.push(`\nError Rate:         ${errRate}%`);
  }

  // Custom metrics
  if (metrics.search_latency) {
    const search = metrics.search_latency.values;
    lines.push(`\nSearch Latency:`);
    lines.push(`  Average:          ${search.avg.toFixed(2)}ms`);
    lines.push(`  P95:              ${search['p(95)'].toFixed(2)}ms`);
  }

  lines.push('\n' + '='.repeat(60) + '\n');

  return lines.join('\n');
}
