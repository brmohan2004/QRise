import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const sql = postgres(process.env.DATABASE_URL, {
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `;
    
    console.log('Fetching counts...');
    const results = [];
    
    for (const t of tables) {
      const [{ count }] = await sql`SELECT count(*)::int FROM ${sql(t.table_name)}`;
      results.push({ table: t.table_name, count });
    }
    
    console.log(JSON.stringify(results, null, 2));
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

main();
