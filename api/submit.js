import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { fullName, age, testScore } = req.body;

  // Validate the inputs on the server
  if (!fullName || typeof fullName !== 'string' || fullName.length > 50) {
    return res.status(400).json({ error: 'Invalid Full Name' });
  }

  const ageVal = parseInt(age, 10);
  if (isNaN(ageVal) || ageVal < 0 || ageVal > 150) {
    return res.status(400).json({ error: 'Invalid Age' });
  }

  const scoreVal = parseInt(testScore, 10);
  if (isNaN(scoreVal) || scoreVal < 0 || scoreVal > 99) {
    return res.status(400).json({ error: 'Invalid Test Score' });
  }

  try {
    // 1. Ensure the table exists automatically so you don't have to create it manually in the dashboard!
    await sql`
      CREATE TABLE IF NOT EXISTS diet_requisitions (
          id SERIAL PRIMARY KEY,
          full_name VARCHAR(50) NOT NULL,
          age INT NOT NULL,
          test_score INT NOT NULL CHECK (test_score >= 0 AND test_score <= 99)
      );
    `;

    // 2. Insert into Vercel Postgres
    await sql`
      INSERT INTO diet_requisitions (full_name, age, test_score)
      VALUES (${fullName}, ${ageVal}, ${scoreVal})
    `;
    
    return res.status(200).json({ message: 'Success' });
  } catch (error) {
    console.error('Database Error:', error);
    // Send the exact error message to the frontend so we know what's wrong!
    return res.status(500).json({ error: error.message || 'Failed to insert data into database' });
  }
}
