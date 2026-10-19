import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

async function main() {
  const columns = await sql`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = 'qr_codes';
  `;
  console.log('Columns in qr_codes table:');
  for (const c of columns) {
    console.log(`- ${c.column_name}: ${c.data_type} (nullable: ${c.is_nullable}) default: ${c.column_default}`);
  }

  const sample = await sql`SELECT * FROM qr_codes LIMIT 2;`;
  console.log('\nSample rows:', sample);
  await sql.end();
}

main().catch(console.error);
