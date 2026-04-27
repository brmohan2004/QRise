const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);

async function check() {
  try {
    const data = await sql`SELECT id, name, status, is_active FROM qr_codes LIMIT 5`;
    console.log('Data:', data);
  } catch (err) {
    console.error('Check failed:', err);
  } finally {
    await sql.end();
  }
}

check();
