/**
 * Auto-scaling Test Scenario
 * Tests Kubernetes HPA (Horizontal Pod Autoscaler) behavior
 *
 * This test generates load patterns that should trigger auto-scaling
 * and then reduces load to verify scale-down behavior.
 *
 * Usage:
 *   k6 run --env BASE_URL=https://api.staging.mykadoo.com autoscaling-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

const responseTime = new Trend('response_time');
const errorRate = new Rate('errors');
const requestCounter = new Counter('total_requests');

const BASE_URL = __ENV.BASE_URL || 'http://localhost:14001';

export const options = {
  scenarios: {
    // Scale-up test: gradual increase to trigger HPA
    scale_up: {
      executor: 'ramping-arrival-rate',
      startRate: 10,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 500,
      stages: [
        { duration: '2m', target: 10 },   // Baseline
        { duration: '3m', target: 50 },   // Moderate load
        { duration: '5m', target: 100 },  // High load - should trigger scale-up
        { duration: '5m', target: 200 },  // Very high load
        { duration: '5m', target: 200 },  // Sustained high load
        { duration: '3m', target: 50 },   // Reduce load
        { duration: '5m', target: 10 },   // Low load - should trigger scale-down
        { duration: '2m', target: 10 },   // Verify scale-down
      ],
    },
  },
  thresholds: {
    'response_time': ['p(95)<1000'],  // Allow higher latency during scaling
    'errors': ['rate<0.05'],          // Allow up to 5% errors during scaling
    'http_req_duration': ['p(99)<2000'],
  },
};

// Endpoints to test (mix of light and heavy operations)
const endpoints = [
  { path: '/api/health', weight: 0.2 },
  { path: '/api/products?limit=20', weight: 0.3 },
  { path: '/api/gifts/search?q=birthday', weight: 0.3 },
  { path: '/api/content/articles?limit=10', weight: 0.2 },
];

function selectEndpoint() {
  const rand = Math.random();
  let cumulative = 0;
  for (const ep of endpoints) {
    cumulative += ep.weight;
    if (rand < cumulative) return ep.path;
  }
  return endpoints[0].path;
}

export default function () {
  const endpoint = selectEndpoint();
  const start = Date.now();

  const response = http.get(`${BASE_URL}${endpoint}`, {
    headers: { 'Accept': 'application/json' },
    timeout: '30s',
  });

  const duration = Date.now() - start;
  responseTime.add(duration);
  requestCounter.add(1);

  const success = check(response, {
    'status is 2xx or 404': (r) => (r.status >= 200 && r.status < 300) || r.status === 404,
    'response time < 2s': (r) => r.timings.duration < 2000,
  });

  if (!success) {
    errorRate.add(1);
  }
}

export function handleSummary(data) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  const summary = generateScalingSummary(data);

  return {
    stdout: summary,
    [`./reports/autoscaling-${timestamp}.json`]: JSON.stringify(data, null, 2),
    [`./reports/autoscaling-${timestamp}.txt`]: summary,
  };
}

function generateScalingSummary(data) {
  const lines = [];
  lines.push('\n' + '='.repeat(70));
  lines.push('                 AUTO-SCALING TEST RESULTS');
  lines.push('='.repeat(70) + '\n');

  if (data.metrics.http_reqs) {
    lines.push(`Total Requests:     ${data.metrics.http_reqs.values.count}`);
    lines.push(`Peak RPS:           ${data.metrics.http_reqs.values.rate.toFixed(2)}/s`);
  }

  if (data.metrics.response_time) {
    const rt = data.metrics.response_time.values;
    lines.push(`\nResponse Times:`);
    lines.push(`  Average:          ${rt.avg.toFixed(2)}ms`);
    lines.push(`  P50:              ${rt.med.toFixed(2)}ms`);
    lines.push(`  P95:              ${rt['p(95)'].toFixed(2)}ms`);
    lines.push(`  P99:              ${rt['p(99)'].toFixed(2)}ms`);
    lines.push(`  Max:              ${rt.max.toFixed(2)}ms`);
  }

  if (data.metrics.errors) {
    const errRate = (data.metrics.errors.values.rate * 100).toFixed(2);
    lines.push(`\nError Rate:         ${errRate}%`);
  }

  lines.push('\n' + '-'.repeat(70));
  lines.push('Scaling Analysis:');
  lines.push('-'.repeat(70));

  // Analyze if scaling worked properly
  const p95 = data.metrics.response_time?.values['p(95)'] || 0;
  const errRateVal = data.metrics.errors?.values.rate || 0;

  if (p95 < 500 && errRateVal < 0.01) {
    lines.push('  ✓ Excellent: System handled load with minimal latency increase');
    lines.push('  ✓ Auto-scaling appears to be working correctly');
  } else if (p95 < 1000 && errRateVal < 0.05) {
    lines.push('  ✓ Good: System handled load with acceptable latency');
    lines.push('  ! Consider tuning HPA thresholds for faster scaling');
  } else if (p95 < 2000) {
    lines.push('  ! Warning: High latency during peak load');
    lines.push('  ! Review HPA settings and resource limits');
  } else {
    lines.push('  ✗ Critical: System struggled under load');
    lines.push('  ✗ Increase min replicas or adjust scaling thresholds');
  }

  lines.push('\n' + '='.repeat(70) + '\n');
  return lines.join('\n');
}
