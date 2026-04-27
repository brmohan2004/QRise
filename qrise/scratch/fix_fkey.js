const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);

async function fix() {
  try {
    console.log('Adding foreign key to bulk_jobs...');
    await sql`
      ALTER TABLE bulk_jobs 
      ADD CONSTRAINT bulk_jobs_user_id_fkey 
      FOREIGN KEY (user_id) 
      REFERENCES users(id) 
      ON DELETE CASCADE;
    `;
    console.log('Success!');
  } catch (err) {
    console.error('Fix failed:', err);
  } finally {
    await sql.end();
  }
}

fix();
