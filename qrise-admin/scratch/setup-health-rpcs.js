const postgres = require('postgres');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const sql = postgres(process.env.DATABASE_URL, {
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    console.log('Creating RPC: get_db_size...');
    await sql`
      CREATE OR REPLACE FUNCTION get_db_size()
      RETURNS TEXT AS $$
      BEGIN
        RETURN pg_size_pretty(pg_database_size(current_database()));
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;

    console.log('Creating RPC: get_active_connections...');
    await sql`
      CREATE OR REPLACE FUNCTION get_active_connections()
      RETURNS INT AS $$
      BEGIN
        RETURN (SELECT count(*) FROM pg_stat_activity WHERE datname = current_database());
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;

    console.log('✅ RPCs created successfully');
    
  } catch (err) {
    console.error('❌ Migration Error:', err.message);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

main();
