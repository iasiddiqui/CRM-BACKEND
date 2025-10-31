# 🚀 CRM Backend API

A production-ready REST API backend for managing **student enquiries** in a CRM system. Built using **Node.js**, **Express**, and **PostgreSQL**, it provides secure authentication, enquiry management, and race-condition-safe lead claiming.

---

## 🧩 Features

- 🔐 **JWT Authentication** for user login and registration  
- 🧾 **Public Enquiry Form** (no authentication required)  
- 👥 **Lead Claiming System** to manage unassigned enquiries  
- ⚙️ **Race Condition Prevention** using PostgreSQL transactions  
- 🧰 **Express Validator** for input validation  
- 🧨 **Error Handling Middleware** with proper HTTP status codes  
- 🔄 **Pagination** support for large data sets  
- 🌍 **CORS** support for frontend integration  

---

## 🧠 Tech Stack

| Category | Tools |
|-----------|--------|
| Backend Framework | Express.js |
| Language | Node.js |
| Database | PostgreSQL |
| Authentication | JWT |
| Validation | express-validator |
| Password Hashing | bcryptjs |
| Dev Tools | nodemon, dotenv |

---

## ⚙️ Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/iasiddiqui/CRM-BACKEND.git
cd CRM-BACKEND
npm install

```

### 2.Configure Environment Variables
```bash
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=crm_db
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d

CORS_ORIGIN=http://localhost:3000

```


### 3. Create PostgreSQL Database
```bash
CREATE DATABASE crm_db;

```
### 4. (Optional) Seed the Database
```bash
npm run seed

```
### 5. Start the Server
```bash
npm run dev     # Development mode
# or
npm start       # Production mode

Server runs at:
👉 http://localhost:3000

```

🔗 API Endpoints
🔐 Authentication
Method	Endpoint	Description
POST	/api/auth/register	Register a new user
POST	/api/auth/login	Login and receive JWT token
🧾 Enquiries
Method	Endpoint	Description
POST	/api/enquiries/public	Create a public enquiry (no auth)
GET	/api/enquiries/unclaimed	Get all unclaimed enquiries
POST	/api/enquiries/:id/claim	Claim an enquiry
GET	/api/enquiries/mine	Get enquiries claimed by the logged-in user
📘 Example Request

Create a Public Enquiry

POST /api/enquiries/public
Content-Type: application/json

{
  "name": "Alice Student",
  "email": "alice@example.com",
  "courseInterest": "React Development",
  "message": "Interested in frontend bootcamp"
}


Response

{
  "success": true,
  "data": {
    "id": 1,
    "name": "Alice Student",
    "email": "alice@example.com",
    "courseInterest": "React Development",
    "message": "Interested in frontend bootcamp",
    "createdAt": "2025-11-01T00:00:00.000Z"
  }
}

🧱 Project Structure
crm-back/
├── config/
│   └── database.js           # Database connection
├── controllers/
│   ├── authController.js     # Register/Login logic
│   └── enquiryController.js  # Enquiry management
├── middleware/
│   ├── auth.js               # JWT verification
│   └── errorHandler.js       # Global error handler
├── models/
│   ├── User.js               # User model
│   └── Enquiry.js            # Enquiry model
├── routes/
│   ├── auth.js               # Auth routes
│   └── enquiries.js          # Enquiry routes
├── seeds/
│   └── seed.js               # Seed data
├── utils/
│   └── validators.js         # Validation helpers
├── server.js                 # Entry point
└── package.json

🧪 Testing with Postman

Register or login to get a JWT token

Set the token in Postman under Authorization → Bearer Token

Test the following endpoints:

POST /api/enquiries/public

GET /api/enquiries/unclaimed

POST /api/enquiries/:id/claim

GET /api/enquiries/mine

🔒 Race Condition Prevention

Uses PostgreSQL transactions with SELECT ... FOR UPDATE

Locks the enquiry row before claiming

Ensures only one user can claim a lead at a time

Returns 409 Conflict if the enquiry is already claimed

⚠️ Error Handling
Code	Meaning	Example
400	Bad Request	Invalid input
401	Unauthorized	Missing or invalid token
404	Not Found	Resource doesn’t exist
409	Conflict	Lead already claimed
500	Internal Server Error	Unexpected issue
🧑‍💻 Author

Ishan Ahmad Siddiqui
GitHub Profile

📄 License

This project is licensed under the MIT License.


---

✅ Just copy this entire block and paste it into your project root as `README.md` — GitHub will automatically render it beautifully.

Would you like me to add **badges** (Node.js, PostgreSQL, License, PRs welcome) at the top 