const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'crm_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Initialize database schema
const initDatabase = async () => {
  const client = await pool.connect();
  try {
    // Create Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Enquiries table
    await client.query(`
      CREATE TABLE IF NOT EXISTS enquiries (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        course_interest VARCHAR(255) NOT NULL,
        message TEXT,
        claimed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        is_public BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better query performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_enquiries_claimed_by ON enquiries(claimed_by);
      CREATE INDEX IF NOT EXISTS idx_enquiries_is_public ON enquiries(is_public);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);

    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = { pool, initDatabase };
