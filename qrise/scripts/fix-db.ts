import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not set in .env.local');
  process.exit(1);
}

const sql = postgres(connectionString);

async function main() {
  try {
    console.log('🛠️ Adding missing "secret" column to webhooks table...');
    await sql`ALTER TABLE webhooks ADD COLUMN IF NOT EXISTS secret TEXT;`;
    console.log('✅ Column added successfully (or already existed).');
    
    // Also check for other missing columns while we are at it
    console.log('🛠️ Adding missing "filter_config" column to webhooks table...');
    await sql`ALTER TABLE webhooks ADD COLUMN IF NOT EXISTS filter_config JSONB;`;
    
    console.log('🛠️ Adding missing "signature" column to webhook_deliveries table...');
    await sql`ALTER TABLE webhook_deliveries ADD COLUMN IF NOT EXISTS signature VARCHAR(200);`;
    
  } catch (err) {
    console.error('❌ Error fixing DB:', err);
  } finally {
    await sql.end();
  }
}

main();
