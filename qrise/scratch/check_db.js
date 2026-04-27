const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);

async function check() {
  try {
    console.log('Checking bulk_jobs table structure...');
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'bulk_jobs';
    `;
    console.log('Columns:', columns);

    console.log('Checking foreign keys for bulk_jobs...');
    const fks = await sql`
      SELECT
          tc.table_name, 
          kcu.column_name, 
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name 
      FROM 
          information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='bulk_jobs';
    `;
    console.log('Foreign Keys:', fks);
  } catch (err) {
    console.error('Check failed:', err);
  } finally {
    await sql.end();
  }
}

check();
