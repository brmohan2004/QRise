
import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { config } from 'dotenv';

config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL!);

async function main() {
  const migrationPath = path.join(process.cwd(), 'supabase/migrations/0000_consolidate_billing_usage_v2.sql');
  const content = fs.readFileSync(migrationPath, 'utf8');
  
  const statements = content.split('--> statement-breakpoint');
  
  console.log(`Found ${statements.length} statements to execute.`);
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i].trim();
    if (!stmt) continue;
    
    try {
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      await sql.unsafe(stmt);
      console.log(`Successfully executed statement ${i + 1}.`);
    } catch (err: any) {
      if (err.message.includes('already exists')) {
        console.warn(`Statement ${i + 1} skipped: Table/Index already exists.`);
      } else if (err.message.includes('relation') && err.message.includes('does not exist')) {
        console.warn(`Statement ${i + 1} skipped: Dependent relation does not exist yet.`);
      } else {
        console.error(`Error executing statement ${i + 1}:`, err.message);
      }
    }
  }
  
  console.log('Migration process completed.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
