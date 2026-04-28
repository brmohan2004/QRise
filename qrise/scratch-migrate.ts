import { db } from './lib/db';
import { sql } from 'drizzle-orm';

async function migrate() {
  try {
    console.log('Adding user_email column to platform_feedback...');
    await db.execute(sql`ALTER TABLE platform_feedback ADD COLUMN IF NOT EXISTS user_email VARCHAR(255);`);
    console.log('Done!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

migrate();
