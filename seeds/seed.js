const bcrypt = require('bcryptjs');
const { pool, initDatabase } = require('../config/database');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    console.log('Initializing database...');
    await initDatabase();

    const client = await pool.connect();
    
    try {
      // Clear existing data
      await client.query('DELETE FROM enquiries');
      await client.query('DELETE FROM users');

      // Create sample users
      const hashedPassword1 = await bcrypt.hash('password123', 10);
      const hashedPassword2 = await bcrypt.hash('password123', 10);

      const user1 = await client.query(
        `INSERT INTO users (name, email, password, created_at, updated_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id, name, email`,
        ['John Counselor', 'john@example.com', hashedPassword1]
      );

      const user2 = await client.query(
        `INSERT INTO users (name, email, password, created_at, updated_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id, name, email`,
        ['Jane Advisor', 'jane@example.com', hashedPassword2]
      );

      console.log('Created users:', {
        user1: { id: user1.rows[0].id, email: user1.rows[0].email },
        user2: { id: user2.rows[0].id, email: user2.rows[0].email }
      });

      // Create sample enquiries (leads)
      const enquiries = [
        {
          name: 'Alice Student',
          email: 'alice@student.com',
          courseInterest: 'JavaScript Bootcamp',
          message: 'I am interested in learning JavaScript. When does the next course start?'
        },
        {
          name: 'Bob Learner',
          email: 'bob@learner.com',
          courseInterest: 'Python Fundamentals',
          message: 'Looking for a beginner-friendly Python course.'
        },
        {
          name: 'Charlie Developer',
          email: 'charlie@dev.com',
          courseInterest: 'React Advanced',
          message: null
        },
        {
          name: 'Diana Coder',
          email: 'diana@coder.com',
          courseInterest: 'Node.js Backend',
          message: 'Want to build REST APIs with Node.js'
        },
        {
          name: 'Eve Programmer',
          email: 'eve@programmer.com',
          courseInterest: 'Full Stack Development',
          message: 'Interested in full stack course with MERN stack.'
        }
      ];

      for (const enquiry of enquiries) {
        await client.query(
          `INSERT INTO enquiries (name, email, course_interest, message, is_public, created_at, updated_at)
           VALUES ($1, $2, $3, $4, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
           RETURNING id`,
          [enquiry.name, enquiry.email, enquiry.courseInterest, enquiry.message]
        );
      }

      // Claim one enquiry as an example
      const firstEnquiry = await client.query(
        'SELECT id FROM enquiries WHERE email = $1',
        ['alice@student.com']
      );
      
      if (firstEnquiry.rows.length > 0) {
        await client.query(
          `UPDATE enquiries 
           SET claimed_by = $1, is_public = FALSE, updated_at = CURRENT_TIMESTAMP
           WHERE id = $2`,
          [user1.rows[0].id, firstEnquiry.rows[0].id]
        );
        console.log(`Claimed enquiry ${firstEnquiry.rows[0].id} for user ${user1.rows[0].id}`);
      }

      console.log(`\n✓ Seeded ${enquiries.length} enquiries`);
      console.log('\nSample login credentials:');
      console.log('User 1: john@example.com / password123');
      console.log('User 2: jane@example.com / password123');
      console.log('\n✓ Database seeding completed successfully!');

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
};

seedDatabase();
