/**
 * Comprehensive Edge Case Testing Script
 * Tests all edge cases and error scenarios for the CRM API
 */

const http = require('http');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
let authToken = null;
let userId = null;
let secondUserToken = null;
let secondUserId = null;
let createdEnquiryId = null;
let unclaimedEnquiryId = null;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    // Handle port properly - url.port is a string, could be empty
    let port = url.port || (url.protocol === 'https:' ? 443 : 3000);
    if (typeof port === 'string' && port === '') {
      port = url.protocol === 'https:' ? 443 : 3000;
    }
    port = parseInt(port, 10) || (url.protocol === 'https:' ? 443 : 3000);
    
    const options = {
      method,
      hostname: url.hostname,
      port: port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (body) {
      const data = JSON.stringify(body);
      options.headers['Content-Length'] = Buffer.byteLength(data);
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: parsed,
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function test(name, testFn) {
  try {
    log(`\n[TEST] ${name}`, 'blue');
    await testFn();
    log(`✓ PASS: ${name}`, 'green');
    return true;
  } catch (error) {
    log(`✗ FAIL: ${name}`, 'red');
    log(`  Error: ${error.message}`, 'red');
    if (error.expected) {
      log(`  Expected: ${JSON.stringify(error.expected)}`, 'yellow');
    }
    if (error.actual) {
      log(`  Actual: ${JSON.stringify(error.actual)}`, 'yellow');
    }
    return false;
  }
}

function expect(condition, message, expected = null, actual = null) {
  if (!condition) {
    const error = new Error(message);
    error.expected = expected;
    error.actual = actual;
    throw error;
  }
}

// ============================================================================
// AUTHENTICATION EDGE CASES
// ============================================================================

async function testAuthEdgeCases() {
  log('\n' + '='.repeat(60), 'blue');
  log('AUTHENTICATION EDGE CASES', 'blue');
  log('='.repeat(60), 'blue');

  // Test 1: Register with invalid email
  await test('Register with invalid email format', async () => {
    const response = await makeRequest('POST', '/api/auth/register', {
      name: 'Test User',
      email: 'invalid-email',
      password: 'password123',
    });
    expect(response.statusCode === 400, 'Should return 400 for invalid email');
    expect(response.body.success === false, 'Should have success: false');
  });

  // Test 2: Register with missing fields
  await test('Register with missing name', async () => {
    const response = await makeRequest('POST', '/api/auth/register', {
      email: 'test@example.com',
      password: 'password123',
    });
    expect(response.statusCode === 400, 'Should return 400 for missing name');
  });

  await test('Register with missing email', async () => {
    const response = await makeRequest('POST', '/api/auth/register', {
      name: 'Test User',
      password: 'password123',
    });
    expect(response.statusCode === 400, 'Should return 400 for missing email');
  });

  await test('Register with missing password', async () => {
    const response = await makeRequest('POST', '/api/auth/register', {
      name: 'Test User',
      email: 'test@example.com',
    });
    expect(response.statusCode === 400, 'Should return 400 for missing password');
  });

  // Test 3: Register with short password
  await test('Register with password too short', async () => {
    const response = await makeRequest('POST', '/api/auth/register', {
      name: 'Test User',
      email: 'test@example.com',
      password: '12345',
    });
    expect(response.statusCode === 400, 'Should return 400 for short password');
  });

  // Test 4: Register with duplicate email
  await test('Register with duplicate email', async () => {
    // First registration
    const response1 = await makeRequest('POST', '/api/auth/register', {
      name: 'First User',
      email: 'duplicate@example.com',
      password: 'password123',
    });
    expect(response1.statusCode === 201, 'First registration should succeed');

    // Second registration with same email
    const response2 = await makeRequest('POST', '/api/auth/register', {
      name: 'Second User',
      email: 'duplicate@example.com',
      password: 'password123',
    });
    expect(response2.statusCode === 409, 'Should return 409 for duplicate email');
    expect(response2.body.success === false, 'Should have success: false');
  });

  // Test 5: Register with valid data (success case)
  await test('Register with valid data', async () => {
    const response = await makeRequest('POST', '/api/auth/register', {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123',
    });
    expect(response.statusCode === 201, 'Should return 201');
    expect(response.body.success === true, 'Should have success: true');
    expect(response.body.data.token, 'Should return JWT token');
    expect(response.body.data.user, 'Should return user data');
    expect(!response.body.data.user.password, 'Should not return password');
    authToken = response.body.data.token;
    userId = response.body.data.user.id;
  });

  // Test 6: Login with non-existent email
  await test('Login with non-existent email', async () => {
    const response = await makeRequest('POST', '/api/auth/login', {
      email: 'nonexistent@example.com',
      password: 'password123',
    });
    expect(response.statusCode === 401, 'Should return 401');
    expect(response.body.success === false, 'Should have success: false');
  });

  // Test 7: Login with wrong password
  await test('Login with wrong password', async () => {
    const response = await makeRequest('POST', '/api/auth/login', {
      email: 'john@example.com',
      password: 'wrongpassword',
    });
    expect(response.statusCode === 401, 'Should return 401');
    expect(response.body.success === false, 'Should have success: false');
  });

  // Test 8: Login with invalid email format
  await test('Login with invalid email format', async () => {
    const response = await makeRequest('POST', '/api/auth/login', {
      email: 'invalid-email',
      password: 'password123',
    });
    expect(response.statusCode === 400, 'Should return 400');
  });

  // Test 9: Login with missing credentials
  await test('Login with missing email', async () => {
    const response = await makeRequest('POST', '/api/auth/login', {
      password: 'password123',
    });
    expect(response.statusCode === 400, 'Should return 400');
  });

  await test('Login with missing password', async () => {
    const response = await makeRequest('POST', '/api/auth/login', {
      email: 'test@example.com',
    });
    expect(response.statusCode === 400, 'Should return 400');
  });

  // Test 10: Create second user for concurrent tests
  await test('Register second user for concurrent tests', async () => {
    const response = await makeRequest('POST', '/api/auth/register', {
      name: 'Second Test User',
      email: `second${Date.now()}@example.com`,
      password: 'password123',
    });
    expect(response.statusCode === 201, 'Should return 201');
    secondUserToken = response.body.data.token;
    secondUserId = response.body.data.user.id;
  });
}

// ============================================================================
// JWT AUTHENTICATION EDGE CASES
// ============================================================================

async function testJWTEdgeCases() {
  log('\n' + '='.repeat(60), 'blue');
  log('JWT AUTHENTICATION EDGE CASES', 'blue');
  log('='.repeat(60), 'blue');

  // Test 1: Request without token
  await test('Get unclaimed enquiries without token', async () => {
    const response = await makeRequest('GET', '/api/enquiries/unclaimed');
    expect(response.statusCode === 401, 'Should return 401');
    expect(response.body.success === false, 'Should have success: false');
    expect(response.body.error === 'Authentication required', 'Should have correct error message');
  });

  // Test 2: Request with malformed token
  await test('Request with malformed token', async () => {
    const response = await makeRequest('GET', '/api/enquiries/unclaimed', null, 'invalid-token');
    expect(response.statusCode === 401, 'Should return 401');
  });

  // Test 3: Request with token without Bearer (just token, which should fail)
  await test('Request with token without Bearer prefix should fail', async () => {
    // Make a raw request without Bearer prefix
    const response = await new Promise((resolve) => {
      const url = new URL('/api/enquiries/unclaimed', BASE_URL);
      const options = {
        method: 'GET',
        hostname: url.hostname,
        port: url.port || 80,
        path: url.pathname,
        headers: {
          'Authorization': authToken, // Missing "Bearer " prefix
        },
      };
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            resolve({
              statusCode: res.statusCode,
              body: data ? JSON.parse(data) : {},
            });
          } catch (e) {
            resolve({ statusCode: res.statusCode, body: data });
          }
        });
      });
      req.on('error', () => resolve({ statusCode: 500, body: {} }));
      req.end();
    });
    // Should fail because token needs Bearer prefix
    expect(response.statusCode === 401, 'Should return 401 when Bearer prefix is missing');
  });

  // Test 4: Request with empty token
  await test('Request with empty token', async () => {
    const response = await makeRequest('GET', '/api/enquiries/unclaimed', null, '');
    expect(response.statusCode === 401, 'Should return 401');
  });
}

// ============================================================================
// ENQUIRY EDGE CASES
// ============================================================================

async function testEnquiryEdgeCases() {
  log('\n' + '='.repeat(60), 'blue');
  log('ENQUIRY EDGE CASES', 'blue');
  log('='.repeat(60), 'blue');

  // Test 1: Create enquiry with missing required fields
  await test('Create enquiry with missing name', async () => {
    const response = await makeRequest('POST', '/api/enquiries/public', {
      email: 'test@example.com',
      courseInterest: 'JavaScript',
    });
    expect(response.statusCode === 400, 'Should return 400');
  });

  await test('Create enquiry with missing email', async () => {
    const response = await makeRequest('POST', '/api/enquiries/public', {
      name: 'Test User',
      courseInterest: 'JavaScript',
    });
    expect(response.statusCode === 400, 'Should return 400');
  });

  await test('Create enquiry with missing courseInterest', async () => {
    const response = await makeRequest('POST', '/api/enquiries/public', {
      name: 'Test User',
      email: 'test@example.com',
    });
    expect(response.statusCode === 400, 'Should return 400');
  });

  // Test 2: Create enquiry with invalid email
  await test('Create enquiry with invalid email', async () => {
    const response = await makeRequest('POST', '/api/enquiries/public', {
      name: 'Test User',
      email: 'invalid-email',
      courseInterest: 'JavaScript',
    });
    expect(response.statusCode === 400, 'Should return 400');
  });

  // Test 3: Create enquiry with very long fields
  await test('Create enquiry with message too long', async () => {
    const longMessage = 'a'.repeat(1001);
    const response = await makeRequest('POST', '/api/enquiries/public', {
      name: 'Test User',
      email: 'test@example.com',
      courseInterest: 'JavaScript',
      message: longMessage,
    });
    expect(response.statusCode === 400, 'Should return 400 for message too long');
  });

  // Test 4: Create enquiry with valid data (success)
  await test('Create enquiry with valid data', async () => {
    const response = await makeRequest('POST', '/api/enquiries/public', {
      name: 'Test Enquiry',
      email: 'enquiry@example.com',
      courseInterest: 'React Development',
      message: 'I want to learn React',
    });
    expect(response.statusCode === 201, 'Should return 201');
    expect(response.body.success === true, 'Should have success: true');
    expect(response.body.data.enquiry.id, 'Should return enquiry ID');
    createdEnquiryId = response.body.data.enquiry.id;
  });

  // Test 5: Create enquiry without message (optional field)
  await test('Create enquiry without message (optional)', async () => {
    const response = await makeRequest('POST', '/api/enquiries/public', {
      name: 'Test Enquiry No Message',
      email: `nomessage${Date.now()}@example.com`,
      courseInterest: 'Node.js',
    });
    expect(response.statusCode === 201, 'Should return 201');
    expect(response.body.success === true, 'Should have success: true');
    unclaimedEnquiryId = response.body.data.enquiry.id;
  });

  // Test 6: Get unclaimed enquiries (protected endpoint)
  await test('Get unclaimed enquiries with valid token', async () => {
    const response = await makeRequest('GET', '/api/enquiries/unclaimed', null, authToken);
    expect(response.statusCode === 200, 'Should return 200');
    expect(response.body.success === true, 'Should have success: true');
    expect(Array.isArray(response.body.data.enquiries), 'Should return array of enquiries');
    expect(response.body.data.pagination, 'Should have pagination info');
  });

  // Test 7: Claim non-existent enquiry
  await test('Claim non-existent enquiry', async () => {
    const response = await makeRequest('POST', '/api/enquiries/99999/claim', null, authToken);
    expect(response.statusCode === 404, 'Should return 404');
    expect(response.body.success === false, 'Should have success: false');
  });

  // Test 8: Claim enquiry with invalid ID format
  await test('Claim enquiry with invalid ID (not a number)', async () => {
    const response = await makeRequest('POST', '/api/enquiries/abc/claim', null, authToken);
    expect(response.statusCode === 400, 'Should return 400 for invalid ID');
    expect(response.body.success === false, 'Should have success: false');
    expect(response.body.error === 'Invalid ID', 'Should have Invalid ID error');
  });

  // Test 8b: Claim enquiry with negative ID
  await test('Claim enquiry with negative ID', async () => {
    const response = await makeRequest('POST', '/api/enquiries/-1/claim', null, authToken);
    expect(response.statusCode === 400, 'Should return 400 for negative ID');
  });

  // Test 8c: Claim enquiry with zero ID
  await test('Claim enquiry with zero ID', async () => {
    const response = await makeRequest('POST', '/api/enquiries/0/claim', null, authToken);
    expect(response.statusCode === 400, 'Should return 400 for zero ID');
  });

  // Test 9: Claim an enquiry successfully
  await test('Claim an enquiry successfully', async () => {
    if (!unclaimedEnquiryId) {
      throw new Error('No unclaimed enquiry ID available');
    }
    const response = await makeRequest(
      'POST',
      `/api/enquiries/${unclaimedEnquiryId}/claim`,
      null,
      authToken
    );
    expect(response.statusCode === 200, 'Should return 200');
    expect(response.body.success === true, 'Should have success: true');
    expect(response.body.data.enquiry.claimedBy === userId, 'Should be claimed by correct user');
    expect(response.body.data.enquiry.isPublic === false, 'Should be marked as not public');
  });

  // Test 10: Attempt to claim already claimed enquiry
  await test('Claim already claimed enquiry', async () => {
    if (!unclaimedEnquiryId) {
      throw new Error('No enquiry ID available');
    }
    const response = await makeRequest(
      'POST',
      `/api/enquiries/${unclaimedEnquiryId}/claim`,
      null,
      secondUserToken
    );
    expect(response.statusCode === 409, 'Should return 409 Conflict');
    expect(response.body.success === false, 'Should have success: false');
    expect(response.body.error === 'Conflict', 'Should have Conflict error');
  });

  // Test 11: Get my enquiries
  await test('Get my claimed enquiries', async () => {
    const response = await makeRequest('GET', '/api/enquiries/mine', null, authToken);
    expect(response.statusCode === 200, 'Should return 200');
    expect(response.body.success === true, 'Should have success: true');
    expect(Array.isArray(response.body.data.enquiries), 'Should return array');
  });

  // Test 12: Get my enquiries with different user (should not see other user's)
  await test('Get enquiries for different user', async () => {
    const response = await makeRequest('GET', '/api/enquiries/mine', null, secondUserToken);
    expect(response.statusCode === 200, 'Should return 200');
    expect(response.body.data.enquiries.length === 0, 'Should have no enquiries for new user');
  });
}

// ============================================================================
// PAGINATION EDGE CASES
// ============================================================================

async function testPaginationEdgeCases() {
  log('\n' + '='.repeat(60), 'blue');
  log('PAGINATION EDGE CASES', 'blue');
  log('='.repeat(60), 'blue');

  // Test 1: Pagination with negative limit (should clamp to 1)
  await test('Get enquiries with negative limit', async () => {
    const response = await makeRequest(
      'GET',
      '/api/enquiries/unclaimed?limit=-10',
      null,
      authToken
    );
    expect(response.statusCode === 200, 'Should return 200');
    expect(response.body.data.pagination.limit >= 1, 'Limit should be clamped to at least 1');
  });

  // Test 2: Pagination with zero limit (should clamp to 1)
  await test('Get enquiries with zero limit', async () => {
    const response = await makeRequest(
      'GET',
      '/api/enquiries/unclaimed?limit=0',
      null,
      authToken
    );
    expect(response.statusCode === 200, 'Should return 200');
    expect(response.body.data.pagination.limit >= 1, 'Limit should be clamped to at least 1');
  });

  // Test 3: Pagination with negative offset (should clamp to 0)
  await test('Get enquiries with negative offset', async () => {
    const response = await makeRequest(
      'GET',
      '/api/enquiries/unclaimed?offset=-10',
      null,
      authToken
    );
    expect(response.statusCode === 200, 'Should return 200');
    expect(response.body.data.pagination.offset >= 0, 'Offset should be clamped to at least 0');
  });

  // Test 4: Pagination with very large limit
  await test('Get enquiries with very large limit', async () => {
    const response = await makeRequest(
      'GET',
      '/api/enquiries/unclaimed?limit=999999',
      null,
      authToken
    );
    expect(response.statusCode === 200, 'Should return 200');
  });

  // Test 5: Pagination with non-numeric values
  await test('Get enquiries with non-numeric limit', async () => {
    const response = await makeRequest(
      'GET',
      '/api/enquiries/unclaimed?limit=abc',
      null,
      authToken
    );
    expect(response.statusCode === 200, 'Should return 200');
  });

  // Test 6: Valid pagination
  await test('Get enquiries with valid pagination', async () => {
    const response = await makeRequest(
      'GET',
      '/api/enquiries/unclaimed?limit=5&offset=0',
      null,
      authToken
    );
    expect(response.statusCode === 200, 'Should return 200');
    expect(response.body.data.pagination.limit === 5, 'Should have correct limit');
    expect(response.body.data.pagination.offset === 0, 'Should have correct offset');
  });
}

// ============================================================================
// CONCURRENT CLAIM TEST (RACE CONDITION)
// ============================================================================

async function testConcurrentClaims() {
  log('\n' + '='.repeat(60), 'blue');
  log('CONCURRENT CLAIM TEST (RACE CONDITION)', 'blue');
  log('='.repeat(60), 'blue');

  // Create a new enquiry for concurrent testing
  await test('Create enquiry for concurrent testing', async () => {
    const response = await makeRequest('POST', '/api/enquiries/public', {
      name: 'Concurrent Test',
      email: `concurrent${Date.now()}@example.com`,
      courseInterest: 'Concurrent Testing',
    });
    expect(response.statusCode === 201, 'Should return 201');
    createdEnquiryId = response.body.data.enquiry.id;
  });

  // Test concurrent claims
  await test('Concurrent claim attempts (race condition test)', async () => {
    if (!createdEnquiryId) {
      throw new Error('No enquiry ID available for concurrent test');
    }

    // Make two claim requests simultaneously
    const promises = [
      makeRequest(
        'POST',
        `/api/enquiries/${createdEnquiryId}/claim`,
        null,
        authToken
      ),
      makeRequest(
        'POST',
        `/api/enquiries/${createdEnquiryId}/claim`,
        null,
        secondUserToken
      ),
    ];

    const results = await Promise.all(promises);

    // One should succeed (200), one should fail (409)
    const successCount = results.filter((r) => r.statusCode === 200).length;
    const conflictCount = results.filter((r) => r.statusCode === 409).length;

    expect(
      successCount === 1 && conflictCount === 1,
      'Exactly one should succeed and one should conflict',
      { expected: '1 success, 1 conflict' },
      { actual: `${successCount} success, ${conflictCount} conflict` }
    );
  });
}

// ============================================================================
// ROUTE NOT FOUND EDGE CASES
// ============================================================================

async function testRouteNotFound() {
  log('\n' + '='.repeat(60), 'blue');
  log('ROUTE NOT FOUND EDGE CASES', 'blue');
  log('='.repeat(60), 'blue');

  await test('Access non-existent route', async () => {
    const response = await makeRequest('GET', '/api/nonexistent');
    expect(response.statusCode === 404, 'Should return 404');
    expect(response.body.success === false, 'Should have success: false');
  });

  await test('Wrong HTTP method on existing route', async () => {
    const response = await makeRequest('GET', '/api/auth/register');
    expect(response.statusCode === 404, 'Should return 404 for wrong method');
  });
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

async function runAllTests() {
  log('\n' + '='.repeat(60), 'green');
  log('STARTING COMPREHENSIVE EDGE CASE TESTS', 'green');
  log('='.repeat(60), 'green');
  log(`Testing against: ${BASE_URL}`, 'yellow');

  const results = {
    passed: 0,
    failed: 0,
    tests: [],
  };

  try {
    // Check if server is running
    try {
      const healthCheck = await makeRequest('GET', '/health');
      if (healthCheck.statusCode !== 200) {
        throw new Error('Server health check failed');
      }
      log('\n✓ Server is running', 'green');
    } catch (error) {
      log('\n✗ Server is not running or not accessible', 'red');
      log('Please start the server with: npm start', 'yellow');
      process.exit(1);
    }

    // Run all test suites
    await testAuthEdgeCases();
    await testJWTEdgeCases();
    await testEnquiryEdgeCases();
    await testPaginationEdgeCases();
    await testConcurrentClaims();
    await testRouteNotFound();

    log('\n' + '='.repeat(60), 'green');
    log('ALL TESTS COMPLETED', 'green');
    log('='.repeat(60), 'green');
  } catch (error) {
    log(`\n✗ Test suite error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run tests
if (require.main === module) {
  runAllTests()
    .then(() => {
      log('\n✓ Test execution completed', 'green');
      process.exit(0);
    })
    .catch((error) => {
      log(`\n✗ Fatal error: ${error.message}`, 'red');
      process.exit(1);
    });
}

module.exports = { runAllTests };
