import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.1'],     // Error rate should be below 10%
    errors: ['rate<0.1'],              // Custom error rate below 10%
  },
};

const BASE_URL = 'http://localhost:8000';

export function setup() {
  // Setup code - create test data if needed
  console.log('Setting up load test...');
}

export default function () {
  // Test API endpoints
  const endpoints = [
    '/api/artists/',
    '/api/tracks/',
    '/api/albums/',
    '/api/genres/',
  ];

  endpoints.forEach(endpoint => {
    const response = http.get(`${BASE_URL}${endpoint}`);
    
    const success = check(response, {
      'status is 200': (r) => r.status === 200,
      'response time < 500ms': (r) => r.timings.duration < 500,
      'response body not empty': (r) => r.body.length > 0,
    });

    errorRate.add(!success);
  });

  // Test search functionality
  const searchResponse = http.get(`${BASE_URL}/api/search/?q=test`);
  check(searchResponse, {
    'search status is 200': (r) => r.status === 200,
    'search response time < 1000ms': (r) => r.timings.duration < 1000,
  });

  sleep(1);
}

export function teardown() {
  // Cleanup code
  console.log('Load test completed');
}
