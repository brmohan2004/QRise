const postgres = require('postgres');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

if (!process.env.DATABASE_URL) {
  console.error('Error: DATABASE_URL not found in .env.local');
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL, {
  ssl: { rejectUnauthorized: false } // Required for Supabase in many environments
});

async function main() {
  console.log('Connecting to database...');
  try {
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name ASC
    `;
    
    console.log('\n========================================');
    console.log(`📊 DATABASE AUDIT: PUBLIC SCHEMA`);
    console.log(`Total Base Tables: ${tables.length}`);
    console.log('========================================');
    
    tables.forEach((t, i) => {
      const index = (i + 1).toString().padStart(2, ' ');
      console.log(`${index}. ${t.table_name}`);
    });
    
    console.log('========================================\n');
    
  } catch (err) {
    console.error('❌ Database Error:', err.message);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

main();
