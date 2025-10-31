const { pool } = require('../config/database');

class Enquiry {
  static async create({ name, email, courseInterest, message = null }) {
    const result = await pool.query(
      `INSERT INTO enquiries (name, email, course_interest, message, is_public, created_at, updated_at)
       VALUES ($1, $2, $3, $4, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [name, email, courseInterest, message]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT * FROM enquiries WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async findUnclaimed(limit = 50, offset = 0) {
    const result = await pool.query(
      `SELECT * FROM enquiries 
       WHERE (claimed_by IS NULL AND is_public = TRUE)
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }

  static async countUnclaimed() {
    const result = await pool.query(
      `SELECT COUNT(*) as count FROM enquiries 
       WHERE (claimed_by IS NULL AND is_public = TRUE)`
    );
    return parseInt(result.rows[0].count);
  }

  static async findByClaimedBy(userId, limit = 50, offset = 0) {
    const result = await pool.query(
      `SELECT * FROM enquiries 
       WHERE claimed_by = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  }

  static async countByClaimedBy(userId) {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM enquiries WHERE claimed_by = $1',
      [userId]
    );
    return parseInt(result.rows[0].count);
  }

  // Atomic claim operation to prevent race conditions
  static async claimById(enquiryId, userId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // First, check if enquiry exists and is unclaimed (with row-level lock)
      const checkResult = await client.query(
        `SELECT id, claimed_by, is_public FROM enquiries 
         WHERE id = $1 FOR UPDATE`,
        [enquiryId]
      );

      if (checkResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return { success: false, error: 'NOT_FOUND' };
      }

      const enquiry = checkResult.rows[0];

      if (enquiry.claimed_by !== null) {
        await client.query('ROLLBACK');
        return { success: false, error: 'ALREADY_CLAIMED', enquiry };
      }

      // Atomic update: only update if claimed_by is still null
      const updateResult = await client.query(
        `UPDATE enquiries 
         SET claimed_by = $1, is_public = FALSE, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND claimed_by IS NULL
         RETURNING *`,
        [userId, enquiryId]
      );

      if (updateResult.rows.length === 0) {
        // Someone else claimed it between the check and update
        await client.query('ROLLBACK');
        return { success: false, error: 'ALREADY_CLAIMED' };
      }

      await client.query('COMMIT');
      return { success: true, enquiry: updateResult.rows[0] };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = Enquiry;
