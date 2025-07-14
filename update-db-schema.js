import pg from 'pg';
const { Pool } = pg;

async function main() {
  // Create a connection pool
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Checking if is_active column exists in users table...');
    
    // Check if the column already exists
    const checkResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'is_active'
    `);
    
    if (checkResult.rows.length === 0) {
      console.log('is_active column does not exist. Adding it...');
      
      // Add is_active column with default value of true
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE
      `);
      
      console.log('Successfully added is_active column to users table.');
    } else {
      console.log('is_active column already exists in users table.');
    }
    
    console.log('Database schema update complete!');
  } catch (error) {
    console.error('Error updating database schema:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();