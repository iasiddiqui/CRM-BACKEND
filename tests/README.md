# Edge Case Testing Guide

This directory contains comprehensive edge case tests for the CRM Backend API.

## Prerequisites

Before running the tests, ensure:

1. **PostgreSQL is running** (see setup options below)
2. **Database is created** (will be auto-created on first run)
3. **Server is running** on `http://localhost:3000`

## Quick Setup with Docker

The easiest way to set up PostgreSQL for testing:

```bash
# Start PostgreSQL in Docker
docker-compose up -d

# Wait for database to be ready (about 10 seconds)
# Then start the server
npm start

# In another terminal, run tests
npm test
```

## Manual Setup

1. **Install PostgreSQL** (if not installed)
2. **Create database**:
   ```sql
   CREATE DATABASE crm_db;
   ```
3. **Update `.env`** with your PostgreSQL credentials
4. **Start server**: `npm start`
5. **Run tests**: `npm test`

## Running Tests

```bash
# Run all edge case tests
npm test

# Or directly
node tests/test-edge-cases.js
```

## Test Coverage

The test suite covers the following edge cases:

### Authentication Edge Cases ✅
- [x] Invalid email format
- [x] Missing required fields (name, email, password)
- [x] Password too short (< 6 characters)
- [x] Duplicate email registration
- [x] Non-existent user login
- [x] Wrong password login
- [x] Invalid email format in login
- [x] Missing credentials in login

### JWT Authentication Edge Cases ✅
- [x] Request without token
- [x] Malformed token
- [x] Token without Bearer prefix
- [x] Empty token

### Enquiry Edge Cases ✅
- [x] Missing required fields (name, email, courseInterest)
- [x] Invalid email format
- [x] Message too long (> 1000 characters)
- [x] Enquiry without message (optional field)
- [x] Claim non-existent enquiry
- [x] Claim enquiry with invalid ID format
- [x] Claim already claimed enquiry (409 Conflict)
- [x] Verify claimed enquiries are private to user

### Pagination Edge Cases ✅
- [x] Negative limit
- [x] Zero limit
- [x] Negative offset
- [x] Very large limit
- [x] Non-numeric limit/offset
- [x] Valid pagination parameters

### Race Condition Tests ✅
- [x] Concurrent claim attempts (two users claiming same lead)
- [x] Verify only one succeeds, one gets 409 Conflict

### Route Not Found ✅
- [x] Non-existent routes return 404
- [x] Wrong HTTP method returns 404

## Test Output

Tests provide colored output:
- 🟢 **Green**: Passed tests
- 🔴 **Red**: Failed tests
- 🔵 **Blue**: Test section headers
- 🟡 **Yellow**: Warnings/info

## Expected Results

When all tests pass, you should see:
- All authentication edge cases handled correctly
- All JWT validation working
- All enquiry operations working
- Race condition prevention verified
- Proper error responses for all invalid inputs

## Troubleshooting

### "Server is not running"
- Start the server: `npm start`
- Check if port 3000 is available
- Verify `.env` file exists

### "ECONNREFUSED" (Database connection error)
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- For Docker: `docker-compose up -d`
- For local: Ensure PostgreSQL service is running

### Tests failing with 500 errors
- Check server logs for errors
- Verify database schema is initialized
- Run seed script: `npm run seed`

### "Token expired" errors
- Tokens expire after 1 day by default
- Re-run tests (they create new users/tokens)
- Or adjust `JWT_EXPIRES_IN` in `.env` for longer tokens during testing

## Test Architecture

The test script:
1. Makes HTTP requests to the API
2. Validates responses (status codes, response structure)
3. Tests edge cases systematically
4. Provides clear pass/fail feedback
5. Handles server/database connectivity issues gracefully

## Adding New Tests

To add new edge cases:

1. Open `tests/test-edge-cases.js`
2. Add a new test function in the appropriate section
3. Use the `test()` helper function
4. Use `expect()` for assertions
5. Run `npm test` to verify

Example:
```javascript
await test('My new edge case', async () => {
  const response = await makeRequest('GET', '/api/some/endpoint', null, authToken);
  expect(response.statusCode === 200, 'Should return 200');
  expect(response.body.success === true, 'Should have success: true');
});
```
