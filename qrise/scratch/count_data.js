const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);

async function count() {
  try {
    const qrCount = await sql`SELECT count(*) FROM qr_codes`;
    const bulkCount = await sql`SELECT count(*) FROM bulk_jobs`;
    const latestQRs = await sql`SELECT id, name, bulk_job_id, created_at FROM qr_codes ORDER BY created_at DESC LIMIT 5`;
    
    console.log('QR Count:', qrCount[0].count);
    console.log('Bulk Job Count:', bulkCount[0].count);
    console.log('Latest QRs:', latestQRs);
  } catch (err) {
    console.error('Count failed:', err);
  } finally {
    await sql.end();
  }
}

count();
