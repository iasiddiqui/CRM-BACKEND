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

