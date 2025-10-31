# API Request Examples

This file contains example curl commands and Postman-style requests for all API endpoints.

## Setup

Before running these examples, ensure:
1. The server is running on `http://localhost:3000`
2. You have registered a user and obtained a JWT token
3. The database has been seeded (optional but recommended)

## Authentication Endpoints

### 1. Register a New User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Counselor",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Counselor",
      "email": "john@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Counselor",
      "email": "john@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Invalid credentials",
  "message": "Email or password is incorrect"
}
```

## Enquiry Endpoints

### 3. Create Public Enquiry (No Authentication Required)

```bash
curl -X POST http://localhost:3000/api/enquiries/public \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Student",
    "email": "alice@student.com",
    "courseInterest": "JavaScript Bootcamp",
    "message": "I want to learn JavaScript and build web applications."
  }'
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "enquiry": {
      "id": 1,
      "name": "Alice Student",
      "email": "alice@student.com",
      "courseInterest": "JavaScript Bootcamp",
      "message": "I want to learn JavaScript and build web applications.",
      "isPublic": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Note:** `message` field is optional.

### 4. Get Unclaimed Enquiries (Protected)

```bash
# Without pagination
curl -X GET http://localhost:3000/api/enquiries/unclaimed \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# With pagination
curl -X GET "http://localhost:3000/api/enquiries/unclaimed?limit=10&offset=0" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "enquiries": [
      {
        "id": 2,
        "name": "Bob Learner",
        "email": "bob@learner.com",
        "courseInterest": "Python Fundamentals",
        "message": "Looking for a beginner-friendly Python course.",
        "isPublic": true,
        "claimedBy": null,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 4,
      "limit": 50,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Authentication required",
  "message": "No token provided"
}
```

### 5. Claim an Enquiry (Protected)

```bash
curl -X POST http://localhost:3000/api/enquiries/2/claim \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "enquiry": {
      "id": 2,
      "name": "Bob Learner",
      "email": "bob@learner.com",
      "courseInterest": "Python Fundamentals",
      "message": "Looking for a beginner-friendly Python course.",
      "isPublic": false,
      "claimedBy": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Response (409 Conflict if already claimed):**
```json
{
  "success": false,
  "error": "Conflict",
  "message": "This enquiry has already been claimed"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Not found",
  "message": "Enquiry not found"
}
```

### 6. Get My Claimed Enquiries (Protected)

```bash
# Without pagination
curl -X GET http://localhost:3000/api/enquiries/mine \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# With pagination
curl -X GET "http://localhost:3000/api/enquiries/mine?limit=10&offset=0" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "enquiries": [
      {
        "id": 1,
        "name": "Alice Student",
        "email": "alice@student.com",
        "courseInterest": "JavaScript Bootcamp",
        "message": "I want to learn JavaScript.",
        "isPublic": false,
        "claimedBy": 1,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "limit": 50,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

## Complete Workflow Example

Here's a complete workflow example using bash variables:

```bash
# 1. Register a user
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Counselor",
    "email": "john@example.com",
    "password": "password123"
  }')

# Extract token (requires jq or use a different method)
TOKEN=$(echo $RESPONSE | jq -r '.data.token')

# 2. Create a public enquiry
curl -X POST http://localhost:3000/api/enquiries/public \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Student",
    "email": "alice@student.com",
    "courseInterest": "JavaScript Bootcamp",
    "message": "I want to learn JavaScript"
  }'

# 3. Get unclaimed enquiries
curl -X GET "http://localhost:3000/api/enquiries/unclaimed" \
  -H "Authorization: Bearer $TOKEN"

# 4. Claim an enquiry (assuming enquiry ID is 1)
curl -X POST http://localhost:3000/api/enquiries/1/claim \
  -H "Authorization: Bearer $TOKEN"

# 5. Get my claimed enquiries
curl -X GET "http://localhost:3000/api/enquiries/mine" \
  -H "Authorization: Bearer $TOKEN"
```

## Validation Error Examples

### Invalid Email
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "invalid-email",
    "password": "password123"
  }'
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Validation failed",
  "message": "Invalid input data",
  "details": [
    {
      "type": "field",
      "value": "invalid-email",
      "msg": "Invalid email format",
      "path": "email",
      "location": "body"
    }
  ]
}
```

### Missing Required Fields
```bash
curl -X POST http://localhost:3000/api/enquiries/public \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Student",
    "email": "alice@student.com"
  }'
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Validation failed",
  "message": "Invalid input data",
  "details": [
    {
      "type": "field",
      "msg": "Course interest is required",
      "path": "courseInterest",
      "location": "body"
    }
  ]
}
```

## Health Check

```bash
curl -X GET http://localhost:3000/health
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Using with Postman

1. **Import Collection**: Create a new collection in Postman
2. **Set Environment Variables**:
   - `base_url`: `http://localhost:3000`
   - `token`: (will be set after login)
3. **Create Requests**:
   - Register: `POST {{base_url}}/api/auth/register`
   - Login: `POST {{base_url}}/api/auth/login`
   - Create Enquiry: `POST {{base_url}}/api/enquiries/public`
   - Get Unclaimed: `GET {{base_url}}/api/enquiries/unclaimed`
   - Claim Enquiry: `POST {{base_url}}/api/enquiries/:id/claim`
   - Get Mine: `GET {{base_url}}/api/enquiries/mine`

4. **Set Authorization**: For protected routes, add header:
   - Key: `Authorization`
   - Value: `Bearer {{token}}`
