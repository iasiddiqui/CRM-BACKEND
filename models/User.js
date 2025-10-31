const { pool } = require('../config/database');

class User {
  static async create({ name, email, password }) {
    const result = await pool.query(
      `INSERT INTO users (name, email, password, created_at, updated_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id, name, email, created_at, updated_at`,
      [name, email, password]
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT id, name, email, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async exists(email) {
    const result = await pool.query(
      'SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)',
      [email]
    );
    return result.rows[0].exists;
  }
}

module.exports = User;
