const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);

async function migrate() {
  try {
    console.log('Adding status and deleted_at columns to qr_codes...');
    await sql`
      ALTER TABLE qr_codes 
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active',
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
    `;
    console.log('Success!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await sql.end();
  }
}

migrate();
