# CRM Backend API

A production-ready REST API backend for managing enquiries (leads) in a CRM system. Built with Node.js, Express, PostgreSQL, and JWT authentication.

## Features

- **User Authentication**: JWT-based authentication for employees/counselors
- **Public Enquiry Form**: Allow external users to submit leads without authentication
- **Lead Management**: Fetch unclaimed leads, claim leads, and view claimed leads
- **Race Condition Prevention**: Atomic database operations prevent multiple users from claiming the same lead
- **Input Validation**: Comprehensive validation for all endpoints
- **Error Handling**: Proper HTTP status codes and error messages
- **Pagination**: Support for limit/offset query parameters
- **CORS**: Configurable CORS support

## Tech Stack

- **Node.js** - Runtime environment
- **Express** - Web framework
- **PostgreSQL** - Relational database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Setup Instructions

### 1. Clone the repository

```bash
cd crm-back
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=crm_db
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=1d

CORS_ORIGIN=http://localhost:3000
```

### 4. Create PostgreSQL database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE crm_db;

# Exit psql
\q
```

### 5. Seed the database (optional)

Run the seed script to create sample users and enquiries:

```bash
npm run seed
```

This will create:
- 2 sample users (john@example.com and jane@example.com, both with password: `password123`)
- 5 sample enquiries (4 unclaimed, 1 claimed)

### 6. Start the server

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

## API Endpoints

### Authentication

#### Register User
```bash
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login
```bash
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** (Same format as register)

### Enquiries

#### Create Public Enquiry (No Auth Required)
```bash
POST /api/enquiries/public
```

**Request Body:**
```json
{
  "name": "Alice Student",
  "email": "alice@student.com",
  "courseInterest": "JavaScript Bootcamp",
  "message": "I want to learn JavaScript"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "enquiry": {
      "id": 1,
      "name": "Alice Student",
      "email": "alice@student.com",
      "courseInterest": "JavaScript Bootcamp",
      "message": "I want to learn JavaScript",
      "isPublic": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### Get Unclaimed Enquiries (Protected)
```bash
GET /api/enquiries/unclaimed?limit=50&offset=0
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
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

#### Claim Enquiry (Protected)
```bash
POST /api/enquiries/:id/claim
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
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

#### Get My Enquiries (Protected)
```bash
GET /api/enquiries/mine?limit=50&offset=0
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** (Same format as unclaimed enquiries)

## Example cURL Commands

### 1. Register a new user
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Counselor",
    "email": "john@example.com",
    "password": "password123"
  }'
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

### 3. Create a public enquiry (no auth)
```bash
curl -X POST http://localhost:3000/api/enquiries/public \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Student",
    "email": "alice@student.com",
    "courseInterest": "JavaScript Bootcamp",
    "message": "I want to learn JavaScript"
  }'
```

### 4. Get unclaimed enquiries
```bash
curl -X GET "http://localhost:3000/api/enquiries/unclaimed?limit=10&offset=0" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Claim an enquiry
```bash
curl -X POST http://localhost:3000/api/enquiries/1/claim \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 6. Get my claimed enquiries
```bash
curl -X GET "http://localhost:3000/api/enquiries/mine?limit=10&offset=0" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Enquiries Table
```sql
CREATE TABLE enquiries (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  course_interest VARCHAR(255) NOT NULL,
  message TEXT,
  claimed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Race Condition Prevention

The claim operation is designed to prevent race conditions when multiple users attempt to claim the same lead simultaneously. Here's how it works:

### Implementation Details

The `Enquiry.claimById()` method in `models/Enquiry.js` uses a combination of PostgreSQL transactions and row-level locking:

1. **Database Transaction**: The entire claim operation runs within a PostgreSQL transaction (`BEGIN` ... `COMMIT`/`ROLLBACK`), ensuring atomicity.

2. **Row-Level Locking**: The method first executes `SELECT ... FOR UPDATE` which:
   - Locks the specific enquiry row exclusively
   - Prevents other transactions from reading or modifying it until the lock is released
   - Blocks concurrent claim attempts at the database level

3. **State Check**: After acquiring the lock, the code checks if `claimed_by IS NULL`, ensuring the enquiry is still unclaimed.

4. **Atomic Update**: The UPDATE statement uses a conditional WHERE clause:
   ```sql
   UPDATE enquiries 
   SET claimed_by = $1, is_public = FALSE, updated_at = CURRENT_TIMESTAMP
   WHERE id = $2 AND claimed_by IS NULL
   ```
   This ensures the update only succeeds if the enquiry is still unclaimed at the exact moment of update.

5. **Verification**: The UPDATE returns the number of affected rows. If zero rows are updated (meaning another transaction claimed it between the SELECT and UPDATE), the transaction is rolled back.

6. **Error Handling**: If the enquiry is already claimed, the transaction is rolled back and a 409 Conflict error is returned.

### Why This Works

- **Isolation Level**: PostgreSQL's default isolation level (READ COMMITTED) combined with `FOR UPDATE` ensures that once a row is locked, no other transaction can modify it until the lock is released.
- **Atomicity**: The transaction ensures all-or-nothing execution - either the entire claim succeeds, or it's completely rolled back.
- **Double-Check**: Even if somehow two transactions both pass the initial check, the `WHERE claimed_by IS NULL` condition in the UPDATE ensures only one can succeed.

### Example Scenario

If User A and User B both attempt to claim Enquiry #5 simultaneously:

1. User A's transaction begins, acquires the row lock with `SELECT ... FOR UPDATE`
2. User B's transaction attempts to acquire the same lock but is blocked, waiting for User A
3. User A checks `claimed_by IS NULL` → true, updates the row, commits
4. User B's transaction now acquires the lock, checks `claimed_by IS NULL` → false (already set by User A)
5. User B's transaction rolls back and returns 409 Conflict

This ensures data integrity and prevents duplicate claims, even under high concurrency.

## Error Handling

The API returns consistent error responses:

- **400 Bad Request**: Invalid input data or validation errors
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Authenticated but insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource conflict (e.g., already claimed, duplicate email)
- **500 Internal Server Error**: Server errors

Example error response:
```json
{
  "success": false,
  "error": "Conflict",
  "message": "This enquiry has already been claimed"
}
```

## Project Structure

```
crm-back/
├── config/
│   └── database.js          # Database connection and schema initialization
├── controllers/
│   ├── authController.js    # Authentication logic
│   └── enquiryController.js # Enquiry management logic
├── middleware/
│   ├── auth.js              # JWT authentication middleware
│   └── errorHandler.js      # Global error handling
├── models/
│   ├── User.js              # User model
│   └── Enquiry.js           # Enquiry model
├── routes/
│   ├── auth.js              # Authentication routes
│   └── enquiries.js         # Enquiry routes
├── seeds/
│   └── seed.js              # Database seeding script
├── utils/
│   └── validators.js        # Input validation rules
├── .env.example             # Environment variables template
├── .gitignore
├── package.json
├── README.md
└── server.js                # Application entry point
```

## Testing

### Running Edge Case Tests

Comprehensive edge case tests are available in `tests/test-edge-cases.js`. These test all error scenarios, validation, race conditions, and edge cases.

**Prerequisites:**
- PostgreSQL must be running
- Server must be running on port 3000

**Quick Setup (with Docker):**
```bash
# Start PostgreSQL
docker-compose up -d

# Start server (in one terminal)
npm start

# Run tests (in another terminal)
npm test
```

**Manual Setup:**
1. Ensure PostgreSQL is running and database exists
2. Start server: `npm start`
3. Run tests: `npm test`

See `tests/README.md` for detailed test coverage and troubleshooting.

### Manual Testing

After seeding the database, you can test the API using:

1. Register/login to get a JWT token
2. Use the token to access protected endpoints
3. Create enquiries via the public endpoint
4. Claim enquiries and verify they no longer appear in unclaimed results

## License

ISC

## Support

For issues or questions, please open an issue in the repository.
